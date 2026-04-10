<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import {
		X,
		Image,
		Shuffle,
		RotateCcw,
		SkipForward,
		Database,
		BadgeCheck,
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
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	// Legacy settings
	let shuffle = $state(true);
	let redemption = $state(false);
	let skip = $state(true);
	let adaptive = $state(false);
	let passUnit = $state("percent"); // percent | point

	// CBT Slider Arrays
	let numQuestionsArr = $state([20]);
	let timePerQuestionArr = $state([20]);
	let passMarkArr = $state([40]);
	let questionsPerPageArr = $state([5]);

	// Derived primitives for easy access
	let numQuestions = $derived(
		Array.isArray(numQuestionsArr) ? numQuestionsArr[0] : numQuestionsArr,
	);
	let timePerQuestion = $derived(
		Array.isArray(timePerQuestionArr)
			? timePerQuestionArr[0]
			: timePerQuestionArr,
	);
	let passMark = $derived(
		Array.isArray(passMarkArr) ? passMarkArr[0] : passMarkArr,
	);
	let questionsPerPage = $derived(
		Array.isArray(questionsPerPageArr)
			? questionsPerPageArr[0]
			: questionsPerPageArr,
	);

	let practiceMode = $state("ai"); // timed, practice, ai, speed

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
	let availableYears = [
		2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013,
		2012, 2011, 2010,
	];

	function toggleYear(year: number) {
		if (selectedYears.includes(year)) {
			selectedYears = selectedYears.filter((y) => y !== year);
		} else {
			selectedYears = [...selectedYears, year];
		}
	}
</script>

{#snippet summaryRow(Icon: any, label: string, value: string)}
	<div class="flex items-center gap-4 justify-between">
		<div class="flex items-center gap-3.5 mb-2">
			<Icon class="w-4 h-4 text-slate-400" />
			<span class="text-[12.5px] text-slate-500 font-semibold tracking-tight"
				>{label}</span
			>
		</div>
		<span class="text-[12.5px] font-bold text-slate-900 tracking-tight"
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
				class="w-8 h-8 rounded-lg {id === 'skip'
					? 'bg-amber-50 text-amber-500'
					: 'bg-slate-50 text-slate-400'} flex items-center justify-center"
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

<div class="space-y-10">
	<div class="w-full flex flex-col xl:flex-row items-start">
		<!-- Left Panel: Preview/Details -->
		<div class="w-full xl:w-1/2 p-6 lg:p-4">
			<div class="max-w-3xl mx-auto space-y-8 xl:pr-6">
				<!-- Banner Area -->
				<div
					class="group relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-[5.5/2] shadow-sm"
				>
					<div
						class="absolute inset-0 bg-gradient-to-br from-[#E0F2FE]/40 to-[#F0F9FF]/40"
					>
						<img src="/biology_course_banner_1775222551338.png"
							alt="Biology Banner"
							class="w-full h-full object-cover transition-transform duration-700" loading="lazy" />
					</div>

					<div
						class="absolute bottom-4 right-4 flex gap-2 opacity-100 transition-all"
					>
						<Button
							variant="secondary"
							size="sm"
							class="gap-1.5 bg-white shadow-sm hover:bg-slate-50 border border-slate-200 text-xs font-bold h-8 rounded-lg text-slate-700 px-3"
						>
							<Image class="w-3.5 h-3.5" /> Update thumbnail
						</Button>
						<Button
							variant="secondary"
							size="sm"
							class="gap-1.5 bg-white shadow-sm hover:bg-slate-50 border border-slate-200 text-xs font-bold h-8 rounded-lg text-slate-700 px-3"
						>
							<Move class="w-3.5 h-3.5" /> Reposition
						</Button>
					</div>

					<div
						class="absolute -bottom-6 left-8 w-16 h-16 bg-[#FBBF24] rounded-2xl border-[5px] border-white shadow-lg flex items-center justify-center z-10"
					>
						<FileText class="w-8 h-8 text-white stroke-[2.5]" />
					</div>
				</div>

				<div class="space-y-4">
					<div>
						<h2
							class="text-[28px] font-extrabold text-slate-900 mb-5 tracking-tight leading-tight"
						>
							Comprehensive Biology: Life Sciences & Ecosystems
						</h2>

						<div class="flex flex-wrap items-center gap-6 text-sm">
							<div class="flex items-center gap-3">
								<LayoutGrid class="w-4 h-4 text-slate-400" />
								<span class="text-slate-500 font-medium">Category</span>
								<div class="flex gap-2">
									<Badge
										variant="secondary"
										class="shadow-none bg-[#E0F2FE] text-[#0369A1] rounded-md text-[11px] font-bold px-2.5 py-1"
										>Sciences</Badge
									>
									<Badge
										variant="secondary"
										class="shadow-none bg-[#F0F9FF] text-[#0369A1] rounded-md text-[11px] font-bold px-2.5 py-1"
										>JAMB / WAEC</Badge
									>
									<Badge
										variant="secondary"
										class="shadow-none bg-[#FDF2F8] text-[#9D174D] rounded-md text-[11px] font-bold px-2.5 py-1"
										>In-Progress</Badge
									>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<Clock class="w-4 h-4 text-slate-400" />
								<span class="text-slate-500 font-medium">Estimate duration</span
								>
								<span class="font-bold text-slate-800 text-sm">1 hours</span>
							</div>
						</div>
					</div>

					<div
						class="prose prose-slate max-w-none text-slate-600 text-[13px] leading-relaxed"
					>
						<p>
							Unlock the secrets to mastering the life sciences with our
							"Comprehensive Biology: Life Sciences & Ecosystems" course.
							Whether you're a high school student preparing for university
							entrance exams or a passionate learner exploring the intricacies
							of living organisms, this course provides a deep journey through
							cellular biology, genetics, anatomy, and environmental systems.
						</p>

						<div class="not-prose mt-8 mb-4 w-full">
							<Card.Root
								class="bg-white rounded-xl border-slate-200 p-5 shadow-sm space-y-5"
							>
								<div class="flex items-center gap-3">
									<div
										class="w-6 h-6 rounded-lg bg-brand text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-brand/20"
									>
										<Database class="w-3.5 h-3.5" />
									</div>
									<div>
										<h4
											class="font-bold text-[14px] text-slate-900 leading-none"
										>
											Session summary
										</h4>
										<p class="text-[10px] text-slate-400 font-medium mt-1">
											Configuration overview
										</p>
									</div>
								</div>

								<!-- Properties -->
								<div
									class="bg-brand/5 rounded-2xl p-5 divide-y space-y-4 divide-slate-200/50 border border-slate-100/50 shadow-sm"
								>
									{@render summaryRow(Book, "Subject", "Biology 🧬")}
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
									{@render summaryRow(
										Timer,
										"Duration",
										`${timePerQuestion} min`,
									)}
									{@render summaryRow(
										practiceMode === "ai"
											? Bot
											: practiceMode === "timed"
												? Timer
												: practiceMode === "practice"
													? BookOpen
													: Zap,
										"Mode",
										practiceMode === "ai"
											? "AI Focus"
											: practiceMode === "timed"
												? "Timed Mode"
												: practiceMode === "practice"
													? "Practice Mode"
													: "Speed Drill",
									)}
								</div>

								<!-- Cost Breakdown -->
								<div
									class="bg-brand/5 border border-brand/10 rounded-xl p-4 space-y-2.5 shadow-sm !mt-2"
								>
									<div class="flex items-center justify-between text-[12.5px]">
										<span class="text-slate-600 font-bold">Questions</span>
										<span class="text-slate-800 font-bold"
											>{numQuestions} × 2 credits</span
										>
									</div>
									<div class="flex items-center justify-between text-[12.5px]">
										<span class="text-slate-600 font-bold">Your balance</span>
										<span class="text-slate-800 font-bold">240 credits</span>
									</div>
									<hr class="border-brand/10 w-full my-2" />
									<div class="flex items-center justify-between">
										<span class="font-extrabold text-slate-900 text-[14px]"
											>Total cost</span
										>
										<span class="font-extrabold text-brand-dark text-[15px]"
											>{numQuestions * 2} credits</span
										>
									</div>
								</div>

								<!-- AI Tip -->
								<div
									class="bg-[#EEF4FF] border border-[#D6E4FB] rounded-xl p-3.5 text-[12.5px] leading-relaxed text-[#1e5bbb] !mt-2"
								>
									<span class="flex items-start gap-2">
										<Bot class="w-[16px] h-[16px] mt-0.5 shrink-0" />
										<span
											><strong class="font-bold text-[#1a4b9c]">AI tip:</strong>
											Based on your past performance, focus on
											<strong class="font-bold text-[#1a4b9c]"
												>Reproduction topics</strong
											> in Biology — your weakest area at 34%.</span
										>
									</span>
								</div>
							</Card.Root>
						</div>
					</div>
				</div>

				<!-- <div class="pt-2">
					<div class="relative">
						<Input
							placeholder="Let your learner know a little about the quiz"
							class="border-0 border-b border-slate-200 rounded-none px-0 py-2 text-sm focus-visible:ring-0 focus-visible:border-brand transition-all placeholder:text-slate-400"
						/>
						<span
							class="absolute right-0 bottom-2 text-[10px] text-slate-400 font-medium"
							>302/400</span
						>
					</div>
				</div> -->
			</div>
		</div>

		<!-- Right Panel: Settings (Merged with content) -->
		<div
			class="w-full xl:w-1/2 p-6 lg:p-4 border-t xl:border-t-0 xl:border-l border-slate-100 bg-slate-50/30"
		>
			<div class="space-y-6">
				<!-- Section 2: Select exam type -->
				<Card.Root
					class="bg-white rounded-2xl border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5"
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
								>Clear all</button
							>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
						{#each examTypes as type}
							{@render examTypeBtn(type)}
						{/each}
					</div>

					<!-- Section 3: Choose year(s) -->
					<div class="pt-5 border-t border-slate-100 space-y-5">
						<div class="flex items-center justify-between">
							{@render sectionHeader(
								"2",
								"Choose year(s)",
								"Select question years",
							)}

							<div class="flex gap-1.5">
								<button
									onclick={() => (selectedYears = [...availableYears])}
									class="px-3 py-1.5 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all bg-white shadow-sm"
									>Select all</button
								>
								<button
									onclick={() => (selectedYears = [])}
									class="px-3 py-1.5 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 hover:bg-slate-50 hover:text-brand hover:border-brand/30 transition-all bg-white shadow-sm"
									>Clear all</button
								>
							</div>
						</div>

						<div
							class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5"
						>
							{#each availableYears as year}
								<button
									onclick={() => toggleYear(year)}
									class="relative h-[32px] border rounded-lg text-[11px] transition-all duration-200 {selectedYears.includes(
										year,
									)
										? 'border-brand bg-brand/5 text-brand  font-bold '
										: 'border-slate-200 bg-slate-50/50 text-slate-400 font-normal  hover:border-slate-200 hover:bg-slate-50'}"
								>
									{year}
								</button>
							{/each}
						</div>
					</div>
				</Card.Root>

				<!-- Section 4: Session settings (spans full width on medium screens) -->
				<Card.Root
					class="bg-white rounded-xl border-slate-200 p-5 shadow-sm space-y-6 xl:col-span-2"
				>
					{@render sectionHeader(
						"4",
						"Session settings",
						"Configure your session parameters",
					)}

					<div class="space-y-4 px-1">
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
							"timePerQuestion",
							"Time per question",
							"(mins)",
							timePerQuestionArr,
							(v) => (timePerQuestionArr = v),
							0,
							120,
							`${timePerQuestion} min`,
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

					<div class="border-t border-slate-100 pt-5">
						<h5
							class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3"
						>
							Fine-tuning
						</h5>

						<div class="grid grid-cols-1 gap-4">
							<div
								class="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-4"
							>
								<div class="flex items-center justify-between">
									<h6
										class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
									>
										Question Logic
									</h6>
									<LayoutGrid class="w-3.5 h-3.5 text-slate-300" />
								</div>

								<div class="flex flex-col gap-2">
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
										"bg-amber-400",
									)}
								</div>
							</div>
						</div>
					</div>

					<div class="border-t border-slate-100 pt-5">
						<h5
							class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3"
						>
							Practice Mode
						</h5>

						<div class="grid grid-cols-2 gap-3">
							{#snippet practiceBtn(
								id: string,
								title: string,
								desc: string,
								Icon: any,
							)}
								<button
									onclick={() => (practiceMode = id)}
									class="text-left p-3.5 rounded-xl border {practiceMode === id
										? 'border-brand bg-brand/10'
										: 'border-slate-200 hover:border-slate-300 bg-white'} transition-all group"
								>
									<div
										class="flex items-center gap-1.5 mb-1 {practiceMode === id
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
								"AI picks your weakest topics automatically.",
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
			class="w-full bg-brand hover:bg-brand/90 text-white font-extrabold text-[16px] py-4 lg:py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
		>
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
		</button>
	</div>
</div>
