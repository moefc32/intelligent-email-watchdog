import { eq, or } from 'drizzle-orm';
import { Users } from '../schema';
import db from '../drizzle';

export default {
    getData: async (data) => {
        try {
            const query = db
                .select({
                    id: Users.id,
                    email: Users.email,
                    password: Users.password,
                })
                .from(Users);

            if (data) {
                query.where(
                    or(
                        eq(Users.id, data),
                        eq(Users.email, data)
                    )
                );
            }

            const result = await query;

            if (!data) return result.length > 0;
            return result.length ? result[0] : null;
        } catch (e) {
            console.error(e);
            throw new Error('Error when getting data!');
        }
    },
    createData: async (data) => {
        try {
            const [result] = await db.insert(Users).values({
                email: data.email,
                password: data.password,
            }).returning();

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when creating data!');
        }
    },
    editData: async (data, id) => {
        try {
            const [result] = await db.update(Users)
                .set({
                    email: data.email ?? undefined,
                    password: data.password ?? undefined,
                })
                .where(eq(Users.id, id))
                .returning();

            return result;
        } catch (e) {
            console.error(e);
            throw new Error('Error when updating data!');
        }
    },
}
