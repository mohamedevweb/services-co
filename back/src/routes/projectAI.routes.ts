import { Hono } from "hono";
import { ProjectAIService } from "../services/projectAI.service.js";
import { ProjectAIRequestDto } from "../dto/projectAI.dto.js";
import { guard } from "../middleware/auth.middleware.js";

const projectAIRouter = new Hono();

// Middleware d'authentification pour toutes les routes
projectAIRouter.use("*", guard);

// Route POST pour créer un projet avec l'IA
projectAIRouter.post("/create", async (c) => {
    try {
        const body = await c.req.json();
        
        // Validation basique du body
        if (!body.prompt || typeof body.prompt !== 'string') {
            return c.json({ 
                success: false, 
                error: "Le prompt est requis et doit être une chaîne de caractères" 
            }, 400);
        }

        if (!body.organizationId || typeof body.organizationId !== 'number') {
            return c.json({ 
                success: false, 
                error: "L'ID de l'organisation est requis et doit être un nombre" 
            }, 400);
        }

        const dto: ProjectAIRequestDto = {
            prompt: body.prompt,
            organizationId: body.organizationId
        };

        // Créer le projet avec l'IA
        const result = await ProjectAIService.createProjectWithAI(dto.prompt, dto.organizationId);

        return c.json({
            success: true,
            message: "Projet créé avec succès",
            data: {
                projectId: result.projectId,
                paths: result.paths
            }
        }, 201);

    } catch (error) {
        console.error("Error creating project with AI:", error);
        
        if (error instanceof Error) {
            if (error.message.includes("Aucun prestataire disponible")) {
                return c.json({ 
                    success: false, 
                    error: "Impossible de créer le projet: aucun prestataire disponible en base de données" 
                }, 400);
            }
            
            if (error.message.includes("AI project extraction failed")) {
                return c.json({ 
                    success: false, 
                    error: "Erreur lors de l'analyse du projet par l'IA. Veuillez reformuler votre demande." 
                }, 500);
            }
        }

        return c.json({ 
            success: false, 
            error: "Erreur interne du serveur" 
        }, 500);
    }
});

// Route GET pour récupérer tous les prestataires (pour debug/info)
projectAIRouter.get("/prestataires", async (c) => {
    try {
        const prestataires = await ProjectAIService.getAllPrestataires();
        
        return c.json({
            success: true,
            data: prestataires
        });

    } catch (error) {
        console.error("Error fetching prestataires:", error);
        return c.json({ 
            success: false, 
            error: "Erreur lors de la récupération des prestataires" 
        }, 500);
    }
});

export default projectAIRouter; 