import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "../db";
import { practiceSessions, practiceAnswers, questions } from "../db/schema";
import { requireAuth } from "../middleware/auth.middleware";
import { QuestionService } from "../services/question.service";
import type { Env } from "../env";
import { eq, and } from "drizzle-orm";

const practice = new Hono<{ Bindings: Env }>();

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
  const user = c.get("user" as any);
  const db = createDb(c.env);
  const questionService = new QuestionService(db);

  const selectedQuestions = await questionService.getQuestionsForSession(subjectIds, totalQuestions);

  if (selectedQuestions.length === 0) {
    return c.json({ success: false, message: "No questions found for these subjects" }, 404);
  }

  const [session] = await db.insert(practiceSessions).values({
    userId: user.id,
    examId,
    subjectIds,
    totalQuestions: selectedQuestions.length,
    status: "active",
  }).returning();

  return c.json({
    success: true,
    data: {
      session,
      questions: selectedQuestions,
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

  // Update session stats
  const [session] = await db.select().from(practiceSessions).where(eq(practiceSessions.id, sessionId));
  
  await db.update(practiceSessions)
    .set({
      answeredCount: session.answeredCount + 1,
      correctCount: validation.isCorrect ? session.correctCount + 1 : session.correctCount,
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
    with: {
      // Assuming relations are set up in schema
    }
  });

  if (!session) return c.json({ success: false, message: "Session not found" }, 404);

  return c.json({ success: true, data: session });
});

export default practice;
