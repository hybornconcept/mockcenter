import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import type { Env } from "../env";

const authRoute = new Hono<{ Bindings: Env }>();

/**
 * Mount Better Auth's handler on ALL methods.
 *
 * Better Auth handles these routes automatically:
 *   POST   /api/auth/sign-up/email          — register with email + password
 *   POST   /api/auth/sign-in/email          — login with email + password
 *   POST   /api/auth/sign-out               — sign out (clears session cookie)
 *   GET    /api/auth/get-session            — get current session
 *   POST   /api/auth/verify-email           — verify email from token in link
 *   POST   /api/auth/send-verification-email — resend verification email
 *   POST   /api/auth/forget-password        — request password reset email
 *   POST   /api/auth/reset-password         — reset password with token
 *   GET    /api/auth/sign-in/social         — initiate Google OAuth
 *   GET    /api/auth/callback/google         — Google OAuth callback (from Google)
 *   OPTIONS /api/auth/*                     — CORS preflight
 *
 * Docs: https://www.better-auth.com/docs/integrations/hono
 */
authRoute.all("*", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

export default authRoute;
