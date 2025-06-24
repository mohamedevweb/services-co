import {dbPg} from '../index.js';
import type {CreatePrestataireDto} from "../dto/createPrestataireDto.js";
import {diploma, experience, languages, prestataire, skill, users} from "../db/schema.js";
import {eq} from "drizzle-orm";

export class PrestataireService {
    async createPrestataire(dto: CreatePrestataireDto) {
        return await dbPg.transaction(async (tx) => {
            const [created] = await tx
                .insert(prestataire)
                .values({
                    firstName: dto.first_name,
                    name: dto.name,
                    job: dto.job,
                    description: dto.description,
                    experienceTime: dto.experience_time,
                    studyLevel: dto.study_level,
                    city: dto.city,
                    tjm: dto.tjm,
                    userId: dto.id_users,
                })
                .returning({id: prestataire.id});

            const prestataireId = created.id;

            if (dto.skills?.length) {
                await tx.insert(skill).values(
                    dto.skills.map((s) => ({
                        description: s.description,
                        prestataireId,
                    }))
                );
            }

            if (dto.diplomas?.length) {
                await tx.insert(diploma).values(
                    dto.diplomas.map((d) => ({
                        description: d.description,
                        prestataireId,
                    }))
                );
            }

            if (dto.experiences?.length) {
                await tx.insert(experience).values(
                    dto.experiences.map((e) => ({
                        description: e.description,
                        prestataireId,
                    }))
                );
            }

            if (dto.languages?.length) {
                await tx.insert(languages).values(
                    dto.languages.map((l) => ({
                        description: l.description,
                        prestataireId,
                    }))
                );
            }

            await tx.update(users)
                .set({role: 'PRESTA'})
                .where(eq(users.id, prestataire.userId));

            return prestataireId;
        });
    }
}