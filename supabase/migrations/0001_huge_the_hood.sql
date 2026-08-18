ALTER TABLE "profiles" ADD COLUMN "clerk_user_id" text;--> statement-breakpoint
DELETE FROM "profiles" WHERE "clerk_user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "clerk_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_clerk_user_id_unique" UNIQUE("clerk_user_id");