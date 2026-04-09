# Research: Authentication & Onboarding Optimization

## User Journey: Registration to Dashboard

### 1. Email Sign-up Journey
1. User fills /register (combined signup + onboarding).
2. Backend creates user + sends verification email + redirects to /verify-email.
3. User clicks email link -> onEmailVerified hook awards credits + sets emailVerified="true".
4. User redirected to /dashboard.

### 2. Google OAuth Journey
1. User clicks "Continue with Google" on /login.
2. Better Auth creates account/user.
3. databaseHooks catch new account -> mark emailVerified="true" + award credits.
4. User redirected back to /register.
5. +layout.server.ts sees logged-in + verified but missing targetExam -> shows onboarding form.
6. User completes form -> PATCH /api/users/onboarding.
7. User redirected to /dashboard.

## Edge Cases & Pitfalls
- Cookie Caching: Better Auth's session.cookieCache can cause stale emailVerified states. 
- Onboarding Bypass: A user could manually navigate to /dashboard before completing onboarding if guards are weak.
- Verification Loop: If verify-email doesn't clear the pending state or if the redirect back to the app doesn't refresh the session, the user stays "unverified".

## Technical Solutions
- Standardized Redirects: Use a single helper or clear logic in hooks.server.ts to calculate "Target Destination" based on { isLoggedIn, isVerified, isOnboarded }.
- Better Auth Client Sync: Ensure the frontend client (authClient.getSession()) is refreshed after verification.
- Idempotent Hooks: Ensure onEmailVerified and databaseHooks don't award credits multiple times if called twice.

## Verification Architecture
- Critical Path Test: End-to-end signup with a real email (simulated in dev) and verification.
- OAuth Mocking: Verify redirection behavior for Google users who are already registered vs new.
- Guard Stress Test: Attempt to access /dashboard as an unverified/unonboarded user.
