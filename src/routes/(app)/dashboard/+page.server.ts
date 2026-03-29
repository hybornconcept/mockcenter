import type { PageServerLoad } from './$types';
import { ClipboardCheck, TrendingUp, Trophy, Calculator, Dna, Atom } from 'lucide-svelte';

export const load: PageServerLoad = async () => {
	const summaryCards = [
		{ title: 'Total tests taken', value: '47', subtext: '+3 this week', trend: 'On track', icon: 'ClipboardCheck' },
		{ title: 'Average score', value: '61%', subtext: 'Up from 54% last week', trend: 'Improving', icon: 'TrendingUp' },
		{ title: 'Best score ever', value: '84%', subtext: 'Biology · Mar 2026', trend: 'Personal best', icon: 'Trophy' }
	];

	const dailyChallenges = [
		{ subject: 'Mathematics', current: 12, total: 20, color: 'amber' },
		{ subject: 'English Language', current: 20, total: 20, color: 'emerald' },
		{ subject: 'Biology', current: 5, total: 20, color: 'blue' },
		{ subject: 'Physics', current: 0, total: 20, color: 'gray' }
	];

	const studyingItems = [
		{ subject: 'Mathematics', detail: 'JAMB 2023 · Q14 of 60', type: 'resume', icon: 'Calculator', theme: 'orange' },
		{ subject: 'Biology', detail: 'WAEC 2022 · Completed', type: 'score', score: '78%', icon: 'Dna', theme: 'emerald' },
		{ subject: 'Physics', detail: 'NECO 2021 · Completed', type: 'score', score: '55%', icon: 'Atom', theme: 'indigo' }
	];

	const leaderboard = [
		{ name: 'Amaka N.', initials: 'AN', date: 'Today, 10:42 AM', score: 91, theme: 'amber' },
		{ name: 'Tunde K.', initials: 'TK', date: 'Yesterday', score: 88, theme: 'blue' },
		{ name: 'Obiora B.', initials: 'OB', date: 'Yesterday', score: 85, theme: 'indigo' },
		{ name: 'Fatima U.', initials: 'FU', date: 'Mar 27, 2026', score: 82, theme: 'gray' },
		{ name: 'Chidi E.', initials: 'CE', date: 'Mar 26, 2026', score: 81, theme: 'gray' },
		{ name: 'Aisha M.', initials: 'AM', date: 'Mar 26, 2026', score: 79, theme: 'gray' },
		{ name: 'Seyi O.', initials: 'SO', date: 'Mar 25, 2026', score: 76, theme: 'gray' },
		{ name: 'Ngozi A.', initials: 'NA', date: 'Mar 24, 2026', score: 74, theme: 'gray' },
		{ name: 'Emeka C.', initials: 'EC', date: 'Mar 22, 2026', score: 72, theme: 'gray' },
		{ name: 'Zainab I.', initials: 'ZI', date: 'Mar 20, 2026', score: 69, theme: 'gray' },
		{ name: 'Bisi R.', initials: 'BR', date: 'Mar 18, 2026', score: 65, theme: 'gray' },
		{ name: 'You', initials: 'ME', date: 'Just now', score: 61, theme: 'green', isMe: true },
		{ name: 'Halima S.', initials: 'HS', date: 'Mar 15, 2026', score: 58, theme: 'gray' },
		{ name: 'Kemi T.', initials: 'KT', date: 'Mar 14, 2026', score: 55, theme: 'gray' },
		{ name: 'Femi L.', initials: 'FL', date: 'Mar 12, 2026', score: 50, theme: 'gray' }
	];

	const payments = [
		{ id: 'PID - 331829', category: '6th Semester Tuition', date: '23 October 2024', status: 'On-Verification', statusColor: 'amber' },
		{ id: 'PID - 331828', category: 'Internship Program 2025', date: '24 August 2024', status: 'Completed', statusColor: 'emerald' },
		{ id: 'PID - 331827', category: '5th Semester Tuition', date: '20 May 2024', status: 'Completed', statusColor: 'emerald' },
		{ id: 'PID - 331826', category: '4th Semester Tuition', date: '22 October 2023', status: 'Completed', statusColor: 'emerald' }
	];

	return {
		summaryCards,
		dailyChallenges,
		studyingItems,
		leaderboard,
		payments
	};
};
