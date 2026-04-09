# Concerns

## Technical Debt
- Mixed Validation Libraries: Both Zod and Valibot are present in backend/package.json. Consolidating to one would improve maintainability.
- Testing Infrastructure: Lack of automated unit or E2E tests in the current file structure.
- Service Layer Maturity: Only question.service.ts exists, suggesting business logic might still be leaked into routes or needs expansion.

## Known Issues (from recent history)
- Authentication Redirect Loops: History mentions fixing loops in hooks.server.ts and +layout.server.ts.
- Database Schema Mismatches: Recent fixes were needed for Better Auth ID fields (UUID vs Text).

## Potential Risks
- Cold Starts: While Cloudflare Workers are fast, complex initializations in auth.ts might impact edge performance.
- Neon Serverless Latency: Database connections from the edge should be monitored for latency.
- Rate Limiting: Global rate limit in index.ts (1000) might need more granular control as traffic scales.
