import * as dotenv from 'dotenv';
dotenv.config();
import { createDb } from '../src/db/index.js';
import * as schema from '../src/db/schema/index.js';
import { eq } from 'drizzle-orm';
async function run() {
  const db = createDb({DATABASE_URL: process.env.DATABASE_URL} as any);
  const subjects = await db.select().from(schema.subjects).where(eq(schema.subjects.name, 'Biology'));
  console.log(JSON.stringify(subjects, null, 2));
  process.exit(0);
}
run();
