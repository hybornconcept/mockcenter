import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;
	if (!user) return { stats: [], bookmarkData: [], collections: [], subjectPerformance: [] };

	try {
		const res = await fetch('/api/users/bookmarks', { credentials: 'include' });
		if (!res.ok) throw new Error('bookmarks fetch failed');
		const json = await res.json();
		const d = json.data;
		return {
			stats: d.stats ?? [],
			bookmarkData: d.bookmarkData ?? [],
			collections: d.collections ?? [],
			subjectPerformance: d.subjectPerformance ?? [],
		};
	} catch (err) {
		console.error('[bookmarks] load failed:', err);
		return { stats: [], bookmarkData: [], collections: [], subjectPerformance: [] };
	}
};
