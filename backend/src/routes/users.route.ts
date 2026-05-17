import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, desc, count, sql, and, inArray, asc } from "drizzle-orm";
import { createDb } from "../db";
import {
  users, practiceSessions, practiceAnswers,
  subjects, exams, bookmarks, bookmarkCollections,
  referrals, creditTransactions, notifications, options,
  creditPackages, questions,
} from "../db/schema";
import { requireAuth } from "../middleware/auth.middleware";
import { onboardingSchema } from "../validators/onboarding.validator";
import type { Env, Variables } from "../env";

const usersRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// ─── GET /api/users/me ────────────────────────────────────────────────────────
// Returns the full user profile for the currently authenticated user.
// emailVerified is always returned as a string "true"/"false" so
// the frontend can use strict === "true" checks safely.
usersRoute.get("/me", requireAuth, async (c) => {
  const db = createDb(c.env);
  const sessionUser = c.get("user");

  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      school: true,
      state: true,
      userType: true,
      targetExam: true,
      examLevel: true,
      targetScore: true,
      examDate: true,
      creditBalance: true,
      referralCode: true,
      createdAt: true,
    },
  });

  if (!user) {
    return c.json({ success: false, message: "User not found" }, 404);
  }

  // Use Better Auth's session boolean as the authoritative emailVerified source.
  // The session is freshly fetched from DB by requireAuth so it's always accurate.
  // We normalise to string "true"/"false" for frontend compatibility.
  const emailVerified: string =
    (sessionUser.emailVerified === true || sessionUser.emailVerified === "true")
      ? "true"
      : "false";

  // Derive isAdmin from the ADMIN_EMAILS allowlist (same logic as requireAdmin middleware).
  // Falls back to userType === "admin" when the allowlist is empty.
  const adminEmails = ((c.env.ADMIN_EMAILS ?? ""))
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = adminEmails.length > 0
    ? adminEmails.includes((user.email ?? "").toLowerCase())
    : (user.userType as string) === "admin";

  return c.json({ success: true, data: { ...user, emailVerified, isAdmin } });
});

