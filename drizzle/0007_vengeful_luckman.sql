ALTER TABLE "users" RENAME COLUMN "profile_url" TO "image";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerified" timestamp;