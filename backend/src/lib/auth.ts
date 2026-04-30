import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq, sql } from "drizzle-orm";
import { createDb } from "../db";
import * as schema from "../db/schema";
import type { Env } from "../env";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

/**
 * createAuth — instantiated ONCE PER REQUEST.
 *
 * In Cloudflare Workers, env bindings (DATABASE_URL, secrets, HYPERDRIVE) are
 * only available at request time — they are NOT available at module load time.
 * So we cannot do `export const auth = betterAuth(...)` at the top level.
 * Instead, we call createAuth(env) at the start of each request handler.
 */
export function createAuth(env: Env) {
  const db = createDb(env);
  const isDev = env.NODE_ENV !== "production";

  return betterAuth({
    // ── Core config ─────────────────────────────────────────────────────────
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    // Trust the frontend + backend origins so cookies work cross-origin in dev
    trustedOrigins: [
      env.APP_URL,
      env.BETTER_AUTH_URL,
      // Dev extras — wrangler binds to 127.0.0.1 but browser uses localhost
      ...(isDev
        ? [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8787",
            "http://127.0.0.1:8787",
          ]
        : []),
    ],

    // ── Database adapter ──────────────────────────────────────────────────────
    // Maps Better Auth's internal model names to our Drizzle table objects.
    // Better Auth reads/writes only the columns it knows about;
    // our extra columns (userType, creditBalance, etc.) are untouched.
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),

    // ── User model — declare extra columns so Better Auth passes them through
    user: {
      additionalFields: {
        phone:        { type: "string",  required: false },
        school:       { type: "string",  required: false },
        state:        { type: "string",  required: false },
        userType:     { type: "string",  required: false },
        targetExam:   { type: "string",  required: false },
        examLevel:    { type: "string",  required: false },
        targetScore:  { type: "number",  required: false },
        examDate:     { type: "string",  required: false },
        creditBalance:{ type: "number",  required: false },
        referralCode: { type: "string",  required: false },
        referredBy:   { type: "string",  required: false },
      },
    },

    // ── Email & Password ──────────────────────────────────────────────────────
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Disabled temporarily until domain is ready
      minPasswordLength: 8,
      maxPasswordLength: 128,

      // Called when user requests a password reset
      sendResetPassword: async ({ user, url }) => {
        // commented out until domain is ready
        // await sendPasswordResetEmail(env, user.email, user.name, url);
        console.log(`[Email] Password reset for ${user.email}: ${url}`);
      },
    },

    // ── Email Verification ────────────────────────────────────────────────────
    emailVerification: {
      sendOnSignUp: false,             // disabled temporarily
      autoSignInAfterVerification: true,

      // Better Auth calls this to actually send the email
      sendVerificationEmail: async ({ user, url }) => {
        // commented out until domain is ready
        // await sendVerificationEmail(env, user.email, user.name, url);
        console.log(`[Email] Verification for ${user.email}: ${url}`);
      },

      // Called after email is successfully verified
      // Awards 20 welcome credits to the newly verified user
      onEmailVerified: async ({ user }: { user: { id: string; name?: string } }) => {
        try {
          // Only award credits once — guard against double-calling
          const existing = await db.query.users.findFirst({
            where: eq(schema.users.id, user.id),
            columns: { creditBalance: true, referredBy: true, name: true },
          });

          if (!existing) return;

          if (existing.creditBalance === 0) {
            await db
              .update(schema.users)
              .set({
                creditBalance: sql`credit_balance + 20`,
                updatedAt: new Date(),
              })
              .where(eq(schema.users.id, user.id));
          }

          // Fire referral reward if this user was referred
          if (existing.referredBy) {
            await db
              .insert(schema.referrals)
              .values({
                referrerId: existing.referredBy,
                referredId: user.id,
                status: "signed_up",
              })
              .onConflictDoNothing();

            await db.insert(schema.notifications).values({
              userId: existing.referredBy,
              type: "referral",
              title: "New Referral!",
              message: `${existing.name} just signed up using your referral link!`,
            });
          }
        } catch (err) {
          // Don't block verification if credit/referral logic fails
          console.error("[onEmailVerified] Error:", err);
        }
      },
    },

    // ── Google OAuth ──────────────────────────────────────────────────────────
    // Authorised redirect URIs to set in Google Cloud Console:
    //   Dev:  http://localhost:8787/api/auth/callback/google
    //   Prod: https://api.examenow.ng/api/auth/callback/google
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },

    // ── Database hooks — run after DB writes ──────────────────────────────────
    databaseHooks: {
      account: {
        create: {
          // Runs AFTER a new account row is inserted (covers Google sign-up)
          after: async (account) => {
            if (account.providerId !== "google") return;

            try {
              const user = await db.query.users.findFirst({
                where: eq(schema.users.id, account.userId),
                columns: {
                  creditBalance: true,
                  referredBy: true,
                  name: true,
                  referralCode: true,
                },
              });

              if (!user) return;

              // Generate referral code if missing (Google sign-ups skip our hook)
              const updates: Record<string, unknown> = { updatedAt: new Date() };

              if (!user.referralCode) {
                updates.referralCode = generateReferralCode(account.userId);
              }

              // Award welcome credits only on first login
              if (user.creditBalance === 0) {
                updates.creditBalance = sql`credit_balance + 20`;
              }

              await db
                .update(schema.users)
                .set(updates as any)
                .where(eq(schema.users.id, account.userId));

              // Fire referral notifications for new Google users
              if (user.referredBy) {
                await db
                  .insert(schema.referrals)
                  .values({
                    referrerId: user.referredBy,
                    referredId: account.userId,
                    status: "signed_up",
                  })
                  .onConflictDoNothing();

                await db.insert(schema.notifications).values({
                  userId: user.referredBy,
                  type: "referral",
                  title: "New Referral!",
                  message: `${user.name} just signed up using your referral link!`,
                });
              }
            } catch (err) {
              console.error("[databaseHooks.account.create.after] Error:", err);
            }
          },
        },
      },

      user: {
        create: {
          // Runs AFTER every new user row is inserted (email + Google sign-up)
          after: async (user) => {
            try {
              // Generate a unique referral code for every new user
              const code = generateReferralCode(user.id);
              await db
                .update(schema.users)
                .set({ referralCode: code, updatedAt: new Date() })
                .where(eq(schema.users.id, user.id));
            } catch (err) {
              console.error("[databaseHooks.user.create.after] Error:", err);
            }
          },
        },
      },
    },

    // ── Session config ────────────────────────────────────────────────────────
    session: {
      expiresIn: 60 * 60 * 24 * 30,      // 30 days
      updateAge: 60 * 60 * 24,             // Re-issue session cookie after 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,                    // Cache for 5 min — reduces DB reads
      },
    },

    // ── Cookie settings ───────────────────────────────────────────────────────
    // Wrangler dev runs on plain HTTP — Secure cookies are silently dropped.
    // In production (Cloudflare Workers + HTTPS) we use Secure cookies.
    advanced: {
      useSecureCookies: !isDev,
      defaultCookieAttributes: isDev
        ? { secure: false, sameSite: "lax" as const, httpOnly: true }
        : undefined,
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateReferralCode(userId: string): string {
  // First 6 chars of userId (nanoid) + 4 random alphanumeric chars
  const prefix = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MC${prefix}${suffix}`;
}

export type Auth = ReturnType<typeof createAuth>;
