# ExamNow — Auth Workflow (Phase 1 Implementation Guide)

> This document is the **single source of truth** for implementing authentication in ExamNow.  
> Read every linked documentation reference before writing a single line of code.  
> Priority: correctness → brevity → performance. No over-engineering.

---

## 📚 Documentation References (Read First)

| Package | Version | Docs URL | Notes |
|---|---|---|---|
| `better-auth` | `^1.2.x` | https://www.better-auth.com/docs/installation | Core auth framework |
| Better Auth Hono integration | — | https://www.better-auth.com/docs/integrations/hono | **Critical** — how to mount auth in Hono |
| Better Auth Drizzle adapter | — | https://www.better-auth.com/docs/adapters/drizzle | DB adapter setup |
| Better Auth Email & Password | — | https://www.better-auth.com/docs/authentication/email-password | Credential auth |
| Better Auth Google OAuth | — | https://www.better-auth.com/docs/authentication/social-sign-on | Google sign-in |
| Better Auth Email Verification | — | https://www.better-auth.com/docs/concepts/email-verification | Verify on sign-up |
| Better Auth Password Reset | — | https://www.better-auth.com/docs/authentication/email-password#password-reset | Reset flow |
| Better Auth Session management | — | https://www.better-auth.com/docs/concepts/session-management | Session config |
| `resend` | `^4.x` | https://resend.com/docs/send-with-nodejs | Email sender |
| Resend React Email | — | https://resend.com/docs/introduction | Email templates |
| `hono` | `^4.x` | https://hono.dev/docs/ | Web framework |
| Hono Cloudflare Workers | — | https://hono.dev/docs/getting-started/cloudflare-workers | Workers setup |
| `drizzle-orm` | `^0.30.x` | https://orm.drizzle.team/docs/overview | ORM reference |
| Drizzle + Neon | — | https://orm.drizzle.team/docs/connect-neon | Neon connection |
| `@neondatabase/serverless` | `^0.9.x` | https://neon.tech/docs/serverless/serverless-driver | Edge-compatible Neon driver |
| `zod` | `^3.x` | https://zod.dev/ | Input validation |
| `wrangler` | `^3.x` | https://developers.cloudflare.com/workers/wrangler/ | CF Workers CLI |
| Cloudflare Hyperdrive | — | https://developers.cloudflare.com/hyperdrive/ | DB connection pooling |

---

## Package Installation

```bash
npm create hono@latest examenow-backend -- --template cloudflare-workers
cd examenow-backend

npm install better-auth drizzle-orm @neondatabase/serverless resend zod
npm install -D drizzle-kit wrangler @types/node tsx
```

**Exact versions to pin in `package.json`:**
```json
{
  "dependencies": {
    "better-auth": "^1.2.0",
    "drizzle-orm": "^0.30.0",
    "@neondatabase/serverless": "^0.9.0",
    "resend": "^4.0.0",
    "zod": "^3.22.0",
    "hono": "^4.3.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.21.0",
    "wrangler": "^3.0.0",
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^5.4.0"
  }
}
```

---

## Environment Variables

### `.env` (local dev — never commit)
```env
# App
NODE_ENV=development
APP_URL=http://localhost:5173
API_URL=http://localhost:8787

# Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.neon.tech/examenow?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.neon.tech/examenow?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:8787

# Google OAuth — https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret

# Resend — https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@examenow.ng
RESEND_FROM_NAME=ExamNow
```

### `.env.example` (commit this — no real values)
```env
NODE_ENV=development
APP_URL=http://localhost:5173
API_URL=http://localhost:8787
DATABASE_URL=
DATABASE_URL_UNPOOLED=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=ExamNow
```

