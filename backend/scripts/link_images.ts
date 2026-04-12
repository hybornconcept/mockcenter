import * as dotenv from 'dotenv';
dotenv.config();
import { createDb } from '../src/db/index.js';
import * as schema from '../src/db/schema/index.js';
import { like } from 'drizzle-orm';

async function main() {
  const db = createDb({ DATABASE_URL: process.env.DATABASE_URL! } as any);
  
  const baseUrl = "http://localhost:8787/images";

  console.log("Linking images to questions based on Reference Instructions pattern...");

  await db.update(schema.questions)
    .set({ imageUrl: `${baseUrl}/biology_jamb_2010_six_seven.png` })
    .where(like(schema.questions.topic, '%6 and 7%'));

  await db.update(schema.questions)
    .set({ imageUrl: `${baseUrl}/biology_jamb_2010_nine_ten.png` })
    .where(like(schema.questions.topic, '%9 and 10%'));

  await db.update(schema.questions)
    .set({ imageUrl: `${baseUrl}/biology_jamb_2010_twelve_thirteen.png` })
    .where(like(schema.questions.topic, '%12 and 13%'));

  await db.update(schema.questions)
    .set({ imageUrl: `${baseUrl}/biology_jamb_2010_fourtytwo_fourtythree.png` })
    .where(like(schema.questions.topic, '%42 and 43%'));

  console.log("Database perfectly linked with the image architecture!");
  process.exit(0);
}

main().catch(err => {
  console.error("Error linking images:", err);
  process.exit(1);
});
