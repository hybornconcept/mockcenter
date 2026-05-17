<script lang="ts">
	import { Bot, Zap, Target, LineChart, Map as MapIcon } from "@lucide/svelte";

	const features = [
		{
			title: "Real-time speed analysis",
			description:
				"Tracks seconds per question. Detects rushing or slowness per subject with specific advice to fix it.",
			icon: Zap,
			bgColor: "bg-brand/10",
			iconColor: "text-brand",
		},
		{
			title: "JAMB readiness score",
			description:
				"A live score out of 100 showing how ready you are. Updates after every session with actionable next steps.",
			icon: Target,
			bgColor: "bg-brand/10",
			iconColor: "text-brand",
		},
		{
			title: "Predicted final score",
			description:
				"AI predicts your likely real exam score and tells you exactly how many days of practice to hit your target.",
			icon: LineChart,
			bgColor: "bg-brand/10",
			iconColor: "text-brand",
		},
		{
			title: "Personalised study plan",
			description:
				"Daily schedule built around your exam date, weak topics, and current pace. Just follow the plan.",
			icon: MapIcon,
			bgColor: "bg-brand/10",
			iconColor: "text-brand",
		},
	];

	const stats = [
		{ name: "Biology", score: 85, color: "bg-green-500" },
		{ name: "English", score: 72, color: "bg-emerald-400" },
		{ name: "Maths", score: 64, color: "bg-orange-500" },
		{ name: "Physics", score: 42, color: "bg-red-500" },
		{ name: "Chemistry", score: 38, color: "bg-rose-600" },
	];

	import { onMount } from "svelte";

	// Typewriter effect logic
	const messageSegments = [
		{ text: "You are rushing Chemistry questions ", class: "" },
		{ text: "(22s avg)", class: "text-white font-medium ml-1" },
		{ text: " causing careless errors. Practice ", class: "" },
		{ text: "Organic Chemistry", class: "text-brand font-medium" },
		{
			text: " without timer first. At your current rate, you'll reach 80/100 in ",
			class: "",
		},
		{ text: "18 days", class: "text-white font-bold" },
		{ text: ".", class: "" },
	];

	let displayedChars = $state(0);
	const totalChars = messageSegments.reduce(
		(sum, seg) => sum + seg.text.length,
		0,
	);

	onMount(() => {
		let forward = true;
		const interval = setInterval(() => {
			if (displayedChars < totalChars) {
				displayedChars++;
			} else {
				// Once finished, wait 5 seconds and restart
				clearInterval(interval);
				setTimeout(() => {
					displayedChars = 0;
					// Re-run the mount logic by calling a helper or just restart interval
					startTyping();
				}, 5000);
			}
		}, 30);

		function startTyping() {
			const subInterval = setInterval(() => {
				if (displayedChars < totalChars) {
					displayedChars++;
				} else {
					clearInterval(subInterval);
					setTimeout(() => {
						displayedChars = 0;
						startTyping();
					}, 5000);
				}
			}, 30);
		}

		return () => clearInterval(interval);
	});

	function getVisibleText(segmentIndex: number, currentGlobalChars: number) {
		let charsBefore = 0;
		for (let i = 0; i < segmentIndex; i++) {
			charsBefore += messageSegments[i].text.length;
		}

		const charsInThisSegment = messageSegments[segmentIndex].text.length;
		const relativeVisible = currentGlobalChars - charsBefore;

		if (relativeVisible <= 0) return "";
		if (relativeVisible >= charsInThisSegment)
			return messageSegments[segmentIndex].text;
		return messageSegments[segmentIndex].text.slice(0, relativeVisible);
	}
</script>

