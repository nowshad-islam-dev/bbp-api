import { sql } from 'drizzle-orm';
import { logger } from '@/config/logger';
import { db } from '.';
import { tags } from './schema';

export async function seedDB() {
    const defaultTags = [
        { id: 1, name: 'all' },
        { id: 2, name: 'politics' },
        { id: 3, name: 'election' },
    ];

    await db
        .insert(tags)
        .values(defaultTags)
        .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });
    logger.info('Default tags seeded');
}
