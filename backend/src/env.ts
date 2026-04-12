import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  APP_NAME: z.string().default("MockCenter"),

  // Frontend + API URLs — required in .dev.vars and production secrets
  APP_URL: z.string().url(),
  API_URL: z.string().url().optional(),

  // PostgreSQL — direct connection string (dev: local pgAdmin, prod: Neon via Hyperdrive)
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),

  // Better Auth — secret must be at least 32 chars
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
  RESEND_FROM_NAME: z.string().default("MockCenter"),

  // Paystack — optional (not needed for auth phase)
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema> & {
  // Cloudflare Hyperdrive binding — only present in production Cloudflare Workers runtime
  HYPERDRIVE?: { connectionString: string };
  QUESTION_IMAGES?: R2Bucket;
};

export function validateEnv(env: unknown): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${issues}`);
  }
  return result.data as Env;
}
