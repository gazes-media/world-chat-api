import { pgEnum, pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';


export const UserStatus = pgEnum("user_status", ["active", "inactive", "deleted"]);

export const RoleStatus = pgEnum("role_status", ["admin", "user", "guest"]);

export const User = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name").unique().notNull(),
    role: RoleStatus("role").notNull().default("user"),
    googleId: varchar("google_id").unique(),
    profileUrl: text("profile_url"),
    discordId: varchar("discord_id").unique(),
    password: varchar("password").notNull(),
    status: UserStatus("status").notNull().default("active"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("timestamp").defaultNow(),
    tags: varchar("tags").array().notNull(),
    lang: varchar("lang").notNull().default("en"),
});

export type UserInsert = typeof User.$inferInsert;
export type UserSelect = typeof User.$inferSelect;
