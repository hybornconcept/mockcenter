import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";
import type { Env } from "../env";

/**
 * createCorsMiddleware — CORS that works for both dev and production.
 *
 * DEV: Allow all origins (*) so that:
 *   - The SvelteKit frontend (localhost:5173) can call the API (localhost:8787)
 *   - Google OAuth callback redirects aren't blocked
 *   - Wrangler dev proxy requests work without origin mismatch
 *
 * PRODUCTION: Restrict to APP_URL only.
 *
 * credentials: true is REQUIRED for Better Auth cookies to be sent
 * cross-origin. Note: when credentials=true, origin cannot be "*" in the
 * browser — so in dev we reflect the request's Origin header back instead.
 */
export function createCorsMiddleware(env: Env): MiddlewareHandler {
  const isDev = env.NODE_ENV !== "production";

  return cors({
    // In dev: reflect the request origin so credentials work with wildcard-like behavior.
    // In prod: strictly allow only the frontend URL.
    origin: isDev
      ? (origin) => origin ?? env.APP_URL   // reflect back whatever origin sent the request
      : env.APP_URL,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,       // Required for Better Auth cookie-based sessions
    maxAge: 86400,           // Cache preflight for 24h
  });
}
