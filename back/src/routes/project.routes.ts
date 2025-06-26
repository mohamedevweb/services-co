import { Hono } from "hono";
import { ProjectService } from "../services/project.service.js";
import { guard } from "../middleware/auth.middleware.js";

const projectRouter = new Hono();

// Middleware d'authentification pour toutes les routes
projectRouter.use("*", guard);

// Route GET pour récupérer un projet par son ID avec tous ses détails
projectRouter.get("/:id", async (c) => {
    try {
        const projectId = parseInt(c.req.param("id"));
        
        if (isNaN(projectId)) {
            return c.json({ 
                success: false, 
                error: "ID de projet invalide" 
            }, 400);
        }

        const projectData = await ProjectService.getProjectById(projectId);

        return c.json({
            success: true,
            data: projectData
        });

    } catch (error) {
        console.error("Error fetching project:", error);
        
        if (error instanceof Error && error.message === "Projet non trouvé") {
            return c.json({ 
                success: false, 
                error: "Projet non trouvé" 
            }, 404);
        }

        return c.json({ 
            success: false, 
            error: "Erreur interne du serveur" 
        }, 500);
    }
});

// Route GET pour récupérer tous les projets d'une organisation
projectRouter.get("/organization/:organizationId", async (c) => {
    try {
        const organizationId = parseInt(c.req.param("organizationId"));
        
        if (isNaN(organizationId)) {
            return c.json({ 
                success: false, 
                error: "ID d'organisation invalide" 
            }, 400);
        }

        const projects = await ProjectService.getProjectsByOrganizationId(organizationId);

        return c.json({
            success: true,
            data: projects
        });

    } catch (error) {
        console.error("Error fetching projects by organization:", error);
        return c.json({ 
            success: false, 
            error: "Erreur interne du serveur" 
        }, 500);
    }
});

// Route GET pour récupérer tous les projets contenant un prestataire
projectRouter.get("/prestataire/:prestataireId", async (c) => {
    try {
        const prestataireId = parseInt(c.req.param("prestataireId"));
        
        if (isNaN(prestataireId)) {
            return c.json({ 
                success: false, 
                error: "ID de prestataire invalide" 
            }, 400);
        }

        const projects = await ProjectService.getProjectsByPrestataireId(prestataireId);

        return c.json({
            success: true,
            data: projects
        });

    } catch (error) {
        console.error("Error fetching projects by prestataire:", error);
        return c.json({ 
            success: false, 
            error: "Erreur interne du serveur" 
        }, 500);
    }
});

// Route PATCH pour mettre à jour isChoose d'un path
projectRouter.patch("/path/:pathId/choose", async (c) => {
    try {
        const pathId = parseInt(c.req.param("pathId"));
        
        if (isNaN(pathId)) {
            return c.json({ 
                success: false, 
                error: "ID de path invalide" 
            }, 400);
        }

        const body = await c.req.json();
        const isChoose = body.isChoose !== undefined ? body.isChoose : true;

        const result = await ProjectService.setPathIsChoose(pathId, isChoose);

        return c.json({
            success: true,
            message: "Path mis à jour avec succès",
            data: result
        });

    } catch (error) {
        console.error("Error updating path isChoose:", error);
        
        if (error instanceof Error && error.message === "Path non trouvé") {
            return c.json({ 
                success: false, 
                error: "Path non trouvé" 
            }, 404);
        }

        return c.json({ 
            success: false, 
            error: "Erreur interne du serveur" 
        }, 500);
    }
});

// Route PATCH pour mettre à jour isApproved d'une tâche path_prestataire
projectRouter.patch("/path/:pathId/prestataire/:prestataireId/approve", async (c) => {
    try {
        const pathId = parseInt(c.req.param("pathId"));
        const prestataireId = parseInt(c.req.param("prestataireId"));
        
        if (isNaN(pathId) || isNaN(prestataireId)) {
            return c.json({ 
                success: false, 
                error: "ID de path ou prestataire invalide" 
            }, 400);
        }

        const body = await c.req.json();
        const isApproved = body.isApproved !== undefined ? body.isApproved : true;

        const result = await ProjectService.setPathPrestataireIsApproved(pathId, prestataireId, isApproved);

        return c.json({
            success: true,
            message: "Tâche approuvée avec succès",
            data: result
        });

    } catch (error) {
        console.error("Error updating path_prestataire isApproved:", error);
        
        if (error instanceof Error && error.message === "Tâche path_prestataire non trouvée") {
            return c.json({ 
                success: false, 
                error: "Tâche non trouvée" 
            }, 404);
        }

        return c.json({ 
            success: false, 
            error: "Erreur interne du serveur" 
        }, 500);
    }
});

export default projectRouter; 