<script lang="ts">
	import { fly } from "svelte/transition";
	import {
		Search,
		Plus,
		Upload,
		Filter,
		X,
		LayoutGrid,
		List,
		MoreHorizontal,
		Clock,
		FileQuestion,
		User,
		Info,
		ChevronDown,
		Bot,
	} from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";

	import { goto } from "$app/navigation";
	
	let { data } = $props();
	let viewMode = $state("grid"); // grid | list
	let activeTab = $state("All subjects");
	let startingId = $state<number | null>(null);

	let items = $derived(data.items);

	async function startPractice(item: any) {
		if (!item.examId || startingId) return;
		startingId = item.id;
		goto(`/start_practice?examId=${item.examId}&subjectId=${item.subjectId}`);
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
					<span class="font-bold text-slate-900 text-sm">100 content</span>
				</div>

				<div class="relative w-64 group">
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors"
					/>
					<Input
						placeholder="Search..."
						class="pl-9 h-9 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-brand/20 focus-visible:border-brand transition-all text-xs"
					/>
				</div>
			</div>
		</div>

		<!-- Grid -->
		<div
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
		>
			{#each items as item, i (item.id)}
				<div
					in:fly={{ y: 20, duration: 400, delay: i * 50 }}
					class="flex flex-col h-full"
				>
					<Card.Root
						class="group flex-1 overflow-hidden bg-white border {startingId === item.id ? 'border-brand ring-2 ring-brand/20' : 'border-slate-200'} shadow-sm hover:shadow-lg hover:border-brand/60 hover:bg-brand-muted/20 transition-all duration-300 flex flex-col rounded-lg p-0 pt-0 ring-0 cursor-pointer"
						onclick={() => startPractice(item)}
					>
						<!-- Card Header / Thumbnail -->
						<div
							class="h-[115px] bg-gradient-to-br {item.thumbnailGradient} p-3 relative"
						>
							<!-- Illustration Placeholder -->
							<div
								class="absolute inset-0 flex items-center justify-center opacity-30"
							>
								<div
									class="w-24 h-24 bg-white/40 rotate-12 rounded-xl backdrop-blur-sm"
								></div>
								<div
									class="w-20 h-20 bg-white/60 -rotate-6 rounded-xl absolute backdrop-blur-md"
								></div>
								<div class="font-serif text-6xl text-slate-900/10 font-bold">
									Aa
								</div>
							</div>

							<!-- Badge -->
							<div
								class="absolute top-3 left-3 bg-[#A5F3FC] text-[#083358] text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-[#083358]"></span>
								{item.enrolled} Enrolled
							</div>

							{#if item.isDraft}
								<div
									class="absolute top-3 left-24 bg-white/90 backdrop-blur text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5 shadow-sm"
								>
									<div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
									Draft
								</div>
							{/if}
						</div>

						<Card.Content class="px-4 pt-3 pb-3 flex-1 flex flex-col gap-3">
							<div class="flex items-start justify-between gap-4">
								<Card.Title
									class="font-extrabold text-[#083358] text-[16px] leading-tight -mt-1 line-clamp-2 min-h-5"
								>
									{item.title}
								</Card.Title>

								<div class="flex flex-col items-end shrink-0 -mt-1">
									<span
										class="text-[9px] font-bold text-[#8D9FB2] uppercase tracking-wider mb-1"
										>Accuracy</span
									>
									<div class="flex items-center gap-1.5">
										{@render ringChart(
											item.accuracy,
											item.accuracy > 50
												? "text-emerald-500"
												: "text-amber-500",
										)}
										<span class="text-xs font-bold text-[#083358]"
											>{item.accuracy}%</span
										>
									</div>
								</div>
							</div>

							<!-- Progress & AI Analytics -->
							<div class="space-y-2.5">
								<div
									class="flex items-center justify-between text-[11px] font-bold"
								>
									<span class="text-[#8D9FB2] uppercase tracking-wider"
										>Progress</span
									>
									<span class="text-[#083358]">{item.completion}% complete</span
									>
								</div>

								<div
									class="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
								>
									<div
										class="h-full bg-brand rounded-full transition-all duration-1000"
										style="width: {item.completion}%"
									></div>
								</div>

								<div
									class="flex items-center gap-2 text-[11px] font-bold text-brand bg-brand/5 border border-brand/10 p-2 rounded-lg"
								>
									<div
										class="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center shrink-0"
									>
										<Bot class="w-3 h-3 text-brand" />
									</div>
									<span class="line-clamp-1"
										>AI: {item.aiFeedback ||
											"Well above average · Keep maintaining"}</span
									>
								</div>
							</div>

							<!-- Tags & Action -->
							<div class="flex flex-col gap-3 mt-auto">
								<div class="flex flex-wrap gap-2">
									{#each item.tags as tag}
										<Badge
											variant="outline"
											class="px-2.5 py-0.5 text-[10px] font-bold rounded-full border transition-colors {tag ===
											'2024'
												? 'bg-brand/10 text-brand border-brand/20'
												: 'bg-slate-50 text-slate-500 border-slate-200/60'}"
										>
											{tag}
										</Badge>
									{/each}
								</div>

								<Button 
									class="w-full h-9 bg-brand hover:bg-brand/90 hover:-translate-y-0.5 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-brand/10 group/btn transition-all active:scale-[0.98] flex items-center justify-center gap-2"
									disabled={startingId === item.id}
									onclick={(e) => {
										e.stopPropagation();
										startPractice(item);
									}}
								>
									{#if startingId === item.id}
										Starting...
									{:else}
										<span>Proceed</span>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover/btn:translate-x-0.5">
											<line x1="5" y1="12" x2="19" y2="12"></line>
											<polyline points="12 5 19 12 12 19"></polyline>
										</svg>
									{/if}
								</Button>
							</div>
						</Card.Content>

						<Card.Footer
							class="px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium bg-slate-50/10"
						>
							<div class="flex items-center gap-3">
								<span class="flex items-center gap-1.5">
									Edited {item.updated}
								</span>
								<span class="w-1 h-1 rounded-full bg-slate-300"></span>
								<span
									class="flex items-center gap-1.5 text-slate-600 font-bold"
								>
									<FileQuestion class="w-3.5 h-3.5" />
									{item.questions} Question
								</span>
							</div>

							<button
								class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md transition-colors text-slate-400"
								onclick={(e) => e.stopPropagation()}
							>
								<MoreHorizontal class="w-4 h-4" />
							</button>
						</Card.Footer>
					</Card.Root>
				</div>
			{/each}
		</div>
	</div>
</div>
