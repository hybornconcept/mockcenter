import { pgTable, uuid, text, timestamp, unique, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { questions } from "./questions";

// ─── Bookmark Collections ─────────────────────────────────────────────────────
export const bookmarkCollections = pgTable("bookmark_collections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  // FIX: every "My collections" fetch filters by user_id — was a seq scan
  userIdx: index("bc_user_idx").on(t.userId),
}));

// ─── Bookmarks ─────────────────────────────────────────────────────────────────
// masteryStatus: tracks study progress per bookmarked question
// note: optional personal annotation saved with the bookmark
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id").references(() => bookmarkCollections.id, { onDelete: "set null" }),
  // ── New fields: persisted per bookmark ───────────────────────────────────
  masteryStatus: text("mastery_status").default("not_started"), // not_started | in_progress | mastered
  note: text("note"),                                           // user's personal annotation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  // Composite unique — also serves as the userId-side index (left prefix usable)
  uniqueBookmark: unique("bk_user_question_unique").on(t.userId, t.questionId),
  // Explicit userId index for queries that don't also filter by questionId
  userIdx: index("bk_user_idx").on(t.userId),
  // Collection-based filtering
  collectionIdx: index("bk_collection_idx").on(t.collectionId),
}));
