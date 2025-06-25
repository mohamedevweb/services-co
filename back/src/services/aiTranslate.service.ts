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
    model: "gpt-3.5-turbo",
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

        for (const page of content.pages) {
            const translatedPage = {
                ...page,
                textBlocks: [] as TextBlock[]
            };

            for (const textBlock of page.textBlocks) {
                const translatedText = await this.translateText(textBlock.text, targetLanguage);
                
                const translatedTextBlock: TextBlock = {
                    ...textBlock,
                    text: translatedText
                };

                translatedPage.textBlocks.push(translatedTextBlock);
            }

            translatedContent.pages.push(translatedPage);
        }

        return translatedContent;
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