# ExamNow — Registration & Onboarding Guide

> This file is split into two parts — **Frontend first, then Backend.**
>
> **For your SvelteKit frontend folder:** Tell your AI:
> **"Implement all FRONTEND STEPS in REGISTER.md exactly as written, in order."**
>
> **For your backend folder:** Tell your AI:
> **"Implement all BACKEND STEPS in REGISTER.md exactly as written, in order."**

---

## Overview — Flow

```
Step 1: Sign Up + Onboarding   → single /register page, multi-section form
Step 2: Verify Email           → user clicks link in inbox → 20 free credits awarded
Step 3: Dashboard unlocks      → only after email verified + onboarding complete
```

Users cannot access the dashboard until both email is verified and onboarding is complete.
Credits are only awarded AFTER email is verified — not at signup.
Google users skip email verification — credits are awarded immediately.

---

---

# ═══════════════════════════════════
# FRONTEND STEPS  (SvelteKit)
# ═══════════════════════════════════

---

## FRONTEND STEP 1 — File structure to create

Match this exact folder structure in your SvelteKit project:

```
src/routes/
│
├── (auth)/                               ← PUBLIC group — no auth required
│   ├── +layout.ts                        ← redirects to /dashboard if already logged in
│   ├── login/
│   │   └── +page.svelte                  ← /login
│   ├── register/
│   │   └── +page.svelte                  ← /register (sign up + onboarding in one page)
│   └── forgot-password/
│       └── +page.svelte                  ← /forgot-password
│
├── (app)/                                ← PROTECTED group — requires auth
│   ├── +layout.ts                        ← redirects to /login if not logged in
│   └── dashboard/
│       └── +page.svelte                  ← /dashboard
│
├── verify-email/
│   └── +page.svelte                      ← /verify-email (outside both groups)
│
├── logout/
│   └── +page.ts                          ← handles sign out
│
├── +layout.ts                            ← root layout (shared logic)
└── +page.svelte                          ← landing page
```

> Route groups like `(auth)` and `(app)` do NOT appear in the URL.
> `/login` not `/(auth)/login` — the brackets are invisible in the browser.

---

### Create `src/routes/(auth)/+layout.ts` — redirect logged-in users away from auth pages

```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  const res = await fetch('/api/users/me');

  if (!res.ok) {
    // Not logged in — allow access to login, register etc.
    return {};
  }

  const { data: user } = await res.json();

  // Already logged in — send them to the right place
  if (user.emailVerified !== 'true') {
    throw redirect(302, '/verify-email');
  }
  if (!user.targetExam) {
    // Google user or incomplete registration — send back to register
    throw redirect(302, '/register');
  }
  throw redirect(302, '/dashboard');
};
```

---

### Create `src/routes/(app)/+layout.ts` — protect dashboard

```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  const res = await fetch('/api/users/me');

  if (!res.ok) {
    throw redirect(302, '/login');
  }

  const { data: user } = await res.json();

  if (user.emailVerified !== 'true') {
    throw redirect(302, '/verify-email');
  }

  if (!user.targetExam) {
    throw redirect(302, '/register');
  }

  // Pass user to all (app) pages via $page.data.user
  return { user };
};
```

---

