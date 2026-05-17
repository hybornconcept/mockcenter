<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import {
		Image,
		Shuffle,
		RotateCcw,
		Database,
		FileText,
		Move,
		Zap,
		LayoutGrid,
		Clock,
		Timer,
		Bot,
		BookOpen,
		Target,
		GraduationCap,
		Book,
	} from "@lucide/svelte";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	let { data } = $props();
	// Legacy settings
	let shuffle = $state(true);
	let redemption = $state(false);
	let skip = $state(true);

	// CBT Slider Arrays
	let numQuestionsArr = $state([20]);
	let durationArr = $state([20]);
	let passMarkArr = $state([40]);
	let questionsPerPageArr = $state([5]);

	// Derived primitives for easy access
	let numQuestions = $derived(
		Array.isArray(numQuestionsArr) ? numQuestionsArr[0] : numQuestionsArr,
	);
	let duration = $derived(
		Array.isArray(durationArr) ? durationArr[0] : durationArr,
	);
	let passMark = $derived(
		Array.isArray(passMarkArr) ? passMarkArr[0] : passMarkArr,
	);
	let questionsPerPage = $derived(
		Array.isArray(questionsPerPageArr)
			? questionsPerPageArr[0]
			: questionsPerPageArr,
	);

	let subjectName = $derived(
		$page.url.searchParams.get("subjectName") || "Biology",
	);

	let subjectThumbnail = $derived(data.subjectThumbnail);
	let subjectMeta = $derived(data.subjectMeta);

	let practiceMode = $state("timed"); // timed, practice, speed
	let isAiFocus = $state(true);

	let selectedExamTypes = $state(["JAMB / UTME"]);
	let examTypes = ["JAMB / UTME", "WAEC / SSCE", "NECO", "Post-UTME"];

	function toggleExamType(type: string) {
		if (selectedExamTypes.includes(type)) {
			if (selectedExamTypes.length > 1) {
				selectedExamTypes = selectedExamTypes.filter((t) => t !== type);
			}
		} else {
			selectedExamTypes = [...selectedExamTypes, type];
		}
	}

	let selectedYears = $state([2024]);

	let loading = $state(false);

	async function startSession() {
		const examId =
			$page.url.searchParams.get("examId") ||
			"00000000-0000-0000-0000-000000000000";
		const subjectId =
			$page.url.searchParams.get("subjectId") ||
			"00000000-0000-0000-0000-000000000000";

		loading = true;
		try {
			const res = await fetch("/api/practice/start", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					examId,
					subjectIds: [subjectId],
					totalQuestions: numQuestions,
				}),
			});
			const result = await res.json();
			if (result.success && result.data?.session?.id) {
				const query = new URLSearchParams({
					mode: isAiFocus ? `${practiceMode},ai` : practiceMode,
					duration: duration.toString(),
					questionsPerPage: questionsPerPage.toString(),
					passMark: passMark.toString(),
					shuffle: shuffle.toString(),
					redemption: redemption.toString(),
					skip: skip.toString(),
					subjectName: subjectName,
					examType:
						selectedExamTypes.length > 0
							? selectedExamTypes[0].split(" / ")[0]
							: "",
					year:
						selectedYears.length > 0
							? selectedYears.length === 1
								? `${selectedYears[0]}`
								: `${Math.min(...selectedYears)} – ${Math.max(...selectedYears)}`
							: "",
				});
				goto(`/quiz/${result.data.session.id}?${query.toString()}`);
			} else {
				alert(result.message || "Failed to start practice");
			}
		} catch (err) {
			console.error(err);
			alert("An error occurred while starting the practice.");
		} finally {
			loading = false;
		}
	}
</script>

