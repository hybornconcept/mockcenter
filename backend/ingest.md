# MockCenter Ingestion Workflow

This document details the standardized flow for ingesting new examination questions via CSV files, automatically managing physical image assets, storing them within Cloudflare Worker R2 Buckets, and seamlessly linking them inside PostgreSQL schema architectures. Both developers and automated AI agents should use this as a source of truth for future dataset drops.

## 1. CSV Schema and Structure Preparation

Ensure you have a formatted CSV file detailing your question subjects.
The required columns for standard ingestion are exactly:
`Exam, Year, Subject, Reference Instructions, No., Question, Option A, Option B, Option C, Option D, Correct Answer`

- If a question references an image graph or visual diagram, the original text marker (e.g. `Use the diagram above to answer question 6 and 7`) should be securely stored in the **Reference Instructions** column.
- During Drizzle database insertion (`scripts/ingest.ts`), this column gets image later.systematically saved to the `topic` database column to easily locate and link it to an 

## 2. Image Asset Preparation

Any associated images should be dumped into `backend/question_images`. 
To ensure zero naming collisions and an easy identifier schema, all images **must** be renamed to explicitly cite the context.

Example Format:
`{subject}_{examType}_{year}_{questionRange}.png`
*e.g. `biology_jamb_2010_six_seven.png`*

## 3. Standard Text DB Ingestion

Run the baseline CSV uploader to seed the core text models (Exam, Subject, Questions, Options).
```bash
npx tsx scripts/ingest.ts
```
*Note: Ensure `ingest.ts` corresponds to the correct static target file (like `Biology Jamb 2010 - Sheet1.csv`). Update the `csvPath` variable inside the script otherwise.*

## 4. Local Image R2 Bucket Seeding

We employ a unified local API endpoint to seed images into the Miniflare local emulator to easily bypass Wrangler CLI Auth loops. 
As long as the application is running via `pnpm dev`, navigate to `backend/question_images` and execute the following payload to loop over your pictures and cache them into the local bucket via the worker PUT route mounted at `http://localhost:8787/images/:filename`.

```bash
# Node one-liner to push images rapidly into R2 Miniflare environment
node -e "const fs=require('fs'); const files=fs.readdirSync('.').filter(f=>f.endsWith('.png')); Promise.all(files.map(f=>fetch('http://localhost:8787/images/'+f, {method:'PUT', body: fs.readFileSync(f)}).then(r=>r.text()).then(t=>console.log(f, t)))).catch(console.error)"
```

## 5. Automated Database Linking

Once your baseline `questions` text row entities and R2 images both safely exist independently, you dynamically connect them.

Modify or recreate a `scripts/link_images.ts` typescript file structured fundamentally like this:
```typescript
import { createDb } from '../src/db/index.js';
import * as schema from '../src/db/schema/index.js';
import { like } from 'drizzle-orm';

async function main() {
  const db = createDb({ DATABASE_URL: process.env.DATABASE_URL! } as any);
  const baseUrl = "http://localhost:8787/images";

  // Use the Reference Instruction keywords stored over 'topic' to link precise images!
  await db.update(schema.questions)
    .set({ imageUrl: `${baseUrl}/biology_jamb_2010_six_seven.png` })
    .where(like(schema.questions.topic, '%6 and 7%'));
  // ... Repeat for all necessary image bounds ...
}

main();
```

Run this final command to write the urls to DB:
```bash
npx tsx scripts/link_images.ts
```

Your database is now fully populated, and `QuestionCard.svelte` will automatically render everything robustly!
