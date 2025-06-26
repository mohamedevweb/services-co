import { ChatOpenAI } from "@langchain/openai";
import { db, dbPg } from '../index.js';
import { aiTranslate } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { CreateAITranslateDto, AITranslateResponseDto, DocumentContent, TextBlock } from "../dto/aiTranslate.dto.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if API key is present
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Error: OpenAI API key is not defined in .env file");
    console.error("Create a .env file with: OPENAI_API_KEY=your_api_key");
    process.exit(1);
}

const model = new ChatOpenAI({
    model: "gpt-4.1-mini",
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY
});

export class AITranslateService {
    private async translateText(text: string, targetLanguage: string): Promise<string> {
        try {
            const prompt = `Tu es une IA spécialisée en traduction vers le ${targetLanguage}. 
            
            Traduis le texte suivant en ${targetLanguage}. 
            Garde le même style et ton que l'original.
            Si le texte contient des termes techniques, utilise la terminologie appropriée en ${targetLanguage}.
            IMPORTANT: Ne mets PAS de guillemets autour de ta réponse.
            
            Texte à traduire: "${text}"
            
            Traduction:`;

            const response = await model.invoke(prompt);
            let translatedText = response.content as string;

            console.log(`➡️ Traduction du texte: "${translatedText}"`);
            
            // Nettoyer les guillemets superflus que l'IA pourrait ajouter
            translatedText = translatedText.trim();
            if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
                translatedText = translatedText.slice(1, -1);
            }
            if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
                translatedText = translatedText.slice(1, -1);
            }
            
            return translatedText;
        } catch (error) {
            console.error(`Error translating text: "${text}"`, error);
            // En cas d'erreur, retourner le texte original
            return text;
        }
    }

    private async translateDocumentContent(content: DocumentContent, targetLanguage: string): Promise<DocumentContent> {
        const translatedContent: DocumentContent = {
            pages: []
        };

        for (let i = 0; i < content.pages.length; i++) {
            const page = content.pages[i];
            console.log(`➡️ Traduction de la page ${i + 1}/${content.pages.length}...`);

            // Fusionner tous les blocs de texte de la page
            const fullText = page.textBlocks.map(tb => tb.text).join('\n\n');

            // Couper intelligemment si le texte est trop long
            const maxLength = 4000;
            const chunks = this.splitText(fullText, maxLength);

            // Traduire chaque chunk en parallèle
            const translations = await Promise.all(
                chunks.map(chunk => this.translateText(chunk, targetLanguage))
            );

            const fullTranslated = translations.join('\n\n');

            // Redécouper la traduction dans les mêmes blocs (approximation simple)
            const approxBlockLength = Math.floor(fullTranslated.length / page.textBlocks.length);
            let cursor = 0;

            const translatedTextBlocks: TextBlock[] = page.textBlocks.map((block, index) => {
                const slice = fullTranslated.slice(cursor, cursor + approxBlockLength).trim();
                cursor += approxBlockLength;
                return {
                    ...block,
                    text: slice
                };
            });

            translatedContent.pages.push({
                ...page,
                textBlocks: translatedTextBlocks
            });

            console.log(`✅ Page ${i + 1} traduite (${chunks.length} appel(s) IA).`);
        }

        return translatedContent;
    }

    private splitText(text: string, maxLength: number): string[] {
        const parts: string[] = [];
        let remaining = text;

        while (remaining.length > maxLength) {
            const sliceIndex = remaining.lastIndexOf('.', maxLength);
            const cutIndex = sliceIndex > 0 ? sliceIndex + 1 : maxLength;
            parts.push(remaining.slice(0, cutIndex).trim());
            remaining = remaining.slice(cutIndex).trim();
        }

        if (remaining.length > 0) parts.push(remaining);

        return parts;
    }

    async createTranslation(dto: CreateAITranslateDto): Promise<number> {
        return await dbPg.transaction(async (tx) => {
            try {
                // Parser le JSON original
                const originalContent: DocumentContent = JSON.parse(dto.content);
                
                console.log(`Starting translation to ${dto.targetLanguage}...`);
                console.log(`Found ${originalContent.pages.length} pages with ${originalContent.pages.reduce((acc, page) => acc + page.textBlocks.length, 0)} text blocks`);

                // Traduire le contenu
                const translatedContent = await this.translateDocumentContent(originalContent, dto.targetLanguage);
                
                // Stringifier le contenu traduit
                const translatedContentString = JSON.stringify(translatedContent);

                console.log(`Attempting to insert into database...`);
                console.log(`Organization ID: ${dto.organizationId}`);
                console.log(`Content length: ${dto.content.length}`);
                console.log(`Translated content length: ${translatedContentString.length}`);

                // Sauvegarder en base
                const [created] = await tx
                    .insert(aiTranslate)
                    .values({
                        content: dto.content, // JSON original
                        contentTranslate: translatedContentString, // JSON traduit
                        organizationId: dto.organizationId
                    })
                    .returning({ id: aiTranslate.id });

                console.log(`Translation completed successfully. ID: ${created.id}`);
                return created.id;

            } catch (error) {
                console.error("Error in translation process:", error);
                console.error("Error details:", {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    dto: {
                        organizationId: dto.organizationId,
                        targetLanguage: dto.targetLanguage,
                        contentLength: dto.content.length
                    }
                });
                throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }

    async getTranslationsByOrganizationId(organizationId: number): Promise<AITranslateResponseDto[]> {
        const rows = await db
            .select({
                id: aiTranslate.id,
                content: aiTranslate.content,
                contentTranslate: aiTranslate.contentTranslate,
                organizationId: aiTranslate.organizationId
            })
            .from(aiTranslate)
            .where(eq(aiTranslate.organizationId, organizationId));

        return rows.map(row => ({
            id: row.id,
            content: row.content || '',
            contentTranslate: row.contentTranslate || '',
            organizationId: row.organizationId
        }));
    }
} 