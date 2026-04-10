import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import { rateLimit } from "../middleware/rate-limit.middleware";
import type { Env } from "../env";

const auth = new Hono<{ Bindings: Env }>();

auth.use("*", rateLimit(60));

auth.all("*", async (c) => {
  console.log(`[Auth Route] Handling ${c.req.method} ${c.req.url}`);
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});



export default auth;