// ─── PATCH /api/users/onboarding ─────────────────────────────────────────────
// Saves onboarding data after sign-up (before email verification).
// Called immediately after sign-up so data isn't lost even if verification
// is delayed. Dashboard guard still checks emailVerified before granting access.
usersRoute.patch(
  "/onboarding",
  requireAuth,
  zValidator("json", onboardingSchema),
  async (c) => {
    const db = createDb(c.env);
    const sessionUser = c.get("user");
    const body = c.req.valid("json");

    await db
      .update(users)
      .set({
        userType: body.userType,
        targetExam: body.targetExam,
        examLevel: body.examLevel,
        targetScore: body.targetScore,
        examDate: body.examDate,
        state: body.state,
        ...(body.phoneNumber ? { phone: body.phoneNumber } : {}),
        ...(body.avatarUrl ? { image: body.avatarUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, sessionUser.id));

    return c.json({ success: true, message: "Onboarding saved successfully" });
  }
);

// ─── GET /api/users/dashboard ────────────────────────────────────────────────
// Powers: /(app)/dashboard page — all cards driven from live DB data.
// Returns: summaryCards, recentActivity, subjectPerformance, leaderboard, examCountdown
usersRoute.get("/dashboard", requireAuth, async (c) => {
  const db = createDb(c.env);
  const sessionUser = c.get("user");
  const userId = sessionUser.id;

  // ── Fetch user profile ───────────────────────────────────────────────────
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true, name: true, creditBalance: true,
      targetExam: true, targetScore: true, examDate: true,
    },
  });
  if (!user) return c.json({ success: false, message: "User not found" }, 404);

  // ── Summary KPIs ─────────────────────────────────────────────────────────
  const [totalSessions] = await db
    .select({ total: count() })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")));

  const oneWeekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [sessionsThisWeek] = await db
    .select({ total: count() })
    .from(practiceSessions)
    .where(and(
      eq(practiceSessions.userId, userId),
      eq(practiceSessions.status, "completed"),
      sql`completed_at >= ${oneWeekAgo}`
    ));

  // Average score across all completed sessions
  const [avgScoreRow] = await db
    .select({
      avg: sql<number>`round(avg(correct_count::float / nullif(total_questions,0) * 100))`,
    })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")));

  // Previous week avg (for trend)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86_400_000);
  const [prevWeekAvg] = await db
    .select({
      avg: sql<number>`round(avg(correct_count::float / nullif(total_questions,0) * 100))`,
    })
    .from(practiceSessions)
    .where(and(
      eq(practiceSessions.userId, userId),
      eq(practiceSessions.status, "completed"),
      sql`completed_at >= ${twoWeeksAgo} AND completed_at < ${oneWeekAgo}`
    ));

  // Best score ever
  const [bestScoreRow] = await db
    .select({
      best: sql<number>`max(round(correct_count::float / nullif(total_questions,0) * 100))`,
      examId: practiceSessions.examId,
      completedAt: practiceSessions.completedAt,
    })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .groupBy(practiceSessions.examId, practiceSessions.completedAt)
    .orderBy(desc(sql`max(round(correct_count::float / nullif(total_questions,0) * 100))`))
    .limit(1);

  // ── Subject performance (per subject avg for this user vs all users) ─────
  const userSubjectPerf = await db
    .select({
      subjectId: sql<string>`(${practiceSessions.subjectIds}->>'0')::uuid`,
      correct: sql<number>`coalesce(sum(${practiceAnswers.isCorrect}::int), 0)`,
      total: sql<number>`coalesce(count(${practiceAnswers.id}), 0)`,
    })
    .from(practiceAnswers)
    .innerJoin(practiceSessions, eq(practiceAnswers.sessionId, practiceSessions.id))
    .where(and(
      eq(practiceSessions.userId, userId),
      eq(practiceSessions.status, "completed"),
    ))
    .groupBy(sql`(${practiceSessions.subjectIds}->>'0')::uuid`);

  // Get subject names
  const subjectIds = userSubjectPerf.map(r => r.subjectId).filter(Boolean);
  const subjectRecords = subjectIds.length > 0
    ? await db.select({ id: subjects.id, name: subjects.name }).from(subjects)
        .where(inArray(subjects.id, subjectIds))
    : [];
  const subjectMap = new Map(subjectRecords.map(s => [s.id, s.name]));

  // Platform avg per subject
  const platformSubjectPerf = subjectIds.length > 0
    ? await db
        .select({
          subjectId: sql<string>`(${practiceSessions.subjectIds}->>'0')::uuid`,
          correct: sql<number>`coalesce(sum(${practiceAnswers.isCorrect}::int), 0)`,
          total: sql<number>`coalesce(count(${practiceAnswers.id}), 0)`,
        })
        .from(practiceAnswers)
        .innerJoin(practiceSessions, eq(practiceAnswers.sessionId, practiceSessions.id))
        .where(and(
          eq(practiceSessions.status, "completed"),
          sql`(${practiceSessions.subjectIds}->>'0')::uuid = ANY(${subjectIds})`
        ))
        .groupBy(sql`(${practiceSessions.subjectIds}->>'0')::uuid`)
    : [];

  const platformMap = new Map(
    platformSubjectPerf.map(r => [r.subjectId, Math.round((Number(r.correct) / Math.max(1, Number(r.total))) * 100)])
  );

  const subjectPerformance = userSubjectPerf
    .filter(r => r.subjectId && subjectMap.has(r.subjectId))
    .map(r => ({
      subject: subjectMap.get(r.subjectId) ?? "Unknown",
      userScore: Math.round((Number(r.correct) / Math.max(1, Number(r.total))) * 100),
      avgScore: platformMap.get(r.subjectId) ?? 0,
    }))
    .slice(0, 6);

  // ── Recent sessions (activity feed) ─────────────────────────────────────
  const recentSessions = await db
    .select({
      id: practiceSessions.id,
      examId: practiceSessions.examId,
      subjectIds: practiceSessions.subjectIds,
      totalQuestions: practiceSessions.totalQuestions,
      correctCount: practiceSessions.correctCount,
      status: practiceSessions.status,
      completedAt: practiceSessions.completedAt,
      startedAt: practiceSessions.startedAt,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .orderBy(desc(practiceSessions.startedAt))
    .limit(10);

  // Resolve exam names for the recent sessions
  const sessionExamIds = [...new Set(recentSessions.map(s => s.examId))];
  const examRecords = sessionExamIds.length > 0
    ? await db.select({ id: exams.id, name: exams.name, type: exams.type }).from(exams)
        .where(inArray(exams.id, sessionExamIds))
    : [];
  const examMap = new Map(examRecords.map(e => [e.id, e]));

  // Resolve first subject per session
  const allSubjectIds = [...new Set(
    recentSessions
      .flatMap(s => (Array.isArray(s.subjectIds) ? s.subjectIds as string[] : []))
      .filter(Boolean)
  )];
  const allSubjects = allSubjectIds.length > 0
    ? await db.select({ id: subjects.id, name: subjects.name }).from(subjects)
        .where(inArray(subjects.id, allSubjectIds))
    : [];
  const allSubjectsMap = new Map(allSubjects.map(s => [s.id, s.name]));

  // Also pull recent bookmarks and referrals for the activity feed
  const recentBookmarks = await db
    .select({ id: bookmarks.id, createdAt: bookmarks.createdAt })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))
    .limit(5);

  const recentReferrals = await db
    .select({ id: referrals.id, creditsAwarded: referrals.creditsAwarded, createdAt: referrals.createdAt })
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt))
    .limit(3);

  function relativeTime(date: Date | null): string {
    if (!date) return "—";
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
  }

  function timeColor(date: Date | null): string {
    if (!date) return "slate";
    const diffHrs = (Date.now() - new Date(date).getTime()) / 3600000;
    if (diffHrs < 6) return "blue";
    if (diffHrs < 24) return "emerald";
    return "amber";
  }

  // Build unified activity feed
  type ActivityEntry = {
    id: string; type: string; activity: string; subject: string;
    score: string; credits: string; time: string; timeColor: string;
    icon: string; sortKey: number;
  };
  const activityEntries: ActivityEntry[] = [];

  recentSessions.forEach(s => {
    const exam = examMap.get(s.examId);
    const firstSubId = Array.isArray(s.subjectIds) ? (s.subjectIds as string[])[0] : null;
    const subjectName = firstSubId ? (allSubjectsMap.get(firstSubId) ?? exam?.name ?? "—") : (exam?.name ?? "—");
    const examLabel = exam ? `${exam.name}` : "Practice";
    const scoreVal = s.status === "completed"
      ? Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100)
      : null;

    activityEntries.push({
      id: s.id,
      type: "practice",
      activity: s.status === "completed" ? `${examLabel} completed` : `${examLabel} — in progress`,
      subject: subjectName,
      score: scoreVal !== null ? `${scoreVal}%` : "—",
      credits: `—`,
      time: relativeTime(s.completedAt ?? s.startedAt),
      timeColor: timeColor(s.completedAt ?? s.startedAt),
      icon: "Play",
      sortKey: new Date(s.completedAt ?? s.startedAt ?? 0).getTime(),
    });
  });

  recentReferrals.forEach(r => {
    activityEntries.push({
      id: r.id,
      type: "reward",
      activity: "Referral reward earned",
      subject: "—",
      score: "—",
      credits: r.creditsAwarded ? `+${r.creditsAwarded} cr` : "—",
      time: relativeTime(r.createdAt),
      timeColor: "emerald",
      icon: "Gift",
      sortKey: new Date(r.createdAt ?? 0).getTime(),
    });
  });

  if (recentBookmarks.length > 0) {
    const bk = recentBookmarks[0];
    activityEntries.push({
      id: bk.id,
      type: "bookmark",
      activity: `${recentBookmarks.length} question${recentBookmarks.length > 1 ? "s" : ""} bookmarked`,
      subject: "—",
      score: "—",
      credits: "—",
      time: relativeTime(bk.createdAt),
      timeColor: "amber",
      icon: "Bookmark",
      sortKey: new Date(bk.createdAt ?? 0).getTime(),
    });
  }

  const recentActivity = activityEntries
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 8)
    .map(({ sortKey, ...rest }) => rest);

  // ── Leaderboard (top performers same target exam, last 30 days) ──────────
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
  const leaderboardRows = await db
    .select({
      userId: practiceSessions.userId,
      userName: users.name,
      userImage: users.image,
      avgScore: sql<number>`round(avg(${practiceSessions.correctCount}::float / nullif(${practiceSessions.totalQuestions},0) * 100))`,
      lastSession: sql<Date>`max(${practiceSessions.completedAt})`,
    })
    .from(practiceSessions)
    .innerJoin(users, eq(practiceSessions.userId, users.id))
    .where(and(
      eq(practiceSessions.status, "completed"),
      sql`${practiceSessions.completedAt} >= ${thirtyDaysAgo}`
    ))
    .groupBy(practiceSessions.userId, users.name, users.image)
    .orderBy(desc(sql`round(avg(${practiceSessions.correctCount}::float / nullif(${practiceSessions.totalQuestions},0) * 100))`))
    .limit(15);

  const THEMES = ["amber", "blue", "indigo", "green", "gray"] as const;
  let myRank = -1;
  const leaderboard = leaderboardRows.map((row, i) => {
    const isMe = row.userId === userId;
    if (isMe) myRank = i + 1;
    const nameWords = row.userName.trim().split(" ");
    const initials = nameWords.map((w: string) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
    const score = Number(row.avgScore ?? 0);
    let theme: string = THEMES[Math.min(i, 2)] ?? "gray";
    if (isMe) theme = "green";
    else if (i > 2) theme = "gray";
    return {
      name: isMe ? row.userName : row.userName.split(" ")[0] + " " + (row.userName.split(" ")[1]?.[0] ?? "") + ".",
      initials,
      date: relativeTime(row.lastSession),
      score,
      theme,
      isMe,
    };
  });

  // If current user is not in top 15, append them
  if (myRank === -1) {
    const [myStats] = await db
      .select({
        avgScore: sql<number>`round(avg(${practiceSessions.correctCount}::float / nullif(${practiceSessions.totalQuestions},0) * 100))`,
        lastSession: sql<Date>`max(${practiceSessions.completedAt})`,
      })
      .from(practiceSessions)
      .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed"),
        sql`${practiceSessions.completedAt} >= ${thirtyDaysAgo}`));

    if (myStats?.avgScore) {
      const nameWords = (user.name ?? "You").split(" ");
      const initials = nameWords.map((w: string) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
      leaderboard.push({
        name: user.name ?? "You",
        initials,
        date: relativeTime(myStats.lastSession),
        score: Number(myStats.avgScore ?? 0),
        theme: "green",
        isMe: true,
      });
    }
  }

  // ── Summary cards ─────────────────────────────────────────────────────────
  const currentAvg = Number(avgScoreRow?.avg ?? 0);
  const previousAvg = Number(prevWeekAvg?.avg ?? 0);
  const avgTrend = currentAvg > previousAvg ? "Improving" : currentAvg === previousAvg ? "Stable" : "Needs work";

  // Find best session exam name
  let bestScoreExamLabel = "";
  if (bestScoreRow?.examId) {
    const bestExam = examMap.get(bestScoreRow.examId) ?? examRecords.find(e => e.id === bestScoreRow?.examId);
    if (bestExam) bestScoreExamLabel = bestExam.name;
    else {
      const [foundExam] = await db.select({ name: exams.name }).from(exams).where(eq(exams.id, bestScoreRow.examId)).limit(1);
      bestScoreExamLabel = foundExam?.name ?? "";
    }
  }

  const summaryCards = [
    {
      title: "Total tests taken",
      value: String(totalSessions.total),
      subtext: sessionsThisWeek.total > 0 ? `+${sessionsThisWeek.total} this week` : "None this week",
      trend: "On track",
      icon: "ClipboardCheck",
    },
    {
      title: "Average score",
      value: currentAvg ? `${currentAvg}%` : "—",
      subtext: previousAvg ? `${currentAvg >= previousAvg ? "Up" : "Down"} from ${previousAvg}% last week` : "First week!",
      trend: avgTrend,
      icon: "TrendingUp",
    },
    {
      title: "Best score ever",
      value: bestScoreRow?.best ? `${Number(bestScoreRow.best)}%` : "—",
      subtext: bestScoreExamLabel
        ? `${bestScoreExamLabel} · ${bestScoreRow?.completedAt ? new Date(bestScoreRow.completedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}`
        : "No completed sessions yet",
      trend: "Personal best",
      icon: "Trophy",
    },
  ];

  // ── Exam countdown ─────────────────────────────────────────────────────────
  let examCountdown: { days: number; hours: number; mins: number; examLabel: string; targetScore: number | null } | null = null;
  if (user.examDate) {
    const examDateMs = new Date(user.examDate).getTime();
    const nowMs = Date.now();
    const diffMs = examDateMs - nowMs;
    if (diffMs > 0) {
      const totalMins = Math.floor(diffMs / 60000);
      examCountdown = {
        days: Math.floor(totalMins / 1440),
        hours: Math.floor((totalMins % 1440) / 60),
        mins: totalMins % 60,
        examLabel: (user.targetExam ?? "Exam").toUpperCase().replace("_", " "),
        targetScore: user.targetScore ?? null,
      };
    }
  }

  // ── Credits info ───────────────────────────────────────────────────────────
  const creditBalance = user.creditBalance ?? 0;

  return c.json({
    success: true,
    data: {
      summaryCards,
      recentActivity,
      subjectPerformance,
      leaderboard,
      examCountdown,
      creditBalance,
    },
  });
});

