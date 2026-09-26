import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { Logs, Quarantine } from '../schema';
import db from '../drizzle';

export default {
    getData: async (year, month, day) => {
        try {
            const monthStart = new Date(year, month - 1, 1);
            const nextMonthStart = new Date(year, month, 1);

            const targetDay = day ?? new Date().getDate();
            const dayStart = new Date(year, month - 1, targetDay);
            const nextDayStart = new Date(year, month - 1, targetDay + 1);

            const days = await db
                .selectDistinct({
                    day: sql`DAY(${Logs.createdAt})`,
                })
                .from(Logs)
                .where(
                    and(
                        gte(Logs.createdAt, monthStart),
                        lt(Logs.createdAt, nextMonthStart),
                    )
                )
                .orderBy(desc(sql`DAY(${Logs.createdAt})`));

            const logs = await db
                .select({
                    quarantineId: Quarantine.publicId,
                    sender: Logs.sender,
                    message: Logs.message,
                    status: Logs.status,
                    reason: Logs.reason,
                    score: Logs.score,
                    createdAt: Logs.createdAt,
                })
                .from(Logs)
                .leftJoin(Quarantine, eq(Logs.quarantineId, Quarantine.id))
                .where(
                    and(
                        gte(Logs.createdAt, dayStart),
                        lt(Logs.createdAt, nextDayStart),
                    )
                )
                .orderBy(desc(Logs.createdAt));

            const availableDays = days.map(({ day }) => Number(day));
            const today = new Date();

            if (
                year === today.getFullYear() &&
                month === today.getMonth() + 1 &&
                !availableDays.includes(today.getDate())
            ) {
                availableDays.unshift(today.getDate());
            }

            return {
                days: availableDays,
                logs,
            };
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getSummary: async (timeWindow) => {
        try {
            const [statusRows, reasonRows] = await Promise.all([
                db
                    .select({
                        status: Logs.status,
                        count: sql`COUNT(*)`,
                    })
                    .from(Logs)
                    .where(gte(Logs.createdAt, timeWindow))
                    .groupBy(Logs.status),

                db
                    .select({
                        reason: Logs.reason,
                        count: sql`COUNT(*)`,
                    })
                    .from(Logs)
                    .where(gte(Logs.createdAt, timeWindow))
                    .groupBy(Logs.reason),
            ]);

            return {
                status: Object.fromEntries(
                    statusRows.map((row) => [
                        row.status,
                        Number(row.count),
                    ])
                ),

                reason: Object.fromEntries(
                    reasonRows
                        .filter((row) => row.reason !== null)
                        .map((row) => [
                            row.reason,
                            Number(row.count),
                        ])
                ),
            };
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getByTime: async (timeWindow, limit) => {
        try {
            let query = db
                .select({
                    id: Quarantine.publicId,
                    subject: Quarantine.subject,
                    sender: Logs.sender,
                    status: Logs.status,
                    reason: Logs.reason,
                    score: Logs.score,
                    createdAt: Logs.createdAt,
                })
                .from(Logs)
                .leftJoin(Quarantine, eq(Logs.quarantineId, Quarantine.id))
                .where(gte(Logs.createdAt, timeWindow))
                .orderBy(asc(Logs.createdAt));

            if (limit) query = query.limit(limit);
            const result = await query;

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    getBySender: async (sender) => {
        try {
            const logs = await db
                .select({
                    sender: Logs.sender,
                    status: Logs.status,
                    reason: Logs.reason,
                    score: Logs.score,
                })
                .from(Logs)
                .where(eq(Logs.sender, sender));

            const result = {
                sender,
                status: {},
                reason: {},
                averageScore: null,
            };

            let totalScore = 0;
            let scoreCount = 0;

            for (const log of logs) {
                if (log.status) {
                    result.status[log.status] ??= 0;
                    result.status[log.status]++;
                }

                if (log.reason) {
                    result.reason[log.reason] ??= 0;
                    result.reason[log.reason]++;
                }

                if (log.score !== null && log.score !== undefined) {
                    totalScore += log.score;
                    scoreCount++;
                }
            }

            if (scoreCount > 0)
                result.averageScore = totalScore / scoreCount;

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    createData: async (data) => {
        try {
            const result = await db
                .insert(Logs)
                .values({
                    sender: data.sender,
                    recipient: data.recipient,
                    message: data.message,
                    status: data.status,
                    reason: data.reason,
                    score: data.score,
                });

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when creating data!');
        }
    },
}
