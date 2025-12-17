import { sql } from 'drizzle-orm';
import { mysqlTable as table } from 'drizzle-orm/mysql-core';
import * as t from 'drizzle-orm/mysql-core';
// import { AnyMySqlColumn } from 'drizzle-orm/mysql-core';

export function timestamps() {
    return {
        createdAt: t.timestamp('created_at').notNull().defaultNow(),

        updatedAt: t
            .timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => sql`now()`),
    };
}

export const users = table(
    'users',
    {
        id: t.int().primaryKey().autoincrement(),
        firstName: t.varchar('first_name', { length: 255 }).notNull(),
        lastName: t.varchar('last_name', { length: 255 }).notNull(),
        email: t.varchar({ length: 255 }).notNull(),
        password: t.varchar({ length: 255 }).notNull(),
        phone: t.varchar({ length: 11 }),
        // picture: t.varchar('picture', { length: 255 }),
        role: t
            .mysqlEnum(['volunteer', 'user', 'admin'])
            .notNull()
            .default('user'),
    },
    (table) => [
        t.uniqueIndex('email_idx').on(table.email),
        t.check(
            'phone_length_check',
            sql`(${table.phone} IS NULL OR CHAR_LENGTH(${table.phone}) = 11)`,
        ),
    ],
);

export const news = table('news', {
    id: t.int().primaryKey().autoincrement(),
    title: t.varchar({ length: 255 }).notNull(),
    text: t.text().notNull(),
    img: t.varchar({ length: 255 }),
    createdAt: timestamps().createdAt,
    updatedAt: timestamps().updatedAt,
});

export const events = table('events', {
    id: t.int().primaryKey().autoincrement(),
    title: t.varchar({ length: 255 }).notNull(),
    excerpt: t.varchar({ length: 255 }).notNull(),
    text: t.text().notNull(),
    date: t.datetime({ mode: 'date' }).notNull(),
});

export const candidates = table('candidates', {
    id: t.int().primaryKey().autoincrement(),
    name: t.varchar({ length: 255 }).notNull(),
    shortIntro: t.varchar('short_intro', { length: 255 }).notNull(),
    gender: t.mysqlEnum(['male', 'female']),
    img: t.varchar({ length: 255 }),
    vicinity: t.varchar({ length: 255 }).notNull(),
    topicsBrought: t.json('topics_brought').$type<string[]>().default([]),
});
