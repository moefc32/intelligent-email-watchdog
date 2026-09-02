import { eq, like, desc, or } from 'drizzle-orm';
import { Quarantine, Logs } from '../schema';
import db from '../drizzle';

export default {
    searchData: async (keyword, limit = 10, offset = 0) => {
        try {
            const search = `%${keyword}%`;

            const result = await db
                .select({
                    id: Quarantine.publicId,
                    subject: Quarantine.subject,
                    sender: Logs.sender,
                    createdAt: Logs.createdAt,
                })
                .from(Quarantine)
                .leftJoin(Logs, eq(Quarantine.id, Logs.quarantineId))
                .where(
                    or(
                        like(Quarantine.subject, search),
                        like(Logs.sender, search),
                    )
                )
                .orderBy(desc(Logs.createdAt))
                .limit(limit)
                .offset(offset);

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getAllData: async (limit = 10, offset = 0) => {
        try {
            const result = await db
                .select({
                    id: Quarantine.publicId,
                    subject: Quarantine.subject,
                    sender: Logs.sender,
                    reason: Logs.reason,
                    score: Logs.score,
                    createdAt: Logs.createdAt,
                })
                .from(Quarantine)
                .leftJoin(Logs, eq(Quarantine.id, Logs.quarantineId))
                .orderBy(desc(Logs.createdAt))
                .limit(limit)
                .offset(offset);

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getData: async (id) => {
        try {
            const result = await db
                .select({
                    id: Quarantine.publicId,
                    subject: Quarantine.subject,
                    headers: Quarantine.headers,
                    content: Quarantine.content,
                    sender: Logs.sender,
                    recipient: Logs.recipient,
                    status: Logs.status,
                    reason: Logs.reason,
                    score: Logs.score,
                    createdAt: Logs.createdAt,
                })
                .from(Quarantine)
                .leftJoin(Logs, eq(Quarantine.id, Logs.quarantineId))
                .where(eq(Quarantine.publicId, id));

            return result[0] ?? null;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    createData: async (data) => {
        try {
            return await db.transaction(async (tx) => {
                const quarantineEntry = await tx
                    .insert(Quarantine)
                    .values({
                        subject: data.subject,
                        headers: data.headers,
                        content: data.content,
                    });

                const quarantineId = quarantineEntry[0].insertId;

                const logEntry = await tx
                    .insert(Logs)
                    .values({
                        quarantineId,
                        sender: data.sender,
                        recipient: data.recipient,
                        message: data.message,
                        status: data.status,
                        reason: data.reason,
                        score: data.score,
                    });

                return {
                    quarantineId,
                    logEntry,
                };
            });
        } catch (e) {
            console.error(e);
            throw new Error('Error when creating data!');
        }
    },
    deleteData: async (id) => {
        try {
            const result = await db.delete(Quarantine)
                .where(eq(Quarantine.publicId, id));

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when deleting data!');
        }
    },
}
