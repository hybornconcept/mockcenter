# MockCenter — Email Integration Guide (Resend)

> **For your backend folder (examenow-backend):** Tell your AI:
> **"Implement everything in EMAIL.md exactly as written, in order."**

---

## Overview

Resend handles all transactional emails:
- Email verification (sent on signup)
- Password reset
- Credit notifications
- Referral notifications

---

## STEP 1 — Create Resend account & get API key

1. Go to **resend.com** → Sign up free
2. Go to **API Keys** → **Create API Key** → name it "MockCenter Dev"
3. Copy the key — starts with `re_`
4. Free plan: 3,000 emails/month, 100/day — enough to start

> For production, go to **Domains** in Resend → Add `examenow.ng` → add the DNS
> records they give you to your domain registrar → Verify.
> For development, use `onboarding@resend.dev` — works immediately, no setup needed.

---

## STEP 2 — Install Resend

```bash
pnpm add resend
```

---

## STEP 3 — Add to `.env`

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=MockCenter <onboarding@resend.dev>
```

For production, change `RESEND_FROM_EMAIL` to:
```env
RESEND_FROM_EMAIL=MockCenter <noreply@examenow.ng>
```

---

## STEP 4 — Add to `src/env.ts`

Add these two fields to the existing `envSchema`:

```typescript
RESEND_API_KEY: z.string(),
RESEND_FROM_EMAIL: z.string(),
```

---

## STEP 5 — Add to Cloudflare secrets (when deploying)

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
```

---

## STEP 6 — Create `src/lib/email.ts`

This file contains all email templates and the Resend sender.
The design matches the layout below — logo on top, heading, body text, big button, fallback link, footer.

