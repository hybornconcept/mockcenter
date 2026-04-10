import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const examTypeEnum = pgEnum("exam_type", [
  "jamb", "waec", "neco", "ielts", "professional"
]);

export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: examTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: uuid("exam_id").notNull().references(() => exams.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id),
  examId: uuid("exam_id").notNull().references(() => exams.id),
  year: integer("year"),
  topic: text("topic"),
  body: text("body").notNull(),
  creditCost: integer("credit_cost").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const options = pgTable("options", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  body: text("body").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

export const explanations = pgTable("explanations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }).unique(),
  body: text("body").notNull(),
});
