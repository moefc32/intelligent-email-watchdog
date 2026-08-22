import {
    mysqlTable,
    bigint,
    char,
    int,
    longtext,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export const Quarantine = mysqlTable('Quarantine', {
    id: bigint('id', { mode: 'number', unsigned: true })
        .autoincrement().primaryKey(),
    publicId: char('public_id', { length: 36 }).notNull().unique()
        .$defaultFn(() => randomUUID()),
    subject: text('subject'),
    headers: longtext('headers'),
    content: longtext('content'),
});

export const Logs = mysqlTable('Logs', {
    id: bigint('id', { mode: 'number', unsigned: true })
        .autoincrement().primaryKey(),
    quarantineId: bigint('quarantine_id', {
        mode: 'number',
        unsigned: true,
    }).unique().references(() => Quarantine.id),
    sender: varchar('sender', { length: 255 }).notNull(),
    recipient: varchar('recipient', { length: 255 }).notNull(),
    message: text('message').notNull(),
    status: varchar('status', { length: 32 }).notNull(),
    reason: varchar('reason', { length: 64 }),
    score: int('score'),
    createdAt: timestamp('created_at', { fsp: 3 }).notNull().defaultNow(),
});

export const Config = mysqlTable('Config', {
    key: varchar('key', { length: 64 }).primaryKey(),
    value: text('value').notNull(),
});

export const QuarantineRelations = relations(Quarantine, ({ one }) => ({
    Logs: one(Logs, {
        fields: [Quarantine.id],
        references: [Logs.quarantineId],
    }),
}));

export const LogsRelations = relations(Logs, ({ one }) => ({
    Quarantine: one(Quarantine, {
        fields: [Logs.quarantineId],
        references: [Quarantine.id],
    }),
}));
