<script lang="ts">
	import { getTooltipContext, Tooltip as TooltipPrimitive } from "layerchart";

	/**
	 * Custom radar chart tooltip.
	 *
	 * Layerchart's radial LineChart only puts ONE series in tooltipCtx.payload
	 * (the one whose SVG point the cursor hit). But every payload item carries
	 * the full raw data row in `item.payload`. We use that row to show BOTH
	 * "You" and "Top 10%" values regardless of which series was hovered.
	 */

	interface RadarRow {
		subject: string;
		you: number;
		top10: number;
	}

	const tooltipCtx = getTooltipContext();

	// The raw row always contains the full subject + both series values.
	const row = $derived(tooltipCtx.payload?.[0]?.payload as RadarRow | undefined);

	const series = [
		{ key: "you", label: "You", color: "var(--color-brand)" },
		{ key: "top10", label: "Top 10%", color: "#60a5fa" },
	] as const;
</script>

<TooltipPrimitive.Root variant="none">
	{#if row?.subject}
		<div
			class="border-border/50 bg-background grid min-w-36 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl"
		>
			<!-- Subject label -->
			<div class="font-medium">{row.subject}</div>

			<!-- Both series rows -->
			<div class="grid gap-1.5">
				{#each series as s}
					{@const val = row[s.key]}
					<div class="flex w-full items-center gap-2">
						<!-- Colour swatch -->
						<div
							style="background:{s.color};"
							class="size-2.5 shrink-0 rounded-[2px]"
						></div>
						<div class="flex flex-1 items-center justify-between leading-none">
							<span class="text-muted-foreground">{s.label}</span>
							<span class="text-foreground font-mono font-medium tabular-nums">{val}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</TooltipPrimitive.Root>
