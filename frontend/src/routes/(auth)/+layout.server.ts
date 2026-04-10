import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, url }) => {
  const res = await fetch('/api/users/me');
  const user = res.ok ? (await res.json())?.data : null;

  // Don't redirect away from /register — Google users need it for onboarding
  if (url.pathname === '/register') {
    return { user };
  }

  // If logged in and fully ready, send to dashboard (backup for hooks)
  const isVerified = user?.emailVerified === 'true' || user?.emailVerified === true;
  if (user && isVerified && user?.targetExam) {
    throw redirect(302, '/dashboard');
  }

  return { user };
};

