// v2
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, desc, count, sql, and, ilike, inArray } from "drizzle-orm";
import { createDb } from "../db";
import {
  users, questions, subjects, exams, options,
  practiceSessions, practiceAnswers, creditTransactions, notifications,
  creditPackages, auditLogs, platformSettings,
  examTypeEnum,
} from "../db/schema";
import { DEFAULT_SETTINGS } from "../db/schema/settings";
import { requireAdmin } from "../middleware/admin.middleware";
import type { Env, Variables } from "../env";

/** Append-only audit trail for every admin mutation. */
async function audit(
  db: ReturnType<typeof createDb>,
  adminEmail: string,
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: unknown,
) {
  try {
    await db.insert(auditLogs).values({ adminId, adminEmail, action, targetType, targetId, metadata: metadata ?? null });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}

const admin = new Hono<{ Bindings: Env; Variables: Variables }>();

// All admin routes require admin role
admin.use("*", requireAdmin);

// --- GET /api/admin/dashboard ---------------------------------------------------------------------------â”€
// Powers: admin/+page.svelte (Command Center KPIs, activity feed, health, subject coverage)
admin.get("/dashboard", async (c) => {
  const db = createDb(c.env);
  const dayAgo = new Date(Date.now() - 86_400_000);

  const week = new Date(Date.now() - 7 * 86_400_000);
  const month = new Date(Date.now() - 30 * 86_400_000);

  const [[totalUsers], [totalQuestions], [answersTotal], [creditVolume], [credits], [newUsersRow], [newQuestionsRow], passRateRows] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(questions),
    db.select({ count: count() }).from(practiceAnswers),
    db.select({ total: sql<number>`coalesce(sum(amount_ngn), 0)` }).from(creditTransactions).where(eq(creditTransactions.status, "success")),
    db.select({ total: sql<number>`coalesce(sum(credit_balance), 0)` }).from(users),
    db.select({ count: count() }).from(users).where(sql`created_at >= ${month}`),
    db.select({ count: count() }).from(questions).where(sql`created_at >= ${week}`),
    db.select({
      correct: sql<number>`coalesce(sum(correct_count), 0)`,
      total:   sql<number>`coalesce(sum(total_questions), 0)`,
    }).from(practiceSessions).where(eq(practiceSessions.status, "completed")),
  ]);

  // Sessions started in last 24 h = "active today" proxy
  const [activeToday] = await db
    .select({ count: count() })
    .from(practiceSessions)
    .where(sql`started_at >= ${dayAgo}`);

  const subjectCoverage = await db
    .select({ name: subjects.name, count: count(questions.id) })
    .from(subjects)
    .leftJoin(questions, eq(questions.subjectId, subjects.id))
    .groupBy(subjects.name)
    .orderBy(desc(count(questions.id)));

  const recentSessions = await db
    .select({
      id: practiceSessions.id,
      userId: practiceSessions.userId,
      correctCount: practiceSessions.correctCount,
      totalQuestions: practiceSessions.totalQuestions,
      status: practiceSessions.status,
      startedAt: practiceSessions.startedAt,
      completedAt: practiceSessions.completedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(practiceSessions)
    .leftJoin(users, eq(practiceSessions.userId, users.id))
    .orderBy(desc(practiceSessions.startedAt))
    .limit(10);

  const recentSignups = await db
    .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);

  // R2 orphan + media count
  let orphanCount = 0;
  let totalMedia = 0;
  const bucket = c.env.QUESTION_IMAGES;
  if (bucket) {
    const listed = await bucket.list();
    totalMedia = listed.objects.length;
    const refs = await db.select({ imageUrl: questions.imageUrl }).from(questions);
    const refSet = new Set(refs.map((r) => r.imageUrl).filter(Boolean));
    orphanCount = listed.objects.filter(
      (obj) => !refSet.has(`/images/${obj.key}`) && !refSet.has(obj.key),
    ).length;
  }

  return c.json({
    success: true,
    data: {
      kpi: {
        totalUsers:           totalUsers.count,
        activeToday:          activeToday.count,
        totalQuestions:       totalQuestions.count,
        questionsAnswered:    questionsAnswered.count,
        periodSessions:       sessionsPeriod.count,
        avgTimeSecs:          Number(avgTime.avg ?? 0),
        creditsInCirculation: Number(credits.total ?? 0),
        revenueNgn:           Number(creditVolume.total ?? 0),
        totalMedia,
        newUsers:             newUsersRow.count,
        newQuestions:         newQuestionsRow.count,
        passRate: (() => {
          const pr = passRateRows[0];
          if (!pr || !pr.total || pr.total === 0) return null;
          return Math.round((Number(pr.correct) / Number(pr.total)) * 100);
        })(),
      },
      orphanCount,
      subjectCoverage,
      recentSessions,
      recentSignups,
    },
  });
});

// --- GET /api/admin/users ---------------------------------------------------------------------------------â”€
// Powers: admin/users page â€” paginated user list + KPI stats
const userListQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(2000).default(20),
  search: z.string().optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
});

admin.get("/users", zValidator("query", userListQuery), async (c) => {
  const db = createDb(c.env);
  const { page, limit, search, status } = c.req.valid("query");
  const offset = (page - 1) * limit;

  // Build filters
  const filters: any[] = [];
  if (search) filters.push(ilike(users.name, `%${search}%`));
  if (status) filters.push(eq(users.status, status));

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      state: users.state,
      userType: users.userType,
      targetExam: users.targetExam,
      creditBalance: users.creditBalance,
      emailVerified: users.emailVerified,
      status: users.status,
      createdAt: users.createdAt,
      referralCode: users.referralCode,
    })
    .from(users)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .where(filters.length ? and(...filters) : undefined);

  // Enrich each user with session stats
  const userIds = rows.map((u) => u.id);
  const sessionStats =
    userIds.length > 0
      ? await db
          .select({
            userId: practiceSessions.userId,
            sessions: count(),
            avgScore: sql<number>`round(avg(correct_count::float / nullif(total_questions,0) * 100))`,
          })
          .from(practiceSessions)
          .where(inArray(practiceSessions.userId, userIds))
          .groupBy(practiceSessions.userId)
      : [];

  const statsMap = new Map(sessionStats.map((s) => [s.userId, s]));

  const enriched = rows.map((u) => {
    const stats = statsMap.get(u.id);
    return {
      ...u,
      sessions: Number(stats?.sessions ?? 0),
      avgScore: Number(stats?.avgScore ?? 0),
      plan: u.creditBalance > 0 ? "Premium" : "Free",
      credits: u.creditBalance,
      first: u.name.split(" ")[0] ?? u.name,
      last: u.name.split(" ").slice(1).join(" ") ?? "",
      joined: u.createdAt,
    };
  });

  return c.json({
    success: true,
    data: { users: enriched, total, page, limit, pages: Math.ceil(total / limit) },
  });
});