### Generate `BETTER_AUTH_SECRET`
```bash
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## `wrangler.toml`

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
NODE_ENV = "development"

# Hyperdrive — only used in production (Workers can't hold TCP connections)
# Create via: wrangler hyperdrive create examenow-hyperdrive --connection-string="$DATABASE_URL"
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "YOUR_HYPERDRIVE_ID"

[env.production]
name = "examenow-api-production"

[env.production.vars]
NODE_ENV = "production"
APP_URL = "https://examenow.ng"
API_URL = "https://api.examenow.ng"

# Set these via CLI — never in this file:
# wrangler secret put BETTER_AUTH_SECRET --env production
# wrangler secret put DATABASE_URL --env production
# wrangler secret put GOOGLE_CLIENT_SECRET --env production
# wrangler secret put RESEND_API_KEY --env production
```

---

## File-by-File Implementation Guide

### 1. `src/env.ts` — Typed + Validated Environment

**Purpose:** Centralise all env access. Throw at startup if anything is missing.  
**Docs:** https://zod.dev/#basic-usage

```typescript
// src/env.ts
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM_EMAIL: z.string().email(),
  RESEND_FROM_NAME: z.string().default("ExamNow"),
  // Hyperdrive binding is injected by Cloudflare Workers runtime — not a string
})

export type Env = z.infer<typeof envSchema> & {
  HYPERDRIVE: Hyperdrive  // Cloudflare Hyperdrive binding (Workers runtime type)
}

export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env)
  if (!result.success) {
    throw new Error(`❌ Invalid environment variables:\n${result.error.toString()}`)
  }
  return result.data as Env
}
```

**Important:** In Cloudflare Workers, env vars are passed as the second argument to `fetch(request, env)`, not via `process.env`. Better Auth and Drizzle must receive env at request time, not at module load time. See the Hono integration pattern below.

---

### 2. `src/db/schema/auth.ts` — Better Auth Tables

**Purpose:** Define exactly the tables Better Auth expects.  
**Docs:** https://www.better-auth.com/docs/adapters/drizzle  
**Critical:** Column names must match Better Auth's expected schema exactly. Do not rename them.

```typescript
// src/db/schema/auth.ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"

// Better Auth requires these exact 4 tables with these exact column names.
// Reference: https://www.better-auth.com/docs/adapters/drizzle#schema

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
})

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),  // "credential" | "google"
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),  // bcrypt hash — only for "credential" provider
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),  // email address
  value: text("value").notNull(),             // token
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
})
```

---

### 3. `src/db/schema/users.ts` — ExamNow User Extensions

**Purpose:** App-specific user fields that extend Better Auth's base `user` table.  
**Important:** This is a separate table that joins to `user.id`, NOT modifying Better Auth's table.

```typescript
// src/db/schema/users.ts
import { pgTable, text, integer, date, timestamp, uuid } from "drizzle-orm/pg-core"
import { users as authUsers } from "./auth"

// Extended profile — joined to Better Auth's user table via userId
export const userProfiles = pgTable("user_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => authUsers.id, { onDelete: "cascade" }),
  phone: text("phone"),
  school: text("school"),
  state: text("state"),                    // Nigerian state
  targetExam: text("target_exam"),         // jamb | waec | neco | ielts | professional
  targetScore: integer("target_score"),
  examDate: date("exam_date"),
  creditBalance: integer("credit_balance").notNull().default(0),
  referralCode: text("referral_code").unique(),  // auto-generated on sign-up
  referredBy: text("referred_by").references(() => authUsers.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
```

---

### 4. `src/db/schema/index.ts` — Re-export All Schema

```typescript
// src/db/schema/index.ts
export * from "./auth"
export * from "./users"
// Future: export * from "./credits"  etc.
```

---

### 5. `src/db/index.ts` — Drizzle Client (Hyperdrive-aware)

**Purpose:** Return the correct Drizzle client depending on environment.  
**Docs:**  
- Drizzle + Neon: https://orm.drizzle.team/docs/connect-neon  
- Neon serverless driver: https://neon.tech/docs/serverless/serverless-driver  
- Hyperdrive: https://developers.cloudflare.com/hyperdrive/get-started/

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
import type { Env } from "../env"

export function createDb(env: Env) {
  // In production: Hyperdrive intercepts the connection string and pools it.
  // In development: connects directly to Neon via the URL.
  // Hyperdrive exposes a .connectionString property when the binding is active.
  const connectionString =
    env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL

  const sql = neon(connectionString)
  return drizzle(sql, { schema })
}

