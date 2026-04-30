import type { MiddlewareHandler } from "hono";
import { createAuth } from "../lib/auth";
import type { Env, Variables } from "../env";

/**
 * requireAuth — Hono middleware that validates a Better Auth session.
 *
 * On success: injects `user` and `session` into Hono context for downstream handlers.
 * On failure: returns 401 JSON immediately.
 *
 * Usage:
 *   router.get("/protected", requireAuth, async (c) => {
 *     const user = c.get("user" as any);  // typed as Better Auth session user
 *     ...
 *   });
 */
export const requireAuth: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  let session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;

  try {
    const auth = createAuth(c.env);
    session = await auth.api.getSession({ headers: c.req.raw.headers });
  } catch (err) {
    console.error("[requireAuth] getSession error:", err);
    return c.json(
      { success: false, error: { code: "AUTH_ERROR", message: "Session validation failed" } },
      500
    );
  }

  if (!session?.user) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      401
    );
  }

  // Make user + session available to all subsequent handlers in this route
  c.set("user", session.user);
  c.set("session", session.session);

  return next();
};
