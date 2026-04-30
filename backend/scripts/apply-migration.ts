/**
 * apply-migration.ts
 * Run this once to apply the new schema additions:
 *   - user_status enum
 *   - audit_logs table
 *   - platform_settings table
 *   - users.status column
 *
 * Usage:  npx tsx scripts/apply-migration.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".dev.vars" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not set in .env or .dev.vars");
  process.exit(1);
}

const client = new pg.Client({ connectionString });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath   = path.join(__dirname, "../src/db/migrations/0003_add_status_audit_settings.sql");
const rawSql    = fs.readFileSync(sqlPath, "utf8");

// Drizzle kit uses --> statement-breakpoint as a delimiter
const statements = rawSql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

async function run() {
  await client.connect();
  console.log("✅ Connected to database");

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log("  ✓", stmt.slice(0, 80).replace(/\n/g, " "));
    } catch (err: any) {
      // Skip "already exists" errors so the script is idempotent
      if (
        err.code === "42710" || // duplicate type
        err.code === "42P07" || // duplicate table
        err.code === "42701"    // duplicate column
      ) {
        console.log("  ⟳ Already exists, skipping:", stmt.slice(0, 60).replace(/\n/g, " "));
      } else {
        console.error("  ✗ Error:", err.message, "\n    SQL:", stmt.slice(0, 120));
        await client.end();
        process.exit(1);
      }
    }
  }

  console.log("\n🎉 Migration applied successfully!");
  await client.end();
}

run().catch((err) => {
  console.error("Fatal:", err);
  client.end();
  process.exit(1);
});
