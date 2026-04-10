import type { MiddlewareHandler } from "hono";
import { createAuth } from "../lib/auth";
import type { Env } from "../env";

export const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const auth = createAuth(c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  c.set("user" as any, session.user);
  c.set("session" as any, session.session);

  return next();
};