// --- GET /api/admin/users/:id ---------------------------------------------------------------------------â”€
admin.get("/users/:id", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!user) return c.json({ success: false, message: "User not found" }, 404);

  const userSessions = await db
    .select({
      id: practiceSessions.id,
      correctCount: practiceSessions.correctCount,
      totalQuestions: practiceSessions.totalQuestions,
      status: practiceSessions.status,
      startedAt: practiceSessions.startedAt,
      completedAt: practiceSessions.completedAt,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, id))
    .orderBy(desc(practiceSessions.startedAt))
    .limit(20);

  const creditHistory = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, id))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(10);

  return c.json({ success: true, data: { user, sessions: userSessions, credits: creditHistory } });
});

// --- PATCH /api/admin/users/:id ------------------------------------------------------------------------â”€
const patchUserSchema = z.object({
  name:          z.string().min(1).optional(),
  phone:         z.string().optional(),
  state:         z.string().optional(),
  userType:      z.enum(["student", "professional"]).optional(),
  targetExam:    z.enum(["jamb","waec","neco","post_utme","common_entrance","nabteb","ican","ican_atswa","citn","law_school","trcn","ielts","nimasa","other"]).optional(),
  creditBalance: z.number().int().min(0).optional(),
  emailVerified: z.boolean().optional(),
  status:        z.enum(["active", "suspended", "banned"]).optional(),
});

admin.patch("/users/:id", zValidator("json", patchUserSchema), async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const adminUser = c.get("user");

  await db.update(users).set({ ...body, updatedAt: new Date() }).where(eq(users.id, id));
  await audit(db, adminUser.email, adminUser.id, "user.update", "user", id, body);

  return c.json({ success: true, message: "User updated" });
});

// --- POST /api/admin/users/:id/credits ------------------------------------------------------------â”€
// Adjust credits up or down
const creditAdjSchema = z.object({
  amount: z.number().int(),
  reason: z.string().default("Admin adjustment"),
});

admin.post("/users/:id/credits", zValidator("json", creditAdjSchema), async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const { amount, reason } = c.req.valid("json");
  const adminUser = c.get("user");

  await db.update(users).set({
    creditBalance: sql`greatest(0, credit_balance + ${amount})`,
    updatedAt: new Date(),
  }).where(eq(users.id, id));
  await audit(db, adminUser.email, adminUser.id, "user.credits_adjusted", "user", id, { amount, reason });

  return c.json({ success: true, message: `Credits adjusted by ${amount}` });
});

// --- DELETE /api/admin/users/:id ------------------------------------------------------------------------
admin.delete("/users/:id", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const adminUser = c.get("user");
  await db.delete(users).where(eq(users.id, id));
  await audit(db, adminUser.email, adminUser.id, "user.delete", "user", id);
  return c.json({ success: true, message: "User deleted" });
});

// --- GET /api/admin/questions ---------------------------------------------------------------------------â”€
// Powers: admin/bank page
const questionListQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(2000).default(20),
  search: z.string().optional(),
  subject: z.string().optional(),
  exam: z.string().optional(),
  year: z.coerce.number().optional(),
});

admin.get("/questions", zValidator("query", questionListQuery), async (c) => {
  const db = createDb(c.env);
  const { page, limit, search, subject, exam, year } = c.req.valid("query");
  const offset = (page - 1) * limit;

  const filters: any[] = [];
  if (search) filters.push(ilike(questions.body, `%${search}%`));
  if (year) filters.push(eq(questions.year, year));
  if (subject) filters.push(eq(subjects.name, subject));
  if (exam) filters.push(eq(exams.name, exam));

  const rows = await db
    .select({
      id: questions.id,
      body: questions.body,
      topic: questions.topic,
      year: questions.year,
      imageUrl: questions.imageUrl,
      creditCost: questions.creditCost,
      createdAt: questions.createdAt,
      subjectName: subjects.name,
      examName: exams.name,
      examType: exams.type,
    })
    .from(questions)
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(exams, eq(questions.examId, exams.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(questions.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(questions);

  // Attach answer counts per question
  const qIds = rows.map((q) => q.id);
  const answerCounts =
    qIds.length > 0
      ? await db
          .select({
            questionId: practiceAnswers.questionId,
            attempts: count(),
            correct: sql<number>`sum(case when is_correct then 1 else 0 end)`,
            skips: sql<number>`sum(case when selected_option_id is null then 1 else 0 end)`,
          })
          .from(practiceAnswers)
          .where(inArray(practiceAnswers.questionId, qIds))
          .groupBy(practiceAnswers.questionId)
      : [];

  const ansMap = new Map(answerCounts.map((a) => [a.questionId, a]));

  const qOptions =
    qIds.length > 0
      ? await db
          .select({
            id: options.id,
            questionId: options.questionId,
            label: options.label,
            body: options.body,
            isCorrect: options.isCorrect,
          })
          .from(options)
          .where(inArray(options.questionId, qIds))
          .orderBy(options.label)
      : [];

  const optsMap = new Map<string, any[]>();
  qOptions.forEach(opt => {
    if (!optsMap.has(opt.questionId)) optsMap.set(opt.questionId, []);
    optsMap.get(opt.questionId)!.push(opt);
  });

  const enriched = rows.map((q) => {
    const ans = ansMap.get(q.id);
    const attempts = Number(ans?.attempts ?? 0);
    const skips = Number(ans?.skips ?? 0);
    const correctRate = ans
      ? Math.round((Number(ans.correct) / Math.max(1, attempts)) * 100)
      : null;

    let diff = "Medium";
    if (attempts > 0) {
      const skipRate = skips / attempts;
      if (skipRate >= 0.3) diff = "Hard";
      else if (skipRate <= 0.1) diff = "Easy";
    }

    return {
      ...q,
      attempts,
      correctRate,
      skips,
      diff,
      options: optsMap.get(q.id) ?? [],
    };
  });

  return c.json({ success: true, data: { questions: enriched, total, page, limit } });
});

// --- POST /api/admin/questions ---------------------------------------------------------------------------
const createQuestionSchema = z.object({
  subjectId: z.string().uuid(),
  examId: z.string().uuid(),
  year: z.number().int().optional(),
  topic: z.string().optional(),
  body: z.string().min(1),
  imageUrl: z.string().url().optional(),
  creditCost: z.number().int().min(1).default(1),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        body: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2),
  explanation: z.string().optional(),
});

admin.post("/questions", zValidator("json", createQuestionSchema), async (c) => {
  const db = createDb(c.env);
  const body = c.req.valid("json");

  const [q] = await db
    .insert(questions)
    .values({
      subjectId: body.subjectId,
      examId: body.examId,
      year: body.year,
      topic: body.topic,
      body: body.body,
      imageUrl: body.imageUrl,
      creditCost: body.creditCost,
      // âœ… inlined â€” no longer a separate explanations table
      explanationBody: body.explanation,
    })
    .returning();

  await db.insert(options).values(
    body.options.map((o) => ({ questionId: q.id, label: o.label, body: o.body, isCorrect: o.isCorrect }))
  );

  return c.json({ success: true, data: q }, 201);
});

// --- PUT /api/admin/questions/:id ---------------------------------------------
admin.put("/questions/:id", zValidator("json", createQuestionSchema), async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const [q] = await db
    .update(questions)
    .set({
      subjectId: body.subjectId,
      examId: body.examId,
      year: body.year,
      topic: body.topic,
      body: body.body,
      imageUrl: body.imageUrl,
      creditCost: body.creditCost,
      explanationBody: body.explanation,
    })
    .where(eq(questions.id, id))
    .returning();

  if (!q) {
    return c.json({ success: false, error: { message: "Question not found" } }, 404);
  }

  // Delete existing options and insert the updated ones
  await db.delete(options).where(eq(options.questionId, id));
  await db.insert(options).values(
    body.options.map((o) => ({ questionId: id, label: o.label, body: o.body, isCorrect: o.isCorrect }))
  );

  return c.json({ success: true, data: q });
});

// --- DELETE /api/admin/questions/:id ---------------------------------------------------------------â”€
admin.delete("/questions/:id", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  await db.delete(questions).where(eq(questions.id, id));
  return c.json({ success: true, message: "Question deleted" });
});

