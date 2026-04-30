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
  // NOTE: only store { questionIds, totalTimeSecs, isRedemption, originalSessionId }.
  // answerResults was removed — use practice_answers rows instead (avoids dual-write).
  resumeState:     jsonb("resume_state"),
  startedAt:       timestamp("started_at").defaultNow(),
  completedAt:     timestamp("completed_at"),
  updatedAt:       timestamp("updated_at").defaultNow(),
}, (t) => ({
  // FIX: every dashboard / profile fetch loads sessions by user — was a seq scan
  userIdx:    index("ps_user_idx").on(t.userId),
  // FIX: analytics groups sessions by exam
  examIdx:    index("ps_exam_idx").on(t.examId),
  // FIX: admin dashboard filters by status
  statusIdx:  index("ps_status_idx").on(t.status),
  // Combined for analytics window queries
  userStatusIdx: index("ps_user_status_idx").on(t.userId, t.status),
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
  // FIX: result page loads all answers for a session — was catastrophic without this
  sessionIdx:          index("pa_session_idx").on(t.sessionId),
  // FIX: analytics aggregates by question for fail-rate ranking
  questionIdx:         index("pa_question_idx").on(t.questionId),
  // Combined: uniqueness check + session result JOIN
  sessionQuestionIdx:  index("pa_session_question_idx").on(t.sessionId, t.questionId),
}));
