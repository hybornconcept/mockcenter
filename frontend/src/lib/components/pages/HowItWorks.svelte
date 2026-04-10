<script lang="ts">
	import { Rocket } from "lucide-svelte";

	const steps = [
		{
			number: 1,
			title: "Create your account",
			description:
				"Sign up free in 30 seconds. Set your exam, subjects, and target score. No credit card needed.",
		},
		{
			number: 2,
			title: "Pick your subject",
			description:
				"Choose exam type, subject, year range, and number of questions. AI suggests what to practice first.",
		},
		{
			number: 3,
			title: "Practice with purpose",
			description:
				"Answer past questions under real exam conditions. AI tracks speed, flags weak spots, and explains every answer.",
		},
		{
			number: 4,
			title: "Track & improve",
			description:
				"Watch your score climb with analytics, daily targets, and an AI study plan built around your exam date.",
		},
	];
</script>

<section class="w-full py-16 bg-white font-sans">
	<div class="max-w-6xl mx-auto px-6 lg:px-12 text-center">
		<!-- Section Badge -->
		<div
			class="flex items-center justify-center gap-1.5 mb-5 border border-brand rounded-full w-fit mx-auto px-2 py-1"
		>
			<Rocket class="w-3.5 h-3.5 text-brand" />
			<span class="text-[9px] font-bold tracking-[0.2em] text-brand uppercase"
				>How It Works</span
			>
		</div>

		<!-- Main Heading -->
		<h2
			class="text-3xl md:text-4xl lg:text-5xl font-black text-[#111827] leading-[1.2] tracking-normal mb-14 max-w-4xl mx-auto"
		>
			From <span class="text-brand italic font-normal">sign-up</span>
			<br class="hidden md:block" />
			to <span class="text-brand italic font-normal">exam-ready</span> in minutes
		</h2>

		<!-- Steps Row -->
		<div class="relative">
			<!-- Connecting Line (Desktop) -->
			<div
				class="absolute top-6 left-0 w-full h-[1px] bg-brand/10 hidden lg:block -z-0"
			></div>

			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10"
			>
				{#each steps as step}
					<div class="flex flex-col items-center group">
						<!-- Number Circle -->
						<div
							class="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white text-base font-black mb-6 transition-all duration-500 group-hover:scale-110 shadow-xl shadow-brand/10 ring-8 ring-white"
						>
							{step.number}
						</div>

						<!-- Content -->
						<div class="px-3">
							<h3
								class="text-[15px] font-bold text-[#111827] mb-2.5 transition-colors group-hover:text-brand"
							>
								{step.title}
							</h3>
							<p
								class="text-[12px] text-[#6b7280] font-normal leading-relaxed max-w-[260px] mx-auto"
							>
								{step.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
