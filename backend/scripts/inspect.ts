import * as dotenv from 'dotenv';
dotenv.config();
import { createDb } from '../src/db/index.js';
import * as schema from '../src/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function main() {
  const db = createDb({ DATABASE_URL: process.env.DATABASE_URL! } as any);
  const qs = await db.query.questions.findMany({
    orderBy: (qs, { asc }) => [asc(qs.createdAt)],
  });

  console.log(`Total questions: ${qs.length}`);
  
  // Find which ones have imageURL
  const withImages = qs.filter(q => q.imageUrl);
  console.log(`Questions with images: ${withImages.map(q => q.id + " : " + q.imageUrl)}`);

  // Count topics
  const withTopics = qs.filter(q => q.topic);
  console.log(`Questions with topic: ${withTopics.length}`);
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
