import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import ENV from '@/config/env';

const pool = mysql.createPool({
    host: 'localhost',
    uri: ENV.DATABASE_URL,
});

export const db = drizzle({ client: pool });
