<script lang="ts">
	import {
		CalendarDays, ChevronDown, Bell, MoreHorizontal, Star, ExternalLink,
		Target, Sparkles, Zap, ClipboardCheck, Trophy, TrendingUp, Calculator,
		Dna, Atom
	} from "lucide-svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	let { data } = $props();

	const iconMap = {
		ClipboardCheck, TrendingUp, Trophy, Calculator, Dna, Atom,
		CalendarDays, Target, Sparkles, Zap,
	};

	const themes = {
		orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100/50", shadow: "group-hover:shadow-[0_4px_10px_-2px_rgba(234,88,12,0.2)]", },
		emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100/50", shadow: "group-hover:shadow-[0_4px_10px_-2px_rgba(5,150,105,0.2)]", },
		indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100/50", shadow: "group-hover:shadow-[0_4px_10px_-2px_rgba(79,70,229,0.2)]", },
		amber: { ring: "border-amber-300 text-amber-600", badge: "text-amber-700 bg-amber-50 border-amber-100/50", progress: "bg-amber-500", },
		blue: { ring: "border-blue-300 text-blue-600", badge: "text-blue-700 bg-blue-50 border-blue-100/50", progress: "bg-blue-500", },
		indigo_old: { ring: "border-indigo-300 text-indigo-600", badge: "text-indigo-700 bg-indigo-50 border-indigo-100/50", progress: "bg-indigo-500", },
		gray: { ring: "border-gray-200 text-gray-500", badge: "text-gray-700 bg-gray-50 border-slate-200/60", progress: "bg-gray-300", },
		green: { bg: "bg-brand-muted", text: "text-brand", border: "border-brand/20", shadow: "group-hover:shadow-[0_4px_10px_-2px_rgba(100,170,80,0.2)]", ring: "border-brand text-brand", badge: "text-brand-dark bg-brand-muted border-brand/20", progress: "bg-brand", },
	};
</script>

