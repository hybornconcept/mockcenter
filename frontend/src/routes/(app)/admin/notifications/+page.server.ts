import type { PageServerLoad, Actions } from './$types';
import { adminFetch } from '$lib/server/adminApi';
import { fail } from '@sveltejs/kit';

// Static UI config — not from DB
const BROADCASTS = [
  { title: 'JAMB prep tips — 30 days to go',  audience: 'All users',    channel: 'Email + Push', sent: 'Apr 15, 2025', opens: '71%' },
  { title: 'Weekend mock exam now live',       audience: 'Active users', channel: 'Push',         sent: 'Apr 12, 2025', opens: '54%' },
  { title: 'Low credit reminder',             audience: 'Zero credits', channel: 'Email',        sent: 'Apr 10, 2025', opens: '63%' },
  { title: 'WAEC countdown begins',           audience: 'WAEC students',channel: 'Email + SMS',  sent: 'Apr 7, 2025',  opens: '80%' },
];

const TEMPLATES = [
  { name: 'Welcome message',  channel: 'Email',       preview: 'Hi {{name}}, welcome to MockCenter! Your exam prep journey starts today…' },
  { name: 'Low credit alert', channel: 'Push',        preview: 'You have {{credits}} credits remaining. Top up to keep practising!' },
  { name: 'Exam result ready',channel: 'Email + Push',preview: 'Your {{exam}} result is ready. You scored {{score}}. Tap to view…' },
  { name: 'Inactivity nudge', channel: 'Email',       preview: 'We miss you, {{name}}! Log in and continue your JAMB prep…' },
];

const CHANNELS = [
  { label: 'Email notifications', subtext: 'Send via SMTP / Resend', active: true },
  { label: 'Push notifications',  subtext: 'In-app and mobile push', active: true },
  { label: 'SMS alerts',          subtext: 'Via Termii / Twilio',    active: false },
  { label: 'WhatsApp messages',   subtext: 'Business API integration',active: false },
];

const AUTO_TRIGGERS = [
  { label: 'New user registration',    subtext: 'Send welcome email automatically',        active: true  },
  { label: 'Low credit warning',       subtext: 'Alert when balance drops below 10',       active: true  },
  { label: 'Exam result ready',        subtext: 'Notify user when score is processed',     active: true  },
  { label: 'Inactivity reminder',      subtext: 'Nudge users inactive for 7 days',        active: false },
  { label: 'Account suspension notice',subtext: 'Email when account is suspended',        active: true  },
  { label: 'Password reset',           subtext: 'Send OTP / reset link on request',       active: true  },
];


const TYPE_MAP: Record<string, { iconName: string; bg: string; color: string; tag: string }> = {
  credit:   { iconName: 'Zap',         bg: '#EEEDFE', color: '#534AB7', tag: 'Credits'  },
  referral: { iconName: 'CheckCircle', bg: '#EAF3DE', color: '#3B6D11', tag: 'Growth'   },
  session:  { iconName: 'Info',        bg: '#E6F1FB', color: '#185FA5', tag: 'Sessions' },
  system:   { iconName: 'ShieldAlert', bg: '#FCEBEB', color: '#A32D2D', tag: 'System'   },
};

function relativeTime(date: string | Date): string {
  const ms   = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
  const page   = Number(url.searchParams.get('page') ?? 1);
  const type   = url.searchParams.get('type')  ?? undefined;
  const unread = url.searchParams.get('unread') ?? undefined;

  const params = new URLSearchParams({ limit: '50', page: String(page) });
  if (type)   params.set('type', type);
  if (unread) params.set('unread', unread);

  // Fetch notifications list + delivery stats + dashboard user counts in parallel
  const [result, statsResult, dashResult] = await Promise.all([
    adminFetch<{ notifications: any[]; total: number }>(
      fetch,
      `/notifications?${params}`,
    ),
    adminFetch<{ total: number; unread: number; openRate: number; byType: Record<string, number> }>(
      fetch,
      '/notifications/stats',
    ),
    adminFetch<{ kpi: { totalUsers: number } }>(
      fetch,
      '/dashboard',
    ),
  ]);

  let notifs: any[];
  if (result.ok) {
    notifs = result.data.notifications.map((n, i) => {
      const cfg = TYPE_MAP[n.type] ?? TYPE_MAP.system;
      return {
        id:        n.id ?? i,
        type:      n.type,
        iconName:  cfg.iconName,
        bg:        cfg.bg,
        color:     cfg.color,
        title:     n.title,
        desc:      n.message,
        time:      relativeTime(n.createdAt),
        unread:    !n.isRead,
        tag:       cfg.tag,
        period:    'today',
        userName:  n.userName,
        userEmail: n.userEmail,
      };
    });
  } else {
    console.warn('[admin/notifications] Using fallback:', result.error);
    notifs = [];
  }

  const total = result.ok ? result.data.total : 0;

  // Build delivery stats from real API data
  const stats = statsResult.ok ? statsResult.data : { total: 0, unread: 0, openRate: 0, byType: {} };
  const deliveryStats = [
    { label: 'Total sent',   value: stats.total.toLocaleString(),      color: 'text-slate-900' },
    { label: 'Open rate',    value: `${stats.openRate}%`,              color: 'text-[#3B6D11]' },
    { label: 'Unread',       value: stats.unread.toLocaleString(),     color: 'text-slate-900' },
    { label: 'System alerts',value: (stats.byType?.system ?? 0).toString(), color: 'text-[#E24B4A]' },
  ];

  // User counts for broadcast audience picker
  const totalUsers   = dashResult.ok ? (dashResult.data.kpi?.totalUsers ?? 0) : 0;
  // Approximate active = 96% of total; pending = from unread notification count heuristic
  const activeUsers  = Math.round(totalUsers * 0.96);
  const pendingUsers = stats.byType?.system ?? 0;

  return {
    notifs,
    total,
    page,
    broadcasts:    BROADCASTS,
    templates:     TEMPLATES,
    channels:      CHANNELS,
    autoTriggers:  AUTO_TRIGGERS,
    deliveryStats,
    totalUsers,
    activeUsers,
    pendingUsers,
  };
};

export const actions: Actions = {
  /** Mark a notification read/unread */
  markRead: async ({ request, fetch }) => {
    const form   = await request.formData();
    const id     = form.get('id')?.toString();
    const isRead = form.get('isRead') !== 'false';
    if (!id) return fail(400, { error: 'Notification ID required' });

    const result = await adminFetch(fetch, `/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead }),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Delete a single notification */
  deleteNotif: async ({ request, fetch }) => {
    const form = await request.formData();
    const id   = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Notification ID required' });

    const result = await adminFetch(fetch, `/notifications/${id}`, { method: 'DELETE' });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Broadcast a system notification to all (or specific) users */
  broadcast: async ({ request, fetch }) => {
    const form    = await request.formData();
    const title   = form.get('title')?.toString();
    const message = form.get('message')?.toString();
    if (!title || !message) return fail(400, { error: 'Title and message are required' });

    const userIdsRaw = form.get('userIds')?.toString();
    const userIds: string[] = userIdsRaw
      ? userIdsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const result = await adminFetch<{ sent: number }>(fetch, '/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message, userIds: userIds.length ? userIds : undefined }),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true, sent: result.data.sent };
  },
};
