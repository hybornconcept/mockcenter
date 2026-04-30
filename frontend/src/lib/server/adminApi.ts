/**
 * adminApi — thin server-side wrapper for /api/admin/* calls.
 *
 * Always use event.fetch so SvelteKit forwards session cookies automatically.
 * Falls back gracefully on error so mock data can still be used as default.
 */
import { dev } from '$app/environment';

const BACKEND = ''; // Always use relative URLs so SvelteKit SSR forwards session cookies

type SvelteFetch = typeof fetch;

export async function adminFetch<T = unknown>(
  svelteFetch: SvelteFetch,
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const url = `${BACKEND}/api/admin${path}`;
    const res = await svelteFetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });

    const json = await res.json();
    if (!res.ok) {
      console.error(`[adminFetch] HTTP ${res.status} error for ${path}:`, json);
      return { ok: false, error: json?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: json.data as T };
  } catch (err) {
    console.error(`[adminFetch] Network/Parse error for ${path}:`, err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