<section class="w-full py-12 bg-white font-sans overflow-hidden">
	<div class="max-w-6xl mx-auto px-6 lg:px-12">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- LEFT COLUMN: Content -->
			<div>
				<div
					class="flex items-center gap-1.5 mb-4 uppercase tracking-[0.2em] font-bold text-[8px] text-brand"
				>
					<Bot class="w-3 h-3" />
					<span>AI-Powered Coaching</span>
				</div>

				<h2
					class="text-2xl md:text-3xl lg:text-4xl font-black text-[#111827] leading-[1.1] tracking-tight mb-5"
				>
					Your <span class="italic font-normal text-brand">personal</span>
					<br />
					<span class="text-brand">AI</span> exam coach
				</h2>

				<p
					class="text-sm text-[#6b7280] font-normal leading-relaxed mb-8 max-w-md"
				>
					Mockcenter doesn't just test you — it coaches you. Our AI analyses
					every session to tell you exactly what to fix and how.
				</p>

				<div class="space-y-3.5">
					{#each features as feature}
						<div
							class="flex items-start gap-3.5 p-3.5 rounded-xl border border-brand/20 hover:border-brand/50 bg-[#f9fafb]/50 transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-black/5 group"
						>
							<div
								class="w-7 h-7 rounded-lg {feature.bgColor} flex items-center justify-center shrink-0"
							>
								<feature.icon
									class="w-3.5 h-3.5 {feature.iconColor}"
									strokeWidth={1.5}
								/>
							</div>
							<div>
								<h3
									class="text-[12.5px] font-bold text-[#111827] mb-0.5 group-hover:text-brand transition-colors"
								>
									{feature.title}
								</h3>
								<p
									class="text-[12px] text-[#6b7280] font-normal leading-relaxed"
								>
									{feature.description}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- RIGHT COLUMN: Visual Identity -->
			<div class="relative group">
				<!-- Decorative Glow -->
				<div
					class="absolute -inset-12 bg-brand/10 rounded-full blur-[100px] opacity-40 transition-opacity duration-700 group-hover:opacity-60"
				></div>

				<!-- Mockup Card -->
				<div
					class="relative bg-gradient-to-br from-[#133a57] via-[#00172e] to-[#000a14] rounded-2xl px-6 py-8 lg:px-7 lg:py-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden max-w-[440px] mx-auto lg:ml-auto"
				>
					<!-- Card Header -->
					<div class="flex items-center gap-2 mb-8">
						<div
							class="w-4 h-4 rounded-sm bg-brand/20 flex items-center justify-center"
						>
							<Bot class="w-2.5 h-2.5 text-brand" />
						</div>
						<span
							class="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase"
							>JAMB readiness score</span
						>
					</div>

					<!-- Main Score Display -->
					<div class="flex items-baseline gap-3 mb-10">
						<div
							class="text-6xl font-black text-white tracking-[-0.05em] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
						>
							68
						</div>
						<div class="text-lg font-bold text-white/20 italic">/100</div>
						<div class="ml-auto text-right">
							<p class="text-[9px] text-[#94a3b8] font-medium leading-tight">
								You need <span class="text-white">80+</span> to <br /> reach
								your <span class="text-brand">280 target</span>
							</p>
						</div>
					</div>

					<!-- Stats Grid -->
					<div class="space-y-5 mb-10">
						{#each stats as stat}
							<div class="flex items-center gap-4">
								<span class="text-[10px] font-bold text-white/40 w-14 shrink-0"
									>{stat.name}</span
								>
								<div class="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
									<div
										class="h-full bg-gradient-to-r transition-all duration-[1.5s] ease-out-expo
										{stat.name === 'Biology' ? 'from-green-600 to-green-400' : ''}
										{stat.name === 'English' ? 'from-emerald-600 to-emerald-400' : ''}
										{stat.name === 'Maths' ? 'from-orange-600 to-orange-400' : ''}
										{stat.name === 'Physics' ? 'from-red-600 to-red-400' : ''}
										{stat.name === 'Chemistry' ? 'from-rose-600 to-rose-400' : ''}"
										style="width: {stat.score}%"
									></div>
								</div>
								<span
									class="text-[10px] font-black w-7 text-right {stat.name ===
										'Biology' || stat.name === 'English'
										? 'text-green-500'
										: stat.score > 60
											? 'text-orange-500'
											: 'text-rose-500'}">{stat.score}%</span
								>
							</div>
						{/each}
					</div>

					<!-- AI Recommendation Box -->
					<div
						class="p-4 rounded-xl bg-brand/5 border border-brand/10 backdrop-blur-sm"
					>
						<div class="flex items-center gap-2 mb-2.5">
							<Bot class="w-3 h-3 text-brand" />
							<span
								class="text-[9px] font-bold text-brand uppercase tracking-wider"
								>A.I recommendation for today</span
							>
						</div>
						<p
							class="text-[12px] text-[#94a3b8] font-normal leading-relaxed min-h-[40px]"
						>
							{#each messageSegments as segment, i}
								<span class={segment.class}>
									{getVisibleText(i, displayedChars)}
								</span>
							{/each}
							{#if displayedChars < totalChars}
								<span
									class="inline-block w-1.5 h-3 bg-brand/80 ml-0.5 animate-pulse rounded-sm"
								></span>
							{/if}
						</p>
					</div>
				</div>

				<!-- Decorative Dot -->
				<div
					class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#65a30d] shadow-[0_0_15px_rgba(101,163,13,0.5)] z-20"
				></div>
			</div>
		</div>
	</div>
</section>
