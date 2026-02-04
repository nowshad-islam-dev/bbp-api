import { seed } from 'drizzle-seed';
import { db } from '../src/db';
import * as schema from '../src/db/schema';

async function main() {
    await seed(db, { tags: schema.tags }).refine((f) => ({
        tags: {
            count: 3,
            columns: {
                name: f.valuesFromArray({
                    values: ['all', 'politics', 'election'],
                }),
            },
        },
    }));
}

main()
    .then(() => console.log('DB seeded for production'))
    .catch((err) => {
        console.error('Error seeding DB for production');
        console.log(err);
    })
    .finally(() => process.exit(1));
