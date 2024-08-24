import { pgEnum, pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';


export const UserStatus = pgEnum("user_status", ["active", "inactive", "deleted"]);

export const RoleStatus = pgEnum("role_status", ["admin", "user", "guest"]);

export const User = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name").unique(),
    role: RoleStatus("role"),
    googleId: varchar("google_id").unique(),
    profileUrl: text("profile_url"),
    discordId: varchar("discord_id").unique(),
    password: varchar("password"),
    status: UserStatus("status"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("timestamp").defaultNow(),
    updatedAt: timestamp("timestamp").defaultNow(),
});

