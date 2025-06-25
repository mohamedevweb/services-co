import type {CreateMessageDto} from "../dto/CreateMessageDto.js";
import {dbPg} from "../index.js";
import {message} from "../db/schema.js";
import {and, asc, eq} from "drizzle-orm";

export class MessageService {
    async createMessage(dto: CreateMessageDto) {
        const [created] = await dbPg
            .insert(message)
            .values({
                prestataireId: dto.id_prestataire,
                organizationId: dto.id_organization,
                content: dto.content,
                createAt: new Date(),
            })
            .returning();

        return created;
    }

    async getConversation(prestataireId: number, organizationId: number) {
        return dbPg
            .select()
            .from(message)
            .where(
                and(
                    eq(message.prestataireId, prestataireId),
                    eq(message.organizationId, organizationId)
                )
            )
            .orderBy(asc(message.createAt));
    }
}