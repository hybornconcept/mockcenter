import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    // Use the current origin (localhost:5173 in dev) so the browser goes through
    // the Vite proxy → backend, rather than hitting 127.0.0.1:8787 directly.
    // The proxy forwards to the backend and passes Better Auth's Google redirect through.
    const callbackURL = `${url.origin}/auth/callback`;

    const target = new URL(`${url.origin}/api/auth/sign-in/social`);
    target.searchParams.set('provider', 'google');
    target.searchParams.set('callbackURL', callbackURL);

    throw redirect(302, target.toString());
};
