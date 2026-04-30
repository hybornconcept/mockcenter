ALTER TYPE "public"."exam_type" ADD VALUE 'professional' BEFORE 'other';--> statement-breakpoint
ALTER TABLE "notification_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "notification_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "image";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_referred_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referral_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referred_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_packages" ALTER COLUMN "is_active" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "credit_packages" ALTER COLUMN "is_active" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "credit_packages" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_transactions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "referrals" ALTER COLUMN "referrer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "referrals" ALTER COLUMN "referred_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "practice_sessions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookmark_collections" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookmarks" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "push_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credit_alerts" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_alerts" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "access_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "explanation_body" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cp_active_idx" ON "credit_packages" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ct_user_idx" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ct_status_idx" ON "credit_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ct_user_status_idx" ON "credit_transactions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "ref_referrer_idx" ON "referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "ref_referred_idx" ON "referrals" USING btree ("referred_id");--> statement-breakpoint
CREATE INDEX "options_question_idx" ON "options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "q_subject_exam_idx" ON "questions" USING btree ("subject_id","exam_id");--> statement-breakpoint
CREATE INDEX "q_year_idx" ON "questions" USING btree ("year");--> statement-breakpoint
CREATE INDEX "q_created_idx" ON "questions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subjects_exam_idx" ON "subjects" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "pa_session_idx" ON "practice_answers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "pa_question_idx" ON "practice_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "pa_session_question_idx" ON "practice_answers" USING btree ("session_id","question_id");--> statement-breakpoint
CREATE INDEX "ps_user_idx" ON "practice_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ps_exam_idx" ON "practice_sessions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "ps_status_idx" ON "practice_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ps_user_status_idx" ON "practice_sessions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "notif_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notif_user_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notif_created_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "expires_at";