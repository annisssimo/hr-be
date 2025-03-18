ALTER TABLE "career_day"."vacancies" ALTER COLUMN "skills" TYPE TEXT[] 
USING string_to_array(trim(skills), ', ')::TEXT[];

ALTER TABLE "career_day"."resumes" ALTER COLUMN "skills" TYPE TEXT[] 
USING string_to_array(trim(skills), ', ')::TEXT[];