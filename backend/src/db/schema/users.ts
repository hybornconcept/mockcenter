import { pgTable, text, integer, date, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { examTypeEnum, examLevelEnum, userTypeEnum, userStatusEnum } from "./enums";

// ─── Users Table ──────────────────────────────────────────────────────────────
// Serves as Better Auth's "user" model + all app-specific profile fields.
// Better Auth owns: id, name, email, emailVerified, image, createdAt, updatedAt.
// emailVerified MUST be boolean — Better Auth writes boolean true/false.

export const users = pgTable("users", {
  // ── Better Auth core — do NOT rename ─────────────────────────────────────
  id:            text("id").primaryKey(),
  name:          text("name").notNull(),
  email:         text("email").unique().notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image:         text("image"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),

  // ── App profile fields ────────────────────────────────────────────────────
  phone:  text("phone"),
  school: text("school"),
  state:  text("state"),

  // ── Onboarding ────────────────────────────────────────────────────────────
  userType:    userTypeEnum("user_type"),
  targetExam:  examTypeEnum("target_exam"),
  examLevel:   examLevelEnum("exam_level"),
  targetScore: integer("target_score"),
  examDate:    date("exam_date"),

  // ── Credits & referral ────────────────────────────────────────────────────
  creditBalance: integer("credit_balance").notNull().default(0),
  referralCode:  text("referral_code").unique(),
  // FIX: real FK with set-null on delete (was a soft text reference)
  referredBy: text("referred_by").references((): any => users.id, { onDelete: "set null" }),

  // ── Account status ────────────────────────────────────────────────────────
  // Separate from emailVerified: tracks admin-controlled suspension/banning.
  // Default 'active' so existing users are unaffected on migration.
  status: userStatusEnum("status").notNull().default("active"),

  // ── Notification preferences (merged from notification_settings table) ────
  // Eliminates an extra table and a JOIN on every notification send.
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications:  boolean("push_notifications").notNull().default(true),
  creditAlerts:       boolean("credit_alerts").notNull().default(true),
  referralAlerts:     boolean("referral_alerts").notNull().default(true),
}, (t) => ({
  // Frequently filtered/sorted columns
  emailIdx:   index("users_email_idx").on(t.email),
  createdIdx: index("users_created_idx").on(t.createdAt),
}));
