import type { AdapterAccountType } from '@auth/core/adapters';
import Crypto from "node:crypto"
import { pgEnum, pgTable, serial, varchar, timestamp, text, primaryKey, boolean, integer } from 'drizzle-orm/pg-core';


export const UserStatus = pgEnum("user_status", ["active", "inactive", "deleted"]);

export const RoleStatus = pgEnum("role_status", ["admin", "user", "guest"]);

export const users = pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => Crypto.randomUUID()),
    name: varchar("name").unique().notNull(),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    role: RoleStatus("role").notNull().default("user"),
    image: text("image"),
    password: varchar("password"),
    status: UserStatus("status").notNull().default("active"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("timestamp").defaultNow(),
    tags: varchar("tags").array().notNull().default(["user"]),
    lang: varchar("lang").notNull().default("en"),
});

export const accounts = pgTable(
    "account",
    {
      userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      type: text("type").$type<AdapterAccountType>().notNull(),
      provider: text("provider").notNull(),
      providerAccountId: text("providerAccountId").notNull(),
      refresh_token: text("refresh_token"),
      access_token: text("access_token"),
      expires_at: integer("expires_at"),
      token_type: text("token_type"),
      scope: text("scope"),
      id_token: text("id_token"),
      session_state: text("session_state"),
    },
    (account) => ({
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    })
  )

  export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  })

  export const verificationTokens = pgTable(
    "verificationToken",
    {
      identifier: text("identifier").notNull(),
      token: text("token").notNull(),
      expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    })
  )

  export const authenticators = pgTable(
    "authenticator",
    {
      credentialID: text("credentialID").notNull().unique(),
      userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      providerAccountId: text("providerAccountId").notNull(),
      credentialPublicKey: text("credentialPublicKey").notNull(),
      counter: integer("counter").notNull(),
      credentialDeviceType: text("credentialDeviceType").notNull(),
      credentialBackedUp: boolean("credentialBackedUp").notNull(),
      transports: text("transports"),
    },
    (authenticator) => ({
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    })
  )



export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
