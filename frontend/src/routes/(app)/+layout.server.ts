import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * App layout server load — runs for every /(app)/* route.
 * Hooks already fetches the session and validates auth, storing
 * the user in locals — so we just read from there (no extra fetch).
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = await locals.getUser() as any;

  // Unauthenticated users must log in
  if (!user) {
    const loginUrl = `/login?redirectTo=${encodeURIComponent(url.pathname)}`;
    throw redirect(302, loginUrl);
  }

  // Admin users should only be in /admin namespace
  if (user.isAdmin && !url.pathname.startsWith('/admin')) {
    throw redirect(302, '/admin');
  }

  // Regular users who haven't completed onboarding will be prompted on the client side.
  // We no longer redirect them automatically so they can see the layout.

  // Email verification is bypassed until production deployment
  // const isVerified = user?.emailVerified === 'true' || user?.emailVerified === true;
  // if (!isVerified) {
  //   throw redirect(302, `/verify-email?email=${encodeURIComponent(user.email)}`);
  // }

  return { user };
};
