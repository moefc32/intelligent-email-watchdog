import {
    mysqlTable,
    bigint,
    char,
    int,
    longtext,
    text,
    timestamp,
    varchar,
    index,
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
    deletedAt: timestamp('deleted_at', { fsp: 3, mode: 'string' }),
}, (table) => ({
    deletedAtIdx: index('deleted_at_idx').on(table.deletedAt),
}));

export const Logs = mysqlTable('Logs', {
    id: bigint('id', { mode: 'number', unsigned: true })
        .autoincrement().primaryKey(),
    quarantineId: bigint('quarantine_id', {
        mode: 'number',
        unsigned: true,
    }).unique().references(() => Quarantine.id, {
        onDelete: 'set null',
    }),
    sender: varchar('sender', { length: 255 }).notNull(),
    recipient: varchar('recipient', { length: 255 }).notNull(),
    message: text('message').notNull(),
    status: varchar('status', { length: 32 }).notNull(),
    reason: varchar('reason', { length: 64 }),
    score: int('score'),
    createdAt: timestamp('created_at', { fsp: 3, mode: 'string' })
        .notNull().defaultNow(),
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
