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
        phone: body.phoneNumber,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id));

    return c.json({ success: true, message: "Onboarding complete" });
  }
);

// GET /api/users/me
usersRoute.get("/me", requireAuth, async (c) => {
  const db = createDb(c.env);
  const sessionUser = c.get("user" as any); // Better Auth session user

  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
    columns: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
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

  // Use Better Auth's session emailVerified as the authoritative source.
  // The session.user.emailVerified is a boolean managed by Better Auth.
  // We normalize it to the string "true"/"false" so all frontend checks
  // using === 'true' work correctly regardless of what's in our text column.
  const emailVerified = sessionUser.emailVerified === true ? "true" : "false";

  return c.json({ success: true, data: { ...user, emailVerified } });
});

export default usersRoute;
