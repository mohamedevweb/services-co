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

export default message;