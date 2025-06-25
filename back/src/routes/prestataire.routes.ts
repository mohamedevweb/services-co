import {Hono} from 'hono';
import {PrestataireService} from '../services/prestataire.service.js';
import type {CreatePrestataireDto} from "../dto/createPrestataireDto.js";

const prestataire = new Hono();
const prestataireService = new PrestataireService();

prestataire.post("/", async (c) => {
    const body = await c.req.json() as CreatePrestataireDto;

    //TODO: Récupérer l'id de l'utilisateur connecté depuis le token JWT

    try {
        const prestataireId: number = await prestataireService.createPrestataire(body);
        return c.json({success: true, id: prestataireId}, 201);
    } catch (err) {
        console.error('Erreur création prestataire :', err);
        return c.json({success: false, message: 'Erreur serveur.'}, 500);
    }
});

export default prestataire;