<script lang="ts">
	import { onMount, untrack } from "svelte";
	import { fly } from "svelte/transition";
	import {
		Bookmark,
		RotateCcw,
		ChevronRight,
		Send,
		BookOpen,
		Info,
		MoreHorizontal,
		CheckSquare,
		Image as ImageIcon,
		Check,
		Plus,
		ChevronDown,
		Clock,
		Trash,
	} from "@lucide/svelte";

	// --- Types ---
	// Moved to src/app.d.ts

	let { data } = $props();

	// --- Mock Data ---
	// Data is now loaded in +page.server.ts
	// Initialize local state from server data
	let questions: Question[] = $state(untrack(() => data.questions));

	$effect(() => {
		questions = data.questions;
	});

	let currentQuestionIndex = $state(0); // Start at Q1
	let currentPageIndex = $state(0);
	let timeElapsed = $state(0);
	let slideDirection = $state(1); // 1 = forward, -1 = backward

	// --- Derived State ---
	const QUESTIONS_PER_PAGE = 5;
	let visibleQuestions = $derived(
		questions.slice(
			currentPageIndex * QUESTIONS_PER_PAGE,
			(currentPageIndex + 1) * QUESTIONS_PER_PAGE,
		),
	);
	let currentQuestion = $derived(questions[currentQuestionIndex]); // Still useful for singular referencing if needed

	let stats = $derived({
		total: questions.length,
		visited: questions.filter((q) => q.status !== "not-visited").length,
		notVisited: questions.filter((q) => q.status === "not-visited").length,
		answered: questions.filter(
			(q) => q.status === "answered" || q.status === "marked-answered",
		).length,
		notAnswered: questions.filter(
			(q) => q.status === "not-answered" || q.status === "marked",
		).length,
		marked: questions.filter(
			(q) => q.status === "marked" || q.status === "marked-answered",
		).length,
		bookmarked: questions.filter((q) => q.isBookmarked).length,
	});

	// --- Timer Logic ---
	let timerInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		timerInterval = setInterval(() => {
			timeElapsed++;
		}, 1000);
		return () => clearInterval(timerInterval);
	});

	function formatTime(seconds: number) {
		const h = Math.floor(seconds / 3600)
			.toString()
			.padStart(2, "0");
		const m = Math.floor((seconds % 3600) / 60)
			.toString()
			.padStart(2, "0");
		const s = (seconds % 60).toString().padStart(2, "0");
		return { h, m, s };
	}

	let timeDisplay = $derived(formatTime(timeElapsed));

	// --- Actions ---
	function selectOption(questionId: number, optionIndex: number) {
		const qIndex = questions.findIndex((q) => q.id === questionId);
		if (qIndex !== -1) {
			questions[qIndex].selectedOption = optionIndex;
			questions[qIndex].status = "answered";
		}
	}

	function goToQuestion(index: number) {
		const targetPage = Math.floor(index / QUESTIONS_PER_PAGE);
		if (targetPage > currentPageIndex) {
			slideDirection = 1;
		} else if (targetPage < currentPageIndex) {
			slideDirection = -1;
		}

		if (questions[index].status === "not-visited") {
			questions[index].status = "not-answered";
		}

		currentQuestionIndex = index;
		currentPageIndex = targetPage;
	}

	function nextPage() {
		if ((currentPageIndex + 1) * QUESTIONS_PER_PAGE < questions.length) {
			slideDirection = 1;
			currentPageIndex++;
		}
	}

	function prevPage() {
		if (currentPageIndex > 0) {
			slideDirection = -1;
			currentPageIndex--;
		}
	}

	function toggleBookmark(questionId: number) {
		const qIndex = questions.findIndex((q) => q.id === questionId);
		if (qIndex !== -1) {
			questions[qIndex].isBookmarked = !questions[qIndex].isBookmarked;
		}
	}

	// --- Helpers for Styles ---
	function getStatusClass(status: QuestionStatus, isCurrent: boolean) {
		if (isCurrent)
			return "border-2 border-purple-600 bg-purple-50 text-purple-700 font-bold";
		switch (status) {
			case "answered":
				return "bg-green-100 text-green-700 border border-green-200";
			case "marked":
				return "bg-purple-100 text-purple-700 border border-purple-200";
			case "not-answered":
				return "bg-red-50 text-red-700 border border-red-200";
		}
		return "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100";
	}

	function getPaletteButtonClass(q: Question) {
		const isCurrent = q.id === currentQuestion.id;
		const base =
			"w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors";

		if (isCurrent) {
			return `${base} border-2 border-indigo-900 text-indigo-900 bg-white font-bold shadow-sm`;
		}

		if (q.status === "answered") {
			return `${base} bg-green-100 text-green-700 border border-green-200`;
		}

		if (q.status === "marked" || q.status === "marked-answered") {
			return `${base} bg-purple-100 text-purple-700 border border-purple-200`;
		}

		if (q.status === "not-answered" && q.selectedOption === null) {
			return `${base} bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100`;
		}

		return `${base} bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100`;
	}
