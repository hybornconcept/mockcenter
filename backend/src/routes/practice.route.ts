import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "../db";
import { practiceSessions, practiceAnswers, questions, exams, subjects, users } from "../db/schema";
import { requireAuth } from "../middleware/auth.middleware";
import { QuestionService } from "../services/question.service";
import type { Env, Variables } from "../env";
import { eq, and, inArray, sql } from "drizzle-orm";

const practice = new Hono<{ Bindings: Env; Variables: Variables }>();

const startSessionSchema = z.object({
  examId: z.string().uuid(),
  subjectIds: z.array(z.string().uuid()),
  totalQuestions: z.number().min(5).max(100).default(20),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid(),
  timeSpentSecs: z.number().default(0),
});

practice.use("*", requireAuth);

// Start a new practice session
practice.post("/start", zValidator("json", startSessionSchema), async (c) => {
  const { examId, subjectIds, totalQuestions } = c.req.valid("json");
  const user = c.get("user");
  const db = createDb(c.env);
  const questionService = new QuestionService(db);

  const selectedQuestions = await questionService.getQuestionsForSession(subjectIds, totalQuestions);

  if (selectedQuestions.length === 0) {
    return c.json({ success: false, message: "No questions found for these subjects" }, 404);
  }

  // Persist question IDs so GET /:id always returns the same questions
  const questionIds = selectedQuestions.map((q) => q.id);

  // Compute total credit cost for this session
  const totalCreditCost = selectedQuestions.reduce((sum, q) => sum + (q.creditCost ?? 1), 0);

  // Atomically deduct credits — floor at 0 so balance never goes negative
  await db.update(users)
    .set({ creditBalance: sql`greatest(0, credit_balance - ${totalCreditCost})` })
    .where(eq(users.id, user.id));

  const [session] = await db.insert(practiceSessions).values({
    userId: user.id,
    examId,
    subjectIds,
    totalQuestions: selectedQuestions.length,
    status: "active",
    resumeState: { questionIds },
  }).returning();

  return c.json({
    success: true,
    data: {
      session,
      questions: selectedQuestions,
      creditCost: totalCreditCost,
    },
  });
});

// Submit an answer
practice.post("/submit", zValidator("json", submitAnswerSchema), async (c) => {
  const { sessionId, questionId, selectedOptionId, timeSpentSecs } = c.req.valid("json");
  const db = createDb(c.env);
  const questionService = new QuestionService(db);

  const validation = await questionService.validateAnswer(questionId, selectedOptionId);

  await db.insert(practiceAnswers).values({
    sessionId,
    questionId,
    selectedOptionId,
    isCorrect: validation.isCorrect,
    timeSpentSecs,
  });

  // Atomic increment — single UPDATE avoids read-then-write race conditions
  // when the same session receives concurrent answer submits.
  await db.update(practiceSessions)
    .set({
      answeredCount: sql`answered_count + 1`,
      correctCount:  validation.isCorrect
        ? sql`correct_count + 1`
        : sql`correct_count`,
      updatedAt: new Date(),
    })
    .where(eq(practiceSessions.id, sessionId));

  return c.json({
    success: true,
    data: {
      isCorrect: validation.isCorrect,
      correctOptionId: validation.correctOptionId,
    },
  });
});

// Get session details/results
practice.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env);
  
  const session = await db.query.practiceSessions.findFirst({
    where: eq(practiceSessions.id, id),
  });

  if (!session) return c.json({ success: false, message: "Session not found" }, 404);

  const questionService = new QuestionService(db);

  // Use stored question IDs from resumeState to guarantee the same set as session start
  const storedIds = (session.resumeState as any)?.questionIds as string[] | undefined;
  const questions = storedIds && storedIds.length > 0
    ? await questionService.getQuestionsByIds(storedIds)
    : await questionService.getQuestionsForSession(session.subjectIds as string[], session.totalQuestions);

  const [examRecord, subjectRecord] = await Promise.all([
    db.query.exams.findFirst({
      where: eq(exams.id, session.examId)
    }),
    Array.isArray(session.subjectIds) && session.subjectIds.length > 0
      ? db.query.subjects.findFirst({
          where: eq(subjects.id, (session.subjectIds as string[])[0])
        })
      : Promise.resolve(null)
  ]);

  return c.json({ 
    success: true, 
    data: { 
      session, 
      questions,
      examType: examRecord?.type ? examRecord.type.toUpperCase() : "Exam",
      subjectName: subjectRecord?.name || "Subject",
      year: questions[0]?.year || "Year"
    } 
  });
});

const completeSessionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedOptionId: z.string().uuid().optional(),
    timeSpentSecs: z.number().default(0),
  })),
  totalTimeSecs: z.number().default(0),
});

