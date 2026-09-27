import { and, count, eq, like, desc, or, gte, isNull, sql } from 'drizzle-orm';
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
                .innerJoin(Logs, eq(Quarantine.id, Logs.quarantineId))
                .where(
                    and(
                        isNull(Quarantine.deletedAt),
                        or(
                            like(Quarantine.subject, search),
                            like(Logs.sender, search),
                        )
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
    getAllData: async (offset = 0, limit = 10) => {
        try {
            const [result, totalResult] = await Promise.all([
                db
                    .select({
                        id: Quarantine.publicId,
                        subject: Quarantine.subject,
                        sender: Logs.sender,
                        reason: Logs.reason,
                        score: Logs.score,
                        createdAt: Logs.createdAt,
                    })
                    .from(Quarantine)
                    .innerJoin(Logs, eq(Quarantine.id, Logs.quarantineId))
                    .where(isNull(Quarantine.deletedAt))
                    .orderBy(desc(Logs.createdAt))
                    .limit(limit)
                    .offset(offset),
                db
                    .select({ count: count() })
                    .from(Quarantine)
                    .innerJoin(Logs, eq(Quarantine.id, Logs.quarantineId))
                    .where(isNull(Quarantine.deletedAt)),
            ]);

            const totalItems = totalResult[0]?.count ?? 0;
            const totalPages = Math.ceil(totalItems / limit);

            return {
                contents: result,
                totalPages,
            };
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
                    message: Logs.message,
                    status: Logs.status,
                    reason: Logs.reason,
                    score: Logs.score,
                    createdAt: Logs.createdAt,
                })
                .from(Quarantine)
                .innerJoin(Logs, eq(Quarantine.id, Logs.quarantineId))
                .where(
                    and(
                        eq(Quarantine.publicId, id),
                        isNull(Quarantine.deletedAt)
                    )
                );

            return result[0] ?? null;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getTotalItem: async () => {
        try {
            const [{ count }] = await db
                .select({
                    count: sql`count(*)`,
                })
                .from(Quarantine)
                .where(isNull(Quarantine.deletedAt));

            return Number(count);
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getByTime: async (timeWindow) => {
        try {
            const result = await db
                .select({
                    id: Quarantine.publicId,
                    subject: Quarantine.subject,
                    sender: Logs.sender,
                    reason: Logs.reason,
                    score: Logs.score,
                    receivedAt: Logs.createdAt,
                })
                .from(Quarantine)
                .innerJoin(
                    Logs,
                    eq(Logs.quarantineId, Quarantine.id)
                )
                .where(
                    and(
                        isNull(Quarantine.deletedAt),
                        gte(Logs.createdAt, timeWindow)
                    )
                )
                .orderBy(desc(Logs.createdAt));

            return result;
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
            const result = await db
                .update(Quarantine)
                .set({
                    deletedAt: new Date(),
                })
                .where(eq(Quarantine.publicId, id));

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when deleting data!');
        }
    },
}
