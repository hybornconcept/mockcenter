import type { PageServerLoad } from './$types';
import { adminFetch } from '$lib/server/adminApi';

// Static fallback stats (shown when API is unreachable)
const FALLBACK_STATS = {
  7:  { users: '—', sessions: '—', passRate: '—', avgTime: '—', questionsAnswered: '—', deltas: { users: { type: 'flat', value: '—' }, sessions: { type: 'flat', value: '—' }, passRate: { type: 'flat', value: '—' }, avgTime: { type: 'flat', value: '—' }, questionsAnswered: { type: 'flat', value: '—' } } },
  30: { users: '—', sessions: '—', passRate: '—', avgTime: '—', questionsAnswered: '—', deltas: { users: { type: 'flat', value: '—' }, sessions: { type: 'flat', value: '—' }, passRate: { type: 'flat', value: '—' }, avgTime: { type: 'flat', value: '—' }, questionsAnswered: { type: 'flat', value: '—' } } },
  90: { users: '—', sessions: '—', passRate: '—', avgTime: '—', questionsAnswered: '—', deltas: { users: { type: 'flat', value: '—' }, sessions: { type: 'flat', value: '—' }, passRate: { type: 'flat', value: '—' }, avgTime: { type: 'flat', value: '—' }, questionsAnswered: { type: 'flat', value: '—' } } },
};

function buildStats(kpi: any, days: number) {
  const avgMins = kpi.avgTimeSecs ? Math.round(kpi.avgTimeSecs / 60) : null;
  return {
    users:             kpi.totalUsers?.toLocaleString() ?? '—',
    sessions:          kpi.periodSessions?.toLocaleString() ?? '—',
    passRate:          kpi.passRate  != null ? `${kpi.passRate}%`  : '—',
    avgTime:           avgMins       != null ? `${avgMins}s`       : '—',
    questionsAnswered: kpi.questionsAnswered?.toLocaleString()      ?? '—',
    deltas: {
      users:             { type: 'up',   value: `+${kpi.newUsers          ?? 0}` },
      sessions:          { type: 'up',   value: `+${kpi.periodSessions    ?? 0}` },
      passRate:          { type: (kpi.passRate ?? 0) >= 50 ? 'up' : 'down', value: `${kpi.passRate ?? 0}%` },
      avgTime:           { type: 'flat', value: avgMins != null ? `${avgMins}s avg` : 'N/A' },
      questionsAnswered: { type: 'up',   value: `+${kpi.questionsAnswered ?? 0}` },
    },
  };
}

export const load: PageServerLoad = async ({ fetch }) => {
  // Fetch all three windows in parallel
  const [r7, r30, r90] = await Promise.all([
    adminFetch<any>(fetch, '/analytics?days=7'),
    adminFetch<any>(fetch, '/analytics?days=30'),
    adminFetch<any>(fetch, '/analytics?days=90'),
  ]);

  // Use 30-day window for subject/exam/question data (primary view)
  const primary = r30.ok ? r30.data : null;

  const stats = {
    7:  r7.ok  ? buildStats(r7.data.kpi, 7)   : FALLBACK_STATS[7],
    30: r30.ok ? buildStats(r30.data.kpi, 30) : FALLBACK_STATS[30],
    90: r90.ok ? buildStats(r90.data.kpi, 90) : FALLBACK_STATS[90],
  };

  const examData = primary?.examPassRates?.map((e: any) => ({
    exam: e.examType?.toUpperCase() ?? e.exam?.toUpperCase() ?? 'EXAM',
    passRate: Number(e.passRate ?? 0),
    target: 50,
    color: '#639922',
  })) ?? [
    { exam: 'JAMB', passRate: 62, target: 50, color: '#639922' },
    { exam: 'WAEC', passRate: 71, target: 50, color: '#185FA5' },
    { exam: 'NECO', passRate: 68, target: 50, color: '#BA7517' },
    { exam: 'POST-UTME', passRate: 58, target: 50, color: '#534AB7' },
  ];

  const subjectAccuracy = primary?.subjectAccuracy?.map((s: any) => ({
    subject: s.subject ?? s.name,
    accuracy: Number(s.accuracy ?? 0),
    attempts: Number(s.attempts ?? 0),
    avgTime: 40,
  })) ?? [
    { subject: 'Biology', accuracy: 78, attempts: 8420, avgTime: 38 },
    { subject: 'Math', accuracy: 65, attempts: 12300, avgTime: 55 },
    { subject: 'English', accuracy: 72, attempts: 9840, avgTime: 33 },
    { subject: 'Chem', accuracy: 54, attempts: 6210, avgTime: 47 },
    { subject: 'Physics', accuracy: 48, attempts: 7130, avgTime: 68 },
  ];

  const failedQuestions = primary?.hardestQuestions?.map((q: any, i: number) => ({
    id: i + 1,
    question: q.body?.slice(0, 80) + (q.body?.length > 80 ? '…' : ''),
    subject: q.subject ?? '—',
    failRate: Number(q.failRate ?? 0),
    attempts: Number(q.attempts ?? 0),
  })) ?? [
    { id: 1, question: 'Calculate: If 2x + 5 = 15, what is x?', subject: 'Math', failRate: 78, attempts: 3420 },
    { id: 2, question: 'What is the atomic number of Carbon?', subject: 'Chemistry', failRate: 71, attempts: 2890 },
    { id: 3, question: "Newton's 3rd law states that every action has…", subject: 'Physics', failRate: 69, attempts: 4120 },
  ];

  // New KPI summary fields
  const kpi30 = r30.ok ? r30.data.kpi : null;
  const avgTransactionValue: number   = kpi30?.avgTransactionValue   ?? 0;
  const registrationGrowthPct: number = kpi30?.registrationGrowthPct ?? 0;
  const dailyAvgNew: number           = kpi30?.dailyAvgNew           ?? 0;

  // Exam distribution for bubble chart
  const examDistribution: Array<{ examType: string; sessions: number }> =
    primary?.examDistribution ?? [];
  const totalDistSessions: number = primary?.totalDistSessions ?? 0;

  const trends = primary?.trends ?? [];

  return { stats, examData, subjectAccuracy, failedQuestions, avgTransactionValue, registrationGrowthPct, dailyAvgNew, examDistribution, totalDistSessions, trends };
};