// Complete a session (batch submit all answers + mark as completed)
practice.post("/:id/complete", zValidator("json", completeSessionSchema), async (c) => {
  const id = c.req.param("id");
  const { answers, totalTimeSecs } = c.req.valid("json");
  const db = createDb(c.env);
  const questionService = new QuestionService(db);

  const session = await db.query.practiceSessions.findFirst({
    where: eq(practiceSessions.id, id),
  });
  if (!session) return c.json({ success: false, message: "Session not found" }, 404);

  let correctCount = 0;
  const answerResults: { questionId: string; selectedOptionId?: string; isCorrect: boolean; correctOptionId?: string }[] = [];

  for (const ans of answers) {
    if (!ans.selectedOptionId) {
      answerResults.push({ questionId: ans.questionId, isCorrect: false });
      continue;
    }
    const validation = await questionService.validateAnswer(ans.questionId, ans.selectedOptionId);
    if (validation.isCorrect) correctCount++;

    // Upsert answer (avoid duplicates if already submitted individually)
    try {
      await db.insert(practiceAnswers).values({
        sessionId: id,
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
        isCorrect: validation.isCorrect,
        timeSpentSecs: ans.timeSpentSecs,
      }).onConflictDoNothing();
    } catch (_) { /* ignore */ }

    answerResults.push({
      questionId: ans.questionId,
      selectedOptionId: ans.selectedOptionId,
      isCorrect: validation.isCorrect,
      correctOptionId: validation.correctOptionId,
    });
  }

  const wrong = answers.filter(a => a.selectedOptionId).length - correctCount;
  const skipped = answers.filter(a => !a.selectedOptionId).length;
  const score = Math.round((correctCount / session.totalQuestions) * 100);

  await db.update(practiceSessions)
    .set({
      status: "completed",
      correctCount,
      answeredCount: answers.filter(a => a.selectedOptionId).length,
      completedAt: new Date(),
      updatedAt: new Date(),
      resumeState: {
        ...(session.resumeState as object || {}),
        totalTimeSecs,
        answerResults,
      },
    })
    .where(eq(practiceSessions.id, id));

  return c.json({
    success: true,
    data: { score, correct: correctCount, wrong, skipped, totalTimeSecs, answerResults },
  });
});

// Get full session results (for review mode)
practice.get("/:id/results", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env);

  const session = await db.query.practiceSessions.findFirst({
    where: eq(practiceSessions.id, id),
  });
  if (!session) return c.json({ success: false, message: "Session not found" }, 404);

  const resumeState = session.resumeState as any || {};
  const storedIds = resumeState.questionIds as string[] | undefined;
  const answerResults = resumeState.answerResults as any[] | undefined || [];

  // Load questions with options INCLUDING isCorrect for review
  const questionRecords = storedIds?.length
    ? await db.query.questions.findMany({
        where: inArray(questions.id, storedIds),
        with: {
          options: { columns: { id: true, label: true, body: true, isCorrect: true } },
        },
      })
    : [];

  // Restore session order
  const qMap = new Map(questionRecords.map(q => [q.id, q]));
  const orderedQuestions = (storedIds || []).map(id => qMap.get(id)).filter(Boolean) as typeof questionRecords;

  // Merge answer results
  const answerMap = new Map(answerResults.map((a: any) => [a.questionId, a]));
  const mergedQuestions = orderedQuestions.map(q => {
    const ans = answerMap.get(q.id) as any;
    const correctOption = q.options.find(o => o.isCorrect);
    return {
      ...q,
      selectedOptionId: ans?.selectedOptionId || null,
      isCorrect: ans?.isCorrect || false,
      correctOptionId: correctOption?.id || ans?.correctOptionId,
      explanation: q.explanationBody || null,
    };
  });

  const [examRecord, subjectRecord] = await Promise.all([
    db.query.exams.findFirst({ where: eq(exams.id, session.examId) }),
    Array.isArray(session.subjectIds) && session.subjectIds.length > 0
      ? db.query.subjects.findFirst({ where: eq(subjects.id, (session.subjectIds as string[])[0]) })
      : Promise.resolve(null)
  ]);

  const score = Math.round((session.correctCount / session.totalQuestions) * 100);

  return c.json({
    success: true,
    data: {
      session,
      score,
      correct: session.correctCount,
      wrong: session.answeredCount - session.correctCount,
      skipped: session.totalQuestions - session.answeredCount,
      totalTimeSecs: resumeState.totalTimeSecs || 0,
      questions: mergedQuestions,
      examType: examRecord?.type?.toUpperCase() || "Exam",
      subjectName: subjectRecord?.name || "Subject",
      year: orderedQuestions[0]?.year || "",
    },
  });
});

// Start a redemption session (retry only wrong questions)
practice.post("/:id/redemption", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env);
  const questionService = new QuestionService(db);
  const user = c.get("user");

  const session = await db.query.practiceSessions.findFirst({
    where: eq(practiceSessions.id, id),
  });
  if (!session) return c.json({ success: false, message: "Session not found" }, 404);

  const resumeState = session.resumeState as any || {};
  const answerResults = resumeState.answerResults as any[] || [];
  const wrongIds = answerResults.filter((a: any) => !a.isCorrect && a.selectedOptionId).map((a: any) => a.questionId);

  if (wrongIds.length === 0) {
    return c.json({ success: false, message: "No wrong answers to retry" }, 400);
  }

  const wrongQuestions = await questionService.getQuestionsByIds(wrongIds);
  const [newSession] = await db.insert(practiceSessions).values({
    userId: user.id,
    examId: session.examId,
    subjectIds: session.subjectIds,
    totalQuestions: wrongIds.length,
    status: "active",
    resumeState: { questionIds: wrongIds, isRedemption: true, originalSessionId: id },
  }).returning();

  return c.json({
    success: true,
    data: { session: newSession, questions: wrongQuestions },
  });
});

export default practice;

