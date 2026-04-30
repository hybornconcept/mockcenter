import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { users } from "../db/schema";
import { requireAuth } from "../middleware/auth.middleware";
import { onboardingSchema } from "../validators/onboarding.validator";
import type { Env, Variables } from "../env";

const usersRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// ─── GET /api/users/me ────────────────────────────────────────────────────────
// Returns the full user profile for the currently authenticated user.
// emailVerified is always returned as a string "true"/"false" so
// the frontend can use strict === "true" checks safely.
usersRoute.get("/me", requireAuth, async (c) => {
  const db = createDb(c.env);
  const sessionUser = c.get("user");

  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      school: true,
      state: true,
      userType: true,
      targetExam: true,
      examLevel: true,
      targetScore: true,
      examDate: true,
      creditBalance: true,
      referralCode: true,
      createdAt: true,
    },
  });

  if (!user) {
    return c.json({ success: false, message: "User not found" }, 404);
  }

  // Use Better Auth's session boolean as the authoritative emailVerified source.
  // The session is freshly fetched from DB by requireAuth so it's always accurate.
  // We normalise to string "true"/"false" for frontend compatibility.
  const emailVerified: string =
    (sessionUser.emailVerified === true || sessionUser.emailVerified === "true")
      ? "true"
      : "false";

  // Derive isAdmin from the ADMIN_EMAILS allowlist (same logic as requireAdmin middleware).
  // Falls back to userType === "admin" when the allowlist is empty.
  const adminEmails = ((c.env.ADMIN_EMAILS ?? ""))
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = adminEmails.length > 0
    ? adminEmails.includes((user.email ?? "").toLowerCase())
    : (user.userType as string) === "admin";

  return c.json({ success: true, data: { ...user, emailVerified, isAdmin } });
});

// ─── PATCH /api/users/onboarding ─────────────────────────────────────────────
// Saves onboarding data after sign-up (before email verification).
// Called immediately after sign-up so data isn't lost even if verification
// is delayed. Dashboard guard still checks emailVerified before granting access.
usersRoute.patch(
  "/onboarding",
  requireAuth,
  zValidator("json", onboardingSchema),
  async (c) => {
    const db = createDb(c.env);
    const sessionUser = c.get("user");
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
        ...(body.phoneNumber ? { phone: body.phoneNumber } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, sessionUser.id));

    return c.json({ success: true, message: "Onboarding saved successfully" });
  }
);

export default usersRoute;
