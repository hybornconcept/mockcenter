<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> = $props();
</script>

<div
	data-slot="progress"
	class={cn("bg-gray-100 h-1.5 rounded-full relative flex w-full items-center overflow-hidden", className)}
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
>
	<div
		data-slot="progress-indicator"
		class="bg-brand h-full transition-all duration-1000 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
		style="width: {(value ?? 0)}%"
	></div>
</div>
