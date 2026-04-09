# Testing

## Tools
- Type Checking: tsc --noEmit on the backend, svelte-check on the frontend.
- Backend Deployment: Local testing via wrangler dev (Miniflare).

## Structure
- No explicit test directories (like tests/ or __tests__) or test runner dependencies (like vitest or jest) were found in the current environment or package.json files.
- Testing likely relies on manual verification via local development servers for now.

## Practices
- Schema Validation: Acts as a form of contract testing between layers.
- Deployment: Uses Cloudflare environments (staging, production) for final verification.
