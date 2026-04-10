import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
  const res = await fetch('/api/users/me');

  if (!res.ok) {
    throw redirect(302, '/login');
  }

  const json = await res.json();
  const user = json?.data;

  const isVerified = user?.emailVerified === 'true' || user?.emailVerified === true;

  if (!isVerified) {
    throw redirect(302, '/verify-email');
  }

  if (!user?.targetExam) {
    throw redirect(302, '/register');
  }

  // Pass user to all (app) pages via $page.data.user
  return { user };
};
