<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import {
		Bookmark,
		Folder,
		CheckSquare,
		Hourglass,
		Search,
		ChevronDown,
		Trash,
		MoreHorizontal,
		RotateCcw,
		PenLine,
		Sparkles,
		Check,
		X,
		BookOpen,
		Play,
		Tag,
	} from "@lucide/svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import Empty from "$lib/components/Empty.svelte";

	let { data } = $props();

	const iconMap = {
		Tag,
		Folder,
		CheckSquare,
		Hourglass,
		BookOpen,
		PenLine,
		Sparkles,
		RotateCcw,
		Search,
		ChevronDown,
		Trash,
		MoreHorizontal,
		Check,
		X,
		Play,
	};

	let searchQuery = $state("");
	let activeFilter = $state("All");
	let sortBy = $state("Newest");
	let selectedIds = $state<number[]>([]);

	const toggleSelectAll = () => {
		if (
			selectedIds.length === filteredBookmarks.length &&
			filteredBookmarks.length > 0
		) {
			selectedIds = [];
		} else {
			selectedIds = filteredBookmarks.map((b) => b.id);
		}
	};

	const filters = [
		{ label: "All", count: 47 },
		{ label: "JAMB", count: 22 },
		{ label: "WAEC", count: 14 },
		{ label: "NECO", count: 8 },
		{ label: "IELTS", count: 3 },
	];

	let filteredBookmarks = $derived(
		data.bookmarkData
			.filter((bookmark) => {
				const matchesSearch =
					bookmark.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
					bookmark.subject.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesFilter =
					activeFilter === "All" || bookmark.exam === activeFilter;
				return matchesSearch && matchesFilter;
			})
			.sort((a, b) => {
				if (sortBy === "Newest") return b.id - a.id;
				if (sortBy === "Oldest") return a.id - b.id;
				if (sortBy === "Subject") return a.subject.localeCompare(b.subject);
				return 0;
			}),
	);
</script>

