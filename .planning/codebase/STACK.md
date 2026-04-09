# Stack

## Overview
This project is a monorepo consisting of a SvelteKit frontend and a Hono-based backend designed for Cloudflare Workers. It uses a modern TypeScript stack with a focus on type safety and performance.

## Backend
- **Runtime:** Cloudflare Workers (Wrangler)
- **Framework:** Hono
- **Language:** TypeScript
- **Database ORM:** Drizzle ORM
- **Database Driver:** @neondatabase/serverless (PostgreSQL)
- **Authentication:** Better Auth
- **Email:** Resend
- **Validation:** 
  - Zod
  - Valibot
- **Middleware:** Logger, CORS, Rate Limiting, Auth

## Frontend
- **Framework:** SvelteKit
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** 
  - Tailwind CSS v4
  - Bits UI
- **State Management:** Svelte 5 runes
- **Form Handling:** 
  - SuperForms
  - Formsnap
- **Components:** Shadcn-Svelte
- **Visualizations:** LayerChart (D3-based)
- **Icons:** Lucide-Svelte

## Infrastructure
- **Hosting:** Cloudflare (Backend)
- **Database:** Neon (PostgreSQL)
- **Package Manager:** pnpm
