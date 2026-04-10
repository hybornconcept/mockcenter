# ExamNow Backend — Implementation Guide (Steps 1–3)

> Copy this file into your project root and tell your AI assistant:
> **"Implement everything in IMPLEMENTATION.md exactly as written."**

---

## STEP 1 — Project Foundation

### 1.1 Create project & install dependencies

```bash
mkdir examenow-backend && cd examenow-backend
pnpm init
pnpm add hono better-auth drizzle-orm @neondatabase/serverless zod valibot @hono/zod-validator pg
pnpm add -D wrangler typescript drizzle-kit @types/node tsx dotenv @cloudflare/workers-types @types/pg
```

---

### 1.2 Create file: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "lib": ["ESNext"],
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*", "drizzle.config.ts"]
}
```

---

### 1.3 Create file: `wrangler.toml`

```toml
name = "examenow-api"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[dev]
port = 8787
local_protocol = "http"

[vars]
APP_NAME = "ExamNow"
API_VERSION = "v1"
NODE_ENV = "development"

[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-config-id-here"

[env.production]
name = "examenow-api-production"

[env.production.vars]
NODE_ENV = "production"
APP_URL = "https://examenow.ng"

[env.staging]
name = "examenow-api-staging"

[env.staging.vars]
NODE_ENV = "staging"
APP_URL = "https://staging.examenow.ng"
```

---

### 1.4 Create file: `.env`

```env
NODE_ENV=development
APP_NAME=ExamNow
APP_URL=http://localhost:5173
API_URL=http://localhost:8787

# LOCAL DEV — pgAdmin (replace yourpassword with your actual postgres password)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/examenow
DATABASE_URL_UNPOOLED=postgresql://postgres:yourpassword@localhost:5432/examenow

BETTER_AUTH_SECRET=at-least-32-chars-random-secret-here
BETTER_AUTH_URL=http://localhost:8787

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret

PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=your-webhook-signing-secret
```

---

### 1.5 Create file: `.env.example`

```env
NODE_ENV=development
APP_NAME=ExamNow
APP_URL=http://localhost:5173
API_URL=http://localhost:8787

DATABASE_URL=
DATABASE_URL_UNPOOLED=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
```

---

### 1.6 Create file: `.gitignore`

```
node_modules/
.env
.env.production
dist/
.wrangler/
*.local
```

---

### 1.7 Create file: `src/env.ts`

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  APP_NAME: z.string(),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  DATABASE_URL: z.string(),
  DATABASE_URL_UNPOOLED: z.string(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string(),
  PAYSTACK_PUBLIC_KEY: z.string(),
  PAYSTACK_WEBHOOK_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema> & {
  HYPERDRIVE: Hyperdrive;
};

export function validateEnv(env: unknown): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${result.error.toString()}`);
  }
  return result.data as Env;
}
```

---

### 1.8 Create file: `src/middleware/cors.middleware.ts`

```typescript
import { cors } from "hono/cors";

export function createCorsMiddleware(appUrl: string) {
  return cors({
    origin: appUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });
}
```

---

### 1.9 Create file: `src/middleware/logger.middleware.ts`

```typescript
import { logger } from "hono/logger";

export const loggerMiddleware = logger();
```

---

### 1.10 Create file: `src/middleware/rate-limit.middleware.ts`

```typescript
import type { MiddlewareHandler } from "hono";

const store = new Map<string, { count: number; reset: number }>();

export function rateLimit(limit: number, windowMs = 60_000): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.reset) {
      store.set(key, { count: 1, reset: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return c.json({ success: false, message: "Too many requests" }, 429);
    }

    record.count++;
    return next();
  };
}
```

---

### 1.11 Create file: `src/index.ts`

```typescript
import { Hono } from "hono";
import { validateEnv, type Env } from "./env";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { createCorsMiddleware } from "./middleware/cors.middleware";
import { rateLimit } from "./middleware/rate-limit.middleware";

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

