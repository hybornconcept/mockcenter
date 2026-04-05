<script lang="ts">
	import {
		GraduationCap,
		BookOpen,
		FileEdit,
		School,
		Library,
		CalendarDays,
		Timer,
	} from "lucide-svelte";

	const exams = [
		{
			id: "jamb",
			title: "JAMB / UTME\nPreparation",
			description:
				"The gateway to Nigerian universities. Practice all subjects with the exact same format as the real exam, featuring comprehensive coverage of the official...",
			icon: GraduationCap,
			isPopular: true,
			stats: {
				questions: "6,200+ questions",
				years: "2000 - 2024",
				duration: "180 questions · 120 mins",
			},
		},
		{
			id: "waec",
			title: "WAEC / SSCE\nExcellence",
			description:
				"West African Senior School Certificate. Required for graduation and university admission, covering all elective and core subjects with detailed explanations...",
			icon: BookOpen,
			stats: {
				questions: "7,400+ questions",
				years: "2000 - 2024",
				duration: "Per-subject timing",
			},
		},
		{
			id: "neco",
			title: "NECO\nCertification",
			description:
				"National Examinations Council. Nigeria's widely accepted alternative to WAEC for university admission, featuring the latest curriculum-based questions that...",
			icon: FileEdit,
			stats: {
				questions: "4,800+ questions",
				years: "2005 - 2024",
				duration: "Per-subject timing",
			},
		},
		{
			id: "post-utme",
			title: "Post-UTME\nScreening",
			description:
				"University-specific screening tests. Prepare for 20+ school CBTs after your JAMB result with institutional past questions and highly optimized mock environments...",
			icon: School,
			stats: {
				questions: "20+ universities",
				years: "Coming soon",
				duration: "School-specific",
			},
		},
	];
	let expandedExams = $state(new Set<string>());

	function toggleExpand(id: string) {
		if (expandedExams.has(id)) {
			expandedExams.delete(id);
		} else {
			expandedExams.add(id);
		}
	}
</script>

<section id="exams" class="w-full pt-4 pb-16 px-4 font-sans antialiased text-[#111827]">
	{#snippet statBadge(icon: any, text: string)}
		{@const Icon = icon}
		<div
			class="bg-brand/5 border border-brand/10 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.06)] group-hover:border-gray-200/50"
		>
			<Icon class="w-[9px] h-[9px] text-brand" strokeWidth={2.5} />
			<span
				class="text-[8.5px] font-semibold text-gray-500 whitespace-nowrap tracking-wide"
				>{text}</span
			>
		</div>
	{/snippet}

	<div class="max-w-6xl mx-auto flex flex-col gap-8">
		<!-- HEADER SECTION -->
		<div
			class="flex flex-col md:flex-row justify-between items-end gap-10 md:gap-20 pl-2"
		>
			<div class="flex flex-col gap-5 max-w-[600px]">
				<!-- Badge (Exactly Matching Image) -->
				<div
					class="inline-flex items-center gap-2 bg-[#0b7b7e]/10 pl-1 pr-3 py-1 rounded-full shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] self-start border border-[#0b7b7e]/15"
				>
					<div
						class="w-5 h-5 bg-brand rounded-full flex items-center justify-center text-white text-[9px] font-bold"
					>
						1
					</div>
					<span class="text-[9.5px] font-bold text-[#0b7b7e] tracking-[0.01em]"
						>Exams covered</span
					>
				</div>

				<!-- Main Title (Exactly Matching Image's font weight and spacing) -->
				<h2
					class="text-6xl font-extrabold text-[#111827] leading-[1.05] tracking-[-0.03em]"
				>
					Every major exam. <br />
					One platform !
				</h2>
			</div>

			<p
				class="text-sm italic text-[#6b7280] font-normal max-w-[450px] leading-[1.7] md:pb-1"
			>
				<span class="font-bold text-brand tracking-wide"
					>Real exam questions. Real exam conditions. Real results.
				</span>
				<br />Not practice questions someone wrote — actual past papers from
				every official exam body, verified and explained by AI.
			</p>
		</div>

		<!-- CARDS GRID -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
			{#each exams as exam}
				<div
					class="group bg-white p-5 pt-6 pb-5 rounded-lg border border-[#0b7b7e]/30 shadow-[0_4px_16px_-6px_rgba(11,123,126,0.15)] hover:shadow-[0_12px_28px_-6px_rgba(11,123,126,0.25)] hover:border-[#0b7b7e]/70 hover:-translate-y-1.5 transition-all duration-300 ease-out box-border flex flex-col relative h-[270px]"
				>
					<div class="flex justify-between items-start mb-5">
						<!-- Icon Container -->
						<div
							class="w-[36px] h-[36px] bg-brand rounded-md flex items-center justify-center shrink-0"
						>
							<exam.icon class="w-4 h-4 text-white" strokeWidth={1.5} />
						</div>

						<!-- Stats Badges individual pills -->
						<div class="flex flex-col items-end gap-1.5 shrink-0 z-10 relative">
							{#each [{ icon: Library, text: exam.stats.questions }, { icon: CalendarDays, text: exam.stats.years }, { icon: Timer, text: exam.stats.duration }] as stat}
								{@render statBadge(stat.icon, stat.text)}
							{/each}
						</div>
					</div>

					<!-- Content Area -->
					<div class="flex flex-col gap-2 relative">
						<h3 class="text-sm font-bold whitespace-pre-line tracking-tight">
							{exam.title}
						</h3>

						<div
							class="relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
							style="max-height: {expandedExams.has(exam.id)
								? '400px'
								: '52px'};"
						>
							<p class="text-[11px] text-[#6b7280] font-normal leading-[1.65]">
								{expandedExams.has(exam.id)
									? exam.description.replace("...", "")
									: exam.description}
							</p>

							{#if !expandedExams.has(exam.id)}
								<!-- Advanced Fade Overlay -->
								<div
									class="absolute bottom-0 left-0 w-full h-2 bg-linear-to-t from-white via-white/20 to-transparent pointer-events-none"
								></div>
							{/if}
						</div>
					</div>

					<!-- View More (Exactly Matching Image's position and style) -->
					<button
						onclick={() => toggleExpand(exam.id)}
						class="mt-auto self-end text-brand text-[9.5px] font-bold tracking-wide hover:opacity-80 transition-opacity z-10 relative bg-white/50 backdrop-blur-[2px] px-1 -mr-1"
					>
						{expandedExams.has(exam.id) ? "View Less" : "View More..."}
					</button>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	:global(body) {
		font-family:
			"Inter",
			-apple-system,
			BlinkMacSystemFont,
			"Segoe UI",
			Roboto,
			sans-serif;
	}
</style>
