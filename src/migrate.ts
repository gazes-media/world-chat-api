import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrateDb, migrationClient } from './database/index';

// This will run migrations on the database, skipping the ones already applied
await migrate(migrateDb, { migrationsFolder: './drizzle' });

// Don't forget to close the connection, otherwise the script will hang
await migrationClient.end();
