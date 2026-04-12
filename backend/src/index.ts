import { Hono } from "hono";
import { logger } from "hono/logger";
import { validateEnv, type Env } from "./env";
import { createCorsMiddleware } from "./middleware/cors.middleware";
import { rateLimit } from "./middleware/rate-limit.middleware";
import authRoute from "./routes/auth.route";
import usersRoute from "./routes/users.route";
import practiceRoute from "./routes/practice.route";
import imagesRoute from "./routes/images.route";

const app = new Hono<{ Bindings: Env }>();

// ── 1. Request logging ────────────────────────────────────────────────────────
app.use("*", logger());

// ── 2. Env validation — fail fast if any required var is missing ──────────────
// This runs before every request, so misconfiguration is caught immediately.
app.use("*", async (c, next) => {
  validateEnv(c.env);
  return next();
});

// ── 3. CORS — must be BEFORE auth routes so preflight OPTIONS works ───────────
// Dev: reflects Origin header (required for credentials + cross-origin).
// Prod: restricts to APP_URL only.
app.use("*", async (c, next) => {
  return createCorsMiddleware(c.env)(c, next);
});

// ── 4. Rate limiting — applied to all /api/* routes ──────────────────────────
app.use("/api/*", rateLimit(500));

// ── 5. Routes ──────────────────────────────────────────────────────────────────

// Health check — no auth required, useful for uptime monitoring
app.get("/health", (c) =>
  c.json({ status: "ok", app: "MockCenter API", ts: Date.now() })
);

app.get("/", (c) =>
  c.json({ status: "ok", app: "MockCenter API", version: "v1" })
);

// Auth routes — all /api/auth/* handled by Better Auth automatically
// Uses .route() so the authRoute has full Hono context including env bindings
app.route("/api/auth", authRoute);

// Protected API routes
app.route("/api/users", usersRoute);
app.route("/api/practice", practiceRoute);

// Public Image route
app.route("/images", imagesRoute);

// ── 6. 404 handler ────────────────────────────────────────────────────────────
app.notFound((c) =>
  c.json(
    { success: false, error: { code: "NOT_FOUND", message: "Route not found" } },
    404
  )
);

// ── 7. Global error handler ───────────────────────────────────────────────────
app.onError((err, c) => {
  console.error("[MockCenter API Error]", err.message, err.stack);
  return c.json(
    {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
    },
    500
  );
});

export default app;
