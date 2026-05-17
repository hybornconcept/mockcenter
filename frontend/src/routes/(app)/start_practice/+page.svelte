<script lang="ts">
	import { fly } from "svelte/transition";
	import {
		Search,
		LayoutGrid,
		List,
		Clock,
		ChevronDown,
		Check,
		Star,
		ArrowRight,
	} from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import Empty from "$lib/components/Empty.svelte";

	import { goto } from "$app/navigation";

	let { data } = $props();
	let viewMode = $state("grid"); // grid | list
	let activeTab = $state("All subjects");
	let searchQuery = $state("");
	let startingId = $state<number | null>(null);

	let items = $derived(
		data.items
			.filter((item) => activeTab === "All subjects" || item.category === activeTab)
			.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	async function startPractice(item: any) {
		if (!item.examId || startingId) return;
		startingId = item.id;
		goto(
			`/configure?examId=${item.examId}&subjectId=${item.subjectId}&subjectName=${encodeURIComponent(item.title)}`,
		);
		startingId = null;
	}
</script>

{#snippet ringChart(percent: number, colorClass: string)}
	<div class="relative w-6 h-6 flex items-center justify-center">
		<svg class="w-full h-full transform -rotate-90">
			<circle
				cx="12"
				cy="12"
				r="9.5"
				stroke="currentColor"
				stroke-width="3"
				fill="none"
				class="text-slate-100"
			/>
			{#if percent > 0}
				<circle
					cx="12"
					cy="12"
					r="9.5"
					stroke="currentColor"
					stroke-width="3"
					fill="none"
					stroke-dasharray="59.69"
					stroke-dashoffset={59.69 - (59.69 * percent) / 100}
					stroke-linecap="round"
					class={colorClass}
				/>
			{/if}
		</svg>
	</div>
{/snippet}

<div
	class="flex-1 h-max bg-white font-sans text-slate-900 p-6 lg:p-8 m-2 lg:m-5 rounded-lg border border-slate-200 shadow-sm"
>
	<div class="max-w-[1600px] mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<h1 class="text-2xl font-bold text-slate-900 tracking-tight">
					Practice Questions
				</h1>
			</div>

			<div class="flex items-center gap-4">
				<button
					class="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
				>
					<div class="flex flex-col gap-0.5 items-end">
						<ChevronDown class="w-4 h-4 text-slate-400" />
					</div>
					Date Created
				</button>

				<div class="flex bg-slate-100/80 p-1.5 rounded-xl">
					<button
						class="p-1.5 rounded-lg transition-all {viewMode === 'grid'
							? 'bg-white shadow-sm text-slate-900'
							: 'text-slate-400 hover:text-slate-600'}"
						onclick={() => (viewMode = "grid")}
					>
						<LayoutGrid class="w-4 h-4" />
					</button>
					<button
						class="p-1.5 rounded-lg transition-all {viewMode === 'list'
							? 'bg-white shadow-sm text-slate-900'
							: 'text-slate-400 hover:text-slate-600'}"
						onclick={() => (viewMode = "list")}
					>
						<List class="w-4 h-4" />
					</button>
				</div>
			</div>
		</header>

		<!-- Tabs row -->
		<div class="border-b border-slate-100 mb-2">
			<nav class="flex items-center gap-8">
				{#each ["All subjects", "Sciences", "Arts", "Commercial", "General"] as tab}
					<button
						class="pb-2 text-[14px] font-normal transition-all relative {activeTab ===
						tab
							? 'text-[#083358]'
							: 'text-[#8D9FB2] hover:text-[#083358]/70'}"
						onclick={() => (activeTab = tab)}
					>
						{tab}
						{#if activeTab === tab}
							<div
								class="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-brand rounded-t-full z-10"
							></div>
						{/if}
					</button>
				{/each}
			</nav>
		</div>

		<!-- Filters & Controls -->
		<div class="space-y-2 mt-4">
			<!-- Count & Search Row -->
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-2">
					<span class="font-bold text-slate-900 text-sm">{items.length} {items.length === 1 ? 'subject' : 'subjects'}</span>
				</div>

				<div class="relative w-64 group">
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors"
					/>
					<Input
						bind:value={searchQuery}
						placeholder="Search subjects..."
						class="pl-9 h-9 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-brand/20 focus-visible:border-brand transition-all text-xs"
					/>
				</div>
			</div>
		</div>

		<!-- Grid -->
		<div
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-6"
		>
			{#each items as item, i (item.id)}
				<div
					in:fly={{ y: 20, duration: 400, delay: i * 50 }}
					class="flex flex-col h-full"
				>
					<!-- Light Card with Top 35% Image -->
					<div
						class="group flex-1 overflow-hidden bg-white rounded-xl flex flex-col shadow-sm border border-slate-200 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer hover:border-slate-300"
						role="button"
						tabindex="0"
						onclick={() => startPractice(item)}
						onkeydown={(e) => e.key === 'Enter' && startPractice(item)}
					>
						<!-- Top Image / Thumbnail (roughly 35%) -->
						<div
							class="h-[120px] bg-gradient-to-br {item.thumbnailGradient} relative shrink-0 overflow-hidden"
						>
							{#if item.thumbnail}
								<img
									src={item.thumbnail}
									alt={item.title}
									class="absolute inset-0 w-full h-full object-cover object-top"
									loading="lazy"
								/>
								<!-- subtle overlay so text stays readable if ever placed on image -->
								<div class="absolute inset-0 bg-white/10"></div>
							{:else}
								<!-- Illustration Placeholder -->
								<div
									class="absolute inset-0 flex items-center justify-center opacity-40"
								>
									<div
										class="w-24 h-24 bg-white/50 rotate-12 rounded-xl backdrop-blur-sm"
									></div>
									<div
										class="w-20 h-20 bg-white/70 -rotate-6 rounded-xl absolute backdrop-blur-md shadow-sm"
									></div>
									<div
										class="font-serif text-5xl text-slate-700/20 font-bold z-10"
									>
										Aa
									</div>
								</div>
							{/if}
						</div>

						<!-- Content Container -->
						<div class="p-5 flex flex-col flex-1">
							<!-- Header -->
							<div class="flex justify-between items-start">
								<div>
									<h2
										class="text-slate-900 text-[20px] font-bold leading-tight"
									>
										{item.title}
									</h2>
								</div>
								<div class="flex flex-col items-end shrink-0">
									<span
										class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1"
										>Accuracy</span
									>
									<div class="flex items-center gap-1.5">
										{@render ringChart(item.accuracy, item.brandText)}
										<span class="text-sm font-bold text-slate-700"
											>{item.accuracy}%</span
										>
									</div>
								</div>
							</div>

							<!-- Progress -->
							<div class="mt-5">
								<div
									class="flex justify-between items-center text-[11px] font-medium mb-2"
								>
									<span class="text-slate-500">Progress</span>
									<span class="text-slate-500">{item.completion}% complete</span
									>
								</div>
								<div
									class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
								>
									<div
										class="h-full rounded-full transition-all duration-1000 {item.progressColor}"
										style="width: {item.completion}%"
									></div>
								</div>
							</div>
							<!-- Time and Status -->
							<div class="mt-4 flex items-center justify-between">
								<div
									class="flex items-center gap-1.5 {item.timeLeftText ===
									'Completed'
										? 'text-emerald-600'
										: 'text-slate-500'}"
								>
									{#if item.timeLeftText === "Completed"}
										<Check class="w-3.5 h-3.5" />
									{:else}
										<Clock class="w-3.5 h-3.5" />
									{/if}
									<span class="text-[11px] font-medium"
										>{item.timeLeftText}</span
									>
								</div>
								<div
									class="{item.brandBadge} px-2.5 py-1.5 rounded-full border flex items-center"
								>
									<span
										class="text-[9px] font-extrabold whitespace-nowrap leading-none"
										>Best score {item.bestScore}%</span
									>
								</div>
							</div>

							<!-- Difficulty and Stars -->
							<div class="mt-4 flex items-center gap-1.5">
								{#if item.masteryStars > 0}
									<div class="flex items-center gap-0.5">
										{#each Array(item.masteryStars) as _}
											<Star class="w-3 h-3 text-amber-400" />
										{/each}
									</div>
									<span class="{item.brandText} text-[11px] font-bold ml-0.5"
										>{item.difficulty}</span
									>
								{:else}
									<span class="{item.brandText} text-[11px] font-bold"
										>{item.difficulty}</span
									>
								{/if}
							</div>

							<!-- Button -->
							<div class="mt-5 pt-1 mt-auto">
								<Button
									class="w-full h-10 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 {item.buttonStyle} disabled:opacity-70"
									disabled={startingId === item.id}
									onclick={(e) => {
										e.stopPropagation();
										startPractice(item);
									}}
								>
									{#if startingId === item.id}
										Starting...
									{:else}
										<span>{item.buttonText}</span>
										<ArrowRight class="w-3.5 h-3.5" />
									{/if}
								</Button>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="col-span-1 md:col-span-2 xl:col-span-3 py-12">
					<Empty title="No subjects found" message="We couldn't find any subjects matching your search." />
				</div>
			{/each}
		</div>
	</div>
</div>