// --- GET /api/admin/exams ---------------------------------------------------------------------------------â”€
admin.get("/exams", async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select({
      id: exams.id,
      name: exams.name,
      type: exams.type,
      questionCount: count(questions.id),
    })
    .from(exams)
    .leftJoin(questions, eq(questions.examId, exams.id))
    .groupBy(exams.id, exams.name, exams.type)
    .orderBy(exams.name);

  return c.json({ success: true, data: rows });
});

// --- POST /api/admin/exams ---------------------------------------------------------------------------------â”€
const createExamSchema = z.object({
  name: z.string().min(1),
  type: z.enum(examTypeEnum.enumValues),
});

admin.post("/exams", zValidator("json", createExamSchema), async (c) => {
  const db = createDb(c.env);
  const { name, type } = c.req.valid("json");
  const adminUser = c.get("user");

  // Case-insensitive check
  const existing = await db
    .select()
    .from(exams)
    .where(sql`lower(${exams.name}) = lower(${name.trim()})`)
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: `Exam "${existing[0].name}" already exists.` }, 400);
  }

  const [newExam] = await db.insert(exams).values({ 
    name: name.trim(), 
    type 
  }).returning();
  
  await audit(db, adminUser.email, adminUser.id, "create_exam", "exams", newExam.id, { name: newExam.name });

  return c.json({ success: true, data: newExam });
});

// --- GET /api/admin/exams/deduplicate ---------------------------------------------------------------------
// Merges exams with same name (case-insensitive)
admin.get("/exams/deduplicate", async (c) => {
  const db = createDb(c.env);
  const allExams = await db.select().from(exams);
  
  const groups = new Map<string, typeof allExams>();
  allExams.forEach(e => {
    const key = e.name.toLowerCase().trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  });

  let mergedCount = 0;
  for (const [key, list] of groups.entries()) {
    if (list.length > 1) {
      // Pick master (longest name or first)
      const master = list.sort((a, b) => b.name.length - a.name.length)[0];
      const dups = list.filter(e => e.id !== master.id);
      
      for (const dup of dups) {
        // Move questions
        await db.update(questions).set({ examId: master.id }).where(eq(questions.examId, dup.id));
        // Move subjects
        await db.update(subjects).set({ examId: master.id }).where(eq(subjects.examId, dup.id));
        // Delete dup
        await db.delete(exams).where(eq(exams.id, dup.id));
        mergedCount++;
      }
    }
  }

  return c.json({ success: true, merged: mergedCount });
});

// --- GET /api/admin/subjects ------------------------------------------------──
admin.get("/subjects", async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select({
      id: subjects.id,
      name: subjects.name,
      examId: subjects.examId,
      examName: exams.name,
      questionCount: count(questions.id),
    })
    .from(subjects)
    .leftJoin(exams, eq(subjects.examId, exams.id))
    .leftJoin(questions, eq(questions.subjectId, subjects.id))
    .groupBy(subjects.id, subjects.name, subjects.examId, exams.name)
    .orderBy(subjects.name);

  return c.json({ success: true, data: rows });
});

