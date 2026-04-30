<script lang="ts">
	import * as Chart from "$lib/components/ui/chart";
	import { AreaChart, Area, ChartClipPath } from "layerchart";
	import { scaleUtc } from "d3-scale";
	import { curveNatural } from "d3-shape";

	interface Props {
		data: any[];
		config: Chart.ChartConfig;
		x?: string;
		series: any[];
		class?: string;
		gradientId?: string;
		yFormat?: (v: number) => string;
		stopColor?: string;
	}

	let { 
		data, 
		config, 
		x = "date", 
		series,
		class: className = "h-[230px]",
		gradientId = "fillScore",
		yFormat = (v) => `${v}`,
		stopColor = "var(--color-brand)"
	} = $props<Props>();
</script>

<Chart.Container {config} class="mt-2 {className} w-full aspect-auto">
	<AreaChart
		{data}
		{x}
		xScale={scaleUtc()}
		{series}
		padding={{ left: 45, right: 10, top: 10, bottom: 20 }}
		grid={false}
		props={{
			area: {
				curve: curveNatural,
				"fill-opacity": 0.4,
				line: { class: "stroke-2" },
				motion: "tween",
			},
			xAxis: {
				format: (v: Date) =>
					v.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
			},
			yAxis: { format: yFormat },
		}}
	>
		{#snippet marks({ series, getAreaProps })}
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
					<stop
						offset="5%"
						stop-color={stopColor}
						stop-opacity={0.3}
					/>
					<stop
						offset="95%"
						stop-color={stopColor}
						stop-opacity={0.02}
					/>
				</linearGradient>
			</defs>
			<ChartClipPath>
				{#each series as s (s.key)}
					<Area {...getAreaProps(s, 0)} fill="url(#{gradientId})" />
				{/each}
			</ChartClipPath>
		{/snippet}
		{#snippet tooltip()}
			<Chart.Tooltip
				labelFormatter={(v: Date) =>
					v.toLocaleDateString("en-US", {
						month: "long",
						day: "numeric",
					})}
				indicator="line"
			/>
		{/snippet}
	</AreaChart>
</Chart.Container>
