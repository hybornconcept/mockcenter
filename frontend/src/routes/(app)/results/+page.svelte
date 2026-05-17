<script lang="ts">
	import {
		CheckSquare, Clock, Zap, Bot, Check, AlertTriangle, Hourglass, Target, Dna, Calculator, Atom, ChevronDown, MoreHorizontal, TrendingUp, FileText, Timer
	} from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import Empty from "$lib/components/Empty.svelte";

	let { data } = $props();

	const iconMap = { CheckSquare, Clock, Zap, Bot, Check, AlertTriangle, Hourglass, Target, Dna, Calculator, Atom, TrendingUp, FileText, Timer };

	const metricBadgeThemes = {
		green: "bg-[#f0fdf4] text-[#166534]",
		blue: "bg-[#eff6ff] text-[#1e40af]",
		orange: "bg-[#fff7ed] text-[#9a3412]",
	};

	const aiBadgeThemes = {
		strong: "bg-emerald-500/10 border-emerald-500/20 text-emerald-100",
		warning: "bg-amber-500/10 border-amber-500/20 text-amber-100",
		slow: "bg-orange-500/10 border-orange-500/20 text-orange-100",
		target: "bg-brand/10 border-brand/20 text-white",
	};

	const aiBadgeIconColors = { strong: "text-emerald-400", warning: "text-amber-400", slow: "text-orange-400", target: "text-white" };

	const tableThemes = {
		emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100/50" },
		orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100/50" },
		indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100/50" },
	};

	const speedColors = {
		green: "text-brand bg-brand/10 border border-brand/20",
		blue: "text-blue-600 bg-blue-50",
		orange: "text-amber-600 bg-amber-50",
	};
</script>

