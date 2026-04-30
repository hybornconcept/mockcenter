import type { PageServerLoad } from './$types';
import { adminFetch } from '$lib/server/adminApi';

// ── Fallback data (shown when API is unreachable / not yet wired) ──────────────
const FALLBACK_NOTIFICATIONS = [
  { id: 1, color: 'text-red-500', dot: 'bg-red-500', text: '12 orphaned media files detected in R2 — clean up recommended.', time: '10 mins ago', read: false },
  { id: 2, color: 'text-amber-500', dot: 'bg-amber-500', text: 'Credit payment gateway is experiencing degraded performance.', time: '42 mins ago', read: false },
  { id: 3, color: 'text-green-500', dot: 'bg-green-500', text: 'Bulk import completed — 42 questions added.', time: '2 hours ago', read: false },
  { id: 4, color: 'text-blue-500', dot: 'bg-blue-500', text: 'New user milestone: 3,800 registered students.', time: '5 hours ago', read: true },
];

const FALLBACK_ACTIVITY = [
  { dot: 'bg-green-500', actor: 'Admin', text: 'added 3 new Biology questions', time: 'Just now' },
  { dot: 'bg-blue-500', actor: 'System', text: 'new user registered', time: '2 mins ago' },
  { dot: 'bg-amber-500', actor: 'System', text: 'practice session completed', time: '4 mins ago' },
];

const HEALTH_WARNINGS = [
  { type: 'warn', iconId: 'zap', title: 'Physics questions below target', desc: 'Only 87 Physics questions — JAMB target is 200 per subject.', action: 'Add questions →' },
  { type: 'ok', iconId: 'check', title: 'All exam types configured', desc: 'JAMB, WAEC, NECO and POST-UTME rules are set and active.' },
];

const SYSTEM_STATUS = [
  { name: 'PostgreSQL DB', iconId: 'database', status: 'Operational', color: 'bg-green-500' },
  { name: 'Cloudflare R2', iconId: 'cloud', status: 'Operational', color: 'bg-green-500' },
  { name: 'Auth service', iconId: 'lock', status: 'Operational', color: 'bg-green-500' },
  { name: 'Credit gateway', iconId: 'credit', status: 'Degraded', color: 'bg-amber-500' },
  { name: 'Email / SMS', iconId: 'mail', status: 'Operational', color: 'bg-green-500' },
];

export const load: PageServerLoad = async ({ fetch }) => {
  const result = await adminFetch<{
    kpi: Record<string, number>;
    subjectCoverage: { name: string; count: number }[];
    recentSessions: any[];
    recentSignups: any[];
  }>(fetch, '/dashboard');

  // ── Live data path ─────────────────────────────────────────────────────────
  if (result.ok) {
    const { kpi, orphanCount, subjectCoverage, recentSessions, recentSignups } = result.data;

    const initialActivity = [
      ...recentSignups.slice(0, 3).map((u: any) => ({
        dot:   'bg-blue-500',
        actor: u.name,
        text:  'registered a new account',
        time:  new Date(u.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      })),
      ...recentSessions.slice(0, 6).map((s: any) => ({
        dot:   s.status === 'completed' ? 'bg-blue-500' : 'bg-green-500',
        actor: s.userName ?? 'User',
        text:  s.status === 'completed'
          ? `completed a mock — scored ${s.totalQuestions > 0 ? Math.round((s.correctCount / s.totalQuestions) * 100) : 0}%`
          : 'started a practice session',
        time:  new Date(s.startedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      })),
    ].slice(0, 10);

    const TARGETS: Record<string, number> = {
      Biology: 300, Mathematics: 300, English: 300,
      Chemistry: 250, Physics: 200, Government: 150, History: 100,
    };
    const mappedSubjectCoverage = subjectCoverage.map((s: any) => ({
      name:    s.name,
      iconId:  s.name.toLowerCase(),
      color:   'bg-brand',
      count:   s.count,
      target:  TARGETS[s.name] ?? 100,
    }));

    // Dynamic health warnings based on real data
    const healthWarnings = [
      ...(orphanCount > 0 ? [{
        type: 'warn', iconId: 'cloud',
        title: `${orphanCount} orphaned media file${orphanCount > 1 ? 's' : ''} in R2`,
        desc: 'These images are not linked to any question. Clean them up to save storage.',
        action: 'Clean up →',
      }] : []),
      ...(mappedSubjectCoverage.filter((s: any) => s.count < s.target * 0.5).map((s: any) => ({
        type: 'warn', iconId: 'zap',
        title: `${s.name} below 50% target`,
        desc: `Only ${s.count} / ${s.target} questions added for ${s.name}.`,
        action: 'Add questions →',
      }))),
      { type: 'ok', iconId: 'check', title: 'All exam types configured', desc: 'JAMB, WAEC, NECO and POST-UTME rules are set and active.' },
    ].slice(0, 4);

    const notifications = [
      { id: 1, color: 'text-blue-500',  dot: 'bg-blue-500',  text: `${kpi.totalUsers.toLocaleString()} registered students on the platform.`, time: 'Live', read: false },
      { id: 2, color: 'text-green-500', dot: 'bg-green-500', text: `${(kpi.creditsInCirculation ?? 0).toLocaleString()} credits currently in circulation.`, time: 'Live', read: false },
    ];

    return {
      notifications,
      initialActivity,
      healthWarnings,
      subjectCoverage: mappedSubjectCoverage,
      systemStatus: SYSTEM_STATUS,
      kpi: { ...kpi, orphanCount },
    };
  }

  // ── Fallback path (API unreachable) ────────────────────────────────────────
  console.warn('[admin/+page.server.ts] Using fallback data:', result.error);
  return {
    notifications: FALLBACK_NOTIFICATIONS,
    initialActivity: FALLBACK_ACTIVITY,
    healthWarnings: HEALTH_WARNINGS,
    subjectCoverage: [
      { name: 'Biology', iconId: 'dna', color: 'bg-green-500', count: 312, target: 300 },
      { name: 'Mathematics', iconId: 'ruler', color: 'bg-amber-500', count: 289, target: 300 },
      { name: 'English', iconId: 'pencil', color: 'bg-blue-500', count: 265, target: 300 },
      { name: 'Chemistry', iconId: 'flask', color: 'bg-red-500', count: 198, target: 250 },
      { name: 'Physics', iconId: 'atom', color: 'bg-cyan-500', count: 87, target: 200 },
    ],
    systemStatus: SYSTEM_STATUS,
    kpi: null,
  };
};