# Plan: Authentication & Onboarding Polish

## Goal
Fix registration, login, and auth architecture to resolve redirection loops and inconsistent verification states.

## Files Modified
- frontend/src/hooks.server.ts
- frontend/src/routes/(auth)/+layout.server.ts
- backend/src/lib/auth.ts
- frontend/src/routes/(auth)/register/+page.server.ts
- frontend/src/routes/(auth)/register/+page.svelte

## Wave 1: Backend Auth Logic & Stability
**Task 1: Solidify Google User Onboarding Hook**
- <read_first>: backend/src/lib/auth.ts, backend/src/db/schema/users.ts
- <action>: Update databaseHooks.account.create.after in backend/src/lib/auth.ts. Ensure it strictly sets emailVerified: 'true' (text) and awards credits ONLY if creditBalance === 0.
- <acceptance_criteria>: auth.ts contains emailVerified: "true" inside the account.create.after hook.

**Task 2: Idempotent Email Verification Hook**
- <read_first>: backend/src/lib/auth.ts
- <action>: Refactor onEmailVerified in backend/src/lib/auth.ts to be fully idempotent. Use a transaction or conditional award to ensure credits are given only once.
- <acceptance_criteria>: auth.ts logic for credit award is wrapped in a creditBalance === 0 check.

## Wave 2: Frontend Guards & Redirects
**Task 3: Centralize Redirect Logic in Hooks**
- <read_first>: frontend/src/hooks.server.ts, frontend/src/routes/(auth)/+layout.server.ts
- <action>: Update frontend/src/hooks.server.ts. Implement a definitive check for:
  - isLoggedIn && !isVerified -> only /verify-email.
  - isLoggedIn && isVerified && !isOnboarded -> only /register.
- <acceptance_criteria>: hooks.server.ts redirects to /register if !user?.targetExam.

**Task 4: Clear Auth Layout Guard**
- <read_first>: frontend/src/routes/(auth)/+layout.server.ts
- <action>: Simplify the layout guard to prevent double-redirects with the global hook. 
- <acceptance_criteria>: Layout guard no longer throws redundant redirects handled by hooks.server.ts.

## Wave 3: UI & Onboarding Experience
**Task 5: Refine Onboarding View in Register Page**
- <read_first>: frontend/src/routes/(auth)/register/+page.svelte
- <action>: Update the conditional rendering to ensure Google users (logged in but not onboarded) only see the onboarding fields, hiding the 'Sign Up' section.
- <acceptance_criteria>: +page.svelte contains a check for data.user to hide account creation fields.

**Task 6: Verification Feedback Page**
- <read_first>: frontend/src/routes/verify-email/+page.svelte
- <action>: Ensure the verification landing page provides clear feedback and a "Go to Dashboard" button that refreshes the session.
- <acceptance_criteria>: User sees success message after clicking email link.

## Verification
- Must Have 1: New email users receive verification link and can reach dashboard after clicking.
- Must Have 2: Google users are forced to /register onboarding form and then to dashboard.
- Must Have 3: No navigation loops when visiting / or /dashboard in any state.
