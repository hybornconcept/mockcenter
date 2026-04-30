import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    // Send Google OAuth through the callback page so we can handle
    // admin vs user routing correctly (admin → /admin, new user → /onboarding, returning user → /dashboard)
    const callbackURL = `${url.origin}/auth/callback`;

    const target = new URL(`${url.origin}/api/auth/sign-in/social`);
    target.searchParams.set('provider', 'google');
    target.searchParams.set('callbackURL', callbackURL);

    throw redirect(302, target.toString());
};
