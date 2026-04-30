import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = locals.user as any;

  // Allow /register page to be visited by any user — Google OAuth users land here
  // to complete onboarding profile in the old flow. New flow sends them to /onboarding.
  if (url.pathname === '/register') {
    // If the user is already signed in and has completed onboarding, send to dashboard
    if (user?.targetExam) {
      throw redirect(302, '/dashboard');
    }
    return { user };
  }

  // Defence-in-depth: redirect logged-in users away from auth pages.
  // Email verification is bypassed until production deployment.
  if (user) {
    if ((user as any).isAdmin) {
      throw redirect(302, '/admin');
    }
    // Users who haven't completed onboarding
    if (!(user as any).targetExam) {
      // If they're on forgot-password, let them through
      if (url.pathname.startsWith('/forgot-password')) {
        return { user };
      }
      throw redirect(302, '/onboarding');
    }
    // Fully onboarded users → dashboard
    throw redirect(302, '/dashboard');
  }

  return { user };
};
