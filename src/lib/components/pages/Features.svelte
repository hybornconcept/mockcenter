<script lang="ts">
	import {
		Timer,
		Bot,
		BarChart3,
		Lightbulb,
		Calculator,
		Zap,
		Check,
		X,
		Clock,
		DnaIcon,
	} from "lucide-svelte";

	const features = [
		{
			id: "cbt",
			title: "Real CBT simulation",
			description:
				"Identical to the real JAMB/WAEC interface. Timer, question navigator, flag, submit — everything matches the actual exam hall so there are zero surprises on exam day.",
			icon: Timer,
		},
		{
			id: "ai-tracking",
			title: "AI speed & accuracy tracking",
			description:
				"Analyze your performance with intelligent tracking that identifies where you stall. Improve your efficiency with precision data tailored to your speed.",
			icon: Bot,
		},
		{
			id: "analytics",
			title: "Deep analytics dashboard",
			description:
				"Visualize your progress across subjects. Identify strengths and weaknesses with comprehensive charts and personalized study pathways.",
			icon: BarChart3,
		},
		{
			id: "ai-explanations",
			title: "AI explanations for every question",
			description:
				"Never stay stuck. Get instant, simplified explanations for every question, covering core concepts and helping you master the underlying logic.",
			icon: Lightbulb,
		},
		{
			id: "calculator",
			title: "Built-in calculator",
			description:
				"The same screen calculator interface allowed in official CBT environments. Practice your math speed without leaving your session.",
			icon: Calculator,
		},
	];

	let activeId = $state("cbt");
</script>

