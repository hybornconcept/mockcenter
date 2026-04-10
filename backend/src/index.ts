import { Hono } from "hono";
import { validateEnv, type Env } from "./env";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { createCorsMiddleware } from "./middleware/cors.middleware";
import { rateLimit } from "./middleware/rate-limit.middleware";
import { createAuth } from "./lib/auth";
import practiceRoute from "./routes/practice.route";
import usersRoute from "./routes/users.route";

const app = new Hono<{ Bindings: Env }>();

app.use("*", loggerMiddleware);

app.use("*", async (c, next) => {
  validateEnv(c.env);
  return next();
});

app.use("*", async (c, next) => {
  return createCorsMiddleware(c.env.APP_URL)(c, next);
});

app.use("/api/*", rateLimit(1000));

// Mount routes
app.on(["GET", "POST"], "/api/auth/**", async (c) => {
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});
app.route("/api/practice", practiceRoute);
app.route("/api/users", usersRoute);

app.get("/", (c) => {
  return c.json({ status: "ok", app: "ExamNow API", version: "v1" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

export default app;
