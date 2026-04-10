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
                  <h1 style="margin:0; font-size:28px; font-weight:900; color:#0284C7; letter-spacing:-0.5px;">
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
           style="display:inline-block; background-color:#0284C7; color:#ffffff;
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
          <a href="${url}" style="color:#0284C7; word-break:break-all;">${url}</a>
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

  const res = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: "Verify your MockCenter email address",
    html: emailLayout(content),
  });

  if (res.error) {
    console.error("Resend API Error during Verification Email:", res.error);
  }
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

