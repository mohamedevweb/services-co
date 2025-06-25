import {db, dbPg} from '../index.js';
import type {CreatePrestataireDto} from "../dto/createPrestataireDto.js";
import {diploma, experience, languages, prestataire, skill, users} from "../db/schema.js";
import {eq, getTableColumns} from "drizzle-orm";
import type {UpdatePrestataireDto} from "../dto/UpdatePrestataireDto.js";

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
                .where(eq(users.id, dto.id_users));

            return prestataireId;
        });
    }

    async updatePrestataire(prestataireId: number, dto: UpdatePrestataireDto) {
        return await dbPg.transaction(async (tx) => {
            const updates: any = {};
            if (dto.first_name) updates.firstName = dto.first_name;
            if (dto.name) updates.name = dto.name;
            if (dto.job) updates.job = dto.job;
            if (dto.description) updates.description = dto.description;
            if (dto.experience_time !== undefined) updates.experienceTime = dto.experience_time;
            if (dto.study_level) updates.studyLevel = dto.study_level;
            if (dto.city) updates.city = dto.city;
            if (dto.tjm !== undefined) updates.tjm = dto.tjm;

            if (Object.keys(updates).length > 0) {
                await tx.update(prestataire)
                    .set(updates)
                    .where(eq(prestataire.id, prestataireId));
            }

            if (Array.isArray(dto.skills)) {
                await tx.delete(skill).where(eq(skill.prestataireId, prestataireId));
                await tx.insert(skill).values(dto.skills.map(s => ({
                    description: s.description,
                    prestataireId
                })));
            }

            if (Array.isArray(dto.diplomas)) {
                await tx.delete(diploma).where(eq(diploma.prestataireId, prestataireId));
                await tx.insert(diploma).values(dto.diplomas.map(d => ({
                    description: d.description,
                    prestataireId
                })));
            }

            if (Array.isArray(dto.experiences)) {
                await tx.delete(experience).where(eq(experience.prestataireId, prestataireId));
                await tx.insert(experience).values(dto.experiences.map(e => ({
                    description: e.description,
                    prestataireId
                })));
            }

            if (Array.isArray(dto.languages)) {
                await tx.delete(languages).where(eq(languages.prestataireId, prestataireId));
                await tx.insert(languages).values(dto.languages.map(l => ({
                    description: l.description,
                    prestataireId
                })));
            }

            return true;
        });
    }

    async getPrestataireById(id: number) {
        const {password, ...usersCols} = getTableColumns(users);

        const row = await db
            .select({
                prestataire,
                users: usersCols
            })
            .from(prestataire)
            .leftJoin(users, eq(users.id, prestataire.userId))
            .where(eq(prestataire.userId, id))
            .limit(1);

        return row[0];
    }
}