app.get("/", (c) => {
  return c.json({ status: "ok", app: "ExamNow API", version: "v1" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

export default app;
```

---

### 1.12 Update `package.json` scripts section

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:prod": "wrangler deploy --env production",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  }
}
```

### 1.13 Verify Step 1

```bash
pnpm dev
```

Visit http://localhost:8787 — expect: `{ "status": "ok", "app": "ExamNow API", "version": "v1" }`

---

---

## STEP 2 — Database

### 2.1 Create file: `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
```

---

### 2.2 Create file: `src/db/schema/users.ts`

```typescript
import { pgTable, uuid, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  school: text("school"),
  state: text("state"),
  targetExam: text("target_exam"),
  targetScore: integer("target_score"),
  examDate: date("exam_date"),
  creditBalance: integer("credit_balance").notNull().default(0),
  referralCode: text("referral_code").unique().notNull(),
  referredBy: uuid("referred_by").references((): any => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

---

### 2.3 Create file: `src/db/schema/auth.ts`

```typescript
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

### 2.4 Create file: `src/db/schema/credits.ts`

```typescript
import { pgTable, uuid, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending", "success", "failed", "refunded"
]);

export const creditPackages = pgTable("credit_packages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  priceNgn: integer("price_ngn").notNull(),
  isActive: text("is_active").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  packageId: uuid("package_id").references(() => creditPackages.id),
  amount: integer("amount").notNull(),
  amountNgn: integer("amount_ngn").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  paystackReference: text("paystack_reference").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

---

### 2.5 Create file: `src/db/schema/referrals.ts`

```typescript
import { pgTable, uuid, integer, timestamp, pgEnum, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const referralStatusEnum = pgEnum("referral_status", [
  "signed_up", "purchased", "rewarded"
]);

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: uuid("referrer_id").notNull().references(() => users.id),
  referredId: uuid("referred_id").notNull().references(() => users.id),
  status: referralStatusEnum("status").notNull().default("signed_up"),
  creditsAwarded: integer("credits_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  uniqueReferral: unique().on(t.referrerId, t.referredId),
}));
```

---

### 2.6 Create file: `src/db/schema/questions.ts`

```typescript
import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const examTypeEnum = pgEnum("exam_type", [
  "jamb", "waec", "neco", "ielts", "professional"
]);

export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: examTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: uuid("exam_id").notNull().references(() => exams.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id),
  examId: uuid("exam_id").notNull().references(() => exams.id),
  year: integer("year"),
  topic: text("topic"),
  body: text("body").notNull(),
  creditCost: integer("credit_cost").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const options = pgTable("options", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  body: text("body").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

export const explanations = pgTable("explanations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }).unique(),
  body: text("body").notNull(),
});
```

---

### 2.7 Create file: `src/db/schema/practice.ts`

```typescript
import { pgTable, uuid, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { questions } from "./questions";

export const sessionStatusEnum = pgEnum("session_status", [
  "active", "paused", "completed", "abandoned"
]);

export const practiceSessions = pgTable("practice_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  examId: uuid("exam_id").notNull(),
  subjectIds: jsonb("subject_ids").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answeredCount: integer("answered_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  status: sessionStatusEnum("status").notNull().default("active"),
  resumeState: jsonb("resume_state"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const practiceAnswers = pgTable("practice_answers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  selectedOptionId: uuid("selected_option_id"),
  isCorrect: boolean("is_correct").notNull().default(false),
  timeSpentSecs: integer("time_spent_secs").notNull().default(0),
  answeredAt: timestamp("answered_at").defaultNow(),
});
```

---

### 2.8 Create file: `src/db/schema/bookmarks.ts`

```typescript
import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { questions } from "./questions";

export const bookmarkCollections = pgTable("bookmark_collections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  collectionId: uuid("collection_id").references(() => bookmarkCollections.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  uniqueBookmark: unique().on(t.userId, t.questionId),
}));
```

---

### 2.9 Create file: `src/db/schema/notifications.ts`

```typescript
import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "credit", "referral", "session", "system"
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id).unique(),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  pushEnabled: boolean("push_enabled").notNull().default(true),
  creditAlerts: boolean("credit_alerts").notNull().default(true),
  referralAlerts: boolean("referral_alerts").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

---

### 2.10 Create file: `src/db/schema/index.ts`

```typescript
export * from "./users";
export * from "./auth";
export * from "./credits";
export * from "./referrals";
export * from "./questions";
export * from "./practice";
export * from "./bookmarks";
export * from "./notifications";
```

---

### 2.11 Create file: `src/db/index.ts`

```typescript
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
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
```

> Before running migrations, create the database in pgAdmin first:
> ```sql
> CREATE DATABASE examenow;
> ```

---

### 2.12 Run migrations

```bash
pnpm db:generate
pnpm db:migrate
```

---

---

## STEP 3 — Auth

### 3.1 Create file: `src/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db";
import * as schema from "../db/schema";
import type { Env } from "../env";

export function createAuth(env: Env) {
  const db = createDb(env);

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7,
      },
    },

    trustedOrigins: [env.APP_URL],
  });
}

export type Auth = ReturnType<typeof createAuth>;
```

---

### 3.2 Create file: `src/middleware/auth.middleware.ts`

```typescript
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
```

---

### 3.3 Create file: `src/validators/auth.validator.ts`

```typescript
import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  referralCode: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
```

---

### 3.4 Create file: `src/routes/auth.route.ts`

```typescript
import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import { rateLimit } from "../middleware/rate-limit.middleware";
import type { Env } from "../env";

const auth = new Hono<{ Bindings: Env }>();

auth.use("*", rateLimit(60));

auth.on(["GET", "POST"], "/**", async (c) => {
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});

export default auth;
```

---

### 3.5 Update `src/index.ts` — mount the auth router

Add these two lines to the existing src/index.ts (after the existing imports and before the health check route):

```typescript
import authRoute from "./routes/auth.route";

// Mount routes
app.route("/api/auth", authRoute);
```

---

### 3.6 Verify Step 3

```bash
pnpm dev
```

Test sign-up:

```bash
curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@examenow.ng","password":"password123","name":"Test User"}'
```

Expected: user object + session cookie returned.

---

> Steps 1–3 complete. Next: Step 4 — Questions + Practice routes.
