import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Admin layout server load — runs for every /admin/* route.
 * Hooks already fetches the session and stores it in locals.user,
 * so we just read from there — no extra HTTP round-trip needed.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
  const user = locals.user;

  // Double-gate: hooks redirects unauthenticated/non-admin users too,
  // but explicit checks here ensure the admin shell never renders for guests.
  if (!user) {
    throw redirect(302, '/login');
  }

  if (!(user as any).isAdmin) {
    throw redirect(302, '/dashboard');
  }

  return { user };
};
