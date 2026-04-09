# Integrations

## Backend Integrations
- **Neon Database:** PostgreSQL provider used via @neondatabase/serverless and Drizzle ORM.
- **Better Auth:** Handles authentication (likely including social logins, though not explicitly seen in config yet, uth.ts exists).
- **Resend:** Used for sending transactional emails (verification, password resets, etc.).
- **Cloudflare Workers:** The backend is designed as a serverless application running on Cloudflare's edge.

## Frontend Integrations
- **Backend API:** Connects to the Hono API via APP_URL configurables.
- **Better Auth Client:** Integrates with the backend's Better Auth instance for session management and user flows.
- **Lucide Icons:** System-wide icon library.
- **D3/LayerChart:** Used for data visualizations and charts.

## Configuration
- **Environment Variables:** Managed via .env files in both ackend and rontend (implied by .env.example).
- **Wrangler:** Configuration for Cloudflare Worker deployment in wrangler.toml.