// ─── GET /api/users/profile ───────────────────────────────────────────────────
usersRoute.get("/profile", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;

  // ── Round 1: user + sessions in parallel ─────────────────────────────────
  const [user, sessions] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true, name: true, email: true, image: true, phone: true,
        school: true, state: true, userType: true, targetExam: true,
        examLevel: true, targetScore: true, examDate: true,
        creditBalance: true, referralCode: true, createdAt: true,
        emailNotifications: true, pushNotifications: true,
        creditAlerts: true, referralAlerts: true,
      },
    }),
    db.select({
      id: practiceSessions.id,
      examId: practiceSessions.examId,
      subjectIds: practiceSessions.subjectIds,
      totalQuestions: practiceSessions.totalQuestions,
      correctCount: practiceSessions.correctCount,
      answeredCount: practiceSessions.answeredCount,
      completedAt: practiceSessions.completedAt,
      resumeState: practiceSessions.resumeState,
    })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .orderBy(desc(practiceSessions.completedAt))
    .limit(20),
  ]);

  if (!user) return c.json({ success: false, message: "User not found" }, 404);

  const examIds = [...new Set(sessions.map(s => s.examId))];
  const subjectIdsAll = [...new Set(sessions.flatMap(s => Array.isArray(s.subjectIds) ? s.subjectIds as string[] : []).filter(Boolean))];

  // ── Round 2: exams, subjects, subjectPerf, transactions in parallel ───────
  const [examRecs, subjectRecs, subjectPerf, transactions, [totalAnswersRow]] = await Promise.all([
    examIds.length > 0
      ? db.select({ id: exams.id, name: exams.name, type: exams.type }).from(exams).where(inArray(exams.id, examIds))
      : Promise.resolve([]),
    subjectIdsAll.length > 0
      ? db.select({ id: subjects.id, name: subjects.name }).from(subjects).where(inArray(subjects.id, subjectIdsAll))
      : Promise.resolve([]),
    db.select({
      subjectId: sql<string>`(${practiceSessions.subjectIds}->>'0')::uuid`,
      correct: sql<number>`coalesce(sum(${practiceAnswers.isCorrect}::int), 0)`,
      total: sql<number>`coalesce(count(${practiceAnswers.id}), 0)`,
    })
    .from(practiceAnswers)
    .innerJoin(practiceSessions, eq(practiceAnswers.sessionId, practiceSessions.id))
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .groupBy(sql`(${practiceSessions.subjectIds}->>'0')::uuid`),
    db.select({ id: creditTransactions.id, amount: creditTransactions.amount, status: creditTransactions.status, createdAt: creditTransactions.createdAt })
      .from(creditTransactions)
      .where(and(eq(creditTransactions.userId, userId), eq(creditTransactions.status, "success")))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(10),
    db.select({ total: count() })
      .from(practiceAnswers)
      .innerJoin(practiceSessions, eq(practiceAnswers.sessionId, practiceSessions.id))
      .where(eq(practiceSessions.userId, userId)),
  ]);

  const examMap = new Map(examRecs.map(e => [e.id, e]));
  const subjectMap = new Map(subjectRecs.map(s => [s.id, s.name]));
  const totalAnswerCount = totalAnswersRow?.total ?? 0;

  // ── Round 3: subject names for perf rows ─────────────────────────────────
  const perfSubIds = subjectPerf.map(r => r.subjectId).filter(Boolean);
  const perfSubRecs = perfSubIds.length > 0
    ? await db.select({ id: subjects.id, name: subjects.name }).from(subjects).where(inArray(subjects.id, perfSubIds))
    : [];
  const perfSubMap = new Map(perfSubRecs.map(s => [s.id, s.name]));

  // ── Helpers ───────────────────────────────────────────────────────────────
  const SUBJECT_COLORS: Record<string, { color: string; bg: string }> = {
    "English Language": { color: "text-blue-500", bg: "bg-blue-50" },
    "Use of English":   { color: "text-blue-500", bg: "bg-blue-50" },
    Mathematics:        { color: "text-purple-500", bg: "bg-purple-50" },
    Physics:            { color: "text-amber-500", bg: "bg-amber-50" },
    Chemistry:          { color: "text-emerald-500", bg: "bg-emerald-50" },
    Biology:            { color: "text-rose-500", bg: "bg-rose-50" },
    Economics:          { color: "text-indigo-500", bg: "bg-indigo-50" },
    Geography:          { color: "text-teal-500", bg: "bg-teal-50" },
  };
  const DEF_COLOR = { color: "text-slate-500", bg: "bg-slate-50" };

  function relTime(date: Date | null | undefined): string {
    if (!date) return "—";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  // ── Computed values ───────────────────────────────────────────────────────
  const examHistory = sessions.map(s => {
    const exam = examMap.get(s.examId);
    const firstSubId = Array.isArray(s.subjectIds) ? (s.subjectIds as string[])[0] : null;
    const subjectName = firstSubId ? (subjectMap.get(firstSubId) ?? exam?.name ?? "Practice") : (exam?.name ?? "Practice");
    const score = Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100);
    const c2 = SUBJECT_COLORS[subjectName] ?? DEF_COLOR;
    const totalTimeSecs = (s.resumeState as any)?.totalTimeSecs ?? 0;
    return {
      subject: subjectName,
      type: exam?.type === "jamb" || exam?.type === "waec" ? "Mock exam" : "Practice",
      score, total: 100,
      date: relTime(s.completedAt),
      credits: s.totalQuestions,
      duration: totalTimeSecs > 0 ? `${Math.round(totalTimeSecs / 60)} min` : "—",
      questions: s.totalQuestions,
      color: c2.color, bg: c2.bg,
    };
  });

  const scoreHistory = sessions.slice(0, 10).reverse().map(s =>
    Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100)
  );

  const ICON_MAP: Record<string, string> = { "English Language": "BookOpen", "Use of English": "BookOpen", Mathematics: "Calculator", Physics: "Zap", Chemistry: "FlaskConical", Biology: "Leaf", Economics: "TrendingUp", Geography: "Globe" };
  const COLOR_MAP: Record<string, string> = { "English Language": "bg-blue-500", "Use of English": "bg-blue-500", Mathematics: "bg-purple-500", Physics: "bg-amber-500", Chemistry: "bg-emerald-500", Biology: "bg-rose-500", Economics: "bg-indigo-500", Geography: "bg-teal-500" };
  const TEXT_MAP: Record<string, string> = { "English Language": "text-blue-500", "Use of English": "text-blue-500", Mathematics: "text-purple-500", Physics: "text-amber-500", Chemistry: "text-emerald-500", Biology: "text-rose-500", Economics: "text-indigo-500", Geography: "text-teal-500" };

  const subjectsData = subjectPerf.filter(r => r.subjectId && perfSubMap.has(r.subjectId)).map(r => {
    const name = perfSubMap.get(r.subjectId) ?? "Unknown";
    return { name, pct: Math.round((Number(r.correct) / Math.max(1, Number(r.total))) * 100), color: COLOR_MAP[name] ?? "bg-slate-500", text: TEXT_MAP[name] ?? "text-slate-500", iconName: ICON_MAP[name] ?? "BookOpen" };
  }).slice(0, 6);

  const txFormatted = transactions.map(t => ({ type: "credit" as const, label: `Purchased ${t.amount} credits`, amount: `+${t.amount}`, date: relTime(t.createdAt), color: "text-emerald-500", bg: "bg-emerald-50", iconName: "Zap" }));
  const debitSessions = sessions.slice(0, 5).map(s => ({ type: "debit" as const, label: `Practice session — ${s.totalQuestions} questions`, amount: `−${s.totalQuestions}`, date: relTime(s.completedAt), color: "text-rose-500", bg: "bg-rose-50", iconName: "FileText" }));
  const allTransactions = [...txFormatted, ...debitSessions].slice(0, 10);

  // Streak calculation
  const sessionDateSet = new Set(sessions.filter(s => s.completedAt).map(s => new Date(s.completedAt!).toDateString()));
  const ninetyDaysAgo = new Date(Date.now() - 93 * 86400000);
  const streakDots = Array.from({ length: 93 }, (_, i) => {
    if (i === 92) return "today";
    return sessionDateSet.has(new Date(ninetyDaysAgo.getTime() + i * 86400000).toDateString()) ? "done" : "";
  });
  let streakCount = 0;
  for (let i = 92; i >= 0; i--) {
    if (sessionDateSet.has(new Date(Date.now() - (92 - i) * 86400000).toDateString())) streakCount++;
    else break;
  }

  const achievements = [
    { name: "Profile Setup", sub: "Account and target exam configured.", earned: !!user.targetExam, status: user.targetExam ? "completed" : "current", iconName: "User" },
    { name: "First Practice Taken", sub: "Completed your first practice session.", earned: sessions.length >= 1, status: sessions.length >= 1 ? "completed" : "current", iconName: "BookOpen" },
    { name: "Score Above 70%", sub: "Achieved 70%+ in any session.", earned: sessions.some(s => Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100) >= 70), status: sessions.some(s => Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100) >= 70) ? "completed" : "current", iconName: "Target" },
    { name: "100 Questions Answered", sub: "Answered 100+ questions total.", earned: totalAnswerCount >= 100, status: totalAnswerCount >= 100 ? "completed" : "future", iconName: "Layers" },
    { name: "7-Day Streak", sub: "7 consecutive days of practice.", earned: streakCount >= 7, status: streakCount >= 7 ? "completed" : "future", iconName: "Flame" },
    { name: "30-Day Streak", sub: "30 consecutive days of practice.", earned: streakCount >= 30, status: streakCount >= 30 ? "completed" : "future", iconName: "ShieldCheck" },
  ];

  return c.json({
    success: true,
    data: {
      user: { name: user.name, email: user.email, image: user.image, phone: user.phone, school: user.school, state: user.state, userType: user.userType, targetExam: user.targetExam, examLevel: user.examLevel, targetScore: user.targetScore, examDate: user.examDate, creditBalance: user.creditBalance, referralCode: user.referralCode, createdAt: user.createdAt, emailNotifications: user.emailNotifications, pushNotifications: user.pushNotifications, creditAlerts: user.creditAlerts, referralAlerts: user.referralAlerts, streak: streakCount },
      subjects: subjectsData, examHistory, scoreHistory,
      transactions: allTransactions, achievements, streakDots,
      totalSessions: sessions.length, totalAnswers: totalAnswerCount,
    },
  });
});

