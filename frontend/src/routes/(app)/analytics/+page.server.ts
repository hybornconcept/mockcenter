import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;
	if (!user) return { readiness: 0, subjectsReadiness: [], kpis: [], trendData: [], radarData: [], speedVsAccuracy: [], weakestTopics: [], distData: [], peerComparison: [] };

	try {
		const res = await fetch('/api/users/analytics', { credentials: 'include' });
		if (!res.ok) throw new Error('analytics fetch failed');
		const json = await res.json();
		const d = json.data;
		return {
			readiness: d.readiness ?? 0,
			subjectsReadiness: d.subjectsReadiness ?? [],
			kpis: d.kpis ?? [],
			trendData: d.trendData ?? [],
			radarData: d.radarData ?? [],
			speedVsAccuracy: d.speedVsAccuracy ?? [],
			weakestTopics: d.weakestTopics ?? [],
			distData: d.distData ?? [],
			peerComparison: d.peerComparison ?? [],
		};
	} catch (err) {
		console.error('[analytics] load failed:', err);
		return { readiness: 0, subjectsReadiness: [], kpis: [], trendData: [], radarData: [], speedVsAccuracy: [], weakestTopics: [], distData: [], peerComparison: [] };
	}
};
