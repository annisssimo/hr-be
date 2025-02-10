CREATE SCHEMA IF NOT EXISTS "career_day";
--> statement-breakpoint
CREATE TABLE "career_day"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"manager_id" uuid DEFAULT null,
	"password" varchar(255) NOT NULL,
	"avatar" varchar(255) DEFAULT null,
	"status" varchar NOT NULL,
	"role" varchar NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "career_day"."users" ADD CONSTRAINT "users_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "career_day"."users"("id") ON DELETE no action ON UPDATE no action;