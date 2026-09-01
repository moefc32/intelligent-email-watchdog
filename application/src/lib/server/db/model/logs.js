import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
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
    createData: async (data) => {
        try {
            const result = await tx
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
