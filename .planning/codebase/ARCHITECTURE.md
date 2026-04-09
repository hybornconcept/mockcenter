# Architecture

## Overview
The project follows a decoupled client-server architecture with a clear separation between the SvelteKit frontend and Hono backend.

## Backend Architecture (Hono)
- **Layered Structure:**
  - routes/: Defines API endpoints and mounts them.
  - middleware/: Cross-cutting concerns like logging, CORS, and auth validation.
  - services/: Business logic layer (e.g., question.service.ts).
  - db/: Database layer using Drizzle ORM.
    - schema/: Table definitions.
    - migrations/: Versioned database schema changes.
  - validators/: Input validation logic using Zod/Valibot.
  - lib/: Shared utilities and third-party wrappers (Auth, Email).

## Frontend Architecture (SvelteKit)
- **Route-based organization:** Uses src/routes for page structure.
  - (app): Protected application routes.
  - (auth): Login, registration, and password recovery routes.
- **Component Model:** Built with Svelte 5 runes for reactive state.
- **Library (src/lib):**
  - Shared components, types, and utility functions.
  - API client wrappers.

## Data Flow
1. User interacts with SvelteKit frontend.
2. Frontend makes HTTP requests to Cloudflare Worker (Hono).
3. Hono validates request using Zod/Valibot middleware.
4. Business logic in services processes the request.
5. Drizzle ORM interacts with Neon (PostgreSQL) database.
6. Response flows back through Hono to the SvelteKit client.
