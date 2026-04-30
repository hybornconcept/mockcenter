<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { scaleBand } from "d3-scale";
	import { BarChart, Labels, Highlight } from "layerchart";
	import { cubicInOut } from "svelte/easing";
	import { TrendingUp } from "lucide-svelte";

	let { subjectPerformance } = $props<{
		subjectPerformance: Array<{
			subject: string;
			userScore: number;
			avgScore: number;
		}>;
	}>();

	const chartConfig = {
		userScore: { label: "Your Score", color: "var(--color-brand)" },
		avgScore: { label: "Avg Score", color: "var(--color-brand-muted)" },
	} as const;
</script>

<Card.Root
	class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300"
>
	<Card.Header class="flex flex-row items-center justify-between pb-2">
		<div class="flex flex-col">
			<Card.Title class="text-[15px] font-bold text-[#141522]"
				>Subject Performance</Card.Title
			>
			<Card.Description class="text-[11px] font-medium text-gray-400 mt-0.5"
				>Comparison between your scores and platform average.</Card.Description
			>
		</div>
		<Select.Root>
			<Select.Trigger
				class="w-fit flex items-center gap-1.5 px-2 py-1 h-auto text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-none"
			>
				JAMB All
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">JAMB All</Select.Item>
				<Select.Item value="waec">WAEC 2022</Select.Item>
			</Select.Content>
		</Select.Root>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig} class="h-[162px] w-full mt-2">
			<BarChart
				data={subjectPerformance}
				xScale={scaleBand().padding(0.4)}
				horizontal={false}
				x="subject"
				axis="x"
				series={[
					{
						key: "userScore",
						label: "Your Score",
						color: chartConfig.userScore.color,
					},
					{
						key: "avgScore",
						label: "Avg Score",
						color: chartConfig.avgScore.color,
					},
				]}
				x1Scale={scaleBand().paddingInner(0.2)}
				seriesLayout="group"
				rule={false}
				props={{
					bars: {
						stroke: "none",
						rounded: "top",
						motion: { type: "tween", duration: 500, easing: cubicInOut },
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
	</Card.Content>
	<Card.Footer class="pt-2 pb-4">
		<div class="flex w-full items-start gap-2 text-[11px]">
			<div class="grid gap-1">
				<div
					class="flex items-center gap-1.5 leading-none font-bold text-slate-700"
				>
					Trending up by 5.2% this month <TrendingUp
						class="w-3.5 h-3.5 text-emerald-500"
					/>
				</div>
				<div
					class="text-slate-400 flex items-center gap-2 leading-none font-medium"
				>
					Showing subject performance across core examinations
				</div>
			</div>
		</div>
	</Card.Footer>
</Card.Root>
