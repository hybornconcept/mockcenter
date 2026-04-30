<script lang="ts">
	import { Search } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';
	
	let { 
		title = "No data found", 
		message = "We can't find any item matching your search",
		icon: Icon = Search,
		compact = false
	} = $props<{ title?: string; message?: string; icon?: any; compact?: boolean }>();
</script>

<div class="flex flex-col items-center justify-center {compact ? 'p-6 min-h-[150px]' : 'p-12 min-h-[300px]'} text-center w-full h-full">
	<div class="relative flex items-center justify-center {compact ? 'w-16 h-16 mb-2' : 'w-32 h-32 mb-4'}">
		<!-- Main Icon -->
		<div class="absolute inset-0 flex items-center justify-center text-teal-600/90 z-10">
			<Icon class="{compact ? 'w-8 h-8' : 'w-16 h-16'}" stroke-width={compact ? 1 : 0.75} />
		</div>
		
		<!-- Decorative sparkles / dots -->
		<div class="absolute top-4 left-6 w-1.5 h-1.5 rounded-full border border-blue-400"></div>
		<div class="absolute bottom-6 right-4 w-1 h-1 rounded-full bg-rose-400"></div>
		<div class="absolute top-2 right-8 text-yellow-400 text-sm">✦</div>
		<div class="absolute bottom-4 left-4 text-green-400 text-xl leading-none">⋆</div>
		<div class="absolute top-8 left-0 text-orange-300 text-xs leading-none">✦</div>
	</div>
	<div class="space-y-2">
		<h3 class="{compact ? 'text-[14px]' : 'text-[17px]'} font-semibold text-slate-800">{title}</h3>
		<p class="{compact ? 'text-[11px]' : 'text-[13px]'} text-slate-500 max-w-[260px] mx-auto leading-relaxed">{message}</p>
	</div>
</div>