// --- GET /api/admin/subjects/deduplicate ---------------------------------------------------------------------
// Merges subjects with same name (case-insensitive) within same exam
admin.get("/subjects/deduplicate", async (c) => {
  const db = createDb(c.env);
  const allSubjects = await db.select().from(subjects);
  
  const groups = new Map<string, typeof allSubjects>();
  allSubjects.forEach(s => {
    const key = `${s.examId}-${s.name.toLowerCase().trim()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  });

  let mergedCount = 0;
  for (const [key, list] of groups.entries()) {
    if (list.length > 1) {
      // Pick master (first one)
      const master = list[0];
      const dups = list.filter(s => s.id !== master.id);
      
      for (const dup of dups) {
        // Move questions
        await db.update(questions).set({ subjectId: master.id }).where(eq(questions.subjectId, dup.id));
        // Delete dup
        await db.delete(subjects).where(eq(subjects.id, dup.id));
        mergedCount++;
      }
    }
  }

  return c.json({ success: true, merged: mergedCount });
});

// --- POST /api/admin/subjects ------------------------------------------------------------------------------â”€
const createSubjectSchema = z.object({
  name: z.string().min(1),
  examId: z.string().uuid(),
});

admin.post("/subjects", zValidator("json", createSubjectSchema), async (c) => {
  const db = createDb(c.env);
  const { name, examId } = c.req.valid("json");
  const adminUser = c.get("user");

  // Case-insensitive check
  const existing = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.examId, examId), sql`lower(${subjects.name}) = lower(${name.trim()})`))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: `Course "${existing[0].name}" already exists for this exam.` }, 400);
  }

  const [newSub] = await db.insert(subjects).values({ 
    name: name.trim(), 
    examId 
  }).returning();
  
  await audit(db, adminUser.email, adminUser.id, "create_subject", "subjects", newSub.id, { name: newSub.name });

  return c.json({ success: true, data: newSub });
});

// --- GET /api/admin/analytics ---------------------------------------------------------------------------â”€
// Powers: admin/analytics page â€” platform-wide stats
const analyticsQuery = z.object({
  days: z.coerce.number().default(30),
});

admin.get("/analytics", zValidator("query", analyticsQuery), async (c) => {
  const db = createDb(c.env);
  const { days } = c.req.valid("query");
  const since = new Date(Date.now() - days * 86_400_000);

  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [newUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(sql`created_at >= ${since}`);

  const [sessionsTotal] = await db.select({ count: count() }).from(practiceSessions);
  const [sessionsPeriod] = await db
    .select({ count: count() })
    .from(practiceSessions)
    .where(sql`started_at >= ${since}`);

  // Average score across completed sessions
  const [avgScore] = await db
    .select({
      avg: sql<number>`round(avg(correct_count::float / nullif(total_questions,0) * 100))`,
    })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.status, "completed"), sql`completed_at >= ${since}`));

  // Pass rate (>=50%) for period
  const [passRate] = await db
    .select({
      rate: sql<number>`round(
        100.0 * count(*) filter (
          where correct_count::float / nullif(total_questions,0) >= 0.5
        ) / nullif(count(*), 0)
      )`,
    })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.status, "completed"), sql`completed_at >= ${since}`));

  // Avg time per answer (seconds)
  const [avgTime] = await db
    .select({ avg: sql<number>`round(avg(time_spent_secs))` })
    .from(practiceAnswers)
    .where(sql`answered_at >= ${since}`);

  // Total questions answered in period
  const [questionsAnswered] = await db
    .select({ count: count() })
    .from(practiceAnswers)
    .where(sql`answered_at >= ${since}`);

  // Subject accuracy breakdown
  const subjectAccuracy = await db
    .select({
      subject: subjects.name,
      attempts: count(practiceAnswers.id),
      correct: sql<number>`sum(case when ${practiceAnswers.isCorrect} then 1 else 0 end)`,
      accuracy: sql<number>`round(100.0 * sum(case when ${practiceAnswers.isCorrect} then 1 else 0 end) / nullif(count(${practiceAnswers.id}),0))`,
    })
    .from(practiceAnswers)
    .leftJoin(questions, eq(practiceAnswers.questionId, questions.id))
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .where(sql`${practiceAnswers.answeredAt} >= ${since}`)
    .groupBy(subjects.name)
    .orderBy(desc(count(practiceAnswers.id)));

  // Exam pass rates
  const examPassRates = await db
    .select({
      exam: exams.name,
      examType: exams.type,
      sessions: count(practiceSessions.id),
      passRate: sql<number>`round(
        100.0 * count(*) filter (
          where ${practiceSessions.correctCount}::float / nullif(${practiceSessions.totalQuestions},0) >= 0.5
        ) / nullif(count(${practiceSessions.id}),0)
      )`,
    })
    .from(practiceSessions)
    .leftJoin(exams, eq(practiceSessions.examId, exams.id))
    .where(sql`${practiceSessions.startedAt} >= ${since}`)
    .groupBy(exams.id, exams.name, exams.type);

  // Most-failed questions (lowest correct rate, min 10 attempts)
  const hardestQuestions = await db
    .select({
      id: questions.id,
      body: questions.body,
      subject: subjects.name,
      attempts: count(practiceAnswers.id),
      failRate: sql<number>`round(
        100.0 * sum(case when NOT ${practiceAnswers.isCorrect} then 1 else 0 end)
        / nullif(count(${practiceAnswers.id}),0)
      )`,
    })
    .from(practiceAnswers)
    .leftJoin(questions, eq(practiceAnswers.questionId, questions.id))
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .where(sql`${practiceAnswers.answeredAt} >= ${since}`)
    .groupBy(questions.id, questions.body, subjects.name)
    .having(sql`count(${practiceAnswers.id}) >= 5`)
    .orderBy(
      desc(
        sql`round(
          100.0 * sum(case when NOT ${practiceAnswers.isCorrect} then 1 else 0 end)
          / nullif(count(${practiceAnswers.id}),0)
        )`
      )
    )
    .limit(10);

  // Avg credit transaction value (revenue / count) for period
  const [txStats] = await db
    .select({
      total: sql<number>`coalesce(sum(amount_ngn), 0)`,
      txCount: count(),
    })
    .from(creditTransactions)
    .where(and(eq(creditTransactions.status, "success"), sql`created_at >= ${since}`));

  // Registration growth vs prior period
  const priorStart = new Date(since.getTime() - days * 86_400_000);
  const [priorUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(sql`created_at >= ${priorStart} and created_at < ${since}`);

  const curNew   = newUsers.count;
  const prevNew  = priorUsers.count;
  const growthPct = prevNew > 0 ? Math.round(((curNew - prevNew) / prevNew) * 100) : 0;
  const dailyAvgNew = Math.round(curNew / days);

  const avgTransactionValue = txStats.txCount > 0
    ? Math.round(Number(txStats.total) / txStats.txCount)
    : 0;

  // Exam distribution — total sessions per exam type (for bubble chart)
  const examDistribution = await db
    .select({
      examType: exams.type,
      sessions: count(practiceSessions.id),
    })
    .from(practiceSessions)
    .leftJoin(exams, eq(practiceSessions.examId, exams.id))
    .where(sql`${practiceSessions.startedAt} >= ${since}`)
    .groupBy(exams.type)
    .orderBy(desc(count(practiceSessions.id)));

  const totalDistSessions = examDistribution.reduce((a, r) => a + r.sessions, 0);

  // Time-series trends (daily) for the chart views
  const trendDays = Array.from({ length: days }, (_, i) => {
    const d = new Date(since.getTime() + i * 86_400_000);
    return {
      date: d.toISOString().split('T')[0],
      newUsers: 0,
      sessions: 0,
      revenue: 0,
    };
  });

  const [trendUsers, trendSessions, trendRevenue] = await Promise.all([
    db.select({ date: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`, count: count() })
      .from(users).where(sql`${users.createdAt} >= ${since}`).groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`),
    db.select({ date: sql<string>`to_char(${practiceSessions.startedAt}, 'YYYY-MM-DD')`, count: count() })
      .from(practiceSessions).where(sql`${practiceSessions.startedAt} >= ${since}`).groupBy(sql`to_char(${practiceSessions.startedAt}, 'YYYY-MM-DD')`),
    db.select({ date: sql<string>`to_char(${creditTransactions.createdAt}, 'YYYY-MM-DD')`, revenue: sql<number>`sum(${creditTransactions.amountNgn})` })
      .from(creditTransactions).where(and(eq(creditTransactions.status, "success"), sql`${creditTransactions.createdAt} >= ${since}`)).groupBy(sql`to_char(${creditTransactions.createdAt}, 'YYYY-MM-DD')`)
  ]);

  const trends = trendDays.map(t => {
    const u = trendUsers.find(x => x.date === t.date);
    const s = trendSessions.find(x => x.date === t.date);
    const r = trendRevenue.find(x => x.date === t.date);
    return {
      date: t.date,
      newUsers: u ? Number(u.count) : 0,
      sessions: s ? Number(s.count) : 0,
      revenue: r ? Number(r.revenue) : 0,
    };
  });

  return c.json({
    success: true,
    data: {
      period: days,
      kpi: {
        totalUsers: totalUsers.count,
        newUsers: newUsers.count,
        totalSessions: sessionsTotal.count,
        periodSessions: sessionsPeriod.count,
        avgScore: Number(avgScore.avg ?? 0),
        passRate: Number(passRate.rate ?? 0),
        avgTimeSecs: Number(avgTime.avg ?? 0),
        questionsAnswered: questionsAnswered.count,
        avgTransactionValue,
        registrationGrowthPct: growthPct,
        dailyAvgNew,
      },
      subjectAccuracy,
      examPassRates,
      hardestQuestions,
      examDistribution,
      totalDistSessions,
      trends,
    },
  });
});

// --- GET /api/admin/notifications ---------------------------------------------------------------------â”€
// Powers: admin/notifications page â€” platform-wide notification log
const notifQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(2000).default(30),
  type: z.enum(["credit", "referral", "session", "system"]).optional(),
  unread: z.enum(["true", "false"]).optional(),
});

admin.get("/notifications", zValidator("query", notifQuery), async (c) => {
  const db = createDb(c.env);
  const { page, limit, type, unread } = c.req.valid("query");
  const offset = (page - 1) * limit;

  const filters: any[] = [];
  if (type) filters.push(eq(notifications.type, type));
  if (unread === "true") filters.push(eq(notifications.isRead, false));

  const rows = await db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.userId, users.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(notifications)
    .where(filters.length ? and(...filters) : undefined);

  return c.json({ success: true, data: { notifications: rows, total, page, limit } });
});

// ── GET /api/admin/notifications/stats ---------------------------------------──
// Powers: delivery stats panel on admin/notifications page
admin.get("/notifications/stats", async (c) => {
  const db = createDb(c.env);

  const [totalRow, unreadRow, creditRow, referralRow, sessionRow, systemRow] = await Promise.all([
    db.select({ count: count() }).from(notifications),
    db.select({ count: count() }).from(notifications).where(eq(notifications.isRead, false)),
    db.select({ count: count() }).from(notifications).where(eq(notifications.type, "credit")),
    db.select({ count: count() }).from(notifications).where(eq(notifications.type, "referral")),
    db.select({ count: count() }).from(notifications).where(eq(notifications.type, "session")),
    db.select({ count: count() }).from(notifications).where(eq(notifications.type, "system")),
  ]);

  const total    = totalRow[0]?.count    ?? 0;
  const unread   = unreadRow[0]?.count   ?? 0;
  const read     = total - unread;
  const openRate = total > 0 ? Math.round((read / total) * 100) : 0;

  return c.json({
    success: true,
    data: {
      total,
      unread,
      openRate,
      byType: {
        credit:   creditRow[0]?.count   ?? 0,
        referral: referralRow[0]?.count ?? 0,
        session:  sessionRow[0]?.count  ?? 0,
        system:   systemRow[0]?.count   ?? 0,
      },
    },
  });
});

// --- POST /api/admin/notifications/broadcast ------------------------------------------------------
// Send a system notification to all users (or a subset)
const broadcastSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  userIds: z.array(z.string()).optional(), // empty = all users
});

admin.post("/notifications/broadcast", zValidator("json", broadcastSchema), async (c) => {
  const db = createDb(c.env);
  const { title, message, userIds } = c.req.valid("json");

  let targets: string[];
  if (userIds && userIds.length > 0) {
    targets = userIds;
  } else {
    const all = await db.select({ id: users.id }).from(users);
    targets = all.map((u) => u.id);
  }

  if (targets.length === 0)
    return c.json({ success: false, message: "No users to notify" }, 400);

  // Batch insert in chunks of 500 to avoid param limits
  const CHUNK = 500;
  for (let i = 0; i < targets.length; i += CHUNK) {
    await db.insert(notifications).values(
      targets.slice(i, i + CHUNK).map((uid) => ({
        userId: uid,
        type: "system" as const,
        title,
        message,
      }))
    );
  }

  return c.json({ success: true, data: { sent: targets.length } });
});

// --- GET /api/admin/media ---------------------------------------------------------------------------------â”€
// Powers: admin/media page â€” list R2 objects with orphan detection
admin.get("/media", async (c) => {
  const bucket = c.env.QUESTION_IMAGES;
  if (!bucket) {
    return c.json({ success: false, message: "R2 bucket not configured" }, 503);
  }

  const listed = await bucket.list();

  // Collect all imageUrls referenced by questions
  const db = createDb(c.env);
  const refs = await db.select({ imageUrl: questions.imageUrl }).from(questions);
  const referencedKeys = new Set(refs.map((r) => r.imageUrl).filter(Boolean));

  const objects = listed.objects.map((obj) => ({
    key: obj.key,
    name: obj.key.split("/").pop() ?? obj.key,
    size: obj.size,
    uploadedAt: obj.uploaded,
    etag: obj.etag,
    httpMetadata: obj.httpMetadata,
    // imageUrl in DB is '/images/<key>' for flat keys or '/images/images/<key>' for legacy
    orphan: !referencedKeys.has(`/images/${obj.key}`) && !referencedKeys.has(obj.key),
  }));

  return c.json({
    success: true,
    data: {
      objects,
      total: objects.length,
      orphans: objects.filter((o) => o.orphan).length,
    },
  });
});

// --- DELETE /api/admin/media/:key ---------------------------------------------------------------------â”€
admin.delete("/media/:key{.+}", async (c) => {
  const bucket = c.env.QUESTION_IMAGES;
  if (!bucket) return c.json({ success: false, message: "R2 bucket not configured" }, 503);

  const key = c.req.param("key");
  await bucket.delete(key);
  return c.json({ success: true, message: `Deleted ${key}` });
});

// --- GET /api/admin/credits/packages ---------------------------------------------------------------â”€
admin.get("/credits/packages", async (c) => {
  const db = createDb(c.env);
  const packages = await db.select().from(creditPackages).orderBy(creditPackages.credits);
  return c.json({ success: true, data: packages });
});

// --- POST /api/admin/users/:id/suspend ------------------------------------------------------------
// Toggle active â†” suspended without touching emailVerified
admin.post("/users/:id/suspend", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const adminUser = c.get("user");
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) return c.json({ success: false, message: "User not found" }, 404);
  const newStatus = user.status === "suspended" ? "active" : "suspended";
  await db.update(users).set({ status: newStatus, updatedAt: new Date() }).where(eq(users.id, id));
  await audit(db, adminUser.email, adminUser.id, `user.${newStatus}`, "user", id);
  return c.json({ success: true, data: { status: newStatus } });
});

// --- PATCH /api/admin/questions/:id ---------------------------------------------------------------â”€
const patchQuestionSchema = z.object({
  body: z.string().min(1).optional(),
  topic: z.string().optional(),
  year: z.number().int().optional(),
  imageUrl: z.string().url().nullable().optional(),
  creditCost: z.number().int().min(1).optional(),
  explanation: z.string().optional(),
  subjectId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
});

admin.patch("/questions/:id", zValidator("json", patchQuestionSchema), async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const input = c.req.valid("json");
  const adminUser = c.get("user");
  const { explanation, ...rest } = input;
  await db.update(questions).set({
    ...rest,
    ...(explanation !== undefined ? { explanationBody: explanation } : {}),
  }).where(eq(questions.id, id));
  await audit(db, adminUser.email, adminUser.id, "question.update", "question", id, input);
  return c.json({ success: true, message: "Question updated" });
});

// --- POST /api/admin/questions/import ------------------------------------------------------------â”€
// Accepts a pre-parsed JSON array (frontend parses the CSV file)
const importRowSchema = z.object({
  question: z.string().min(1),
  // Allow empty strings for options (non-MCQ rows won't have them)
  opt_a: z.string().optional().transform(v => v || undefined),
  opt_b: z.string().optional().transform(v => v || undefined),
  opt_c: z.string().optional().transform(v => v || undefined),
  opt_d: z.string().optional().transform(v => v || undefined),
  // correct can be empty for theory questions
  correct: z.string().optional().default(""),
  subject: z.string().optional().transform(v => v || undefined),
  exam:    z.string().optional().transform(v => v || undefined),
  year: z.coerce.number().int().optional().catch(undefined),
  explanation: z.string().optional().transform(v => v || undefined),
  credit_cost: z.coerce.number().int().min(1).default(1).catch(1),
});

const importSchema = z.object({
  rows: z.array(importRowSchema).min(1).max(500),
  defaultSubjectId: z.string().uuid(),
  defaultExamId: z.string().uuid(),
});

admin.post("/questions/import", zValidator("json", importSchema), async (c) => {
  const db = createDb(c.env);
  const { rows, defaultSubjectId, defaultExamId } = c.req.valid("json");
  const adminUser = c.get("user");

  const allSubjects = await db.select({ id: subjects.id, name: subjects.name }).from(subjects);
  const allExams = await db.select({ id: exams.id, name: exams.name, type: exams.type }).from(exams);
  const subjectMap = new Map(allSubjects.map((s) => [s.name.toLowerCase(), s.id]));
  const examMap = new Map<string, string>();
  allExams.forEach((e) => {
    examMap.set(e.name.toLowerCase(), e.id);
    if (e.type) examMap.set(e.type.toLowerCase(), e.id);
  });

  let inserted = 0;
  const errors: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      let subjectId = row.subject ? subjectMap.get(row.subject.toLowerCase()) : null;
      if (row.subject && !subjectId) {
        // Auto-create subject if missing
        const [newSub] = await db.insert(subjects).values({ 
          name: row.subject.trim(), 
          examId: defaultExamId 
        }).returning();
        subjectId = newSub.id;
        subjectMap.set(row.subject.toLowerCase(), subjectId);
      }
      subjectId = subjectId ?? defaultSubjectId;

      const examId = (row.exam ? examMap.get(row.exam.toLowerCase()) : null) ?? defaultExamId;
      const [q] = await db.insert(questions).values({
        subjectId, examId, body: row.question,
        year: row.year, creditCost: row.credit_cost, explanationBody: row.explanation,
      }).returning();
      const opts: { questionId: string; label: string; body: string; isCorrect: boolean }[] = [];
      const labelMap: Record<string, string | undefined> = { A: row.opt_a, B: row.opt_b, C: row.opt_c, D: row.opt_d };
      const correctUpper = row.correct.toUpperCase();
      for (const [label, body] of Object.entries(labelMap)) {
        if (body) opts.push({ questionId: q.id, label, body, isCorrect: label === correctUpper });
      }
      if (opts.length > 0) await db.insert(options).values(opts);
      inserted++;
    } catch (err: any) {
      errors.push({ row: i + 1, error: err.message });
    }
  }
  await audit(db, adminUser.email, adminUser.id, "question.import", undefined, undefined, { inserted, errors: errors.length });
  return c.json({ success: true, data: { inserted, errors } });
});

// --- PATCH /api/admin/notifications/:id ---------------------------------------------------------â”€
admin.patch("/notifications/:id", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const raw = await c.req.json().catch(() => null);
  const isRead = (raw && typeof raw === "object" && "isRead" in raw)
    ? Boolean((raw as Record<string, unknown>).isRead)
    : true;
  await db.update(notifications).set({ isRead }).where(eq(notifications.id, id));
  return c.json({ success: true });
});

// --- DELETE /api/admin/notifications/:id ---------------------------------------------------------
admin.delete("/notifications/:id", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  await db.delete(notifications).where(eq(notifications.id, id));
  return c.json({ success: true });
});

// --- POST /api/admin/media ------------------------------------------------------------------------------â”€
// Direct upload to R2 via multipart/form-data.
// Preserves original filename so naming conventions (e.g. <questionId>.jpg) work.
admin.post("/media", async (c) => {
  const bucket = c.env.QUESTION_IMAGES;
  if (!bucket) return c.json({ success: false, message: "R2 bucket not configured" }, 503);

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ success: false, message: "No file provided" }, 400);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const allowed = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  if (!allowed.includes(ext)) return c.json({ success: false, message: `File type .${ext} not allowed` }, 400);
  if (file.size > 5 * 1024 * 1024) return c.json({ success: false, message: "File exceeds 5 MB limit" }, 400);

  // Store the file under just the safe filename (no folder prefix).
  // The /images/:path route resolves it correctly from R2.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = safeName; // R2 key: just the filename

  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

  const adminUser = c.get("user");
  const db = createDb(c.env);
  await audit(db, adminUser.email, adminUser.id, "media.upload", "media", key);

  return c.json({ success: true, data: { key, url: `/images/${key}`, size: file.size } }, 201);
});

// --- DELETE /api/admin/media/:key -----------------------------------------------------------------------
// Delete a specific image from R2 by its key
admin.delete("/media/:key", async (c) => {
  const bucket = c.env.QUESTION_IMAGES;
  if (!bucket) return c.json({ success: false, message: "R2 bucket not configured" }, 503);

  const key = c.req.param("key");
  const db = createDb(c.env);
  const adminUser = c.get("user");

  await bucket.delete(key);
  await audit(db, adminUser.email, adminUser.id, "media.delete", "media", key);

  return c.json({ success: true, data: { deleted: true } });
});

// --- POST /api/admin/media/sync -------------------------------------------------------------------------
// Parses filenames using the convention:
//   {Subject}_{Exam}_{Year}_{number_words...}.ext
// Examples:
//   Physics_jamb_2000_thirty_three.png  -> Physics, JAMB, 2000, question #33
//   biology_jamb_2010_six_seven.png     -> Biology, JAMB, 2010, questions #6 AND #7
//
// Number-word rules:
//   - A "tens" word immediately followed by a "units" word = compound number (thirty_three = 33)
//   - Any other sequence of number words = separate question positions (six_seven = 6, 7)
admin.post("/media/sync", async (c) => {
  const bucket = c.env.QUESTION_IMAGES;
  if (!bucket) return c.json({ success: false, message: "R2 bucket not configured" }, 503);

  const db = createDb(c.env);
  const adminUser = c.get("user");

  // ── Number-word helpers ────────────────────────────────────────────────────
  const wordToNum: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, // "fourty" alias
    sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  };
  const tensEntries: [string, number][] = [
    ["twenty",20],["thirty",30],["forty",40],["fourty",40],
    ["fifty",50],["sixty",60],["seventy",70],["eighty",80],["ninety",90],
  ];
  const unitEntries: [string, number][] = [
    ["one",1],["two",2],["three",3],["four",4],["five",5],
    ["six",6],["seven",7],["eight",8],["nine",9],
  ];
  const tensSet  = new Set(tensEntries.map(([w]) => w));
  const unitsSet = new Set(unitEntries.map(([w]) => w));

  // Pre-built map for fused compound words like "fourtytwo" (no underscore)
  // Covers correct spellings and the common "fourty" misspelling.
  const fusedMap: Record<string, number> = {};
  for (const [t, tv] of tensEntries) {
    for (const [u, uv] of unitEntries) {
      fusedMap[t + u] = tv + uv; // e.g. "fourtytwo" → 42
    }
  }

  function parseQuestionNumbers(tokens: string[]): number[] {
    const out: number[] = [];
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i].toLowerCase();
      // Skip separator words like 'and'
      if (t === "and") { i++; continue; }
      // Fused compound first: "fourtytwo", "twentyone", etc.
      if (fusedMap[t] !== undefined) { out.push(fusedMap[t]); i++; continue; }
      if (wordToNum[t] === undefined) { i++; continue; }
      // Split compound: tens word followed (possibly over 'and') by a units word
      // e.g. thirty_three = 33, fourty_five = 45
      let nextIdx = i + 1;
      while (nextIdx < tokens.length && tokens[nextIdx].toLowerCase() === "and") nextIdx++;
      if (tensSet.has(t) && nextIdx < tokens.length && unitsSet.has(tokens[nextIdx].toLowerCase())) {
        out.push(wordToNum[t] + wordToNum[tokens[nextIdx].toLowerCase()]);
        i = nextIdx + 1;
      } else {
        out.push(wordToNum[t]);
        i++;
      }
    }
    return out;
  }

  function parseFilename(stem: string): { subject: string; exam: string; year: number; positions: number[] } | null {
    // Split on underscore; stem already has no extension
    const parts = stem.split("_");
    // Find the first 4-digit year token
    const yearIdx = parts.findIndex((p) => /^\d{4}$/.test(p));
    if (yearIdx < 2) return null; // Need at least subject + exam before year
    const subject   = parts.slice(0, yearIdx - 1).join(" "); // everything before exam
    const exam      = parts[yearIdx - 1];                    // token just before year
    const year      = Number(parts[yearIdx]);
    const numTokens = parts.slice(yearIdx + 1);
    const positions = parseQuestionNumbers(numTokens);
    if (positions.length === 0) return null;
    return { subject, exam, year, positions };
  }

  // ── Main sync loop ─────────────────────────────────────────────────────────
  const listed = await bucket.list();

  let linked = 0;
  let alreadyLinked = 0;
  let unmatched = 0;
  const errors: string[] = [];

  for (const obj of listed.objects) {
    const filename = obj.key.split("/").pop() ?? obj.key;
    const stem = filename.replace(/\.[^.]+$/, ""); // strip extension
    const parsed = parseFilename(stem);

    if (!parsed) { unmatched++; continue; }

    const { subject, exam, year, positions } = parsed;
    const imageUrl = `/images/${obj.key}`;

    // Fetch all questions for this subject + exam + year, ordered consistently
    const matchingQs = await db
      .select({ id: questions.id, imageUrl: questions.imageUrl })
      .from(questions)
      .leftJoin(subjects, eq(questions.subjectId, subjects.id))
      .leftJoin(exams,    eq(questions.examId, exams.id))
      .where(
        and(
          sql`lower(${subjects.name}) = lower(${subject.trim()})`,
          sql`lower(${exams.name}) = lower(${exam.trim()})`,
          eq(questions.year, year),
        )
      )
      .orderBy(questions.createdAt);

    if (matchingQs.length === 0) {
      errors.push(`No questions found for ${subject}/${exam}/${year}`);
      unmatched++;
      continue;
    }

    let anyLinked = false;
    for (const pos of positions) {
      const q = matchingQs[pos - 1]; // 1-based → 0-based index
      if (!q) {
        errors.push(`${stem}: position #${pos} out of range (only ${matchingQs.length} questions)`);
        continue;
      }
      if (q.imageUrl === imageUrl) { alreadyLinked++; continue; }
      await db.update(questions).set({ imageUrl }).where(eq(questions.id, q.id));
      linked++;
      anyLinked = true;
    }
    if (!anyLinked && positions.every((p) => matchingQs[p - 1]?.imageUrl === imageUrl)) {
      // all were already linked — counted above
    }
  }

  await audit(db, adminUser.email, adminUser.id, "media.sync", undefined, undefined, { linked, alreadyLinked, unmatched, errors: errors.length });
  return c.json({ success: true, data: { linked, alreadyLinked, unmatched, errors } });
});

