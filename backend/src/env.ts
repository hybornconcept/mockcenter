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
  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.string(),
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
