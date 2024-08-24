DO $$ BEGIN
 CREATE TYPE "public"."role_status" AS ENUM('admin', 'user', 'guest');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"role" "role_status",
	"google_id" varchar,
	"profile_url" text,
	"discord_id" varchar,
	"password" varchar,
	"status" "user_status",
	"deleted_at" timestamp,
	"timestamp" timestamp DEFAULT now(),
	CONSTRAINT "users_name_unique" UNIQUE("name"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
