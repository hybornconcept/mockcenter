# ExamNow

## What This Is

ExamNow is Nigeria's #1 CBT (Computer Based Test) Exam Prep Platform. It provides a comprehensive ecosystem for students preparing for JAMB, WAEC, NECO, IELTS, and other professional exams through timed practice sessions, AI-driven analytics, and social learning features.

## Core Value

Empower Nigerian students to achieve high exam scores through high-fidelity simulation and data-driven insights.

## Requirements

### Validated

- ? **Multi-Repo Architecture** — Decoupled SvelteKit frontend and Cloudflare Worker backend.
- ? **Authentication** — Email/Password and Google OAuth sign-up/in via Better Auth.
- ? **Database Schema** — PostgreSQL schema on Neon with Drizzle ORM (Users, Auth, Practice, Credits, Referrals).
- ? **Practice Core** — Question/Subject/Exam management and session creation.
- ? **Email Infrastructure** — Transactional emails via Resend.
- ? **CORS & Security** — Production-ready middleware for logging, rate limiting, and CORS.

### Active

- [ ] **Practice Session Resume** — Ensure users can pause and resume sessions cross-device/browser.
- [ ] **Paystack Integration** — Implement full payment flow for credit purchases.
- [ ] **Referral System Completion** — Full credit reward flow for referrals.
- [ ] **Analytics Engine** — AI-driven performance reports and readiness scores.
- [ ] **Bookmarks & Collections** — User-facing interface for saving and organizing questions.

### Out of Scope

- **Native Mobile App** — Focused on PWA/Web for maximum accessibility first.
- **Video Courses** — Prioritizing high-quality CBT simulation over content delivery.

## Context

The project is in a brownfield state with a strong architectural foundation (Hono/SvelteKit). Recent work focused on stabilizing the authentication flow and resolving database schema mismatches (especially ID types). The backend is optimized for the Edge using Hyperdrive for database connection pooling.

## Constraints

- **Tech Stack**: Cloudflare Workers, Hono, SvelteKit, Drizzle ORM, Neon PostgreSQL, Better Auth.
- **Environment**: Nigerian context (Paystack, local exam types like JAMB).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid Validation | Using Zod for core schemas and Valibot for lightweight edge validation. | — Pending |
| Hyperdrive | Essential for managing Postgres connections at the edge from Cloudflare Workers. | ? Good |
| Svelte 5 | Using latest runes for reactive state management in the frontend. | ? Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via /gsd-transition):
1. Requirements invalidated? ? Move to Out of Scope with reason
2. Requirements validated? ? Move to Validated with phase reference
3. New requirements emerged? ? Add to Active
4. Decisions to log? ? Add to Key Decisions
5. "What This Is" still accurate? ? Update if drifted

**After each milestone** (via /gsd-complete-milestone):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after initialization*
