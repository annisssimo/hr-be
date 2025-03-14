CREATE SCHEMA "career_day";
--> statement-breakpoint
CREATE TABLE "career_day"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"manager_id" uuid,
	"password" varchar(255) NOT NULL,
	"avatar" varchar(255),
	"status" varchar DEFAULT 'pending' NOT NULL,
	"role" varchar,
	"status_assignment_date" date,
	"position" varchar,
	"start_day" date,
	"end_date" date,
	"date_of_birth" date,
	"phone_number" varchar(20),
	"contact_username" varchar(255),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "career_day"."password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_day"."vacancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(2000) NOT NULL,
	"skills" varchar(1000) NOT NULL,
	"location" varchar(255),
	"salary" integer,
	"created_at" date DEFAULT now() NOT NULL,
	"manager_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_day"."applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"vacancy_id" uuid NOT NULL,
	"resume_id" uuid,
	"cover_letter" varchar(2000),
	"status" varchar DEFAULT 'pending' NOT NULL,
	"source" varchar(255),
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_day"."resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"file_path" varchar(255),
	"skills" varchar(1000),
	"experience" varchar(1000),
	"education" varchar(1000),
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "career_day"."users" ADD CONSTRAINT "users_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "career_day"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_day"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "career_day"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_day"."vacancies" ADD CONSTRAINT "vacancies_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "career_day"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_day"."applications" ADD CONSTRAINT "applications_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "career_day"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_day"."applications" ADD CONSTRAINT "applications_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "career_day"."vacancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_day"."applications" ADD CONSTRAINT "applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "career_day"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_day"."resumes" ADD CONSTRAINT "resumes_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "career_day"."users"("id") ON DELETE no action ON UPDATE no action;