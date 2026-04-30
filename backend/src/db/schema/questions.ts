import { pgTable, uuid, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { examTypeEnum } from "./enums";

// ─── Exams ────────────────────────────────────────────────────────────────────
export const exams = pgTable("exams", {
  id:        uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name:      text("name").notNull(),
  type:      examTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const subjects = pgTable("subjects", {
  id:        uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  examId:    uuid("exam_id").notNull().references(() => exams.id),
  name:      text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  examIdx: index("subjects_exam_idx").on(t.examId),
}));

// ─── Questions ────────────────────────────────────────────────────────────────
// FIX: explanationBody inlined — eliminates the `explanations` table and its JOIN.
// Every question fetch previously required a LEFT JOIN or separate query just
// for a single text column.
export const questions = pgTable("questions", {
  id:              uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId:       uuid("subject_id").notNull().references(() => subjects.id),
  examId:          uuid("exam_id").notNull().references(() => exams.id),
  year:            integer("year"),
  topic:           text("topic"),
  body:            text("body").notNull(),
  // ✅ was a separate `explanations` table — now inlined
  explanationBody: text("explanation_body"),
  imageUrl:        text("image_url"),
  creditCost:      integer("credit_cost").notNull().default(1),
  createdAt:       timestamp("created_at").defaultNow(),
}, (t) => ({
  // Critical: practice session creation filters by (subjectId, examId) for every session
  subjectExamIdx: index("q_subject_exam_idx").on(t.subjectId, t.examId),
  yearIdx:        index("q_year_idx").on(t.year),
  createdIdx:     index("q_created_idx").on(t.createdAt),
}));

// ─── Options ──────────────────────────────────────────────────────────────────
// FIX: index on question_id — was doing full table scans on 40k+ rows.
export const options = pgTable("options", {
  id:         uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  label:      text("label").notNull(),
  body:       text("body").notNull(),
  isCorrect:  boolean("is_correct").notNull().default(false),
}, (t) => ({
  // Every question fetch loads its options by question_id — this index is critical
  questionIdx: index("options_question_idx").on(t.questionId),
}));

// NOTE: The `explanations` table is kept as a Drizzle export stub only during
// the migration window so existing FK references don't break.
// Once `drizzle-kit push` runs the migration, the table is dropped.
// Remove this export after the migration is confirmed.
export const explanations = pgTable("explanations", {
  id:         uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }).unique(),
  body:       text("body").notNull(),
});
