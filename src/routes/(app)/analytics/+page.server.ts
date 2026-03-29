import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		// JAMB Readiness
		readiness: 68,

		subjectsReadiness: [
			{ name: 'Biology',   score: 82, status: 'Strong',  color: 'text-brand-dark', badgeBg: 'bg-brand-muted',      stroke: 'stroke-brand',     bgStroke: 'stroke-brand-dark' },
			{ name: 'English',   score: 78, status: 'Strong',  color: 'text-brand-dark', badgeBg: 'bg-brand-muted',      stroke: 'stroke-brand',     bgStroke: 'stroke-brand-dark' },
			{ name: 'Maths',     score: 61, status: 'Average', color: 'text-amber-700', badgeBg: 'bg-amber-50',   stroke: 'stroke-amber-400', bgStroke: 'stroke-amber-100' },
			{ name: 'Physics',   score: 50, status: 'Weak',    color: 'text-red-600',   badgeBg: 'bg-red-50',     stroke: 'stroke-red-400',   bgStroke: 'stroke-red-100' },
			{ name: 'Chemistry', score: 47, status: 'Weak',    color: 'text-red-600',   badgeBg: 'bg-red-50',     stroke: 'stroke-red-400',   bgStroke: 'stroke-red-100' },
		],

		// KPI cards
		kpis: [
			{ title: 'Score improvement',   value: '+7%',     subtitle: 'vs previous 30 days',       badge: 'Trending up',  badgeClass: 'text-brand-dark bg-brand-muted border border-brand/20',        icon: 'TrendingUp' },
			{ title: 'Avg speed (AI)',       value: '42s/q',   subtitle: 'Target: 40s/q for JAMB',    badge: 'Almost there', badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200/50',         icon: 'Zap' },
			{ title: 'Accuracy rate',        value: '41%',     subtitle: 'Up from 34% last month',    badge: 'Improving',    badgeClass: 'text-brand-dark bg-brand-muted border border-brand/20',        icon: 'Target' },
			{ title: 'Questions/day (avg)',  value: '41',      subtitle: 'Goal: 50 questions/day',    badge: 'Below goal',   badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200/50',         icon: 'Library' },
			{ title: 'Percentile rank',      value: 'Top 34%', subtitle: 'vs all PrepMaster users',   badge: 'Rising',       badgeClass: 'text-purple-700 bg-purple-50 border border-purple-200/50',      icon: 'Trophy' },
		],

		// Score Trend chart data (one entry per data point)
		trendData: [
			{ date: '2026-03-01', score: 42 },
			{ date: '2026-03-05', score: 45 },
			{ date: '2026-03-08', score: 48 },
			{ date: '2026-03-11', score: 43 },
			{ date: '2026-03-14', score: 53 },
			{ date: '2026-03-17', score: 55 },
			{ date: '2026-03-20', score: 61 },
			{ date: '2026-03-22', score: 58 },
			{ date: '2026-03-24', score: 68 },
			{ date: '2026-03-26', score: 72 },
			{ date: '2026-03-28', score: 55 },
		],

		// Radar / Subject balance data
		radarData: [
			{ subject: 'Biology',   you: 80, top10: 90 },
			{ subject: 'English',   you: 75, top10: 85 },
			{ subject: 'Maths',     you: 55, top10: 75 },
			{ subject: 'Physics',   you: 45, top10: 70 },
			{ subject: 'Chemistry', you: 50, top10: 80 },
		],

		// Speed vs Accuracy
		speedVsAccuracy: [
			{ name: 'Biology',     accuracy: 82, speed: 38, badge: 'Ideal',    bClass: 'text-brand-dark bg-brand-muted', color: 'bg-brand',     sColor: 'bg-brand/50', pSpeed: 70 },
			{ name: 'English',     accuracy: 70, speed: 35, badge: 'Ideal',    bClass: 'text-brand-dark bg-brand-muted', color: 'bg-brand',     sColor: 'bg-brand/50', pSpeed: 60 },
			{ name: 'Mathematics', accuracy: 61, speed: 45, badge: 'Steady',   bClass: 'text-blue-700 bg-blue-50',       color: 'bg-amber-500', sColor: 'bg-blue-400', pSpeed: 80 },
			{ name: 'Physics',     accuracy: 50, speed: 62, badge: 'Too slow', bClass: 'text-amber-700 bg-amber-50',     color: 'bg-red-500',   sColor: 'bg-amber-400',pSpeed: 95 },
			{ name: 'Chemistry',   accuracy: 47, speed: 22, badge: 'Rushing!', bClass: 'text-red-600 bg-red-50',         color: 'bg-red-500',   sColor: 'bg-red-500',  pSpeed: 40 },
		],

		// Weakest topics
		weakestTopics: [
			{ title: 'Organic Chemistry',     context: 'Chemistry · 8 attempts',   percent: 32 },
			{ title: 'Electromagnetic waves', context: 'Physics · 6 attempts',     percent: 38 },
			{ title: 'Quadratic equations',   context: 'Mathematics · 11 attempts',percent: 42 },
			{ title: "Newton's Laws",         context: 'Physics · 9 attempts',     percent: 45 },
		],

		// Score distribution
		distData: [
			{ label: '0-20%',   height: '15%',  color: 'bg-red-400/80' },
			{ label: '21-40%',  height: '35%',  color: 'bg-red-300/80' },
			{ label: '41-50%',  height: '55%',  color: 'bg-orange-400/90' },
			{ label: '51-60%',  height: '90%',  color: 'bg-amber-500/90' },
			{ label: '61-70%',  height: '100%', color: 'bg-brand/70' },
			{ label: '71-80%',  height: '80%',  color: 'bg-brand/85' },
			{ label: '81-100%', height: '40%',  color: 'bg-brand' },
		],

		// Peer comparison
		peerComparison: [
			{ subject: 'Biology',     avg: 78, top10: 91, all: 58, vsPeers: '+20%', color: 'text-brand',     stroke: 'bg-brand' },
			{ subject: 'English',     avg: 70, top10: 88, all: 61, vsPeers: '+9%',  color: 'text-brand',     stroke: 'bg-brand' },
			{ subject: 'Mathematics', avg: 61, top10: 85, all: 55, vsPeers: '+6%',  color: 'text-amber-600', stroke: 'bg-amber-500' },
			{ subject: 'Physics',     avg: 50, top10: 82, all: 52, vsPeers: '-2%',  color: 'text-red-500',   stroke: 'bg-red-500' },
			{ subject: 'Chemistry',   avg: 47, top10: 80, all: 50, vsPeers: '-3%',  color: 'text-red-500',   stroke: 'bg-red-500' },
		],
	};
}) satisfies PageServerLoad;