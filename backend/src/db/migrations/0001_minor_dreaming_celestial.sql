CREATE TYPE "public"."exam_level" AS ENUM('foundation', 'skills', 'professional', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('student', 'professional');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "target_exam" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."exam_type";--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('jamb', 'waec', 'neco', 'post_utme', 'common_entrance', 'nabteb', 'ican', 'ican_atswa', 'citn', 'law_school', 'trcn', 'ielts', 'nimasa', 'other');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "target_exam" SET DATA TYPE "public"."exam_type" USING "target_exam"::"public"."exam_type";--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "type" SET DATA TYPE "public"."exam_type" USING "type"::"public"."exam_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_type" "user_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "exam_level" "exam_level";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" text DEFAULT 'false' NOT NULL;