export type DB = ReturnType<typeof createDb>
```

**Why `neon-http` and not `neon-serverless`?**  
Cloudflare Workers does not support WebSockets at the module level. `neon-http` uses HTTP/2 fetch internally — fully edge-compatible. Use `neon-serverless` only in Node.js environments.

---

### 6. `src/lib/email.ts` — Resend Email Client

**Purpose:** Single place for all transactional emails.  
**Docs:** https://resend.com/docs/send-with-nodejs

```typescript
// src/lib/email.ts
import { Resend } from "resend"
import type { Env } from "../env"

// --- Email Templates ---

function verificationEmailHtml(name: string, url: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:-apple-system,sans-serif;background:#f5f5f0;padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;padding:40px;border:1px solid rgba(0,0,0,0.08);">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#3B6D11;color:#fff;font-size:18px;font-weight:700;padding:8px 20px;border-radius:8px;">ExamNow</div>
        </div>
        <h2 style="font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Verify your email address</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:24px;">Hi ${name}, click the button below to verify your ExamNow account. This link expires in <strong>1 hour</strong>.</p>
        <a href="${url}" style="display:block;text-align:center;background:#3B6D11;color:#fff;font-size:15px;font-weight:700;padding:14px 0;border-radius:10px;text-decoration:none;">Verify my email</a>
        <p style="color:#aaa;font-size:12px;margin-top:20px;text-align:center;">If you did not create an ExamNow account, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `
}

function passwordResetEmailHtml(name: string, url: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:-apple-system,sans-serif;background:#f5f5f0;padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;padding:40px;border:1px solid rgba(0,0,0,0.08);">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#3B6D11;color:#fff;font-size:18px;font-weight:700;padding:8px 20px;border-radius:8px;">ExamNow</div>
        </div>
        <h2 style="font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:24px;">Hi ${name}, click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${url}" style="display:block;text-align:center;background:#111;color:#fff;font-size:15px;font-weight:700;padding:14px 0;border-radius:10px;text-decoration:none;">Reset my password</a>
        <p style="color:#aaa;font-size:12px;margin-top:20px;text-align:center;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `
}

// --- Send Functions ---

export async function sendVerificationEmail(
  env: Env,
  to: string,
  name: string,
  url: string
): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY)
  await resend.emails.send({
    from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
    to,
    subject: "Verify your ExamNow account",
    html: verificationEmailHtml(name, url),
  })
}

