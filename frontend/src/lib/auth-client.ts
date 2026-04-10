import { createAuthClient } from 'better-auth/svelte';

/**
 * Better Auth client — points at the backend via the Vite proxy in dev.
 * All /api/auth/* requests go through the proxy to http://127.0.0.1:8787.
 *
 * NOTE: For server-side session retrieval (hooks.server.ts), we fetch
 * directly from 127.0.0.1:8787 to avoid the proxy round-trip.
 */
export const authClient = createAuthClient({
  baseURL: 'http://localhost:5173', // Uses Vite proxy → 127.0.0.1:8787
});

export type Session = typeof authClient.$Infer.Session;
