<script lang="ts">
	import {
		Gift,
		Trophy,
		PartyPopper,
		Crown,
		Infinity,
		Zap,
		ChevronRight,
		Star,
		Sparkles,
	} from "lucide-svelte";

	const benefits = [
		{
			title: "You earn per referral",
			description:
				"Instantly credited when your friend makes their first purchase",
			icon: Trophy,
			bgColor: "bg-amber-500/10",
			iconColor: "text-amber-500",
		},
		{
			title: "Friend gets on sign-up",
			description:
				"Welcome bonus credited instantly when they create their account",
			icon: PartyPopper,
			bgColor: "bg-blue-500/10",
			iconColor: "text-blue-500",
		},
		{
			title: "Champion tier bonus",
			description:
				"Refer 15+ friends and earn 100 credits per referral + cash option",
			icon: Crown,
			bgColor: "bg-purple-500/10",
			iconColor: "text-purple-500",
		},
	];

	const steps = [
		{ number: 1, text: "Share your link" },
		{ number: 2, text: "Friend signs up" },
		{ number: 3, text: "Friend buys credits" },
		{ number: 4, text: "You both earn!" },
	];
</script>

<section id="refer" class="w-full py-12 bg-brand/5 font-sans overflow-hidden">
	<div class="max-w-6xl mx-auto px-6 lg:px-12">
		<!-- Main Dark Card -->
		<div
			class="relative overflow-hidden rounded-[2rem] bg-[#121629] text-white p-8 lg:p-12 shadow-2xl border border-white/5 group hover:border-brand/40 transition-all duration-500"
		>
			<!-- Premium Dashboard Accents (Card 2 Style) -->
			<div class="absolute -left-20 top-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-1000"></div>
			<div class="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none"></div>

			<!-- Grid Pattern Overlay (Refined Opacity & Mask) -->
			<svg 
				class="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" 
				viewBox="0 0 400 200" 
				preserveAspectRatio="none"
				style="mask-image: linear-gradient(to right, black 40%, transparent 90%); -webkit-mask-image: linear-gradient(to right, black 40%, transparent 90%);"
			>
				<defs><pattern id="referral-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" stroke-width="1"/></pattern></defs>
				<rect width="100%" height="100%" fill="url(#referral-grid)" />
			</svg>

			<!-- Pulsed Decorations (Card 2 Style) -->
			<div class="absolute top-[10%] right-[30%] text-amber-300/20 animate-pulse"><Star class="w-8 h-8" /></div>
			<div class="absolute bottom-[15%] left-[30%] text-indigo-300/10"><Sparkles class="w-12 h-12" /></div>

			<div
				class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
			>
				<!-- Left Column: Content -->
				<div class="lg:col-span-7">
					<div
						class="flex items-center gap-2 mb-6 text-[10px] font-bold tracking-[0.2em] text-brand uppercase"
					>
						<Gift class="w-3.5 h-3.5" />
						<span>Referral Program</span>
					</div>

					<h2
						class="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6"
					>
						Refer friends. <br />
						Earn <span class="italic font-normal text-brand">free <br /> credits.</span> <br />
						No limits.
					</h2>

					<p
						class="text-[13px] text-gray-400 font-normal leading-relaxed mb-10 max-w-lg"
					>
						Share your unique referral link with classmates. When a friend signs
						up and buys credits, you both earn instantly — <span
							class="text-white">forever</span
						>, with no cap on how many friends you can refer.
					</p>

					<button
						class="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 mb-12 shadow-xl shadow-brand/20 text-[13px]"
					>
						Get your referral link
						<ChevronRight class="w-4 h-4" />
					</button>

					<!-- Step Indicators -->
					<div class="grid grid-cols-4 gap-3">
						{#each steps as step}
							<div
								class="bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-colors hover:bg-white/10 group"
							>
								<div
									class="text-[16px] font-black text-brand mb-1 group-hover:scale-110 transition-transform"
								>
									{step.number}
								</div>
								<div
									class="text-[9px] font-bold text-gray-400 tracking-tight leading-tight"
								>
									{step.text}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Right Column: Benefits & Stats -->
				<div class="lg:col-span-5 space-y-4">
					<!-- Benefit Cards -->
					<div class="space-y-3 mb-8">
						{#each benefits as benefit}
							<div
								class="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl transition-all duration-300 hover:bg-white/[0.08] group"
							>
								<div
									class="w-10 h-10 rounded-xl {benefit.bgColor} flex items-center justify-center shrink-0"
								>
									<benefit.icon class="w-5 h-5 {benefit.iconColor}" />
								</div>
								<div>
									<h4 class="text-[13px] font-bold text-white mb-0.5">
										{benefit.title}
									</h4>
									<p class="text-[10px] text-gray-500 leading-snug">
										{benefit.description}
									</p>
								</div>
							</div>
						{/each}
					</div>

					<!-- Bottom Stats -->
					<div class="flex gap-4">
						<div
							class="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl text-center"
						>
							<Infinity class="w-5 h-5 text-gray-400 mx-auto mb-2" />
							<p
								class="text-[9px] font-bold text-gray-500 uppercase tracking-wider"
							>
								No referral limit
							</p>
						</div>
						<div
							class="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl text-center"
						>
							<Zap class="w-5 h-5 text-amber-500 mx-auto mb-2" />
							<p
								class="text-[9px] font-bold text-gray-500 uppercase tracking-wider"
							>
								Instant credits
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
