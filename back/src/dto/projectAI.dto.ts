import { z } from "zod";

// Fonction pour créer un schéma dynamique avec les IDs de prestataires
export const createProjectAISchema = (prestataireIds: number[]) => {
    return z.object({
        project: z.object({
            title: z.string().describe("Le titre du projet"),
            description: z.string().describe("Une description détaillée du projet")
        }).describe("Informations du projet"),
        paths: z.array(z.object({
            number: z.number().describe("Le numéro du path (1, 2, ou 3)"),
            tasks: z.array(z.object({
                name: z.string().describe("Le nom de la tâche"),
                prestataireId: z.number().refine(
                    (id) => prestataireIds.includes(id),
                    { message: "ID de prestataire invalide" }
                ).describe("L'ID du prestataire choisi pour cette tâche (doit être un ID valide)"),
                nbDays: z.number().describe("Le nombre de jours estimés pour cette tâche")
            })).length(3).describe("Liste des 3 tâches du path")
        })).length(3).describe("Liste des 3 paths du projet"),
        confidence_score: z.number().min(0).max(1).describe("Score de confiance de l'extraction (0-1)"),
        extraction_notes: z.string().describe("Notes et explications sur l'extraction des données")
    });
};

// Schéma par défaut (sera remplacé dynamiquement)
export const ProjectAISchema = z.object({
    project: z.object({
        title: z.string().describe("Le titre du projet"),
        description: z.string().describe("Une description détaillée du projet")
    }).describe("Informations du projet"),
    paths: z.array(z.object({
        number: z.number().describe("Le numéro du path (1, 2, ou 3)"),
        tasks: z.array(z.object({
            name: z.string().describe("Le nom de la tâche"),
            prestataireId: z.number().describe("L'ID du prestataire choisi pour cette tâche"),
            nbDays: z.number().describe("Le nombre de jours estimés pour cette tâche")
        })).length(3).describe("Liste des 3 tâches du path")
    })).length(3).describe("Liste des 3 paths du projet"),
    confidence_score: z.number().min(0).max(1).describe("Score de confiance de l'extraction (0-1)"),
    extraction_notes: z.string().describe("Notes et explications sur l'extraction des données")
});

export type ProjectAIResponse = z.infer<typeof ProjectAISchema>;

export class ProjectAIRequestDto {
    prompt!: string;
    organizationId!: number;
} 