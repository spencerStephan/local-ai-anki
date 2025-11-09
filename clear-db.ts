import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './src/lib/server/db/schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!process.env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');

const client = createClient({
	url: process.env.DATABASE_URL,
	authToken: process.env.DATABASE_AUTH_TOKEN
});

export const db = drizzle(client, { schema });

async function clearDb() {
	await db.delete(schema.card).execute();
	await db.delete(schema.note).execute();
	await db.delete(schema.review).execute();
	await db.delete(schema.score).execute();
	console.log('Database cleared');
}

clearDb();
