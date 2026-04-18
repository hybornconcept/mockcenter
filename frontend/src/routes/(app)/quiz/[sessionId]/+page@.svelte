<script lang="ts">
	import { onMount, untrack } from "svelte";
	import { fly, slide } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import QuestionCard from "$lib/components/QuestionCard.svelte";
	import CalculatorUI from "$lib/components/Calculator.svelte";
	import Confirmation from "$lib/components/Confirmation.svelte";
	import {
		Bookmark,
		Microscope,
		Timer,
		Bot,
		ArrowRight,
		ArrowLeft,
		ArrowUp,
		Save,
		Pause,
		Flag,
		Calculator,
		Info,
		LayoutGrid,
		CheckCircle2,
		XCircle,
		ChevronDown,
		Sparkles,
	} from "lucide-svelte";

	let isCalculatorOpen = $state(false);
	let showNavigator = $state(true);
	let showAITracking = $state(true);
	let fontSize = $state(15);
	let isSubmitting = $state(false);
	let showSubmitModal = $state(false);

	function toggleCalculator() {
		isCalculatorOpen = !isCalculatorOpen;
	}

	function toggleFlag(questionId: number) {
		const qIndex = questions.findIndex((q) => q.id === questionId);
		if (qIndex !== -1) {
			const q = questions[qIndex];
			if (q.status === "marked" || q.status === "marked-answered") {
				q.status = q.selectedOption !== null ? "answered" : "not-answered";
			} else {
				q.status = q.selectedOption !== null ? "marked-answered" : "marked";
			}
		}
	}

	function toggleBookmark(questionId: number) {
		const qIndex = questions.findIndex((q) => q.id === questionId);
		if (qIndex !== -1) {
			questions[qIndex].isBookmarked = !questions[qIndex].isBookmarked;
		}
	}

	function clearOption(questionId: number) {
		if (isReviewMode) return;
		const qIndex = questions.findIndex((q) => q.id === questionId);
		if (qIndex !== -1) {
			const q = questions[qIndex];
			q.selectedOption = null;
			if (q.status === "answered") q.status = "not-answered";
			else if (q.status === "marked-answered") q.status = "marked";
		}
	}

	function reportIssue(questionId: number) {
		console.log("Report issue for question:", questionId);
	}

	let { data } = $props();

	// --- Mode detection ---
	const isReviewMode = $derived(data.mode === "review");

	// --- State ---
	let questions: any[] = $state([]);
	let loading = $state(true);
	let loadError = $state(false);
	let subjectName = $state(untrack(() => data.subjectName));
	let examType = $state(untrack(() => data.examType));
	let examYear = $state(untrack(() => data.year));

	let currentQuestionIndex = $state(0);
	let currentPageIndex = $state(0);
	let timeElapsed = $state(0);
	let timeRemaining = $state(0);
	let slideDirection = $state(1);

	// --- Derived State ---
	let QUESTIONS_PER_PAGE = $derived(data.questionsPerPage || 5);
	let isTimed = $derived(data.duration > 0 && !isReviewMode);
	let visibleQuestions = $derived(
		questions.slice(
			currentPageIndex * QUESTIONS_PER_PAGE,
			(currentPageIndex + 1) * QUESTIONS_PER_PAGE,
		),
	);
	let currentQuestion = $derived(questions[currentQuestionIndex]);

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

	onMount(async () => {
		try {
			// In review mode, fetch results (with correct option IDs)
			const endpoint = isReviewMode
				? `/api/practice/${data.sessionId}/results`
				: `/api/practice/${data.sessionId}`;

			const res = await fetch(endpoint);
			const json = await res.json();

			if (json.success) {
				const rawQuestions = json.data.questions;
				subjectName = json.data.subjectName || subjectName;
				examType = json.data.examType || examType;
				examYear = json.data.year || examYear;

				if (isReviewMode) {
					// In review mode, questions already have selectedOptionId + correctOptionId + isCorrect
					questions = rawQuestions.map((q: any) => ({
						...q,
						text: q.body,
						status: q.isCorrect ? "answered" : "not-answered",
						// Map selectedOptionId → selectedOption (index)
						selectedOption: q.selectedOptionId
							? q.options.findIndex((o: any) => o.id === q.selectedOptionId)
							: null,
						isBookmarked: false,
					}));
				} else {
					let fetchedQuestions = rawQuestions.map((q: any) => ({
						...q,
						text: q.body,
						status: "not-visited",
						selectedOption: null,
						selectedOptionId: null,
						isBookmarked: false,
					}));

					if (data.shuffle) {
						for (let i = fetchedQuestions.length - 1; i > 0; i--) {
							const j = Math.floor(Math.random() * (i + 1));
							[fetchedQuestions[i], fetchedQuestions[j]] = [fetchedQuestions[j], fetchedQuestions[i]];
						}
					}
					questions = fetchedQuestions;
					if (fetchedQuestions.length > 0) questions[0].status = "not-answered";
				}
			} else {
				loadError = true;
			}
		} catch (err) {
			console.error(err);
			loadError = true;
		} finally {
			loading = false;
		}

		if (!isReviewMode) {
			if (isTimed) timeRemaining = data.duration * 60;

			timerInterval = setInterval(() => {
				if (isTimed) {
					if (timeRemaining > 0) {
						timeRemaining--;
					} else {
						clearInterval(timerInterval);
						submitQuiz(true);
					}
				} else {
					timeElapsed++;
				}
			}, 1000);
		}

		return () => clearInterval(timerInterval);
	});

	function formatTime(seconds: number) {
		const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
		const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
		const s = (seconds % 60).toString().padStart(2, "0");
		return { h, m, s };
	}

	let timeDisplay = $derived(formatTime(isTimed ? timeRemaining : timeElapsed));

	// --- Submit Logic ---
	async function submitQuiz(timedOut = false) {
		if (isSubmitting || isReviewMode) return;
		isSubmitting = true;
		showSubmitModal = false;
		clearInterval(timerInterval);

		try {
			const totalTimeSecs = isTimed
				? data.duration * 60 - timeRemaining
				: timeElapsed;

			const answers = questions.map((q) => ({
				questionId: q.id,
				selectedOptionId: q.selectedOption !== null ? q.options[q.selectedOption]?.id : undefined,
				timeSpentSecs: 0,
			}));

			const res = await fetch(`/api/practice/${data.sessionId}/complete`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ answers, totalTimeSecs }),
			});

			const json = await res.json();
			if (json.success) {
				// Store results in sessionStorage for the final_score page
				sessionStorage.setItem(
					`results_${data.sessionId}`,
					JSON.stringify({
						...json.data,
						subjectName,
						examType,
						examYear,
						totalQuestions: questions.length,
					}),
				);
				goto(`/final_score?sessionId=${data.sessionId}`);
			} else {
				console.error("Submit failed:", json);
				isSubmitting = false;
			}
		} catch (err) {
			console.error("Submit error:", err);
			isSubmitting = false;
		}
	}

	// --- Actions ---
	function selectOption(questionId: string, optionOptionIndex: number) {
		if (isReviewMode) return;
		const qIndex = questions.findIndex((q) => q.id === questionId);
		if (qIndex !== -1) {
			questions[qIndex].selectedOption = optionOptionIndex;
			questions[qIndex].status = "answered";
		}
	}

	function goToQuestion(index: number) {
		if (index < 0 || index >= questions.length) return;
		const targetPage = Math.floor(index / QUESTIONS_PER_PAGE);
		if (targetPage > currentPageIndex) slideDirection = 1;
		else if (targetPage < currentPageIndex) slideDirection = -1;

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

	// --- Review mode typing explanation ---
	let expandedExplanations = $state<Record<string, boolean>>({});
	let typedExplanations = $state<Record<string, string>>({});

	function toggleExplanation(questionId: string) {
		const wasOpen = expandedExplanations[questionId];
		expandedExplanations[questionId] = !wasOpen;
		if (!wasOpen && !typedExplanations[questionId]) {
			const q = questions.find(q => q.id === questionId);
			const text = q?.explanation || getDefaultExplanation(q);
			typeText(questionId, text);
		}
	}

	function getDefaultExplanation(q: any): string {
		if (!q) return "No explanation available.";
		const correct = q.options?.find((o: any) => o.isCorrect);
		if (q.isCorrect) {
			return `✓ Correct! You selected the right answer: "${correct?.body}". Well done!`;
		} else {
			const selected = q.selectedOption !== null ? q.options?.[q.selectedOption] : null;
			return `✗ The correct answer is "${correct?.body}". ${selected ? `You selected "${selected.body}".` : "You didn't answer this question."} Review this topic carefully.`;
		}
	}

	function typeText(questionId: string, text: string) {
		typedExplanations[questionId] = "";
		let i = 0;
		const interval = setInterval(() => {
			if (i < text.length) {
				typedExplanations[questionId] += text[i];
				i++;
			} else {
				clearInterval(interval);
			}
		}, 18);
	}
</script>

<!-- Submit Confirmation Modal -->
<Confirmation
	bind:open={showSubmitModal}
	title="Submit Quiz?"
	description={`You've answered ${stats.answered} of ${stats.total} questions.${stats.notAnswered > 0 ? `\n⚠ ${stats.notAnswered} unanswered.` : ""}`}
	confirmText={isSubmitting ? "Submitting…" : "Submit Now"}
	cancelText="Keep Going"
	icon={ArrowUp}
	iconColorClass="text-red-500"
	iconBgClass="bg-red-50"
	confirmBtnClass="bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white"
	disabled={isSubmitting}
	onConfirm={() => submitQuiz()}
/>

<div class="h-screen flex flex-col bg-slate-50/50">
	<header
		class="h-[72px] bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 w-full shrink-0 shadow-sm"
	>
		<div class="flex items-center gap-5">
			<span class="font-black text-brand text-xl tracking-tight">mockcenter</span>
			<Separator orientation="vertical" class="h-8" />
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shadow-sm">
					<Microscope class="w-5 h-5" />
				</div>
				<div>
					<h2 class="font-bold text-slate-800 text-[15px] leading-tight">{subjectName}</h2>
					<p class="text-[11px] text-slate-500 font-semibold mt-0.5">{examType} {examYear}</p>
				</div>
			</div>
		</div>

		{#if isReviewMode}
			<!-- Review Mode Header Badge -->
			<div class="flex items-center gap-3">
				<div class="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full flex items-center gap-2">
					<CheckCircle2 class="w-4 h-4 text-indigo-500" />
					<span class="text-[12px] font-bold text-indigo-600">Review Mode</span>
				</div>
				<Button
					variant="outline"
					class="border-slate-200 text-slate-600 h-[38px] px-4 shadow-sm"
					onclick={() => history.back()}
				>
					← Back to Results
				</Button>
			</div>
		{:else}
			<div class="hidden md:flex flex-col items-center gap-2 flex-1 max-w-[400px] mx-8 mt-1">
				<Badge
					variant="secondary"
					class="bg-brand/10 text-brand hover:bg-brand/10 text-[10px] uppercase font-bold py-0.5 px-3 tracking-widest shadow-none rounded-full"
				>
					Progress
				</Badge>
				<div class="flex items-center gap-4 w-full">
					<Progress
						value={((currentQuestionIndex + 1) / stats.total) * 100}
						max={100}
						class="h-1.5 flex-1 bg-brand/10 [&>div]:bg-brand"
					/>
					<span class="text-xs font-bold text-slate-400 w-12"
						>{currentQuestionIndex + 1} / {stats.total}</span
					>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<div class="bg-brand/10 text-brand px-4 py-2 rounded-lg flex items-center gap-2 font-mono font-bold text-[15px] shadow-sm ring-1 ring-brand/20">
					<Timer class="w-4 h-4" />
					<span>{timeDisplay.h}:{timeDisplay.m}:{timeDisplay.s}</span>
				</div>
				<Button
					variant="outline"
					class="border-slate-200 text-slate-600 hover:bg-slate-50 h-[38px] px-4 shadow-sm"
				>
					<Pause class="w-4 h-4 mr-2" />
					Pause
				</Button>
				<Button
					class="bg-red-500 hover:bg-red-600 text-white shadow-sm h-[38px] px-5 font-bold text-sm transition-colors"
					onclick={() => (showSubmitModal = true)}
					disabled={isSubmitting}
				>
					{isSubmitting ? "Submitting…" : "Submit"}
				</Button>
				<div class="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs ring-2 ring-brand/20 ml-1">
					CE
				</div>
			</div>
		{/if}
	</header>

	<main class="flex-1 flex overflow-hidden">
		<!-- Middle: Question Area -->
		<div class="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center custom-scrollbar">
			<div class="w-full max-w-[1000px] flex flex-col gap-8 bg-transparent mt-4">
				{#if loading}
					{#each Array(Math.min(data.questionsPerPage || 5, 3)) as _, i}
						<div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse mb-6">
							<div class="px-4 py-3 flex items-center justify-between border-b border-slate-100">
								<div class="flex items-center gap-2.5">
									<div class="w-6 h-6 bg-slate-200 rounded-lg"></div>
									<div class="w-32 h-4 bg-slate-200 rounded-md"></div>
								</div>
								<div class="w-40 h-8 bg-slate-100 rounded-full"></div>
							</div>
							<div class="py-5 px-8 space-y-4">
								<div class="space-y-2">
									<div class="w-full h-4 bg-slate-100 rounded"></div>
									<div class="w-4/5 h-4 bg-slate-100 rounded"></div>
								</div>
								<div class="space-y-2 pt-2">
									{#each [1,2,3,4] as _}
										<div class="w-full h-10 bg-slate-100 rounded-lg"></div>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				{:else if loadError || questions.length === 0}
					<div class="flex flex-col items-center justify-center py-20 text-center">
						<div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
							<svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
							</svg>
						</div>
						<h3 class="text-lg font-bold text-slate-800 mb-1">{loadError ? "Failed to load session" : "No questions loaded"}</h3>
						<p class="text-sm text-slate-500 max-w-xs">{loadError ? "An error occurred while fetching the quiz data." : "We couldn't load the questions for this session."}</p>
						<a href="/start_practice" class="mt-6 px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-sm">
							← Back to Practice
						</a>
					</div>
				{:else}
					<div class="grid grid-cols-1 grid-rows-1 w-full">
						{#key currentPageIndex}
							<div
								class="col-start-1 row-start-1"
								in:fly={{ x: 50 * slideDirection, duration: 400, delay: 150 }}
								out:fly={{ x: -50 * slideDirection, duration: 400 }}
							>
								{#each visibleQuestions as question (question.id)}
									{@const qRealIndex = questions.findIndex(q => q.id === question.id)}

									{#if isReviewMode}
										<!-- ===== REVIEW MODE CARD ===== -->
										<div class="mb-10 rounded-xl border shadow-sm overflow-hidden
											{question.selectedOption === null
												? 'border-slate-200 bg-white'
												: question.isCorrect
													? 'border-emerald-200 bg-emerald-50/30'
													: 'border-red-200 bg-red-50/20'}">

											<!-- Card Header -->
											<div class="px-4 py-2.5 flex items-center justify-between border-b
												{question.isCorrect ? 'border-emerald-100 bg-emerald-50' : question.selectedOption !== null ? 'border-red-100 bg-red-50' : 'border-slate-100 bg-slate-50'}">
												<div class="flex items-center gap-2.5">
													<div class="w-6 h-6 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 shadow-sm
														{question.isCorrect ? 'bg-emerald-500 text-white' : question.selectedOption !== null ? 'bg-red-500 text-white' : 'bg-slate-300 text-white'}">
														{qRealIndex + 1}
													</div>
													<h2 class="font-semibold text-slate-800 text-[15px] leading-tight">
														Question {qRealIndex + 1}
													</h2>
												</div>
												<div class="flex items-center gap-2">
													{#if question.isCorrect}
														<div class="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 rounded-full">
															<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
															<span class="text-[11px] font-bold text-emerald-700">Correct</span>
														</div>
													{:else if question.selectedOption !== null}
														<div class="flex items-center gap-1.5 px-3 py-1 bg-red-100 rounded-full">
															<XCircle class="w-3.5 h-3.5 text-red-500" />
															<span class="text-[11px] font-bold text-red-600">Incorrect</span>
														</div>
													{:else}
														<div class="px-3 py-1 bg-slate-100 rounded-full">
															<span class="text-[11px] font-bold text-slate-500">Skipped</span>
														</div>
													{/if}
												</div>
											</div>

											<!-- Question Body -->
											<div class="px-8 py-5">
												{#if question.topic || question.imageUrl}
													<div class="mb-4 bg-brand/5 border border-brand/10 p-4 rounded-xl flex flex-col items-center justify-center">
														{#if question.topic}
															<div class="text-brand text-[14px] font-semibold leading-relaxed mb-4 text-center">
																{question.topic.replace(/above/gi, "below")}
															</div>
														{/if}
														{#if question.imageUrl}
															{@const imgSrc = question.imageUrl.startsWith('http') ? question.imageUrl : `/images/${question.imageUrl}`}
															<div class="rounded-lg overflow-hidden flex justify-center bg-white p-2 shadow-sm border border-brand/10">
																<img src={imgSrc} alt="Reference Material" class="max-w-full max-h-[350px] object-contain rounded-md" />
															</div>
														{/if}
													</div>
												{/if}
												<div class="bg-slate-50/80 rounded-xl p-4 text-slate-800 font-medium leading-relaxed border border-slate-100 shadow-inner mb-5" style="font-size: {fontSize}px">
													{#each question.text.split("\n\n") as paragraph}
														<p class="mb-2 last:mb-0">{paragraph}</p>
													{/each}
												</div>

												<!-- Options with review styling (matching the image layout) -->
												<div class="space-y-2.5">
													{#each question.options as option, idx}
														{@const isSelected = question.selectedOption === idx}
														{@const isCorrectOpt = option.isCorrect === true}
														<div class="w-full flex items-center rounded-xl border px-3 py-2.5 transition-all relative text-left
															{isCorrectOpt
																? 'border-emerald-300 bg-emerald-50 shadow-sm'
																: isSelected && !isCorrectOpt
																	? 'border-red-300 bg-red-50 shadow-sm'
																	: 'border-slate-200 bg-white'}">

															<!-- Option letter badge -->
															<div class="w-7 h-7 flex items-center justify-center shrink-0 mr-3">
																<div class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0
																	{isCorrectOpt
																		? 'border-emerald-400 bg-emerald-400 text-white'
																		: isSelected && !isCorrectOpt
																			? 'border-red-400 bg-red-400 text-white'
																			: 'border-slate-300 bg-white text-slate-500'}">
																	{String.fromCharCode(65 + idx)}
																</div>
															</div>

															<span class="flex-1 text-slate-700 font-medium text-[14px]">{option.body ?? option}</span>

															<!-- Check/X icon on right -->
															{#if isCorrectOpt}
																<CheckCircle2 class="w-5 h-5 text-emerald-500 ml-2 shrink-0" />
															{:else if isSelected && !isCorrectOpt}
																<XCircle class="w-5 h-5 text-red-500 ml-2 shrink-0" />
															{/if}
														</div>
													{/each}
												</div>

												<!-- AI Explanation Box (typing effect) -->
												<button
													class="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-xl border border-dashed transition-all group
														{expandedExplanations[question.id]
															? 'border-indigo-300 bg-indigo-50'
															: 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'}"
													onclick={() => toggleExplanation(question.id)}
												>
													<div class="flex items-center gap-2.5">
														<div class="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
															<Sparkles class="w-3.5 h-3.5 text-indigo-500" />
														</div>
														<span class="text-[12px] font-bold text-indigo-600">AI Explanation</span>
													</div>
													<ChevronDown class="w-4 h-4 text-indigo-400 transition-transform {expandedExplanations[question.id] ? 'rotate-180' : ''}" />
												</button>

												{#if expandedExplanations[question.id]}
													<div
														transition:slide={{ duration: 300 }}
														class="mt-1 px-4 py-3 rounded-b-xl border border-t-0 border-indigo-200 bg-indigo-50/80"
													>
														<p class="text-[13px] leading-relaxed text-slate-700 font-medium">
															{typedExplanations[question.id] || ""}<span
																class="inline-block w-0.5 h-3.5 bg-indigo-400 ml-0.5 animate-pulse"
																class:hidden={typedExplanations[question.id]?.length >= (question.explanation || getDefaultExplanation(question)).length}
															></span>
														</p>
													</div>
												{/if}
											</div>
										</div>
									{:else}
										<!-- ===== NORMAL QUIZ CARD ===== -->
										<QuestionCard
											{question}
											index={qRealIndex + 1}
											{fontSize}
											onSelectOption={selectOption}
											onNextPage={() => goToQuestion(currentQuestionIndex + 1)}
											onPrevPage={() => goToQuestion(currentQuestionIndex - 1)}
											onToggleCalculator={toggleCalculator}
											isCalculatorActive={isCalculatorOpen}
											onToggleFlag={() => toggleFlag(question.id)}
											onToggleBookmark={() => toggleBookmark(question.id)}
											onClearOption={() => clearOption(question.id)}
											onReportIssue={() => reportIssue(question.id)}
											onChangeFontSize={(delta) => (fontSize = Math.min(24, Math.max(12, fontSize + delta)))}
										/>
									{/if}
								{/each}
							</div>
						{/key}
					</div>

					<!-- Floating Calculator Overlay -->
					{#if isCalculatorOpen}
						<div
							class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto"
							in:fly={{ y: 20, duration: 400 }}
							out:fly={{ y: 20, duration: 200 }}
						>
							<CalculatorUI onClose={() => (isCalculatorOpen = false)} />
						</div>
					{/if}

					<div class="flex items-center justify-between pt-4 pb-8">
						<Button
							variant="outline"
							class="text-slate-600 hover:bg-slate-50 rounded-xl h-10 shadow-sm font-semibold px-6"
							onclick={prevPage}
							disabled={currentPageIndex === 0}
						>
							<ArrowLeft class="w-4 h-4 mr-2" />
							Previous Page
						</Button>
						<Button
							class="bg-brand hover:bg-brand/90 text-white shadow-md rounded-xl px-6 h-10 font-bold transition-all"
							onclick={nextPage}
							disabled={(currentPageIndex + 1) * QUESTIONS_PER_PAGE >= questions.length}
						>
							Next Page
							<ArrowRight class="w-4 h-4 ml-2" />
						</Button>
					</div>
				{/if}
			</div>
		</div>

		<aside class="w-[300px] bg-white border-l border-slate-200 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 shrink-0">
			<div class="p-4 pb-2 shrink-0 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
						<LayoutGrid class="w-3.5 h-3.5 text-slate-500" />
					</div>
					<h3 class="font-extrabold text-slate-800 text-[13px]">Question navigator</h3>
				</div>
				<Switch bind:checked={showNavigator} class="origin-right data-[state=checked]:bg-brand" />
			</div>

			{#if showNavigator}
				<div class="px-4 shrink-0 transition-all overflow-hidden" transition:slide={{ duration: 600, easing: cubicInOut }}>
					<div class="flex flex-wrap gap-x-2 gap-y-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
						{#if isReviewMode}
							<div class="flex items-center gap-1 w-[45%]">
								<div class="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm"></div>
								<span>Correct</span>
							</div>
							<div class="flex items-center gap-1 w-[45%]">
								<div class="w-2.5 h-2.5 rounded-sm bg-red-400 shadow-sm"></div>
								<span>Incorrect</span>
							</div>
							<div class="flex items-center gap-1 w-[45%]">
								<div class="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300"></div>
								<span>Skipped</span>
							</div>
						{:else}
							<div class="flex items-center gap-1 w-[45%]">
								<div class="w-2.5 h-2.5 rounded-sm bg-brand shadow-sm"></div>
								<span>Answered</span>
							</div>
							<div class="flex items-center gap-1 w-[45%]">
								<Flag class="w-2.5 h-2.5 text-red-500 fill-red-500" />
								<span>Flagged</span>
							</div>
							<div class="flex items-center gap-1 w-[45%]">
								<Bookmark class="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
								<span>Bookmarked</span>
							</div>
							<div class="flex items-center gap-1 w-[45%]">
								<div class="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200 shadow-sm"></div>
								<span>Unanswered</span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			{#if showNavigator}
				<div class="overflow-y-auto overflow-x-hidden px-4 py-3 flex flex-col gap-5 flex-1 custom-scrollbar min-h-0" transition:slide={{ duration: 600, easing: cubicInOut }}>
					<!-- Question Grid -->
					<div class="grid grid-cols-5 gap-y-3 gap-x-2 shrink-0">
						{#each questions as q, index}
							{@const isCurrent = currentQuestion ? q.id === currentQuestion.id : false}
							{@const isAnswered = q.status === "answered" || q.status === "marked-answered"}
							{@const isFlagged = q.status === "marked" || q.status === "marked-answered"}

							<button
								onclick={() => goToQuestion(index)}
								class="aspect-square w-[35px] mx-auto rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all relative
								{isCurrent
									? isReviewMode
										? q.isCorrect
											? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300 ring-offset-2'
											: 'bg-red-400 text-white shadow-md ring-2 ring-red-200 ring-offset-2'
										: 'bg-brand/50 text-white shadow-md ring-2 ring-brand/50 ring-offset-2'
									: isReviewMode
										? q.isCorrect
											? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
											: q.selectedOption !== null
												? 'bg-red-100 text-red-600 border border-red-200'
												: 'bg-slate-100 text-slate-400 border border-slate-200'
										: isAnswered
											? 'bg-brand/10 text-brand border border-brand/20'
											: q.isBookmarked
												? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
												: 'bg-white text-slate-500 border border-slate-200 hover:border-brand/40 shadow-sm'}"
							>
								{(index + 1).toString().padStart(2, "0")}
								{#if isFlagged && !isReviewMode}
									<div class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
								{/if}
								{#if q.isBookmarked && !isReviewMode}
									<div class="absolute -bottom-1 -left-1 bg-amber-500 p-0.5 rounded-br-sm rounded-tl-sm shadow-sm">
										<Bookmark class="w-1.5 h-1.5 text-white fill-white" />
									</div>
								{/if}
							</button>
						{/each}
					</div>

					<!-- Aggregate Stats Grid -->
					<div class="grid grid-cols-2 gap-2 shrink-0">
						{#if isReviewMode}
							{@const correctCount = questions.filter(q => q.isCorrect).length}
							{@const wrongCount = questions.filter(q => !q.isCorrect && q.selectedOption !== null).length}
							{@const skippedCount = questions.filter(q => q.selectedOption === null).length}
							<Card.Root class="bg-emerald-50 border-emerald-100 p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
								<span class="text-base font-black text-emerald-600 leading-none mb-1">{correctCount}</span>
								<span class="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Correct</span>
							</Card.Root>
							<Card.Root class="bg-red-50 border-red-100 p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
								<span class="text-base font-black text-red-500 leading-none mb-1">{wrongCount}</span>
								<span class="text-[8px] font-bold text-red-400 uppercase tracking-widest">Wrong</span>
							</Card.Root>
							<Card.Root class="bg-slate-50 border-slate-100 p-2.5 flex flex-col items-center justify-center text-center shadow-sm col-span-2">
								<span class="text-base font-black text-slate-400 leading-none mb-1">{skippedCount}</span>
								<span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Skipped</span>
							</Card.Root>
						{:else}
							<Card.Root class="bg-slate-50 border-slate-100 p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
								<span class="text-base font-black text-brand leading-none mb-1">{stats.answered}</span>
								<span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Answered</span>
							</Card.Root>
							<Card.Root class="bg-slate-50 border-slate-100 p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
								<span class="text-base font-black text-slate-700 leading-none mb-1">{stats.notAnswered}</span>
								<span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Remaining</span>
							</Card.Root>
							<Card.Root class="bg-slate-50 border-slate-100 p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
								<span class="text-base font-black text-slate-300 leading-none mb-1">{stats.marked}</span>
								<span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Flagged</span>
							</Card.Root>
							<Card.Root class="bg-slate-50 border-slate-100 p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
								<span class="text-base font-black text-slate-300 leading-none mb-1">{stats.bookmarked}</span>
								<span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Bookmarked</span>
							</Card.Root>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Actions section -->
			<div class="p-4 pt-3 border-t border-slate-100 flex flex-col gap-3 shrink-0">
				{#if !isReviewMode}
					<div class="flex items-center justify-between mb-1">
						<div class="flex items-center gap-2.5">
							<div class="w-7 h-7 rounded-full bg-slate-50 border-1 border-brand flex items-center justify-center">
								<Bot class="w-3.5 h-3.5 text-brand" />
							</div>
							<h3 class="font-bold text-slate-800 text-[12px]">AI Live tracking analytics</h3>
						</div>
						<Switch bind:checked={showAITracking} class="origin-right data-[state=checked]:bg-brand scale-90" />
					</div>

					{#if showAITracking}
						<div transition:slide={{ duration: 600, easing: cubicInOut }}>
							<Card.Root class="bg-[#F0F9FF] border-[#bae6fd] rounded-xl p-3 relative overflow-hidden shrink-0 shadow-none mb-1">
								<div class="grid grid-cols-2 gap-x-4 gap-y-3 z-10 relative">
									<div class="flex flex-col">
										<span class="text-[10px] font-normal text-[#0ea5e9] uppercase tracking-tight">Avg time/q</span>
										<span class="text-[12px] font-black text-[#0369a1] tabular-nums">
											{stats.answered > 0 ? Math.round(timeElapsed / stats.answered) + "s" : "--"}
										</span>
									</div>
									<div class="flex flex-col">
										<span class="text-[10px] font-normal whitespace-nowrap text-[#0ea5e9] uppercase tracking-tight">Current accuracy</span>
										<span class="text-[12px] font-black text-[#0369a1] tabular-nums">
											{stats.answered > 0 ? Math.round((stats.answered / stats.total) * 100) + "%" : "--"}
										</span>
									</div>
									<div class="flex flex-col">
										<span class="text-[10px] font-normal text-[#0ea5e9] uppercase tracking-tight">Progress</span>
										<span class="text-[12px] font-normal px-2 py-1 rounded-full w-fit mt-0.5 border-1 border-brand">
											{stats.answered}/{stats.total}
										</span>
									</div>
									<div class="flex flex-col">
										<span class="text-[10px] font-normal text-[#0ea5e9] uppercase tracking-tight">Answered</span>
										<span class="text-[12px] font-black text-[#0369a1] tabular-nums">{stats.answered}</span>
									</div>
								</div>
							</Card.Root>
						</div>
					{/if}
					<Button
						class="w-full bg-red-500 hover:bg-red-600 text-white shadow-md font-bold text-[12px] h-10 rounded-lg transition-all"
						onclick={() => (showSubmitModal = true)}
						disabled={isSubmitting}
					>
						<ArrowUp class="w-3.5 h-3.5 mr-2" />
						{isSubmitting ? "Submitting…" : "Submit & Finish"}
					</Button>
					<Button
						variant="outline"
						class="w-full border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[11px] h-9 rounded-lg shadow-sm"
					>
						<Save class="w-3.5 h-3.5 mr-2" />
						Save & Exit
					</Button>
				{:else}
					<!-- Review mode bottom panel -->
					<p class="text-[11px] text-slate-500 text-center">
						Reviewing your answers. Click <strong>AI Explanation</strong> on any question for details.
					</p>
					<Button
						class="w-full bg-brand hover:bg-brand/90 text-white font-bold text-[12px] h-10 rounded-lg"
						onclick={() => history.back()}
					>
						← Back to Results
					</Button>
				{/if}
			</div>
		</aside>
	</main>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
		border-radius: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
