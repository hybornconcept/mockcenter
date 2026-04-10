import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { questions } from "./questions";

export const sessionStatusEnum = pgEnum("session_status", [
  "active", "paused", "completed", "abandoned"
]);

export const practiceSessions = pgTable("practice_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  examId: uuid("exam_id").notNull(),
  subjectIds: jsonb("subject_ids").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answeredCount: integer("answered_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  status: sessionStatusEnum("status").notNull().default("active"),
  resumeState: jsonb("resume_state"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const practiceAnswers = pgTable("practice_answers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  selectedOptionId: uuid("selected_option_id"),
  isCorrect: boolean("is_correct").notNull().default(false),
  timeSpentSecs: integer("time_spent_secs").notNull().default(0),
  answeredAt: timestamp("answered_at").defaultNow(),
});
