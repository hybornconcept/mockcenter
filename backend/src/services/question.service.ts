import { eq, and, inArray, sql } from "drizzle-orm";
import type { Database } from "../db";
import { questions, options, practiceSessions, practiceAnswers } from "../db/schema";

export class QuestionService {
  constructor(private db: Database) {}

  async getQuestionsForSession(subjectIds: string[], limit: number) {
    return this.db
      .select({
        id: questions.id,
        body: questions.body,
        topic: questions.topic,
        year: questions.year,
      })
      .from(questions)
      .where(inArray(questions.subjectId, subjectIds))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async getQuestionWithOptions(questionId: string) {
    const question = await this.db.query.questions.findFirst({
      where: eq(questions.id, questionId),
      with: {
        options: true,
      },
    });
    return question;
  }

  async validateAnswer(questionId: string, selectedOptionId: string) {
    const correctOption = await this.db.query.options.findFirst({
      where: and(
        eq(options.questionId, questionId),
        eq(options.isCorrect, true)
      ),
    });

    return {
      isCorrect: correctOption?.id === selectedOptionId,
      correctOptionId: correctOption?.id,
    };
  }
}
