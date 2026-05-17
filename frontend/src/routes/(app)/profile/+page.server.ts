import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;

	// Empty state if not onboarded yet
	if (!user) {
		return {
			subjects: [], allSubjects: [], initialSelectedSubjects: [],
			examHistory: [], activities: [], achievements: [],
			creditPackages: [], transactions: [], topTopics: [],
			scoreHistory: [], creditUsage: [], user: null, streakDots: [],
		};
	}

	try {
		const res = await fetch('/api/users/profile', { credentials: 'include' });
		if (!res.ok) throw new Error('profile fetch failed');
		const json = await res.json();
		const d = json.data;

		const creditPackages = [
			{ credits: 50, price: '₦500', popular: false },
			{ credits: 150, price: '₦1,200', popular: true },
			{ credits: 300, price: '₦2,000', popular: false },
			{ credits: 500, price: '₦3,000', popular: false },
		];

		const allSubjects = d.subjects?.map((s: any) => s.name) ?? [];
		const initialSelectedSubjects = allSubjects.slice(0, 4);

		// Build activities from examHistory
		const activities = (d.examHistory ?? []).slice(0, 5).map((h: any) => ({
			iconName: 'Target',
			bg: h.bg ?? 'bg-slate-50',
			color: h.color ?? 'text-slate-500',
			title: `Scored ${h.score}% in ${h.subject} ${h.type}`,
			sub: `${h.questions} questions · ${h.duration}`,
			date: h.date,
			time: '',
		}));

		return {
			subjects: d.subjects ?? [],
			allSubjects,
			initialSelectedSubjects,
			examHistory: d.examHistory ?? [],
			activities,
			achievements: d.achievements ?? [],
			creditPackages,
			transactions: d.transactions ?? [],
			topTopics: [],
			scoreHistory: d.scoreHistory ?? [],
			creditUsage: [],
			user: d.user ?? null,
			streakDots: d.streakDots ?? [],
		};
	} catch (err) {
		console.error('[profile] load failed:', err);
		return {
			subjects: [], allSubjects: [], initialSelectedSubjects: [],
			examHistory: [], activities: [], achievements: [],
			creditPackages: [], transactions: [], topTopics: [],
			scoreHistory: [], creditUsage: [], user: null, streakDots: [],
		};
	}
};
