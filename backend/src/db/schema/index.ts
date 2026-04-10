export * from "./users";
export * from "./auth";
export * from "./credits";
export * from "./referrals";
export * from "./questions";
export * from "./practice";
export * from "./bookmarks";
export * from "./notifications";

import { relations } from "drizzle-orm";
import { users } from "./users";
import { questions, options, exams, subjects, explanations } from "./questions";
import { practiceSessions, practiceAnswers } from "./practice";

export const usersRelations = relations(users, ({ many }) => ({
  practiceSessions: many(practiceSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subject: one(subjects, { fields: [questions.subjectId], references: [subjects.id] }),
  exam: one(exams, { fields: [questions.examId], references: [exams.id] }),
  options: many(options),
  explanation: one(explanations, { fields: [questions.id], references: [explanations.questionId] }),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
}));

export const practiceSessionsRelations = relations(practiceSessions, ({ one, many }) => ({
  user: one(users, { fields: [practiceSessions.userId], references: [users.id] }),
  answers: many(practiceAnswers),
}));

export const practiceAnswersRelations = relations(practiceAnswers, ({ one }) => ({
  session: one(practiceSessions, { fields: [practiceAnswers.sessionId], references: [practiceSessions.id] }),
  question: one(questions, { fields: [practiceAnswers.questionId], references: [questions.id] }),
}));
