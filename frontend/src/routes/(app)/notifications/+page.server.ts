import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const filters = [
		{ label: "All", count: 18, active: true },
		{ label: "Unread", count: 8 },
		{ label: "AI alerts", count: 3 },
		{ label: "Achievements", count: 2 },
		{ label: "Referrals", count: 2 },
		{ label: "Reminders", count: 4 },
		{ label: "System", count: 5 },
	];

	const notifications = [
		{
			id: 1,
			section: "TODAY",
			type: "ai-alert",
			title: "AI speed alert — Chemistry",
			description:
				"Your last Chemistry session averaged 22 seconds per question — that's dangerously fast and is causing careless errors. You got 48% when you should be hitting 65%+. Slow down and re-read all 4 options before selecting.",
			time: "2 hours ago",
			tags: [
				{ text: "Speed risk", color: "bg-red-100 text-red-600", icon: "Zap" },
				{ text: "Chemistry", color: "bg-amber-100 text-amber-700" },
			],
			unread: true,
			icon: "Zap",
			iconBg: "bg-red-50",
			iconColor: "text-red-400",
			action: "Practice now",
		},
		{
			id: 2,
			section: "TODAY",
			type: "referral",
			title: "You earned 50 credits from a referral!",
			description:
				"Chisom N. just signed up using your referral code CHUKZ47 and made their first credit purchase. 50 credits have been added to your balance instantly. You now have 240 credits.",
			time: "3 hours ago",
			tags: [
				{
					text: "Referral reward",
					color: "bg-emerald-100 text-emerald-700",
					icon: "Gift",
				},
			],
			unread: true,
			icon: "Gift",
			iconBg: "bg-amber-50",
			iconColor: "text-amber-500",
			action: "View referrals",
		},
		{
			id: 3,
			section: "TODAY",
			type: "challenge",
			title: "Daily challenge is ready — 20 questions waiting",
			description:
				"Your daily practice challenge has been refreshed. Complete all 20 questions today to maintain your 7-day streak 🔥 and earn a +10 bonus credits for perfect completion.",
			time: "6 hours ago",
			tags: [
				{
					text: "Daily reminder",
					color: "bg-red-100 text-red-600",
					icon: "Clock",
				},
				{ text: "+10 bonus credits", color: "bg-emerald-100 text-emerald-700" },
			],
			unread: true,
			icon: "CheckCircle2",
			iconBg: "bg-red-50",
			iconColor: "text-red-500",
			action: "Start challenge",
		},
		{
			id: 4,
			section: "TODAY",
			type: "achievement",
			title: 'Achievement unlocked — "500 Questions Answered" 🎓',
			description:
				"You've answered 500 questions on PrepMaster! You've officially joined the top 30% of active students on the platform. Keep going — the next milestone is 1,000 questions.",
			time: "8 hours ago",
			tags: [
				{
					text: "Achievement",
					color: "bg-blue-100 text-blue-700",
					icon: "Trophy",
				},
			],
			unread: true,
			icon: "Trophy",
			iconBg: "bg-blue-50",
			iconColor: "text-blue-500",
			action: "View badge",
		},
		{
			id: 5,
			section: "YESTERDAY",
			type: "ai-insight",
			title: "Your JAMB readiness score updated — 68/100",
			description:
				"Based on your last 5 sessions, your AI readiness score is now 68/100 — up from 61 last week. You need 80+ to comfortably hit your 280 target. Physics and Chemistry are holding you back.",
			time: "Yesterday, 4:30 PM",
			tags: [
				{ text: "AI insight", color: "bg-blue-100 text-blue-700", icon: "Brain" },
				{ text: "+7 points this week", color: "bg-orange-100 text-orange-700" },
			],
			unread: true,
			icon: "Brain",
			iconBg: "bg-slate-100",
			iconColor: "text-slate-600",
			action: "View analytics",
		},
		{
			id: 6,
			section: "YESTERDAY",
			type: "streak",
			title: "Don't break your 7-day streak! ⚡",
			description:
				"You haven't practiced today yet. Your 7-day study streak is at risk — you need to complete at least 10 questions before midnight to keep it alive.",
			time: "Yesterday, 9:00 PM",
			tags: [
				{
					text: "Streak reminder",
					color: "bg-orange-100 text-orange-700",
					icon: "Clock",
				},
			],
			unread: true,
			icon: "Flame",
			iconBg: "bg-orange-50",
			iconColor: "text-orange-500",
			action: "Practice now",
		},
		{
			id: 7,
			section: "YESTERDAY",
			type: "referral-pending",
			title: "Emeka O. signed up using your referral link!",
			description:
				"Emeka O. just created an account using your referral link. Once they make their first credit purchase, you'll earn 50 credits automatically. Send them a reminder to get started!",
			time: "Yesterday, 2:15 PM",
			tags: [
				{
					text: "Pending reward",
					color: "bg-emerald-100 text-emerald-700",
					icon: "Gift",
				},
			],
			unread: true,
			icon: "UserCheck",
			iconBg: "bg-emerald-50",
			iconColor: "text-emerald-600",
			action: "Send reminder",
		},
		{
			id: 8,
			section: "THIS WEEK",
			type: "new-content",
			title: "New questions added — JAMB 2024 Biology",
			description:
				"We've added 120 new Biology questions from the official JAMB 2024 paper. These are the freshest past questions available — perfect for your upcoming exam in 38 days.",
			time: "Mar 24, 2026",
			tags: [
				{
					text: "New content",
					color: "bg-emerald-100 text-emerald-700",
					icon: "Calendar",
				},
				{ text: "JAMB 2024", color: "bg-blue-100 text-blue-700" },
			],
			unread: false,
			icon: "Calendar",
			iconBg: "bg-slate-50",
			iconColor: "text-emerald-600",
			action: "Practice now",
		},
		{
			id: 9,
			section: "THIS WEEK",
			type: "personal-best",
			title: "New personal best — 84% in Biology!",
			description:
				"You scored 84% in your Biology WAEC 2022 practice session — your highest score ever on PrepMaster! Your previous best was 79%. Keep this up and Biology will be your anchor subject on exam day.",
			time: "Mar 22, 2026",
			tags: [
				{
					text: "Personal best",
					color: "bg-amber-100 text-amber-700",
					icon: "Trophy",
				},
				{ text: "Biology", color: "bg-emerald-100 text-emerald-700" },
			],
			unread: false,
			icon: "Trophy",
			iconBg: "bg-amber-50",
			iconColor: "text-amber-500",
			action: "View result",
		},
	];

	const settings = [
		{
			id: "ai-perf",
			label: "AI performance alerts",
			sub: "Speed risks, weakness detection",
			icon: "Brain",
			iconColor: "text-slate-600",
			checked: true,
		},
		{
			id: "daily-rem",
			label: "Daily challenge reminder",
			sub: "Remind me to complete daily goal",
			icon: "CheckCircle2",
			iconColor: "text-red-500",
			checked: true,
		},
		{
			id: "streak-alerts",
			label: "Streak alerts",
			sub: "Warn before streak breaks",
			icon: "Flame",
			iconColor: "text-orange-500",
			checked: true,
		},
		{
			id: "ref-rewards",
			label: "Referral rewards",
			sub: "When a referral earns credits",
			icon: "Gift",
			iconColor: "text-orange-400",
			checked: true,
		},
		{
			id: "achievements",
			label: "Achievements",
			sub: "Badges and milestones",
			icon: "Trophy",
			iconColor: "text-blue-500",
			checked: true,
		},
		{
			id: "content-alerts",
			label: "New content alerts",
			sub: "New past questions added",
			icon: "Calendar",
			iconColor: "text-emerald-600",
			checked: true,
		},
		{
			id: "exam-countdown",
			label: "Exam countdown",
			sub: "Weekly readiness updates",
			icon: "Clock",
			iconColor: "text-amber-600",
			checked: true,
		},
		{
			id: "credit-alerts",
			label: "Credit alerts",
			sub: "Low balance warnings",
			icon: "Clock",
			iconColor: "text-amber-400",
			checked: false,
		},
	];

	const upcomingReminders = [
		{
			label: "Daily challenge",
			time: "Today, 8PM",
			icon: "CheckCircle2",
			iconColor: "text-red-500",
		},
		{
			label: "Streak check",
			time: "Today, 10PM",
			icon: "Flame",
			iconColor: "text-orange-500",
		},
		{
			label: "Weekly AI report",
			time: "Sun, 9AM",
			icon: "Brain",
			iconColor: "text-blue-500",
		},
		{
			label: "JAMB countdown (37 days)",
			time: "Tomorrow, 9AM",
			icon: "Clock",
			iconColor: "text-orange-400",
		},
	];

	return {
		filters,
		notifications,
		settings,
		upcomingReminders
	};
};