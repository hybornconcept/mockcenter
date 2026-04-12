import * as dotenv from 'dotenv';
dotenv.config();
import { createDb } from '../src/db/index.js';
import * as schema from '../src/db/schema/index.js';

async function main() {
  const db = createDb({ DATABASE_URL: process.env.DATABASE_URL! } as any);
  
  console.log("Wiping all questions to reset state cleanly...");

  await db.delete(schema.questions);

  console.log(`Database wiped. Ready for ingest!`);
  
  process.exit(0);
}

main().catch(err => {
  console.error("Error wiping:", err);
  process.exit(1);
});
