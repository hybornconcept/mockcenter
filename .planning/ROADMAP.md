# Roadmap

## Milestone 1: Core Experience Completion
**Goal:** Stabilize the core practice loop and enable monetization via Paystack.

### Phase 1: Authentication & Onboarding Polish
- [ ] Implement robust email verification flow (server-side check + UI)
- [ ] Fix OAuth onboarding redirection loops
- [ ] Ensure emailVerified logic is consistent across database

### Phase 2: Practice Session Resume
- [ ] Implement answer_snapshot logic in backend
- [ ] Frontend: Save state to localStorage and sync with API
- [ ] Add Resume banner UI to dashboard

### Phase 3: Paystack Payment Integration
- [ ] Backend: Webhook endpoints and credit deduction logic
- [ ] Frontend: Credit purchase UI and payment verification

### Phase 4: AI Support & Analytics
- [ ] Implement AI performance reporting
- [ ] Subject-level readiness score visualizations

---

## Evolution

This document evolves at milestone boundaries.
- **Completed phases** are archived to .planning/milestones/
- **Future work** is promoted from backlog as needed
- **Priorities** are shifted based on user feedback and validation
