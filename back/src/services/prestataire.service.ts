import {db, dbPg} from '../index.js';
import type {CreatePrestataireDto} from "../dto/createPrestataireDto.js";
import {diploma, experience, languages, prestataire, skill, users} from "../db/schema.js";
import {eq, getTableColumns} from "drizzle-orm";
import { sign } from 'hono/jwt';

export class PrestataireService {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private readonly JWT_EXPIRES_IN = 60 * 60 * 24; // 24 hours in seconds

    private async generateJWT(userId: number, role: string): Promise<string> {
        const payload = {
            id: userId.toString(),
            role: role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.JWT_EXPIRES_IN,
        };

        return await sign(payload, this.JWT_SECRET);
    }

    async createPrestataire(dto: CreatePrestataireDto): Promise<{ id: number; token: string }> {
        return await dbPg.transaction(async (tx) => {
            const [created] = await tx
                .insert(prestataire)
                .values({
                    firstName: dto.first_name,
                    name: dto.name,
                    job: dto.job as any,
                    description: dto.description,
                    experienceTime: dto.experience_time,
                    studyLevel: dto.study_level,
                    city: dto.city,
                    tjm: dto.tjm.toString(),
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

            // Générer un nouveau JWT avec le nouveau rôle
            const newToken = await this.generateJWT(dto.id_users, 'PRESTA');

            return {
                id: prestataireId,
                token: newToken
            };
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