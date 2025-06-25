import { db, dbPg } from '../index.js';
import type { CreateOrganizationDto, UpdateOrganizationDto, OrganizationResponseDto } from "../dto/organization.dto.js";
import { organization, users } from "../db/schema.js";
import { eq, getTableColumns } from "drizzle-orm";
import { sign } from 'hono/jwt';

export class OrganizationService {
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

    async createOrganization(dto: CreateOrganizationDto, userId: number): Promise<{ id: number; token: string }> {
        return await dbPg.transaction(async (tx) => {
            // Vérifier que l'utilisateur existe et a le rôle approprié
            const user = await tx
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user.length) {
                throw new Error("User not found");
            }

            // Mettre à jour le rôle de l'utilisateur vers ORG
            await tx.update(users)
                .set({ role: 'ORG' })
                .where(eq(users.id, userId));

            // Créer l'organisation
            const [created] = await tx
                .insert(organization)
                .values({
                    name: dto.name,
                    adresse: dto.adresse,
                    solde: dto.solde.toString(),
                    tel: dto.tel,
                    userId: userId,
                })
                .returning({ id: organization.id });

            // Générer un nouveau JWT avec le nouveau rôle
            const newToken = await this.generateJWT(userId, 'ORG');

            return {
                id: created.id,
                token: newToken
            };
        });
    }

    async getOrganizationById(id: number): Promise<OrganizationResponseDto | null> {
        const { password, ...usersCols } = getTableColumns(users);

        const row = await db
            .select({
                id: organization.id,
                name: organization.name,
                adresse: organization.adresse,
                solde: organization.solde,
                tel: organization.tel,
                userId: organization.userId,
                users: usersCols
            })
            .from(organization)
            .leftJoin(users, eq(users.id, organization.userId))
            .where(eq(organization.id, id))
            .limit(1);

        if (!row[0]) return null;

        return {
            id: row[0].id,
            name: row[0].name || '',
            adresse: row[0].adresse || '',
            solde: parseFloat(row[0].solde || '0'),
            tel: row[0].tel || '',
            userId: row[0].userId,
        };
    }

    async updateOrganization(id: number, dto: UpdateOrganizationDto, userId: number): Promise<boolean> {
        return await dbPg.transaction(async (tx) => {
            // Vérifier que l'organisation existe et appartient à l'utilisateur
            const existingOrg = await tx
                .select()
                .from(organization)
                .where(eq(organization.id, id))
                .limit(1);

            if (!existingOrg.length) {
                throw new Error("Organization not found");
            }

            if (existingOrg[0].userId !== userId) {
                throw new Error("Unauthorized: You can only modify your own organization");
            }

            // Préparer les données à mettre à jour
            const updateData: any = {};
            if (dto.name !== undefined) updateData.name = dto.name;
            if (dto.adresse !== undefined) updateData.adresse = dto.adresse;
            if (dto.solde !== undefined) updateData.solde = dto.solde.toString();
            if (dto.tel !== undefined) updateData.tel = dto.tel;

            // Mettre à jour l'organisation
            await tx
                .update(organization)
                .set(updateData)
                .where(eq(organization.id, id));

            return true;
        });
    }

    async getOrganizationByUserId(userId: number): Promise<OrganizationResponseDto | null> {
        const row = await db
            .select({
                id: organization.id,
                name: organization.name,
                adresse: organization.adresse,
                solde: organization.solde,
                tel: organization.tel,
                userId: organization.userId,
            })
            .from(organization)
            .where(eq(organization.userId, userId))
            .limit(1);

        if (!row[0]) return null;

        return {
            id: row[0].id,
            name: row[0].name || '',
            adresse: row[0].adresse || '',
            solde: parseFloat(row[0].solde || '0'),
            tel: row[0].tel || '',
            userId: row[0].userId,
        };
    }
} 