export async function sendPasswordResetEmail(
  env: Env,
  to: string,
  name: string,
  url: string
): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY)
  await resend.emails.send({
    from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
    to,
    subject: "Reset your ExamNow password",
    html: passwordResetEmailHtml(name, url),
  })
}
```

**Important Resend notes:**
- Free tier: 3,000 emails/month, 100/day. Upgrade before launch.
- Domain must be verified in Resend dashboard before sending from `@examenow.ng`.
- For local dev, use a test email like `onboarding@resend.dev` until domain is verified.
- Resend docs on domain verification: https://resend.com/docs/dashboard/domains/introduction

---

### 7. `src/lib/auth.ts` — Better Auth Instance

**Purpose:** The single Better Auth configuration. All auth logic lives here.  
**Docs:**
- Main config: https://www.better-auth.com/docs/installation
- Hono adapter: https://www.better-auth.com/docs/integrations/hono
- Drizzle adapter: https://www.better-auth.com/docs/adapters/drizzle
- Google plugin: https://www.better-auth.com/docs/authentication/social-sign-on#google
- Email verification: https://www.better-auth.com/docs/concepts/email-verification

**Critical design decision:** Better Auth is instantiated per-request in Cloudflare Workers because the DB connection and env vars are only available at request time (passed as `env` by the Workers runtime). Do NOT instantiate at module level.

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createDb } from "../db"
import { sendVerificationEmail, sendPasswordResetEmail } from "./email"
import * as schema from "../db/schema"
import type { Env } from "../env"

// Called once per request — env is the Workers runtime env binding object
export function createAuth(env: Env) {
  const db = createDb(env)

  return betterAuth({
    // ── Core config ──────────────────────────────────────────────
    // Docs: https://www.better-auth.com/docs/installation#configuration
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.APP_URL],

    // ── Database adapter ─────────────────────────────────────────
    // Docs: https://www.better-auth.com/docs/adapters/drizzle
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),

    // ── Email & Password ─────────────────────────────────────────
    // Docs: https://www.better-auth.com/docs/authentication/email-password
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,   // Block sign-in until email verified
      minPasswordLength: 8,
      maxPasswordLength: 128,

      // Called by Better Auth after user registers — sends verification email
      sendVerificationEmail: async ({ user, url }) => {
        await sendVerificationEmail(env, user.email, user.name, url)
      },

      // Called by Better Auth when user requests password reset
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail(env, user.email, user.name, url)
      },
    },

    // ── Email Verification config ─────────────────────────────────
    // Docs: https://www.better-auth.com/docs/concepts/email-verification
    emailVerification: {
      sendOnSignUp: true,                // Automatically email on registration
      expiresIn: 60 * 60,               // Token expires in 1 hour (seconds)
      autoSignInAfterVerification: true, // Sign user in immediately after verifying
    },

    // ── Google OAuth ──────────────────────────────────────────────
    // Docs: https://www.better-auth.com/docs/authentication/social-sign-on
    // Setup: https://console.cloud.google.com/
    // Authorised redirect URI to set in Google Console:
    //   Development: http://localhost:8787/api/auth/callback/google
    //   Production:  https://api.examenow.ng/api/auth/callback/google
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        // Google accounts are auto-verified — no email verification needed
        // Better Auth handles this automatically
      },
    },

    // ── Session config ────────────────────────────────────────────
    // Docs: https://www.better-auth.com/docs/concepts/session-management
    session: {
      expiresIn: 60 * 60 * 24 * 30,      // 30 days in seconds
      updateAge: 60 * 60 * 24,            // Refresh session if older than 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,                   // Cache session cookie for 5 minutes
                                          // Reduces DB reads at 10k concurrent users
      },
    },

    // ── Hooks — run after auth events ─────────────────────────────
    // Docs: https://www.better-auth.com/docs/concepts/hooks
    hooks: {
      after: [
        {
          // After any sign-up (email or Google), create the user_profile row
          matcher: (ctx) => ctx.path === "/sign-up/email" || ctx.path === "/callback/google",
          handler: async (ctx) => {
            // ctx.context.newSession is available after successful sign-up
            const session = ctx.context.newSession
            if (!session?.user?.id) return

            // Generate a unique referral code
            const referralCode = generateReferralCode(session.user.name)

            // Check if this user was referred
            // Better Auth stores the referral_code from the sign-up body in ctx.body
            const referredByCode = (ctx.body as Record<string, string>)?.referral_code

            let referrerId: string | null = null
            if (referredByCode) {
              // Look up the referring user — see referral logic in referrals.route.ts
              // For now, just store the code — the referrals route handles reward logic
              referrerId = await findUserByReferralCode(db, referredByCode)
            }

            // Insert user_profile (ignore if already exists — Google re-auth case)
            await db.insert(schema.userProfiles)
              .values({
                userId: session.user.id,
                referralCode,
                referredBy: referrerId ?? undefined,
                creditBalance: referredByCode ? 20 : 0, // 20 welcome credits if referred
              })
              .onConflictDoNothing()   // Safe for Google re-auth
          },
        },
      ],
    },
  })
}

// ── Helpers ───────────────────────────────────────────────────────

function generateReferralCode(name: string): string {
  // Format: EXAM + first 4 letters of name (uppercase) + 4 random chars
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X")
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `EXAM${prefix}${suffix}`
}

async function findUserByReferralCode(db: ReturnType<typeof createDb>, code: string): Promise<string | null> {
  const { eq } = await import("drizzle-orm")
  const result = await db
    .select({ userId: schema.userProfiles.userId })
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.referralCode, code))
    .limit(1)
  return result[0]?.userId ?? null
}

export type Auth = ReturnType<typeof createAuth>
```

