import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load = (async ({ url }) => {
	const sessionId = url.searchParams.get('sessionId');

	// Static fallback data (used when no real session data available)
	const score = 74;
	const correct = 15;
	const wrong = 5;
	const skipped = 0;
	const readinessBoost = "+3";
	const timeTaken = "18m 24s";
	const avgSpeed = "38s/q";
	const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	const subject = "Biology";
	const examType = "JAMB 2022";

	// Intelligence Metrics
	const cognitiveStats = { hots: 40, lots: 60 };
	const difficultyVal = 82;
	const representation = "BALANCED";

	const topics = [
		{ name: "Genetics / DNA", val: 98 },
		{ name: "Ecology & Habitat", val: 72 },
		{ name: "Reproduction", val: 89 },
		{ name: "Nutrition & Digestion", val: 82 },
		{ name: "Cell Biology", val: 99 },
	];

	const navButtons = [
		{ label: "Dashboard", icon: null, variant: "outline", prefix: "←", href: "/dashboard" },
		{
			label: "Redemption mode",
			icon: "RotateCcw",
			variant: "default",
			class: "bg-[#3C7B1F] hover:bg-[#4E932A] p-1 pr-5 font-bold rounded-[10px] h-[40px] text-white flex items-center gap-2 shadow-lg shadow-emerald-900/10 transition-all tracking-tight text-[13px] border-none",
		},
		{ label: "Retry test", icon: null, variant: "outline", prefix: "↺" },
	];

	const sidebarActions = [
		{
			t: "Practice Again",
			s: "New set of questions",
			i: "Play",
			bg: "bg-emerald-50 text-[#3B6D11]",
		},
		{
			t: "Weak Topics",
			s: "AI recommendation",
			i: "Target",
			bg: "bg-rose-50 text-[#A32D2D]",
		},
		{
			t: "Review Bookmarks",
			s: "Saved items",
			i: "Bookmark",
			bg: "bg-blue-50 text-blue-600",
		},
		{
			t: "Full Mock Exam",
			s: "180q · 120m",
			i: "Award",
			bg: "bg-indigo-50 text-indigo-600",
		},
	];

	const comparisons = { user: 74, avg: 58 };
	const speedVerdict = "IDEAL";

	const efficiencyPercent = Math.round((correct / (correct + wrong)) * 100);
	const intelligenceMetrics = [
		{ label: "Total time taken", val: timeTaken, percent: 68 },
		{ label: "Avg per question", val: avgSpeed, percent: 42 },
		{ label: "Efficiency range", val: `${efficiencyPercent}%`, percent: efficiencyPercent },
		{ label: "Platform Comparison", val: `${comparisons.avg}%`, percent: comparisons.avg },
	];

	const qualityMetrics = [
		{ label: "Difficulty Match", val: difficultyVal, icon: "Target" },
		{ label: "HOTS Cognitive", val: cognitiveStats.hots, icon: "Sparkles" },
		{ label: "LOTS Cognitive", val: cognitiveStats.lots, icon: "Bot" },
		{ label: "Balanced Rep.", val: 100, icon: "TrendingUp" },
	];

	return {
		// Pass sessionId to the client so it can load real results from sessionStorage
		sessionId,
		// Static fallback data
		score,
		correct,
		wrong,
		skipped,
		readinessBoost,
		timeTaken,
		avgSpeed,
		date,
		subject,
		examType,
		cognitiveStats,
		difficultyVal,
		representation,
		topics,
		navButtons,
		sidebarActions,
		comparisons,
		speedVerdict,
		intelligenceMetrics,
		qualityMetrics,
	};
}) satisfies PageServerLoad;