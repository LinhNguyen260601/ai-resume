CREATE TABLE "base_cvs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_url" text,
	"raw_text" text,
	"extracted_text" text NOT NULL,
	"company_name" text,
	"job_title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_postings_source_type_check" CHECK ("job_postings"."source_type" in ('paste', 'url'))
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text DEFAULT 'Default User' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tailored_cvs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"base_cv_id" uuid NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"template_id" text DEFAULT 'modern' NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "base_cvs" ADD CONSTRAINT "base_cvs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailored_cvs" ADD CONSTRAINT "tailored_cvs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailored_cvs" ADD CONSTRAINT "tailored_cvs_base_cv_id_base_cvs_id_fk" FOREIGN KEY ("base_cv_id") REFERENCES "public"."base_cvs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailored_cvs" ADD CONSTRAINT "tailored_cvs_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_base_cvs_profile" ON "base_cvs" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_job_postings_profile" ON "job_postings" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_tailored_cvs_profile" ON "tailored_cvs" USING btree ("profile_id");