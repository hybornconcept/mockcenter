import { createDb } from "../src/db";
import { sql, count, desc, eq, and } from "drizzle-orm";
import { 
  users, practiceSessions, practiceAnswers, subjects, 
  questions, exams, creditTransactions 
} from "../src/db/schema";
import { Env } from "../src/env";

async function run() {
  const env: Env = {
    DATABASE_URL: "postgresql://postgres:legacy@127.0.0.1:5432/mockcenter",
    JWT_SECRET: "test",
    ADMIN_EMAILS: "test@test.com",
    CLOUDFLARE_ACCOUNT_ID: "",
    CLOUDFLARE_ACCESS_KEY_ID: "",
    CLOUDFLARE_SECRET_ACCESS_KEY: "",
    R2_BUCKET_NAME: ""
  };
  const db = createDb(env as any);
  const days = 30;
  const since = new Date(Date.now() - days * 86_400_000);

  try {
    console.log("Testing queries...");
    
    console.log("1. txStats");
    const [txStats] = await db
      .select({
        total: sql<number>`coalesce(sum(amount_ngn), 0)`,
        txCount: count(),
      })
      .from(creditTransactions)
      .where(and(eq(creditTransactions.status, "success"), sql`created_at >= ${since}`));
    console.log("txStats OK:", txStats);

    console.log("2. priorUsers");
    const priorStart = new Date(since.getTime() - days * 86_400_000);
    const [priorUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`created_at >= ${priorStart} and created_at < ${since}`);
    console.log("priorUsers OK:", priorUsers);

    console.log("3. examDistribution");
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
    console.log("examDistribution OK:", examDistribution);

    console.log("4. avgScore");
    const [avgScore] = await db
      .select({
        avg: sql<number>`round(avg(correct_count::float / nullif(total_questions,0) * 100))`,
      })
      .from(practiceSessions)
      .where(and(eq(practiceSessions.status, "completed"), sql`completed_at >= ${since}`));
    console.log("avgScore OK:", avgScore);

    console.log("All queries passed!");
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  }
}

run();
