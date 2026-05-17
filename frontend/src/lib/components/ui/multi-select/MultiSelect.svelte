<script lang="ts">
	import { Check, X, ChevronDown } from "@lucide/svelte";
	import { fade, slide } from "svelte/transition";
    import { onMount } from "svelte";

	let {
		options = [],
		selected = $bindable([]),
		placeholder = "Select options...",
		maxSelections = 5
	} = $props();

	let isOpen = $state(false);
    let containerRef: HTMLDivElement;

	function toggleOption(opt: string) {
		if (selected.includes(opt)) {
			selected = selected.filter((o: string) => o !== opt);
		} else {
			if (selected.length < maxSelections) {
				selected = [...selected, opt];
			}
		}
	}

	function removeOption(opt: string, e: Event) {
		e.stopPropagation();
		selected = selected.filter((o: string) => o !== opt);
	}

    onMount(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef && !containerRef.contains(event.target as Node)) {
                isOpen = false;
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });
</script>

<div class="relative w-full text-slate-800" bind:this={containerRef}>
	<!-- Input area -->
	<button
		type="button"
		class="w-full min-h-[44px] flex flex-wrap items-center gap-1.5 p-1 bg-white border rounded-lg transition-colors outline-none {isOpen ? 'border-brand ring-1 ring-brand/20' : 'border-slate-300 hover:border-slate-400'}"
		onclick={() => (isOpen = !isOpen)}
	>
		{#if selected.length === 0}
			<span class="text-slate-400 px-2 text-sm">{placeholder}</span>
		{:else}
			{#each selected as sel}
				<span
					class="flex items-center gap-1 bg-slate-100 text-slate-700 text-sm px-2.5 py-1 rounded-md"
                    transition:fade={{duration: 150}}
				>
					{sel}
					<div
						role="button"
						tabindex="0"
						class="text-slate-400 hover:text-red-500 transition-colors ml-1"
						onclick={(e) => removeOption(sel, e)}
                        onkeydown={(e) => e.key === 'Enter' && removeOption(sel, e)}
					>
						<X class="w-3 h-3" />
					</div>
				</span>
			{/each}
		{/if}
		
		<div class="ml-auto flex items-center pr-2">
			{#if selected.length > 0}
				<div
					role="button"
					tabindex="0"
					class="text-slate-400 hover:text-slate-600 transition-colors mr-2"
					onclick={(e) => {
						e.stopPropagation();
						selected = [];
					}}
                    onkeydown={(e) => e.key === 'Enter' && (selected = [])}
				>
					<X class="w-4 h-4" />
				</div>
			{/if}
			<ChevronDown class="w-4 h-4 text-slate-400 {isOpen ? 'rotate-180' : ''} transition-transform" />
		</div>
	</button>

	<!-- Dropdown -->
	{#if isOpen}
		<div
			class="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[100] py-1"
			transition:slide={{ duration: 200 }}
		>
			{#each options as opt}
				{@const isSelected = selected.includes(opt)}
				<button
					type="button"
					class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors {isSelected ? 'bg-[#f0fcfb] text-brand font-medium' : 'hover:bg-slate-50 text-slate-700'}"
					onclick={() => toggleOption(opt)}
				>
					{opt}
					{#if isSelected}
						<Check class="w-4 h-4 text-brand" />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
