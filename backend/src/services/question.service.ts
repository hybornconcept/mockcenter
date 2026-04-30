import { eq, and, inArray, sql } from "drizzle-orm";
import type { Database } from "../db";
import { questions, options, practiceAnswers } from "../db/schema";

export class QuestionService {
  constructor(private db: Database) {}

  async getQuestionsForSession(subjectIds: string[], limit: number) {
    const isMock = subjectIds.includes("00000000-0000-0000-0000-000000000000");
    const whereClause = isMock ? undefined : inArray(questions.subjectId, subjectIds);

    return this.db.query.questions.findMany({
      where: whereClause,
      with: {
        options: {
          columns: { id: true, label: true, body: true }, // EXCLUDE isCorrect
        },
      },
      limit,
      orderBy: sql`${questions.createdAt} ASC`,
    });
  }

  async getQuestionsByIds(ids: string[]) {
    if (ids.length === 0) return [];
    const records = await this.db.query.questions.findMany({
      where: inArray(questions.id, ids),
      with: {
        options: { columns: { id: true, label: true, body: true } },
      },
    });
    // Restore original session order
    const map = new Map(records.map((r) => [r.id, r]));
    return ids.map((id) => map.get(id)).filter(Boolean) as typeof records;
  }

  async validateAnswer(questionId: string, selectedOptionId: string) {
    const correctOption = await this.db.query.options.findFirst({
      where: and(eq(options.questionId, questionId), eq(options.isCorrect, true)),
    });
    return {
      isCorrect: correctOption?.id === selectedOptionId,
      correctOptionId: correctOption?.id,
    };
  }
}
