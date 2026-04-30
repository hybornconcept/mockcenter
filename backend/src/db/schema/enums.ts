/**
 * enums.ts — Single source of truth for all PostgreSQL enums.
 *
 * NEVER redefine an enum in another schema file.
 * Import from here. Drizzle will only register each pgEnum once.
 */
import { pgEnum } from "drizzle-orm/pg-core";

// Full union of all exam types across all products
export const examTypeEnum = pgEnum("exam_type", [
  "jamb", "waec", "neco", "post_utme", "common_entrance",
  "nabteb", "ican", "ican_atswa", "citn", "law_school",
  "trcn", "ielts", "nimasa", "professional", "other",
]);

export const examLevelEnum = pgEnum("exam_level", [
  "foundation", "skills", "professional", "not_applicable",
]);

export const userTypeEnum = pgEnum("user_type", [
  "student", "professional",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active", "suspended", "banned",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "active", "paused", "completed", "abandoned",
]);

export const referralStatusEnum = pgEnum("referral_status", [
  "signed_up", "purchased", "rewarded",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "credit", "referral", "session", "system",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending", "success", "failed", "refunded",
]);
