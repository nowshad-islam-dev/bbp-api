import { reset } from 'drizzle-seed';
import { db } from '../src/db';
import * as schema from '../src/db/schema';

async function main() {
    await reset(db, schema);
}

main()
    .then(() => {
        console.warn('Resetting DB');
    })
    .catch((err) => {
        console.error('Error resetting DB');
        console.log(err);
    })
    .finally(() => process.exit(1));