---

### 8. `src/middleware/auth.middleware.ts` — Protect Routes

**Purpose:** Middleware that validates the Better Auth session on every protected route.  
**Docs:** https://www.better-auth.com/docs/integrations/hono#middleware

```typescript
// src/middleware/auth.middleware.ts
import type { MiddlewareHandler } from "hono"
import { createAuth } from "../lib/auth"
import type { Env } from "../env"

// Attach auth instance to Hono context for use in route handlers
export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const auth = createAuth(c.env)
  c.set("auth", auth)
  await next()
}

// Protect a route — returns 401 if no valid session
export const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const auth = createAuth(c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session?.user) {
    return c.json({ success: false, error: { code: "AUTH_REQUIRED", message: "Authentication required" } }, 401)
  }

  // Inject user + session into context for downstream handlers
  c.set("user", session.user)
  c.set("session", session.session)
  await next()
}
```

---

### 9. `src/routes/auth.route.ts` — Mount Better Auth Handler

**Purpose:** Mount Better Auth's built-in handler. It handles ALL auth routes automatically.  
**Docs:** https://www.better-auth.com/docs/integrations/hono

```typescript
// src/routes/auth.route.ts
import { Hono } from "hono"
import { createAuth } from "../lib/auth"
import type { Env } from "../env"

const authRoute = new Hono<{ Bindings: Env }>()

// Better Auth handles all /api/auth/* routes automatically.
// This includes:
//   POST /api/auth/sign-up/email
//   POST /api/auth/sign-in/email
//   POST /api/auth/sign-out
//   GET  /api/auth/session
//   POST /api/auth/verify-email
//   POST /api/auth/forget-password
//   POST /api/auth/reset-password
//   GET  /api/auth/sign-in/social          (initiates Google OAuth)
//   GET  /api/auth/callback/google         (handles Google OAuth callback)
//
// Docs: https://www.better-auth.com/docs/integrations/hono#mount-handler
authRoute.on(["GET", "POST"], "/*", (c) => {
  const auth = createAuth(c.env)
  return auth.handler(c.req.raw)
})

export { authRoute }
```

---

### 10. `src/index.ts` — Hono App Entry Point

**Purpose:** Mount all routes, middleware, and the Better Auth handler.

```typescript
// src/index.ts
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { authRoute } from "./routes/auth.route"
import { validateEnv } from "./env"
import type { Env } from "./env"

const app = new Hono<{ Bindings: Env }>()

// ── Global middleware ─────────────────────────────────────────────
app.use("*", logger())

// CORS — restrict to APP_URL only in production
// Docs: https://hono.dev/docs/middleware/builtin/cors
app.use("*", async (c, next) => {
  const env = validateEnv(c.env as Record<string, unknown>)
  return cors({
    origin: env.NODE_ENV === "production" ? env.APP_URL : "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,           // Required for Better Auth cookies
  })(c, next)
})

// ── Health check ──────────────────────────────────────────────────
app.get("/health", (c) => c.json({ status: "ok", app: "ExamNow API", ts: Date.now() }))

// ── Auth routes ───────────────────────────────────────────────────
// All /api/auth/* handled by Better Auth
app.route("/api/auth", authRoute)

// ── Future routes (add in phases) ─────────────────────────────────
// app.route("/api/users", usersRoute)
// app.route("/api/questions", questionsRoute)
// app.route("/api/practice", practiceRoute)
// app.route("/api/credits", creditsRoute)
// app.route("/api/referrals", referralsRoute)

// ── 404 handler ───────────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } }, 404))

// ── Error handler ─────────────────────────────────────────────────
app.onError((err, c) => {
  console.error("[ExamNow Error]", err)
  return c.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, 500)
})

export default app
```

---

### 11. `drizzle.config.ts` — Migrations Config