// ─── PATCH /api/users/profile ─────────────────────────────────────────────────
usersRoute.patch("/profile", requireAuth, async (c) => {
  const db = createDb(c.env);
  const sessionUser = c.get("user");
  const body = await c.req.json() as {
    name?: string; phone?: string; school?: string; state?: string;
    emailNotifications?: boolean; pushNotifications?: boolean;
    creditAlerts?: boolean; referralAlerts?: boolean;
  };

  await db.update(users).set({
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.phone !== undefined ? { phone: body.phone } : {}),
    ...(body.school !== undefined ? { school: body.school } : {}),
    ...(body.state !== undefined ? { state: body.state } : {}),
    ...(body.emailNotifications !== undefined ? { emailNotifications: body.emailNotifications } : {}),
    ...(body.pushNotifications !== undefined ? { pushNotifications: body.pushNotifications } : {}),
    ...(body.creditAlerts !== undefined ? { creditAlerts: body.creditAlerts } : {}),
    ...(body.referralAlerts !== undefined ? { referralAlerts: body.referralAlerts } : {}),
    updatedAt: new Date(),
  }).where(eq(users.id, sessionUser.id));

  return c.json({ success: true, message: "Profile updated" });
});

// ─── GET /api/users/referrals ─────────────────────────────────────────────────
usersRoute.get("/referrals", requireAuth, async (c) => {
  const db = createDb(c.env);
  const sessionUser = c.get("user");
  const userId = sessionUser.id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { referralCode: true, creditBalance: true, name: true },
  });
  if (!user) return c.json({ success: false, message: "User not found" }, 404);

  // Fetch all referrals made by this user
  const userReferrals = await db
    .select({
      id: referrals.id,
      referredId: referrals.referredId,
      status: referrals.status,
      creditsAwarded: referrals.creditsAwarded,
      createdAt: referrals.createdAt,
    })
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));

  // Fetch referred users' info
  const referredIds = userReferrals.map(r => r.referredId).filter(Boolean);
  const referredUsers = referredIds.length > 0
    ? await db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
        .from(users).where(inArray(users.id, referredIds))
    : [];
  const referredMap = new Map(referredUsers.map(u => [u.id, u]));

  function relTime(date: Date | null): string {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  const STATUS_MAP = {
    signed_up: { text: "Signed up", statusBg: "bg-emerald-50", statusText: "text-emerald-700", action: "Remind" },
    purchased: { text: "Bought credits", statusBg: "bg-blue-50", statusText: "text-blue-600", action: "" },
    rewarded: { text: "Rewarded", statusBg: "bg-blue-50", statusText: "text-blue-600", action: "" },
  };

  const history = userReferrals.map(r => {
    const ru = referredMap.get(r.referredId);
    const name = ru?.name ?? "Unknown";
    const words = name.trim().split(" ");
    const initials = words.map((w: string) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
    const sm = STATUS_MAP[r.status] ?? STATUS_MAP.signed_up;
    return {
      initials,
      name,
      email: ru?.email ?? "",
      joined: relTime(ru?.createdAt ?? null),
      status: sm.text,
      earned: r.creditsAwarded ? `+${r.creditsAwarded} credits` : "None yet",
      action: sm.action,
      statusBg: sm.statusBg,
      statusText: sm.statusText,
    };
  });

  const totalReferrals = userReferrals.length;
  const successfulSignups = userReferrals.filter(r => r.status !== "signed_up" || r.creditsAwarded).length;
  const creditsBought = userReferrals.filter(r => r.status === "purchased" || r.status === "rewarded").length;
  const totalCreditsEarned = userReferrals.reduce((sum, r) => sum + (r.creditsAwarded ?? 0), 0);

  // Determine tier
  let tierName = "Starter";
  let creditsPerRef = 50;
  if (totalReferrals >= 15) { tierName = "Champion"; creditsPerRef = 100; }
  else if (totalReferrals >= 5) { tierName = "Hustler"; creditsPerRef = 75; }

  const stats = [
    { label: "Total referrals sent", value: String(totalReferrals), iconName: "Users", subtitle: "Links sent to friends", badge: "Active sharing", badgeClass: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Successful sign-ups", value: String(successfulSignups), iconName: "CheckCircle2", subtitle: `${totalReferrals - successfulSignups} still pending`, badge: totalReferrals ? `${Math.round(successfulSignups / totalReferrals * 100)}% conv.` : "0% conv.", badgeClass: "text-green-700 bg-green-50 border-green-200" },
    { label: "Credits bought by refs", value: String(creditsBought), iconName: "CreditCard", subtitle: `${creditsBought} of ${successfulSignups} bought credits`, badge: successfulSignups ? `${Math.round(creditsBought / successfulSignups * 100)}% Rate` : "0% Rate", badgeClass: "text-[#38761d] bg-[#38761d]/10 border-[#38761d]/20" },
    { label: "Total credits earned", value: String(totalCreditsEarned), iconName: "Trophy", subtitle: `Worth ~${Math.round(totalCreditsEarned / 2)} free questions`, badge: "Keep going!", badgeClass: "text-[#38761d] bg-[#38761d]/10 border-[#38761d]/20" },
  ];

  // Leaderboard — top referrers on the platform
  const leaderboardRows = await db
    .select({
      userId: referrals.referrerId,
      totalRefs: sql<number>`count(*)`,
      totalCredits: sql<number>`coalesce(sum(${referrals.creditsAwarded}), 0)`,
    })
    .from(referrals)
    .where(sql`${referrals.status} IN ('purchased','rewarded')`)
    .groupBy(referrals.referrerId)
    .orderBy(desc(sql`count(*)`))
    .limit(15);

  const lbUserIds = leaderboardRows.map(r => r.userId);
  const lbUsers = lbUserIds.length > 0
    ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, lbUserIds))
    : [];
  const lbUserMap = new Map(lbUsers.map(u => [u.id, u.name]));

  let myRank = -1;
  const leaderboard = leaderboardRows.map((row, i) => {
    const isMe = row.userId === userId;
    if (isMe) myRank = i + 1;
    const name = lbUserMap.get(row.userId) ?? "User";
    const initials = name.trim().split(" ").map((w: string) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
    const displayName = isMe ? name : (name.split(" ")[0] + " " + (name.split(" ")[1]?.[0] ?? "") + ".");
    return {
      rank: i + 1,
      initials,
      name: displayName,
      refs: `${Number(row.totalRefs)} refs`,
      credits: `${Number(row.totalCredits).toLocaleString()} cr`,
      isUser: isMe,
      category: i === 0 ? "orange" : i === 1 ? "blue" : i === 2 ? "purple" : isMe ? "brand" : "green",
    };
  });

  if (myRank === -1) {
    const nameWords = (user.name ?? "You").split(" ");
    const initials = nameWords.map((w: string) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
    leaderboard.push({ rank: 99, initials, name: user.name ?? "You", refs: `${creditsBought} refs`, credits: `${totalCreditsEarned} cr`, isUser: true, category: "brand" });
  }

  const appUrl = c.env.APP_URL ?? "https://mockcenter.com";
  const referralCode = user.referralCode ?? "";
  const referralLink = referralCode ? `${appUrl}/ref/${referralCode}` : "";

  const summaryStats = [
    { value: String(creditsBought), label: "Paid referrals" },
    { value: String(creditsPerRef), label: "Credits each" },
    { value: String(totalReferrals - successfulSignups), label: "Pending friends" },
    { value: `+${(totalReferrals - creditsBought) * creditsPerRef}`, label: "Potential credits" },
  ];

  const referralSteps = [
    { number: 1, title: "Share your link", description: "Copy your unique referral link and send it to friends on WhatsApp, Twitter, or any platform.", bg: "bg-[#1359a0]" },
    { number: 2, title: "Friend signs up", description: "Your friend clicks the link, creates a MockCenter account. They get 20 free credits.", subtext: "Friend gets 20 credits", bg: "bg-[#1359a0]" },
    { number: 3, title: "Friend buys credits", description: "When your friend makes their first credit purchase on MockCenter.", bg: "bg-[#1359a0]" },
    { number: 4, title: "You earn credits", description: `${creditsPerRef} credits are added to your balance instantly. No limits!`, subtext: `You earn ${creditsPerRef} credits`, bg: "bg-emerald-500", shadow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]" },
  ];

  return c.json({
    success: true,
    data: { stats, history, summaryStats, leaderboard, referralSteps, referralLink, code: referralCode, tier: tierName },
  });
});

// ─── GET /api/users/bookmarks ─────────────────────────────────────────────────
usersRoute.get("/bookmarks", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;

  const rows = await db
    .select({
      id: bookmarks.id,
      questionId: bookmarks.questionId,
      collectionId: bookmarks.collectionId,
      masteryStatus: bookmarks.masteryStatus,
      note: bookmarks.note,
      createdAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

  const qIds = rows.map(r => r.questionId);
  const questionRows = qIds.length > 0
    ? await db.query.questions.findMany({
        where: (q, { inArray: ina }) => ina(q.id, qIds),
        with: { options: { columns: { id: true, label: true, body: true, isCorrect: true } } },
        columns: { id: true, body: true, topic: true, year: true, explanationBody: true, subjectId: true, examId: true },
      })
    : [];
  const qMap = new Map(questionRows.map(q => [q.id, q]));

  const subjectIds = [...new Set(questionRows.map(q => q.subjectId))];
  const examIds2 = [...new Set(questionRows.map(q => q.examId))];
  const subRecs = subjectIds.length > 0 ? await db.select({ id: subjects.id, name: subjects.name }).from(subjects).where(inArray(subjects.id, subjectIds)) : [];
  const examRecs2 = examIds2.length > 0 ? await db.select({ id: exams.id, name: exams.name, type: exams.type }).from(exams).where(inArray(exams.id, examIds2)) : [];
  const subMap2 = new Map(subRecs.map(s => [s.id, s.name]));
  const examMap2 = new Map(examRecs2.map(e => [e.id, e]));

  const bookmarkData = rows.map(r => {
    const q = qMap.get(r.questionId);
    if (!q) return null;
    const subjectName = subMap2.get(q.subjectId) ?? "Unknown";
    const exam = examMap2.get(q.examId);
    return {
      id: r.id,
      questionId: r.questionId,
      collectionId: r.collectionId,
      masteryStatus: r.masteryStatus ?? "not_started",
      note: r.note ?? null,
      subject: subjectName,
      exam: exam?.type?.toUpperCase() ?? "—",
      year: q.year ? String(q.year) : "—",
      question: q.body,
      explanation: q.explanationBody,
      topic: q.topic,
      options: q.options,
      savedDate: r.createdAt,
    };
  }).filter(Boolean);

  // Stats
  const collectionRecs = await db.select().from(bookmarkCollections).where(eq(bookmarkCollections.userId, userId));
  const bySubject: Record<string, number> = {};
  bookmarkData.forEach(b => { if (b) bySubject[b.subject] = (bySubject[b.subject] ?? 0) + 1; });

  const subjectPerformance = Object.entries(bySubject).map(([name, cnt]) => ({
    name,
    count: cnt,
    percentage: Math.round((cnt / Math.max(1, bookmarkData.length)) * 100),
  }));

  const stats = [
    { label: "Total bookmarks", value: bookmarkData.length, icon: "Bookmark" },
    { label: "Collections", value: collectionRecs.length, icon: "Folder" },
    { label: "Still to review", value: bookmarkData.length, icon: "Hourglass" },
  ];

  const collections = [
    { name: "All bookmarks", count: bookmarkData.length, icon: "BookOpen", color: "bg-brand-muted/30 text-brand" },
    ...collectionRecs.map(col => ({
      name: col.name,
      id: col.id,
      count: bookmarkData.filter(b => b?.collectionId === col.id).length,
      icon: "Folder",
      color: "bg-slate-100 text-slate-600",
    })),
  ];

  return c.json({ success: true, data: { stats, bookmarkData, collections, subjectPerformance } });
});

// ─── POST /api/users/bookmarks ────────────────────────────────────────────────
usersRoute.post("/bookmarks", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;
  const body = await c.req.json() as { questionId?: string; collectionId?: string };
  const { questionId, collectionId } = body;

  // Validate UUID format (prevents injection of arbitrary strings into FK column)
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!questionId || !UUID_RE.test(questionId)) {
    return c.json({ success: false, message: "Invalid questionId" }, 400);
  }
  if (collectionId && !UUID_RE.test(collectionId)) {
    return c.json({ success: false, message: "Invalid collectionId" }, 400);
  }

  // Verify question exists (avoids orphaned bookmarks and FK violations)
  const [q] = await db.select({ id: questions.id }).from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!q) return c.json({ success: false, message: "Question not found" }, 404);

  // If collectionId given, verify it belongs to this user (SECURITY: no cross-user collection injection)
  if (collectionId) {
    const [col] = await db.select({ id: bookmarkCollections.id })
      .from(bookmarkCollections)
      .where(and(eq(bookmarkCollections.id, collectionId), eq(bookmarkCollections.userId, userId)))
      .limit(1);
    if (!col) return c.json({ success: false, message: "Collection not found" }, 404);
  }

  await db.insert(bookmarks).values({ userId, questionId, collectionId }).onConflictDoNothing();
  return c.json({ success: true, message: "Bookmarked" });
});

