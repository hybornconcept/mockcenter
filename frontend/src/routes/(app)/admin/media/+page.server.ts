import type { PageServerLoad, Actions } from './$types';
import { adminFetch } from '$lib/server/adminApi';
import { fail } from '@sveltejs/kit';
import { dev } from '$app/environment';

const BACKEND = dev ? 'http://127.0.0.1:8787' : '';

export const load: PageServerLoad = async ({ fetch }) => {
  const [mediaResult, qResult] = await Promise.all([
    adminFetch<{ objects: any[]; total: number; orphans: number }>(fetch, '/media'),
    adminFetch<{ questions: any[]; total: number }>(fetch, '/questions?limit=200'),
  ]);

  if (!mediaResult.ok) {
    console.warn('[admin/media] Using fallback:', mediaResult.error);
    return { media: [], questions: [], orphanCount: 0 };
  }

  let counter = 1;
  const media = mediaResult.data.objects.map((obj: any) => ({
    id:         counter++,
    key:        obj.key,
    name:       obj.name,
    url:        `/images/${obj.key}`,
    size:       obj.size,
    type:       obj.key.split('.').pop() ?? 'bin',
    uploadedAt: obj.uploadedAt ? new Date(obj.uploadedAt) : new Date(),
    orphan:     obj.orphan,
  }));

  const questions = qResult.ok
    ? qResult.data.questions.map((q: any) => ({
        id:      q.id,
        text:    q.body?.slice(0, 80) ?? '',
        subject: q.subjectName ?? '—',
      }))
    : [];

  return { media, questions, orphanCount: mediaResult.data.orphans };
};

export const actions: Actions = {
  /** Upload a file directly to R2 via the Worker */
  uploadMedia: async ({ request, fetch: svelteFetch }) => {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return fail(400, { error: 'No file provided' });

    // Forward multipart to the backend Worker which handles R2 put
    const payload = new FormData();
    payload.append('file', file, file.name);

    let res: Response;
    try {
      res = await svelteFetch(`${BACKEND}/api/admin/media`, { method: 'POST', body: payload });
    } catch (err) {
      return fail(503, { error: 'Could not reach the upload service' });
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) return fail(res.status, { error: json?.error?.message ?? 'Upload failed' });
    return { success: true, data: json.data };
  },

  /** Delete a single R2 object by key */
  deleteMedia: async ({ request, fetch }) => {
    const form = await request.formData();
    const key  = form.get('key')?.toString();
    if (!key) return fail(400, { error: 'File key is required' });

    const result = await adminFetch(fetch, `/media/${encodeURIComponent(key)}`, { method: 'DELETE' });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Bulk-delete all orphaned R2 objects */
  deleteOrphans: async ({ fetch }) => {
    const result = await adminFetch<{ deleted: number }>(fetch, '/media/orphans', { method: 'DELETE' });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true, deleted: result.data.deleted };
  },
};