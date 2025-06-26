import { ChatOpenAI } from "@langchain/openai";
import { createProjectAISchema, type ProjectAIResponse } from "../dto/projectAI.dto.js";
import { db, dbPg } from "../index.js";
import { prestataire, project, path, pathPrestataire } from "../db/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if API key is present
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Error: OpenAI API key is not defined in .env file");
    console.error("Create a .env file with: OPENAI_API_KEY=your_api_key");
    process.exit(1);
}

export class ProjectAIService {
    static async getAllPrestataires() {
        const prestataires = await db
            .select({
                id: prestataire.id,
                firstName: prestataire.firstName,
                name: prestataire.name,
                job: prestataire.job,
                description: prestataire.description,
                experienceTime: prestataire.experienceTime,
                city: prestataire.city,
                tjm: prestataire.tjm
            })
            .from(prestataire);

        return prestataires;
    }

    static async extractProjectData(prompt: string, organizationId: number): Promise<ProjectAIResponse> {
        try {
            console.log("Analyzing project prompt with OpenAI...");

            // Récupérer tous les prestataires disponibles
            const prestataires = await this.getAllPrestataires();
            
            if (prestataires.length === 0) {
                throw new Error("Aucun prestataire disponible en base de données");
            }

            // Créer le schéma dynamique avec les IDs valides
            const prestataireIds = prestataires.map(p => p.id);
            const dynamicSchema = createProjectAISchema(prestataireIds);

            // Créer le modèle avec le schéma dynamique
            const model = new ChatOpenAI({
                model: "gpt-3.5-turbo",
                temperature: 0,
                apiKey: process.env.OPENAI_API_KEY
            });

            const structuredLlm = model.withStructuredOutput(dynamicSchema, {
                name: "project_extractor",
                includeRaw: false
            });

            const prestatairesInfo = prestataires.map(p => 
                `ID: ${p.id}, Nom: ${p.firstName} ${p.name}, Métier: ${p.job}, Expérience: ${p.experienceTime} ans, Ville: ${p.city}, TJM: ${p.tjm}€, Description: ${p.description}`
            ).join('\n');

            const detailedPrompt = `Analysez la description suivante d'un projet et créez une structure complète avec 3 paths de développement, chacun contenant 3 tâches.

            Instructions détaillées:
            - "project.title": Créez un titre court et descriptif pour le projet
            - "project.description": Créez une description détaillée du projet basée sur le prompt
            - "paths": Créez exactement 3 paths de développement (numérotés 1, 2, 3)
            - Chaque path doit contenir exactement 3 tâches
            - Pour chaque tâche, choisissez le prestataire le plus approprié parmi la liste fournie
            - "prestataireId": Utilisez UNIQUEMENT les IDs de prestataires de la liste fournie (IDs valides: ${prestataireIds.join(', ')})
            - "nbDays": Estimez le nombre de jours nécessaires pour chaque tâche
            - "confidence_score": Évaluez votre confiance dans l'extraction (0-1)
            - "extraction_notes": Expliquez votre raisonnement et les choix faits

            IMPORTANT: 
            - Utilisez UNIQUEMENT les IDs de prestataires de la liste fournie: ${prestataireIds.join(', ')}
            - Chaque projet a exactement 3 paths
            - Chaque path a exactement 3 tâches
            - Les tâches doivent être logiques et progressives
            - Choisissez les prestataires selon leur métier et expérience

            Prestataires disponibles:
            ${prestatairesInfo}

            Description du projet:
            ${prompt}`;

            const result = await structuredLlm.invoke(detailedPrompt);
            return result;
        } catch (error) {
            console.error("Error during AI project extraction:", error);
            throw new Error(`AI project extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async createProjectWithAI(prompt: string, organizationId: number): Promise<{ projectId: number; paths: any[] }> {
        return await dbPg.transaction(async (tx) => {
            // Extraire les données du projet avec l'IA
            const aiData = await this.extractProjectData(prompt, organizationId);

            // Créer le projet
            const [createdProject] = await tx
                .insert(project)
                .values({
                    title: aiData.project.title,
                    description: aiData.project.description,
                    organizationId: organizationId
                })
                .returning({ id: project.id });

            const projectId = createdProject.id;

            // Créer les paths et les tâches
            const createdPaths = [];
            for (const pathData of aiData.paths) {
                // Créer le path
                const [createdPath] = await tx
                    .insert(path)
                    .values({
                        isChoose: false,
                        number: pathData.number,
                        projectId: projectId
                    })
                    .returning({ id: path.id });

                // Créer les tâches (path_prestataire)
                for (const task of pathData.tasks) {
                    await tx.insert(pathPrestataire).values({
                        prestataireId: task.prestataireId,
                        pathId: createdPath.id,
                        isApproved: false,
                        nbDays: task.nbDays,
                        name: task.name
                    });
                }

                createdPaths.push({
                    pathId: createdPath.id,
                    number: pathData.number,
                    tasks: pathData.tasks
                });
            }

            return {
                projectId: projectId,
                paths: createdPaths
            };
        });
    }
} 