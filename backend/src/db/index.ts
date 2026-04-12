import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema";
import type { Env } from "../env";

/**
 * createDb — returns the appropriate Drizzle client based on environment.
 *
 * DEV  (local pgAdmin):
 *   Uses node-postgres Pool with the local DATABASE_URL.
 *   No WebSocket needed — plain TCP connection to localhost postgres.
 *
 * PRODUCTION (Cloudflare Workers + Neon):
 *   Uses Hyperdrive connectionString → neon-http driver.
 *   Hyperdrive pools TCP connections so Workers can reach Neon over HTTP/2.
 */
export function createDb(env: Env) {
  const isProduction = env.NODE_ENV === "production";

  if (isProduction && env.HYPERDRIVE?.connectionString) {
    // Production: Neon via Cloudflare Hyperdrive
    const sql = neon(env.HYPERDRIVE.connectionString);
    return drizzleNeon(sql, { schema });
  }

  // Development / Staging: direct local postgres (pgAdmin)
  // Using DATABASE_URL which points to 127.0.0.1:5432/mockcenter
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    // Force IPv4 — on Windows, "localhost" resolves to ::1 (IPv6)
    // but pgAdmin only listens on 127.0.0.1 (IPv4).
    // Use 127.0.0.1 directly in DATABASE_URL to avoid this.
  });

  return drizzleNode(pool, { schema });
}

export type Database = ReturnType<typeof createDb>;
