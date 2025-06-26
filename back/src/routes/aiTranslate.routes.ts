import {Hono} from "hono";
import {AITranslateService} from "../services/aiTranslate.service.js";
import {CreateAITranslateDto} from "../dto/aiTranslate.dto.js";
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

const aiTranslate = new Hono();

// Appliquer le middleware d'authentification à toutes les routes
// aiTranslateRoutes.use("*", guard); // Temporairement commenté pour les tests

// Créer une traduction
aiTranslate.post("/", async (c) => {
    try {
        const contentType = c.req.header('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            // Utilisation du parsing natif de Hono
            const formData = await c.req.formData();
            const file = formData.get('file');
            const targetLanguage = formData.get('targetLanguage');
            const organizationId = formData.get('organizationId');
            if (!file || typeof file === 'string') {
                return c.json({error: 'Aucun fichier PDF reçu.'}, 400);
            }
            // file est un Blob
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdfParse(buffer);
            const pages = data.text.split(/\f/).map((pageText, i) => ({
                pageNumber: i + 1,
                width: 595,
                height: 842,
                textBlocks: [
                    {
                        id: `${i + 1}-1`,
                        text: pageText.trim(),
                        x: 0,
                        y: 0,
                        fontSize: 12,
                        fontName: 'Unknown'
                    }
                ]
            }));
            const content = {pages};
            // Si targetLanguage fourni, on traduit directement
            if (targetLanguage && organizationId) {
                const aiTranslateService = new AITranslateService();
                const translationId = await aiTranslateService.createTranslation({
                    content: JSON.stringify(content),
                    targetLanguage: String(targetLanguage),
                    organizationId: Number(organizationId)
                });
                return c.json({
                    success: true,
                    data: {id: translationId},
                    message: "AI translation created successfully"
                }, 201);
            }
            // Sinon, on retourne juste le JSON DocumentContent
            return c.json({
                success: true,
                content,
                numPages: pages.length
            });
        }
        // Sinon, JSON classique (traduction)
        const body = await c.req.json() as CreateAITranslateDto;

        // Validation des champs requis
        if (!body.content || !body.targetLanguage || !body.organizationId) {
            return c.json({
                error: "Missing required fields: content, targetLanguage, organizationId are required"
            }, 400);
        }

        // Validation du JSON
        try {
            JSON.parse(body.content);
        } catch (error) {
            return c.json({
                error: "Invalid JSON in content field"
            }, 400);
        }

        console.log(`Creating AI translation for organization ${body.organizationId} to ${body.targetLanguage}...`);

        const aiTranslateService = new AITranslateService();
        const translationId = await aiTranslateService.createTranslation(body);

        return c.json({
            success: true,
            data: {id: translationId},
            message: "AI translation created successfully"
        }, 201);

    } catch (error) {
        console.error("Error creating AI translation:", error);

        return c.json({
            error: "Failed to create AI translation",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Récupérer toutes les traductions d'une organisation
aiTranslate.get("/organization/:organizationId", async (c) => {
    try {
        const organizationId = parseInt(c.req.param("organizationId"));

        if (isNaN(organizationId)) {
            return c.json({error: "Invalid organization ID"}, 400);
        }

        console.log(`Fetching AI translations for organization ${organizationId}...`);

        const aiTranslateService = new AITranslateService();
        const translations = await aiTranslateService.getTranslationsByOrganizationId(organizationId);

        return c.json({
            success: true,
            data: translations,
            message: "AI translations retrieved successfully"
        });

    } catch (error) {
        console.error("Error fetching AI translations:", error);

        return c.json({
            error: "Failed to fetch AI translations",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

export default aiTranslate;
