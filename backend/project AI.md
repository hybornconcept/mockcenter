# Project AI Context

## Stack
- Backend: Hono on Cloudflare Workers (edge, no Node.js APIs)
- Auth: Better Auth v1.5.x — Hono adapter + Google OAuth provider
- DB: PostgreSQL — pgAdmin locally, Neon in staging/production
- ORM: Drizzle ORM
- Frontend: SvelteKit 2.x — Better Auth SvelteKit client
- Forms: Superforms v2 + Valibot schemas

## Hard Rules
- Never use process.env — use Cloudflare env bindings via c.env
- Auth secret = c.env.BETTER_AUTH_SECRET passed at runtime
- Auth routes mounted at /api/auth/* in Hono
- Better Auth baseURL must be set explicitly
- Google OAuth credentials must come from c.env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- Never hardcode OAuth credentials or DB connection strings
- Drizzle schema must be compatible with Better Auth's required tables
- DB migrations via drizzle-kit, never manual SQL edits

## Database Strategy — Local vs Production

### Local Development (pgAdmin)
- Driver: standard pg client (node-postgres) via Drizzle
- pgAdmin manages a local PostgreSQL instance
- Connection string in .dev.vars:
  DATABASE_URL=postgresql://postgres:<password>@localhost:5432/<dbname>
- Drizzle config (drizzle.config.ts) reads from .dev.vars / dotenv for local
- Use: import { drizzle } from 'drizzle-orm/node-postgres'
- Use: import { Pool } from 'pg'
- Instantiate: drizzle(new Pool({ connectionString: c.env.DATABASE_URL }))

### Staging / Production (Neon on Cloudflare Workers)
- Driver: @neondatabase/serverless using neon() HTTP fetch client ONLY
- Never use pg.Pool or pg.Client on Cloudflare Workers — no Node.js runtime
- Connection string set via wrangler secret: DATABASE_URL
- Use: import { neon } from '@neondatabase/serverless'
- Use: import { drizzle } from 'drizzle-orm/neon-http'
- Instantiate: drizzle(neon(c.env.DATABASE_URL))

### Switching Pattern (db.ts)
- Maintain a single backend/src/db/index.ts that exports the db instance
- Use ENVIRONMENT binding (c.env.ENVIRONMENT) to switch driver:

  if (c.env.ENVIRONMENT === 'development') {
    // node-postgres via pg Pool
  } else {
    // neon HTTP fetch client
  }

- Set ENVIRONMENT = "development" in .dev.vars
- Set ENVIRONMENT = "production" in wrangler.toml or wrangler secret

## Google OAuth Setup Rules
- Callback URL format: https://<your-domain>/api/auth/callback/google
- For local dev use: http://localhost:8787/api/auth/callback/google
- Must be registered in Google Cloud Console under Authorized redirect URIs
- Scopes: openid, email, profile (default — do not request unnecessary scopes)
- Better Auth handles the OAuth flow — do NOT implement custom Google OAuth logic

## Wrangler / Cloudflare Bindings (wrangler.toml)
- All secrets set via: wrangler secret put SECRET_NAME
- Required bindings:
  - BETTER_AUTH_SECRET
  - DATABASE_URL
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - ENVIRONMENT (development | staging | production)
- For local dev, mirror all bindings in .dev.vars (never commit this file)

## .dev.vars (local only, never commit)
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/<dbname>
BETTER_AUTH_SECRET=your-local-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ENVIRONMENT=development

## Project Structure
- /backend — Hono Worker (src/index.ts is entrypoint)
- /frontend — SvelteKit app
- Auth client initialized in frontend/src/lib/auth-client.ts
- Auth server initialized in backend/src/lib/auth.ts
- Drizzle schema in backend/src/db/schema.ts
- Drizzle db instance in backend/src/db/index.ts
- Drizzle config in backend/drizzle.config.ts

## Better Auth Tables (auto-generated via Drizzle adapter)
- user
- session
- account
- verification
- Run drizzle-kit generate then drizzle-kit migrate before first auth test
- Run against LOCAL db first, then production Neon separately

## Key Docs
- Better Auth + Hono: https://www.better-auth.com/docs/integrations/hono
- Better Auth + SvelteKit: https://www.better-auth.com/docs/integrations/sveltekit
- Better Auth + Cloudflare: https://www.better-auth.com/docs/deployment/cloudflare
- Better Auth + Google OAuth: https://www.better-auth.com/docs/authentication/social-login
- Neon + Drizzle: https://orm.drizzle.team/docs/connect-neon
- Neon Serverless Driver: https://neon.tech/docs/serverless/serverless-driver
- Drizzle + node-postgres: https://orm.drizzle.team/docs/connect-postgresql
- Cloudflare Workers Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Google Cloud Console (OAuth setup): https://console.cloud.google.com/apis/credentials

## Common Errors & Fixes
- "Cannot read properties of undefined (reading 'auth')" — Better Auth not receiving env bindings, check c.env is passed correctly
- "fetch failed" on DB calls in production — Neon WebSocket/pg.Pool driver used instead of HTTP, switch to neon() fetch client
- "connection refused" locally — pgAdmin PostgreSQL service not running, check pg service is started
- OAuth redirect mismatch — callback URL in Google Console doesn't match BETTER_AUTH_URL exactly
- "Invalid secret" — BETTER_AUTH_SECRET not set in .dev.vars or wrangler bindings
- Session not persisting on frontend — hooks.server.ts not wired up, check Better Auth SvelteKit handle hook
- Wrong driver in production — ENVIRONMENT binding not set, db/index.ts falling back to wrong driver
- drizzle-kit can't connect locally — ensure dotenv is loaded in drizzle.config.ts for local DB URL