<div class="flex flex-col w-full min-h-screen text-[#141522] antialiased">
	<!-- Top Metrics -->
	<div class="grid grid-cols-4 gap-4 mb-5">
		{#each data.topMetrics as metric}
			{@const Icon = iconMap[metric.icon as keyof typeof iconMap]}
			{@const badgeTheme = metricBadgeThemes[metric.badgeType as keyof typeof metricBadgeThemes]}
			<div class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[118px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased">
				{#if Icon}
					<Icon class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125" stroke-width={1.5} />
				{/if}

				<div class="flex items-center justify-between w-full relative z-10">
					<span class="text-[12px] font-medium text-gray-500 tracking-tight">{metric.title}</span>
					<button class="text-gray-400/50 hover:text-brand transition-colors"><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button>
				</div>

				<span class="text-[25px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10">{metric.value}</span>
				
				<div class="flex items-center justify-between w-full relative z-10">
					<span class="text-[10px] font-medium text-gray-400 leading-none">{metric.subtext}</span>
					<Badge variant="outline" class="px-2 py-[2px] rounded-full text-[8.5px] font-bold uppercase tracking-widest leading-none {badgeTheme} border-brand/20">
						{metric.badgeText}
					</Badge>
				</div>
			</div>
		{/each}
	</div>

	<!-- AI Performance Banner -->
	<div class="bg-[#0b3b6c] rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between gap-6 mb-5 border border-slate-200 relative overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300">
		<div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#0c325c] to-transparent pointer-events-none"></div>
		<div class="flex gap-5 items-center w-full relative z-10">
			<div class="w-[52px] h-[52px] rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
				<Bot class="w-7 h-7 text-blue-50" stroke-width={1.2} />
			</div>
			<div class="flex flex-col">
				<h3 class="text-[14px] font-bold text-white mb-1 tracking-wide">AI performance snapshot</h3>
				<p class="text-[12px] text-blue-100/70 leading-relaxed mb-3 pr-8 font-medium">
					Based on your last 47 sessions, you answer <strong class="text-white font-bold">Biology and English</strong>
					questions 38% faster than average with high accuracy — your strongest subjects. However, you are rushing
					<strong class="text-white font-bold">Chemistry</strong> (avg 22s/q) causing careless errors. Your current JAMB readiness score is
					<Badge variant="outline" class="text-white font-black bg-blue-500/20 border-transparent px-1 py-0.5 rounded text-[13px] inline-flex">68/100</Badge> — focus on Physics and Chemistry to reach your 280 target.
				</p>
				<div class="flex flex-wrap gap-2.5">
					{#each data.aiBadges as badge}
						{@const BadgeIcon = iconMap[badge.icon as keyof typeof iconMap]}
						{@const badgeTheme = aiBadgeThemes[badge.type as keyof typeof aiBadgeThemes]}
						{@const badgeIconColor = aiBadgeIconColors[badge.type as keyof typeof aiBadgeIconColors]}
						<Badge variant="outline" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide {badgeTheme}">
							<BadgeIcon class="w-3.5 h-3.5 {badgeIconColor}" stroke-width={1.5} /> {badge.text}
						</Badge>
					{/each}
				</div>
			</div>
		</div>
		<button class="shrink-0 bg-white text-[#0b3b6c] text-[12px] font-bold px-4 py-2.5 rounded-lg whitespace-nowrap hover:bg-gray-50 transition-colors shadow-sm z-10">
			Full AI Report &rarr;
		</button>
	</div>

	<div class="flex gap-5 w-full items-start pb-5">
		<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex-1 flex flex-col antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-[15px] font-bold text-[#141522]">Test history</h3>
				<div class="flex gap-2.5">
					<Select.Root>
						<Select.Trigger class="w-fit flex items-center gap-1.5 h-auto text-[12px] font-medium text-[#141522] bg-[#f8f9fb] border border-gray-200 px-3.5 py-2 rounded-[10px] hover:bg-gray-100 transition-colors shadow-none">
							All subjects
						</Select.Trigger>
						<Select.Content><Select.Item value="all">All subjects</Select.Item></Select.Content>
					</Select.Root>
					<Select.Root>
						<Select.Trigger class="w-fit flex items-center gap-1.5 h-auto text-[12px] font-medium text-[#141522] bg-[#f8f9fb] border border-gray-200 px-3.5 py-2 rounded-[10px] hover:bg-gray-100 transition-colors shadow-none">
							All exams
						</Select.Trigger>
						<Select.Content><Select.Item value="all">All exams</Select.Item></Select.Content>
					</Select.Root>
				</div>
			</div>

			<Tabs.Root value="all" class="w-full">
				<Tabs.List class="flex items-center h-auto bg-transparent gap-2.5 mb-8 justify-start w-[30%]">
					<Tabs.Trigger value="all" class="data-[state=active]:bg-brand/10 data-[state=active]:text-brand data-[state=active]:border-brand/30 data-[state=active]:shadow-none px-4 py-1.5 text-[11px] font-medium rounded-full border bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">All</Tabs.Trigger>
					<Tabs.Trigger value="week" class="data-[state=active]:bg-brand/10 data-[state=active]:text-brand data-[state=active]:border-brand/30 data-[state=active]:shadow-none px-4 py-1.5 text-[11px] font-medium bg-[#f8f9fb] text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 transition-colors">This week</Tabs.Trigger>
					<Tabs.Trigger value="month" class="data-[state=active]:bg-brand/10 data-[state=active]:text-brand data-[state=active]:border-brand/30 data-[state=active]:shadow-none px-4 py-1.5 text-[11px] font-medium bg-[#f8f9fb] text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 transition-colors">This month</Tabs.Trigger>
					<Tabs.Trigger value="practice" class="data-[state=active]:bg-brand/10 data-[state=active]:text-brand data-[state=active]:border-brand/30 data-[state=active]:shadow-none px-4 py-1.5 text-[11px] font-medium bg-[#f8f9fb] text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 transition-colors">Practice</Tabs.Trigger>
					<Tabs.Trigger value="mock" class="data-[state=active]:bg-brand/10 data-[state=active]:text-brand data-[state=active]:border-brand/30 data-[state=active]:shadow-none px-4 py-1.5 text-[11px] font-medium bg-[#f8f9fb] text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 transition-colors">Mock exams</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>

			<div class="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1.2fr] gap-4 pb-3 border-b border-gray-50/50 px-2 text-[11px] font-medium text-[#8A92A6] mb-2">
				{#each ['Subject', 'Score', 'AI speed verdict', 'AI accuracy', 'Date', ''] as header}
					<div>{header}</div>
				{/each}
			</div>

			<div class="flex flex-col">
				{#each data.testHistory as test}
					{@const Icon = iconMap[test.icon as keyof typeof iconMap]}
					{@const theme = tableThemes[test.theme as keyof typeof tableThemes]}
					{@const speedTheme = speedColors[test.speedColor as keyof typeof speedColors]}
					<div class="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1.2fr] gap-4 py-3.5 px-2 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/40 rounded-xl transition-colors group">
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 rounded-xl {theme?.bg ?? 'bg-gray-50'} flex items-center justify-center {theme?.text ?? 'text-gray-600'} border {theme?.border ?? 'border-gray-100'} group-hover:scale-105 transition-all">
								<Icon class="w-4 h-4" stroke-width={1.2} />
							</div>
							<div class="flex flex-col">
								<span class="text-[13px] font-bold text-[#141522] tracking-tight">{test.subject}</span>
								<span class="text-[11px] font-medium text-gray-400">{test.testCode}</span>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-6 h-[4px] rounded-full bg-brand"></div>
							<span class="text-[13px] font-bold text-[#141522]">{test.score}%</span>
						</div>
						<div><Badge variant="outline" class="text-[10px] font-semibold px-2 py-1 h-auto rounded w-fit inline-flex {speedTheme}"><strong class="font-bold mr-1">{test.speed}</strong> <span class="opacity-50 mx-0.5 mr-1">-</span> {test.speedVerdict}</Badge></div>
						<div><span class="text-[11px] font-bold {test.accuracyColor === 'green' ? 'text-brand' : test.accuracyColor === 'blue' ? 'text-blue-500' : 'text-amber-500'}">{test.accuracy}</span></div>
						<div class="text-[12px] font-medium text-gray-400">{test.date}</div>
						<div class="flex items-center gap-1.5 justify-end hidden lg:flex">
							<button class="px-3 py-1 text-[11px] font-bold text-brand bg-white border border-brand/30 rounded-lg hover:bg-brand/5 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">Review</button>
							<button class="px-3 py-1 text-[11px] font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">Retry</button>
						</div>
					</div>
				{:else}
					<div class="py-12">
						<Empty title="No test history" message="You haven't completed any tests matching these filters." />
					</div>
				{/each}
			</div>
		</div>

		<div class="w-[300px] shrink-0 bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-fit antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300">
			<h3 class="text-[14px] font-bold text-[#141522] mb-5">Overall breakdown</h3>
			<div class="grid grid-cols-3 gap-2.5 mb-8">
				{#each [{v: data.breakdown.correct, l: 'Correct', t: 'text-brand'}, {v: data.breakdown.wrong, l: 'Wrong', t: 'text-red-600'}, {v: data.breakdown.skipped, l: 'Skipped', t: 'text-amber-700'}] as stat}
					<div class="bg-gray-50/50 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100/50 shadow-sm">
						<span class="text-[16px] font-bold {stat.t}">{stat.v}</span>
						<span class="text-[10px] font-medium text-gray-400 mt-0.5">{stat.l}</span>
					</div>
				{/each}
			</div>

			<div class="flex justify-center mb-8 relative">
				<div class="relative w-[140px] h-[140px] flex items-center justify-center rounded-full" style="background: conic-gradient(oklch(0.61 0.11 222) {data.breakdown.accuracy}%, #e44d4d {data.breakdown.accuracy}% 100%);">
					<div class="absolute inset-[14px] bg-white rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50/50">
						<span class="text-[26px] font-black text-[#141522] leading-none tracking-tight">{data.breakdown.accuracy}%</span>
						<span class="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-widest text-center px-4 leading-tight">accuracy</span>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<div class="w-2.5 h-2.5 rounded-[3px] bg-brand shadow-sm"></div>
				<span class="text-[11px] font-semibold text-gray-500">Correct &mdash; {data.breakdown.accuracy}%</span>
			</div>
		</div>
	</div>
</div>
