import { parse } from "csv-parse";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq } from "drizzle-orm";
import { exams, subjects, questions, options } from "../db/schema/questions";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local env variables (.dev.vars might be used in wrangler, but for script we load manually or use what's in process.env)
// Try loading .dev.vars as .env format
config({ path: path.resolve(__dirname, "../../.dev.vars") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL must be defined in .dev.vars");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

async function runSeed() {
  const csvPath = path.resolve(__dirname, "../../Biology Jamb 2010 - Sheet1.csv");
  console.log(`Parsing CSV: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found!");
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");

  const records = await new Promise<any[]>((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });

  console.log(`Read ${records.length} questions from CSV.`);

  // Find or create Exam
  let examResult = await db.select().from(exams).where(eq(exams.name, "Jamb")).limit(1);
  let examId = examResult.length > 0 ? examResult[0].id : null;

  if (!examId) {
    const res = await db.insert(exams).values({ name: "Jamb", type: "jamb" }).returning({ id: exams.id });
    examId = res[0].id;
    console.log(`Created exam "Jamb" with ID ${examId}`);
  }

  // Find or create Subject
  let subjectResult = await db.select().from(subjects).where(eq(subjects.name, "Biology")).limit(1);
  let subjectId = subjectResult.length > 0 ? subjectResult[0].id : null;

  if (!subjectId) {
    const res = await db.insert(subjects).values({ name: "Biology", examId }).returning({ id: subjects.id });
    subjectId = res[0].id;
    console.log(`Created subject "Biology" with ID ${subjectId}`);
  }

  // Iterate over records and insert
  for (const row of records) {
    // Expected headers: Exam, Year, Subject, Reference Instructions, No., Question, Option A, Option B, Option C, Option D, Correct Answer
    const qBody = row["Reference Instructions"] 
      ? `**Reference**: ${row["Reference Instructions"]}\n\n**Question**: ${row["Question"]}`
      : row["Question"];
    const optionsData = [
      { label: "A", body: row["Option A"] },
      { label: "B", body: row["Option B"] },
      { label: "C", body: row["Option C"] },
      { label: "D", body: row["Option D"] },
    ];
    const correctLabel = row["Correct Answer"];

    // insert question
    try {
      const qRes = await db.insert(questions).values({
        subjectId,
        examId,
        year: parseInt(row["Year"]) || 2010,
        body: qBody,
        creditCost: 1,
      }).returning({ id: questions.id });

      const newQId = qRes[0].id;

      // insert options
      for (const opt of optionsData) {
        if (!opt.body || opt.body === "-") continue; // Skip empty options
        await db.insert(options).values({
          questionId: newQId,
          label: opt.label,
          body: opt.body,
          isCorrect: opt.label === correctLabel,
        });
      }
    } catch(err) {
      console.error(`Error inserting question ${row["No."]}:`, err);
    }
  }

  console.log("Seeding complete! ✅");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
