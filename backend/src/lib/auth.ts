import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq, sql } from "drizzle-orm";
import { createDb } from "../db";
import * as schema from "../db/schema";
import type { Env } from "../env";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email";

export function createAuth(env: Env) {
  const db = createDb(env);
  const isDev = env.NODE_ENV === "development";

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

    user: {
      additionalFields: {
        phone: { type: "string", required: false },
        school: { type: "string", required: false },
        state: { type: "string", required: false },
        userType: { type: "string", required: false },
        targetExam: { type: "string", required: false },
        examLevel: { type: "string", required: false },
        targetScore: { type: "number", required: false },
        examDate: { type: "date", required: false },
      }
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      async sendResetPassword({ user, url }) {
        await sendPasswordResetEmail(env, user.email, user.name, url);
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,

      async sendVerificationEmail({ user, url }) {
        await sendVerificationEmail(env, user.email, user.name, url);
      },

      async onEmailVerified({ user }) {
        // Check if credits have already been awarded to avoid duplicates
        // (e.g. Google users get their credits via databaseHooks instead)
        const existing = await db.query.users.findFirst({
          where: eq(schema.users.id, user.id),
          columns: { creditBalance: true, emailVerified: true },
        });

        // Only award credits once (balance starts at 0)
        if (existing && existing.creditBalance === 0) {
          await db
            .update(schema.users)
            .set({
              creditBalance: sql`credit_balance + 20`,
              updatedAt: new Date(),
            })
            .where(eq(schema.users.id, user.id));
        }

        // Always ensure our text field is "true"
        await db
          .update(schema.users)
          .set({ emailVerified: "true", updatedAt: new Date() })
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

    // Hook into DB events to handle Google sign-ups
    databaseHooks: {
      account: {
        create: {
          after: async (account) => {
            // When a Google account is linked, mark email as verified and award credits
            if (account.providerId === "google") {
              const user = await db.query.users.findFirst({
                where: eq(schema.users.id, account.userId),
                columns: { creditBalance: true, emailVerified: true, referredBy: true, name: true },
              });

              if (!user) return;

              // Always mark email as verified for Google users
              await db
                .update(schema.users)
                .set({ emailVerified: "true", updatedAt: new Date() })
                .where(eq(schema.users.id, account.userId));

              // Award 20 welcome credits only on first-ever login (balance = 0)
              if (user.creditBalance === 0) {
                await db
                  .update(schema.users)
                  .set({ creditBalance: sql`credit_balance + 20`, updatedAt: new Date() })
                  .where(eq(schema.users.id, account.userId));
              }

              // Fire referral logic for new Google users
              if (user.referredBy) {
                await db.insert(schema.referrals).values({
                  referrerId: user.referredBy,
                  referredId: account.userId,
                  status: "signed_up",
                }).onConflictDoNothing();

                await db.insert(schema.notifications).values({
                  userId: user.referredBy,
                  type: "referral",
                  title: "New Referral!",
                  message: `${user.name} just signed up using your referral link! Earn more credits when they make their first purchase.`,
                });
              }
            }
          },
        },
      },
    },

    session: {
      cookieCache: {
        enabled: false, // Disabled: stale cache was causing emailVerified to appear false after verification
      },
    },

    // Fix for wrangler dev: HTTP localhost requires non-secure cookies.
    // Better Auth defaults to Secure=true when it detects a production-like environment,
    // but wrangler dev runs on plain HTTP — so cookies are silently rejected by the browser.
    advanced: {
      useSecureCookies: !isDev,
      defaultCookieAttributes: isDev
        ? {
            secure: false,
            sameSite: "lax" as const,
            httpOnly: true,
          }
        : undefined,
    },

    // Trust both the frontend and backend origins in development
    trustedOrigins: [
      env.APP_URL,
      env.BETTER_AUTH_URL,
      ...(isDev ? ['http://127.0.0.1:8787', 'http://127.0.0.1:5173'] : []),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
