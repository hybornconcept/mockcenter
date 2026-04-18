<script lang="ts">
	import {
		RotateCcw,
		Zap,
		Bot,
		Clock,
		GraduationCap,
		TrendingUp,
		Target,
		Bookmark,
		ArrowRight,
		Play,
		Award,
		Sparkles,
		ChevronRight,
		ChevronDown,
		Link2,
		MessageCircle,
		Check,
		Undo2,
	} from "lucide-svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
	import { goto } from "$app/navigation";

	let { data } = $props();

	let mounted = $state(false);
	let showTopics = $state(true);
	let typedText = $state("");
	let isStartingRedemption = $state(false);

	// Real results loaded from sessionStorage (populated by the quiz page on submit)
	let realResults = $state<{
		score: number;
		correct: number;
		wrong: number;
		skipped: number;
		totalTimeSecs: number;
		subjectName: string;
		examType: string;
		examYear: string | number;
		totalQuestions: number;
	} | null>(null);

	// Derived display values — prefer real results, fall back to static data
	let displayScore = $derived(realResults?.score ?? data.score);
	let displayCorrect = $derived(realResults?.correct ?? data.correct);
	let displayWrong = $derived(realResults?.wrong ?? data.wrong);
	let displaySkipped = $derived(realResults?.skipped ?? data.skipped);
	let displaySubject = $derived(realResults?.subjectName ?? data.subject);
	let displayExamType = $derived(realResults?.examType ?? data.examType);

	let displayTimeTaken = $derived(
		realResults?.totalTimeSecs
			? `${Math.floor(realResults.totalTimeSecs / 60)}m ${(realResults.totalTimeSecs % 60).toString().padStart(2, "0")}s`
			: data.timeTaken,
	);

	let displayAvgSpeed = $derived(
		realResults?.totalTimeSecs && realResults.totalQuestions > 0
			? Math.round(realResults.totalTimeSecs / realResults.totalQuestions) +
					"s/q"
			: data.avgSpeed,
	);

	const analysisText = $derived(
		`Your ${displaySubject} score of ${displayScore}% — you got ${displayCorrect} correct out of ${displayCorrect + displayWrong + displaySkipped} questions. ${
			displayWrong > 0
				? `${displayWrong} incorrect answer${displayWrong > 1 ? "s" : ""} need your attention.`
				: "Perfect score — outstanding performance!"
		} Keep pushing to reach your exam target!`,
	);

	onMount(() => {
		setTimeout(() => (mounted = true), 100);

		// Load real results from sessionStorage if we have a sessionId
		if (data.sessionId) {
			const stored = sessionStorage.getItem(`results_${data.sessionId}`);
			if (stored) {
				try {
					realResults = JSON.parse(stored);
				} catch (_) {}
			}
		}

		let i = 0;
		let currentText = analysisText;
		const typing = setInterval(() => {
			if (i < currentText.length) {
				if (currentText[i] === "<") {
					const end = currentText.indexOf(">", i);
					typedText += currentText.slice(i, end + 1);
					i = end + 1;
				} else {
					typedText += currentText[i];
					i++;
				}
			} else {
				clearInterval(typing);
			}
		}, 15);

		return () => clearInterval(typing);
	});

	const iconMap: Record<string, any> = {
		RotateCcw,
		Zap,
		Bot,
		Clock,
		GraduationCap,
		Target,
		Bookmark,
		Play,
		Award,
		Sparkles,
		TrendingUp,
		ArrowRight,
	};

	const statTiles = $derived([
		{ label: "Correct Answers", value: displayCorrect, align: "start" },
		{ label: "Questions Skipped", value: displaySkipped, align: "center" },
		{ label: "Wrong Answers", value: displayWrong, align: "end" },
	]);

	// Computed intelligence metrics from real data
	const computedEfficiency = $derived(
		displayCorrect + displayWrong > 0
			? Math.round((displayCorrect / (displayCorrect + displayWrong)) * 100)
			: 0,
	);

	const intelligenceMetrics = $derived([
		{
			label: "Total time taken",
			val: displayTimeTaken,
			percent: 68,
		},
		{
			label: "Avg per question",
			val: displayAvgSpeed,
			percent: 42,
		},
		{
			label: "Efficiency range",
			val: `${computedEfficiency}%`,
			percent: computedEfficiency,
		},
		{
			label: "Platform Comparison",
			val: `${data.comparisons.avg}%`,
			percent: data.comparisons.avg,
		},
	]);

	// --- Navigation actions ---
	function reviewQuiz() {
		if (!data.sessionId) return;
		const params = new URLSearchParams({
			mode: "review",
			questionsPerPage: "50", // show all in review mode
			subjectName: displaySubject,
			examType: displayExamType,
		});
		goto(`/quiz/${data.sessionId}?${params.toString()}`);
	}

	async function startRedemption() {
		if (!data.sessionId || isStartingRedemption) return;
		if (displayWrong === 0) {
			alert("No wrong answers to retry! You got everything correct.");
			return;
		}
		isStartingRedemption = true;
		try {
			const res = await fetch(`/api/practice/${data.sessionId}/redemption`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			const json = await res.json();
			if (json.success) {
				const newSession = json.data.session;
				const params = new URLSearchParams({
					mode: "ai",
					questionsPerPage: "5",
					subjectName: displaySubject,
					examType: displayExamType,
					redemption: "true",
				});
				goto(`/quiz/${newSession.id}?${params.toString()}`);
			} else {
				alert(json.message || "Could not start redemption session.");
			}
		} catch (err) {
			console.error(err);
			alert("Network error. Please try again.");
		} finally {
			isStartingRedemption = false;
		}
	}
</script>

{#snippet navButton(btn: (typeof data.navButtons)[0])}
	{@const Icon = iconMap[btn.icon]}
	{#if btn.label === "Redemption mode"}
		<Button
			class={btn.class}
			onclick={startRedemption}
			disabled={isStartingRedemption || displayWrong === 0}
		>
			<div
				class="bg-[#0B3A6F] rounded-[8px] p-1.5 flex items-center justify-center -ml-0.5 border border-[#165a9e]"
			>
				{#if Icon}
					<Icon class="w-4 h-4 text-white" stroke-width={2.5} />
				{/if}
			</div>
			{isStartingRedemption ? "Starting…" : btn.label}
		</Button>
	{:else if btn.label === "Dashboard" || (btn as any).href}
		<Button
			variant={btn.variant}
			class="font-bold text-slate-600 bg-white border-gray-200 rounded-[10px] h-[40px] px-5 hover:bg-gray-50 tracking-tight text-[13px] shadow-sm flex items-center gap-2"
			onclick={() => goto((btn as any).href || "/dashboard")}
		>
			{#if btn.prefix}{btn.prefix}{/if}
			{btn.label}
		</Button>
	{:else}
		<Button
			variant={btn.variant}
			class="font-bold text-slate-600 bg-white border-gray-200 rounded-[10px] h-[40px] px-5 hover:bg-gray-50 tracking-tight text-[13px] shadow-sm flex items-center gap-2"
		>
			{#if btn.prefix}{btn.prefix}{/if}
			{btn.label}
		</Button>
	{/if}
{/snippet}

{#snippet statTile(tile: (typeof statTiles)[0])}
	<div
		class="flex flex-col {tile.align === 'end'
			? 'items-end'
			: tile.align === 'center'
				? 'items-center absolute left-1/2 bottom-0 -translate-x-1/2'
				: ''}"
	>
		<span
			class="text-[42px] font-black leading-none tracking-tighter mb-0.5 {tile.align ===
			'center'
				? 'text-white/50'
				: ''}">{tile.value}</span
		>
		<span
			class="text-[11px] font-bold {tile.align === 'center'
				? 'text-white/30'
				: 'text-white/50'} uppercase tracking-widest px-1">{tile.label}</span
		>
	</div>
{/snippet}

{#snippet qualityBar(
	label: string,
	val: number | string,
	percent: number,
	color: string = "bg-brand",
)}
	<div class="flex flex-col gap-2.5 w-full">
		<div class="flex items-center justify-between gap-4">
			<span
				class="text-[10px] font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap"
				>{label}</span
			>
			<span
				class="text-[12px] font-black text-brand tabular-nums whitespace-nowrap"
				>{val}</span
			>
		</div>
		<Progress value={percent} class="h-[5px]" />
	</div>
{/snippet}

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-[#f8f9fc] font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- TOPBAR -->
	<header
		class="sticky top-0 z-50 transition-all bg-white border-b border-gray-100 py-4"
	>
		<div
			class="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between"
		>
			<div class="flex items-center gap-4">
				<a
					href="/dashboard"
					class="flex items-center font-bold text-[22px] text-brand-900 tracking-tight"
				>
					Mockcenter
				</a>
				<span class="text-gray-200 font-light text-[20px]">|</span>
				<div class="text-[14px] text-slate-500 font-medium tracking-tight">
					<strong class="text-slate-800 font-bold">{displaySubject}</strong> · {displayExamType}
					· Practice mode
				</div>
			</div>
			<div class="flex gap-2.5">
				{#each data.navButtons as btn}
					{@render navButton(btn)}
				{/each}
			</div>
		</div>
	</header>

	<main
		class="max-w-7xl mx-auto px-6 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 animate-in fade-in slide-in-from-top-4 duration-1000 antialiased"
	>
		<!-- LEFT COLUMN (70%) -->
		<div class="flex flex-col gap-6 lg:max-w-none">
			<!-- SCORE HERO CARD -->
			<Card.Root
				class="overflow-hidden rounded-lg bg-[hsl(192,84%,15%)] bg-linear-to-br from-[hsl(192,84%,25%)] to-[hsl(192,84%,8%)] border-none shadow-2xl relative"
			>
				<div
					class="absolute inset-0 pointer-events-none overflow-hidden opacity-20"
				>
					<div
						class="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"
					></div>
					<div
						class="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-black/10 blur-3xl"
					></div>
				</div>

				<div class="relative px-8 py-6 lg:px-10 lg:py-6 w-full text-white">
					<!-- Top Row -->
					<div
						class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
					>
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-3">
								<div
									class="bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full font-black text-[8px] uppercase tracking-wider shadow-md"
								>
									{displayScore >= 75
										? "🏆 EXCELLENT"
										: displayScore >= 50
											? "👍 GOOD PERFORMANCE"
											: "💪 KEEP PUSHING"}
								</div>
								<span
									class="text-white/60 font-medium text-[11px] tracking-tight"
									>{data.date} · {displayExamType}</span
								>
							</div>
							<h2
								class="text-[24px] font-black leading-tight tracking-tight mt-0.5"
							>
								You scored {displayScore}% —
								<span class="text-white/70 italic font-light">
									{displayScore >= 75
										? "Outstanding!"
										: displayScore >= 50
											? "Keep pushing!"
											: "You've got this!"}
								</span>
							</h2>
						</div>

						<div class="flex items-center gap-3">
							<div class="text-right mr-1 hidden sm:block">
								<div
									class="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] leading-none mb-1"
								>
									Share Result
								</div>
								<div class="text-[11px] font-medium text-white/60 leading-none">
									Show your score
								</div>
							</div>
							<div
								class="flex gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/10"
							>
								<Button
									size="icon"
									class="size-9 bg-[#25D366] hover:bg-[#1da851] rounded-xl border-none shadow-lg shadow-emerald-950/30 transition-all hover:scale-105 active:scale-95"
									title="Share on WhatsApp"
								>
									<MessageCircle class="size-[18px] text-white" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									class="size-9 border-white/10 bg-white/5 text-white rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
									title="Copy Link"
								>
									<Link2 class="size-[18px]" />
								</Button>
							</div>
						</div>
					</div>

					<!-- Stats Row -->
					<div class="flex items-end justify-between relative mb-2">
						{#each statTiles as tile}
							{@render statTile(tile)}
						{/each}
					</div>

					<!-- Progress Bar -->
					<div
						class="relative w-full h-[4px] bg-white/10 rounded-full overflow-hidden mt-2"
					>
						<div
							class="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-1000"
							style="width: {(displayCorrect /
								(displayCorrect + displayWrong + displaySkipped)) *
								100}%"
						></div>
					</div>
					<div
						class="flex justify-between mt-1.5 px-1 text-white/20 text-[8px] font-bold uppercase tracking-[0.2em]"
					>
						<span>Efficiency Range</span>
						<span>{displayScore}% overall</span>
					</div>
				</div>
			</Card.Root>

			<!-- ASSESSMENT QUALITY CARD -->
			<Card.Root
				class="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden rounded-lg bg-white ring-1 ring-black/5 flex flex-col p-0"
			>
				<div class="px-8 py-4 w-full relative z-20 bg-white">
					<div class="flex justify-between items-start py-3">
						<div class="flex flex-col gap-1 mb-4">
							<h3 class="text-lg font-bold text-brand tracking-tight">
								Assessment quality
							</h3>
							<p class="text-xs text-slate-400 font-medium">
								How well the questions matched your level
							</p>
						</div>
						<div
							class="px-3 py-1.5 rounded-full text-emerald-400 text-[10px] font-black tracking-[0.1em] border border-emerald-500/30 flex items-center gap-1.5 shadow-sm uppercase animate-in fade-in zoom-in duration-500"
						>
							<Zap class="size-3 fill-current" />
							SPEED: {data.speedVerdict}
						</div>
					</div>

					<div class="flex flex-col md:flex-row md:items-end gap-8 mt-1">
						<div class="flex items-baseline shrink-0">
							<span
								class="text-[52px] font-normal text-brand tracking-tighter leading-[0.8] -ml-0.5"
								>{data.difficultyVal}</span
							>
							<span
								class="text-[20px] font-medium text-slate-300 tracking-tight ml-1"
								>.50</span
							>
							<span class="text-[12px] font-semibold text-slate-400 ml-3 mb-1.5"
								>of 100</span
							>
						</div>
					</div>

					<!-- Difficulty Bar -->
					<div class="flex flex-1 items-end gap-[4px] h-[32px] w-full pb-0.5">
						{#each Array(100) as _, i}
							{@const percent = i / 100}
							{@const isActive = percent * 100 <= data.difficultyVal}
							<div
								class="h-full w-[4.5px] rounded-full transition-all {isActive
									? ''
									: 'bg-gray-100'}"
								style={isActive
									? `background-color: var(--color-brand); opacity: ${0.5 + percent * 0.5}`
									: ""}
							></div>
						{/each}
					</div>
				</div>

				<!-- Session Intelligence -->
				<div
					class="bg-white px-8 pt-1 pb-7 w-full border-t border-gray-50/50 mt-[-8px]"
				>
					<div class="flex flex-col gap-1 mb-6">
						<h3 class="text-lg font-bold text-brand tracking-tight">
							Session intelligence
						</h3>
						<p class="text-xs text-slate-400 font-medium">
							Behavioral analysis and performance comparison
						</p>
					</div>
					<div
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 w-full"
					>
						{#each intelligenceMetrics as metric}
							{@render qualityBar(metric.label, metric.val, metric.percent)}
						{/each}
					</div>
				</div>

				<!-- Topical Mastery -->
				<div class="px-8 pb-6 bg-white border-t border-gray-50/50 mt-[-8px]">
					<button
						class="flex items-center justify-between w-full pt-4 pb-5 group cursor-pointer"
						onclick={() => (showTopics = !showTopics)}
					>
						<div class="flex flex-col gap-1 items-start text-left">
							<h3 class="text-lg font-bold text-brand tracking-tight">
								Topical mastery
							</h3>
							<p class="text-xs text-slate-400 font-medium">
								Subject-specific performance breakdown
							</p>
						</div>
						<div
							class="size-8 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all"
						>
							<ChevronDown
								class="size-5 transition-transform duration-300 {showTopics
									? 'rotate-180'
									: ''}"
							/>
						</div>
					</button>

					{#if showTopics}
						<div
							transition:slide={{ duration: 400 }}
							class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pb-2"
						>
							{#each data.topics as topic, i}
								<div class="flex items-center group w-full">
									<div
										class="flex-1 relative h-8 bg-white rounded-lg overflow-hidden flex items-center justify-between px-3 border border-brand/10 group-hover:border-brand/30 transition-all shadow-sm"
									>
										<div
											class="absolute inset-y-0 left-0 bg-brand-muted transition-all group-hover:bg-brand-muted/60"
											style="width: {mounted
												? topic.val
												: 0}%; transition-duration: {1200 +
												i * 250}ms; transition-delay: {i * 150}ms;"
										></div>
										<span
											class="relative z-10 text-[11px] font-medium text-slate-600 transition-colors group-hover:text-brand-dark leading-none"
											>{topic.name}</span
										>
										<span
											class="relative z-10 text-[11px] font-black text-brand tabular-nums tracking-tighter"
											>{topic.val}%</span
										>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</Card.Root>
		</div>

		<!-- Right Sidebar (30% Column) -->
		<aside class="flex flex-col gap-6 sticky top-24">
			<!-- AI INTELLIGENCE COMPASS -->
			<div
				class="bg-linear-to-br from-[#0B2644] to-[#040E1A] rounded-lg p-2 shadow-2xl relative overflow-hidden group"
			>
				<div
					class="absolute -top-10 -right-10 size-48 bg-brand opacity-15 blur-3xl"
				></div>

				<div class="relative z-10 p-4 pb-3">
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-3">
							<div
								class="size-11 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/5"
							>
								<Bot class="size-6" />
							</div>
							<div>
								<h3
									class="text-[18px] font-black text-white leading-none tracking-tight"
								>
									Intelligence
								</h3>
								<p
									class="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1"
								>
									Live Analysis
								</p>
							</div>
						</div>
						<Badge
							variant="outline"
							class="bg-brand/20 text-brand-muted border-brand/30 text-[9px] font-black"
							>UPDATED LIVE</Badge
						>
					</div>

					<div
						class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4 mb-4"
					>
						<div class="flex items-center gap-2 mb-3">
							<Sparkles class="size-3 text-amber-300" />
							<span
								class="text-[10px] font-black text-brand-muted uppercase tracking-widest"
								>Strategy Verdict</span
							>
						</div>
						<p
							class="text-[13px] leading-[1.6] text-white/90 font-medium mb-5 min-h-[82px] block"
						>
							{typedText}<span
								class="inline-block w-1 h-3.5 bg-brand-muted ml-1 animate-pulse"
								class:hidden={typedText.length >= analysisText.length}
							></span>
						</p>

						<div class="flex flex-wrap gap-2 mb-4">
							<div
								class="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center gap-1.5"
							>
								<Zap class="size-3" /> SPEED: {data.speedVerdict}
							</div>
							<div
								class="px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/20 text-brand-muted text-[10px] font-black flex items-center gap-1.5"
							>
								<TrendingUp class="size-3" /> SCORE: {displayScore}%
							</div>
						</div>

						<!-- Review Quiz Button -->
						<button
							class="w-full bg-brand hover:bg-brand-dark hover:scale-[1.02] hover:shadow-xl text-white p-4 rounded-lg flex items-center justify-between transition-all duration-300 active:scale-95 group/review font-bold text-[14px] shadow-lg shadow-emerald-950/20
							{!data.sessionId ? 'opacity-50 cursor-not-allowed' : ''}"
							onclick={reviewQuiz}
							disabled={!data.sessionId}
						>
							<span class="flex items-center gap-2.5">
								<Play class="size-4 fill-white" />
								Review Quiz
							</span>
							<Check
								class="size-4 group-hover/review:translate-x-1 transition-transform"
							/>
						</button>
					</div>

					<!-- Redemption Mode Panel -->
					<div class="bg-[#0A1D33] rounded-lg p-4 border border-white/5">
						<div class="flex items-center justify-between mb-3">
							<div class="flex flex-col">
								<h4 class="text-[15px] font-black text-white leading-tight">
									Redemption Mode
								</h4>
								<p class="text-[10px] text-white/40 font-medium">
									Retry {displayWrong} wrong answer{displayWrong === 1
										? ""
										: "s"}
								</p>
							</div>
							<div
								class="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
							>
								<RotateCcw class="size-5" />
							</div>
						</div>

						<div class="grid grid-cols-3 gap-2 mb-5">
							{#each [{ v: displayWrong, l: "Items" }, { v: "$0", l: "Cost" }, { v: `${displayWrong * 1}m`, l: "Est. Time" }] as meta}
								<div
									class="bg-white/5 rounded-xl py-3 flex flex-col items-center border border-white/5"
								>
									<span
										class="text-[16px] font-black text-white leading-none mb-1.5"
										>{meta.v}</span
									>
									<span
										class="text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest"
										>{meta.l}</span
									>
								</div>
							{/each}
						</div>

						<button
							class="w-full bg-brand hover:bg-brand-dark hover:scale-[1.02] hover:shadow-xl text-white p-4 rounded-lg flex items-center justify-between transition-all duration-300 active:scale-95 group/redemption font-bold text-[14px] shadow-lg shadow-emerald-950/20
							{!data.sessionId || displayWrong === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
							onclick={startRedemption}
							disabled={!data.sessionId ||
								displayWrong === 0 ||
								isStartingRedemption}
						>
							<span class="flex items-center gap-2.5">
								<Play class="size-4 fill-white" />
								{isStartingRedemption ? "Starting…" : "Start Redemption"}
							</span>
							<ArrowRight
								class="size-4 group-hover/redemption:translate-x-1 transition-transform"
							/>
						</button>

						{#if displayWrong === 0}
							<p class="text-[10px] text-emerald-500/60 text-center mt-2">
								🎉 No wrong answers to retry!
							</p>
						{/if}
					</div>

					<!-- WHAT'S NEXT SECTION -->
					<div class="mt-6 px-1">
						<div class="flex items-center gap-2 mb-3 px-4">
							<ChevronRight class="size-3 text-brand-muted" />
							<span
								class="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]"
								>Recommended Actions</span
							>
						</div>
						<div class="flex flex-col gap-1.5">
							{#each data.sidebarActions as qa}
								{@const Icon = iconMap[qa.i]}
								<button
									class="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left group"
								>
									<div
										class="size-[32px] rounded-xl {qa.bg} flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
									>
										{#if Icon}
											<Icon class="size-4.5" />
										{/if}
									</div>
									<div class="flex-1 min-w-0 pr-6">
										<span
											class="block text-[12px] font-bold text-white leading-tight mb-1 truncate"
											>{qa.t}</span
										>
										<span
											class="text-[10px] font-bold text-white/30 capitalize tracking-tighter"
											>{qa.s}</span
										>
									</div>
									<ArrowRight
										class="size-4 text-white/40 transition-all -translate-x-1 group-hover:translate-x-0 group-hover:text-white"
									/>
								</button>
							{/each}
						</div>
					</div>

					<div class="p-3 bg-black/10 text-center mt-4">
						<span
							class="text-[8px] text-white/20 uppercase font-black tracking-[0.4em]"
							>Neural Intelligence Compass v4.0</span
						>
					</div>
				</div>
			</div>
		</aside>
	</main>
</div>

<style>
	:global(.chart-container) {
		font-family: inherit !important;
	}
	:global(body) {
		background-color: #f8f9fc;
	}
</style>
