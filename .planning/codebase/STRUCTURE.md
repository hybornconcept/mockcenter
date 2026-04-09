# Structure

## Directory Layout
- backend/: API and Database logic
  - src/db/: Drizzle schemas and migrations
  - src/lib/: Core integrations (Auth, Email)
  - src/middleware/: Request/Response filters
  - src/routes/: API endpoint definitions
  - src/services/: Core business logic
  - src/validators/: Schema validation
- frontend/: UI and Client logic
  - src/lib/: Shared components and utilities
  - src/routes/: Page hierarchy
    - (app)/: Application dashboard and core features
    - (auth)/: Verification and authentication pages
    - auth/: Shared auth components or logic
- .planning/: Project management and codebase maps (GSD)

## Key Files
- backend/wrangler.toml: Cloudflare worker configuration
- backend/drizzle.config.ts: Database migration settings
- frontend/svelte.config.js: SvelteKit configuration
- frontend/vite.config.ts: Vite build settings
- frontend/components.json: Shadcn component configuration