**Purpose:** Points drizzle-kit at the Neon DB for generating and running migrations.  
**Docs:** https://orm.drizzle.team/docs/drizzle-config-file

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit"
import * as dotenv from "dotenv"
dotenv.config()

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Always use the UNPOOLED URL for migrations — pooled URL may timeout on DDL
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
  verbose: true,
  strict: true,
})
```

---

## Auth Flow Diagrams

### A) Email Registration + Verification Flow

```
Client                    API (Hono + Better Auth)           Neon DB              Resend
  │                               │                              │                   │
  │  POST /api/auth/sign-up/email │                              │                   │
  │  { name, email, password,     │                              │                   │
  │    referral_code? }           │                              │                   │
  │──────────────────────────────►│                              │                   │
  │                               │  1. Validate input           │                   │
  │                               │  2. Hash password (bcrypt)   │                   │
  │                               │  3. INSERT user              │                   │
  │                               │─────────────────────────────►│                   │
  │                               │  4. INSERT account           │                   │
  │                               │  (providerId: "credential")  │                   │
  │                               │─────────────────────────────►│                   │
  │                               │  5. INSERT verification token│                   │
  │                               │─────────────────────────────►│                   │
  │                               │  6. HOOK: INSERT user_profile│                   │
  │                               │  (referralCode, creditBalance│                   │
  │                               │─────────────────────────────►│                   │
  │                               │  7. sendVerificationEmail    │                   │
  │                               │──────────────────────────────────────────────────►
  │                               │                              │                   │  Send email
  │  { user, session: null }      │                              │                   │  with link
  │◄──────────────────────────────│                              │                   │
  │                               │                              │                   │
  │  [User clicks link in email]  │                              │                   │
  │                               │                              │                   │
  │  POST /api/auth/verify-email  │                              │                   │
  │  { token }                    │                              │                   │
  │──────────────────────────────►│                              │                   │
  │                               │  1. Find verification token  │                   │
  │                               │─────────────────────────────►│                   │
  │                               │  2. UPDATE user.emailVerified│                   │
  │                               │─────────────────────────────►│                   │
  │                               │  3. DELETE verification token│                   │
  │                               │─────────────────────────────►│                   │
  │                               │  4. CREATE session           │                   │
  │                               │─────────────────────────────►│                   │
  │  { user, session }            │                              │                   │
  │  Set-Cookie: session token    │                              │                   │
  │◄──────────────────────────────│                              │                   │
```

### B) Email Sign-In Flow

```
Client                    API (Hono + Better Auth)           Neon DB
  │                               │                              │
  │  POST /api/auth/sign-in/email │                              │
  │  { email, password }          │                              │
  │──────────────────────────────►│                              │
  │                               │  1. Find user by email       │
  │                               │─────────────────────────────►│
  │                               │  2. Check emailVerified      │
  │                               │  3. Compare password (bcrypt)│
  │                               │  4. CREATE session           │
  │                               │─────────────────────────────►│
  │  { user, session }            │                              │
  │  Set-Cookie: better-auth.session (httpOnly, SameSite=Lax)    │
  │◄──────────────────────────────│                              │
```

### C) Google OAuth Flow

```
Client                    API (Hono + Better Auth)     Google OAuth          Neon DB
  │                               │                         │                   │
  │  GET /api/auth/sign-in/social │                         │                   │
  │  ?provider=google             │                         │                   │
  │  &callbackURL=/dashboard      │                         │                   │
  │──────────────────────────────►│                         │                   │
  │                               │  Build Google OAuth URL │                   │
  │  302 Redirect to Google       │                         │                   │
  │◄──────────────────────────────│                         │                   │
  │                               │                         │                   │
  │  [User logs in on Google]     │                         │                   │
  │──────────────────────────────────────────────────────────                   │
  │                               │                         │                   │
  │  GET /api/auth/callback/google│                         │                   │
  │  ?code=...&state=...          │                         │                   │
  │──────────────────────────────►│                         │                   │
  │                               │  Exchange code for token│                   │
  │                               │────────────────────────►│                   │
  │                               │  { access_token, id_token, email, name }    │
  │                               │◄────────────────────────│                   │
  │                               │                         │                   │
  │                               │  UPSERT user (create if new, link if exists)│
  │                               │────────────────────────────────────────────►│
  │                               │  UPSERT account (providerId: "google")      │
  │                               │────────────────────────────────────────────►│
  │                               │  HOOK: UPSERT user_profile                  │
  │                               │────────────────────────────────────────────►│
  │                               │  CREATE session                              │
  │                               │────────────────────────────────────────────►│
  │  302 Redirect to callbackURL  │                         │                   │
  │  Set-Cookie: session token    │                         │                   │
  │◄──────────────────────────────│                         │                   │
```

### D) Password Reset Flow

```
Client                    API (Hono + Better Auth)     Neon DB              Resend
  │                               │                       │                   │
  │  POST /api/auth/forget-password                       │                   │
  │  { email }                    │                       │                   │
  │──────────────────────────────►│                       │                   │
  │                               │  Find user by email   │                   │
  │                               │──────────────────────►│                   │
  │                               │  INSERT reset token   │                   │
  │                               │──────────────────────►│                   │
  │                               │  sendPasswordResetEmail                   │
  │                               │────────────────────────────────────────────►
  │  { message: "Check email" }   │                       │                   │
  │◄──────────────────────────────│                       │                   │
  │                               │                       │                   │
  │  [User clicks link in email]  │                       │                   │
  │                               │                       │                   │
  │  POST /api/auth/reset-password│                       │                   │
  │  { token, newPassword }       │                       │                   │
  │──────────────────────────────►│                       │                   │
  │                               │  Validate token       │                   │
  │                               │  Hash new password    │                   │
  │                               │  UPDATE account.password                  │
  │                               │──────────────────────►│                   │
  │                               │  DELETE reset token   │                   │
  │                               │──────────────────────►│                   │
  │  { message: "Password reset" }│                       │                   │
  │◄──────────────────────────────│                       │                   │
```

---

## Frontend Integration Notes

The AI coding assistant must communicate these exact endpoints to the frontend developer.

### Better Auth Client Setup (Frontend — SvelteKit / React)
**Docs:** https://www.better-auth.com/docs/installation#client-side

```typescript
// frontend/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: "http://localhost:8787",  // Points to Hono API
})

