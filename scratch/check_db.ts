import { createDb } from "./backend/src/db";
import { subjects } from "./backend/src/db/schema";

async function checkSubjects() {
  const db = createDb(process.env as any);
  const rows = await db.select().from(subjects);
  console.log("Subjects in DB:", rows);
}

checkSubjects().catch(console.error);
