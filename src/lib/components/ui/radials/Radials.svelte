<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { ArcChart, Text } from "layerchart";

	interface SubjectKpi {
		name: string;
		score: number;
		status: string;
		color: string; // text color for badge
		badgeBg: string; // badge bg
		stroke: string; // arc color (css var or hex)
	}

	let { subjects }: { subjects: SubjectKpi[] } = $props();

	// Color map: stroke class → actual CSS color value for ArcChart
	const strokeColorMap: Record<string, string> = {
		"stroke-brand": "var(--color-brand)",
		"stroke-amber-400": "var(--color-amber-400, #f59e0b)",
		"stroke-red-400": "var(--color-red-400, #f87171)",
	};

	function arcColor(stroke: string): string {
		return strokeColorMap[stroke] ?? "var(--color-brand)";
	}

	// Build per-subject chart data/config
	function buildSubjectChart(sub: SubjectKpi) {
		const colorVar = arcColor(sub.stroke);
		const chartData = [{ subject: sub.name, value: sub.score, color: colorVar }];
		const chartConfig = {
			value: { label: sub.name },
			[sub.name.toLowerCase()]: { label: sub.name, color: colorVar },
		} satisfies Chart.ChartConfig;
		return { chartData, chartConfig, colorVar };
	}
</script>

<!--
  Radials — renders one ArcChart per subject KPI, matching the
  JAMB Readiness banner design (image 1).
-->
<div class="flex items-center justify-between gap-4 w-full">
	{#each subjects as sub}
		{@const { chartData, chartConfig, colorVar } = buildSubjectChart(sub)}
		<div class="flex flex-col items-center gap-1.5 flex-1 min-w-0">
			<!-- Subject name -->
			<span class="text-[11px] text-blue-200 font-medium tracking-wide truncate text-center">
				{sub.name}
			</span>

			<!-- Radial chart -->
			<Chart.Container config={chartConfig} class="w-[72px] h-[72px] aspect-square">
				<ArcChart
					label="subject"
					value="value"
					outerRadius={-6}
					innerRadius={-6}
					padding={4}
					range={[90, -270]}
					maxValue={100}
					cornerRadius={10}
					series={chartData.map((d) => ({
						key: d.subject.toLowerCase(),
						color: d.color,
						data: [d],
					}))}
					props={{
						arc: { track: { fill: "var(--color-brand-dark, #0b3b6c)" }, motion: "tween" },
						tooltip: { context: { hideDelay: 350 } },
					}}
					tooltip={false}
				>
					{#snippet aboveMarks()}
						<Text
							value={String(sub.score)}
							textAnchor="middle"
							verticalAnchor="middle"
							class="fill-white text-xl! font-bold"
							dy={2}
						/>
					{/snippet}
				</ArcChart>
			</Chart.Container>

			<!-- Status badge -->
			<span
				class="text-[8px] font-semibold uppercase tracking-wider {sub.color} {sub.badgeBg} px-2.5 py-1 rounded-full text-center mt-0.5"
			>
				{sub.status}
			</span>
		</div>
	{/each}
</div>