// Usage examples:
// await authClient.signUp.email({ name, email, password })
// await authClient.signIn.email({ email, password })
// await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })
// await authClient.signOut()
// await authClient.getSession()
// await authClient.sendVerificationEmail()
// await authClient.forgetPassword({ email, redirectTo: "/reset-password" })
// await authClient.resetPassword({ token, newPassword })
```

### Sign-up with referral code
```typescript
// Pass referral_code as additional field on sign-up
await authClient.signUp.email({
  name: "Chukwuemeka",
  email: "chukwuemeka@gmail.com",
  password: "securepassword",
  // Better Auth passes unknown fields through to the sign-up body
  // which the hook reads via ctx.body.referral_code
  referral_code: "EXAMABCD1234",
})
```

---

## Google Cloud Console Setup Checklist

Before testing Google OAuth:

1. Go to https://console.cloud.google.com/
2. Create project → **ExamNow**
3. Enable **Google People API** and **Google OAuth2 API**
4. Create OAuth 2.0 credentials (Web application)
5. Add authorised redirect URIs:
   - `http://localhost:8787/api/auth/callback/google` (development)
   - `https://api.examenow.ng/api/auth/callback/google` (production)
6. Add authorised JavaScript origins:
   - `http://localhost:5173` (frontend dev)
   - `https://examenow.ng` (production)
7. Copy Client ID and Client Secret → add to `.env`

---

## Resend Setup Checklist

1. Create account at https://resend.com
2. Add domain `examenow.ng` → verify DNS records
3. Create API key with **Send access** only (not Full Access)
4. Add API key to `.env` as `RESEND_API_KEY`
5. For local dev: use `delivered@resend.dev` as `to` (test email that always succeeds)
6. Docs for domain setup: https://resend.com/docs/dashboard/domains/introduction

