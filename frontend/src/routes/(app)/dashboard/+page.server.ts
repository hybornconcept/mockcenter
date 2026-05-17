import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;

	// If user has no onboarding data yet, return empty state quickly.
	if (!user?.targetExam) {
		return {
			summaryCards: [
				{ title: 'Total tests taken', value: '0', subtext: 'No sessions yet', trend: 'Getting started', icon: 'ClipboardCheck' },
				{ title: 'Average score', value: '—', subtext: 'Complete your first session', trend: 'Pending', icon: 'TrendingUp' },
				{ title: 'Best score ever', value: '—', subtext: 'No completed sessions yet', trend: 'Personal best', icon: 'Trophy' },
			],
			dailyChallenges: [],
			studyingItems: [],
			leaderboard: [],
			recentActivity: [],
			subjectPerformance: [],
			examCountdown: null,
			creditBalance: user?.creditBalance ?? 0,
		};
	}

	try {
		const res = await fetch('/api/users/dashboard', {
			method: 'GET',
			credentials: 'include',
		});

		if (!res.ok) {
			console.error('[dashboard] API error:', res.status, await res.text().catch(() => ''));
			throw new Error('dashboard fetch failed');
		}

		const json = await res.json();
		const d = json.data;

		// Build studyingItems from recent activity (last 3 sessions with enough info)
		const studyingItems = (d.recentActivity ?? [])
			.filter((a: any) => a.type === 'practice')
			.slice(0, 3)
			.map((a: any) => ({
				subject: a.subject !== '—' ? a.subject : a.activity.replace(' completed', '').replace(' — in progress', ''),
				detail: a.score !== '—' ? `${a.score} · ${a.time}` : a.time,
				type: a.score === '—' ? 'resume' : 'score',
				score: a.score !== '—' ? a.score : undefined,
				icon: 'Play',
				theme: 'green',
			}));

		// Build daily challenges — show subjects user has practiced as progress bars
		const dailyChallenges = (d.subjectPerformance ?? []).slice(0, 4).map((sp: any, i: number) => ({
			subject: sp.subject,
			current: sp.userScore,
			total: 100,
			color: ['amber', 'emerald', 'blue', 'gray'][i] ?? 'gray',
		}));

		return {
			summaryCards: d.summaryCards ?? [],
			dailyChallenges,
			studyingItems,
			leaderboard: d.leaderboard ?? [],
			recentActivity: d.recentActivity ?? [],
			subjectPerformance: d.subjectPerformance ?? [],
			examCountdown: d.examCountdown ?? null,
			creditBalance: d.creditBalance ?? 0,
		};
	} catch (err) {
		console.error('[dashboard] Failed to load dashboard data:', err);
		// Graceful fallback — show empty state instead of breaking the page
		return {
			summaryCards: [
				{ title: 'Total tests taken', value: '0', subtext: 'Loading…', trend: 'On track', icon: 'ClipboardCheck' },
				{ title: 'Average score', value: '—', subtext: 'Loading…', trend: 'Improving', icon: 'TrendingUp' },
				{ title: 'Best score ever', value: '—', subtext: 'Loading…', trend: 'Personal best', icon: 'Trophy' },
			],
			dailyChallenges: [],
			studyingItems: [],
			leaderboard: [],
			recentActivity: [],
			subjectPerformance: [],
			examCountdown: null,
			creditBalance: 0,
		};
	}
};
