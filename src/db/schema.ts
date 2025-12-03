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
        email: t.varchar('email', { length: 255 }).notNull(),
        password: t.varchar('password', { length: 255 }).notNull(),
        phone: t.varchar('phone', { length: 11 }),
        // picture: t.varchar('picture', { length: 255 }),
        role: t.mysqlEnum(['volunteer', 'user', 'admin']).default('user'),
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