---

## Migrations Workflow

```bash
# Step 1 — Generate migration files from schema
npm run db:generate
# Output: src/db/migrations/0000_initial.sql

# Step 2 — Apply to Neon database
npm run db:migrate

# Step 3 — Verify tables in Drizzle Studio
npm run db:studio
# Opens at http://localhost:4983
# Check: user, session, account, verification, user_profile tables exist

# Step 4 — Run dev server
npm run dev
# API at http://localhost:8787

# Step 5 — Test health check
curl http://localhost:8787/health
# Expected: { "status": "ok", "app": "ExamNow API" }

# Step 6 — Test sign-up
curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

---

## Performance Notes for 10k Concurrent Users

| Concern | Solution | Why |
|---|---|---|
| DB connections | Hyperdrive pools connections | Workers can't hold TCP connections — Hyperdrive sits between Workers and Neon |
| Session reads | `cookieCache: { enabled: true }` | Caches session cookie for 5 minutes — avoids DB read on every request |
| Auth instance | Created per-request (not module-level) | Workers are stateless — env bindings only available at request time |
| Password hashing | bcrypt (handled by Better Auth) | Better Auth uses bcrypt with sensible cost factor — no tuning needed |
| Email sends | Fire-and-forget (no await in hook) | Verification emails don't block the sign-up response |
| Google tokens | Better Auth handles refresh automatically | No manual token management needed |
| Neon | Serverless — scales automatically | No connection limit concerns with Hyperdrive pooling |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `BETTER_AUTH_SECRET must be at least 32 characters` | Secret too short | `openssl rand -base64 32` |
| `Invalid redirect_uri` from Google | Callback URI not registered | Add exact URI to Google Console |
| `Email not verified` on sign-in | User hasn't clicked verification link | Resend verification email, check Resend logs |
| `Cannot read property 'connectionString' of undefined` | Hyperdrive binding not set | In dev, ensure `DATABASE_URL` env var is set; Hyperdrive is prod-only |
| `CORS error` on frontend | Origin not in trustedOrigins | Add frontend URL to `trustedOrigins` and CORS `origin` |
| `drizzle-orm: column not found` | Better Auth schema mismatch | Column names in `auth.ts` must exactly match Better Auth's expected schema |
| `429 Too Many Requests` on Resend | Hit Resend free tier limit | Upgrade Resend plan or add delay between sends |

---

## Phase 1 Implementation Checklist

Follow this order exactly. Do not skip steps.

- [ ] `package.json` — install all dependencies
- [ ] `tsconfig.json` — strict mode, Workers types
- [ ] `wrangler.toml` — dev + production environments
- [ ] `.env` + `.env.example` — all vars documented
- [ ] `src/env.ts` — Zod-validated env
- [ ] `src/db/schema/auth.ts` — Better Auth tables
- [ ] `src/db/schema/users.ts` — user_profile table
- [ ] `src/db/schema/index.ts` — re-exports
- [ ] `drizzle.config.ts` — migration config
- [ ] Run `npm run db:generate` + `npm run db:migrate`
- [ ] `src/db/index.ts` — Drizzle client factory
- [ ] `src/lib/email.ts` — Resend email functions
- [ ] `src/lib/auth.ts` — Better Auth instance
- [ ] `src/middleware/auth.middleware.ts` — requireAuth
- [ ] `src/routes/auth.route.ts` — Mount Better Auth handler
- [ ] `src/index.ts` — Hono app with CORS + routes
- [ ] `npm run dev` — verify health check at `:8787/health`
- [ ] Test sign-up via curl or Postman
- [ ] Test email verification (check Resend dashboard)
- [ ] Test Google OAuth (verify callback redirect works)
- [ ] Test sign-in with verified account
- [ ] Test password reset flow end-to-end
- [ ] `npm run deploy` — deploy to Cloudflare Workers
- [ ] Set all production secrets via `wrangler secret put`