// --- DELETE /api/admin/media/orphans ---------------------------------------------------------------
// Bulk-delete all R2 objects not referenced by any question
admin.delete("/media/orphans", async (c) => {
  const bucket = c.env.QUESTION_IMAGES;
  if (!bucket) return c.json({ success: false, message: "R2 bucket not configured" }, 503);

  const db = createDb(c.env);
  const adminUser = c.get("user");
  const listed = await bucket.list();
  const refs = await db.select({ imageUrl: questions.imageUrl }).from(questions);
  const refSet = new Set(refs.map((r) => r.imageUrl).filter(Boolean));

  const orphans = listed.objects.filter(
    (obj) => !refSet.has(`/images/${obj.key}`) && !refSet.has(obj.key),
  );

  await Promise.all(orphans.map((obj) => bucket.delete(obj.key)));
  await audit(db, adminUser.email, adminUser.id, "media.orphans_deleted", undefined, undefined, { count: orphans.length });
  return c.json({ success: true, data: { deleted: orphans.length } });
});

// --- DELETE /api/admin/media/all -------------------------------------------------------------------
// Wipe every image from the R2 bucket and clear imageUrl on all questions.
admin.delete("/media/all", async (c) => {
  const bucket = c.env.QUESTION_IMAGES;
  if (!bucket) return c.json({ success: false, message: "R2 bucket not configured" }, 503);

  const db = createDb(c.env);
  const adminUser = c.get("user");

  const listed = await bucket.list();
  await Promise.all(listed.objects.map((obj) => bucket.delete(obj.key)));

  // Clear imageUrl from all questions so the bank doesn't show broken links
  await db.update(questions).set({ imageUrl: null });

  await audit(db, adminUser.email, adminUser.id, "media.clear_all", undefined, undefined, { deleted: listed.objects.length });
  return c.json({ success: true, data: { deleted: listed.objects.length } });
});

