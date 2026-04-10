import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { questions } from "./questions";

export const bookmarkCollections = pgTable("bookmark_collections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  collectionId: uuid("collection_id").references(() => bookmarkCollections.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  uniqueBookmark: unique().on(t.userId, t.questionId),
}));
