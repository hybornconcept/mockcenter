import type { PageServerLoad, Actions } from './$types';
import { adminFetch } from '$lib/server/adminApi';
import { fail } from '@sveltejs/kit';

const CONFIG = {
  filters: {
    statuses: ['active', 'suspended', 'banned'],
    plans: ['Free', 'Premium'],
    quickFilters: [
      { id: 'all',       label: 'All' },
      { id: 'active',    label: 'Active' },
      { id: 'suspended', label: 'Suspended' },
      { id: 'banned',    label: 'Banned' },
      { id: 'premium',   label: 'Premium' },
    ],
    sorting: [
      { value: 'newest',   label: 'Newest First' },
      { value: 'oldest',   label: 'Oldest First' },
      { value: 'credits',  label: 'Most Credits' },
      { value: 'sessions', label: 'Most Sessions' },
    ],
  },
};

export const load: PageServerLoad = async ({ fetch, url }) => {
  const page   = Number(url.searchParams.get('page')   ?? 1);
  const search = url.searchParams.get('search')         ?? undefined;
  const status = url.searchParams.get('status')         ?? undefined;

  const params = new URLSearchParams({ limit: '50', page: String(page) });
  if (search) params.set('search', search);
  if (status && status !== 'all') params.set('status', status);

  const result = await adminFetch<{ users: any[]; total: number; pages: number }>(
    fetch,
    `/users?${params}`,
  );

  if (result.ok) {
    return { users: result.data.users, total: result.data.total, pages: result.data.pages, page, config: CONFIG };
  }

  console.warn('[admin/users] Using fallback:', result.error);
  return { users: [], total: 0, pages: 1, page, config: CONFIG };
};

export const actions: Actions = {
  /** Update user profile fields */
  updateUser: async ({ request, fetch }) => {
    const form = await request.formData();
    const id   = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'User ID required' });

    const patch: Record<string, unknown> = {};
    const str = (k: string) => form.get(k)?.toString() || undefined;
    if (str('name'))       patch.name       = str('name');
    if (str('phone'))      patch.phone      = str('phone');
    if (str('state'))      patch.state      = str('state');
    if (str('userType'))   patch.userType   = str('userType');
    if (str('targetExam')) patch.targetExam = str('targetExam');
    const credits = form.get('creditBalance');
    if (credits !== null && credits !== '') patch.creditBalance = Number(credits);
    const verified = form.get('emailVerified');
    if (verified !== null) patch.emailVerified = verified === 'true';

    const result = await adminFetch(fetch, `/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Toggle active ↔ suspended */
  suspendUser: async ({ request, fetch }) => {
    const form = await request.formData();
    const id   = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'User ID required' });

    const result = await adminFetch<{ status: string }>(fetch, `/users/${id}/suspend`, { method: 'POST' });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true, status: result.data.status };
  },

  /** Adjust credits (positive = add, negative = deduct) */
  adjustCredits: async ({ request, fetch }) => {
    const form   = await request.formData();
    const id     = form.get('id')?.toString();
    const amount = Number(form.get('amount') ?? 0);
    const reason = form.get('reason')?.toString() ?? 'Admin adjustment';

    if (!id)          return fail(400, { error: 'User ID required' });
    if (isNaN(amount) || amount === 0) return fail(400, { error: 'Amount must be a non-zero integer' });

    const result = await adminFetch(fetch, `/users/${id}/credits`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Hard-delete a user */
  deleteUser: async ({ request, fetch }) => {
    const form = await request.formData();
    const id   = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'User ID required' });

    const result = await adminFetch(fetch, `/users/${id}`, { method: 'DELETE' });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },
};