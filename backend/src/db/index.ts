import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema";
import type { Env } from "../env";

export function createDb(env: Env) {
  if (env.NODE_ENV === "production" && env.HYPERDRIVE) {
    // Production: Neon via Hyperdrive
    const sql = neon(env.HYPERDRIVE.connectionString);
    return drizzleNeon(sql, { schema });
  }

  // Local dev: plain pgAdmin postgres
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  return drizzleNode(pool, { schema });
}

export type Database = ReturnType<typeof createDb>;
