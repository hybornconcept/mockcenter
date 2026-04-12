import * as dotenv from 'dotenv';
dotenv.config();
import { createDb } from '../src/db/index.js';
import * as schema from '../src/db/schema/index.js';
import { isNull } from 'drizzle-orm';

async function main() {
  const db = createDb({ DATABASE_URL: process.env.DATABASE_URL! } as any);
  
  console.log("Cleaning up old malformed questions without topics...");

  const res = await db.delete(schema.questions)
    .where(isNull(schema.questions.topic))
    .returning();

  console.log(`Deleted ${res.length} old/malformed questions without topics.`);
  
  process.exit(0);
}

main().catch(err => {
  console.error("Error cleaning:", err);
  process.exit(1);
});
