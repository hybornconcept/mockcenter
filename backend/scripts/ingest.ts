import * as dotenv from 'dotenv';
dotenv.config();

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { createDb } from '../src/db/index.js';
import * as schema from '../src/db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const db = createDb({ DATABASE_URL: process.env.DATABASE_URL! } as any);
  
  const csvPath = path.resolve(__dirname, '../Biology Jamb 2010 - Sheet1.csv');
  console.log(`Reading from: ${csvPath}`);
  const fileContent = readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  // 1. Create or find Exam
  const examName = 'JAMB';
  const examType = 'jamb';

  let [exam] = await db.select().from(schema.exams).where(eq(schema.exams.name, examName)).limit(1);
  if (!exam) {
    const inserted = await db.insert(schema.exams).values({ name: examName, type: examType }).returning();
    exam = inserted[0];
    console.log(`Created new exam: ${examName}`);
  } else {
    console.log(`Found existing exam: ${examName}`);
  }

  // 2. Create or find Subject
  let [subject] = await db.select().from(schema.subjects).where(
    and(
      eq(schema.subjects.name, 'Biology'),
      eq(schema.subjects.examId, exam.id)
    )
  ).limit(1);

  if (!subject) {
    const inserted = await db.insert(schema.subjects).values({ name: 'Biology', examId: exam.id }).returning();
    subject = inserted[0];
    console.log(`Created new subject: Biology`);
  } else {
    console.log(`Found existing subject: Biology`);
  }

  let count = 0;
  for (const record of records) {
    const topic = record['Reference Instructions']?.trim() || null;
    const year = parseInt(record['Year'], 10) || 2010;
    const qBody = record['Question']?.trim();
    
    if (!qBody) continue;

    const insertedQ = await db.insert(schema.questions).values({
      examId: exam.id,
      subjectId: subject.id,
      year: year,
      topic: topic,
      body: qBody,
      creditCost: 1
    }).returning();
    
    const questionId = insertedQ[0].id;
    
    const correctLetter = record['Correct Answer']?.trim().toUpperCase();

    const optionsToInsert = [
      { label: 'A', body: record['Option A'], isCorrect: correctLetter === 'A' },
      { label: 'B', body: record['Option B'], isCorrect: correctLetter === 'B' },
      { label: 'C', body: record['Option C'], isCorrect: correctLetter === 'C' },
      { label: 'D', body: record['Option D'], isCorrect: correctLetter === 'D' },
    ];
    
    for (const opt of optionsToInsert) {
      if (!opt.body?.trim()) continue;
      await db.insert(schema.options).values({
        questionId: questionId,
        label: opt.label,
        body: opt.body.trim(),
        isCorrect: opt.isCorrect
      });
    }
    count++;
  }

  console.log(`Import completed! Inserted ${count} questions.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Error during import:", err);
  process.exit(1);
});
