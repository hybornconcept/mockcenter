<script lang="ts">
	import {
		Search,
		DownloadCloud,
		UploadCloud,
		Plus,
		Bell,
		Trash2,
		Edit3,
		Image as ImageIcon,
		XCircle,
		FileText,
		Layers,
		CheckSquare,
		BookOpen,
		LayoutList,
	} from "lucide-svelte";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	let { data } = $props();

	// -- State --
	let DB = $state(data.questions);
	let selectedIds = $state<number[]>([]);
	let searchQuery = $state("");
	let filterType = $state("");
	let filterDiff = $state("");
	let filterExam = $state("");
	let filterSub = $state("");
	let page = $state(1);
	const itemsPerPage = 10;

	let showAddModal = $state(false);
	let showImportModal = $state(false);

	// -- Derived Data --
	let filteredDB = $derived(
		DB.filter((q) => {
			if (
				searchQuery &&
				!q.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!(q.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
			)
				return false;
			if (filterType && q.type !== filterType) return false;
			if (filterDiff && q.diff !== filterDiff) return false;
			if (filterExam && q.exam !== filterExam) return false;
			if (filterSub && q.subject !== filterSub) return false;
			return true;
		}),
	);

	let totalPages = $derived(
		Math.max(1, Math.ceil(filteredDB.length / itemsPerPage)),
	);
	let paginatedDB = $derived(
		filteredDB.slice((page - 1) * itemsPerPage, page * itemsPerPage),
	);
	let allSelected = $derived(
		paginatedDB.length > 0 &&
			paginatedDB.every((q) => selectedIds.includes(q.id)),
	);

	// -- Stats --
	let totalQuestions = $derived(DB.length);
	let imgsCount = $derived(DB.filter((q) => q.img_url).length);
	let subCount = $derived(
		new Set(DB.map((q) => q.subject).filter(Boolean)).size,
	);
	let bulkCount = $derived(DB.filter((q) => q.bulk).length);

	function toggleSelect(id: number) {
		selectedIds = selectedIds.includes(id)
			? selectedIds.filter((i) => i !== id)
			: [...selectedIds, id];
	}
</script>

{#snippet kpiCard(title, value, Icon, colorClass, subtext, badgeText)}
	<div
		class="group relative h-[115px] overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-brand-muted/20 hover:shadow-lg"
	>
		<Icon
			class="absolute right-3 top-3 scale-125 opacity-10 transition-colors duration-500 group-hover:opacity-20 {colorClass}"
			stroke-width={1}
		/>
		<span
			class="relative z-10 text-[12px] font-medium tracking-tight text-gray-400"
			>{title}</span
		>
		<span
			class="relative z-10 block text-[26px] font-bold leading-none tracking-tight text-slate-800 transition-colors group-hover:text-brand"
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
{/snippet}

{#snippet questionRow(q)}
	<tr class="group transition-all hover:bg-slate-50/50">
		<td
			class="whitespace-nowrap py-4 pl-6 pr-2 text-center text-[11px] font-bold text-slate-400"
			>#{q.id}</td
		>
		<td class="py-4 px-3">
			<div class="flex flex-col gap-0.5">
				<span
					class="cursor-pointer text-[13px] font-semibold text-slate-800 leading-normal transition-colors group-hover:text-brand line-clamp-2"
					>{q.text}</span
				>
				<span
					class="text-[10px] font-bold uppercase tracking-wider text-slate-400 opacity-60"
					>Uploaded on: {q.date || "Mar 1, 2024"} · 10:30 AM</span
				>
			</div>
		</td>
		<td class="py-4 px-3 text-center">
			{#if q.img_url}
				<div
					class="mx-auto h-9 w-9 cursor-zoom-in overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm transition-transform hover:scale-110"
				>
					<img src={q.img_url} alt="" class="h-full w-full object-cover" />
				</div>
			{:else}
				<div
					class="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100/30 bg-slate-50/50"
				>
					<ImageIcon class="h-3.5 w-3.5 text-slate-300" stroke-width={1.2} />
				</div>
			{/if}
		</td>
		<td class="py-4 px-3">
			<Badge
				variant="secondary"
				class="rounded-md border-blue-100/30 bg-blue-50/50 px-2 py-0.5 text-[10px] font-semibold text-blue-600"
			>
				{q.type}
			</Badge>
		</td>
		<td class="py-4 px-3 text-[12px] font-medium text-slate-600">{q.subject}</td
		>
		<td
			class="whitespace-nowrap py-4 px-2 text-[12px] font-bold tracking-tight text-slate-700"
			>{q.exam}/{q.year}</td
		>
		<td class="py-4 pl-2 pr-6 text-right">
			<div
				class="flex items-center justify-end gap-2 transition-all duration-200"
			>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:border-brand/30 hover:text-brand hover:shadow-[0_0_12px_rgba(76,175,80,0.3)]"
					title="Edit"
				>
					<Edit3 class="h-3.5 w-3.5" stroke-width={1.5} />
				</button>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:border-red-100 hover:text-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]"
					title="Delete"
				>
					<Trash2 class="h-3.5 w-3.5" stroke-width={1.5} />
				</button>
			</div>
		</td>
	</tr>
{/snippet}

<header
	class="flex items-center justify-between mb-5 bg-white py-4 px-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-gray-100 -mx-8 w-[calc(100%+4rem)] z-10 sticky top-0 m-0"
>
	<div class="flex items-center gap-4">
		<div class="flex flex-col">
			<h2 class="text-[20px] font-bold text-[#141522] tracking-tight">
				Question Bank
			</h2>
			<div
				class="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mt-1"
			>
				<span>Manage questions for JAMB · WAEC · NECO · POST-UTME</span>
			</div>
		</div>
	</div>
	<div class="flex items-center gap-5">
		<!-- Notifications -->
		<button
			class="relative text-gray-400 hover:text-brand transition-colors shadow-sm"
		>
			<div
				class="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm"
			>
				<Bell class="w-4 h-4" stroke-width={1.2} />
			</div>
			<span
				class="absolute top-0 right-0 w-2.5 h-2.5 bg-[#e44d4d] rounded-full border-2 border-white"
			></span>
		</button>

		<!-- Profile -->
		<div class="flex items-center gap-3 pl-2 cursor-pointer group">
			<div
				class="w-9 h-9 bg-brand/10 rounded-full flex items-center justify-center text-[12px] font-bold text-brand border-2 border-white shadow-sm transition-transform group-hover:scale-105"
			>
				AD
			</div>
			<span class="text-[13px] font-bold text-[#141522]">Admin Console</span>
		</div>
	</div>
</header>

<main class="w-full flex-1 max-w-[1400px] mx-auto pb-10">
	<!-- Actions -->
	<div class="flex justify-end gap-2 mb-4">
		<button
			class="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all shadow-sm group/btn"
		>
			<DownloadCloud
				class="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-600"
			/>
			Export JSON
		</button>
		<button
			onclick={() => (showImportModal = true)}
			class="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold rounded-lg text-blue-700 bg-blue-50 border border-blue-100/50 hover:bg-blue-100/80 transition-all shadow-sm group/btn"
		>
			<UploadCloud
				class="w-3.5 h-3.5 text-blue-500 group-hover/btn:text-blue-600"
			/>
			CSV Import
		</button>
		<button
			onclick={() => (showAddModal = true)}
			class="flex items-center gap-2 px-3.5 py-1.5 text-[12px] font-bold rounded-lg text-white bg-brand border border-brand/90 hover:bg-[#2c530c] hover:shadow-md transition-all shadow-sm group/btn"
		>
			<Plus class="w-3.5 h-3.5 text-white/80 group-hover/btn:text-white" />
			Add Question
		</button>
	</div>

	<!-- KPI ROW -->
	<div class="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
		{@render kpiCard(
			"Total Questions",
			totalQuestions,
			Layers,
			"text-brand",
			"in question bank",
			"Live",
		)}
		{@render kpiCard(
			"With Images",
			imgsCount,
			ImageIcon,
			"text-indigo-500",
			"cloud assets",
			"Cloudflare",
		)}
		{@render kpiCard(
			"Subjects",
			subCount,
			BookOpen,
			"text-blue-500",
			"categories",
			"Active",
		)}
		{@render kpiCard(
			"Bulk Imported",
			bulkCount,
			UploadCloud,
			"text-amber-500",
			"file uploads",
			"CSV/XLSX",
		)}
		{@render kpiCard(
			"Avg Difficulty",
			"Med",
			CheckSquare,
			"text-emerald-500",
			"across bank",
			"Balanced",
		)}
	</div>

	<!-- WORKSPACE AREA: Actions, Table and side content -->

	<div class="w-full lg:grid lg:grid-cols-[1fr_26.5%] gap-4 items-start">
		<!-- Main Table Section -->
		<div
			class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-300 w-full"
		>
			<!-- Header / Controls -->
			<div class="px-6 py-6 border-b border-gray-100 flex flex-col gap-6">
				<!-- Title Row -->
				<div class="flex items-center justify-between">
					<div class="flex flex-col gap-1">
						<h3 class="text-[18px] font-semibold text-[#141522] tracking-tight">
							All Questions
						</h3>
						<p class="text-[12px] text-slate-400 font-medium">
							Browse and manage your question library
						</p>
					</div>
					<Badge
						variant="outline"
						class="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[11px] font-semibold border-slate-200 shadow-sm lowercase"
					>
						{filteredDB.length} questions
					</Badge>
				</div>

				<!-- Search & Filter Area -->
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<!-- Search -->
						<div class="relative flex items-center flex-1 group/search">
							<Search
								class="absolute left-4 w-4 h-4 text-slate-400 group-focus-within/search:text-brand transition-colors"
								stroke-width={1.5}
							/>
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search questions, subjects, exam types..."
								class="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-[#141522] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all shadow-sm"
							/>
						</div>

						<!-- Filter Actions -->
						<div class="flex items-center gap-2">
							<Select.Root type="single" bind:value={filterType}>
								<Select.Trigger
									class="w-[140px] h-11 px-4 bg-white border-slate-200 rounded-xl text-[13px] font-medium shadow-sm"
								>
									{filterType || "All types"}
								</Select.Trigger>
								<Select.Content
									class="rounded-xl border-slate-200 shadow-xl overflow-hidden"
								>
									<Select.Item value="" class="text-[13px] font-medium py-2"
										>All types</Select.Item
									>
									<Select.Item value="MCQ" class="text-[13px] font-medium py-2"
										>MCQ</Select.Item
									>
									<Select.Item value="T/F" class="text-[13px] font-medium py-2"
										>True/False</Select.Item
									>
									<Select.Item value="FIB" class="text-[13px] font-medium py-2"
										>Fill in Blank</Select.Item
									>
									<Select.Item
										value="Theory"
										class="text-[13px] font-medium py-2">Theory</Select.Item
									>
								</Select.Content>
							</Select.Root>

							<Select.Root type="single" bind:value={filterDiff}>
								<Select.Trigger
									class="w-[140px] h-11 px-4 bg-white border-slate-200 rounded-xl text-[13px] font-medium shadow-sm"
								>
									{filterDiff || "Difficulty"}
								</Select.Trigger>
								<Select.Content
									class="rounded-xl border-slate-200 shadow-xl overflow-hidden"
								>
									<Select.Item value="" class="text-[13px] font-medium py-2"
										>All difficulties</Select.Item
									>
									<Select.Item
										value="Easy"
										class="text-[13px] font-medium py-2 text-emerald-600"
										>Easy</Select.Item
									>
									<Select.Item
										value="Medium"
										class="text-[13px] font-medium py-2 text-amber-600"
										>Medium</Select.Item
									>
									<Select.Item
										value="Hard"
										class="text-[13px] font-medium py-2 text-red-600"
										>Hard</Select.Item
									>
								</Select.Content>
							</Select.Root>

							<Select.Root type="single" bind:value={filterExam}>
								<Select.Trigger
									class="w-[140px] h-11 px-4 bg-white border-slate-200 rounded-xl text-[13px] font-medium shadow-sm"
								>
									{filterExam || "All exams"}
								</Select.Trigger>
								<Select.Content
									class="rounded-xl border-slate-200 shadow-xl overflow-hidden"
								>
									<Select.Item value="" class="text-[13px] font-medium py-2"
										>All exams</Select.Item
									>
									<Select.Item value="JAMB" class="text-[13px] font-medium py-2"
										>JAMB</Select.Item
									>
									<Select.Item value="WAEC" class="text-[13px] font-medium py-2"
										>WAEC</Select.Item
									>
									<Select.Item value="NECO" class="text-[13px] font-medium py-2"
										>NECO</Select.Item
									>
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<!-- Subject Pills -->
					<div class="flex flex-wrap items-center gap-2">
						<button
							onclick={() => (filterSub = "")}
							class="rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all {filterSub ===
							''
								? 'border-brand bg-brand text-white shadow-md'
								: 'border-slate-200 bg-white text-slate-500 shadow-sm hover:border-brand hover:text-brand'}"
						>
							All
						</button>
						{#each data.subjects as sub}
							<button
								onclick={() => (filterSub = sub)}
								class="rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all {filterSub ===
								sub
									? 'border-brand bg-brand text-white shadow-md'
									: 'border-slate-200 bg-white text-slate-500 shadow-sm hover:border-brand hover:text-brand'}"
							>
								{sub}
							</button>
						{/each}
					</div>
				</div>

				<!-- Table -->
				<div class="">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr
								class="bg-gray-50/20 border-b border-gray-100 uppercase tracking-widest text-[10px] font-semibold text-slate-400"
							>
								<th class="py-4 pl-6 pr-2 w-14 text-center">#</th>
								<th class="py-4 px-3">Question</th>
								<th class="py-4 px-2 text-center w-20">Image</th>
								<th class="py-4 px-2 w-24">Type</th>
								<th class="py-4 px-2 w-28">Subject</th>
								<th class="py-4 px-2 w-32 whitespace-nowrap">Exam/Year</th>
								<th class="py-4 pl-2 pr-6 text-right w-24">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50 tracking-tight">
							{#each paginatedDB as q}
								{@render questionRow(q)}
							{:else}
								<tr>
									<td colspan="7" class="text-center py-16">
										<div class="flex flex-col items-center justify-center">
											<LayoutList
												class="w-12 h-12 text-slate-200 mb-3"
												stroke-width={1}
											/>
											<p class="text-[14px] font-semibold text-[#141522]">
												No questions found
											</p>
											<p class="text-[12px] font-medium text-gray-400 mt-1">
												Try adjusting your filters or search query.
											</p>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Paginator -->
				{#if filteredDB.length > 0}
					<div
						class="px-5 py-3 border-t border-gray-100 flex items-center justify-between"
					>
						<span class="text-[11px] font-medium text-gray-400">
							Showing {(page - 1) * itemsPerPage + 1}–{Math.min(
								page * itemsPerPage,
								filteredDB.length,
							)} of {filteredDB.length} records
						</span>
						<div class="flex gap-1">
							<button
								onclick={() => page > 1 && page--}
								disabled={page === 1}
								class="px-2.5 py-1.5 rounded border border-slate-200 text-[11px] font-medium text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
							>
								Prev
							</button>
							{#each Array(totalPages) as _, idx}
								<button
									onclick={() => (page = idx + 1)}
									class="px-2.5 py-1.5 rounded border text-[11px] font-semibold transition-colors min-w-[28px] text-center {page ===
									idx + 1
										? 'text-brand-dark bg-brand-muted border-brand/20'
										: 'bg-white text-slate-500 border-transparent hover:bg-slate-50'}"
								>
									{idx + 1}
								</button>
							{/each}
							<button
								onclick={() => page < totalPages && page++}
								disabled={page === totalPages}
								class="px-2.5 py-1.5 rounded border border-slate-200 text-[11px] font-medium text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Side Stats Column -->
		<div class="w-full flex gap-6 flex-col lg:sticky lg:top-[120px]">
			<!-- Subject Balance Card -->
			<div
				class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300"
			>
				<div
					class="flex items-center justify-between pb-4 mb-5 border-b border-slate-50"
				>
					<h3 class="text-[15px] font-bold tracking-tight text-[#141522]">
						Subject Balance
					</h3>
					<Badge
						variant="outline"
						class="text-[11px] border-emerald-100 text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-lg font-bold"
						>4 Active</Badge
					>
				</div>

				<div class="flex flex-col gap-6">
					{#each [{ name: "Physics", short: "PH", count: 120, colors: "bg-blue-500", ring: "border-blue-100", bg: "bg-blue-50/50" }, { name: "Biology", short: "BI", count: 85, colors: "bg-brand", ring: "border-brand/20", bg: "bg-brand/5" }, { name: "Chemistry", short: "CH", count: 45, colors: "bg-amber-500", ring: "border-amber-100", bg: "bg-amber-50/50" }, { name: "History", short: "HI", count: 22, colors: "bg-indigo-500", ring: "border-indigo-100", bg: "bg-indigo-50/50" }] as s}
						{@const pct = Math.min(100, Math.round((s.count / 150) * 100))}
						<div class="group cursor-default">
							<div class="flex items-center justify-between mb-2.5">
								<div class="flex items-center gap-3">
									<div
										class="w-9 h-9 rounded-full border-2 {s.ring} {s.bg} flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-sm group-hover:scale-110 transition-transform"
									>
										{s.short}
									</div>
									<span
										class="text-[13px] font-normal text-slate-700 group-hover:text-brand transition-colors"
										>{s.name}</span
									>
								</div>
								<div
									class="bg-brand/5 border border-brand/10 text-brand font-bold text-[11px] px-2 py-1 rounded-lg shadow-sm"
								>
									{s.count} q
								</div>
							</div>
							<div
								class="h-[6px] w-[calc(100%-48px)] bg-slate-50 rounded-full overflow-hidden relative ml-[48px]"
							>
								<div
									class="h-full rounded-full {s.colors} transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.05)]"
									style="width: {pct}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Breakdown Card -->
			<div
				class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col antialiased hover:border-brand/40 hover:shadow-lg transition-all duration-300"
			>
				<div
					class="flex items-center justify-between pb-4 mb-5 border-b border-slate-50"
				>
					<h3 class="text-[15px] font-bold tracking-tight text-[#141522]">
						Breakdown
					</h3>
					<Badge
						variant="outline"
						class="text-[10px] border-slate-100 text-slate-400 bg-slate-50/50 px-2 py-0.5 rounded-lg font-bold uppercase tracking-widest"
						>AI Metrics</Badge
					>
				</div>

				<div class="grid grid-cols-2 gap-5">
					<div class="flex flex-col gap-4">
						<span
							class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center opacity-70"
							>Difficulty</span
						>
						<div class="flex flex-col gap-2.5">
							{#each [{ name: "Easy", count: 110, c: "bg-emerald-500", ct: "text-emerald-700" }, { name: "Med", count: 80, c: "bg-amber-500", ct: "text-amber-700" }, { name: "Hard", count: 50, c: "bg-red-500", ct: "text-red-700" }] as d}
								{@const p = Math.round((d.count / 240) * 100)}
								<div
									class="flex items-center justify-between w-full relative h-[26px] group/item"
								>
									<div
										class="absolute inset-0 bg-slate-50 rounded-md overflow-hidden border border-slate-100/30"
									>
										<div
											class="h-full opacity-10 {d.c} group-hover/item:opacity-20 transition-opacity"
											style="width:{p}%"
										></div>
									</div>
									<span
										class="relative z-10 px-2.5 text-[10px] font-semibold text-slate-500"
										>{d.name}</span
									>
									<span
										class="relative z-10 px-2.5 text-[10px] font-bold {d.ct} opacity-80"
										>{d.count}</span
									>
								</div>
							{/each}
						</div>
					</div>
					<div class="flex flex-col gap-4">
						<span
							class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center opacity-70"
							>Types</span
						>
						<div class="flex flex-col gap-2.5">
							{#each [{ name: "MCQ", count: 150, c: "bg-blue-500", ct: "text-blue-700" }, { name: "T/F", count: 40, c: "bg-brand", ct: "text-brand-dark" }, { name: "FIB", count: 30, c: "bg-amber-500", ct: "text-amber-700" }] as t}
								{@const p = Math.round((t.count / 240) * 100)}
								<div
									class="flex items-center justify-between w-full relative h-[26px] group/item"
								>
									<div
										class="absolute inset-0 bg-slate-50 rounded-md overflow-hidden border border-slate-100/30"
									>
										<div
											class="h-full opacity-10 {t.c} group-hover/item:opacity-20 transition-opacity"
											style="width:{p}%"
										></div>
									</div>
									<span
										class="relative z-10 px-2.5 text-[10px] font-semibold text-slate-500"
										>{t.name}</span
									>
									<span
										class="relative z-10 px-2.5 text-[10px] font-bold {t.ct} opacity-80"
										>{t.count}</span
									>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<!-- ADD QUESTION SHEET -->
<Sheet.Root bind:open={showAddModal}>
	<Sheet.Content
		side="right"
		class="sm:max-w-2xl p-0 bg-white border-l shadow-2xl overflow-hidden flex flex-col h-full"
	>
		<!-- Header -->
		<div
			class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10"
		>
			<div class="flex flex-col gap-0.5">
				<h2 class="text-lg font-bold text-[#141522]">Add New Question</h2>
				<p class="text-[11px] text-slate-400 font-medium">Create a single question manually</p>
			</div>
		</div>

		<!-- Body -->
		<div class="flex-1 px-6 py-6 overflow-y-auto">
			<div class="flex p-1 bg-slate-100/80 rounded-xl gap-1 mb-6">
				<button
					class="flex-1 py-2 text-[12px] font-semibold rounded-lg bg-white shadow-sm border border-slate-200/50 text-[#141522]"
					>MCQ</button
				>
				<button
					class="flex-1 py-2 text-[12px] font-semibold rounded-lg text-slate-500 hover:bg-white/50 transition-colors"
					>True / False</button
				>
				<button
					class="flex-1 py-2 text-[12px] font-semibold rounded-lg text-slate-500 hover:bg-white/50 transition-colors"
					>Fill in Blank</button
				>
				<button
					class="flex-1 py-2 text-[12px] font-semibold rounded-lg text-slate-500 hover:bg-white/50 transition-colors"
					>Theory</button
				>
			</div>

			<div class="flex flex-col gap-6">
				<div>
					<label
						for="question-text"
						class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
						>Question Text *</label
					>
					<textarea
						id="question-text"
						rows="4"
						placeholder="Type the question here..."
						class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-medium resize-none shadow-sm"
					></textarea>
				</div>

				<div>
					<div class="flex items-center gap-2 mb-2">
						<span
							class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest"
							>Answer Options</span
						>
						<span class="text-[10px] text-slate-400 font-medium"
							>(click letter to mark correct)</span
						>
					</div>
					<div class="flex flex-col gap-2.5">
						{#each ["A", "B", "C", "D"] as opt, idx}
							<div class="flex items-center gap-3 group/opt">
								<button
									class="w-8 h-8 rounded-full border-2 text-[12px] font-bold flex items-center justify-center shrink-0 transition-all {idx ===
									1
										? 'border-brand bg-brand-muted text-brand-dark'
										: 'border-slate-200 bg-slate-50 text-slate-400 hover:border-brand/40 group-hover/opt:border-brand/40'}"
								>
									{opt}
								</button>
								<input
									type="text"
									placeholder="Option {opt}"
									class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-medium shadow-sm"
								/>
							</div>
						{/each}
					</div>
				</div>

				<div class="h-[1px] w-full bg-slate-100 my-1"></div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
					<div>
						<label
							for="exam-select"
							class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
							>Exam</label
						>
						<select
							id="exam-select"
							class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-semibold shadow-sm"
						>
							<option>JAMB</option>
						</select>
					</div>
					<div>
						<label
							for="subject-select"
							class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
							>Subject</label
						>
						<select
							id="subject-select"
							class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-semibold shadow-sm"
						>
							<option>Biology</option>
						</select>
					</div>
					<div>
						<label
							for="diff-select"
							class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
							>Difficulty</label
						>
						<select
							id="diff-select"
							class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-semibold shadow-sm"
						>
							<option>Medium</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
					<div>
						<label
							for="marks-input"
							class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
							>Marks</label
						>
						<input
							id="marks-input"
							type="number"
							value="1"
							class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-medium shadow-sm"
						/>
					</div>
					<div>
						<label
							for="time-input"
							class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
							>Time (secs)</label
						>
						<input
							id="time-input"
							type="number"
							value="60"
							class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-medium shadow-sm"
						/>
					</div>
					<div>
						<label
							for="year-input"
							class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
							>Year (opt)</label
						>
						<input
							id="year-input"
							type="text"
							placeholder="e.g. 2023"
							class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-[#141522] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all font-medium shadow-sm"
						/>
					</div>
				</div>

				<div
					class="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:border-brand hover:bg-brand-muted/50 transition-all text-center group shadow-inner"
				>
					<ImageIcon
						class="w-10 h-10 text-slate-300 group-hover:text-brand mb-3 transition-colors"
						stroke-width={1.5}
					/>
					<p
						class="text-[14px] font-bold text-slate-600 group-hover:text-brand"
					>
						Upload Image Asset
					</p>
					<span class="text-[11px] text-slate-400 mt-2"
						>PNG, JPG up to 5MB · Shared with Cloudflare R2</span
					>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div
			class="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white"
		>
			<button
				onclick={() => (showAddModal = false)}
				class="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors shadow-sm"
			>
				Discard
			</button>
			<button
				class="px-8 py-2.5 rounded-xl bg-brand text-white font-bold text-[13px] hover:bg-[#2c530c] shadow-md transition-all active:scale-95"
			>
				Save Question
			</button>
		</div>
	</Sheet.Content>
</Sheet.Root>

<!-- BULK IMPORT SHEET -->
<Sheet.Root bind:open={showImportModal}>
	<Sheet.Content
		side="right"
		class="sm:max-w-md p-0 bg-white border-l shadow-2xl overflow-hidden flex flex-col h-full"
	>
		<!-- Header -->
		<div
			class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10"
		>
			<div class="flex flex-col gap-0.5">
				<h2 class="text-lg font-bold text-[#141522]">Bulk Import Questions</h2>
				<p class="text-[11px] text-slate-400 font-medium">Upload datasets via CSV or Excel</p>
			</div>
		</div>

		<div class="p-8 flex-1 overflow-y-auto">
			<div class="bg-brand-muted rounded-2xl p-5 mb-8 border border-brand/20 shadow-sm">
				<div class="flex items-center gap-2 mb-3">
					<div class="w-1.5 h-1.5 rounded-full bg-brand"></div>
					<h4 class="text-[12px] font-bold text-brand-dark">
						Required CSV columns
					</h4>
				</div>
				<code
					class="text-[11px] font-mono text-[#2c530c] leading-relaxed block break-all opacity-80"
				>
					question, type, opt_a, opt_b, opt_c, opt_d, correct, subject, exam,
					difficulty, marks, time_secs, year, explanation
				</code>
			</div>

			<div
				class="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:border-brand hover:bg-brand-muted/50 transition-all text-center group shadow-inner"
			>
				<FileText
					class="w-12 h-12 text-slate-300 group-hover:text-brand mb-4 transition-colors"
					stroke-width={1.5}
				/>
				<p class="text-[15px] font-bold text-[#141522] group-hover:text-brand">
					Upload source file
				</p>
				<span class="text-[12px] text-slate-400 mt-2"
					>Support for .csv and .xlsx (Max 500 rows)</span
				>
			</div>

			<div class="mt-8 text-center">
				<button
					class="px-6 py-3 rounded-xl border border-dashed border-slate-200 text-[12px] font-bold text-slate-500 hover:text-brand hover:border-brand/40 transition-all bg-white shadow-sm"
				>
					⬇ Download CSV Template
				</button>
			</div>
		</div>

		<div class="p-8 border-t border-gray-100 bg-slate-50/30">
			<button
				onclick={() => (showImportModal = false)}
				class="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors shadow-sm"
			>
				Cancel
			</button>
		</div>
	</Sheet.Content>
</Sheet.Root>


<style>
	:global(.lucide) {
		vector-effect: non-scaling-stroke;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