{#snippet summaryRow(Icon: any, label: string, value: string)}
	<div class="flex items-center gap-6 justify-between py-3">
		<div class="flex items-center gap-3.5">
			<Icon class="w-4 h-4 text-brand/60" />
			<span class="text-[12.5px] text-slate-500 font-semibold tracking-tight"
				>{label}</span
			>
		</div>
		<span class="text-[12.5px] font-bold text-brand-dark tracking-tight"
			>{value}</span
		>
	</div>
{/snippet}

{#snippet sectionHeader(num: string, title: string, subtitle: string)}
	<div class="flex items-center gap-3">
		<div
			class="w-6 h-6 rounded-lg bg-brand text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-brand/20"
		>
			{num}
		</div>
		<div>
			<h4 class="font-bold text-[14px] text-slate-900 leading-none">{title}</h4>
			<p class="text-[10px] text-slate-400 font-medium mt-1">{subtitle}</p>
		</div>
	</div>
{/snippet}

{#snippet examTypeBtn(type: string)}
	{@const isSelected = selectedExamTypes.includes(type)}
	{@const Icon =
		type === "JAMB / UTME"
			? GraduationCap
			: type === "WAEC / SSCE"
				? Book
				: type === "NECO"
					? FileText
					: BookOpen}
	<button
		onclick={() => toggleExamType(type)}
		class="px-3 py-2 border rounded-lg text-[12px] flex items-center gap-3 transition-all duration-200 {isSelected
			? 'border-brand bg-brand/5 text-brand '
			: 'border-slate-200 text-slate-400 hover:border-slate-200  font-normal hover:bg-slate-50 bg-slate-50/50'}"
	>
		<div
			class="w-7 h-7 rounded-lg flex items-center justify-center {isSelected
				? 'bg-brand text-white'
				: 'bg-white text-slate-300'} transition-colors shadow-sm"
		>
			<Icon class="w-3.5 h-3.5" />
		</div>
		<span class="flex-1 text-left">{type}</span>
	</button>
{/snippet}

{#snippet configSlider(
	id: string,
	label: string,
	unit: string,
	value: number[],
	onValueChange: (v: number[]) => void,
	min: number,
	max: number,
	display: string,
)}
	<div class="flex items-center justify-between gap-6">
		<div class="w-1/3">
			<label for={id} class="text-[13px] font-medium text-slate-600 block"
				>{label}</label
			>
			{#if unit}
				<span class="text-[11px] text-slate-400 font-medium">{unit}</span>
			{/if}
		</div>
		<Slider
			{value}
			{onValueChange}
			{max}
			{min}
			type="single"
			class="flex-1 w-full"
		/>
		<span
			class="text-[13px] font-bold text-brand w-12 text-right whitespace-nowrap"
			>{display}</span
		>
	</div>
{/snippet}

{#snippet tuningRow(
	id: string,
	label: string,
	Icon: any,
	value: boolean,
	onToggle: (v: boolean) => void,
	colorClass: string = "bg-brand",
)}
	<div
		class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:border-brand/20"
	>
		<div class="flex items-center gap-3">
			<div
				class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors"
			>
				<Icon class="w-4 h-4" />
			</div>
			<label
				for={id}
				class="text-[12px] font-bold text-slate-700 cursor-pointer"
				>{label}</label
			>
		</div>
		<Switch
			{id}
			checked={value}
			onCheckedChange={onToggle}
			class="scale-125 origin-right data-[state=checked]:{colorClass}"
		/>
	</div>
{/snippet}

