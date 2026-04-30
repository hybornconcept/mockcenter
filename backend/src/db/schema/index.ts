// ─── Enums (must be first — tables depend on them) ────────────────────────────
export * from "./enums";

// ─── Tables ───────────────────────────────────────────────────────────────────
export * from "./users";
export * from "./auth";
export * from "./credits";
export * from "./referrals";
export * from "./questions";
export * from "./practice";
export * from "./bookmarks";
export * from "./notifications";
export * from "./audit";
export * from "./settings";

// ─── Drizzle Relations ────────────────────────────────────────────────────────
import { relations } from "drizzle-orm";
import { users } from "./users";
import { sessions, accounts, verifications } from "./auth";
import { questions, options, exams, subjects, explanations } from "./questions";
import { practiceSessions, practiceAnswers } from "./practice";
import { referrals } from "./referrals";
import { notifications } from "./notifications";
import { creditTransactions } from "./credits";
import { auditLogs } from "./audit";

export const usersRelations = relations(users, ({ many }) => ({
  sessions:           many(sessions),
  accounts:           many(accounts),
  practiceSessions:   many(practiceSessions),
  referralsMade:      many(referrals, { relationName: "referrer" }),
  notifications:      many(notifications),
  creditTransactions: many(creditTransactions),
  auditLogs:          many(auditLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subject: one(subjects, { fields: [questions.subjectId], references: [subjects.id] }),
  exam:    one(exams,    { fields: [questions.examId],    references: [exams.id]    }),
  options: many(options),
  explanation: one(explanations, { fields: [questions.id], references: [explanations.questionId] }),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
}));

export const practiceSessionsRelations = relations(practiceSessions, ({ one, many }) => ({
  user:    one(users, { fields: [practiceSessions.userId], references: [users.id] }),
  answers: many(practiceAnswers),
}));

export const practiceAnswersRelations = relations(practiceAnswers, ({ one }) => ({
  session:  one(practiceSessions, { fields: [practiceAnswers.sessionId], references: [practiceSessions.id] }),
  question: one(questions,        { fields: [practiceAnswers.questionId], references: [questions.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id], relationName: "referrer" }),
  referred: one(users, { fields: [referrals.referredId], references: [users.id], relationName: "referred" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, { fields: [creditTransactions.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, { fields: [auditLogs.adminId], references: [users.id] }),
}));
