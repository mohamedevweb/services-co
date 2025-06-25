import { Hono } from "hono";
import { OrganizationService } from "../services/organization.service.js";
import { CreateOrganizationDto, UpdateOrganizationDto } from "../dto/organization.dto.js";
import { guard } from "../middleware/auth.middleware.js";
import { getUserInfo } from "../utils/jwt.utils.js";

const organizationRoutes = new Hono();

// Appliquer le middleware d'authentification à toutes les routes
organizationRoutes.use("*", guard);

// Créer une organisation
organizationRoutes.post("/", async (c) => {
    try {
        const body = await c.req.json() as CreateOrganizationDto;
        
        // Validation des champs requis
        if (!body.name || !body.adresse || !body.tel) {
            return c.json({ 
                error: "Missing required fields: name, adresse, tel are required" 
            }, 400);
        }

        // Récupérer l'ID de l'utilisateur connecté depuis le token
        const authHeader = c.req.header("Authorization");
        if (!authHeader) {
            return c.json({ error: "Authorization header missing" }, 401);
        }

        const userInfo = getUserInfo(authHeader);
        const userId = parseInt(userInfo.id);

        console.log(`Creating organization for user ${userId}...`);
        
        const organizationService = new OrganizationService();
        const result = await organizationService.createOrganization(body, userId);
        
        return c.json({
            success: true,
            data: { 
                id: result.id,
                token: result.token 
            },
            message: "Organization created successfully. New JWT token provided with updated role."
        }, 201);

    } catch (error) {
        console.error("Error creating organization:", error);
        
        return c.json({
            error: "Failed to create organization",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Récupérer une organisation par ID
organizationRoutes.get("/:id", async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        
        if (isNaN(id)) {
            return c.json({ error: "Invalid organization ID" }, 400);
        }

        console.log(`Fetching organization with ID ${id}...`);
        
        const organizationService = new OrganizationService();
        const organization = await organizationService.getOrganizationById(id);
        
        if (!organization) {
            return c.json({ error: "Organization not found" }, 404);
        }

        return c.json({
            success: true,
            data: organization,
            message: "Organization retrieved successfully"
        });

    } catch (error) {
        console.error("Error fetching organization:", error);
        
        return c.json({
            error: "Failed to fetch organization",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Modifier une organisation (PATCH)
organizationRoutes.patch("/:id", async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        const body = await c.req.json() as UpdateOrganizationDto;
        
        if (isNaN(id)) {
            return c.json({ error: "Invalid organization ID" }, 400);
        }

        // Vérifier qu'au moins un champ à mettre à jour est fourni
        if (!body.name && !body.adresse && body.solde === undefined && !body.tel) {
            return c.json({ 
                error: "At least one field must be provided for update" 
            }, 400);
        }

        // Récupérer l'ID de l'utilisateur connecté depuis le token
        const authHeader = c.req.header("Authorization");
        if (!authHeader) {
            return c.json({ error: "Authorization header missing" }, 401);
        }

        const userInfo = getUserInfo(authHeader);
        const userId = parseInt(userInfo.id);

        console.log(`Updating organization ${id} for user ${userId}...`);
        
        const organizationService = new OrganizationService();
        await organizationService.updateOrganization(id, body, userId);
        
        return c.json({
            success: true,
            message: "Organization updated successfully"
        });

    } catch (error) {
        console.error("Error updating organization:", error);
        
        // Gérer les erreurs spécifiques
        if (error instanceof Error) {
            if (error.message === "Organization not found") {
                return c.json({ error: "Organization not found" }, 404);
            }
            if (error.message.includes("Unauthorized")) {
                return c.json({ error: error.message }, 403);
            }
        }
        
        return c.json({
            error: "Failed to update organization",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Récupérer l'organisation de l'utilisateur connecté
organizationRoutes.get("/me/organization", async (c) => {
    try {
        // Récupérer l'ID de l'utilisateur connecté depuis le token
        const authHeader = c.req.header("Authorization");
        if (!authHeader) {
            return c.json({ error: "Authorization header missing" }, 401);
        }

        const userInfo = getUserInfo(authHeader);
        const userId = parseInt(userInfo.id);

        console.log(`Fetching organization for user ${userId}...`);
        
        const organizationService = new OrganizationService();
        const organization = await organizationService.getOrganizationByUserId(userId);
        
        if (!organization) {
            return c.json({ error: "No organization found for this user" }, 404);
        }

        return c.json({
            success: true,
            data: organization,
            message: "Organization retrieved successfully"
        });

    } catch (error) {
        console.error("Error fetching user organization:", error);
        
        return c.json({
            error: "Failed to fetch organization",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

export default organizationRoutes; 