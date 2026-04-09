# Requirements

## Milestone 1: Core Experience Completion

### Phase 1: Authentication & Onboarding Polish
- **UAT 1.1:** Google Sign-in correctly redirects to onboarding page for new users.
- **UAT 1.2:** Email verification updates emailVerified to true in DB and grants access.
- **UAT 1.3:** Protected layers correctly handle session expiration without loops.

### Phase 2: Practice Session Resume
- **UAT 2.1:** User can close browser mid-session and resume from the same question.
- **UAT 2.2:** Timer remains accurate after reload (within 30s margin).

### Phase 3: Paystack Payment Integration
- **UAT 3.1:** User can initiate payment and receive credits upon success.
- **UAT 3.2:** Webhook correctly handles async success notifications from Paystack.
