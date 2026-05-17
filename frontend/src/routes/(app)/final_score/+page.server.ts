import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const ssr = true;
export const prerender = false;

export const load: PageServerLoad = async ({ url, fetch, locals }) => {
	const sessionId = url.searchParams.get('sessionId');

	// Guard: must have a sessionId to render this page
	if (!sessionId) {
		throw redirect(303, '/start_practice');
	}

	// Static UI config (not from DB)
	const navButtons = [
		{ label: 'Dashboard', icon: null, variant: 'outline', prefix: '←', href: '/dashboard' },
		{
			label: 'Redemption mode',
			icon: 'RotateCcw',
			variant: 'default',
			class:
				'bg-[#3C7B1F] hover:bg-[#4E932A] p-1 pr-5 font-bold rounded-[10px] h-[40px] text-white flex items-center gap-2 shadow-lg shadow-emerald-900/10 transition-all tracking-tight text-[13px] border-none'
		},
		{ label: 'Retry test', icon: null, variant: 'outline', prefix: '↺' }
	];

	const sidebarActions = [
		{ t: 'Practice Again', s: 'New set of questions', i: 'Play', bg: 'bg-emerald-50 text-[#3B6D11]' },
		{ t: 'Weak Topics', s: 'AI recommendation', i: 'Target', bg: 'bg-rose-50 text-[#A32D2D]' },
		{ t: 'Review Bookmarks', s: 'Saved items', i: 'Bookmark', bg: 'bg-blue-50 text-blue-600' },
		{ t: 'Full Mock Exam', s: '180q · 120m', i: 'Award', bg: 'bg-indigo-50 text-indigo-600' }
	];

	try {
		const res = await fetch(`/api/practice/${sessionId}/results`, { credentials: 'include' });

		if (!res.ok) {
			console.error('[final_score] results fetch failed:', res.status);
			throw new Error('results fetch failed');
		}

		const json = await res.json();
		const d = json.data;

		const score: number = d.score ?? 0;
		const correct: number = d.correct ?? 0;
		const wrong: number = d.wrong ?? 0;
		const skipped: number = d.skipped ?? 0;
		const totalTimeSecs: number = d.totalTimeSecs ?? 0;

		// Format time as "Xm Ys"
		const timeMins = Math.floor(totalTimeSecs / 60);
		const timeSecs = totalTimeSecs % 60;
		const timeTaken = totalTimeSecs > 0 ? `${timeMins}m ${timeSecs}s` : '—';

		const totalAnswered = correct + wrong;
		const avgSpeedSecs = totalAnswered > 0 ? Math.round(totalTimeSecs / totalAnswered) : 0;
		const avgSpeed = avgSpeedSecs > 0 ? `${avgSpeedSecs}s/q` : '—';

		const date = new Date().toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});

		const subject: string = d.subjectName ?? 'Practice';
		const examType: string = d.examType ?? 'Exam';

		// Derive topic-level breakdown from questions array
		const questions: any[] = d.questions ?? [];
		const topicMap = new Map<string, { correct: number; total: number }>();
		for (const q of questions) {
			const topicKey = q.topic ?? 'General';
			const entry = topicMap.get(topicKey) ?? { correct: 0, total: 0 };
			entry.total++;
			if (q.isCorrect) entry.correct++;
			topicMap.set(topicKey, entry);
		}
		const topics = Array.from(topicMap.entries())
			.map(([name, { correct: c, total: t }]) => ({
				name,
				val: t > 0 ? Math.round((c / t) * 100) : 0
			}))
			.sort((a, b) => b.val - a.val)
			.slice(0, 5);

		// Intelligence metrics
		const efficiencyPercent =
			totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

		// Platform comparison placeholder (real peer data needs a separate endpoint)
		const comparisons = { user: score, avg: Math.max(0, score - 10) };

		const speedVerdict =
			avgSpeedSecs <= 0
				? '—'
				: avgSpeedSecs < 25
					? 'RUSHING'
					: avgSpeedSecs <= 50
						? 'IDEAL'
						: 'TOO SLOW';

		const readinessBoost = score > 60 ? '+3' : score > 40 ? '+1' : '0';

		const cognitiveStats = { hots: Math.min(100, Math.round(score * 0.6)), lots: Math.min(100, Math.round(score * 0.8)) };
		const difficultyVal = Math.max(20, 100 - score);
		const representation = score > 70 ? 'BALANCED' : score > 50 ? 'MODERATE' : 'WEAK';

		const intelligenceMetrics = [
			{ label: 'Total time taken', val: timeTaken, percent: Math.min(100, Math.round((totalTimeSecs / 3600) * 100)) },
			{ label: 'Avg per question', val: avgSpeed, percent: Math.min(100, avgSpeedSecs) },
			{ label: 'Efficiency range', val: `${efficiencyPercent}%`, percent: efficiencyPercent },
			{ label: 'Platform Comparison', val: `${comparisons.avg}%`, percent: comparisons.avg }
		];

		const qualityMetrics = [
			{ label: 'Difficulty Match', val: difficultyVal, icon: 'Target' },
			{ label: 'HOTS Cognitive', val: cognitiveStats.hots, icon: 'Sparkles' },
			{ label: 'LOTS Cognitive', val: cognitiveStats.lots, icon: 'Bot' },
			{ label: 'Balanced Rep.', val: score >= 70 ? 100 : score, icon: 'TrendingUp' }
		];

		return {
			sessionId,
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
			// Raw questions for client-side review mode
			questions
		};
	} catch (err) {
		console.error('[final_score] load error:', err);

		// Graceful fallback — show empty state rather than hardcoded data
		return {
			sessionId,
			score: 0,
			correct: 0,
			wrong: 0,
			skipped: 0,
			readinessBoost: '0',
			timeTaken: '—',
			avgSpeed: '—',
			date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
			subject: '—',
			examType: '—',
			cognitiveStats: { hots: 0, lots: 0 },
			difficultyVal: 0,
			representation: '—',
			topics: [],
			navButtons,
			sidebarActions,
			comparisons: { user: 0, avg: 0 },
			speedVerdict: '—',
			intelligenceMetrics: [],
			qualityMetrics: [],
			questions: []
		};
	}
};
