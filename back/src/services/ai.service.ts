import { ChatOpenAI } from "@langchain/openai";
import { PrestaAISchema, type PrestaAIResponse } from "../dto/prestaAI.dto.js";
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

const structuredLlm = model.withStructuredOutput(PrestaAISchema, {
    name: "prestataire_extractor",
    includeRaw: false
});

export class AIService {
    static async extractPrestataireData(prompt: string): Promise<PrestaAIResponse> {
        try {
            console.log("Analyzing prompt with OpenAI...");

            const detailedPrompt = `Analysez la description suivante d'un prestataire et extrayez toutes les informations demandées pour créer un profil complet.

            Instructions détaillées:
            - "first_name" et "name": Extrayez le prénom et nom de famille
            - "job": Identifiez le métier principal (ex: développeur, designer, consultant, etc.)
            - "description": Créez une description détaillée du profil basée sur les informations fournies
            - "experience_time": Calculez le nombre total d'années d'expérience professionnelle
            - "study_level": Identifiez le niveau d'études (ex: Bac+3, Master, Doctorat, etc.)
            - "city": Identifiez la ville où le prestataire est basé
            - "tjm": Estimez le taux journalier moyen en euros (si non mentionné, utilisez une estimation basée sur l'expérience et le métier)
            - "skills": Extrayez toutes les compétences techniques et professionnelles mentionnées
            - "diplomas": Listez tous les diplômes et formations obtenues
            - "experiences": Listez toutes les expériences professionnelles avec poste, entreprise et période
            - "languages": Listez toutes les langues parlées avec niveau de maîtrise
            - "confidence_score": Évaluez votre confiance dans l'extraction (0-1)
            - "extraction_notes": Expliquez votre raisonnement et les estimations faites

            IMPORTANT: 
            - Si une information n'est pas claire ou manquante, faites une estimation raisonnable
            - Pour le TJM, utilisez des références de marché selon l'expérience et le métier
            - Pour l'expérience, additionnez toutes les années d'expérience mentionnées
            - Soyez précis dans l'extraction des compétences et expériences

            Description du prestataire:
            ${prompt}`;

            const result = await structuredLlm.invoke(detailedPrompt);
            return result;
        } catch (error) {
            console.error("Error during AI extraction:", error);
            throw new Error(`AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 