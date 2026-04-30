import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Platform Settings ────────────────────────────────────────────────────────
// Key-value store for all admin-configurable settings.
// `key` is namespaced: "general.siteName", "credits.perQuestion", etc.
// `value` is always a JSON column so we can store strings, numbers, booleans,
//  arrays, or objects without schema changes.
// Use UPSERT on key — there's always exactly one row per key.
export const platformSettings = pgTable("platform_settings", {
  id:        uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key:       text("key").notNull().unique(),     // e.g. "general.siteName"
  value:     jsonb("value").notNull(),            // JSON encoded value
  category:  text("category").notNull(),          // e.g. "general" | "credits" | "scoring"
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by"),                  // admin email
}, (t) => ({
  keyIdx:      index("ps_key_idx").on(t.key),
  categoryIdx: index("ps_cat_idx").on(t.category),
}));

// ─── Default settings seed ────────────────────────────────────────────────────
// Used by the GET /settings endpoint when no DB row exists for a key.
export const DEFAULT_SETTINGS: Record<string, { value: unknown; category: string }> = {
  "general.siteName":       { value: "MockCenter",             category: "general" },
  "general.supportEmail":   { value: "support@mockcenter.ng",  category: "general" },
  "general.tagline":        { value: "Ace your exams with MockCenter", category: "general" },
  "general.maintenanceMode":{ value: false,                    category: "general" },
  "general.openRegistration":{ value: true,                   category: "general" },
  "general.trialCredits":   { value: true,                    category: "general" },
  "general.trialAmount":    { value: 20,                       category: "general" },
  "credits.perQuestion":    { value: 1,                        category: "credits" },
  "credits.perMock":        { value: 10,                       category: "credits" },
  "credits.referralBonus":  { value: 50,                       category: "credits" },
  "credits.dailyBonus":     { value: 5,                        category: "credits" },
  "scoring.correct":        { value: 1,                        category: "scoring" },
  "scoring.wrong":          { value: 0,                        category: "scoring" },
  "scoring.negativeMarking":{ value: false,                    category: "scoring" },
  "scoring.showScoreImmediately":{ value: true,               category: "scoring" },
  "scoring.showCorrectAnswers":  { value: true,               category: "scoring" },
  "scoring.showExplanations":    { value: true,               category: "scoring" },
};
