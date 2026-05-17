import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { questions } from "./questions";
import { sessionStatusEnum } from "./enums";

// ─── Practice Sessions ────────────────────────────────────────────────────────
export const practiceSessions = pgTable("practice_sessions", {
  id:              uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:          text("user_id").notNull().references(() => users.id),
  examId:          uuid("exam_id").notNull(),
  subjectIds:      jsonb("subject_ids").notNull(),
  totalQuestions:  integer("total_questions").notNull(),
  answeredCount:   integer("answered_count").notNull().default(0),
  correctCount:    integer("correct_count").notNull().default(0),
  status:          sessionStatusEnum("status").notNull().default("active"),
  resumeState:     jsonb("resume_state"),
  startedAt:       timestamp("started_at").defaultNow(),
  completedAt:     timestamp("completed_at"),
  updatedAt:       timestamp("updated_at").defaultNow(),
}, (t) => ({
  // ── Core lookups ──────────────────────────────────────────────────────────
  userIdx:       index("ps_user_idx").on(t.userId),
  examIdx:       index("ps_exam_idx").on(t.examId),
  statusIdx:     index("ps_status_idx").on(t.status),
  // ── High-value composite indexes ──────────────────────────────────────────
  // Combined for analytics window queries (user + status filter)
  userStatusIdx: index("ps_user_status_idx").on(t.userId, t.status),
  // Combined for completed-session history (ordered by completedAt)
  userStatusCompletedIdx: index("ps_user_status_completed_idx").on(t.userId, t.status, t.completedAt),
  // ── JSONB GIN index ───────────────────────────────────────────────────────
  // Analytics extracts first subject via (subjectIds->>'0')::uuid.
  // GIN lets Postgres use JSONB containment operators efficiently.
  subjectIdsGin: index("ps_subject_ids_gin").using("gin", t.subjectIds),
}));

// ─── Practice Answers ─────────────────────────────────────────────────────────
export const practiceAnswers = pgTable("practice_answers", {
  id:               uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId:        uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }),
  questionId:       uuid("question_id").notNull().references(() => questions.id),
  selectedOptionId: uuid("selected_option_id"),
  isCorrect:        boolean("is_correct").notNull().default(false),
  timeSpentSecs:    integer("time_spent_secs").notNull().default(0),
  answeredAt:       timestamp("answered_at").defaultNow(),
}, (t) => ({
  sessionIdx:         index("pa_session_idx").on(t.sessionId),
  questionIdx:        index("pa_question_idx").on(t.questionId),
  sessionQuestionIdx: index("pa_session_question_idx").on(t.sessionId, t.questionId),
  // Correctness filter for per-question fail-rate analytics
  correctIdx:         index("pa_correct_idx").on(t.isCorrect),
}));