```typescript
import { Resend } from "resend";
import type { Env } from "../env";

export function createEmailClient(env: Env) {
  return new Resend(env.RESEND_API_KEY);
}

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function emailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>MockCenter</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
                   style="background:#ffffff; border-radius:8px; overflow:hidden; max-width:600px; width:100%;">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding: 32px 40px 0 40px;">
                  <h1 style="margin:0; font-size:28px; font-weight:900; color:#4F46E5; letter-spacing:-0.5px;">
                    MockCenter
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              ${content}

              <!-- Footer -->
              <tr>
                <td align="center"
                    style="padding: 24px 40px; border-top: 1px solid #eeeeee; margin-top:16px;">
                  <p style="margin:0; font-size:12px; color:#999999;">
                    &copy; ${new Date().getFullYear()} MockCenter. All rights reserved.
                  </p>
                  <p style="margin:4px 0 0; font-size:12px; color:#999999;">
                    ExamNow Technologies, Port Harcourt, Rivers State, Nigeria.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ─── Shared button ────────────────────────────────────────────────────────────
function emailButton(label: string, url: string): string {
  return `
    <tr>
      <td align="center" style="padding: 24px 40px 8px 40px;">
        <a href="${url}"
           style="display:inline-block; background-color:#4F46E5; color:#ffffff;
                  text-decoration:none; font-size:16px; font-weight:bold;
                  padding:16px 48px; border-radius:6px; letter-spacing:0.3px;">
          ${label}
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 8px 40px 32px 40px;">
        <p style="margin:0; font-size:12px; color:#999999;">
          Or paste this link into your browser:<br/>
          <a href="${url}" style="color:#4F46E5; word-break:break-all;">${url}</a>
        </p>
      </td>
    </tr>
  `;
}

// ─── 1. Email Verification ────────────────────────────────────────────────────
export async function sendVerificationEmail(
  env: Env,
  to: string,
  name: string,
  verificationUrl: string
) {
  const resend = createEmailClient(env);

  const content = `
    <tr>
      <td align="center" style="padding: 32px 40px 8px 40px;">
        <h2 style="margin:0; font-size:24px; font-weight:bold; color:#111111;">
          Verify your email address
        </h2>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 8px 40px 0 40px;">
        <p style="margin:0; font-size:15px; color:#555555; line-height:1.6; max-width:420px;">
          Hi ${name}, please confirm that you want to use this as your MockCenter
          account email address. Once verified, you will receive
          <strong>20 free credits</strong> to start practising!
        </p>
      </td>
    </tr>
    ${emailButton("Verify my email", verificationUrl)}
  `;

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: "Verify your MockCenter email address",
    html: emailLayout(content),
  });
}

// ─── 2. Password Reset ────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(
  env: Env,
  to: string,
  name: string,
  resetUrl: string
) {
  const resend = createEmailClient(env);

  const content = `
    <tr>
      <td align="center" style="padding: 32px 40px 8px 40px;">
        <h2 style="margin:0; font-size:24px; font-weight:bold; color:#111111;">
          Reset your password
        </h2>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 8px 40px 0 40px;">
        <p style="margin:0; font-size:15px; color:#555555; line-height:1.6; max-width:420px;">
          Hi ${name}, we received a request to reset your MockCenter password.
          Click the button below to choose a new password.
          This link expires in <strong>1 hour</strong>.
        </p>
      </td>
    </tr>
    ${emailButton("Reset my password", resetUrl)}
    <tr>
      <td align="center" style="padding: 0 40px 24px 40px;">
        <p style="margin:0; font-size:13px; color:#999999;">
          If you did not request a password reset, you can safely ignore this email.
          Your password will not be changed.
        </p>
      </td>
    </tr>
  `;

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: "Reset your MockCenter password",
    html: emailLayout(content),
  });
}

// ─── 3. Credits Added ─────────────────────────────────────────────────────────
export async function sendCreditsAddedEmail(
  env: Env,
  to: string,
  name: string,
  creditsAdded: number,
  newBalance: number
) {
  const resend = createEmailClient(env);

  const content = `
    <tr>
      <td align="center" style="padding: 32px 40px 8px 40px;">
        <h2 style="margin:0; font-size:24px; font-weight:bold; color:#111111;">
          Credits added to your account
        </h2>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 8px 40px 0 40px;">
        <p style="margin:0; font-size:15px; color:#555555; line-height:1.6; max-width:420px;">
          Hi ${name}, <strong>${creditsAdded} credits</strong> have been added to your
          MockCenter account. Your new balance is <strong>${newBalance} credits</strong>.
          Start practising now!
        </p>
      </td>
    </tr>
    ${emailButton("Start practising", `${env.APP_URL}/dashboard`)}
  `;

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `${creditsAdded} credits added to your MockCenter account`,
    html: emailLayout(content),
  });
}

// ─── 4. Referral Reward ───────────────────────────────────────────────────────
export async function sendReferralRewardEmail(
  env: Env,
  to: string,
  name: string,
  referredName: string,
  creditsEarned: number,
  newBalance: number
) {
  const resend = createEmailClient(env);

  const content = `
    <tr>
      <td align="center" style="padding: 32px 40px 8px 40px;">
        <h2 style="margin:0; font-size:24px; font-weight:bold; color:#111111;">
          You just earned ${creditsEarned} credits!
        </h2>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 8px 40px 0 40px;">
        <p style="margin:0; font-size:15px; color:#555555; line-height:1.6; max-width:420px;">
          Hi ${name}, <strong>${referredName}</strong> just made their first purchase
          using your referral link. You earned <strong>${creditsEarned} credits</strong>!
          Your new balance is <strong>${newBalance} credits</strong>.
        </p>
      </td>
    </tr>
    ${emailButton("View my credits", `${env.APP_URL}/dashboard/credits`)}
  `;

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `You earned ${creditsEarned} credits on MockCenter!`,
    html: emailLayout(content),
  });
}
```

---

## STEP 7 — Hook Resend into Better Auth

Update `src/lib/auth.ts` — add `sendVerificationEmail` and `sendResetPassword` hooks:

```typescript
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email";

// inside betterAuth({...})

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
    // Award 20 free credits (existing logic — keep as is)
  },
},
```

---

## STEP 8 — Call credit & referral emails from your routes

In `src/routes/credits.route.ts` — after a successful Paystack webhook, call:

```typescript
import { sendCreditsAddedEmail, sendReferralRewardEmail } from "../lib/email";

// After crediting the user
await sendCreditsAddedEmail(c.env, user.email, user.name, creditsAdded, newBalance);

// After awarding referral credits to referrer
await sendReferralRewardEmail(c.env, referrer.email, referrer.name, referredName, creditsEarned, referrer.newBalance);
```

---

## Email summary

| Trigger | Template | Subject |
|---|---|---|
| New signup | Verification email | "Verify your MockCenter email address" |
| Resend verification | Verification email | "Verify your MockCenter email address" |
| Forgot password | Password reset email | "Reset your MockCenter password" |
| Successful payment | Credits added email | "X credits added to your account" |
| Referral purchase | Referral reward email | "You earned X credits!" |

---

> Email integration complete. All templates use the same branded layout —
> MockCenter logo, centered content, big indigo button, fallback link, footer.
