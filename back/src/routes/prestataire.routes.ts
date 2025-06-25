import {Hono} from 'hono';
import {PrestataireService} from '../services/prestataire.service.js';
import type {CreatePrestataireDto} from "../dto/createPrestataireDto.js";
import {guard} from "../middleware/auth.middleware.js";
import {getUserId} from "../utils/jwt.utils.js";

const prestataire = new Hono();
const prestataireService = new PrestataireService();

prestataire.post("/", guard, async (c) => {
    const token = c.req.header("Authorization");

    if (!token) return c.json("Token is missing", 401);

    const body = await c.req.json() as CreatePrestataireDto;

    const userId = getUserId(token);

    body.id_users = Number(userId);

    try {
        const prestataireId: number = await prestataireService.createPrestataire(body);
        return c.json({success: true, id: prestataireId}, 201);
    } catch (err) {
        console.error('Erreur création prestataire :', err);
        return c.json({success: false, message: 'Erreur serveur.'}, 500);
    }
});

prestataire.get("/:id", guard, async (c) => {
    const id = c.req.param('id');

    const token = c.req.header("Authorization");

    if (!token) return c.json("Token is missing", 401);

    try {
        const prestataireData = await prestataireService.getPrestataireById(Number(id));
        if (!prestataireData) {
            return c.json({success: false, message: 'Prestataire non trouvé'}, 404);
        }
        return c.json({success: true, data: prestataireData});
    } catch (err) {
        console.error('Erreur récupération prestataire :', err);
        return c.json({success: false, message: 'Erreur serveur.'}, 500);
    }
});

export default prestataire;