<script lang="ts">
	import {
		TrendingUp,
		Zap,
		Target,
		Library,
		Trophy,
		MoveRight,
		Thermometer,
		ShieldAlert,
		BrainCircuit,
		AlertCircle,
	} from "@lucide/svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Trendchart, Barchart } from "$lib/components";
	import { Radials } from "$lib/components/ui/radials/index.js";

	let { data } = $props();

	const iconMap: Record<string, any> = {
		TrendingUp,
		Zap,
		Target,
		Library,
		Trophy,
	};

	let activeFilter = $state("30 days");
	const filters = ["7 days", "30 days", "3 months", "All time"];

	// Chart Timeframe Selection
	let selectedTimeframe = $state("this-month");
	const timeframes = [
		{ value: "this-month", label: "This month" },
		{ value: "february", label: "February 2026" },
		{ value: "january", label: "January 2026" },
		{ value: "december", label: "December 2025" },
	];
	const selectedLabel = $derived(
		timeframes.find((t) => t.value === selectedTimeframe)?.label,
	);

	// Heatmap (client-side random, fine here)
	const heatmapColors = [
		"bg-slate-100",
		"bg-brand-muted",
		"bg-brand/40",
		"bg-brand/70",
		"bg-brand",
	];
	const heatmapGrid = Array.from({ length: 4 }, () =>
		Array.from(
			{ length: 7 },
			() => heatmapColors[Math.floor(Math.random() * heatmapColors.length)],
		),
	);

	// --- Area Chart (Score Trend) ---
	const trendChartData = $derived(
		data.trendData.map((d) => ({ date: new Date(d.date), score: d.score })),
	);

	const trendChartConfig = {
		score: { label: "Score", color: "var(--color-brand)" },
	} satisfies Chart.ChartConfig;

	// --- Radar Chart (Custom SVG — pie-slice hover detection per subject) ---
	let radarEl = $state<HTMLDivElement | null>(null);
	let radarHovered = $state<number | null>(null);
	let radarTipX = $state(0);
	let radarTipY = $state(0);
	const RC = 200, RR = 135; // SVG center coords & max data radius

	function rPt(value: number, idx: number, n: number): [number, number] {
		const a = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
		const r = (value / 100) * RR;
		return [RC + r * Math.cos(a), RC + r * Math.sin(a)];
	}
	function rGrid(level: number, n: number): string {
		return Array.from({ length: n }, (_, i) => rPt(level, i, n).join(',')).join(' ');
	}
	function rPoly(key: 'you' | 'top10', rows: typeof data.radarData): string {
		return rows.map((d, i) =>
			rPt(key === 'you' ? d.you : d.top10, i, rows.length).join(',')
		).join(' ');
	}
	function rLabel(idx: number, n: number): [number, number, string, string] {
		const a = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
		const r = RR + 35;
		const x = RC + r * Math.cos(a), y = RC + r * Math.sin(a);
		const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
		const baseline = Math.sin(a) < -0.3 ? 'auto' : Math.sin(a) > 0.3 ? 'hanging' : 'middle';
		return [x, y, anchor, baseline];
	}
	function rSlice(idx: number, n: number): string {
		const half = Math.PI / n;
		const a = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
		const r = RR + 55;
		const x1 = RC + r * Math.cos(a - half), y1 = RC + r * Math.sin(a - half);
		const x2 = RC + r * Math.cos(a + half), y2 = RC + r * Math.sin(a + half);
		return `M ${RC} ${RC} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
	}
	function onREnter(e: MouseEvent, idx: number) {
		radarHovered = idx;
		if (radarEl) {
			const rect = radarEl.getBoundingClientRect();
			radarTipX = e.clientX - rect.left;
			radarTipY = e.clientY - rect.top;
		}
	}
	function onRMove(e: MouseEvent) {
		if (radarEl && radarHovered !== null) {
			const rect = radarEl.getBoundingClientRect();
			radarTipX = e.clientX - rect.left;
			radarTipY = e.clientY - rect.top;
		}
	}

	// --- Score Distribution Bar Chart ---
	const distChartData = $derived(
		data.distData.map((d) => ({
			range: d.label,
			count: parseInt(d.height, 10), // strips trailing "%" — e.g. "35%" → 35
		}))
	);

	const distChartConfig = {
		count: { label: "Sessions", color: "var(--color-brand)" },
	} satisfies Chart.ChartConfig;
</script>

{#snippet circularChart(
	score: number,
	size: number,
	strokeWidth: number,
	svgClass: string,
	textClass: string,
	bgStroke: string = "stroke-brand-dark",
)}
	{@const radius = (size - strokeWidth) / 2}
	{@const circumference = 2 * Math.PI * radius}
	{@const dashoffset = circumference - (score / 100) * circumference}
	<div
		class="relative flex items-center justify-center font-bold"
		style="width:{size}px;height:{size}px;"
	>
		<svg class="transform -rotate-90 w-full h-full" viewBox="0 0 {size} {size}">
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				class={bgStroke}
				stroke-width={strokeWidth}
				fill="none"
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				class="{svgClass} transition-all duration-1000 ease-out"
				stroke-width={strokeWidth}
				fill="none"
				stroke-dasharray={circumference}
				stroke-dashoffset={dashoffset}
				stroke-linecap="round"
			/>
		</svg>
		<span class="absolute inset-0 flex items-center justify-center {textClass}"
			>{score}{size > 40 ? "" : "%"}</span
		>
	</div>
{/snippet}

<div class="flex flex-col gap-5 w-full max-w-[1300px] mx-auto pb-10">
	<!-- Header Filters -->
	<div
		class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2"
	>
		<div
			class="bg-white rounded-xl p-1 inline-flex shadow-sm border border-slate-200"
		>
			{#each filters as filter}
				<button
					class="px-5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors duration-200
					{filter === activeFilter
						? 'bg-brand text-white shadow-sm'
						: 'text-gray-500 hover:text-gray-900 bg-transparent'}"
					onclick={() => (activeFilter = filter)}
				>
					{filter}
				</button>
			{/each}
		</div>
		<span class="text-[12px] text-gray-400 font-medium"
			>Showing data for March 2026</span
		>
	</div>

	<!-- JAMB Readiness Banner -->
	<div
		class="bg-[#0b3b6c] rounded-2xl w-full p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between border border-[#0d365a] overflow-hidden relative group"
	>
		<div
			class="absolute inset-0 bg-gradient-to-r from-transparent via-brand/5 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]"
		></div>

		<!-- Left: Readiness Ring -->
		<div
			class="flex flex-col items-center shrink-0 pr-6 lg:pr-10 lg:border-r border-white/10 relative z-10 w-full lg:w-auto h-full justify-center pb-4 lg:pb-0"
		>
			{@render circularChart(
				data.readiness,
				90,
				8,
				"stroke-brand",
				"text-white text-[28px] tracking-tight",
				"stroke-brand-dark",
			)}
			<span
				class="text-[9px] text-blue-200 font-bold tracking-widest mt-4 uppercase text-center"
				>JAMB READINESS</span
			>
		</div>

		<!-- Middle: Per-subject radial charts -->
		<div
			class="flex-1 flex items-center px-4 lg:px-8 relative z-10 w-full overflow-x-auto no-scrollbar my-6 lg:my-0"
		>
			<Radials subjects={data.subjectsReadiness} />
		</div>

		<!-- Right: CTA -->
		<div
			class="flex flex-col lg:items-end relative z-10 shrink-0 mt-6 lg:mt-0 lg:pl-10 lg:border-l border-white/10 w-full lg:w-auto h-full justify-center"
		>
			<h3
				class="text-[15px] font-bold text-white mb-1.5 tracking-tight flex items-center justify-start lg:justify-end gap-2"
			>
				You need <span class="text-brand font-extrabold text-[15.5px]">80+</span
				>
				to hit <span class="text-brand font-extrabold text-[15.5px]">280</span>
			</h3>
			<p
				class="text-[12px] text-blue-200 font-medium max-w-[280px] leading-relaxed mb-4"
			>
				Focus on Physics and Chemistry daily.<br />
				At your current improvement rate,<br />
				you'll reach 80/100 in about 18 days.
			</p>
			<button
				class="bg-white text-[#0b3b6c] px-6 py-2.5 rounded-full text-[12px] font-extrabold shadow-lg hover:bg-brand hover:text-white transition-all flex items-center gap-1.5 w-max"
			>
				View AI study plan <MoveRight
					class="w-3.5 h-3.5 ml-1"
					stroke-width={2}
				/>
			</button>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
		{#each data.kpis as kpi}
			{@const Icon = iconMap[kpi.icon]}
			<div
				class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden"
			>
				{#if Icon}
					<Icon
						class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
						stroke-width={1.5}
					/>
				{/if}
				<span
					class="text-[12px] font-medium text-gray-500 tracking-tight relative z-10"
					>{kpi.title}</span
				>
				<span
					class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
					>{kpi.value}</span
				>
				<div class="flex items-center justify-between w-full relative z-10">
					<span class="text-[10px] font-medium text-gray-400 leading-none"
						>{kpi.subtitle}</span
					>
					<Badge
						variant="outline"
						class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none {kpi.badgeClass}"
						>{kpi.badge}</Badge
					>
				</div>
			</div>
		{/each}
	</div>

	<!-- Charts Row 1: Area + Radar -->
	<div class="grid grid-cols-1 lg:grid-cols-[65%_calc(35%-1rem)] gap-4">
		<!-- Score Trend — shadcn AreaChart -->
		<div
			class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
		>
			<div class="mb-2 flex items-center justify-between">
				<div>
					<h3 class="text-[14px] font-bold text-slate-800">
						Score trend over time
					</h3>
					<p class="mt-0.5 text-[11px] text-gray-400">
						Your score across March 2026
					</p>
				</div>
				<Select.Root
					type="single"
					name="timeframe"
					bind:value={selectedTimeframe}
				>
					<Select.Trigger
						class="h-auto rounded-full border-brand/20 bg-brand-muted px-3 py-1 text-[10px] font-bold text-brand-dark transition-all hover:border-brand/40 w-32 focus:ring-0 focus:ring-offset-0"
					>
						{selectedLabel}
					</Select.Trigger>
					<Select.Content class="rounded-lg border-slate-200 shadow-xl">
						{#each timeframes as tf}
							<Select.Item
								value={tf.value}
								label={tf.label}
								class="text-[11px] font-medium focus:bg-brand-muted focus:text-brand-dark rounded-lg py-1.5"
							>
								{tf.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<Trendchart
				config={trendChartConfig}
				data={trendChartData}
				x="date"
				series={[
					{
						key: "score",
						label: "Score",
						color: trendChartConfig.score.color,
					},
				]}
				class="h-[230px]"
			/>
		</div>

		<!-- Subject Balance — Custom SVG Radar (reliable per-subject tooltip) -->
		<div
			class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
		>
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-[14px] font-bold text-slate-800">Subject balance</h3>
				<span class="text-[11px] font-semibold text-brand">AI breakdown</span>
			</div>

			<div class="relative mt-2 flex-1" bind:this={radarEl}>
				<svg viewBox="0 0 400 400" class="w-full h-[260px] drop-shadow-sm">
					<!-- Pentagon grid rings -->
					{#each [20, 40, 60, 80, 100] as lvl}
						<polygon
							points={rGrid(lvl, data.radarData.length)}
							fill="none" stroke="#e2e8f0" stroke-width="1"
						/>
					{/each}
					<!-- Spokes -->
					{#each data.radarData as _, i}
						{@const [sx, sy] = rPt(100, i, data.radarData.length)}
						<line x1={RC} y1={RC} x2={sx} y2={sy} stroke="#e2e8f0" stroke-width="1" />
					{/each}
					<!-- top10 polygon (back layer) -->
					<polygon
						points={rPoly('top10', data.radarData)}
						fill="#60a5fa" fill-opacity="0.10"
						stroke="#60a5fa" stroke-width="2" stroke-linejoin="round"
					/>
					<!-- you polygon (front layer) -->
					<polygon
						points={rPoly('you', data.radarData)}
						fill="var(--color-brand)" fill-opacity="0.18"
						stroke="var(--color-brand)" stroke-width="2.5" stroke-linejoin="round"
					/>
					<!-- Vertex dots on "you" series -->
					{#each data.radarData as d, i}
						{@const [dx, dy] = rPt(d.you, i, data.radarData.length)}
						<circle cx={dx} cy={dy}
							r={radarHovered === i ? 6.5 : 4.5}
							fill="var(--color-brand)"
							style="transition: r 0.15s ease"
						/>
					{/each}
					<!-- Subject labels -->
					{#each data.radarData as d, i}
						{@const [lx, ly, anchor, baseline] = rLabel(i, data.radarData.length)}
						<text
							x={lx} y={ly}
							text-anchor={anchor}
							dominant-baseline={baseline}
							font-size="13"
							fill={radarHovered === i ? 'var(--color-brand)' : '#8c9ead'}
							font-weight={radarHovered === i ? '700' : '500'}
						>{d.subject}</text>
					{/each}
					<!-- Transparent pie-slice overlays — one per subject, reliable hit detection -->
					{#each data.radarData as _, i}
						<path
							role="presentation"
							d={rSlice(i, data.radarData.length)}
							fill="transparent"
							onmouseenter={(e) => onREnter(e, i)}
							onmousemove={onRMove}
							onmouseleave={() => (radarHovered = null)}
							class="cursor-pointer"
						/>
					{/each}
				</svg>

				<!-- HTML tooltip — positioned at cursor, reads all series from radarData -->
				{#if radarHovered !== null}
					{@const hd = data.radarData[radarHovered]}
					<div
						class="pointer-events-none absolute z-50 min-w-36 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-xl"
						style="left:{radarTipX + 14}px; top:{radarTipY}px; transform: translateY(-110%);"
					>
						<div class="font-semibold text-slate-800 mb-1.5">{hd.subject}</div>
						<div class="grid gap-1.5">
							<div class="flex items-center gap-2">
								<div class="size-2.5 rounded-[2px] shrink-0 bg-brand"></div>
								<span class="text-gray-500 flex-1">You</span>
								<span class="font-mono font-semibold text-slate-800 tabular-nums">{hd.you}</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="size-2.5 rounded-[2px] shrink-0 bg-blue-400"></div>
								<span class="text-gray-500 flex-1">Top 10%</span>
								<span class="font-mono font-semibold text-slate-800 tabular-nums">{hd.top10}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Legend -->
			<div class="flex items-center justify-center gap-5 mt-3">
				<div class="flex items-center gap-1.5">
					<div class="w-2.5 h-2.5 rounded-[2px] bg-brand opacity-80"></div>
					<span class="text-[10px] font-medium text-gray-600">You</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div class="w-2.5 h-2.5 rounded-[2px] bg-blue-400 opacity-60"></div>
					<span class="text-[10px] font-medium text-gray-600">Top 10%</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Charts Row 2 -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<!-- Speed vs Accuracy -->
		<div
			class="group flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
		>
			<div class="flex items-center justify-between pl-1 pb-4">
				<h3 class="text-[14px] font-bold text-slate-800">Speed vs accuracy</h3>
				<Badge
					variant="outline"
					class="text-[9px] font-semibold text-brand-dark bg-brand-muted border-brand/20 uppercase tracking-widest px-2 py-0.5 rounded-full"
					>AI tracked</Badge
				>
			</div>
			<div class="flex flex-col gap-5 mt-2">
				{#each data.speedVsAccuracy as sub}
					<div class="flex items-center w-full gap-3">
						<span class="text-[12px] font-bold text-slate-800 w-[80px] shrink-0"
							>{sub.name}</span
						>
						<div class="flex flex-col gap-0.5 flex-1 relative">
							<div class="flex items-center gap-2">
								<span
									class="text-[9px] text-gray-400 w-[50px] shrink-0 font-medium"
									>Accuracy</span
								>
								<div
									class="h-[5px] bg-slate-100 rounded-full flex-1 overflow-hidden relative"
								>
									<div
										class="absolute left-0 top-0 bottom-0 rounded-full {sub.color}"
										style="width:{sub.accuracy}%;"
									></div>
								</div>
								<span
									class="text-[10px] font-bold {sub.bClass.split(
										' ',
									)[0]} w-[25px] text-right">{sub.accuracy}%</span
								>
							</div>
							<div class="flex items-center gap-2">
								<span
									class="text-[9px] text-gray-400 w-[50px] shrink-0 font-medium"
									>Speed</span
								>
								<div
									class="h-[5px] bg-slate-100 rounded-full flex-1 overflow-hidden relative"
								>
									<div
										class="absolute left-0 top-0 bottom-0 rounded-full {sub.sColor}"
										style="width:{sub.pSpeed}%;"
									></div>
								</div>
								<span
									class="text-[10px] font-bold text-slate-700 w-[25px] text-right"
									>{sub.speed}s</span
								>
							</div>
							<Badge
								variant="outline"
								class="absolute right-[-45px] top-1/2 -translate-y-1/2 {sub.bClass} border-transparent text-[8.5px] px-2 py-0.5 rounded-full"
								>{sub.badge}</Badge
							>
						</div>
						<div class="w-[45px] shrink-0"></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Study Activity Heatmap -->
		<div
			class="group flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
		>
			<div class="flex items-center justify-between pb-4">
				<h3 class="text-[14px] font-bold text-slate-800">
					Study activity (March)
				</h3>
				<span class="text-[11px] font-semibold text-brand">Daily questions</span
				>
			</div>
			<div class="flex flex-col w-full px-2 mt-4">
				<div class="grid grid-cols-7 gap-1.5 w-full mb-2">
					{#each ["M", "T", "W", "T", "F", "S", "S"] as d}
						<span class="text-[10px] text-gray-400 text-center font-medium"
							>{d}</span
						>
					{/each}
				</div>
				<div class="grid grid-rows-4 gap-1.5 w-full">
					{#each heatmapGrid as row}
						<div class="grid grid-cols-7 gap-1.5 w-full">
							{#each row as cell}
								<div
									class="aspect-square w-full rounded-[3px] {cell} hover:scale-110 transition-transform cursor-crosshair"
								></div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
			<div class="flex items-center gap-1 mt-4 justify-end">
				<span class="text-[9px] text-gray-400">Less</span>
				{#each heatmapColors as c}
					<div class="w-3 h-3 rounded-[2px] {c}"></div>
				{/each}
				<span class="text-[9px] text-gray-400">More</span>
			</div>
		</div>

		<!-- Weakest Topics -->
		<div
			class="group flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
		>
			<div class="flex items-center justify-between pb-3">
				<h3 class="text-[14px] font-bold text-slate-800">Weakest topics</h3>
				<Badge
					variant="outline"
					class="text-[9px] font-semibold text-red-500 bg-red-50 border-red-100 rounded-full px-2 py-0.5"
					>Needs focus</Badge
				>
			</div>
			<div class="flex flex-col gap-3.5 mt-2 flex-1">
				{#each data.weakestTopics as topic, i}
					<div
						class="flex items-center gap-3 w-full bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 hover:border-brand/30 transition-colors"
					>
						<span class="text-[11px] text-gray-400 font-bold w-3 text-center"
							>{i + 1}</span
						>
						<div class="flex flex-col flex-1 gap-1">
							<span class="text-[12px] font-bold text-slate-800"
								>{topic.title}</span
							>
							<span class="text-[10px] text-gray-400">{topic.context}</span>
						</div>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-[3px] bg-slate-200 rounded-full overflow-hidden"
							>
								<div
									class="h-full rounded-full {topic.percent < 40
										? 'bg-red-500'
										: 'bg-amber-500'}"
									style="width:{topic.percent}%;"
								></div>
							</div>
							<span
								class="text-[11px] font-bold {topic.percent < 40
									? 'text-red-500'
									: 'text-amber-600'} w-[30px] text-right"
								>{topic.percent}%</span
							>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Bottom Row -->
	<div class="grid grid-cols-1 lg:grid-cols-[60%_calc(40%-1rem)] gap-4">
		<!-- Score Distribution (BarChart) -->
		<div
			class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-7 pb-3 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
		>
			<div class="mb-2 flex items-center justify-between">
				<div>
					<h3 class="text-[14px] font-bold text-slate-800">Score distribution</h3>
					<p class="mt-0.5 text-[11px] font-medium text-gray-500">How your scores cluster</p>
				</div>
				<Select.Root
					type="single"
					name="distTimeframe"
					bind:value={selectedTimeframe}
				>
					<Select.Trigger
						class="h-auto rounded-full border-brand/20 bg-brand-muted px-3 py-1 text-[10px] font-bold text-brand-dark transition-all hover:border-brand/40 w-32 focus:ring-0 focus:ring-offset-0"
					>
						{selectedLabel}
					</Select.Trigger>
					<Select.Content class="rounded-lg border-slate-200 shadow-xl">
						{#each timeframes as tf}
							<Select.Item
								value={tf.value}
								label={tf.label}
								class="text-[11px] font-medium focus:bg-brand-muted focus:text-brand-dark rounded-lg py-1.5"
							>
								{tf.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<Barchart
				config={distChartConfig}
				data={distChartData}
				x="range"
				series={[
					{
						key: "count",
						label: "Sessions",
						color: distChartConfig.count.color,
					},
				]}
				class="h-[220px]"
			/>
		</div>

		<!-- Peer Comparison -->
		<div
			class="group flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
		>
			<div class="flex items-center justify-between pb-4">
				<h3 class="text-[14px] font-bold text-slate-800">Peer comparison</h3>
				<Badge
					variant="outline"
					class="text-[10px] font-semibold text-purple-700 bg-purple-50 border-purple-200/50 rounded-full px-3 py-1"
					>Anonymous</Badge
				>
			</div>
			<div class="w-full mt-2">
				<div
					class="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-100 mb-2"
				>
					<div class="w-[28%] pl-2">Subject</div>
					<div class="w-[25%] text-left">Your avg</div>
					<div class="w-[17%] text-center">Top 10%</div>
					<div class="w-[17%] text-center">All users</div>
					<div class="w-[13%] text-right pr-2">vs peers</div>
				</div>
				<div class="flex flex-col gap-1.5">
					{#each data.peerComparison as row}
						<div
							class="flex items-center py-2.5 hover:bg-brand-muted/30 rounded-lg transition-colors"
						>
							<span class="w-[28%] text-[12px] font-bold text-slate-800 pl-2"
								>{row.subject}</span
							>
							<div class="w-[25%] flex items-center gap-2">
								<span class="text-[12px] font-bold {row.color} w-8 shrink-0"
									>{row.avg}%</span
								>
								<div
									class="flex-1 h-[4px] bg-slate-100 rounded-full overflow-hidden mr-4 relative"
								>
									<div
										class="absolute left-0 top-0 bottom-0 rounded-full {row.stroke}"
										style="width:{row.avg}%;"
									></div>
								</div>
							</div>
							<span
								class="w-[17%] text-[11px] font-medium text-gray-500 text-center"
								>{row.top10}%</span
							>
							<span
								class="w-[17%] text-[11px] font-medium text-gray-500 text-center"
								>{row.all}%</span
							>
							<span
								class="w-[13%] text-[11px] font-bold py-0.5 px-1.5 rounded text-center ml-auto mr-2 {row.vsPeers.includes(
									'+',
								)
									? 'text-brand bg-brand-muted'
									: 'text-red-500 bg-red-50'}"
							>
								{row.vsPeers}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- AI Study Recommendations -->
	<div
		class="group flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
	>
		<div class="flex items-center justify-between pb-4">
			<div class="flex items-center gap-2">
				<BrainCircuit class="w-4 h-4 text-brand" stroke-width={2} />
				<h3 class="text-[15px] font-bold text-slate-800">
					AI study recommendations
				</h3>
			</div>
			<Badge
				variant="outline"
				class="text-[10px] font-medium text-brand-dark bg-brand-muted border-brand/20 rounded-full px-3 py-1"
				>Updated daily</Badge
			>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
			<!-- Urgent -->
			<div
				class="bg-red-50/50 rounded-xl p-4 border border-red-100 flex flex-col shadow-sm relative overflow-hidden group/rec hover:border-red-300 hover:shadow-md transition-all duration-300"
			>
				<div
					class="absolute -right-6 -top-6 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-50"
				></div>
				<div class="flex items-center gap-2 mb-2 relative z-10">
					<Thermometer class="w-4 h-4 text-red-600" stroke-width={2.5} />
					<h4 class="text-[13px] font-bold text-red-900">
						Fix Chemistry — urgent
					</h4>
				</div>
				<p
					class="text-[11px] text-red-800/80 leading-relaxed font-medium mb-3 relative z-10"
				>
					You are rushing Chemistry questions (22s avg). Practice Organic
					Chemistry and Stoichiometry slowly. Do 20 questions daily with no time
					pressure first, then re-introduce the timer.
				</p>
				<div class="mt-auto relative z-10">
					<Badge
						variant="outline"
						class="bg-red-200/50 text-red-800 border-red-200 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
						>Priority 1</Badge
					>
				</div>
			</div>

			<!-- Warning -->
			<div
				class="bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex flex-col shadow-sm relative overflow-hidden group/rec hover:border-amber-300 hover:shadow-md transition-all duration-300"
			>
				<div
					class="absolute -right-6 -top-6 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-50"
				></div>
				<div class="flex items-center gap-2 mb-2 relative z-10">
					<AlertCircle class="w-4 h-4 text-amber-600" stroke-width={2.5} />
					<h4 class="text-[13px] font-bold text-amber-900">Speed up Physics</h4>
				</div>
				<p
					class="text-[11px] text-amber-800/80 leading-relaxed font-medium mb-3 relative z-10"
				>
					Physics takes 62s per question — too slow for JAMB. Your understanding
					is okay but you overthink. Practice timed drills: 30 questions in 20
					minutes daily for 1 week.
				</p>
				<div class="mt-auto relative z-10">
					<Badge
						variant="outline"
						class="bg-amber-200/40 text-amber-800 border-amber-200 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
						>Priority 2</Badge
					>
				</div>
			</div>

			<!-- Brand green -->
			<div
				class="bg-brand-muted/40 rounded-xl p-4 border border-brand/20 flex flex-col shadow-sm relative overflow-hidden group/rec hover:border-brand/50 hover:shadow-md transition-all duration-300"
			>
				<div
					class="absolute -right-6 -top-6 w-24 h-24 bg-brand/10 rounded-full blur-2xl opacity-60"
				></div>
				<div class="flex items-center gap-2 mb-2 relative z-10">
					<ShieldAlert class="w-4 h-4 text-brand" stroke-width={2.5} />
					<h4 class="text-[13px] font-bold text-brand-dark">
						Maintain Mathematics
					</h4>
				</div>
				<p
					class="text-[11px] text-brand-dark/70 leading-relaxed font-medium mb-3 relative z-10"
				>
					Math score is stable at 61%. Target Quadratic Equations and Indices —
					your two weakest topics. 15 focused questions per day will push you to
					70%+ within 2 weeks.
				</p>
				<div class="mt-auto relative z-10">
					<Badge
						variant="outline"
						class="bg-brand-muted text-brand-dark border-brand/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
						>Priority 3</Badge
					>
				</div>
			</div>
		</div>
	</div>
</div>