</script>

{#snippet questionCard(question: Question)}
	<div
		class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-3"
	>
		<!-- Card Header -->
		<div class="px-4 py-2.5 flex items-center justify-between">
			<div
				class="flex items-center gap-2 text-slate-700 font-medium cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
			>
				<div class="p-0.5 rounded-sm border border-slate-300">
					<CheckSquare class="w-3 h-3 text-slate-500" />
				</div>
				<span class="text-sm font-medium">Multiple choice</span>
				<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
			</div>
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2">
					<span class="text-xs font-medium text-slate-600">Required</span>
					<button
						class="w-7 h-4 rounded-full bg-emerald-500 relative transition-colors"
						title="Toggle Required"
					>
						<span
							class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
						></span>
					</button>
				</div>
				<button
					class="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
				>
					<MoreHorizontal class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- Internal Divider (Header) -->
		<div class="h-px bg-slate-200 mx-4 opacity-60"></div>

		<div class="p-4">
			<!-- Question Section -->
			<div class="mb-4">
				<div class="flex items-start gap-2.5 mb-2">
					<div
						class="w-5 h-5 bg-slate-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
					>
						?
					</div>
					<h2 class="font-semibold text-slate-800 text-sm leading-relaxed">
						Question {question.id} <span class="text-red-500">*</span>
					</h2>
				</div>

				<!-- Question Text -->
				<div
					class="bg-slate-50 rounded-lg p-3 text-slate-800 text-sm leading-6 border border-slate-100"
				>
					{#each question.text.split("\n\n") as paragraph}
						<p class="mb-2 last:mb-0">{paragraph}</p>
					{/each}
				</div>
			</div>

			<!-- Choices Section -->
			<div class="space-y-3">
				<div class="space-y-1.5">
					{#each question.options as option, idx}
						<button
							class="w-full flex items-center group p-1 rounded-lg border transition-all duration-300 relative text-left
                            {question.selectedOption === idx
								? 'border-indigo-600 bg-indigo-50/30 animate-bounce-custom z-10 ring-1 ring-indigo-600'
								: 'border-transparent hover:bg-slate-50'}"
							onclick={() => selectOption(question.id, idx)}
						>
							<!-- Radio Circle Area -->
							<div class="w-10 h-8 flex items-center justify-center shrink-0">
								<div
									class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                                    {question.selectedOption === idx
										? 'border-indigo-600 bg-indigo-600'
										: 'border-slate-300 bg-white'}"
								>
									{#if question.selectedOption === idx}
										<Check class="w-2.5 h-2.5 text-white" />
									{/if}
								</div>
							</div>

							<!-- Option Text Box -->
							<div
								class="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-700 text-sm font-medium transition-colors group-hover:bg-slate-100 flex items-center gap-2.5
                                {question.selectedOption === idx
									? 'bg-white border-indigo-200'
									: ''}"
							>
								<!-- Letter Label -->
								<span
									class="flex items-center justify-center w-5 h-5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm shrink-0"
								>
									{String.fromCharCode(65 + idx)}
								</span>

								<span>{option}</span>

								<!-- Hover Actions -->
								<div
									class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<div class="p-1 hover:bg-slate-200 rounded text-slate-400">
										<ImageIcon class="w-3.5 h-3.5" />
									</div>
									<div
										class="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400"
									>
										<Trash class="w-3.5 h-3.5" />
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Internal Divider (Footer) -->
		<div class="h-px bg-slate-200 mx-4 opacity-60"></div>

		<!-- Card Footer -->
		<div
			class="px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-600"
		>
			<div class="space-y-1.5">
				<span class="font-bold text-slate-700">Randomize Order</span>
				<div
					class="flex items-center justify-between bg-slate-50 border-none rounded px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors"
				>
					<span class="text-slate-600 font-medium">Original order</span>
					<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
				</div>
			</div>
			<div class="space-y-1.5">
				<span class="font-bold text-slate-700">Time estimate</span>
				<div class="flex items-stretch bg-slate-50 rounded overflow-hidden">
					<div class="px-2.5 py-1.5 bg-slate-50 font-bold text-slate-800">
						2
					</div>
					<div class="w-px bg-slate-200 my-1"></div>
					<div
						class="px-2.5 py-1.5 bg-slate-50 text-slate-500 flex-1 flex items-center justify-between"
					>
						<span>Mins</span>
						<Clock class="w-3 h-3 text-slate-400" />
					</div>
				</div>
			</div>
			<div class="space-y-1.5">
				<span class="font-bold text-slate-700">Points</span>
				<div class="flex items-stretch bg-slate-50 rounded overflow-hidden">
					<div class="px-2.5 py-1.5 bg-slate-50 font-bold text-slate-800">
						1
					</div>
					<div class="w-px bg-slate-200 my-1"></div>
					<div
						class="px-2.5 py-1.5 bg-slate-50 text-slate-500 flex-1 flex items-center justify-between"
					>
						<span>Pts</span>
						<div
							class="w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm"
						>
							<Plus class="w-2 h-2 text-white" strokeWidth={3} />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<div
	class="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800 text-sm"
>
	<!-- Header -->
	<header
		class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0"
	>
		<div class="flex items-center gap-4 text-slate-700">
			<h1 class="font-bold text-lg">AFCAT Test Series 2023 I</h1>
			<ChevronRight class="w-5 h-5 text-slate-400" />
			<span class="font-medium text-slate-600">Reasoning</span>
		</div>

		<div class="flex items-center gap-4">
			<button
				class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium transition-colors"
			>
				Exit
			</button>
			<button
				class="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
			>
				<span>Review and Submit</span>
				<Send class="w-4 h-4 ml-1" />
			</button>
		</div>
	</header>

	<div class="flex flex-1 items-start gap-4">
		<!-- Left Sidebar: Question Palette (Simpler Grid) -->
		<aside
			class="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar"
		>
			<div class="p-4 space-y-6">
				<!-- Legend -->
				<div
					class="flex items-center justify-end gap-3 text-xs text-slate-500 mb-2"
				>
					<div class="flex items-center gap-1">
						<span
							class="w-3 h-3 rounded-full bg-green-100 border border-green-200"
						></span> <span>Ans</span>
					</div>
					<div class="flex items-center gap-1"></div>
				</div>

				<!-- Single Grid of 50 Questions -->
				<div class="grid grid-cols-5 gap-2">
					{#each questions as q}
						<button
							onclick={() => goToQuestion(q.id - 1)}
							class={getPaletteButtonClass(q)}
						>
							{q.id.toString().padStart(2, "0")}
						</button>
					{/each}
				</div>
			</div>
		</aside>

		<!-- Main Content: Questions List -->
		<main class="flex-1 flex flex-col min-w-0">
			<div class="flex-1 p-6 max-w-5xl mx-auto w-full">
				<div class="grid grid-cols-1 grid-rows-1">
					{#key currentPageIndex}
						<div
							class="col-start-1 row-start-1"
							in:fly={{ x: 50 * slideDirection, duration: 400, delay: 150 }}
							out:fly={{ x: -50 * slideDirection, duration: 400 }}
						>
							{#each visibleQuestions as question (question.id)}
								{@render questionCard(question)}
							{/each}
						</div>
					{/key}
				</div>

				<!-- Action Bar -->
				<div class="flex items-center justify-between pt-4 pb-8">
					<button
						class="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
						onclick={prevPage}
						disabled={currentPageIndex === 0}
					>
						Previous Page
					</button>
					<button
						class="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-bold shadow-sm"
						onclick={nextPage}
					>
						Next Page
						<ChevronRight class="w-4 h-4" />
					</button>
				</div>
			</div>
		</main>

		<!-- Right Sidebar -->
		<aside
			class="w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] px-6 py-6 gap-6"
		>
			<!-- Timer & Actions Card -->
			<div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
				<div class="text-center mb-6">
					<div
						class="flex items-center justify-center gap-3 font-mono text-3xl font-bold text-slate-900 tracking-wider"
					>
						<span>{timeDisplay.h}</span>
						<span class="text-slate-400 text-xl">:</span>
						<span>{timeDisplay.m}</span>
						<span class="text-slate-400 text-xl">:</span>
						<span>{timeDisplay.s}</span>
					</div>
					<div
						class="flex justify-center gap-8 text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1"
					>
						<span class="w-8">Hrs</span>
						<span class="w-8 ml-1">Min</span>
						<span class="w-8 ml-1">Sec</span>
					</div>
				</div>

				<div class="space-y-3">
					<button
						class="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
					>
						About Test
					</button>
					<button
						class="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2"
					>
						<BookOpen class="w-4 h-4 text-slate-500" />
						Read Instructions
					</button>
				</div>
			</div>

			<!-- Overview Card -->
			<div
				class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1 mb-6"
			>
				<h3
					class="text-sm font-semibold text-slate-700 mb-4 pb-4 border-b border-slate-100"
				>
					Overview
				</h3>

				<div class="space-y-4">
					<div class="flex justify-between items-center text-sm">
						<span class="text-slate-600 font-medium">Total Questions</span>
						<span class="text-slate-900 font-bold">{stats.total}</span>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span class="text-slate-600 font-medium">Visited</span>
						<span class="text-slate-900 font-bold">{stats.visited}</span>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span class="text-slate-600 font-medium">Not Visited</span>
						<span class="text-slate-900 font-bold">{stats.notVisited}</span>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span class="text-slate-600 font-medium">Answered</span>
						<span class="text-slate-900 font-bold">{stats.answered}</span>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span class="text-slate-600 font-medium">Not Answered</span>
						<span class="text-slate-900 font-bold">{stats.notAnswered}</span>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span class="text-slate-600 font-medium">Marked to review</span>
						<span class="text-slate-900 font-bold">{stats.marked}</span>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span class="text-slate-600 font-medium">Bookmarked</span>
						<span class="text-slate-900 font-bold">{stats.bookmarked}</span>
					</div>
				</div>
			</div>
		</aside>

		<!-- Right Sidebar Removed as per request to move timer and simplify -->
	</div>
</div>

<style>
	/* Custom scrollbar for the question palette */
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #e2e8f0;
		border-radius: 20px;
	}

	@keyframes bounce-custom {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	:global(.animate-bounce-custom) {
		animation: bounce-custom 0.4s ease-in-out;
	}
</style>