### Create `src/routes/logout/+page.ts` — handle sign out

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  await fetch('/api/auth/sign-out', { method: 'POST' });
  throw redirect(302, '/login');
};
```

---

## FRONTEND STEP 2 — Register Page (`/register`)

This is a **single-page multi-section form**. The page shows sections progressively
as the user fills them in. The submit button only appears once all required sections are visible and filled.

---

### Section 1 — Account Details (always visible)

| Field | Input Type | Required | Placeholder | Validation |
|---|---|---|---|---|
| Full name | `text` | YES | "Enter your full name" | min 2 characters |
| Email address | `email` | YES | "you@example.com" | valid email format |
| Password | `password` | YES | "Min. 8 characters" | min 8 characters, show/hide toggle |
| Referral code | `text` | NO | "Have a referral code? (optional)" | none |

---

### Section 2 — Who are you? (appears after Section 1 fields are filled)

Two large clickable cards side by side. Clicking one instantly reveals Section 3.

| Element | Input Type | Field name | Value |
|---|---|---|---|
| "I'm a Student" card | `radio` styled as card | `userType` | `student` |
| "I'm a Professional" card | `radio` styled as card | `userType` | `professional` |

> Use a reactive variable `userType` in Svelte. When it changes, Section 3 updates instantly.

---

### Section 3A — Student Exam Details (show when `userType === 'student'`)

| Field | Input Type | Required | Options | Notes |
|---|---|---|---|---|
| Which exam are you preparing for? | `select` | YES | JAMB/UTME, WAEC/SSCE, NECO, Post-UTME, Common Entrance, NABTEB | — |
| Target field (see table below) | dynamic | YES | depends on exam selected | label + input changes based on exam |
| When is your exam? | `date` | YES | min: today's date | — |
| Which state are you in? | `select` | YES | Full list below | — |

#### Target field logic — Student (changes based on `targetExam`)

| Exam selected | Field label | Input type | Min | Max | Step | Placeholder |
|---|---|---|---|---|---|---|
| JAMB/UTME | "What score are you targeting?" | `number` | 100 | 400 | 1 | "e.g. 280" |
| WAEC/SSCE | "How many credits are you targeting?" | `number` | 1 | 9 | 1 | "e.g. 6 (A1–C6 grades)" |
| NECO | "How many credits are you targeting?" | `number` | 1 | 9 | 1 | "e.g. 6 (A1–C6 grades)" |
| NABTEB | "How many credits are you targeting?" | `number` | 1 | 9 | 1 | "e.g. 5" |
| Post-UTME | "What score are you targeting?" | `number` | 1 | 100 | 1 | "e.g. 70" |
| Common Entrance | "What score are you targeting?" | `number` | 50 | 100 | 1 | "e.g. 75" |

> In Svelte, bind `targetExam` and use `{#if}` to swap the label and min/max/placeholder dynamically.
> The field name stays `targetScore` in all cases — only the label and constraints change.

---

### Section 3B — Professional Exam Details (show when `userType === 'professional'`)

| Field | Input Type | Required | Options | Notes |
|---|---|---|---|---|
| Which professional exam? | `select` | YES | ICAN, ICAN ATSWA, CITN, Law School, TRCN, IELTS, NIMASA, Other | — |
| What level are you sitting? | `select` | YES | Foundation, Skills, Professional | Hide when exam is IELTS or Other — auto-set to `not_applicable` |
| Target field (see table below) | dynamic | YES | depends on exam selected | label + input changes based on exam |
| When is your exam sitting? | `date` | YES | min: today's date | — |
| Which state are you in? | `select` | YES | Full list below | — |

#### Target field logic — Professional (changes based on `targetExam`)

| Exam selected | Field label | Input type | Min | Max | Step | Placeholder |
|---|---|---|---|---|---|---|
| ICAN | "How many papers are you sitting this sitting?" | `number` | 1 | 6 | 1 | "e.g. 2" |
| ICAN ATSWA | "How many papers are you sitting this sitting?" | `number` | 1 | 3 | 1 | "e.g. 3" |
| CITN | "How many papers are you sitting this sitting?" | `number` | 1 | 6 | 1 | "e.g. 2" |
| Law School | "How many papers are you sitting this sitting?" | `number` | 1 | 5 | 1 | "e.g. 3" |
| TRCN | "What score are you targeting?" | `number` | 40 | 100 | 1 | "e.g. 60" |
| IELTS | "What band score are you targeting?" | `number` | 4 | 9 | 0.5 | "e.g. 7.0" |
| NIMASA | "What score are you targeting?" | `number` | 40 | 100 | 1 | "e.g. 60" |
| Other | "What score are you targeting?" | `number` | 1 | 100 | 1 | "e.g. 50" |

> For professional exams where the goal is just to **pass**, the "papers sitting" number is more useful
> than a score — it tells the AI how to split the user's study plan across papers.

---

### Nigerian states list — use for both Section 3A and 3B

```
Abia, Adamawa, Akwa Ibom, Anambra, Bauchi, Bayelsa, Benue, Borno,
Cross River, Delta, Ebonyi, Edo, Ekiti, Enugu, FCT (Abuja), Gombe,
Imo, Jigawa, Kaduna, Kano, Katsina, Kebbi, Kogi, Kwara, Lagos,
Nasarawa, Niger, Ogun, Ondo, Osun, Oyo, Plateau, Rivers, Sokoto,
Taraba, Yobe, Zamfara
```

---

### Section 4 — Submit (appears only after Section 3 is visible)

| Element | Type | Label | Action |
|---|---|---|---|
| Submit button | `button` type="submit" | "Create my account" | See submission logic below |
| Google button | `button` | "Continue with Google" | redirect to `/api/auth/sign-in/google` |
| Login link | `a` | "Already have an account? Login" | navigate to `/login` |

---

### Form skip logic (Svelte reactive summary)

```
userType not selected         → Section 3 hidden, submit hidden
userType = 'student'          → Section 3A visible, Section 3B hidden
userType = 'professional'     → Section 3B visible, Section 3A hidden

── Student target field ──
targetExam = 'jamb'           → label: "What score are you targeting?"  min:100  max:400
targetExam = 'waec'           → label: "How many credits are you targeting?"  min:1  max:9
targetExam = 'neco'           → label: "How many credits are you targeting?"  min:1  max:9
targetExam = 'nabteb'         → label: "How many credits are you targeting?"  min:1  max:9
targetExam = 'post_utme'      → label: "What score are you targeting?"  min:1  max:100
targetExam = 'common_entrance'→ label: "What score are you targeting?"  min:50  max:100

── Professional target field ──
targetExam = 'ican'           → label: "How many papers are you sitting?"  min:1  max:6
targetExam = 'ican_atswa'     → label: "How many papers are you sitting?"  min:1  max:3
targetExam = 'citn'           → label: "How many papers are you sitting?"  min:1  max:6
targetExam = 'law_school'     → label: "How many papers are you sitting?"  min:1  max:5
targetExam = 'trcn'           → label: "What score are you targeting?"  min:40  max:100
targetExam = 'ielts'          → label: "What band score are you targeting?"  min:4  max:9  step:0.5
targetExam = 'nimasa'         → label: "What score are you targeting?"  min:40  max:100
targetExam = 'other'          → label: "What score are you targeting?"  min:1  max:100

── Exam level field ──
targetExam = 'ielts'
  or targetExam = 'other'     → hide exam level field, auto-set examLevel = 'not_applicable'

Section 3 filled              → submit button appears
```

In Svelte this is handled with `{#if}` blocks and a reactive `scoreConfig` object that maps
`targetExam` → `{ label, min, max, step, placeholder }`. One object, zero duplication.

---

### Submission logic (two API calls, one after the other)

When the user clicks "Create my account", do these two calls in sequence:

```javascript
// Call 1 — create the account
const signUpRes = await fetch('/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password, referralCode })
});

if (!signUpRes.ok) {
  // show error message, stop here
  return;
}

// Call 2 — save onboarding data immediately after signup
const onboardingRes = await fetch('/api/users/onboarding', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userType, targetExam, examLevel, targetScore, examDate, state })
});

if (onboardingRes.ok) {
  // redirect to verify-email screen
  goto('/verify-email');
}
```

> Onboarding is saved right after signup so it is not lost even before email verification.
> The dashboard guard still checks `emailVerified` before letting them in.

---

## FRONTEND STEP 3 — Login Page (`/login`)

### Form fields

| Field | Input Type | Required | Placeholder | Validation |
|---|---|---|---|---|
| Email address | `email` | YES | "you@example.com" | valid email format |
| Password | `password` | YES | "Enter your password" | required |

### Buttons on this page

| Element | Type | Label | Action |
|---|---|---|---|
| Submit button | `button` type="submit" | "Login" | POST to `/api/auth/sign-in/email` |
| Google button | `button` | "Continue with Google" | redirect to `/api/auth/sign-in/google` |
| Register link | `a` | "Don't have an account? Sign up" | navigate to `/register` |
| Forgot password | `a` | "Forgot password?" | navigate to `/forgot-password` |

### After successful login — run this check in order

```javascript
const user = await fetch('/api/users/me').then(r => r.json());

if (user.data.emailVerified !== 'true') {
  goto('/verify-email');
} else if (!user.data.targetExam) {
  // Google users who skipped registration form — send back to fill details
  goto('/register');
} else {
  goto('/dashboard');
}
```

---

## FRONTEND STEP 4 — Verify Email Page (`/verify-email`)

Static screen — no form. Just a message and a resend button.

### UI elements

| Element | Type | Label | Action |
|---|---|---|---|
| Heading | text | "Check your inbox" | — |
| Subtext | text | "We sent a verification link to your email. Click it to activate your account and receive 20 free credits." | — |
| Resend button | `button` | "Resend verification email" | POST to `/api/auth/send-verification-email` with `{ email }` |
| Back link | `a` | "Back to login" | navigate to `/login` |

> Disable the resend button for 60 seconds after clicking to prevent spam.
> Show a success toast when resend is clicked: "Email resent! Check your inbox."

---

## FRONTEND STEP 5 — Route Guards (`src/hooks.server.ts`)

Create this file to protect routes automatically:

```typescript
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/login', '/register'];
  const path = event.url.pathname;

  const res = await fetch(`${event.url.origin}/api/users/me`, {
    headers: { cookie: event.request.headers.get('cookie') ?? '' },
  });

  const isLoggedIn = res.ok;
  const user = isLoggedIn ? await res.json() : null;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && authRoutes.includes(path)) {
    if (user?.data?.emailVerified !== 'true') {
      return Response.redirect(`${event.url.origin}/verify-email`, 302);
    }
    if (!user?.data?.targetExam) {
      // Still needs to complete onboarding (e.g. Google sign-in user)
      return Response.redirect(`${event.url.origin}/register`, 302);
    }
    return Response.redirect(`${event.url.origin}/dashboard`, 302);
  }

  // Redirect logged-out users away from protected pages
  if (!isLoggedIn && protectedRoutes.includes(path)) {
    return Response.redirect(`${event.url.origin}/login`, 302);
  }

  return resolve(event);
};
```

---


---

# ═══════════════════════════════════
# BACKEND STEPS  (examenow-backend)
# ═══════════════════════════════════

---

## BACKEND STEP 1 — Update Schema

### 1.1 Update `src/db/schema/users.ts`

```typescript
import { pgTable, uuid, text, integer, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userTypeEnum = pgEnum("user_type", [
  "student",
  "professional",
]);

export const examTypeEnum = pgEnum("exam_type", [
  "jamb", "waec", "neco", "post_utme", "common_entrance", "nabteb",
  "ican", "ican_atswa", "citn", "law_school", "trcn", "ielts", "nimasa", "other",
]);

export const examLevelEnum = pgEnum("exam_level", [
  "foundation", "skills", "professional", "not_applicable",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  school: text("school"),
  state: text("state"),

  // Onboarding fields
  userType: userTypeEnum("user_type"),
  targetExam: examTypeEnum("target_exam"),
  examLevel: examLevelEnum("exam_level"),
  targetScore: integer("target_score"),
  examDate: date("exam_date"),

  // Credits & referral
  emailVerified: text("email_verified").notNull().default("false"),
  creditBalance: integer("credit_balance").notNull().default(0),
  referralCode: text("referral_code").unique().notNull(),
  referredBy: uuid("referred_by").references((): any => users.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 1.2 Run migration

```bash
pnpm db:generate
pnpm db:migrate
```

---

## BACKEND STEP 2 — Auth config with email verification + credit hook

Update `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq, sql } from "drizzle-orm";
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
      requireEmailVerification: true,
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,

      async onEmailVerified({ user }) {
        // Award 20 free credits when email is verified
        await db
          .update(schema.users)
          .set({
            creditBalance: sql`credit_balance + 20`,
            emailVerified: "true",
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, user.id));

        // Handle referral reward if user was referred
        const referredUser = await db.query.users.findFirst({
          where: eq(schema.users.id, user.id),
          columns: { referredBy: true, name: true },
        });

        if (referredUser?.referredBy) {
          await db.insert(schema.referrals).values({
            referrerId: referredUser.referredBy,
            referredId: user.id,
            status: "signed_up",
          }).onConflictDoNothing();

          await db.insert(schema.notifications).values({
            userId: referredUser.referredBy,
            type: "referral",
            title: "New Referral!",
            message: `${referredUser.name} just signed up using your referral link! Earn more credits when they make their first purchase.`,
          });
        }
      },
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

