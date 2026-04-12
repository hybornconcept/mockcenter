import { pgTable, text, integer, date, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

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

// ─── Users Table ──────────────────────────────────────────────────────────────
// Single combined table serving as:
//   1. Better Auth's "user" model (id, name, email, emailVerified, image, createdAt, updatedAt)
//   2. App-specific profile fields (userType, targetExam, state, credits, referral, etc.)
//
// IMPORTANT: Better Auth manages id, name, email, emailVerified, image, createdAt, updatedAt.
// All other columns are managed by our app directly via Drizzle queries.
// emailVerified MUST be boolean — Better Auth writes boolean true/false to this column.

export const users = pgTable("users", {
  // Better Auth core fields — do NOT change column names or types
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),                          // avatar/profile picture URL
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // App profile fields — managed directly by our API routes
  phone: text("phone"),
  school: text("school"),
  state: text("state"),

  // Onboarding
  userType: userTypeEnum("user_type"),
  targetExam: examTypeEnum("target_exam"),
  examLevel: examLevelEnum("exam_level"),
  targetScore: integer("target_score"),
  examDate: date("exam_date"),

  // Credits & referral
  creditBalance: integer("credit_balance").notNull().default(0),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),               // user.id of referrer (text FK, circular)
});
