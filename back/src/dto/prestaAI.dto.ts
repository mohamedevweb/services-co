import { z } from "zod";

export const PrestaAISchema = z.object({
    first_name: z.string().describe("Le prénom du prestataire"),
    name: z.string().describe("Le nom de famille du prestataire"),
    job: z.string().describe("Le métier/poste du prestataire"),
    description: z.string().describe("Une description détaillée du profil et des compétences du prestataire"),
    experience_time: z.number().describe("Le nombre d'années d'expérience professionnelle"),
    study_level: z.string().describe("Le niveau d'études (ex: Bac+3, Master, Doctorat, etc.)"),
    city: z.string().describe("La ville où le prestataire est basé"),
    tjm: z.number().describe("Le taux journalier moyen en euros"),
    skills: z.array(z.object({
        description: z.string()
    })).describe("Liste des compétences techniques et professionnelles"),
    diplomas: z.array(z.object({
        description: z.string()
    })).describe("Liste des diplômes et formations obtenues"),
    experiences: z.array(z.object({
        description: z.string()
    })).describe("Liste des expériences professionnelles avec poste, entreprise et période"),
    languages: z.array(z.object({
        description: z.string()
    })).describe("Liste des langues parlées avec niveau de maîtrise"),
    confidence_score: z.number().min(0).max(1).describe("Score de confiance de l'extraction (0-1)"),
    extraction_notes: z.string().describe("Notes et explications sur l'extraction des données")
});

export type PrestaAIResponse = z.infer<typeof PrestaAISchema>;

export class PrestaAIRequestDto {
    prompt!: string;
} 