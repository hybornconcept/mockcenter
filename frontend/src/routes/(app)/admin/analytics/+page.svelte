<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import {
		Users,
		LayoutList,
		Target,
		TrendingUp,
		ArrowUpRight,
		ArrowDownRight,
		AlertCircle,
		Download,
		MoreHorizontal,
		BarChart3,
		LineChartIcon,
		Timer,
		Star,
	} from "@lucide/svelte";
	import {
		BarChart,
		AreaChart,
		LineChart,
		ArcChart,
		Labels,
		Rule,
		Group,
		Tooltip,
		Chart as LayerChart,
		LinearGradient,
		Area,
		Highlight,
		Text as ChartText,
	} from "layerchart";
	import { scaleBand, scaleTime, scaleLinear } from "d3-scale";
	import { curveMonotoneX } from "d3-shape";
	import { toast } from "svelte-sonner";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";
	import Trendchart from "$lib/components/Trendchart.svelte";
	import Barchart from "$lib/components/Barchart.svelte";
	import Empty from "$lib/components/Empty.svelte";
	import { browser } from "$app/environment";

	let { data }: PageProps = $props();

	let selectedRange = $state(30);
	let currentStats = $derived(
		data?.stats?.[selectedRange] ?? {
			users: "0",
			sessions: "0",
			passRate: "0%",
			avgTime: "0m",
			questionsAnswered: "0",
			deltas: {
				users: { type: "flat", value: "0" },
				sessions: { type: "flat", value: "0" },
				passRate: { type: "flat", value: "0" },
				avgTime: { type: "flat", value: "0" },
				questionsAnswered: { type: "flat", value: "0" },
			},
		},
	);

	let sessionsTrend = $derived(
		data.trends?.length
			? data.trends.map((t: any) => ({
					date: new Date(t.date),
					value: t.sessions,
					secondary: t.sessions, // No separate answers daily aggregate yet
				}))
			: [],
	);

	let userGrowthTrend = $derived(
		data.trends?.length
			? data.trends.map((t: any) => ({
					date: new Date(t.date),
					value: t.newUsers,
				}))
			: [],
	);

	let revenueTrend = $derived(
		data.trends?.length
			? data.trends.map((t: any) => ({
					date: new Date(t.date),
					value: t.revenue,
				}))
			: [],
	);

	const sessionChartConfig = {
		value: { label: "Sessions", color: "hsl(var(--brand))" },
		secondary: { label: "Answers", color: "hsl(var(--brand-muted))" },
	} satisfies Chart.ChartConfig;

	const examChartConfig = {
		passRate: { label: "Pass Rate", color: "hsl(var(--brand))" },
	} satisfies Chart.ChartConfig;

	const subjectAccuracyConfig = {
		accuracy: { label: "Accuracy %", color: "hsl(var(--brand))" },
	} satisfies Chart.ChartConfig;

	const userRegistrationConfig = {
		value: { label: "New Users", color: "#10b981" },
	} satisfies Chart.ChartConfig;

	const creditPurchaseConfig = {
		value: { label: "Revenue", color: "#f59e0b" },
	} satisfies Chart.ChartConfig;

	// Difficulty distribution derived from real subjectAccuracy data
	// Maps high/medium/low/zero accuracy bands to difficulty labels
	let difficultyData = $derived(
		(() => {
			const subjects = data?.subjectAccuracy ?? [];
			if (subjects.length === 0) {
				// Fallback: empty state
				return [
					{
						label: "High Accuracy",
						value: 0,
						color: "#10b981",
						status: "Strong",
						badgeBg: "bg-emerald-500/10",
						textColor: "text-emerald-500",
					},
					{
						label: "Medium",
						value: 0,
						color: "#f59e0b",
						status: "Average",
						badgeBg: "bg-amber-500/10",
						textColor: "text-amber-500",
					},
					{
						label: "Low",
						value: 0,
						color: "#ef4444",
						status: "Weak",
						badgeBg: "bg-red-500/10",
						textColor: "text-red-500",
					},
					{
						label: "Critical",
						value: 0,
						color: "#94a3b8",
						status: "Weak",
						badgeBg: "bg-slate-500/10",
						textColor: "text-slate-500",
					},
				];
			}
			const pct = (n: number) => Math.round((n / subjects.length) * 100);
			const high = subjects.filter((s) => Number(s.accuracy) >= 70).length;
			const medium = subjects.filter(
				(s) => Number(s.accuracy) >= 50 && Number(s.accuracy) < 70,
			).length;
			const low = subjects.filter(
				(s) => Number(s.accuracy) >= 30 && Number(s.accuracy) < 50,
			).length;
			const crit = subjects.filter((s) => Number(s.accuracy) < 30).length;
			return [
				{
					label: "High Accuracy",
					value: pct(high),
					color: "#10b981",
					status: "Strong",
					badgeBg: "bg-emerald-500/10",
					textColor: "text-emerald-500",
				},
				{
					label: "Medium",
					value: pct(medium),
					color: "#f59e0b",
					status: "Average",
					badgeBg: "bg-amber-500/10",
					textColor: "text-amber-500",
				},
				{
					label: "Low",
					value: pct(low),
					color: "#ef4444",
					status: "Weak",
					badgeBg: "bg-red-500/10",
					textColor: "text-red-500",
				},
				{
					label: "Critical",
					value: pct(crit),
					color: "#94a3b8",
					status: "Weak",
					badgeBg: "bg-slate-500/10",
					textColor: "text-slate-500",
				},
			];
		})(),
	);

	let selectedSubjectMetric = $state("accuracy");

	// Derived lists for varying data based on range
	// Derived lists for varying data based on range
	let filteredExamData = $derived(
		(data?.examData ?? []).map((d) => ({ ...d })),
	);

	let filteredDifficultyData = $derived(
		(difficultyData || []).map((d) => ({ ...d })),
	);

	let filteredSubjectData = $derived(
		(data?.subjectAccuracy ?? []).map((d) => ({ ...d })),
	);

	let sorted = $derived(
		[...(data?.examDistribution ?? [])].sort((a, b) => b.sessions - a.sessions),
	);

	function handleExport() {
		toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
			loading: "Preparing analytics export...",
			success: "Export downloaded successfully",
			error: "Export failed",
		});
	}
