import { Hono } from "hono";
import { AIService } from "../services/ai.service.js";
import { PrestaAIRequestDto } from "../dto/prestaAI.dto.js";

const aiRoutes = new Hono();

// Route to extract prestataire data from a prompt
aiRoutes.post("/presta", async (c) => {
    try {
        const body = await c.req.json() as PrestaAIRequestDto;
        
        if (!body.prompt || typeof body.prompt !== "string") {
            return c.json({ 
                error: "Invalid request. 'prompt' field is required and must be a string." 
            }, 400);
        }

        if (body.prompt.trim().length === 0) {
            return c.json({ 
                error: "Prompt cannot be empty." 
            }, 400);
        }

        console.log("Processing AI request for prestataire extraction...");
        
        const extractedData = await AIService.extractPrestataireData(body.prompt);
        
        return c.json({
            success: true,
            data: extractedData,
            message: "Prestataire data extracted successfully"
        });

    } catch (error) {
        console.error("Error in presta AI route:", error);
        
        return c.json({
            error: "Failed to extract prestataire data",
            details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});

// Health check route for AI service
aiRoutes.get("/health", async (c) => {
    return c.json({
        status: "healthy",
        service: "AI Routes",
        timestamp: new Date().toISOString()
    });
});

export default aiRoutes; 