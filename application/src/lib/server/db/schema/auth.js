import {
    mysqlTable,
    char,
    int,
    text,
    varchar,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export const Users = mysqlTable('Users', {
    id: int('id', { mode: 'number', unsigned: true })
        .autoincrement().primaryKey(),
    publicId: char('public_id', { length: 36 }).notNull().unique()
        .$defaultFn(() => randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
});