// ─── DELETE /api/users/bookmarks/:questionId ──────────────────────────────────
usersRoute.delete("/bookmarks/:questionId", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;
  const questionId = c.req.param("questionId");
  await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));
  return c.json({ success: true, message: "Bookmark removed" });
});

// ─── GET /api/users/bookmarks/collections ─────────────────────────────────────
usersRoute.get("/bookmarks/collections", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;
  const cols = await db.select().from(bookmarkCollections).where(eq(bookmarkCollections.userId, userId)).orderBy(asc(bookmarkCollections.createdAt));
  return c.json({ success: true, data: cols });
});

// ─── POST /api/users/bookmarks/collections ────────────────────────────────────
usersRoute.post("/bookmarks/collections", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;
  const { name } = await c.req.json() as { name: string };
  if (!name?.trim()) return c.json({ success: false, message: "name required" }, 400);
  const [col] = await db.insert(bookmarkCollections).values({ userId, name: name.trim() }).returning();
  return c.json({ success: true, data: col });
});

// ─── GET /api/users/notifications ────────────────────────────────────────────
usersRoute.get("/notifications", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  const unreadCount = rows.filter(n => !n.isRead).length;

  function relTime(date: Date | null): string {
    if (!date) return "—";
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  const TYPE_META: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
    credit:   { icon: "Zap",       iconBg: "bg-amber-50",   iconColor: "text-amber-500" },
    referral: { icon: "Gift",      iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    session:  { icon: "Trophy",    iconBg: "bg-blue-50",    iconColor: "text-blue-500" },
    system:   { icon: "Bell",      iconBg: "bg-slate-100",  iconColor: "text-slate-600" },
  };

  const notifs = rows.map(n => {
    const meta = TYPE_META[n.type] ?? TYPE_META.system;
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.message,
      time: relTime(n.createdAt),
      unread: !n.isRead,
      icon: meta.icon,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      tags: [],
    };
  });

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { emailNotifications: true, pushNotifications: true, creditAlerts: true, referralAlerts: true },
  });

  const settings = [
    { id: "email", label: "Email notifications", sub: "Practice summaries & updates", icon: "Mail", iconColor: "text-blue-500", checked: user?.emailNotifications ?? true },
    { id: "push", label: "Push notifications", sub: "In-app alerts", icon: "Bell", iconColor: "text-slate-600", checked: user?.pushNotifications ?? true },
    { id: "credit", label: "Credit alerts", sub: "Low balance warnings", icon: "Zap", iconColor: "text-amber-500", checked: user?.creditAlerts ?? true },
    { id: "referral", label: "Referral rewards", sub: "When a referral earns credits", icon: "Gift", iconColor: "text-orange-400", checked: user?.referralAlerts ?? true },
  ];

  return c.json({ success: true, data: { notifications: notifs, unreadCount, settings } });
});

