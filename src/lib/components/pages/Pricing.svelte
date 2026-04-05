<script lang="ts">
	import { Check, Coins, Sparkle, Crown, ChevronRight } from "lucide-svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	const tiers = [
		{
			credits: "200",
			questions: "100",
			price: "1,000",
			rate: "₦5 per question",
			description:
				"Perfect for casual study sessions and quick concept reviews before a light exam.",
			features: [
				"100 practice questions",
				"All subjects & exam types",
				"AI explanations included",
				"Credits never expire",
			],
			buttonText: "Buy 200 credits",
			featured: false,
		},
		{
			credits: "500",
			questions: "250",
			price: "5,000",
			rate: "₦4/q — save 20%",
			description:
				"The definitive choice for serious exam prep, offering full coverage and advanced AI insights.",
			features: [
				"250 practice questions",
				"All subjects & exam types",
				"Full AI analytics",
				"Mock exam access",
				"Credits never expire",
			],
			buttonText: "Buy 500 credits",
			featured: true,
		},
		{
			credits: "1,200",
			questions: "600",
			price: "10,000",
			rate: "₦3.3/q — save 33%",
			description:
				"Ideal for schools, learning centers, and high-intensity revision groups needing maximum bandwidth.",
			features: [
				"600 practice questions",
				"Full platform access",
				"Priority AI study plan",
				"Leaderboard ranking",
				"Credits never expire",
			],
			buttonText: "Buy 1,200 credits",
			featured: false,
		},
	];

	let isBulk = $state(true);
</script>

<section id="pricing" class="w-full py-10 bg-brand/5 font-sans overflow-hidden antialiased">
	<div class="max-w-[1060px] mx-auto px-4 lg:px-12">
		<!-- Restored Header -->
		<div class="text-center mb-6">
			<div
				class="inline-flex items-center gap-1.5 mb-4 border border-brand/20 bg-brand/5 rounded-full px-3 py-1 text-brand"
			>
				<Coins class="w-2.5 h-2.5" />
				<span class="text-[8px] font-bold tracking-[0.2em] uppercase"
					>Credits & Pricing</span
				>
			</div>

			<h2
				class="text-4xl md:text-5xl font-black text-[#111827] leading-[1.1] tracking-tight mb-4"
			>
				Pay only for <br class="md:hidden" /> what you practice
			</h2>

			<p
				class="text-[12px] text-[#6b7280] font-normal leading-relaxed max-w-xl mx-auto"
			>
				No subscriptions. No hidden fees. Credits never expire. <br
					class="hidden md:block"
				/>
				Earn free credits by referring friends.
			</p>
		</div>

		<!-- Shadcn Billing Toggle (Refined Colors) -->
		<div class="flex flex-col items-center mb-6">
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2 pr-1">
					<Switch
						id="bulk-mode"
						bind:checked={isBulk}
						class="data-[state=checked]:bg-brand data-[state=unchecked]:bg-[#121629]"
						aria-label="Toggle bulk buy mode"
					/>
					<Label
						for="bulk-mode"
						class="text-[10px] font-bold text-[#121629] cursor-pointer"
						>Bulk Buy</Label
					>
				</div>
				<Badge
					variant="outline"
					class="bg-brand/10 text-brand text-[8.5px] font-black px-3 py-0.5 border-none rounded-full uppercase tracking-[0.05em] h-auto shadow-none"
				>
					Save 30% with bulk credits
				</Badge>
			</div>
		</div>

		<!-- Pricing Grid with Shadcn Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each tiers as tier}
				<Card.Root
					class="relative {tier.featured
						? 'bg-brand/[0.03] shadow-[0_32px_64px_-16px_rgba(11,123,126,0.08)] ring-1 ring-white/50'
						: 'bg-white'} rounded-lg border-2 border-dashed {tier.featured
						? 'border-brand'
						: 'border-brand/20'} transition-all duration-500 hover:border-brand hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] group overflow-hidden"
				>
					<Card.Header class="p-6 pb-0 space-y-0">
						<div class="flex justify-between items-start mb-4">
							<div
								class="w-8 h-8 rounded-xl bg-brand/5 border border-brand/20 flex items-center justify-center text-brand"
							>
								{#if tier.credits === "200"}<Coins
										class="w-4 h-4"
										strokeWidth={1.2}
									/>{/if}
								{#if tier.credits === "500"}<Sparkle
										class="w-4 h-4 text-brand"
										strokeWidth={1.2}
									/>{/if}
								{#if tier.credits === "1,200"}<Crown
										class="w-4 h-4 text-brand"
										strokeWidth={1.2}
									/>{/if}
							</div>

							{#if tier.featured}
								<Badge
									class="bg-brand text-white border-none px-2 py-1 rounded-full shadow-lg shadow-brand/20"
								>
									<div
										class="w-1 h-1 rounded-full bg-white animate-pulse mr-1"
									></div>
									<span class="text-[8px] font-black uppercase tracking-widest"
										>Recommended</span
									>
								</Badge>
							{:else if tier.credits === "200"}
								<Badge
									variant="secondary"
									class="bg-gray-50 border border-gray-100 px-2 py-1 rounded-full text-gray-400 shadow-none"
								>
									<div class="w-1 h-1 rounded-full bg-gray-300 mr-1"></div>
									<span class="text-[8px] font-black uppercase tracking-widest"
										>Selected before</span
									>
								</Badge>
							{:else}
								<Badge
									class="bg-brand/5 text-brand border-none px-2 py-1 rounded-full shadow-sm"
								>
									<div
										class="w-1 h-1 rounded-full bg-brand animate-pulse mr-1"
									></div>
									<span class="text-[8px] font-black uppercase tracking-widest"
										>For Schools</span
									>
								</Badge>
							{/if}
						</div>

						<div class="mb-4">
							<h3 class="text-base font-bold text-brand mb-1">
								{tier.credits === "200"
									? "Basic"
									: tier.credits === "500"
										? "Value"
										: "Enterprise"} Pack
							</h3>
							<div class="flex items-baseline gap-1">
								<span
									class="text-3xl font-black text-[#111827] tracking-tighter"
									>₦{tier.price}</span
								>
								<span
									class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
									>/ pack</span
								>
							</div>
						</div>
					</Card.Header>

					<Card.Content class="p-4 pt-0">
						<p class="text-[12px] text-gray-500 font-medium leading-[1.4] mb-5">
							{tier.description}
						</p>

						<!-- Shadcn Button with Brand Border -->
						<Button
							variant="outline"
							class="w-full flex items-center justify-center gap-1.5 h-auto py-3 rounded-lg border-2 border-dashed border-brand/30 text-[9.5px] font-black uppercase tracking-[0.05em] text-[#121629] transition-all duration-300 hover:border-brand hover:bg-brand hover:text-white mb-5 bg-transparent"
						>
							{tier.buttonText}
							<ChevronRight class="w-3.5 h-3.5" />
						</Button>

						<!-- Features -->
						<div class="space-y-3">
							<h4
								class="text-[9px] font-black text-[#111827] uppercase tracking-widest"
							>
								What's included
							</h4>
							<div class="space-y-2.5">
								{#each tier.features as feature}
									<div class="flex items-start gap-2.5">
										<div
											class="w-3.5 h-3.5 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5"
										>
											<Check class="w-2 h-2 text-brand" strokeWidth={5} />
										</div>
										<span
											class="text-[10.5px] font-medium text-[#2d325a] leading-tight"
											>{feature}</span
										>
									</div>
								{/each}
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>
</section>
