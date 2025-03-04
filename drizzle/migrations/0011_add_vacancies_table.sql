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
ALTER TABLE "career_day"."vacancies" ADD CONSTRAINT "vacancies_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "career_day"."users"("id") ON DELETE no action ON UPDATE no action;