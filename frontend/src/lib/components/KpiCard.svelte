<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";

	let {
		title,
		value,
		Icon,
		colorClass = "text-brand",
		subtext,
		badgeText,
	}: {
		title: string;
		value: string | number;
		Icon?: any;
		colorClass?: string;
		subtext: string;
		badgeText: string;
	} = $props();
</script>

<div
	class="group relative h-[115px] overflow-hidden rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-brand-muted/20 hover:shadow-lg"
>
	{#if Icon}
		<Icon
			class="absolute right-3 top-3 scale-125 opacity-10 transition-colors duration-500 group-hover:opacity-20 {colorClass}"
			stroke-width={1}
		/>
	{/if}
	<span
		class="relative z-10 text-[12px] font-medium tracking-tight text-gray-400 capitalize"
		>{title}</span
	>
	<span
		class="relative z-10 block text-[26px] font-bold leading-none tracking-tight text-slate-800 transition-colors group-hover:text-brand py-1"
		>{value}</span
	>
	<div class="relative z-10 flex w-full items-center justify-between">
		<span class="text-[10px] font-medium leading-none text-gray-400"
			>{subtext}</span
		>
		<Badge
			variant="outline"
			class="rounded-full border-brand/20 bg-brand-muted px-2 py-[2px] text-[8px] font-bold uppercase leading-none tracking-widest text-brand-dark"
			>{badgeText}</Badge
		>
	</div>
</div>
