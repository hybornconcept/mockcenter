import { createDb } from "../backend/src/db";
import { exams } from "../backend/src/db/schema";

async function checkExams() {
  const db = createDb({} as any); // This might not work without env, but let's see if we can use a simpler way
  // Actually, I'll just use a direct sql query if I can.
}