<div class="space-y-4 mt-4">
	<!-- Stats Cards (Match Dashboard KPIs) -->
	<div class="grid grid-cols-4 gap-4">
		{#each data.stats as stat}
			{@const Icon = iconMap[stat.icon as keyof typeof iconMap]}
			<div
				class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased"
			>
				{#if Icon}
					<div
						class="absolute right-3 top-3 w-10 h-10 rounded-full bg-slate-50/50 flex items-center justify-center group-hover:bg-brand-muted transition-colors duration-500"
					>
						<Icon
							class="w-5 h-5 text-brand/20 group-hover:text-brand/40 transition-colors duration-500 fill-brand/5"
							stroke-width={1.5}
						/>
					</div>
				{/if}

				<div class="flex items-center justify-between relative z-10">
					<span class="text-[12px] font-medium text-gray-500 tracking-tight"
						>{stat.label}</span
					>
				</div>

				<span
					class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
					>{stat.value}</span
				>

				<div class="flex items-center justify-between w-full relative z-10">
					<span
						class="text-[10px] font-bold text-gray-400 mt-px mr-px leading-none"
						>Last 30 days</span
					>
					<Badge
						variant="outline"
						class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-brand-dark bg-brand-muted border-brand/20"
					>
						+12%
					</Badge>
				</div>
			</div>
		{/each}
	</div>

	<!-- AI Insight Banner (Match Dashboard Banners) -->
	<div
		class="relative overflow-hidden group rounded-xl bg-linear-to-br from-[#0b3b6c] to-[#121629] text-white p-5 shadow-sm border border-slate-200 hover:border-brand/40 hover:shadow-lg transition-all duration-300 antialiased"
	>
		<!-- Illustrative Abstract Background Shapes -->
		<div
			class="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-[20px] group-hover:scale-110 transition-transform duration-700"
		></div>
		<div
			class="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-[30px] group-hover:-translate-y-4 transition-transform duration-700"
		></div>

		<div class="relative z-10 flex items-center justify-between w-full h-full">
			<div class="flex items-center gap-5 max-w-3xl">
				<div
					class="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner group-hover:scale-105 transition-all duration-300"
				>
					<Sparkles class="w-5 h-5 text-blue-200" />
				</div>
				<div class="space-y-1">
					<div class="flex items-center gap-2 mb-1">
						<span
							class="text-[10px] font-bold tracking-widest uppercase text-blue-300"
							>AI Subject Insight</span
						>
					</div>
					<p class="text-white/90 text-[13px] leading-relaxed font-medium">
						You have 12 bookmarked Chemistry questions — your weakest subject.
						Practising these directly could push your Chemistry score from 48%
						to <span
							class="text-white font-black underline decoration-blue-400 underline-offset-4"
							>above 60%</span
						>. 8 of them cover <span class="font-bold">Organic Chemistry</span>.
					</p>
				</div>
			</div>

			<button
				class="relative flex flex-col items-center justify-center bg-white text-[#0b3b6c] hover:bg-white/90 transition-all rounded-xl px-6 h-11 font-bold text-[13px] shadow-lg shadow-black/10 group-hover:scale-105 transition-all duration-300 shrink-0"
			>
				Practice now →
			</button>
		</div>
	</div>

	<!-- Filters and Main Content Grid -->
	<div class="grid grid-cols-12 gap-6 items-start pb-20">
		<div class="col-span-8 space-y-5">
			<!-- Search & Filters Bar (Elevated Styling) -->
			<div class="flex items-center gap-3">
				<div class="relative flex-1 group">
					<Search
						class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors"
					/>
					<input
						type="text"
						placeholder="Search through your bookmarked questions..."
						class="w-full h-11 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/40 transition-all shadow-sm group-hover:border-brand/30 antialiased"
						bind:value={searchQuery}
					/>
					{#if searchQuery}
						<button
							class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
							onclick={() => (searchQuery = "")}
						>
							<X class="w-3.5 h-3.5" />
						</button>
					{/if}
				</div>

				<div
					class="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-sm h-11 flex shrink-0"
				>
					{#each filters as filter}
						<button
							class="px-4 h-full flex items-center justify-center rounded-lg text-[12px] font-bold transition-all
							{activeFilter === filter.label
								? 'bg-brand text-white shadow-md'
								: 'text-slate-500 hover:bg-slate-50'}"
							onclick={() => (activeFilter = filter.label)}
						>
							{filter.label}
							<span class="ml-1 opacity-50 font-normal">({filter.count})</span>
						</button>
					{/each}
				</div>

				<div class="flex items-center gap-2">
					<Select.Root
						type="single"
						value={sortBy}
						onValueChange={(v) => {
							if (v) sortBy = v;
						}}
					>
						<Select.Trigger
							class="h-11 px-5 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all group-hover:border-brand/40 antialiased min-w-[140px] justify-between"
						>
							Sort: {sortBy}
						</Select.Trigger>
						<Select.Content
							class="rounded-xl border-slate-200 shadow-xl antialiased"
						>
							<Select.Item value="Newest" class="text-[12px] font-bold"
								>Newest</Select.Item
							>
							<Select.Item value="Oldest" class="text-[12px] font-bold"
								>Oldest</Select.Item
							>
							<Select.Item value="Subject" class="text-[12px] font-bold"
								>By Subject</Select.Item
							>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Selection Controls (Match Dashboard Dense UI) -->
			<div class="flex items-center justify-between pb-1 px-1 h-11">
				<div class="flex items-center gap-3">
					<label
						class="flex items-center gap-2.5 cursor-pointer group select-none"
					>
						<div class="relative flex items-center justify-center">
							<input
								type="checkbox"
								class="peer appearance-none w-5 h-5 rounded-[5px] border-2 border-slate-200 checked:bg-brand checked:border-brand hover:border-brand-dark transition-all cursor-pointer shadow-sm"
								checked={selectedIds.length === filteredBookmarks.length &&
									filteredBookmarks.length > 0}
								onchange={toggleSelectAll}
							/>
							<Check
								class="absolute w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none stroke-[4]"
							/>
						</div>
						<span
							class="text-[13px] font-bold text-slate-500 group-hover:text-brand transition-colors antialiased"
							>Select all {activeFilter !== "All" ? activeFilter : ""} questions</span
						>
					</label>

					{#if selectedIds.length > 0}
						<div class="h-4 w-px bg-slate-200 mx-1"></div>
						<Badge
							variant="outline"
							class="bg-brand-muted text-brand border-brand/20 text-[10px] font-black px-2 py-0.5 rounded-full"
							>{selectedIds.length} SELECTED</Badge
						>
					{/if}
				</div>

				{#if selectedIds.length > 0}
					<div
						class="flex items-center gap-2 transform origin-right transition-all animate-in fade-in slide-in-from-right-2"
					>
						<button
							class="h-9 px-3.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border border-slate-200 hover:border-red-200 flex items-center gap-2 shadow-sm"
							onclick={() => (selectedIds = [])}
						>
							<Trash class="w-3.5 h-3.5" />
							Remove
						</button>
						<button
							class="h-9 px-4 bg-brand text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-lg shadow-brand/20 hover:bg-brand-dark flex items-center gap-2 active:scale-95 antialiased"
						>
							<Play class="w-3.5 h-3.5 fill-current" />
							Practice Selection
						</button>
					</div>
				{/if}
			</div>

			<!-- Bookmark Cards List (Match Dashboard Cards) -->
			<div class="space-y-4">
				{#each filteredBookmarks as bookmark, i}
					{@const isExpanded = i === 0}
					<div
						class="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand/40 hover:shadow-lg transition-all duration-300 antialiased overflow-hidden group"
					>
						<div class="p-5">
							<div class="flex items-start gap-4">
								<div class="pt-1.5 flex flex-col items-center gap-4">
									<div class="relative flex items-center justify-center">
										<input
											type="checkbox"
											value={bookmark.id}
											bind:group={selectedIds}
											class="peer appearance-none w-4.5 h-4.5 rounded-[4px] border-2 border-slate-200 checked:bg-brand checked:border-brand hover:border-brand-dark transition-all cursor-pointer shadow-sm"
										/>
										<Check
											class="absolute w-2.5 h-2.5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none stroke-[5]"
										/>
									</div>
									<div
										class="w-px h-10 bg-slate-100 group-hover:bg-brand/10 transition-colors"
									></div>
								</div>
								<div class="flex-1 space-y-4">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3.5">
											<div
												class="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-105 group-hover:bg-brand-muted/30 transition-all duration-300"
											>
												{#if bookmark.subject === "Chemistry"}<PenLine
														class="w-5 h-5 text-teal-600"
													/>
												{:else if bookmark.subject === "Biology"}<Sparkles
														class="w-5 h-5 text-green-600"
													/>
												{:else if bookmark.subject === "Physics"}<RotateCcw
														class="w-5 h-5 text-blue-600"
													/>
												{:else if bookmark.subject === "Mathematics"}<RotateCcw
														class="w-5 h-5 text-amber-600"
													/>
												{:else}<BookOpen class="w-5 h-5 text-slate-600" />{/if}
											</div>
											<div class="flex flex-col">
												<div class="flex items-center gap-2">
													<span class="text-[14px] font-bold text-[#141522]"
														>{bookmark.subject}</span
													>
													<Badge
														variant="outline"
														class="text-[9px] font-bold uppercase tracking-widest leading-none text-brand-dark bg-brand-muted border-brand/20 h-4 px-1.5"
														>{bookmark.exam}</Badge
													>
												</div>
												<span
													class="text-[11px] font-medium text-gray-400 mt-0.5"
													>{bookmark.year} • Set {bookmark.id}</span
												>
											</div>
										</div>
										<div class="flex items-center gap-1.5">
											<Badge
												variant="outline"
												class="
												{bookmark.status === 'Mastered'
													? 'text-emerald-700 bg-emerald-50 border-emerald-100'
													: bookmark.status === 'Needs work'
														? 'text-amber-700 bg-amber-50 border-amber-100'
														: 'text-blue-700 bg-blue-50 border-blue-100'} 
												text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider h-auto border-transparent"
											>
												{bookmark.status}
											</Badge>
											<div class="w-px h-4 bg-slate-200 mx-1"></div>
											<button
												class="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
											>
												<MoreHorizontal class="w-4 h-4" />
											</button>
										</div>
									</div>

									<div
										class="text-[13.5px] text-slate-700 font-medium leading-relaxed {isExpanded
											? 'leading-extra-relaxed'
											: 'line-clamp-2'}"
									>
										{bookmark.question}
									</div>

									{#if isExpanded}
										<!-- Detailed Content -->
										<div class="space-y-4 pt-1">
											{#if bookmark.note}
												<div
													class="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-2 relative group/note transition-all hover:bg-amber-50 antialiased"
												>
													<div class="flex items-center gap-2 text-amber-700">
														<PenLine class="w-3.5 h-3.5" />
														<span
															class="text-[10px] font-black uppercase tracking-widest italic"
															>Personal note</span
														>
													</div>
													<p
														class="text-[12px] text-amber-800 leading-relaxed font-medium"
													>
														{bookmark.note}
													</p>
												</div>
											{/if}

											{#if bookmark.options}
												<div class="grid grid-cols-1 gap-2">
													{#each bookmark.options as option}
														<div
															class="p-3.5 rounded-xl text-[13px] border flex items-center gap-3 transition-all cursor-default
															{option.isCorrect
																? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-semibold shadow-sm'
																: option.isWrong
																	? 'bg-red-50 border-red-100 text-red-600 font-semibold'
																	: 'bg-white border-slate-100 text-slate-500 font-medium hover:border-slate-300 hover:bg-slate-50'}"
														>
															<span
																class="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm
																{option.isCorrect
																	? 'bg-emerald-600 text-white'
																	: option.isWrong
																		? 'bg-red-600 text-white'
																		: 'bg-slate-50 border border-slate-200 text-slate-400'}"
															>
																{option.label}
															</span>
															<span class="flex-1">{option.text}</span>
															{#if option.isCorrect}<Check
																	class="w-4 h-4 ml-0.5 text-emerald-600"
																/>{/if}
															{#if option.isWrong}<X
																	class="w-3.5 h-3.5 ml-0.5 text-red-600"
																/>{/if}
														</div>
													{/each}
												</div>
											{/if}

											{#if bookmark.aiExplanation}
												<div
													class="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2 antialiased"
												>
													<div class="flex items-center gap-2 text-blue-700">
														<Sparkles class="w-3.5 h-3.5" />
														<span
															class="text-[10px] font-black uppercase tracking-widest"
															>AI Solution Insight</span
														>
													</div>
													<p
														class="text-[12px] text-blue-800 leading-relaxed font-medium"
													>
														{bookmark.aiExplanation}
													</p>
												</div>
											{/if}

											<!-- Footer Actions (More Dashboard-like) -->
											<div
												class="flex items-center justify-between pt-3 border-t border-slate-100"
											>
												<div class="flex items-center gap-2">
													{#each bookmark.tags || [] as tag}
														<Badge
															variant="outline"
															class="bg-slate-50 text-slate-500 border-slate-200 text-[9px] font-bold h-6 px-3 rounded-full hover:bg-slate-100 transition-colors uppercase tracking-tight"
															>{tag}</Badge
														>
													{/each}
												</div>
												<div class="flex items-center gap-2.5">
													<button
														class="h-9 px-4 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
													>
														<PenLine class="w-3.5 h-3.5" />
														Edit Note
													</button>
													<button
														class="h-9 px-5 bg-brand hover:bg-brand/90 text-white rounded-xl text-[12px] font-bold flex items-center gap-2 shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
													>
														<Play class="w-3.5 h-3.5 fill-current" />
														Practice
													</button>
												</div>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
						<div
							class="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between antialiased"
						>
							<div class="flex items-center gap-5">
								<span
									class="flex items-center gap-2 text-[10.5px] font-bold text-slate-400"
								>
									<div
										class="w-1.5 h-1.5 rounded-full {bookmark.footerStats.result.includes(
											'correct',
										)
											? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
											: bookmark.footerStats.result.includes('wrong')
												? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
												: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}"
									></div>
									{bookmark.footerStats.result}
								</span>
								<div class="w-px h-3 bg-slate-200"></div>
								<span
									class="flex items-center gap-2 text-[10.5px] font-bold text-slate-400"
									><RotateCcw class="w-3 h-3" />
									{bookmark.footerStats.savedDate}</span
								>
								<div class="w-px h-3 bg-slate-200"></div>
								<span
									class="flex items-center gap-2 text-[10.5px] font-bold text-slate-400"
									><Search class="w-3 h-3" />
									{bookmark.footerStats.reviewedCount} reviews</span
								>
							</div>
							<Badge
								class="
								{bookmark.footerStats.mastery === 'Mastered'
									? 'bg-emerald-500 shadow-emerald-100'
									: bookmark.footerStats.mastery === 'Not mastered'
										? 'bg-red-500 shadow-red-100'
										: 'bg-amber-500 shadow-amber-100'} 
								shadow-sm text-white border-none text-[9px] h-5 font-black uppercase tracking-widest px-2.5 rounded-full"
							>
								{bookmark.footerStats.mastery}
							</Badge>
						</div>
					</div>
				{:else}
					<Empty 
						title="No bookmarks found" 
						message="We couldn't find any questions matching your current search or filter parameters." 
						icon={Search} 
					/>
					<div class="flex justify-center -mt-8 relative z-10 pb-8">
						<button
							class="text-brand font-bold text-[13px] hover:underline"
							onclick={() => {
								searchQuery = "";
								activeFilter = "All";
							}}
						>
							Clear all filters
						</button>
					</div>
				{/each}
			</div>

			<!-- Load More Button (Match Dashboard Elevated Buttons) -->
			<div class="flex justify-center pt-8 pb-10">
				<button
					class="h-12 px-10 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-500 shadow-sm hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/10 transition-all flex items-center gap-3 group antialiased"
				>
					Load more bookmarks (42 remaining)
					<ChevronDown
						class="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
					/>
				</button>
			</div>
		</div>

		<!-- Sidebar Content (Match Dashboard Right Column) -->
		<div class="col-span-4 space-y-6 h-fit sticky top-[100px]">
			<!-- Practice Hub Card (Match Dashboard Highlight Banners) -->
			<div
				class="bg-brand-dark rounded-2xl p-6 text-white shadow-xl shadow-brand-dark/10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 antialiased"
			>
				<div
					class="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"
				></div>

				<div class="relative z-10 space-y-6">
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<div
								class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20"
							>
								<BookOpen class="w-4.5 h-4.5 text-white/90" />
							</div>
							<h3 class="font-bold text-[16px] tracking-tight">
								Focused Practice
							</h3>
						</div>
						<p class="text-white/80 text-[11.5px] leading-relaxed font-medium">
							Turn your saved questions into a session. AI will track your
							improvement on each one.
						</p>
					</div>

					<div class="grid grid-cols-3 gap-2">
						{#each [{ l: "To review", v: 29 }, { l: "Unmastered", v: 12 }, { l: "Total", v: 47 }] as item}
							<div
								class="bg-white/10 rounded-xl p-3 border border-white/10 text-center backdrop-blur-sm"
							>
								<div class="text-[17px] font-black">{item.v}</div>
								<div
									class="text-[8.5px] font-bold uppercase tracking-wider text-white/60 mt-0.5"
								>
									{item.l}
								</div>
							</div>
						{/each}
					</div>

					<button
						class="w-full h-11 bg-white text-brand-dark font-black text-[13px] rounded-xl shadow-lg shadow-black/10 transition-all hover:bg-brand-muted active:scale-95 flex items-center justify-center gap-2 antialiased"
					>
						<Play class="w-4 h-4 fill-current" />
						Start Practice Session
					</button>
				</div>
			</div>

			<!-- My Collections (Match Dashboard Box Style) -->
			<div
				class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-fit antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300"
			>
				<div
					class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60"
				>
					<h3 class="text-[15px] font-semibold tracking-wide text-[#141522]">
						My collections
					</h3>
					<button
						class="text-[11px] font-medium text-brand bg-brand-muted hover:bg-brand/10 px-3 py-1.5 rounded-full transition-colors border border-brand/20"
						>Create New</button
					>
				</div>
				<div class="flex flex-col gap-4">
					{#each data.collections as collection}
						{@const Icon = collection.icon.startsWith("text:")
							? null
							: iconMap[collection.icon as keyof typeof iconMap]}
						<button
							class="w-full flex items-center justify-between group cursor-pointer text-left pb-2 border-b border-slate-50 last:border-0 last:pb-0"
						>
							<div class="flex items-center gap-3">
								<div
									class="w-10 h-10 rounded-xl {collection.color} flex items-center justify-center font-semibold text-[12px] group-hover:scale-105 transition-all duration-300 border border-transparent group-hover:shadow-md"
								>
									{#if collection.icon.startsWith("text:")}
										{collection.icon.replace("text:", "")}
									{:else if Icon}
										<Icon class="w-4.5 h-4.5" />
									{/if}
								</div>
								<div class="flex flex-col">
									<span
										class="text-[13px] font-bold text-[#141522] group-hover:text-brand transition-colors line-clamp-1"
										>{collection.name}</span
									>
									<span class="text-[11px] font-medium text-gray-400 mt-0.5"
										>{collection.count} bookmarks</span
									>
								</div>
							</div>
							<ChevronDown
								class="w-3.5 h-3.5 text-slate-200 -rotate-90 group-hover:text-brand transition-all"
							/>
						</button>
					{:else}
						<Empty title="No collections" message="You haven't created any collections yet." icon={Folder} compact />
					{/each}
					<button
						class="w-full h-11 border-2 border-dashed border-slate-100 rounded-xl text-[12px] font-bold text-slate-400 hover:border-brand/40 hover:text-brand hover:bg-brand-muted/10 transition-all flex items-center justify-center gap-2 mt-2"
					>
						+ Create new collection
					</button>
				</div>
			</div>

			<!-- By Subject (Match Dashboard Progress Style) -->
			<div
				class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-fit antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300"
			>
				<div class="pb-4 mb-4 border-b border-slate-200/60">
					<h3 class="text-[15px] font-semibold tracking-wide text-[#141522]">
						Subject Performance
					</h3>
				</div>
				<div class="space-y-6">
					{#each data.subjectPerformance as subject}
						<div class="space-y-2 group">
							<div
								class="flex items-center justify-between text-[11px] font-bold uppercase tracking-tight"
							>
								<span
									class="text-slate-600 group-hover:text-brand transition-colors"
									>{subject.name}</span
								>
								<Badge
									variant="outline"
									class="text-[10px] font-black border-none text-slate-400 bg-slate-50 group-hover:bg-brand-muted group-hover:text-brand px-1.5 py-0 rounded"
									>{subject.count}</Badge
								>
							</div>
							<div
								class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
							>
								<div
									class="h-full {subject.color} rounded-full transition-all duration-1000 shadow-sm"
									style="width: {subject.percentage}%"
								></div>
							</div>
						</div>
					{:else}
						<Empty title="No performance data" message="No performance metrics available." icon={Folder} compact />
					{/each}
				</div>
			</div>

			<!-- AI Tip Card (Match Dashboard Summary Box) -->
			<div
				class="bg-[#0b3b6c] rounded-2xl p-5 text-white space-y-4 relative overflow-hidden group border border-white/10 hover:shadow-xl transition-all duration-500"
			>
				<div
					class="absolute -right-6 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform"
				></div>

				<div class="flex items-center gap-2 relative z-10">
					<div
						class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20"
					>
						<Sparkles class="w-3.5 h-3.5 text-white/90" />
					</div>
					<span
						class="text-[10px] font-black uppercase tracking-widest text-blue-200"
						>AI Study Tip</span
					>
				</div>
				<p
					class="text-[12px] font-medium leading-relaxed text-white/80 relative z-10 antialiased"
				>
					You haven't reviewed 12 Chemistry bookmarks in <span
						class="text-white font-black underline decoration-blue-400 underline-offset-4"
						>5 days</span
					>. Spaced repetition improves long-term retention by
					<span class="text-blue-300 font-bold">80%</span>.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.leading-extra-relaxed) {
		line-height: 1.8;
	}
</style>
