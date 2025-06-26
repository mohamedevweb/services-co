import { db, dbPg } from "../index.js";
import { project, path, pathPrestataire, prestataire, organization, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export class ProjectService {
    // Récupérer toutes les infos d'un projet par son ID
    static async getProjectById(projectId: number) {
        try {
            // Récupérer le projet avec l'organisation
            const projectData = await db
                .select({
                    project: {
                        id: project.id,
                        title: project.title,
                        description: project.description,
                        organizationId: project.organizationId
                    },
                    organization: {
                        id: organization.id,
                        name: organization.name,
                        adresse: organization.adresse,
                        tel: organization.tel
                    }
                })
                .from(project)
                .leftJoin(organization, eq(organization.id, project.organizationId))
                .where(eq(project.id, projectId))
                .limit(1);

            if (projectData.length === 0) {
                throw new Error("Projet non trouvé");
            }

            // Récupérer les paths avec leurs tâches
            const pathsData = await db
                .select({
                    path: {
                        id: path.id,
                        number: path.number,
                        isChoose: path.isChoose,
                        projectId: path.projectId
                    },
                    tasks: pathPrestataire
                })
                .from(path)
                .leftJoin(pathPrestataire, eq(pathPrestataire.pathId, path.id))
                .where(eq(path.projectId, projectId))
                .orderBy(path.number);

            // Organiser les données
            const paths = [];
            const pathMap = new Map();

            for (const row of pathsData) {
                if (!pathMap.has(row.path.id)) {
                    pathMap.set(row.path.id, {
                        ...row.path,
                        tasks: []
                    });
                    paths.push(pathMap.get(row.path.id));
                }

                if (row.tasks) {
                    pathMap.get(row.path.id).tasks.push(row.tasks);
                }
            }

            return {
                ...projectData[0],
                paths: paths
            };

        } catch (error) {
            console.error("Error fetching project by ID:", error);
            throw error;
        }
    }

    // Récupérer tous les projets d'une organisation
    static async getProjectsByOrganizationId(organizationId: number) {
        try {
            const projects = await db
                .select({
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    organizationId: project.organizationId
                })
                .from(project)
                .where(eq(project.organizationId, organizationId))
                .orderBy(project.id);

            return projects;

        } catch (error) {
            console.error("Error fetching projects by organization ID:", error);
            throw error;
        }
    }

    // Récupérer tous les projets contenant un prestataire spécifique
    static async getProjectsByPrestataireId(prestataireId: number) {
        try {
            const projects = await db
                .select({
                    project: {
                        id: project.id,
                        title: project.title,
                        description: project.description,
                        organizationId: project.organizationId
                    },
                    organization: {
                        id: organization.id,
                        name: organization.name
                    },
                    path: {
                        id: path.id,
                        number: path.number,
                        isChoose: path.isChoose
                    },
                    task: {
                        name: pathPrestataire.name,
                        nbDays: pathPrestataire.nbDays,
                        isApproved: pathPrestataire.isApproved
                    }
                })
                .from(pathPrestataire)
                .leftJoin(path, eq(path.id, pathPrestataire.pathId))
                .leftJoin(project, eq(project.id, path.projectId))
                .leftJoin(organization, eq(organization.id, project.organizationId))
                .where(eq(pathPrestataire.prestataireId, prestataireId))
                .orderBy(project.id, path.number);

            // Organiser les données par projet
            const projectMap = new Map();

            for (const row of projects) {
                // Vérifier que les données ne sont pas null
                if (!row.project || !row.path || !row.organization) {
                    continue;
                }

                if (!projectMap.has(row.project.id)) {
                    projectMap.set(row.project.id, {
                        ...row.project,
                        organization: row.organization,
                        paths: []
                    });
                }

                const projectData = projectMap.get(row.project.id);
                let pathData = projectData.paths.find((p: any) => p.id === row.path!.id);

                if (!pathData) {
                    pathData = {
                        ...row.path!,
                        tasks: []
                    };
                    projectData.paths.push(pathData);
                }

                pathData.tasks.push(row.task);
            }

            return Array.from(projectMap.values());

        } catch (error) {
            console.error("Error fetching projects by prestataire ID:", error);
            throw error;
        }
    }

    // Mettre à jour isChoose à true pour un path
    static async setPathIsChoose(pathId: number, isChoose: boolean = true) {
        try {
            const result = await dbPg
                .update(path)
                .set({ isChoose })
                .where(eq(path.id, pathId))
                .returning({ id: path.id, isChoose: path.isChoose });

            if (result.length === 0) {
                throw new Error("Path non trouvé");
            }

            return result[0];

        } catch (error) {
            console.error("Error updating path isChoose:", error);
            throw error;
        }
    }

    // Mettre à jour isApproved à true pour une tâche path_prestataire
    static async setPathPrestataireIsApproved(pathId: number, prestataireId: number, isApproved: boolean = true) {
        try {
            const result = await dbPg
                .update(pathPrestataire)
                .set({ isApproved })
                .where(and(
                    eq(pathPrestataire.pathId, pathId),
                    eq(pathPrestataire.prestataireId, prestataireId)
                ))
                .returning({ 
                    pathId: pathPrestataire.pathId, 
                    prestataireId: pathPrestataire.prestataireId, 
                    isApproved: pathPrestataire.isApproved 
                });

            if (result.length === 0) {
                throw new Error("Tâche path_prestataire non trouvée");
            }

            return result[0];

        } catch (error) {
            console.error("Error updating path_prestataire isApproved:", error);
            throw error;
        }
    }
} 