<section id="features" class="w-full py-16 font-sans overflow-hidden bg-brand/5">
	<div class="max-w-7xl mx-auto px-6 lg:px-12">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
			<!-- LEFT COLUMN: Content & Accordion -->
			<div class="flex flex-col">
				<!-- Features Badge -->
				<div
					class="flex items-center gap-1.5 mb-4 border rounded-full border-brand px-2.5 py-1 w-fit"
				>
					<Zap class="w-3 h-3 text-brand fill-brand" />
					<span
						class="text-[9px] font-bold tracking-widest text-brand uppercase"
						>Features</span
					>
				</div>

				<!-- Heading -->
				<h2
					class="text-4xl lg:text-5xl font-black text-[#111827] leading-[1.05] tracking-tight mb-4 max-w-[450px]"
				>
					Designed to make you Excel. <br />Not just practice.
				</h2>

				<!-- Sub-paragraph -->
				<p
					class="text-[13px] text-[#6b7280] font-normal max-w-[380px] leading-[1.65] mb-8"
				>
					Every feature was designed with one goal — getting your score from
					where it is to where it needs to be.
				</p>

				<!-- Features Stack -->
				<div class="flex flex-col border-t border-gray-100">
					{#each features as feature}
						<div
							onmouseenter={() => (activeId = feature.id)}
							role="group"
							class="group flex flex-col py-4 border-b border-gray-100 transition-all text-left cursor-default"
						>
							<div class="flex items-center gap-4">
								<!-- Icon Box -->
								<div
									class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 {activeId ===
									feature.id
										? 'bg-brand/10 text-brand'
										: 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}"
								>
									<feature.icon class="w-[18px] h-[18px]" strokeWidth={1.2} />
								</div>

								<h3
									class="text-[14px] transition-all duration-300 {activeId ===
									feature.id
										? 'text-brand font-bold'
										: 'text-[#111827] group-hover:text-gray-600'}"
								>
									{feature.title}
								</h3>
							</div>

							<div
								class="pl-[48px] pr-8 overflow-hidden transition-all duration-300 ease-in-out"
								style="max-height: {activeId === feature.id
									? '100px'
									: '0px'}; margin-top: {activeId === feature.id
									? '8px'
									: '0px'};"
							>
								<p class="text-[12px] text-[#6b7280] leading-[1.6]">
									{feature.description}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- RIGHT COLUMN: Interface Mockup -->
			<div
				class="relative flex items-center justify-center lg:pt-14 w-full max-w-[480px] mx-auto"
			>
				<!-- Mockup Interface Frame -->
				<div
					class="w-full max-w-[480px] bg-white rounded-3xl shadow-[8px_10px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative z-10 transition-transform duration-700 hover:-translate-y-2"
				>
					<!-- Window Controls -->
					<div
						class="px-5 py-3 border-b border-gray-100 flex items-center gap-1.5"
					>
						<div class="w-2 h-2 rounded-full bg-[#ff5f57]"></div>
						<div class="w-2 h-2 rounded-full bg-[#febc2e]"></div>
						<div class="w-2 h-2 rounded-full bg-[#28c840]"></div>
					</div>

					<div class="p-6">
						<!-- Mockup Header -->
						<div class="flex justify-between items-center mb-5">
							<div class="flex items-center gap-2.5">
								<div
									class="w-7 h-7 rounded-lg bg-brand/5 flex items-center justify-center"
								>
									<Zap class="w-3.5 h-3.5 text-brand" />
								</div>
								<span class="text-[12px] font-bold text-[#111827]"
									>Physics · JAMB 2023</span
								>
							</div>
							<div
								class="px-2.5 py-0.5 bg-brand/5 rounded-full border border-brand/10"
							>
								<span class="text-[12px] font-bold text-brand">14:22</span>
							</div>
						</div>

						<!-- Question content -->
						<h4
							class="text-[14px] font-semibold text-[#111827] leading-[1.4] mb-5 pr-12"
						>
							Calculate the force required to accelerate a 5kg mass at 10m/s².
						</h4>

						<!-- Options grid -->
						<div class="flex flex-col gap-2.5 mb-5">
							<!-- Option A -->
							<div
								class="flex items-center gap-3.5 p-3.5 border border-gray-100 rounded-xl transition-all"
							>
								<div
									class="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500"
								>
									A
								</div>
								<span
									class="text-[12px] text-gray-600 font-medium tracking-tight"
									>2 N</span
								>
							</div>

							<!-- Option B (Selected/Incorrect) -->
							<div
								class="flex items-center gap-3.5 p-3.5 border border-red-100 bg-red-50/50 rounded-xl transition-all"
							>
								<div
									class="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-red-200"
								>
									B
								</div>
								<span class="text-[12px] text-red-600 font-bold tracking-tight"
									>15 N <span class="ml-1 opacity-60 font-normal">X</span></span
								>
								<X class="w-3 h-3 text-red-500 ml-auto" strokeWidth={3} />
							</div>

							<!-- Option C (Correct Highlight) -->
							<div
								class="flex items-center gap-3.5 p-3.5 border-2 border-brand bg-brand/10 rounded-xl transition-all relative"
							>
								<div
									class="w-6 h-6 rounded-lg bg-brand flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-brand/20"
								>
									C
								</div>
								<span class="text-[12px] font-bold tracking-tight text-brand"
									>50 N <span class="ml-1 opacity-60 font-normal">✓</span></span
								>
								<Check class="w-3.5 h-3.5 text-brand ml-auto" strokeWidth={3} />
							</div>

							<!-- Option D -->
							<div
								class="flex items-center gap-3.5 p-3.5 border border-gray-100 rounded-xl transition-all"
							>
								<div
									class="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500"
								>
									D
								</div>
								<span
									class="text-[12px] text-gray-600 font-medium tracking-tight"
									>500 N</span
								>
							</div>
						</div>

						<!-- AI Insights Box -->
						<div class="bg-brand/5 rounded-xl p-5 border border-brand/10">
							<div class="flex items-center gap-2 mb-2.5">
								<Bot class="w-3.5 h-3.5 text-brand" />
								<span class="text-[12px] font-bold text-brand"
									>AI Explanation</span
								>
							</div>
							<p
								class="text-[11.5px] text-brand/80 leading-relaxed font-medium"
							>
								Using Newton's Second Law (F=ma), 5kg × 10m/s² = 50N. You
								answered correctly, although your accuracy on Dynamics is 42%.
								Try focusing more on unit conversion.
							</p>
						</div>
					</div>
				</div>

				<!-- Decorative backgrounds -->
				<div
					class="absolute inset-0 bg-[#f9fafb] translate-x-6 translate-y-7 rounded-4xl border border-gray-100"
				></div>
				<div
					class="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 rounded-full blur-3xl"
				></div>
			</div>
		</div>
	</div>
</section>