</script>

<div class="flex flex-col gap-4 w-full pb-20">
	<!-- TOP BAR CONTROLS -->
	<div
		class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-dark p-4 px-6 rounded-lg border-none shadow-lg relative overflow-hidden"
	>
		<div class="flex flex-col gap-0.5 relative z-10">
			<h3 class="text-[13px] font-bold text-white flex items-center gap-2">
				{#if browser}
					<BarChart3 class="w-4 h-4 text-white/80" />
				{/if}
				Performance Over Time
			</h3>
			<p class="text-[11px] text-white/50 font-medium">
				Select a period to filter all platform analytics
			</p>
		</div>

		<div class="flex items-center gap-3 relative z-10">
			<div
				class="flex bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/5 shadow-inner"
			>
				{#each [7, 30, 90] as range}
					<button
						onclick={() => (selectedRange = range)}
						class="px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-300 {selectedRange ===
						range
							? 'bg-white text-brand shadow-sm scale-[1.02]'
							: 'text-white/60 hover:text-white'}"
					>
						{range} Days
					</button>
				{/each}
			</div>

			<Button
				variant="outline"
				size="sm"
				class="bg-white border-none text-brand font-bold text-[11px] hover:bg-white/90 gap-2 h-9 px-4 rounded-xl shadow-sm"
				onclick={handleExport}
			>
				{#if browser}
					<Download class="w-3.5 h-3.5" />
				{/if}
				Export PDF
			</Button>
		</div>
	</div>

	<!-- KPI ROW -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
		<!-- KPI: Active Users -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
		>
			<Users
				class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>ACTIVE USERS</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
				>{currentStats.users}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					{#if currentStats.deltas.users.type === "up"}
						<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
						<span class="text-[10px] font-bold text-green-600 leading-none"
							>+{currentStats.deltas.users.value}</span
						>
					{:else}
						<div class="w-1.5 h-1.5 bg-slate-300 rounded-full mr-1"></div>
						<span class="text-[10px] font-bold text-slate-400 leading-none"
							>{currentStats.deltas.users.value}</span
						>
					{/if}
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>this period</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-brand-dark bg-brand-muted border-brand/20"
				>
					Growing
				</Badge>
			</div>
		</div>

		<!-- KPI: Sessions -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
		>
			<LayoutList
				class="w-6 h-6 text-emerald-500/10 absolute right-3 top-3 group-hover:text-emerald-500/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>SESSIONS</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-emerald-600 transition-colors block relative z-10"
				>{currentStats.sessions}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
					<span class="text-[10px] font-bold text-green-600 leading-none"
						>+{currentStats.deltas.sessions.value}</span
					>
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>this period</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-emerald-700 bg-emerald-50 border-emerald-100/50"
				>
					Engaged
				</Badge>
			</div>
		</div>

		<!-- KPI: Avg Pass Rate -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
		>
			<Target
				class="w-6 h-6 text-amber-500/10 absolute right-3 top-3 group-hover:text-amber-500/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>AVG PASS RATE</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-amber-600 transition-colors block relative z-10"
				>{currentStats.passRate}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
					<span class="text-[10px] font-bold text-green-600 leading-none"
						>+{currentStats.deltas.passRate.value}</span
					>
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>improvement</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-amber-700 bg-amber-50 border-amber-100/50"
				>
					Optimized
				</Badge>
			</div>
		</div>

		<!-- KPI: Avg Time -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
		>
			<Timer
				class="w-6 h-6 text-purple-500/10 absolute right-3 top-3 group-hover:text-purple-500/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>AVG SESSION TIME</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-purple-600 transition-colors block relative z-10"
				>{currentStats.avgTime}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					{#if currentStats.deltas.avgTime.type === "up"}
						<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
						<span class="text-[10px] font-bold text-green-600 leading-none"
							>+{currentStats.deltas.avgTime.value}</span
						>
					{:else}
						<div class="w-2.5 h-[1.5px] bg-slate-300 mr-1 opacity-50"></div>
						<span class="text-[10px] font-bold text-slate-400 leading-none"
							>{currentStats.deltas.avgTime.value}</span
						>
					{/if}
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>per session</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-purple-700 bg-purple-50 border-purple-100/50"
				>
					Stable
				</Badge>
			</div>
		</div>

		<!-- KPI: Questions -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
		>
			<Star
				class="w-6 h-6 text-orange-500/10 absolute right-3 top-3 group-hover:text-orange-500/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>TOTAL QUESTIONS</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-orange-600 transition-colors block relative z-10"
				>{currentStats.questionsAnswered}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
					<span class="text-[10px] font-bold text-green-600 leading-none"
						>+{currentStats.deltas.questionsAnswered.value}</span
					>
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>answered</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-orange-700 bg-orange-50 border-orange-100/50"
				>
					High Volume
				</Badge>
			</div>
		</div>
	</div>

	<!-- MAIN CHART GRID -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- SESSIONS TREND -->
		<Card.Root
			class="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300"
		>
			<Card.Header
				class="flex flex-row items-center justify-between pb-2 px-6 pt-4"
			>
				<div class="flex flex-col">
					<Card.Title class="text-[15px] font-bold text-[#141522]"
						>Platform Traffic Trend</Card.Title
					>
					<Card.Description class="text-[11px] font-medium text-gray-400 mt-0.5"
						>Daily sessions vs questions answered across period</Card.Description
					>
				</div>
				<Badge
					variant="outline"
					class="bg-brand/5 border-brand/20 text-brand text-[9px] font-bold uppercase tracking-widest leading-none px-2 h-5"
					>Real-time</Badge
				>
			</Card.Header>
			<Card.Content class="p-6 flex-1">
				{#if sessionsTrend.length === 0 || sessionsTrend.every((d) => d.value === 0 && d.secondary === 0)}
					<Empty
						title="No traffic data"
						message="There are no sessions recorded for this period."
						icon={BarChart3}
						compact={true}
					/>
				{:else}
					<Trendchart
						data={sessionsTrend}
						config={sessionChartConfig}
						series={[
							{ key: "value", label: "Sessions", color: "var(--color-brand)" },
							{
								key: "secondary",
								label: "Questions",
								color: "var(--color-brand-muted)",
							},
						]}
						class="h-[162px]"
						yFormat={(v) => v.toLocaleString()}
					/>
				{/if}
			</Card.Content>
			<Card.Footer class="pt-2 pb-6 px-6">
				<div class="flex w-full items-start gap-2 text-[11px]">
					<div class="grid gap-1">
						<div
							class="flex items-center gap-1.5 leading-none font-bold text-slate-700"
						>
							Traffic: {currentStats.sessions} sessions over {selectedRange} days
							<TrendingUp class="w-3.5 h-3.5 text-emerald-500" />
						</div>
						<div
							class="text-slate-400 flex items-center gap-2 leading-none font-medium"
						>
							Showing daily session volume and interactive engagement
						</div>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>

		<!-- PASS RATE BY EXAM -->
		<Card.Root
			class="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300"
		>
			<Card.Header
				class="flex flex-row items-center justify-between pb-2 px-6 pt-4"
			>
				<div class="flex flex-col">
					<Card.Title class="text-[15px] font-bold text-[#141522]"
						>Pass rate by exam type</Card.Title
					>
				</div>
				<Badge
					variant="outline"
					class="bg-blue-50 border-blue-100 text-blue-600 text-[11px] font-medium rounded-full px-3 py-1"
				>
					Platform average: {filteredExamData.length
						? Math.round(
								filteredExamData.reduce((s, d) => s + (d.passRate ?? 0), 0) /
									filteredExamData.length,
							)
						: "—"}%
				</Badge>
			</Card.Header>
			<Card.Content class="p-6 flex-1">
				{#if filteredExamData.length === 0 || filteredExamData.every((d) => d.passRate === 0)}
					<Empty
						title="No exam data"
						message="Not enough exam data to compute pass rates."
						icon={Target}
						compact={true}
					/>
				{:else}
					<div class="h-[162px] w-full">
						<Chart.Container config={examChartConfig} class="h-full w-full">
							<BarChart
								data={filteredExamData}
								xScale={scaleBand().padding(0.4)}
								x="exam"
								axis="x"
								rule={false}
								series={[
									{
										key: "passRate",
										label: "Pass Rate %",
										color: "var(--color-brand)",
									},
								]}
								labels={{
									position: "outside",
									offset: 4,
									class: "text-[9px] font-bold fill-slate-400",
									format: (v) => v + "%",
								}}
								props={{
									bars: {
										rounded: "top",
										fillOpacity: 1,
										strokeWidth: 0,
										motion: { type: "tween", duration: 500 },
									},
									xAxis: {
										tickLabelProps: {
											fill: "#94a3b8",
											fontSize: 10,
											fontWeight: 600,
										},
										grid: { stroke: "transparent" },
									},
									yAxis: {
										tickLabelProps: {
											fill: "#cbd5e1",
											fontSize: 9,
											fontWeight: 600,
										},
										grid: false,
										ticks: 4,
										format: (v) => v + "%",
									},
								}}
							>
								{#snippet belowMarks()}
									<Highlight area={{ class: "fill-slate-50/50" }} />
								{/snippet}
								{#snippet tooltip()}
									<Chart.Tooltip indicator="dashed" />
								{/snippet}
							</BarChart>
						</Chart.Container>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer class="pt-2 pb-6 px-6">
				<div class="flex w-full items-start gap-2 text-[11px]">
					<div class="grid gap-1">
						<div
							class="flex items-center gap-1.5 leading-none font-bold text-slate-700"
						>
							Avg pass rate: {currentStats.passRate} across {selectedRange} days
							<TrendingUp class="w-3.5 h-3.5 text-emerald-500" />
						</div>
						<div
							class="text-slate-400 flex items-center gap-2 leading-none font-medium"
						>
							Showing pass rate average for the last 6 months
						</div>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>

	<!-- SECOND ROW CHARTS -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
		<!-- SUBJECT ACCURACY -->
		<Card.Root
			class="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300"
		>
			<Card.Header
				class="flex flex-row items-center justify-between pb-2 px-6 pt-3"
			>
				<div class="flex flex-col">
					<Card.Title class="text-[15px] font-bold text-[#141522]"
						>Subject Performance Analysis</Card.Title
					>
					<Card.Description class="text-[11px] font-medium text-gray-400 mt-0.5"
						>Breakdown of accuracy and attempts per subject area</Card.Description
					>
				</div>
				<div
					class="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200"
				>
					{#each ["accuracy", "attempts"] as metric}
						<button
							onclick={() => (selectedSubjectMetric = metric)}
							class="px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all {selectedSubjectMetric ===
							metric
								? 'bg-white text-brand shadow-sm'
								: 'text-slate-400'}"
						>
							{metric}
						</button>
					{/each}
				</div>
			</Card.Header>
			<Card.Content class="pt-0 pb-2 px-6 flex-1">
				{#if filteredSubjectData.length === 0 || filteredSubjectData.every((d) => d[selectedSubjectMetric] === 0)}
					<Empty
						title="No subjects"
						message="No subject data available."
						icon={BarChart3}
						compact={true}
					/>
				{:else}
					<Barchart
						data={filteredSubjectData}
						config={subjectAccuracyConfig}
						y="subject"
						orientation="horizontal"
						series={[
							{
								key: selectedSubjectMetric,
								label: selectedSubjectMetric,
								color: "oklch(0.91 0.06 195)",
							},
						]}
						class="h-[245px]"
						padding={{ left: 0, right: 20, top: 0, bottom: 0 }}
						showLabels
					/>
				{/if}
			</Card.Content>
			<Card.Footer class="pt-2 pb-4 px-6">
				<div class="flex w-full items-start gap-2 text-[11px]">
					<div class="grid gap-1">
						<div
							class="flex items-center gap-1.5 leading-none font-bold text-slate-700"
						>
							Top subject accuracy: {filteredSubjectData[0]?.subject ?? "—"} at {filteredSubjectData[0]
								?.accuracy ?? 0}% <TrendingUp
								class="w-3.5 h-3.5 text-emerald-500"
							/>
						</div>
						<div
							class="text-slate-400 flex items-center gap-2 leading-none font-medium"
						>
							Showing performance metrics across core subjects
						</div>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>

		<!-- DIFFICULTY PERFORMANCE -->
		<Card.Root
			class="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300"
		>
			<Card.Header
				class="flex flex-row items-center justify-between pb-2 px-6 pt-3"
			>
				<div class="flex flex-col">
					<Card.Title class="text-[15px] font-bold text-[#141522]"
						>Performance By Difficulty</Card.Title
					>
					<Card.Description class="text-[11px] font-medium text-gray-400 mt-0.5"
						>Global accuracy across content difficulty levels</Card.Description
					>
				</div>
				<button
					class="text-[11px] font-bold text-slate-400 hover:text-brand transition-colors"
					>See Details</button
				>
			</Card.Header>
			<Card.Content class="p-3 flex-1 flex flex-col gap-1 px-8 overflow-hidden">
				{#if !data?.subjectAccuracy || data.subjectAccuracy.length === 0 || filteredDifficultyData.every((d) => d.value === 0)}
					<div class="py-6">
						<Empty
							title="No difficulty data"
							message="Not enough session attempts to calculate difficulty distribution."
							icon={BarChart3}
							compact={true}
						/>
					</div>
				{:else}
					<!-- RADIAL PROGRESS CIRCLES (TOP) -->
					<div class="flex justify-between w-full pt-2">
						{#each filteredDifficultyData as item}
							<div class="flex flex-col items-center gap-2">
								<span
									class="text-[9px] font-black uppercase tracking-widest {item.textColor} {item.badgeBg} px-2.5 py-1 rounded-full text-center"
									>{item.label}</span
								>
								<div class="w-16 h-16 relative">
									<LayerChart data={[{ value: item.value }]} x="value">
										<ArcChart
											value="value"
											maxValue={100}
											innerRadius={-6}
											outerRadius={-6}
											padding={0}
											cornerRadius={10}
											padAngle={0}
											range={[90, -270]}
											series={[
												{
													key: item.label,
													color: item.color,
													data: [{ value: item.value }],
												},
											]}
											props={{
												arc: {
													track: { fill: "#f1f5f9" },
												},
											}}
										>
											{#snippet aboveMarks()}
												<ChartText
													value={String(item.value)}
													textAnchor="middle"
													verticalAnchor="middle"
													class="fill-slate-800 text-lg font-black"
													dy={2}
												/>
											{/snippet}
										</ArcChart>
									</LayerChart>
								</div>
							</div>
						{/each}
					</div>

					<!-- DETAILED LIST (BOTTOM) -->
					<div class="flex flex-col w-full px-2">
						{#each filteredDifficultyData as item, i}
							<div
								class="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-default group {i !==
								difficultyData.length - 1
									? 'border-b border-slate-100'
									: ''}"
							>
								<div class="flex items-center gap-4">
									<div
										class="w-3 h-3 rounded-sm shadow-sm group-hover:scale-110 transition-transform"
										style="background: {item.color}"
									></div>
									<div class="flex items-center gap-2">
										<span class="text-[13px] font-bold text-slate-800"
											>{item.value}%</span
										>
										<span
											class="text-[12px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors"
											>{item.label}</span
										>
									</div>
								</div>
								<div class="flex flex-col items-end">
									<span class="text-[12px] font-bold text-slate-800">
										{(item.value * 15.5).toFixed(0)}
										<span class="text-[9px] font-medium text-slate-400"
											>marks</span
										>
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
			<Card.Footer class="pt-2 pb-4 px-6">
				<div class="flex w-full items-start gap-2 text-[11px]">
					<div class="grid gap-1">
						<div
							class="flex items-center gap-1.5 leading-none font-bold text-slate-700"
						>
							Accuracy on Hard questions is up 3.4% <TrendingUp
								class="w-3.5 h-3.5 text-emerald-500"
							/>
						</div>
						<div
							class="text-slate-400 flex items-center gap-2 leading-none font-medium"
						>
							Showing global performance distribution by difficulty
						</div>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>

	<!-- THIRD ROW: GROWTH & REVENUE -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
		<!-- USER REGISTRATIONS -->
		<Card.Root
			class="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300"
		>
			<Card.Header
				class="flex flex-row items-center justify-between pb-2 px-6 pt-3"
			>
				<div class="flex flex-col">
					<Card.Title class="text-[15px] font-bold text-[#141522]"
						>New user registrations</Card.Title
					>
					<Card.Description class="text-[11px] font-medium text-gray-400 mt-0.5"
						>Last 30 days registration trend</Card.Description
					>
				</div>
				<Badge
					variant="outline"
					class="bg-emerald-50 border-emerald-200 text-emerald-700 text-[9px] font-bold h-5"
					>Last 30 days</Badge
				>
			</Card.Header>
			<Card.Content class="p-4 flex-1">
				{#if userGrowthTrend.length === 0 || userGrowthTrend.every((d) => d.value === 0)}
					<Empty
						title="No registrations"
						message="No user growth data available."
						icon={Users}
						compact={true}
					/>
				{:else}
					<Trendchart
						data={userGrowthTrend}
						config={userRegistrationConfig}
						series={[
							{
								key: "value",
								label: "New Users",
								color: "oklch(0.61 0.11 222)",
							},
						]}
						gradientId="userGrowthGradient"
						stopColor="oklch(0.61 0.11 222)"
						class="h-[160px]"
					/>
				{/if}
			</Card.Content>
			<Card.Footer class="pt-1 pb-4 px-6 border-t border-slate-50/50">
				<div class="flex w-full items-start gap-2 text-[11px]">
					<div class="grid gap-1">
						<div
							class="flex items-center gap-1.5 leading-none font-bold text-slate-700"
						>
							Overall registration {data.registrationGrowthPct >= 0
								? "up"
								: "down"} by {Math.abs(data.registrationGrowthPct)}% this month <TrendingUp
								class="w-3.5 h-3.5 {data.registrationGrowthPct >= 0
									? 'text-emerald-500'
									: 'text-red-500 transform rotate-180'}"
							/>
						</div>
						<div
							class="text-slate-400 flex items-center gap-2 leading-none font-medium"
						>
							Daily average of {data.dailyAvgNew} new active users
						</div>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>

		<!-- REVENUE TREND -->
		<Card.Root
			class="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300"
		>
			<Card.Header
				class="flex flex-row items-center justify-between pb-2 px-6 pt-3"
			>
				<div class="flex flex-col">
					<Card.Title class="text-[15px] font-bold text-[#141522]"
						>Credit purchases over time</Card.Title
					>
					<Card.Description class="text-[11px] font-medium text-gray-400 mt-0.5"
						>Revenue trends and transaction volume</Card.Description
					>
				</div>
				<Badge
					variant="outline"
					class="bg-amber-50 border-amber-200 text-amber-700 text-[9px] font-bold h-5"
					>Revenue trend</Badge
				>
			</Card.Header>
			<Card.Content class="p-4 flex-1">
				{#if revenueTrend.length === 0 || revenueTrend.every((d) => d.value === 0)}
					<Empty
						title="No revenue data"
						message="No purchases have been made yet."
						icon={LineChartIcon}
						compact={true}
					/>
				{:else}
					<Trendchart
						data={revenueTrend}
						config={creditPurchaseConfig}
						series={[
							{ key: "value", label: "Revenue", color: "oklch(0.91 0.06 195)" },
						]}
						gradientId="revenueGradient"
						stopColor="oklch(0.91 0.06 195)"
						yFormat={(v) => `₦${v / 1000}k`}
						class="h-[160px]"
					/>
				{/if}
			</Card.Content>
			<Card.Footer class="pt-1 pb-4 px-6 border-t border-slate-50/50">
				<div class="flex w-full items-start gap-2 text-[11px]">
					<div class="grid gap-1">
						<div
							class="flex items-center gap-1.5 leading-none font-bold text-slate-700"
						>
							Average transaction value is ₦{data.avgTransactionValue.toLocaleString()}
							<TrendingUp class="w-3.5 h-3.5 text-emerald-500" />
						</div>
						<div
							class="text-slate-400 flex items-center gap-2 leading-none font-medium"
						>
							Revenue trend is stabilizing above target
						</div>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>

	<!-- BOTTOM SECTION: FAILED QUESTIONS & ATTEMPT DIST -->
	<div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
		<!-- MOST FAILED QUESTIONS -->
		<Card.Root class="shadow-sm border-slate-100 overflow-hidden">
			<Card.Header
				class="flex flex-row items-center justify-between border-b border-slate-50 py-2 px-6"
			>
				<div class="flex flex-col gap-0.5">
					<Card.Title class="text-[13px] font-bold text-slate-800"
						>Most Failed Questions</Card.Title
					>
					<Card.Description
						class="text-[10px] text-slate-400 font-medium tracking-tight"
						>Questions with highest percentage of incorrect attempts</Card.Description
					>
				</div>
				<Badge
					variant="outline"
					class="bg-red-50 border-red-200 text-red-700 text-[9px] font-bold h-5 flex gap-1 items-center"
				>
					<AlertCircle class="w-3 h-3" />
					Needs Attention
				</Badge>
			</Card.Header>
			<Card.Content class="p-0 overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="bg-slate-50/50 border-b border-slate-100">
							<th
								class="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"
								>Rank</th
							>
							<th
								class="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"
								>Question Text</th
							>
							<th
								class="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"
								>Subject</th
							>
							<th
								class="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
								>Fail %</th
							>
							<th
								class="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"
								>Attempts</th
							>
							<th
								class="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody>
						{#each data.failedQuestions as q, i}
							<tr
								class="border-b border-slate-50 hover:bg-slate-50/30 transition-colors"
							>
								<td class="px-6 py-2">
									<span class="text-[12px] font-semibold text-slate-500">
										#{i + 1}
									</span>
								</td>
								<td class="px-6 py-2">
									<div class="flex flex-col max-w-[320px]">
										<span class="text-[12px] font-bold text-slate-800 truncate"
											>{q.question}</span
										>
										<span class="text-[9px] font-medium text-slate-400"
											>Subject: {q.subject} • ID: #{q.id}</span
										>
									</div>
								</td>
								<td class="px-6 py-2">
									<span
										class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 uppercase tracking-tight"
									>
										{q.subject}
									</span>
								</td>
								<td class="px-6 py-2 text-center">
									<span class="text-[12px] font-black text-red-600"
										>{q.failRate}%</span
									>
								</td>
								<td class="px-6 py-2 text-right">
									<div class="flex flex-col items-end">
										<span
											class="text-[11px] font-bold text-slate-700 leading-none"
											>{q.attempts.toLocaleString()}</span
										>
										<span class="text-[8px] font-medium text-slate-400"
											>Attempts</span
										>
									</div>
								</td>
								<td class="px-4 py-2 text-right">
									<div class="flex items-center justify-end">
										<Button
											variant="ghost"
											size="icon"
											class="h-7 w-7 text-slate-300 hover:text-brand"
										>
											<Edit class="w-3.5 h-3.5" />
										</Button>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="py-10">
									<Empty
										title="No data"
										message="No failed questions reported."
										icon={AlertCircle}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</Card.Content>
			<div
				class="px-6 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between"
			>
				<div
					class="text-[9px] font-black text-slate-400 uppercase tracking-widest"
				>
					Page 1 of 5
				</div>
				<div class="flex items-center gap-1.5">
					<Button
						variant="outline"
						size="sm"
						class="h-7 px-2.5 text-[10px] font-bold text-slate-500 bg-white border-slate-200"
					>
						Previous
					</Button>
					<div class="flex items-center gap-1">
						<Button
							variant="secondary"
							size="sm"
							class="h-7 w-7 p-0 text-[10px] font-black bg-brand text-white"
							>1</Button
						>
						<Button
							variant="ghost"
							size="sm"
							class="h-7 w-7 p-0 text-[10px] font-bold text-slate-400">2</Button
						>
					</div>
					<Button
						variant="outline"
						size="sm"
						class="h-7 px-2.5 text-[10px] font-bold text-slate-500 bg-white border-slate-200"
					>
						Next
					</Button>
				</div>
			</div>
		</Card.Root>

		<!-- ATTEMPT DISTRIBUTION -->
		<Card.Root
			class="shadow-sm border-slate-100 overflow-hidden flex flex-col h-full bg-white"
		>
			<Card.Header
				class="pt-3 px-6 pb-2 flex flex-row items-center justify-between"
			>
				<div class="flex flex-col">
					<Card.Title class="text-[14px] font-bold text-slate-500"
						>Exam Distribution</Card.Title
					>
					<div class="flex items-center gap-2 mt-1">
						<span class="text-2xl font-black text-slate-900 leading-none"
							>{data.totalDistSessions >= 1000
								? (data.totalDistSessions / 1000).toFixed(1) + "k"
								: data.totalDistSessions}</span
						>
						<Badge
							class="bg-emerald-50 text-emerald-600 text-[10px] font-bold border-none h-5 px-1.5"
							>Live</Badge
						>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					class="h-8 text-[11px] font-bold text-slate-500 rounded-lg border-slate-200"
					>Details</Button
				>
			</Card.Header>

			<Card.Content class="pt-1 px-6 pb-6 flex flex-col flex-1">
				<!-- BUBBLE CLUSTER VISUAL -->
				<div
					class="relative h-[160px] w-full flex items-center justify-center my-2"
				>
					<!-- Overlapping Bubbles -->
					<div class="relative w-[220px] h-[150px]">
						<!-- Bubble 1: Largest -->
						<div
							class="absolute right-0 top-1/2 -translate-y-1/2 w-[125px] h-[125px] rounded-full bg-orange-100/60 border border-orange-200 flex items-center justify-center z-20 shadow-sm transition-opacity duration-300"
							style="opacity: {sorted[0] ? '1' : '0'}"
						>
							{#if sorted[0]}
								<span class="text-[24px] font-black text-orange-950"
									>{Math.round(
										(sorted[0].sessions / Math.max(1, data.totalDistSessions)) *
											100,
									)}%</span
								>
							{/if}
						</div>
						<!-- Bubble 2: Medium -->
						<div
							class="absolute left-2 bottom-0 w-[105px] h-[105px] rounded-full bg-amber-50/70 border border-amber-100 flex items-center justify-center z-10 shadow-sm transition-opacity duration-300"
							style="opacity: {sorted[1] ? '1' : '0'}"
						>
							{#if sorted[1]}
								<span class="text-[20px] font-black text-amber-900"
									>{Math.round(
										(sorted[1].sessions / Math.max(1, data.totalDistSessions)) *
											100,
									)}%</span
								>
							{/if}
						</div>
						<!-- Bubble 3: Smallest top -->
						<div
							class="absolute left-8 top-0 w-[90px] h-[90px] rounded-full bg-emerald-50/70 border border-emerald-100 flex items-center justify-center z-0 transition-opacity duration-300"
							style="opacity: {sorted[2] ? '1' : '0'}"
						>
							{#if sorted[2]}
								<span class="text-lg font-black text-emerald-900"
									>{Math.round(
										(sorted[2].sessions / Math.max(1, data.totalDistSessions)) *
											100,
									)}%</span
								>
							{/if}
						</div>
					</div>
				</div>

				<!-- DETAILED LIST -->
				{#if sorted.length === 0}
					<Empty
						title="No exam distribution"
						message="No exams have been taken."
						icon={PieChartIcon}
						compact={true}
					/>
				{:else}
					<div class="space-y-3.5 mt-auto">
						{#each sorted
							.slice(0, 3)
							.map( (d) => ({ name: d.examType?.toUpperCase() ?? "EXAM", value: d.sessions >= 1000 ? (d.sessions / 1000).toFixed(1) + "k" : d.sessions, color: d.examType === "waec" ? "#185FA5" : d.examType === "neco" ? "#BA7517" : "#639922", trend: Math.round((d.sessions / Math.max(1, data.totalDistSessions)) * 100) + "%", up: true }), ) as item}
							<div class="flex items-center justify-between group">
								<div class="flex items-center gap-3">
									<div
										class="w-2.5 h-2.5 rounded-full"
										style="background: {item.color}"
									></div>
									<span
										class="text-[13px] font-bold text-slate-600 group-hover:text-brand transition-colors"
										>{item.name}</span
									>
								</div>
								<div class="flex items-center gap-4">
									<span class="text-[13px] font-bold text-slate-800"
										>{item.value}</span
									>
									<div class="flex items-center gap-1 min-w-[50px] justify-end">
										{#if item.up}
											<TrendingUp class="w-3 h-3 text-emerald-500" />
											<span class="text-[10px] font-bold text-slate-400"
												>{item.trend}</span
											>
										{:else}
											<TrendingDown class="w-3 h-3 text-red-500" />
											<span class="text-[10px] font-bold text-slate-400"
												>{item.trend}</span
											>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>

<style>
	:global(.lucide) {
		stroke-width: 1.5px;
	}
</style>
