<script lang="ts">
	import {
		LayoutGrid,
		Dna,
		FlaskConical,
		Atom,
		Calculator,
		PenLine,
		Globe,
		TrendingUp,
		ScrollText,
		LoaderPinwheel,
	} from "@lucide/svelte";

	const subjects = [
		{
			name: "Biology",
			icon: Dna,
			questions: "1,820",
			score: 78,
			color: "bg-green-500",
			bgColor: "bg-green-50",
			textColor: "text-green-600",
		},
		{
			name: "Chemistry",
			icon: FlaskConical,
			questions: "1,760",
			score: 48,
			color: "bg-red-500",
			bgColor: "bg-red-50",
			textColor: "text-red-600",
		},
		{
			name: "Physics",
			icon: Atom,
			questions: "1,680",
			score: 55,
			color: "bg-blue-500",
			bgColor: "bg-blue-50",
			textColor: "text-blue-600",
		},
		{
			name: "Mathematics",
			icon: Calculator,
			questions: "1,950",
			score: 61,
			color: "bg-amber-600",
			bgColor: "bg-amber-50",
			textColor: "text-amber-700",
		},
		{
			name: "English Language",
			icon: PenLine,
			questions: "2,100",
			score: 70,
			color: "bg-emerald-500",
			bgColor: "bg-emerald-50",
			textColor: "text-emerald-600",
		},
		{
			name: "Government",
			icon: Globe,
			questions: "1,400",
			score: 63,
			color: "bg-orange-600",
			bgColor: "bg-orange-50",
			textColor: "text-orange-700",
		},
		{
			name: "Economics",
			icon: TrendingUp,
			questions: "1,350",
			score: 58,
			color: "bg-amber-700",
			bgColor: "bg-amber-50",
			textColor: "text-amber-800",
		},
		{
			name: "History",
			icon: ScrollText,
			questions: "840",
			score: 66,
			color: "bg-teal-600",
			bgColor: "bg-teal-50",
			textColor: "text-teal-700",
		},
	];
</script>

<section class="w-full py-14 bg-brand/5 font-sans overflow-hidden">
	<div class="max-w-6xl mx-auto px-6 lg:px-12">
		<!-- Header -->
		<div class="flex flex-col mb-10 relative">
			<div
				class="flex items-center gap-1.5 mb-4 border border-brand rounded-full px-2 py-1 w-fit"
			>
				<LayoutGrid class="w-3 h-3 text-brand" />
				<span class="text-[8px] font-bold tracking-[0.2em] text-brand uppercase"
					>Subjects</span
				>
			</div>

			<!-- Rotating Fan (Top-Right) -->
			<div class="hidden lg:block absolute top-0 right-0 text-brand/20">
				<LoaderPinwheel
					class="w-10 h-10 animate-[spin_10s_linear_infinite]"
					strokeWidth={1}
				/>
				<div
					class="absolute inset-0 flex items-center justify-center text-brand"
				>
					<div
						class="w-1 h-1 rounded-full bg-brand shadow-[0_0_10px_rgba(11,123,126,0.4)]"
					></div>
				</div>
			</div>

			<div class="flex justify-between items-end w-full">
				<h2
					class="text-2xl md:text-3xl lg:text-4xl font-black text-[#111827] leading-[1.1] tracking-tight"
				>
					30+ <span class="italic font-normal text-brand"
						>subjects & Courses</span
					>.
					<br />
					25,000+
					<span class="italic font-normal text-brand">questions</span>.
				</h2>

				<p
					class="text-sm text-[#6b7280] font-normal leading-relaxed text-right mb-1.5"
				>
					Every subject you need, all past years, <br class="hidden md:block" />
					all in one place.
				</p>
			</div>
		</div>

		<!-- Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each subjects as subject}
				<div
					class="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-1 group"
				>
					<!-- Card Top -->
					<div class="flex justify-between items-start mb-4">
						<div
							class="w-7 h-7 rounded-lg {subject.bgColor} flex items-center justify-center"
						>
							<subject.icon
								class="w-3.5 h-3.5 {subject.textColor}"
								strokeWidth={1.2}
							/>
						</div>
						<span class="text-[9px] font-bold text-gray-400"
							>{subject.questions} q</span
						>
					</div>

					<!-- Subject Title -->
					<h3 class="text-[12.5px] font-bold text-[#111827] mb-3">
						{subject.name}
					</h3>

					<!-- Progress Bar Section -->
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<span
								class="text-[8px] font-bold text-gray-400 uppercase tracking-wider"
								>Avg score</span
							>
							<span class="text-[9px] font-black {subject.textColor}"
								>{subject.score}%</span
							>
						</div>
						<div class="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
							<div
								class="h-full {subject.color} transition-all duration-1000 ease-out"
								style="width: {subject.score}%"
							></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
