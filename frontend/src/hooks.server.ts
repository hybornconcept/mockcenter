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
  // Google OAuth callback must be a passthrough (no session check during redirect)
  const publicPassthrough = ['/auth/callback', '/logout', '/api/auth', '/login/google'];
  
  // Auth pages (unauthenticated users only)
  const authRoutes = ['/login', '/register', '/forgot-password'];
  
  // Protected app routes
  const appRoutes = [
    '/dashboard', '/quiz', '/questions', '/start_practice',
    '/results', '/analytics', '/bookmarks', '/notifications', '/referrals',
    '/onboarding',
  ];

  // Admin routes require auth + admin role
  const adminRoutes = ['/admin'];

  // 3. OAuth / logout routes — pass through with no session check
  if (publicPassthrough.some(p => path.startsWith(p))) {
    return resolve(event);
  }

  // 4. Fetch session
  const cookieHeader = event.request.headers.get('cookie') ?? '';
  const isAppRoute = appRoutes.some(r => path.startsWith(r));
  const isAdminRoute = adminRoutes.some(r => path.startsWith(r));

  const user = await getSessionUser(cookieHeader, event.fetch);

  // 5. Expose user via locals so page load functions don't need to re-fetch
  event.locals.user = user as App.Locals['user'];

  // 6. Routing logic
  const isLoggedIn = !!user;
  // Email verification is bypassed until production deployment
  const isVerified = true; // user?.emailVerified === 'true' || user?.emailVerified === true;
  const isOnboarded = !!user?.targetExam;
  const isAdmin = !!(user as any)?.isAdmin;
  const isAuthPage = authRoutes.some(r => path === r || path.startsWith(r + '/'));

  if (isLoggedIn) {
    // ── Root path redirect (e.g. after Google OAuth sets a cookie) ────────────
    if (path === '/') {
      if (isAdmin) throw redirect(302, '/admin');
      if (isOnboarded) throw redirect(302, '/dashboard');
      throw redirect(302, '/onboarding');
    }

    // ── Admin fast-path ───────────────────────────────────────────────────────
    if (isAdmin) {
      // Keep admin on /admin namespace; redirect away from auth and user app
      if (isAuthPage || appRoutes.filter(r => r !== '/onboarding').some(r => path.startsWith(r))) {
        throw redirect(302, '/admin');
      }
    } else {
      // ── Regular user path ───────────────────────────────────────────────────
      // Non-onboarded users can only visit /onboarding (and auth pages to log out)
      if (isVerified && !isOnboarded && !isAuthPage && path !== '/onboarding') {
        throw redirect(302, '/onboarding');
      }
      // Fully onboarded users don't need auth pages anymore
      if (isVerified && isOnboarded && isAuthPage) {
        throw redirect(302, '/dashboard');
      }
      // Prevent non-admins from accessing admin routes
      if (isAdminRoute) {
        throw redirect(302, '/dashboard');
      }
    }
  }

  // 7. Unauthenticated users trying to access protected routes → login
  if (!isLoggedIn && (isAppRoute || isAdminRoute)) {
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(path)}`);
  }

  return resolve(event);
};
