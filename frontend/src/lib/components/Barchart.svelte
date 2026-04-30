<script lang="ts">
	import * as Chart from "$lib/components/ui/chart";
	import { BarChart } from "layerchart";
	import { scaleBand } from "d3-scale";
	import { cubicInOut } from "svelte/easing";

	interface Props {
		data: any[];
		config: Chart.ChartConfig;
		x?: string;
		y?: string;
		series: any[];
		class?: string;
		orientation?: "vertical" | "horizontal";
		padding?: { top?: number; bottom?: number; left?: number; right?: number };
		hideAxis?: boolean;
		showLabels?: boolean;
	}

	let { 
		data, 
		config, 
		x, 
		y,
		series,
		class: className = "h-[220px]",
		orientation = "vertical",
		padding = { top: 0, bottom: 0, left: 0, right: 0 },
		hideAxis = false,
		showLabels = false
	} = $props<Props>();

	let context = $state<any>();
</script>

<Chart.Container {config} class="mt-2 {className} w-full aspect-auto -mb-4">
	<BarChart
		bind:context
		{data}
		xScale={orientation === 'vertical' ? scaleBand().padding(0.3) : undefined}
		yScale={orientation === 'horizontal' ? scaleBand().paddingInner(0.04).paddingOuter(0) : undefined}
		{x}
		{y}
		axis={orientation === 'vertical' ? "x" : "y"}
		{orientation}
		{padding}
		{series}
		grid={false}
		rule={false}
		labels={showLabels ? { offset: 8, class: "text-[11px] font-bold fill-slate-700" } : undefined}
		props={{
			bars: {
				stroke: "none",
				strokeWidth: 0,
				rounded: "all",
				initialY: orientation === 'vertical' ? context?.height : undefined,
				initialWidth: orientation === 'horizontal' ? 0 : undefined,
				initialHeight: orientation === 'vertical' ? 0 : undefined,
				fillOpacity: 1,
				motion: {
					y: { type: "tween", duration: 500, easing: cubicInOut },
					height: { type: "tween", duration: 500, easing: cubicInOut },
					width: { type: "tween", duration: 500, easing: cubicInOut },
				},
			},
			highlight: { area: { fill: "none" } },
			xAxis: hideAxis ? { grid: false, ticks: 0, tickLabelProps: { display: 'none' } } : { tickPadding: 8, grid: false, ticks: 0, tickLabelProps: { display: 'none' } },
			yAxis: orientation === 'horizontal' ? {
				tickLabelProps: {
					textAnchor: "start",
					dx: 16,
					class: "stroke-none fill-slate-700 font-bold text-[12px]",
				},
				tickLength: 0,
				grid: false
			} : { grid: false }
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip indicator="dashed" />
		{/snippet}
	</BarChart>
</Chart.Container>