// --- GET /api/admin/settings ---------------------------------------------------------------------------â”€
admin.get("/settings", async (c) => {
  const db = createDb(c.env);
  const rows = await db.select().from(platformSettings);
  // Merge DB rows over defaults
  const merged: Record<string, unknown> = {};
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    merged[key] = def.value;
  }
  for (const row of rows) {
    merged[row.key] = row.value;
  }
  // Nest into categories
  const result: Record<string, Record<string, unknown>> = {};
  for (const [key, val] of Object.entries(merged)) {
    const [cat, ...rest] = key.split(".");
    if (!result[cat]) result[cat] = {};
    result[cat][rest.join(".")] = val;
  }
  return c.json({ success: true, data: result });
});

// --- PATCH /api/admin/settings ------------------------------------------------------------------------â”€
const settingsSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

admin.patch("/settings", zValidator("json", settingsSchema), async (c) => {
  const db = createDb(c.env);
  const { key, value } = c.req.valid("json");
  const adminUser = c.get("user");
  const [cat] = key.split(".");

  await db.insert(platformSettings)
    .values({ key, value, category: cat, updatedBy: adminUser.email })
    .onConflictDoUpdate({
      target: platformSettings.key,
      set: { value, updatedAt: new Date(), updatedBy: adminUser.email },
    });

  await audit(db, adminUser.email, adminUser.id, "settings.update", "setting", key, { value });
  return c.json({ success: true });
});

