import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env for drizzle-kit CLI commands (db:generate, db:migrate, db:push, db:studio)
// drizzle-kit runs as a Node.js process, not in Wrangler, so it reads .env directly.
// Wrangler reads .dev.vars — but drizzle-kit needs the same DATABASE_URL.
dotenv.config({ path: ".env" });

// Fallback to .dev.vars format if .env doesn't have it
const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:legacy@127.0.0.1:5432/mockcenter";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    // Always use the UNPOOLED URL for migrations — DDL statements can timeout on pooled connections.
    url: databaseUrl,
  },
  verbose: true,
  strict: false, // Set to true in production to prevent accidental data loss
});
