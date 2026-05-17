import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;

	if (!user) {
		return {
			topMetrics: [],
			aiBadges: [],
			testHistory: [],
			breakdown: { correct: 0, wrong: 0, skipped: 0, accuracy: 0 },
			kpis: [],
			trendData: [],
			subjectsReadiness: [],
			speedVsAccuracy: []
		};
	}

	try {
		// Fetch analytics + session history in parallel
		const [analyticsRes, profileRes] = await Promise.all([
			fetch('/api/users/analytics', { credentials: 'include' }),
			fetch('/api/users/profile', { credentials: 'include' })
		]);

		const analyticsJson = analyticsRes.ok ? await analyticsRes.json() : null;
		const profileJson = profileRes.ok ? await profileRes.json() : null;

		const a = analyticsJson?.data ?? {};
		const p = profileJson?.data ?? {};

		// ── Top Metrics ──────────────────────────────────────────────────────────
		const kpis: any[] = a.kpis ?? [];
		const avgScore = kpis.find((k: any) => k.title === 'Avg score')?.value ?? '—';
		const totalSessions = kpis.find((k: any) => k.title === 'Total sessions')?.value ?? '—';
		const totalAnswered = kpis.find((k: any) => k.title === 'Questions answered')?.value ?? '—';

		// Compute pass rate from dist data (sessions >= 50%)
		const distData: any[] = a.distData ?? [];
		const aboveFifty = distData
			.filter((d: any) => !['0-20%', '21-40%', '41-50%'].includes(d.label))
			.reduce((sum: number, d: any) => sum + (Number(d.height?.replace('%', '')) || 0), 0);
		const passRateApprox = Math.min(100, Math.round(aboveFifty / Math.max(1, distData.length) * 10));

		const topMetrics = [
			{
				title: 'Pass rate',
				value: passRateApprox > 0 ? `${passRateApprox}%` : '—',
				subtext: `${totalSessions} total sessions`,
				badgeType: passRateApprox >= 50 ? 'green' : 'orange',
				badgeText: passRateApprox >= 50 ? 'Above average' : 'Needs work',
				icon: 'CheckSquare'
			},
			{
				title: 'Questions answered',
				value: totalAnswered,
				subtext: 'Across all sessions',
				badgeType: 'blue',
				badgeText: 'Consistent',
				icon: 'Clock'
			},
			{
				title: 'Average score',
				value: avgScore,
				subtext: 'All completed sessions',
				badgeType: (Number(avgScore?.replace('%', '')) ?? 0) >= 60 ? 'green' : 'orange',
				badgeText: (Number(avgScore?.replace('%', '')) ?? 0) >= 60 ? 'On the rise' : 'Improving',
				icon: 'TrendingUp'
			},
			{
				title: 'Total study time',
				value: kpis.find((k: any) => k.title === 'Total study time')?.value ?? '—',
				subtext: 'Time spent practicing',
				badgeType: 'purple',
				badgeText: 'Dedicated',
				icon: 'Timer'
			}
		];

		// ── AI Badges ─────────────────────────────────────────────────────────────
		const subjectsReadiness: any[] = a.subjectsReadiness ?? [];
		const strongSubs = subjectsReadiness.filter((s: any) => s.score >= 70).map((s: any) => s.name).join(', ');
		const weakSubs = subjectsReadiness.filter((s: any) => s.score < 50).map((s: any) => s.name).join(', ');

		const readiness: number = a.readiness ?? 0;
		const aiBadges = [
			...(strongSubs ? [{ text: `Strong: ${strongSubs}`, icon: 'Check', type: 'strong' }] : []),
			...(weakSubs ? [{ text: `Needs work: ${weakSubs}`, icon: 'AlertTriangle', type: 'warning' }] : []),
			{ text: `Readiness score: ${readiness}/100`, icon: 'Target', type: 'target' }
		];

		// ── Session History ────────────────────────────────────────────────────────
		const examHistory: any[] = p.examHistory ?? [];
		const testHistory = examHistory.slice(0, 10).map((h: any) => ({
			subject: h.subject,
			testCode: `${h.type ?? 'Practice'} · ${h.questions ?? 0} q`,
			score: h.score ?? 0,
			speed: h.duration ?? '—',
			speedVerdict: (h.score ?? 0) >= 70 ? 'Great' : (h.score ?? 0) >= 50 ? 'Good' : 'Needs work',
			speedColor: (h.score ?? 0) >= 70 ? 'green' : (h.score ?? 0) >= 50 ? 'blue' : 'orange',
			accuracy: (h.score ?? 0) >= 70 ? 'Excellent' : (h.score ?? 0) >= 50 ? 'Good pace' : 'Needs work',
			accuracyColor: (h.score ?? 0) >= 70 ? 'green' : (h.score ?? 0) >= 50 ? 'blue' : 'orange',
			date: h.date,
			icon: 'FileText',
			theme: 'emerald'
		}));

		// ── Breakdown (aggregate all sessions) ────────────────────────────────────
		const totalCorrect = p.totalSessions > 0
			? examHistory.reduce((s: number, h: any) => s + Math.round((h.score / 100) * (h.questions ?? 0)), 0)
			: 0;
		const totalQuestionsAll = examHistory.reduce((s: number, h: any) => s + (h.questions ?? 0), 0);
		const totalWrong = totalQuestionsAll - totalCorrect;
		const breakdown = {
			correct: totalCorrect,
			wrong: Math.max(0, totalWrong),
			skipped: 0,
			accuracy: totalQuestionsAll > 0 ? Math.round((totalCorrect / totalQuestionsAll) * 100) : 0
		};

		return {
			topMetrics,
			aiBadges,
			testHistory,
			breakdown,
			kpis,
			trendData: a.trendData ?? [],
			subjectsReadiness,
			speedVsAccuracy: a.speedVsAccuracy ?? []
		};
	} catch (err) {
		console.error('[results] load failed:', err);
		return {
			topMetrics: [],
			aiBadges: [],
			testHistory: [],
			breakdown: { correct: 0, wrong: 0, skipped: 0, accuracy: 0 },
			kpis: [],
			trendData: [],
			subjectsReadiness: [],
			speedVsAccuracy: []
		};
	}
};