// --- POST /api/admin/credits/packages ------------------------------------------------------------â”€
const packageSchema = z.object({
  name: z.string().min(1),
  credits: z.number().int().min(1),
  priceNgn: z.number().int().min(1),
  isActive: z.boolean().default(true),
});

admin.post("/credits/packages", zValidator("json", packageSchema), async (c) => {
  const db = createDb(c.env);
  const body = c.req.valid("json");
  const adminUser = c.get("user");
  const [pkg] = await db.insert(creditPackages).values(body).returning();
  await audit(db, adminUser.email, adminUser.id, "credits.package_created", "package", pkg.id, body);
  return c.json({ success: true, data: pkg }, 201);
});

// â”€â”€ PATCH /api/admin/credits/packages/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const patchPackageSchema = z.object({
  name: z.string().min(1).optional(),
  credits: z.number().int().min(1).optional(),
  priceNgn: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

admin.patch("/credits/packages/:id", zValidator("json", patchPackageSchema), async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const adminUser = c.get("user");
  await db.update(creditPackages).set(body).where(eq(creditPackages.id, id));
  await audit(db, adminUser.email, adminUser.id, "credits.package_updated", "package", id, body);
  return c.json({ success: true });
});

// â”€â”€ DELETE /api/admin/credits/packages/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
admin.delete("/credits/packages/:id", async (c) => {
  const db = createDb(c.env);
  const id = c.req.param("id");
  const adminUser = c.get("user");
  await db.delete(creditPackages).where(eq(creditPackages.id, id));
  await audit(db, adminUser.email, adminUser.id, "credits.package_deleted", "package", id);
  return c.json({ success: true });
});

// â”€â”€ GET /api/admin/audit-logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const auditQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(30),
  action: z.string().optional(),
});

admin.get("/audit-logs", zValidator("query", auditQuery), async (c) => {
  const db = createDb(c.env);
  const { page, limit, action: actionFilter } = c.req.valid("query");
  const offset = (page - 1) * limit;
  const filters: any[] = [];
  if (actionFilter) filters.push(ilike(auditLogs.action, `%${actionFilter}%`));

  const rows = await db.select()
    .from(auditLogs)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(auditLogs)
    .where(filters.length ? and(...filters) : undefined);

  return c.json({ success: true, data: { logs: rows, total, page, limit } });
});

export default admin;