<div class="space-y-6 pt-0">
	<div class="w-full flex flex-col xl:flex-row items-start">
		<!-- Left Panel: Preview/Details -->
		<div class="w-full xl:w-[53.5%] px-6 pb-6 lg:px-4 lg:pb-4 pt-0">
			<div class="max-w-3xl mx-auto space-y-8 xl:pr-6">
				<!-- Subject Detail Card -->
				<Card.Root
					class="overflow-hidden border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] bg-white p-0"
				>
					<!-- Top Part: Image -->
					<div
						class="relative aspect-[16/7] overflow-hidden group rounded-t-[24px]"
					>
						{#if subjectThumbnail}
							<img
								src={subjectThumbnail}
								alt="{subjectName} Banner"
								class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div
								class="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center"
							>
								<span class="text-5xl font-black text-brand/20"
									>{subjectName.slice(0, 2).toUpperCase()}</span
								>
							</div>
						{/if}

						<div
							class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
						></div>

						<div
							class="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
						>
							<Button
								variant="secondary"
								size="sm"
								class="gap-1.5 bg-white/90 backdrop-blur-md shadow-sm hover:bg-white border-0 text-xs font-bold h-8 rounded-lg text-slate-700 px-3"
							>
								<Image class="w-3.5 h-3.5" /> Update thumbnail
							</Button>
							<Button
								variant="secondary"
								size="sm"
								class="gap-1.5 bg-white/90 backdrop-blur-md shadow-sm hover:bg-white border-0 text-xs font-bold h-8 rounded-lg text-slate-700 px-3"
							>
								<Move class="w-3.5 h-3.5" /> Reposition
							</Button>
						</div>

						<!-- Floating Icon -->
						<div
							class="absolute -bottom-6 left-8 w-16 h-16 {subjectMeta.iconColor} rounded-2xl border-[5px] border-white shadow-lg flex items-center justify-center z-10"
						>
							<FileText class="w-8 h-8 text-white stroke-[2.5]" />
						</div>
					</div>

					<!-- Bottom Part: Text -->
					<div class="p-6 pt-5 space-y-4">
						<div class="space-y-2">
							<h2
								class="text-[24px] font-black text-slate-900 tracking-tight leading-[1.1]"
							>
								{subjectMeta.title}
							</h2>

							<div class="flex flex-wrap items-center gap-y-3 gap-x-6">
								<div class="flex items-center gap-3">
									<div class="flex gap-2">
										<Badge
											class="bg-[#E0F2FE] text-[#0369A1] hover:bg-[#E0F2FE] rounded-lg text-[11px] font-bold px-3 py-1 border-0"
											>{subjectMeta.category}</Badge
										>
										<Badge
											class="bg-[#F0F9FF] text-[#0369A1] hover:bg-[#F0F9FF] rounded-lg text-[11px] font-bold px-3 py-1 border-0"
											>JAMB / WAEC</Badge
										>
									</div>
								</div>
							</div>
						</div>
						<div
							class="prose prose-slate max-w-none text-slate-500 text-[13px] font-medium leading-relaxed border-t border-slate-50 pt-4"
						>
							<p>{subjectMeta.description}</p>
							{#if data.subjectStats?.totalQuestions > 0}
								<div class="mt-3">
									<Badge
										class="bg-brand/10 text-brand hover:bg-brand/10 rounded-lg text-[11px] font-bold px-3 py-1 border-0"
									>
										{data.subjectStats.totalQuestions.toLocaleString()} questions
										available in the database.
									</Badge>
								</div>
							{/if}
						</div>

						<!-- Merged Session Summary Section -->
						<div class="pt-4 border-t border-slate-100 space-y-4">
							<div class="flex items-center gap-3">
								<div
									class="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center shadow-md shadow-brand/10"
								>
									<Database class="w-3.5 h-3.5" />
								</div>
								<div>
									<h4
										class="font-black text-[15px] text-slate-900 leading-none"
									>
										Session summary
									</h4>
									<p
										class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1"
									>
										Configuration overview
									</p>
								</div>
							</div>

							<!-- Properties -->
							<div
								class="bg-brand/5 rounded-2xl p-4 divide-y divide-slate-200/50 border border-slate-100/50 shadow-sm"
							>
								{@render summaryRow(Book, "Subject", subjectName)}
								{@render summaryRow(
									GraduationCap,
									"Exam type",
									selectedExamTypes.length > 0
										? selectedExamTypes[0].split(" / ")[0] +
												(selectedExamTypes.length > 1
													? ` +${selectedExamTypes.length - 1}`
													: "")
										: "None",
								)}
								{@render summaryRow(
									Clock,
									"Year(s)",
									selectedYears.length > 0
										? `${Math.min(...selectedYears)} – ${Math.max(...selectedYears)}`
										: "None",
								)}
								{@render summaryRow(
									Target,
									"Questions",
									`${numQuestions} questions`,
								)}
								{@render summaryRow(
									LayoutGrid,
									"Per page",
									`${questionsPerPage} Questions`,
								)}
								{@render summaryRow(Timer, "Duration", `${duration} min`)}
								{@render summaryRow(
									practiceMode === "timed" || practiceMode === "speed"
										? Timer
										: BookOpen,
									"Mode",
									isAiFocus
										? practiceMode === "timed"
											? "Timed Mode \u00A0|\u00A0 AI Focus"
											: practiceMode === "practice"
												? "Practice Mode \u00A0|\u00A0 AI Focus"
												: "Speed Drill \u00A0|\u00A0 AI Focus"
										: practiceMode === "timed"
											? "Timed Mode"
											: practiceMode === "practice"
												? "Practice Mode"
												: "Speed Drill",
								)}
							</div>

							<!-- Cost Breakdown -->
							<!-- <div
								class="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 shadow-sm"
							>
								<div class="flex items-center justify-between text-[13px]">
									<span class="text-slate-500 font-bold">Questions</span>
									<span class="text-slate-900 font-black"
										>{numQuestions} × 2 credits</span
									>
								</div>
								<div class="flex items-center justify-between text-[13px]">
									<span class="text-slate-500 font-bold">Your balance</span>
									<span class="text-slate-900 font-black">240 credits</span>
								</div>
								<hr class="border-slate-200/60 w-full my-2" />
								<div class="flex items-center justify-between">
									<span class="font-black text-slate-900 text-[15px]"
										>Total cost</span
									>
									<span class="font-black text-brand text-[18px]"
										>{numQuestions * 2} credits</span
									>
								</div>
							</div> -->

							<!-- Tip -->
							<div
								class="bg-[#EEF4FF] border border-[#D6E4FB] rounded-2xl p-4 text-[12px] leading-relaxed text-[#1e5bbb] shadow-sm flex items-start gap-3"
							>
								<Bot class="w-[18px] h-[18px] mt-0.5 shrink-0" />
								<span
									><strong class="font-black text-[#1a4b9c]">Tip:</strong>
									Configure your session below and press Start to begin practising
									{subjectName}.</span
								>
							</div>
						</div>
					</div>
				</Card.Root>
			</div>
		</div>

		<!-- Right Panel: Settings (Merged with content) -->
		<div
			class="w-full xl:w-[46.5%] px-6 pb-6 lg:px-4 lg:pb-4 pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 bg-slate-50/30"
		>
			<div class="space-y-6">
				<!-- Section 2: Select exam type -->
				<Card.Root
					class="bg-white rounded-2xl border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4"
				>
					<div class="flex items-center justify-between">
						{@render sectionHeader(
							"1",
							"Select exam type",
							"Primary examination category",
						)}

						<div class="flex gap-1.5">
							<button
								onclick={() => (selectedExamTypes = [...examTypes])}
								class="px-3 py-1.5 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all bg-white shadow-sm"
								>Select all</button
							>
							<button
								onclick={() => (selectedExamTypes = [examTypes[0]])}
								class="px-3 py-1.5 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all bg-white shadow-sm"
								>Reset</button
							>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
						{#each examTypes as type}
							{@render examTypeBtn(type)}
						{/each}
					</div>
				</Card.Root>

				<!-- Section 2: Session settings (spans full width on medium screens) -->
				<Card.Root
					class="bg-white rounded-xl border-slate-200 p-5 shadow-sm space-y-4 xl:col-span-2"
				>
					<div class="flex items-center justify-between">
						{@render sectionHeader(
							"2",
							"Session settings",
							"Configure your session parameters",
						)}
						<button
							onclick={() => {
								numQuestionsArr = [20];
								durationArr = [20];
								passMarkArr = [40];
								questionsPerPageArr = [5];
							}}
							class="px-3 py-1.5 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all bg-white shadow-sm"
							>Reset</button
						>
					</div>

					<div class="space-y-3 px-1">
						{@render configSlider(
							"numQuestions",
							"Number of questions",
							"",
							numQuestionsArr,
							(v) => (numQuestionsArr = v),
							10,
							100,
							`${numQuestions}`,
						)}

						{@render configSlider(
							"duration",
							"Duration for test",
							"(mins)",
							durationArr,
							(v) => (durationArr = v),
							0,
							180,
							`${duration} min`,
						)}

						{@render configSlider(
							"passMark",
							"Pass mark",
							"(Min. score)",
							passMarkArr,
							(v) => (passMarkArr = v),
							0,
							100,
							`${passMark}%`,
						)}

						{@render configSlider(
							"questionsPerPage",
							"Questions per page",
							"",
							questionsPerPageArr,
							(v) => (questionsPerPageArr = v),
							1,
							10,
							`${questionsPerPage}`,
						)}
					</div>

					<div class="border-t border-slate-100 pt-3">
						<div class="flex items-center justify-between mb-3">
							<h5
								class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
							>
								Fine-tuning
							</h5>
							<button
								onclick={() => {
									shuffle = true;
									redemption = false;
									skip = true;
								}}
								class="px-3 py-1.5 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all bg-white shadow-sm"
								>Reset</button
							>
						</div>

						<div class="grid grid-cols-1 gap-2">
							<div
								class="bg-slate-50/50 rounded-2xl border border-slate-100 p-3 space-y-3"
							>
								<div class="flex items-center justify-between">
									<h6
										class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
									>
										Question Logic
									</h6>
									<LayoutGrid class="w-3.5 h-3.5 text-slate-300" />
								</div>

								<div class="flex flex-col gap-1.5">
									{@render tuningRow(
										"shuffle",
										"Shuffle questions",
										Shuffle,
										shuffle,
										(v) => (shuffle = v),
									)}
									{@render tuningRow(
										"redemption",
										"Redemption mode",
										RotateCcw,
										redemption,
										(v) => (redemption = v),
									)}
									{@render tuningRow(
										"skip",
										"Allow skipping",
										Zap,
										skip,
										(v) => (skip = v),
									)}
								</div>
							</div>
						</div>
					</div>

					<div class="border-t border-slate-100 pt-3">
						<div class="flex items-center justify-between mb-3">
							<h5
								class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
							>
								Practice Mode
							</h5>
							<button
								onclick={() => {
									practiceMode = "timed";
									isAiFocus = true;
								}}
								class="px-3 py-1.5 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all bg-white shadow-sm"
								>Reset</button
							>
						</div>

						<div class="grid grid-cols-2 gap-3">
							{#snippet practiceBtn(
								id: string,
								title: string,
								desc: string,
								Icon: any,
							)}
								<button
									onclick={() => {
										if (id === "ai") {
											isAiFocus = !isAiFocus;
										} else {
											practiceMode = id;
										}
									}}
									class="text-left p-3.5 rounded-xl border flex flex-col h-full {(
										id === 'ai' ? isAiFocus : practiceMode === id
									)
										? 'border-brand bg-brand/10'
										: 'border-slate-200 hover:border-slate-300 bg-white'} transition-all group"
								>
									<div
										class="flex items-center gap-1.5 mb-1 {(
											id === 'ai' ? isAiFocus : practiceMode === id
										)
											? 'text-brand'
											: 'text-slate-900 group-hover:text-brand'}"
									>
										<Icon class="w-4 h-4" />
										<span class="font-bold text-[13px]">{title}</span>
									</div>
									<p
										class="text-[11px] {practiceMode === id
											? 'text-brand/80'
											: 'text-slate-500'} leading-relaxed"
									>
										{desc}
									</p>
								</button>
							{/snippet}

							{@render practiceBtn(
								"timed",
								"Timed mode",
								"Countdown timer runs. Simulates real exam pressure.",
								Timer,
							)}
							{@render practiceBtn(
								"practice",
								"Practice mode",
								"No timer. See answers immediately after each question.",
								BookOpen,
							)}
							{@render practiceBtn(
								"ai",
								"AI focus mode",
								"AI automatically identifies your weakest topics and selects questions from those areas.",
								Bot,
							)}
							{@render practiceBtn(
								"speed",
								"Speed drill",
								"60 seconds per question. Builds exam speed.",
								Zap,
							)}
						</div>
					</div>
				</Card.Root>
			</div>
		</div>
	</div>

	<!-- Sticky Global CTA -->
	<div class="px-6 lg:px-4 pb-12 w-full mt-4">
		<button
			onclick={startSession}
			disabled={loading}
			class="w-full bg-brand hover:bg-brand/90 text-white font-extrabold text-[16px] py-4 lg:py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-75 disabled:cursor-wait"
		>
			{#if loading}
				Starting...
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					><polygon points="5 3 19 12 5 21 5 3"></polygon></svg
				>
				Start Practice Session
			{/if}
		</button>
	</div>
</div>
