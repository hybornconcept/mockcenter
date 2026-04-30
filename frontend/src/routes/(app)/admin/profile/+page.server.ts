import type { PageServerLoad, Actions } from './$types';
import { adminFetch } from '$lib/server/adminApi';
import { fail } from '@sveltejs/kit';

function relativeTime(date: string | Date): string {
  const ms   = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

const ACTION_ICON: Record<string, string> = {
  'user.update':            'settings',
  'user.suspend':           'shield',
  'user.active':            'check',
  'user.credits_adjusted':  'credit',
  'user.delete':            'alert',
  'question.create':        'question',
  'question.update':        'question',
  'question.delete':        'alert',
  'question.import':        'upload',
  'media.upload':           'media',
  'media.orphans_deleted':  'trash',
  'settings.update':        'settings',
  'credits.package_created':'credit',
  'credits.package_updated':'credit',
  'credits.package_deleted':'trash',
};

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const sessionUser = locals.user as Record<string, any> | null;

  const nameParts = (sessionUser?.name ?? 'Admin User').split(' ');
  const profile = {
    firstName:   nameParts[0] ?? 'Admin',
    lastName:    nameParts.slice(1).join(' ') || 'User',
    displayName: sessionUser?.name  ?? 'Admin',
    email:       sessionUser?.email ?? 'admin@mockcenter.ng',
    phone:       (sessionUser as any)?.phone ?? '',
    role:        'Super Administrator',
    bio:         '',
    timezone:    'Africa/Lagos (WAT +1)',
    language:    'English (en-NG)',
  };

  // Load real audit log as activity history + dashboard KPIs in parallel
  const [auditResult, dashResult] = await Promise.all([
    adminFetch<{ logs: any[]; total: number }>(fetch, '/audit-logs?limit=20'),
    adminFetch<{ kpi: { totalQuestions: number; totalMedia: number } }>(fetch, '/dashboard'),
  ]);

  const activityData = auditResult.ok
    ? auditResult.data.logs.map((log: any) => ({
        type:  ACTION_ICON[log.action] ?? 'info',
        title: log.action.replace('.', ' ').replace(/_/g, ' '),
        desc:  log.targetType ? `${log.targetType}${log.targetId ? ` · ${log.targetId.slice(0, 8)}…` : ''}` : 'Platform',
        time:  relativeTime(log.createdAt),
      }))
    : [
        { type: 'auth',  title: 'Logged in successfully', desc: 'Admin Console · Admin session started', time: 'Just now' },
        { type: 'media', title: 'Accessed Media Library',  desc: 'Reviewed R2 media files',             time: 'Today'    },
      ];

  const kpiTotals = dashResult.ok
    ? { totalQuestions: dashResult.data.kpi?.totalQuestions ?? 0, totalMedia: dashResult.data.kpi?.totalMedia ?? 0 }
    : null;

  const loginData = [
    { device: 'Admin Console', loc: 'Nigeria', ip: '—', time: 'Active Now', success: true, current: true, iconType: 'laptop' },
  ];

  const sessions = [
    { id: 1, name: 'Admin Console', loc: 'Nigeria', time: 'Active Now', current: true, iconType: 'laptop' },
  ];

  return { profile, activityData, loginData, sessions, kpiTotals };
};

export const actions: Actions = {
  /** Update the logged-in admin's own profile fields */
  updateProfile: async ({ request, fetch, locals }) => {
    const sessionUser = locals.user as Record<string, any> | null;
    if (!sessionUser?.id) return fail(401, { error: 'Not authenticated' });

    const form = await request.formData();
    const patch: Record<string, unknown> = {};
    const str = (k: string) => form.get(k)?.toString() || undefined;

    // Combine first + last into name
    const first = str('firstName');
    const last  = str('lastName');
    if (first || last) {
      patch.name = [first ?? sessionUser.name?.split(' ')[0], last ?? ''].join(' ').trim();
    }
    if (str('phone')) patch.phone = str('phone');

    const result = await adminFetch(fetch, `/users/${sessionUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },
};