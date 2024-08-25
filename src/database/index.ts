import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

export const migrationClient = postgres(process.env.DATABASE_URL as string, { max: 1 });
export const migrateDb = drizzle(migrationClient);

export const queryClient = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(queryClient);

export type dataInformation = {
    tags: string[];
    userId: number;
    username: string;
};


export const memcached = new Map<string, dataInformation>();
