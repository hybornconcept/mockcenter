<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import {
		CheckSquare,
		ChevronDown,
		MoreHorizontal,
		Check,
		Image as ImageIcon,
		Trash,
		Flag,
		Bookmark,
		Calculator,
		ArrowLeft,
		ArrowRight,
		Eraser,
		TriangleAlert,
	} from "lucide-svelte";

	let {
		question,
		onSelectOption,
		onPrevPage,
		onNextPage,
		onToggleCalculator,
		isCalculatorActive = false,
		fontSize = 15,
		onToggleFlag,
		onToggleBookmark,
		onClearOption,
		onReportIssue,
		onChangeFontSize,
	}: {
		question: Question;
		onSelectOption: (id: number, idx: number) => void;
		onPrevPage?: () => void;
		onNextPage?: () => void;
		onToggleCalculator?: () => void;
		isCalculatorActive?: boolean;
		fontSize?: number;
		onToggleFlag?: () => void;
		onToggleBookmark?: () => void;
		onClearOption?: () => void;
		onReportIssue?: () => void;
		onChangeFontSize?: (delta: number) => void;
	} = $props();

	let isFlagged = $derived(
		question.status === "marked" || question.status === "marked-answered",
	);
</script>

<Card.Root class="overflow-hidden border-slate-200 shadow-sm mb-10 rounded-xl">
	<Card.Header
		class="px-4 py-0.5 flex flex-row items-center justify-between space-y-0"
	>
		<div class="flex items-center gap-2.5">
			<div
				class="w-6 h-6 bg-brand text-white rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 shadow-sm"
			>
				?
			</div>
			<h2 class="font-semibold text-slate-800 text-[15px] leading-tight">
				Question {question.id} <span class="text-red-600 ml-0.5">*</span>
			</h2>
		</div>
		<div
			class="flex items-center gap-4 px-4 py-1 bg-white border border-slate-100 rounded-full shadow-sm ring-1 ring-slate-200/50"
		>
			<!-- Font Controls -->
			<div class="flex items-center gap-4 mr-1">
				<button
					class="text-[15px] font-bold text-slate-500 hover:text-brand transition-colors"
					onclick={() => onChangeFontSize?.(-1)}>A-</button
				>
				<span class="text-[15px] font-black text-brand tracking-tight"
					>{fontSize}</span
				>
				<button
					class="text-[15px] font-bold text-slate-500 hover:text-brand transition-colors"
					onclick={() => onChangeFontSize?.(1)}>A+</button
				>
			</div>

			<Separator orientation="vertical" class="h-4 bg-slate-200" />

			<!-- Action Icons -->
			<div class="flex items-center gap-5 ml-1">
				<button
					class="transition-transform hover:scale-110"
					onclick={onToggleFlag}
				>
					<Flag
						class="w-5 h-5 {isFlagged
							? 'text-red-500 fill-red-500'
							: 'text-slate-400 fill-red-500/5'}"
					/>
				</button>
				<button
					class="transition-all hover:scale-110 hover:bg-slate-100 p-1 rounded-lg text-slate-500 hover:text-brand"
					onclick={onClearOption}
					title="Clear Selection"
				>
					<Eraser class="w-5 h-5" />
				</button>
				<button
					class="transition-transform hover:scale-110"
					onclick={onReportIssue}
				>
					<TriangleAlert class="w-5 h-5 text-amber-500" />
				</button>
			</div>
		</div>
	</Card.Header>

	<Separator class="mx-4 opacity-60 w-auto" />

	<Card.Content class="py-4 px-8">
		<div class="mb-5">
			<div
				class="bg-slate-50/80 rounded-xl p-4 text-slate-800 font-medium leading-relaxed border border-slate-100 shadow-inner group-hover:bg-white transition-all duration-300"
				style="font-size: {fontSize}px"
			>
				{#each question.text.split("\n\n") as paragraph}
					<p class="mb-2 last:mb-0">{paragraph}</p>
				{/each}
			</div>
		</div>

		<div class="space-y-3">
			<div class="space-y-1.5">
				{#each question.options as option, idx}
					<button
						class="w-full flex items-center group p-1 rounded-lg border transition-all duration-300 relative text-left
                        {question.selectedOption === idx
							? 'border-brand bg-brand/10 animate-bounce-custom z-10 ring-1 ring-brand'
							: 'border-transparent hover:bg-slate-50'}"
						onclick={() => onSelectOption(question.id, idx)}
					>
						<div class="w-10 h-8 flex items-center justify-center shrink-0">
							<div
								class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                                {question.selectedOption === idx
									? 'border-brand bg-brand'
									: 'border-slate-300 bg-white'}"
							>
								{#if question.selectedOption === idx}
									<Check class="w-2.5 h-2.5 text-white" />
								{/if}
							</div>
						</div>

						<div
							class="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-700 font-medium transition-colors group-hover:bg-slate-100 flex items-center gap-2.5
                            {question.selectedOption === idx
								? 'bg-white border-brand/30'
								: ''}"
							style="font-size: {fontSize - 1}px"
						>
							<span
								class="flex items-center justify-center w-5 h-5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm shrink-0"
							>
								{String.fromCharCode(65 + idx)}
							</span>

							<span>{option}</span>

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
	</Card.Content>

	<Card.Footer class="px-6 py-2.5 flex items-center justify-between bg-white">
		<div class="flex items-center gap-2.5">
			<Button
				variant="outline"
				class="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-[30px] shadow-sm font-normal px-5 {isFlagged
					? 'bg-red-50 border-red-200 text-red-600'
					: ''}"
				onclick={onToggleFlag}
			>
				<Flag
					class="w-4 h-4 mr-2 {isFlagged
						? 'text-red-500 fill-red-500/20'
						: 'text-red-500 fill-red-500/10'}"
				/>
				{isFlagged ? "Flagged" : "Flag"}
			</Button>
			<Button
				variant="outline"
				class="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-[30px] shadow-sm font-normal px-5 {question.isBookmarked
					? 'bg-amber-50 border-amber-200 text-amber-600'
					: ''}"
				onclick={onToggleBookmark}
			>
				<Bookmark
					class="w-4 h-4 mr-2 {question.isBookmarked
						? 'text-amber-500 fill-amber-500/20'
						: 'text-slate-400'}"
				/>
				{question.isBookmarked ? "Bookmarked" : "Bookmark"}
			</Button>
			<Button
				variant={isCalculatorActive ? "secondary" : "outline"}
				class="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-[30px] shadow-sm font-normal px-5 {isCalculatorActive
					? 'bg-brand text-white border-brand hover:bg-brand/90'
					: ''}"
				onclick={onToggleCalculator}
			>
				<Calculator
					class="w-4 h-4 mr-2 {isCalculatorActive
						? 'text-white'
						: 'text-slate-400'}"
				/>
				Calculator
			</Button>
		</div>

		<div class="flex items-center gap-3">
			<Button
				variant="outline"
				class="border-slate-100/50 text-slate-300 hover:bg-slate-50 rounded-2xl px-6 h-[38px] font-normal shadow-none"
				onclick={onPrevPage}
			>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Prev
			</Button>
			<Button
				class="bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20 rounded-2xl px-8 h-[38px] font-normal transition-all"
				onclick={onNextPage}
			>
				Next
				<ArrowRight class="w-4 h-4 ml-2" />
			</Button>
		</div>
	</Card.Footer>
</Card.Root>

<style>
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
