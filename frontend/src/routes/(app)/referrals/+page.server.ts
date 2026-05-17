import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;
	if (!user) return { stats: [], history: [], summaryStats: [], leaderboard: [], referralSteps: [], referralLink: '', code: '' };

	try {
		const res = await fetch('/api/users/referrals', { credentials: 'include' });
		if (!res.ok) throw new Error('referrals fetch failed');
		const json = await res.json();
		const d = json.data;
		return {
			stats: d.stats ?? [],
			history: d.history ?? [],
			summaryStats: d.summaryStats ?? [],
			leaderboard: d.leaderboard ?? [],
			referralSteps: d.referralSteps ?? [],
			referralLink: d.referralLink ?? '',
			code: d.code ?? '',
		};
	} catch (err) {
		console.error('[referrals] load failed:', err);
		return { stats: [], history: [], summaryStats: [], leaderboard: [], referralSteps: [], referralLink: '', code: '' };
	}
};
