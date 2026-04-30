import type { MiddlewareHandler } from "hono";
import { createAuth } from "../lib/auth";
import type { Env, Variables } from "../env";

export const requireAdmin: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  let session: any;
  try {
    session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
  } catch (err) {
    console.error("[requireAdmin] getSession error:", err);
    return c.json({ success: false, error: { code: "AUTH_ERROR", message: "Session error" } }, 500);
  }

  if (!session?.user) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Auth required" } }, 401);
  }

  const adminEmails = (((c.env as any).ADMIN_EMAILS as string | undefined) ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

  const isAdmin = adminEmails.length > 0
    ? adminEmails.includes((session.user.email as string)?.toLowerCase())
    : (session.user as any).userType === "admin";

  if (!isAdmin) {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } }, 403);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};
