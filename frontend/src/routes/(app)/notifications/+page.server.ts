import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;
	if (!user) return { filters: [], notifications: [], settings: [], upcomingReminders: [] };

	try {
		const res = await fetch('/api/users/notifications', { credentials: 'include' });
		if (!res.ok) throw new Error('notifications fetch failed');
		const json = await res.json();
		const d = json.data;

		const notifs: any[] = d.notifications ?? [];
		const unreadCount: number = d.unreadCount ?? 0;

		const filters = [
			{ label: 'All', count: notifs.length, active: true },
			{ label: 'Unread', count: unreadCount },
			{ label: 'Referrals', count: notifs.filter((n: any) => n.type === 'referral').length },
			{ label: 'Credits', count: notifs.filter((n: any) => n.type === 'credit').length },
			{ label: 'System', count: notifs.filter((n: any) => n.type === 'system').length },
		];

		const upcomingReminders = [
			{ label: 'Daily challenge', time: 'Today, 8PM', icon: 'CheckCircle2', iconColor: 'text-red-500' },
			{ label: 'Weekly AI report', time: 'Sun, 9AM', icon: 'Brain', iconColor: 'text-blue-500' },
		];

		return {
			filters,
			notifications: notifs,
			settings: d.settings ?? [],
			upcomingReminders,
		};
	} catch (err) {
		console.error('[notifications] load failed:', err);
		return { filters: [], notifications: [], settings: [], upcomingReminders: [] };
	}
};
