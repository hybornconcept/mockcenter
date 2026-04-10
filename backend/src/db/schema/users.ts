import { pgTable, text, integer, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userTypeEnum = pgEnum("user_type", [
  "student",
  "professional",
]);

export const examTypeEnum = pgEnum("exam_type", [
  "jamb", "waec", "neco", "post_utme", "common_entrance", "nabteb",
  "ican", "ican_atswa", "citn", "law_school", "trcn", "ielts", "nimasa", "other",
]);

export const examLevelEnum = pgEnum("exam_level", [
  "foundation", "skills", "professional", "not_applicable",
]);

export const users = pgTable("users", {
  // Better Auth generates its own nanoid string IDs — must be text, not uuid
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  school: text("school"),
  state: text("state"),

  // Onboarding fields
  userType: userTypeEnum("user_type"),
  targetExam: examTypeEnum("target_exam"),
  examLevel: examLevelEnum("exam_level"),
  targetScore: integer("target_score"),
  examDate: date("exam_date"),

  // Credits & referral
  emailVerified: text("email_verified").notNull().default("false"),
  creditBalance: integer("credit_balance").notNull().default(0),
  referralCode: text("referral_code").unique().notNull().default(sql`substr(md5(random()::text), 1, 8)`),
  referredBy: text("referred_by").references((): any => users.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
