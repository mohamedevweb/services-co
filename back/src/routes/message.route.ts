import {Hono} from "hono";
import {MessageService} from "../services/message.service.js";
import type {CreateMessageDto} from "../dto/CreateMessageDto.js";
import {guard} from "../middleware/auth.middleware.js";

const message = new Hono();
const messageService = new MessageService();

message.post("/", guard, async (c) => {
    const token = c.req.header("Authorization");
    if (!token) return c.json({error: "Token is missing"}, 401);

    const body = await c.req.json() as CreateMessageDto;

    if (!body.content || !body.id_prestataire || !body.id_organization) {
        return c.json({error: "Missing required fields"}, 400);
    }

    try {
        const messageId = await messageService.createMessage(body);
        return c.json({success: true, id: messageId}, 201);
    } catch (err) {
        console.error("Erreur création message :", err);
        return c.json({success: false, message: "Erreur serveur."}, 500);
    }
});

message.get("/conversation", guard, async (c) => {
    const url = new URL(c.req.url);
    const prestataireId = Number(url.searchParams.get("prestataireId"));
    const organizationId = Number(url.searchParams.get("organizationId"));

    if (!prestataireId || !organizationId) {
        return c.json({ error: "Missing prestataireId or organizationId" }, 400);
    }

    try {
        const conversation = await messageService.getConversation(prestataireId, organizationId);
        return c.json({ success: true, messages: conversation });
    } catch (err) {
        console.error("Erreur récupération conversation :", err);
        return c.json({ success: false, message: "Erreur serveur." }, 500);
    }
});

message.get("/prestataire/:id", guard, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

    try {
        const messages = await messageService.getMessagesByPrestataire(id);
        return c.json({ success: true, messages });
    } catch (err) {
        console.error("Erreur récupération messages prestataire :", err);
        return c.json({ success: false, message: "Erreur serveur." }, 500);
    }
});

message.get("/organization/:id", guard, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

    try {
        const messages = await messageService.getMessagesByOrganization(id);
        return c.json({ success: true, messages });
    } catch (err) {
        console.error("Erreur récupération messages organization :", err);
        return c.json({ success: false, message: "Erreur serveur." }, 500);
    }
});


export default message;