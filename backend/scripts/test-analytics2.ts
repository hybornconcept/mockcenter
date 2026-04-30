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
    console.log("5. subjectAccuracy");
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
    console.log("subjectAccuracy OK:", subjectAccuracy);

    console.log("6. hardestQuestions");
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
    console.log("hardestQuestions OK:", hardestQuestions);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  }
}

run();
