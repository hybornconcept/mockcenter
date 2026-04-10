import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const topMetrics = [
		{ title: 'Pass rate', value: '72%', subtext: '34 of 47 tests passed', badgeType: 'green', badgeText: 'Above average', icon: 'CheckSquare' },
		{ title: 'Total study time', value: '14h 20m', subtext: 'Avg 18 mins per session', badgeType: 'blue', badgeText: 'Consistent', icon: 'Clock' },
		{ title: 'Avg time per question', value: '42s', subtext: 'JAMB target is 40s/q', badgeType: 'orange', badgeText: 'Slightly slow', icon: 'Zap' },
		{ title: 'AI accuracy trend', value: '↑ +7%', subtext: 'Improving over 14 days', badgeType: 'green', badgeText: 'On the rise', icon: 'Bot' }
	];

	const aiBadges = [
		{ text: 'Strong: Biology, English', icon: 'Check', type: 'strong' },
		{ text: 'Rushing: Chemistry', icon: 'AlertTriangle', type: 'warning' },
		{ text: 'Too slow: Physics', icon: 'Hourglass', type: 'slow' },
		{ text: 'JAMB readiness: 68/100', icon: 'Target', type: 'target' }
	];

	const testHistory = [
		{ subject: 'Biology', testCode: 'WAEC 2022 · 40 q', score: 84, speed: '30s/q', speedVerdict: 'Great', speedColor: 'green', accuracy: 'Excellent', accuracyColor: 'green', date: 'Mar 26', icon: 'Dna', theme: 'emerald' },
		{ subject: 'Mathematics', testCode: 'JAMB 2023 · 60 q', score: 74, speed: '45s/q', speedVerdict: 'Good', speedColor: 'blue', accuracy: 'Good pace', accuracyColor: 'blue', date: 'Mar 25', icon: 'Calculator', theme: 'orange' },
		{ subject: 'Physics', testCode: 'NECO 2021 · 60 q', score: 55, speed: '62s/q', speedVerdict: 'Too slow', speedColor: 'orange', accuracy: 'Needs work', accuracyColor: 'orange', date: 'Mar 24', icon: 'Atom', theme: 'indigo' }
	];

	const breakdown = {
		correct: 512,
		wrong: 728,
		skipped: 94,
		accuracy: 41
	};

	return {
		topMetrics,
		aiBadges,
		testHistory,
		breakdown
	};
};