{#snippet leaderboardRow(participant: any)}
	{@const theme = themes[participant.theme as keyof typeof themes]}
	<div class="flex flex-col pb-2.5 border-b border-gray-200/60 last:border-b-0 last:pb-0 group">
		<div class="flex items-center cursor-default">
			<div class="w-[38px] h-[38px] rounded-full border bg-transparent flex items-center justify-center text-[12px] font-normal group-hover:scale-105 transition-transform duration-300 mr-4 shrink-0 {theme.ring}">
				{participant.initials}
			</div>
			<div class="flex flex-col flex-1 gap-1">
				<div class="flex justify-between items-start w-full mt-1">
					<div class="flex flex-col">
						{#if participant.isMe}
							<div class="flex items-center gap-2">
								<span class="text-[14px] font-normal text-[#141522]">{participant.name}</span>
								<Badge variant="outline" class="text-[10px] font-normal tracking-wide text-brand bg-brand-muted px-1.5 py-0.5 rounded-full border-brand/20 leading-none h-auto">Me</Badge>
							</div>
							<span class="text-[11px] font-normal text-brand/70 mt-0.5">{participant.date}</span>
						{:else}
							<span class="text-[14px] font-normal text-[#141522]">{participant.name}</span>
							<span class="text-[11px] font-normal text-gray-400 mt-0.5">{participant.date}</span>
						{/if}
					</div>
					<Badge variant="outline" class="text-[11px] font-semibold px-2 py-0.5 rounded-md {theme.badge}">{participant.score}%</Badge>
				</div>
				<div class="h-[4px] w-full bg-gray-50 rounded-full overflow-hidden">
					<div class="h-full rounded-full {theme.progress}" style="width: {participant.score}%"></div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<!-- Horizontal Banners -->
<div class="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-4 w-full">
	<!-- Card 1: JAMB Countdown -->
	<div class="relative overflow-hidden rounded-xl bg-linear-to-br flex items-center from-[#0083B0] to-[#00B4DB] text-white p-5 shadow-sm border border-slate-200 group hover:border-brand/40 hover:shadow-lg transition-all duration-300">
		<!-- Illustrative Abstract Background Shapes -->
		<div class="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-[20px] group-hover:scale-110 transition-transform duration-700"></div>
		<div class="absolute right-32 -bottom-10 w-32 h-32 bg-emerald-300 opacity-20 rounded-full blur-[30px] group-hover:-translate-y-4 transition-transform duration-700"></div>

		<!-- Vector Nodes Illustration -->
		<svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
			<path d="M-20,150 Q100,80 200,160 T450,120" fill="none" stroke="white" stroke-width="1.5" stroke-dasharray="6 6"/>
			<circle cx="80" cy="120" r="3" fill="white" />
			<circle cx="280" cy="180" r="4" fill="white" />
			<rect x="350" y="50" width="8" height="8" fill="white" opacity="0.6" transform="rotate(45 354 54)"/>
		</svg>

		<div class="relative z-10 flex items-center justify-between w-full h-full">
			<div class="flex flex-col justify-center">
				<div class="flex items-center gap-1.5 mb-2">
					<CalendarDays class="w-4 h-4 text-emerald-100" />
					<span class="text-[11px] font-bold tracking-widest uppercase text-emerald-100">JAMB 2026 Countdown</span>
				</div>
				<h3 class="text-[18px] font-extrabold tracking-tight mb-2">Stay consistent, you've got this!</h3>
				<div class="flex items-center gap-2 mt-auto">
					<div class="flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-lg backdrop-blur-md border border-white/10 text-[11px] font-medium">
						<Target class="w-3.5 h-3.5 text-emerald-200" /> Target score: <span class="font-bold text-white">280 / 400</span>
					</div>
				</div>
			</div>

			<div class="flex gap-2.5 items-center mr-2">
				{#each [{val: '38', lbl: 'Days'}, {val: '14', lbl: 'Hours'}, {val: '22', lbl: 'Mins'}] as t}
				<div class="flex flex-col items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md rounded-xl w-14 h-16 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
					<span class="text-[22px] font-black leading-none mb-0.5">{t.val}</span>
					<span class="text-[9px] font-semibold text-emerald-100 uppercase tracking-widest">{t.lbl}</span>
				</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Card 2: Limited Offer -->
	<div class="relative overflow-hidden rounded-xl bg-[#121629] text-white p-5 shadow-sm border border-slate-200 group hover:border-brand/40 hover:shadow-lg transition-all duration-300">
		<div class="absolute -left-10 top-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[50px] mix-blend-screen pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-700"></div>
		<div class="absolute right-0 bottom-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[50px] mix-blend-screen pointer-events-none"></div>

		<svg class="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
			<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" stroke-width="1"/></pattern></defs>
			<rect width="100%" height="100%" fill="url(#grid)" />
		</svg>

		<div class="absolute top-[15%] right-[42%] text-amber-300/30 animate-pulse"><Star class="w-6 h-6" /></div>
		<div class="absolute bottom-[20%] left-[45%] text-indigo-300/20"><Sparkles class="w-8 h-8" /></div>

		<div class="relative z-10 flex items-center justify-between w-full h-full">
			<div class="flex flex-col justify-center">
				<div class="flex items-center gap-2 mb-2">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
					</span>
					<span class="text-[10px] font-bold tracking-widest uppercase text-blue-400">Limited Offer • Ends Soon</span>
				</div>
				<h3 class="text-[17px] font-bold mb-1.5 flex items-center gap-2">Unlock more questions <Zap class="w-4 h-4 text-amber-400" /></h3>
				<p class="text-[11px] text-slate-400 font-medium max-w-[200px] leading-relaxed">
					Your <span class="text-white font-bold">240 credits</span> = ~120 questions left. Top up now to continue.
				</p>
			</div>

			<div class="flex items-center gap-2 mr-2">
				<button class="group/btn relative flex flex-col items-center justify-center border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-500 transition-all rounded-xl px-2 py-2 w-[68px] h-[64px]">
					<span class="text-[13px] font-bold text-white group-hover/btn:text-blue-400 transition-colors">200<span class="text-[9px] text-slate-400 ml-0.5">cr</span></span>
					<span class="text-[9px] text-slate-400 font-medium mt-0.5">₦500</span>
				</button>
				<button class="relative flex flex-col items-center justify-center border border-blue-500 bg-linear-to-b from-blue-600 to-indigo-800 rounded-xl px-2 py-2 w-[76px] h-[74px] shadow-[0_0_20px_rgba(59,130,246,0.3)] transform hover:scale-105 transition-all">
					<div class="absolute -top-2.5 bg-amber-400 text-[#121629] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">Best value</div>
					<span class="text-[15px] font-black text-white mt-1">500<span class="text-[9px] text-blue-200 ml-0.5 font-bold">cr</span></span>
					<span class="text-[9px] text-blue-200 font-semibold mt-0.5 shadow-sm">₦1,000</span>
				</button>
				<button class="group/btn relative flex flex-col items-center justify-center border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-500 transition-all rounded-xl px-2 py-2 w-[68px] h-[64px]">
					<span class="text-[13px] font-bold text-white group-hover/btn:text-blue-400 transition-colors">1200<span class="text-[9px] text-slate-400 ml-0.5">cr</span></span>
					<span class="text-[9px] text-slate-400 font-medium mt-0.5">₦2,000</span>
				</button>
			</div>
		</div>
	</div>
</div>

<div class="flex gap-4 w-full">
	<div class="flex-1 flex flex-col min-w-[500px] gap-4">
		<!-- Summary Cards -->
		<div class="grid grid-cols-3 gap-4">
			{#each data.summaryCards as card}
				{@const Icon = iconMap[card.icon as keyof typeof iconMap]}
				<div class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased">
					{#if Icon}
						<Icon class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125" stroke-width={1.5} />
					{/if}
					
					<div class="flex items-center justify-between relative z-10">
						<span class="text-[12px] font-medium text-gray-500 tracking-tight">{card.title}</span>
						<button class="text-gray-400/50 hover:text-brand transition-colors"><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button>
					</div>

					<span class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10">{card.value}</span>
					
					<div class="flex items-center justify-between w-full relative z-10">
						<span class="text-[10px] font-bold text-gray-400 mt-px mr-px leading-none">{card.subtext}</span>
						<Badge variant="outline" class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-brand-dark bg-brand-muted border-brand/20">
							{card.trend}
						</Badge>
					</div>
				</div>
			{/each}
		</div>

		<!-- Daily Challenge & Continue Studying Cards -->
		<div class="grid grid-cols-2 gap-4">
			<div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300">
				<div class="flex items-center justify-between mb-5">
					<h3 class="text-[15px] font-semibold text-[#141522]">Today's daily challenge</h3>
					<button class="text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">View all</button>
				</div>
				<div class="flex flex-col gap-4 mt-2">
					{#each data.dailyChallenges as challenge}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between items-center text-[13px]">
								<span class="font-medium text-[#2d325a]">{challenge.subject}</span>
								<span class="font-normal text-gray-400">{challenge.current} / {challenge.total}</span>
							</div>
							<div class="h-[7px] w-full bg-gray-100 rounded-full overflow-hidden">
								<div class="h-full bg-{challenge.color}-600 rounded-full" style="width: {(challenge.current / challenge.total) * 100}%"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300">
				<div class="absolute -right-6 -top-6 w-24 h-24 bg-brand-50 rounded-full blur-2xl pointer-events-none"></div>
				<div class="flex items-center justify-between mb-5 relative z-10">
					<h3 class="text-[15px] font-semibold text-[#141522]">Continue studying</h3>
					<button class="text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">See all</button>
				</div>
				<div class="flex flex-col justify-between h-full pt-1 gap-5 pb-1 relative z-10">
					{#each data.studyingItems as item}
						{@const theme = themes[item.theme as keyof typeof themes]}
						{@const Icon = iconMap[item.icon as keyof typeof iconMap]}
						<div class="flex items-center justify-between group">
							<div class="flex items-center gap-3.5">
								<div class="w-11 h-11 rounded-xl {theme?.bg ?? 'bg-gray-50'} flex items-center justify-center {theme?.text ?? 'text-gray-600'} group-hover:scale-105 {theme?.shadow ?? ''} transition-all duration-300 border {theme?.border ?? 'border-slate-200'}">
									<Icon class="w-5 h-5" stroke-width={1.2} />
								</div>
								<div class="flex flex-col">
									<span class="text-[13px] font-medium text-[#141522]">{item.subject}</span>
									<span class="text-[12px] font-normal text-gray-400 mt-px">{item.detail}</span>
								</div>
							</div>
							{#if item.type === "resume"}
								<button class="text-[11px] font-semibold text-brand hover:bg-brand-muted px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-brand/20">Resume</button>
							{:else}
								<span class="text-[14px] font-semibold text-[#141522] mr-3">{item.score}</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Line Chart Segment -->
		<div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative flex flex-col h-[260px] hover:border-brand/40 hover:shadow-lg transition-all duration-300">
			<div class="flex items-start justify-between">
				<div class="flex flex-col">
					<h3 class="text-[15px] font-bold text-[#141522]">Grade Point Average</h3>
					<p class="text-[11px] font-medium text-gray-400 mt-1">Comparison between your GPA and Average Student GPA.</p>
				</div>
				<Select.Root>
					<Select.Trigger class="w-fit flex items-center gap-1.5 px-2 py-1 h-auto text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-none">
						All Semesters
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Semesters</Select.Item>
						<Select.Item value="1st">1st Semester</Select.Item>
						<Select.Item value="2nd">2nd Semester</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="relative w-full h-full mt-3 flex">
				<div class="flex flex-col justify-between h-full py-2 pr-3">
					{#each ['4.0', '3.5', '3.0', '2.5', '2.0', '1.5', '1.0'] as score}
						<span class="text-[9px] font-semibold text-gray-300 {score === '1.0' ? 'mb-4' : ''}">{score}</span>
					{/each}
				</div>
				<div class="relative w-full h-full pb-4">
					<div class="absolute inset-x-0 inset-y-0 pb-4 flex flex-col justify-between pointer-events-none">
						{#each Array(7).fill('') as _, i}
							<div class="w-full {i === 6 ? 'h-px' : ''} border-t border-slate-200/50"></div>
						{/each}
					</div>
					<svg width="100%" height="85%" viewBox="0 0 1000 200" preserveAspectRatio="none" class="absolute top-0 w-full h-full pb-[20px] pointer-events-none">
						<defs>
							<linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stop-color="rgba(111, 84, 189, 0.15)" />
								<stop offset="100%" stop-color="rgba(111, 84, 189, 0)" />
							</linearGradient>
						</defs>
						<path d="M0,170 C100,165 150,110 200,110 C250,110 320,80 400,140 C450,180 500,140 600,140 C700,140 800,90 900,80 C950,75 1000,75 1000,75" fill="none" stroke="#ED7487" stroke-width="2" stroke-dasharray="6,6" stroke-linecap="round"/>
						<path id="main-line" d="M0,130 C100,130 150,110 200,90 C250,70 300,70 350,140 C400,210 430,220 500,190 C550,160 650,110 700,110 C750,110 850,50 900,40 C950,30 1000,10 1000,10" fill="none" stroke="#715BCA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M0,130 C100,130 150,110 200,90 C250,70 300,70 350,140 C400,210 430,220 500,190 C550,160 650,110 700,110 C750,110 850,50 900,40 C950,30 1000,10 1000,10 L1000,200 L0,200 Z" fill="url(#area-gradient)"/>
					</svg>
					<div class="absolute inset-0 pointer-events-none w-full h-full">
						<div class="absolute top-[63%] left-[45%] w-1.5 h-1.5 rounded-full border border-white bg-[#715BCA] shadow-md z-10 pointer-events-auto"></div>
						<div class="absolute top-[20%] left-[45%] -translate-x-[45%] bg-white rounded-lg border border-slate-200 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] p-3 min-w-[150px] z-20 pointer-events-auto">
							<h4 class="text-[11px] font-bold text-[#141522] mb-2">2nd Semester 2025</h4>
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-1.5"><div class="w-1 h-1 rounded-full bg-[#715BCA]"></div><span class="text-[11px] font-medium text-gray-500">Your GPA</span></div>
								<span class="text-[11px] font-bold text-[#141522]">2.33</span>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-1.5"><div class="w-1 h-1 rounded-full bg-[#ED7487]"></div><span class="text-[11px] font-medium text-gray-500">Average GPA</span></div>
								<span class="text-[11px] font-bold text-[#141522]">2.49</span>
							</div>
						</div>
						<div class="absolute top-[28%] left-[45%] w-px bottom-4 border-l border-dashed border-gray-200 -z-10"></div>
					</div>
					<div class="absolute bottom-0 inset-x-0 w-full flex justify-between px-6">
						{#each ['1st', '2nd', '3rd', '4th', '5th', '6th'] as sem}
							<span class="text-[9px] font-semibold text-gray-400">{sem} Semester</span>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Table segment -->
		<div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col hover:border-brand/40 hover:shadow-lg transition-all duration-300">
			<div class="flex items-center justify-between mb-4">
				<div class="flex flex-col">
					<h3 class="text-[15px] font-bold text-[#141522]">Payment & Tuition History</h3>
					<p class="text-[11px] font-medium text-gray-400 mt-0.5">Complete data about your payment and tuition history</p>
				</div>
				<button class="text-[11px] font-bold text-[#2d325a] hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all">View All Payment</button>
			</div>
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-200">
						{#each ['Payment ID', 'Payment Category', 'Date', 'Payment Status'] as header}
							<th class="py-2 px-2 text-xs font-semibold text-[#8A92A6]">{header}</th>
						{/each}
						<th class="py-2 px-2 w-8"><MoreHorizontal class="w-4 h-4 text-gray-300" /></th>
					</tr>
				</thead>
				<tbody>
					{#each data.payments as payment}
						<tr class="border-b border-gray-50 last:border-b-0 group transition-colors hover:bg-gray-50/50">
							<td class="py-2.5 px-2 text-[13px] font-bold text-[#141522]">{payment.id}</td>
							<td class="py-2.5 px-2 text-[12px] font-bold text-[#141522]">{payment.category}</td>
							<td class="py-2.5 px-2 text-[12px] font-medium text-[#8A92A6]">{payment.date}</td>
							<td class="py-2.5 px-2"><Badge variant="outline" class="text-[10px] border-transparent font-bold text-{payment.statusColor}-600 bg-{payment.statusColor}-50 px-2.5 py-0.5 rounded-md hover:bg-{payment.statusColor}-50">{payment.status}</Badge></td>
							<td class="py-2.5 px-2"><ExternalLink class="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-900"/></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Leaderboard -->
	<div class="w-[300px] shrink-0 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6 antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300">
		<div class="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60">
			<h3 class="text-[15px] font-semibold tracking-wide text-[#141522]">Leaderboard</h3>
			<button class="text-[11px] font-medium text-brand bg-brand-muted hover:bg-brand/10 px-3 py-1.5 rounded-full transition-colors border border-brand/20">View full</button>
		</div>
		<div class="flex flex-col gap-2.5">
			{#each data.leaderboard as participant}
				{@render leaderboardRow(participant)}
			{/each}
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
	:global(body) { font-family: "Plus Jakarta Sans", sans-serif; }
</style>