// ─── PATCH /api/users/notifications/:id/read ─────────────────────────────────
usersRoute.patch("/notifications/:id/read", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;
  const id = c.req.param("id");
  // SECURITY: ensure the notification belongs to the authenticated user
  await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  return c.json({ success: true });
});

// ─── PATCH /api/users/notifications/read-all ─────────────────────────────────
usersRoute.patch("/notifications/read-all", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return c.json({ success: true });
});

// ─── GET /api/users/analytics ────────────────────────────────────────────────
usersRoute.get("/analytics", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;

  const completed = await db
    .select({
      id: practiceSessions.id,
      examId: practiceSessions.examId,
      subjectIds: practiceSessions.subjectIds,
      totalQuestions: practiceSessions.totalQuestions,
      answeredCount: practiceSessions.answeredCount,
      correctCount: practiceSessions.correctCount,
      completedAt: practiceSessions.completedAt,
    })
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .orderBy(asc(practiceSessions.completedAt))
    .limit(100);

  if (completed.length === 0) {
    return c.json({ success: true, data: { readiness: 0, subjectsReadiness: [], kpis: [], trendData: [], radarData: [], speedVsAccuracy: [], weakestTopics: [], distData: [], peerComparison: [] } });
  }

  // Trend data
  const trendData = completed.map(s => ({
    date: s.completedAt ? new Date(s.completedAt).toISOString().slice(0, 10) : "",
    score: Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100),
  }));

  // Per-subject performance
  const subjectPerf = await db
    .select({
      subjectId: sql<string>`(${practiceSessions.subjectIds}->>'0')::uuid`,
      correct: sql<number>`coalesce(sum(${practiceAnswers.isCorrect}::int),0)`,
      total: sql<number>`coalesce(count(${practiceAnswers.id}),0)`,
      avgTime: sql<number>`coalesce(avg(${practiceAnswers.timeSpentSecs}),0)`,
    })
    .from(practiceAnswers)
    .innerJoin(practiceSessions, eq(practiceAnswers.sessionId, practiceSessions.id))
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .groupBy(sql`(${practiceSessions.subjectIds}->>'0')::uuid`);

  const subIds = subjectPerf.map(r => r.subjectId).filter(Boolean);
  const subRecs3 = subIds.length > 0 ? await db.select({ id: subjects.id, name: subjects.name }).from(subjects).where(inArray(subjects.id, subIds)) : [];
  const subMap3 = new Map(subRecs3.map(s => [s.id, s.name]));

  const STATUS = (sc: number) => sc >= 70 ? "Strong" : sc >= 50 ? "Average" : "Weak";
  const COLOR = (sc: number) => sc >= 70 ? "text-brand-dark" : sc >= 50 ? "text-amber-700" : "text-red-600";
  const BADGE = (sc: number) => sc >= 70 ? "bg-brand-muted" : sc >= 50 ? "bg-amber-50" : "bg-red-50";

  const subjectsReadiness = subjectPerf.filter(r => r.subjectId && subMap3.has(r.subjectId)).map(r => {
    const name = subMap3.get(r.subjectId) ?? "Unknown";
    const sc = Math.round((Number(r.correct) / Math.max(1, Number(r.total))) * 100);
    return { name, score: sc, status: STATUS(sc), color: COLOR(sc), badgeBg: BADGE(sc) };
  });

  const readiness = subjectsReadiness.length > 0
    ? Math.round(subjectsReadiness.reduce((s, r) => s + r.score, 0) / subjectsReadiness.length)
    : 0;

  // Overall stats
  const totalSessions = completed.length;
  const avgScore = Math.round(completed.reduce((s, r) => s + Math.round((r.correctCount / Math.max(1, r.totalQuestions)) * 100), 0) / Math.max(1, totalSessions));
  const totalQuestionsAnswered = completed.reduce((s, r) => s + (r.answeredCount ?? r.totalQuestions), 0);

  const kpis = [
    { title: "Avg score", value: `${avgScore}%`, subtitle: "All sessions", badge: avgScore >= 70 ? "Strong" : "Improving", badgeClass: avgScore >= 70 ? "text-brand-dark bg-brand-muted border border-brand/20" : "text-amber-700 bg-amber-50 border border-amber-200/50", icon: "TrendingUp" },
    { title: "Total sessions", value: String(totalSessions), subtitle: "Completed sessions", badge: "Active", badgeClass: "text-brand-dark bg-brand-muted border border-brand/20", icon: "Target" },
    { title: "Questions answered", value: String(totalQuestionsAnswered), subtitle: "Across all sessions", badge: "Progress", badgeClass: "text-blue-700 bg-blue-50 border border-blue-200/50", icon: "Library" },
  ];

  // Speed vs accuracy per subject
  const speedVsAccuracy = subjectPerf.filter(r => r.subjectId && subMap3.has(r.subjectId)).map(r => {
    const name = subMap3.get(r.subjectId) ?? "Unknown";
    const accuracy = Math.round((Number(r.correct) / Math.max(1, Number(r.total))) * 100);
    const speed = Math.round(Number(r.avgTime));
    const badge = accuracy >= 70 && speed <= 45 ? "Ideal" : speed > 55 ? "Too slow" : speed < 20 ? "Rushing!" : "Steady";
    return { name, accuracy, speed, badge };
  });

  // Radar data (you vs placeholder top10 = you+15%)
  const radarData = subjectsReadiness.map(r => ({
    subject: r.name,
    you: r.score,
    top10: Math.min(100, r.score + 15),
  }));

  // Score distribution
  const bands = [
    { label: "0-20%", min: 0, max: 20, color: "bg-red-400/80" },
    { label: "21-40%", min: 21, max: 40, color: "bg-red-300/80" },
    { label: "41-50%", min: 41, max: 50, color: "bg-orange-400/90" },
    { label: "51-60%", min: 51, max: 60, color: "bg-amber-500/90" },
    { label: "61-70%", min: 61, max: 70, color: "bg-brand/70" },
    { label: "71-80%", min: 71, max: 80, color: "bg-brand/85" },
    { label: "81-100%", min: 81, max: 100, color: "bg-brand" },
  ];
  const maxCount = Math.max(1, ...bands.map(b => completed.filter(s => {
    const sc = Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100);
    return sc >= b.min && sc <= b.max;
  }).length));

  const distData = bands.map(b => {
    const cnt = completed.filter(s => {
      const sc = Math.round((s.correctCount / Math.max(1, s.totalQuestions)) * 100);
      return sc >= b.min && sc <= b.max;
    }).length;
    return { label: b.label, height: `${Math.round((cnt / maxCount) * 100)}%`, color: b.color };
  });

  return c.json({ success: true, data: { readiness, subjectsReadiness, kpis, trendData, radarData, speedVsAccuracy, distData, weakestTopics: [], peerComparison: [] } });
});

