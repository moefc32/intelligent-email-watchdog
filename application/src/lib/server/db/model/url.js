import { eq, like, desc, sql } from 'drizzle-orm';
import { Urls, Histories } from '../schema';
import db from '../drizzle';

export default {
    searchData: async (keyword, limit = 10, offset = 0) => {
        try {
            const search = `%${keyword}%`;

            const result = await db
                .select({
                    id: Urls.id,
                    shortUrl: Urls.shortUrl,
                    longUrl: Urls.longUrl,
                    clicks: sql`COUNT(${Histories.urlId})`,
                    timestamp: Urls.timestamp,
                })
                .from(Urls)
                .leftJoin(Histories, eq(Urls.id, Histories.urlId))
                .where(
                    sql`LOWER(${Urls.shortUrl}) LIKE LOWER(${search})
                        OR LOWER(${Urls.longUrl}) LIKE LOWER(${search})`
                )
                .groupBy(
                    Urls.id,
                    Urls.shortUrl,
                    Urls.longUrl,
                    Urls.timestamp
                )
                .orderBy(desc(sql`COALESCE(${Histories.timestamp}, 0)`))
                .limit(limit)
                .offset(offset);

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    validateShortUrl: async (shortUrl) => {
        if (!shortUrl) return [];

        try {
            const result = await db
                .select({ shortUrl: Urls.shortUrl })
                .from(Urls)
                .where(eq(Urls.shortUrl, shortUrl))
                .limit(1);

            return result;
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    getLongURL: async (data) => {
        try {
            const timestamp = new Date();

            const result = await db
                .select({
                    id: Urls.id,
                    longUrl: Urls.longUrl,
                })
                .from(Urls)
                .where(eq(Urls.shortUrl, data.shortUrl));

            if (result?.length) {
                await db.insert(Histories).values({
                    urlId: result[0].id,
                    ref: data.ref,
                    agent: data.agent,
                    timestamp,
                });
            }

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getData: async (shortUrl, limit = 10, offset = 0) => {
        try {
            const result = shortUrl
                ? await db
                    .select({
                        id: Urls.id,
                        shortUrl: Urls.shortUrl,
                        longUrl: Urls.longUrl,
                        clicks: sql`COUNT(${Histories.urlId}) OVER()`,
                        timestamp: Urls.timestamp,
                        ref: Histories.ref,
                        agent: Histories.agent,
                        history_timestamp: Histories.timestamp,
                    })
                    .from(Urls)
                    .leftJoin(Histories, eq(Urls.id, Histories.urlId))
                    .where(eq(Urls.shortUrl, shortUrl))
                    .orderBy(desc(sql`COALESCE(${Histories.timestamp}, 0)`))
                    .limit(limit)
                    .offset(offset)
                : await db
                    .select({
                        urls: sql`COUNT(${Urls.id}) OVER()`,
                        id: Urls.id,
                        shortUrl: Urls.shortUrl,
                        longUrl: Urls.longUrl,
                        clicks: sql`COUNT(${Histories.urlId})`,
                        timestamp: Urls.timestamp,
                    })
                    .from(Urls)
                    .leftJoin(Histories, eq(Urls.id, Histories.urlId))
                    .groupBy(
                        Urls.id,
                        Urls.shortUrl,
                        Urls.longUrl,
                        Urls.timestamp
                    )
                    .orderBy(desc(Urls.timestamp))
                    .limit(limit)
                    .offset(offset);

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    createData: async (data) => {
        try {
            const timestamp = new Date();

            const [result] = await db.insert(Urls)
                .values({
                    shortUrl: data.shortUrl,
                    longUrl: data.longUrl,
                    timestamp,
                }).returning();

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when creating data!');
        }
    },
    editData: async (data, id) => {
        try {
            const [result] = await db.update(Urls)
                .set({
                    shortUrl: data.shortUrl ?? undefined,
                    longUrl: data.longUrl ?? undefined,
                })
                .where(eq(Urls.id, id))
                .returning();

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when updating data!');
        }
    },
    deleteData: async (id) => {
        try {
            const result = await db.delete(Urls)
                .where(eq(Urls.id, id));

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when deleting data!');
        }
    },
}
