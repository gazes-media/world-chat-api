import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
export const migrationClient = postgres(process.env.DATABASE_URL as string, { max: 1 });
export const migrateDb = drizzle(migrationClient);

export const queryClient = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(queryClient);