## BACKEND STEP 3 — Referral code helper

Create `src/lib/referral.ts`:

```typescript
export function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X");
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${suffix}`;
}
```

---

## BACKEND STEP 4 — Validators

Update `src/validators/auth.validator.ts`:

```typescript
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
```

Create `src/validators/onboarding.validator.ts`:

```typescript
import { z } from "zod";

export const onboardingSchema = z.object({
  userType: z.enum(["student", "professional"]),

  targetExam: z.enum([
    "jamb", "waec", "neco", "post_utme", "common_entrance", "nabteb",
    "ican", "ican_atswa", "citn", "law_school", "trcn", "ielts", "nimasa", "other"
  ]),

  examLevel: z.enum([
    "foundation", "skills", "professional", "not_applicable"
  ]).default("not_applicable"),

  // targetScore meaning depends on exam type:
  // JAMB: 100–400 (raw score)
  // WAEC/NECO/NABTEB: 1–9 (number of credits)
  // Post-UTME: 1–100 (percentage)
  // Common Entrance: 50–100 (percentage)
  // ICAN/CITN/Law School/ICAN ATSWA: 1–6 (number of papers)
  // IELTS: 4–9 (band score, stored as x10 integer e.g. 7.5 → stored as 75)
  // TRCN/NIMASA/Other: 1–100 (percentage)
  targetScore: z.number()
    .min(1, "Enter a valid target")
    .max(400, "Value out of range"),

  examDate: z.string()
    .refine((val) => new Date(val) > new Date(), {
      message: "Exam date must be in the future",
    }),

  state: z.enum([
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti",
    "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
    "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
  ]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
```

---

## BACKEND STEP 5 — Users route

Create `src/routes/users.route.ts`:

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { users } from "../db/schema";
import { requireAuth } from "../middleware/auth.middleware";
import { onboardingSchema } from "../validators/onboarding.validator";
import type { Env } from "../env";

const usersRoute = new Hono<{ Bindings: Env }>();

// PATCH /api/users/onboarding
usersRoute.patch(
  "/onboarding",
  requireAuth,
  zValidator("json", onboardingSchema),
  async (c) => {
    const db = createDb(c.env);
    const currentUser = c.get("user" as any);
    const body = c.req.valid("json");

    await db
      .update(users)
      .set({
        userType: body.userType,
        targetExam: body.targetExam,
        examLevel: body.examLevel,
        targetScore: body.targetScore,
        examDate: body.examDate,
        state: body.state,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id));

    return c.json({ success: true, message: "Onboarding complete" });
  }
);

// GET /api/users/me
usersRoute.get("/me", requireAuth, async (c) => {
  const db = createDb(c.env);
  const currentUser = c.get("user" as any);

  const user = await db.query.users.findFirst({
    where: eq(users.id, currentUser.id),
    columns: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      emailVerified: true,
      userType: true,
      targetExam: true,
      examLevel: true,
      targetScore: true,
      examDate: true,
      state: true,
      creditBalance: true,
      referralCode: true,
      createdAt: true,
    },
  });

  if (!user) {
    return c.json({ success: false, message: "User not found" }, 404);
  }

  return c.json({ success: true, data: user });
});

export default usersRoute;
```

---

## BACKEND STEP 6 — Mount users route in `src/index.ts`

Add alongside the existing auth route:

```typescript
import usersRoute from "./routes/users.route";

app.route("/api/users", usersRoute);
```

---

## API Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/sign-up/email` | NO | Register with email + password |
| `POST` | `/api/auth/sign-in/email` | NO | Login with email + password |
| `GET` | `/api/auth/sign-in/google` | NO | Google OAuth login |
| `POST` | `/api/auth/verify-email` | NO | Verify email from link |
| `POST` | `/api/auth/send-verification-email` | NO | Resend verification email |
| `PATCH` | `/api/users/onboarding` | YES | Complete onboarding |
| `GET` | `/api/users/me` | YES | Get current user profile |
| `POST` | `/api/auth/sign-out` | YES | Sign out |

---

> Registration & onboarding complete. Next: Questions + Practice routes.
