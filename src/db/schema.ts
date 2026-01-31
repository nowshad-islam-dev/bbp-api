import { sql } from 'drizzle-orm';
import { mysqlTable as table } from 'drizzle-orm/mysql-core';
import * as t from 'drizzle-orm/mysql-core';

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
        emailVerified: t.boolean('email_verified').default(false),
        emailVerifiedAt: t.timestamp('email_verified_at'),
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

export const tags = table('tags', {
    id: t.int().primaryKey().autoincrement(),
    name: t.varchar({ length: 50 }).notNull().unique(),
});

export const newsToTags = table(
    'news_to_tags',
    {
        newsId: t
            .int()
            .notNull()
            .references(() => news.id, { onDelete: 'cascade' }),
        tagId: t
            .int()
            .notNull()
            .references(() => tags.id, { onDelete: 'cascade' }),
    },
    (table) => [t.primaryKey({ columns: [table.newsId, table.tagId] })],
);

export const comments = table(
    'comments',
    {
        id: t.int().primaryKey().autoincrement(),
        newsId: t
            .int()
            .notNull()
            .references(() => news.id, { onDelete: 'cascade' }),
        userId: t
            .int()
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        content: t.text().notNull(),
        createdAt: timestamps().createdAt,
        updatedAt: timestamps().updatedAt,
    },
    (_table) => [
        t.uniqueIndex('idx_comments_news_id').on(news.id),
        t.uniqueIndex('idx_comments_user_id').on(users.id),
    ],
);

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
