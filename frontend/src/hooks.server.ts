import { redirect, type Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

// Direct backend URL for server-side requests (bypasses Vite proxy)
const BACKEND = dev ? 'http://127.0.0.1:8787' : '';

/**
 * Fetch user session directly from the backend.
 * Returns null on any error or timeout — never throws.
 */
async function getSessionUser(cookieHeader: string, svelteFetch: typeof fetch): Promise<Record<string, unknown> | null> {
  if (!cookieHeader?.includes('better-auth')) return null;

  const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 4000));
  try {
    const result = await Promise.race([
      svelteFetch(`${BACKEND}/api/users/me`, {
        headers: { cookie: cookieHeader },
      }),
      timeout,
    ]);
    if (!result || !(result instanceof Response) || !result.ok) return null;
    return (await result.json())?.data ?? null;
  } catch {
    return null;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // 1. Skip static assets
  if (
    path.startsWith('/_app/') ||
    path.startsWith('/favicon') ||
    path.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2|ttf|map)$/)
  ) {
    return resolve(event);
  }

  // 2. Route categories
  const publicPassthrough = ['/auth/callback', '/logout', '/api/auth', '/login/google'];
  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-email'];
  const appRoutes = [
    '/dashboard', '/quiz', '/questions', '/start_practice',
    '/results', '/analytics', '/bookmarks', '/notifications', '/referrals',
  ];

  // 3. OAuth / logout routes — pass through with no session check
  if (publicPassthrough.some(p => path.startsWith(p))) {
    return resolve(event);
  }

  // 4. Fetch session (fast-path: skip if no cookie and not a protected route)
  const cookieHeader = event.request.headers.get('cookie') ?? '';
  const isAppRoute = appRoutes.some(r => path.startsWith(r));

  const user = await getSessionUser(cookieHeader, event.fetch);

  // 5. Expose user via locals so page load functions don't need to re-fetch
  event.locals.user = user as App.Locals['user'];

  // 6. Logic
  const isLoggedIn = !!user;
  // TEMPORARY: Bypass email verification until domain is configured for Resend
  const isVerified = true; // user?.emailVerified === 'true' || user?.emailVerified === true;
  const isOnboarded = !!user?.targetExam;
  const isAuthPage = authRoutes.some(r => path === r);

  if (isLoggedIn) {
    if (!isVerified && path !== '/verify-email') {
      throw redirect(302, `/verify-email?email=${encodeURIComponent(user!.email as string)}`);
    }
    if (isVerified && !isOnboarded && path !== '/register') {
      throw redirect(302, '/register');
    }
    if (isVerified && isOnboarded && isAuthPage) {
      throw redirect(302, '/dashboard');
    }
  }

  if (!isLoggedIn && isAppRoute) {
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(path)}`);
  }

  return resolve(event);
};
