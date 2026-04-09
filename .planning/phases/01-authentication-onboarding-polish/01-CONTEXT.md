# Phase 01: Authentication & Onboarding Polish - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase addresses the "Deceptively Simple" but critical tasks of stabilizing the authentication journey. It covers the full lifecycle from registration to dashboard access, ensuring no dead ends or loops.

### Key Deliverables:
1. Unified Email Verification: A reliable email_verified state in the database and session.
2. Infinite Loop Prevention: Robust hooks and layout guards that handle unverified and un-onboarded states gracefully.
3. Onboarding Continuity: Google OAuth users are forced through the onboarding form if it's missing, while existing users skip it.
4. Schema Alignment: Ensuring users.email_verified (text) correctly maps to Better Auth's internal boolean expectations.

</domain>

<decisions>
## Implementation Decisions

### 1. Database & Session Source of Truth
- Decision: The Better Auth session is the authoritative source for emailVerified.
- Decision: The users.emailVerified column must be kept in sync as "true" or "false" (text) for compatibility with existing DB queries while matching the session's boolean value.

### 2. Frontend Guards (hooks.server.ts & +layout.server.ts)
- Decision: Use hooks.server.ts for central redirect logic.
- Decision: If logged in but emailVerified === 'false', allow only /verify-email.
- Decision: If logged in and verified but targetExam is missing, allow only /register (onboarding view).
- Decision: Redirect fully verified + onboarded users away from /login and /register.

### 3. Onboarding Logic
- Decision: Treat the /register page as a dual-purpose view:
  - Logged out: Full signup + onboarding form.
  - Logged in (Google users): Onboarding form only (hidden signup fields).
- Decision: User data and constants for onboarding (States, Exams) must be passed from the server-side load function.

### 4. Verification Logic
- Decision: award credits ONLY on first-ever verification/sign-up. 
- Decision: onEmailVerified hook in auth.ts must be idempotent.

### the agent's Discretion
- Implementation details of the verify-email landing page.
- Specific Tailwind micro-animations for the onboarding form transitions.

</decisions>

<canonical_refs>
## Canonical References

### Auth Logic
- backend/src/lib/auth.ts — Better Auth configuration
- backend/src/db/schema/users.ts — User table definition
- frontend/src/hooks.server.ts — Global server-side guards

### UI/Pages
- frontend/src/routes/(auth)/+layout.server.ts — Auth subgroup layout guard
- frontend/src/routes/(auth)/register/+page.server.ts — Registration & Onboarding actions

</canonical_refs>

---
*Phase: 01-authentication-onboarding-polish*
*Context gathered: 2026-04-09*