// ─── GET /api/users/subjects ──────────────────────────────────────────────────
// Returns subjects for the user's target exam with their performance stats.
usersRoute.get("/subjects", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { targetExam: true },
  });

  // Get exam matching user's target
  const examType = user?.targetExam ?? "jamb";
  const examRecs3 = await db.select({ id: exams.id, name: exams.name, type: exams.type }).from(exams).where(eq(exams.type, examType));

  if (examRecs3.length === 0) return c.json({ success: true, data: { items: [] } });

  const primaryExam = examRecs3[0];
  const subjectRecs4 = await db.select({ id: subjects.id, name: subjects.name }).from(subjects).where(eq(subjects.examId, primaryExam.id));

  // Get per-subject performance for this user
  const subjectIds4 = subjectRecs4.map(s => s.id);
  const perfRows = subjectIds4.length > 0
    ? await db
        .select({
          subjectId: sql<string>`(${practiceSessions.subjectIds}->>'0')::uuid`,
          correctCount: sql<number>`coalesce(sum(${practiceSessions.correctCount}),0)`,
          totalQuestions: sql<number>`coalesce(sum(${practiceSessions.totalQuestions}),0)`,
          sessions: sql<number>`count(*)`,
        })
        .from(practiceSessions)
        .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed"),
          sql`(${practiceSessions.subjectIds}->>'0')::uuid = ANY(${subjectIds4})`))
        .groupBy(sql`(${practiceSessions.subjectIds}->>'0')::uuid`)
    : [];

  const perfMap4 = new Map(perfRows.map(r => [r.subjectId, r]));

  const SUBJECT_THUMBNAIL: Record<string, string> = {
    "Biology": "/BIOLOGY.png", "Chemistry": "/CHEMISTRY.png",
    "Physics": "/PHYSICS.png", "Mathematics": "/MATHS.png",
    "English Language": "/ENGLISH.png", "Use of English": "/ENGLISH.png",
    "Economics": "/ECONOMICS.png", "Geography": "/GEOGRAPHY.png",
    "Agriculture": "/AGRICULTURE.png", "Commerce": "/COMMERCE.png",
    "CRS": "/CRK.png", "Christian Religious Studies": "/CRK.png",
  };
  const SUBJECT_COLORS: Record<string, { gradient: string; progress: string; badge: string; text: string; button: string }> = {
    "English Language": { gradient: "from-orange-100 to-amber-50", progress: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-100/50", text: "text-orange-600", button: "bg-orange-600 hover:bg-orange-700 text-white" },
    "Use of English": { gradient: "from-orange-100 to-amber-50", progress: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-100/50", text: "text-orange-600", button: "bg-orange-600 hover:bg-orange-700 text-white" },
    "Mathematics": { gradient: "from-sky-100 to-blue-50", progress: "bg-sky-500", badge: "bg-sky-50 text-sky-700 border-sky-100/50", text: "text-sky-600", button: "bg-sky-600 hover:bg-sky-700 text-white" },
    "Biology": { gradient: "from-emerald-100 to-green-50", progress: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100/50", text: "text-emerald-600", button: "bg-emerald-600 hover:bg-emerald-700 text-white" },
    "Chemistry": { gradient: "from-blue-100 to-cyan-50", progress: "bg-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-100/50", text: "text-blue-600", button: "bg-blue-600 hover:bg-blue-700 text-white" },
    "Physics": { gradient: "from-purple-100 to-indigo-50", progress: "bg-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-100/50", text: "text-violet-600", button: "bg-violet-600 hover:bg-violet-700 text-white" },
    "Economics": { gradient: "from-rose-100 to-pink-50", progress: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-100/50", text: "text-rose-600", button: "bg-rose-600 hover:bg-rose-700 text-white" },
    "Geography": { gradient: "from-teal-100 to-emerald-50", progress: "bg-teal-500", badge: "bg-teal-50 text-teal-700 border-teal-100/50", text: "text-teal-600", button: "bg-teal-600 hover:bg-teal-700 text-white" },
    "Commerce": { gradient: "from-cyan-100 to-sky-50", progress: "bg-cyan-500", badge: "bg-cyan-50 text-cyan-700 border-cyan-100/50", text: "text-cyan-600", button: "bg-cyan-600 hover:bg-cyan-700 text-white" },
  };
  const DEFAULT_COLORS = { gradient: "from-slate-100 to-gray-50", progress: "bg-slate-500", badge: "bg-slate-50 text-slate-700 border-slate-100/50", text: "text-slate-600", button: "bg-slate-600 hover:bg-slate-700 text-white" };

  const items = subjectRecs4.map((s, idx) => {
    const perf = perfMap4.get(s.id);
    const accuracy = perf ? Math.round((Number(perf.correctCount) / Math.max(1, Number(perf.totalQuestions))) * 100) : 0;
    const sessionCount = perf ? Number(perf.sessions) : 0;
    const colors = SUBJECT_COLORS[s.name] ?? DEFAULT_COLORS;
    const thumbnail = SUBJECT_THUMBNAIL[s.name] ?? null;
    return {
      id: idx + 1,
      subjectId: s.id,
      examId: primaryExam.id,
      title: s.name,
      thumbnail,
      accuracy,
      bestScore: accuracy,
      completion: sessionCount > 0 ? Math.min(100, sessionCount * 10) : 0,
      ...colors,
      buttonText: "Proceed",
    };
  });

  return c.json({ success: true, data: { items, exam: { id: primaryExam.id, name: primaryExam.name, type: primaryExam.type } } });
});

// ─── GET /api/users/configure ─────────────────────────────────────────────────
// Returns all exams + subjects for session configuration.
usersRoute.get("/configure", requireAuth, async (c) => {
  const db = createDb(c.env);
  const allExams = await db.select({ id: exams.id, name: exams.name, type: exams.type }).from(exams).orderBy(asc(exams.name));
  const allSubjects = await db.select({ id: subjects.id, name: subjects.name, examId: subjects.examId }).from(subjects).orderBy(asc(subjects.name));
  return c.json({ success: true, data: { exams: allExams, subjects: allSubjects } });
});

// ─── GET /api/users/subject-stats ─────────────────────────────────────────────
// Returns question count, year range, and unique topics for a subject.
// Query param: subjectId (UUID)
usersRoute.get("/subject-stats", requireAuth, async (c) => {
  const db = createDb(c.env);
  const subjectId = c.req.query("subjectId");
  if (!subjectId) return c.json({ success: false, message: "subjectId required" }, 400);

  const { questions: qs } = await import("../db/schema");

  // Single efficient query: count, min year, max year
  const [stats] = await db
    .select({
      total:   sql<number>`count(*)`,
      minYear: sql<number>`min(${qs.year})`,
      maxYear: sql<number>`max(${qs.year})`,
    })
    .from(qs)
    .where(eq(qs.subjectId, subjectId));

  // Distinct non-null topics (limit to 20 for performance)
  const topicRows = await db
    .selectDistinct({ topic: qs.topic })
    .from(qs)
    .where(and(eq(qs.subjectId, subjectId), sql`${qs.topic} is not null`))
    .limit(20);

  const topics = topicRows.map(r => r.topic).filter(Boolean) as string[];

  return c.json({
    success: true,
    data: {
      totalQuestions: Number(stats?.total ?? 0),
      minYear: stats?.minYear ?? null,
      maxYear: stats?.maxYear ?? null,
      topics,
    },
  });
});

// ─── PATCH /api/users/bookmarks/:id ──────────────────────────────────────────
// Updates mastery status and/or note on a bookmark.
usersRoute.patch("/bookmarks/:id", requireAuth, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const body = await c.req.json() as { masteryStatus?: string; note?: string };

  const VALID_MASTERY = ["not_started", "in_progress", "mastered"];
  if (body.masteryStatus && !VALID_MASTERY.includes(body.masteryStatus)) {
    return c.json({ success: false, message: "Invalid masteryStatus value" }, 400);
  }

  // SECURITY: only update a bookmark that belongs to this user
  const [updated] = await db
    .update(bookmarks)
    .set({
      ...(body.masteryStatus !== undefined ? { masteryStatus: body.masteryStatus } : {}),
      ...(body.note !== undefined ? { note: body.note } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
    .returning();

  if (!updated) {
    return c.json({ success: false, message: "Bookmark not found" }, 404);
  }

  return c.json({ success: true, message: "Bookmark updated" });
});

// ─── GET /api/users/credit-packages ──────────────────────────────────────────
// Returns all active credit packages from the database.
// Powers the buy_credits page — replaces hardcoded tier list.
usersRoute.get("/credit-packages", requireAuth, async (c) => {
  const db = createDb(c.env);

  const packages = await db
    .select({
      id: creditPackages.id,
      name: creditPackages.name,
      credits: creditPackages.credits,
      priceNgn: creditPackages.priceNgn,
      isActive: creditPackages.isActive,
    })
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))
    .orderBy(asc(creditPackages.credits));

  return c.json({ success: true, data: { packages } });
});

export default usersRoute;
