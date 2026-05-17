<script lang="ts">
	import {
		Check,
		CreditCard,
		Gift,
		ArrowRight,
		CheckCircle2,
		ChevronRight,
		Zap,
		Flame,
		Crown,
		ShieldCheck,
	} from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { fly } from "svelte/transition";
	import { page } from "$app/stores";

	let { data } = $props();

	const iconMap: Record<string, any> = {
		Zap,
		Flame,
		Crown,
	};

	const TIERS = data.tiers;
	const SUBS = data.subs.map((s: any) => ({ ...s, icon: iconMap[s.iconName] }));

	let credsRaw = $state("10,000");
	let creds = $derived(
		parseInt(credsRaw.replace(/,/g, "").replace(/\D/g, "")) || 0,
	);

	let promoOn = $state(false);
	let promoCode = $state("");
	let autopay = $state(false);
	let subIdx = $state(0);
	let currentTab = $state("one-time");

	// Use actual user credit balance from page data
	let balance = $state(data.user?.creditBalance ?? 0);

	let showOverlay = $state(false);
	let successDetails = $state({ credits: 0, amount: 0, label: "", ref: "" });

	const fi = (n: number) => n.toLocaleString();
	const fm = (n: number) =>
		n.toLocaleString("en-NG", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

	let activeTier = $derived(
		TIERS.find((t) => creds >= t.min && creds <= t.max) ||
			TIERS[TIERS.length - 1],
	);
	let cost = $derived(creds * activeTier.rate * (promoOn ? 0.9 : 1));

	let isCheckingOut = $state(false);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const raw = target.value.replace(/,/g, "").replace(/\D/g, "");
		const n = parseInt(raw) || 0;
		credsRaw = n > 0 ? fi(n) : "";
	}

	function setAmt(n: number) {
		credsRaw = fi(n);
	}

	function applyPromo() {
		const valid = ["JAMB2026", "WAEC2026", "EXAMFIRST", "NEWUSER"];
		if (promoOn) return;
		if (valid.includes(promoCode.trim().toUpperCase())) {
			promoOn = true;
		}
	}

	function doPay() {
		if (!creds) return;
		isCheckingOut = true;
		setTimeout(() => {
			isCheckingOut = false;
			successDetails = {
				credits: creds,
				amount: cost,
				label: "One-time purchase",
				ref: "EN-" + Date.now(),
			};
			balance += creds;
			showOverlay = true;
		}, 1000);
	}

	function doSubPay() {
		const s = SUBS[subIdx];
		isCheckingOut = true;
		setTimeout(() => {
			isCheckingOut = false;
			successDetails = {
				credits: s.credits,
				amount: s.price,
				label: s.name,
				ref: "EN-SUB-" + Date.now(),
			};
			balance += s.credits;
			showOverlay = true;
		}, 1000);
	}
</script>

<svelte:head>
	<title>ExamNow — Buy Credits</title>
</svelte:head>

<div class="max-w-[1060px] mx-auto mt-4 pb-20">
	<div class="mb-8" in:fly={{ y: 10, duration: 300, delay: 50 }}>
		<h1 class="text-[27px] font-bold text-slate-900 tracking-tight mb-2">
			Buy credits
		</h1>
		<p class="text-slate-500 text-[13.5px]">
			Credits power your practice questions, mock exams, and subject drills.
			They never expire.
		</p>
	</div>

	<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
		<!-- Custom tab nav matching reference design -->
		<div class="flex items-end gap-8 border-b border-slate-200 mb-8">
			<button
				onclick={() => (currentTab = "one-time")}
				class="relative pb-3 text-[14px] transition-all duration-200 {currentTab ===
				'one-time'
					? 'text-brand font-bold'
					: 'text-[#94a3b8] font-medium hover:text-slate-600'}"
			>
				One-time purchase
				{#if currentTab === "one-time"}
					<span
						class="absolute bottom-0 left-0 h-[3px] w-full bg-brand rounded-full translate-y-[1.5px]"
					></span>
				{/if}
			</button>
			<button
				onclick={() => (currentTab = "subscription")}
				class="relative pb-3 text-[14px] transition-all duration-200 {currentTab ===
				'subscription'
					? 'text-brand font-bold'
					: 'text-[#94a3b8] font-medium hover:text-slate-600'}"
			>
				Monthly subscription
				{#if currentTab === "subscription"}
					<span
						class="absolute bottom-0 left-0 h-[3px] w-full bg-brand rounded-full translate-y-[1.5px]"
					></span>
				{/if}
			</button>
		</div>

		{#if currentTab === "one-time"}
			<div
				class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start"
				in:fly={{ y: 10, duration: 300, delay: 150 }}
			>
				<!-- LEFT COLUMN -->
				<div class="flex flex-col gap-4">
					<!-- AMOUNT CARD -->
					<Card.Root
						class="border-slate-200 shadow-sm rounded-xl overflow-hidden"
					>
						<Card.Content class="p-6">
							<Label
								for="amount"
								class="text-[13px] font-semibold text-slate-900 mb-3 block"
								>Enter how many credits you need</Label
							>
							<div class="relative mb-2">
								<Input
									id="amount"
									value={credsRaw}
									oninput={handleInput}
									placeholder="Type or select the amount of credits you want to purchase"
									class="h-14 font-mono text-2xl font-bold rounded-lg border-slate-200 focus-visible:ring-brand focus-visible:border-brand transition-all shadow-sm pl-4"
									autocomplete="off"
								/>
							</div>
							<p class="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
								<Zap class="w-3.5 h-3.5 text-brand" /> 1 credit = 1 practice question
								<span class="mx-1">•</span>
								<span class="font-semibold text-brand"
									>Credits never expire</span
								>
							</p>

							<div class="flex flex-wrap gap-2">
								{#each [500, 1000, 2500, 5000, 10000, 25000, 50000] as preset}
									<button
										class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all {creds ===
										preset
											? 'border-brand bg-brand/10 text-brand font-semibold shadow-sm'
											: 'border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:bg-brand/5 hover:text-brand'}"
										onclick={() => setAmt(preset)}
									>
										{fi(preset)}
									</button>
								{/each}
							</div>
						</Card.Content>
					</Card.Root>

					<!-- AUTOPAY CARD -->
					<Card.Root class="border-slate-200 shadow-sm rounded-xl">
						<Card.Content class="p-6 flex items-start justify-between gap-6">
							<div>
								<h3
									class="text-[13.5px] font-semibold text-slate-900 mb-1 flex items-center gap-2"
								>
									Set up autopay <span
										class="bg-brand/10 text-brand text-[9px] px-1.5 py-0.5 rounded font-bold tracking-widest uppercase"
										>New</span
									>
								</h3>
								<p
									class="text-[12.5px] text-slate-500 leading-relaxed max-w-[360px]"
								>
									Stop worrying about your credit balance. Set up autopay to
									automatically purchase more credits when you fall below your
									limit.
								</p>
							</div>
							<div class="flex flex-col items-center gap-1.5 pt-1">
								<Switch
									bind:checked={autopay}
									class="data-[state=checked]:bg-brand"
								/>
								<span
									class="text-[10px] font-semibold uppercase tracking-wider {autopay
										? 'text-brand'
										: 'text-slate-400'}">{autopay ? "On" : "Off"}</span
								>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- SUMMARY CARD -->
					<Card.Root
						class="border-slate-200 shadow-sm rounded-xl overflow-hidden border-2 border-brand/10 mt-1"
					>
						<div class="bg-[#fcfdfa] p-6">
							<p
								class="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider"
							>
								Price for {fi(creds)} Credits
							</p>
							<div
								class="flex items-baseline gap-1 font-mono text-[34px] font-bold text-slate-900 tracking-tight mb-5"
							>
								<span class="text-[18px] font-medium text-slate-400">₦</span
								>{fm(cost)}
							</div>

							<div
								class="flex flex-col gap-2 pt-4 border-t border-slate-200/80 mb-5"
							>
								<div class="flex justify-between text-[12.5px]">
									<span class="text-slate-500 font-medium">Credits</span>
									<span class="font-semibold text-slate-900">{fi(creds)}</span>
								</div>
								<div class="flex justify-between text-[12.5px]">
									<span class="text-slate-500 font-medium">Rate</span>
									<span class="font-medium text-slate-900"
										>₦{activeTier.rate.toFixed(3)} / credit</span
									>
								</div>
								{#if promoOn}
									<div
										class="flex justify-between text-[12.5px] text-brand bg-brand/5 -mx-2 px-2 py-1.5 rounded-md"
										in:fly={{ y: -5, duration: 200 }}
									>
										<span class="font-semibold flex items-center gap-1.5"
											><CheckCircle2 class="w-3.5 h-3.5" /> Promo (10% off)</span
										>
										<span class="font-bold"
											>-₦{fm(creds * activeTier.rate * 0.1)}</span
										>
									</div>
								{/if}
								<div
									class="flex justify-between text-[13px] pt-3 border-t border-slate-200 mt-1"
								>
									<span class="font-bold text-slate-900">Total</span>
									<span class="font-bold text-slate-900 text-[14px]"
										>₦{fm(cost)}</span
									>
								</div>
							</div>

							<div class="flex gap-2 mb-4">
								<Input
									bind:value={promoCode}
									placeholder="Promo code"
									class="h-10 text-[13px] bg-white border-slate-200 focus-visible:ring-brand uppercase shadow-sm"
									disabled={promoOn}
								/>
								<Button
									variant="outline"
									class="h-10 border-slate-200 hover:border-brand hover:text-brand font-medium shrink-0 w-[80px]"
									disabled={promoOn || !promoCode}
									onclick={applyPromo}
								>
									{promoOn ? "Applied" : "Apply"}
								</Button>
							</div>

							<Button
								class="w-full h-[46px] bg-brand hover:bg-[#2c520d] text-white font-bold text-[13.5px] shadow-lg shadow-brand/20 transition-all rounded-lg group"
								disabled={isCheckingOut || !creds}
								onclick={doPay}
							>
								{#if isCheckingOut}
									<div
										class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
									></div>
									 Processing...
								{:else}
									Checkout now <ArrowRight
										class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
									/>
								{/if}
							</Button>
							<p
								class="text-[11.5px] text-slate-400 text-center mt-3.5 font-medium flex items-center justify-center gap-1.5"
							>
								<ShieldCheck class="w-3.5 h-3.5" /> Secured by Paystack
							</p>
						</div>
					</Card.Root>
				</div>

				<!-- RIGHT COLUMN: PRICING TABLE -->
				<div
					class="sticky top-[88px]"
					in:fly={{ y: 10, duration: 300, delay: 200 }}
				>
					<Card.Root
						class="border-slate-200 shadow-sm rounded-xl overflow-hidden"
					>
						<div
							class="grid grid-cols-2 bg-[#fcfdfa] px-5 py-3 border-b border-slate-200/80"
						>
							<div
								class="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest"
							>
								Credits
							</div>
							<div
								class="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest text-right"
							>
								Price per credit
							</div>
						</div>
						<div class="flex flex-col">
							{#each TIERS as t}
								<button
									class="grid grid-cols-2 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors text-left group {activeTier ===
									t
										? 'bg-[#f0f7e6] hover:bg-[#f0f7e6]'
										: ''}"
									onclick={() => setAmt(t.min)}
								>
									<div class="flex items-center gap-3">
										<div
											class="w-[5px] h-[5px] rounded-full bg-brand shrink-0 transition-opacity {activeTier ===
											t
												? 'opacity-100 shadow-[0_0_8px_rgba(59,109,17,0.5)]'
												: 'opacity-0 group-hover:opacity-30'}"
										></div>
										<span
											class="text-[13.5px] font-medium {activeTier === t
												? 'text-brand font-bold'
												: 'text-slate-700'}"
										>
											{t.min >= 1000 ? t.min / 1000 + "K" : "1K"} to {t.max >=
											1000
												? t.max > 500000
													? "250K+"
													: Math.round((t.max + 1) / 1000) + "K"
												: "5K"}
										</span>
									</div>
									<div class="text-right flex flex-col items-end">
										<span
											class="font-mono text-[13.5px] font-medium {activeTier ===
											t
												? 'text-brand font-bold'
												: 'text-slate-900'}">₦{t.rate.toFixed(3)}</span
										>
										{#if t.savings}
											<span
												class="text-[11px] font-bold text-amber-600/90 bg-amber-50 px-1.5 py-[1px] rounded mt-0.5"
												>{t.savings} cheaper</span
											>
										{/if}
									</div>
								</button>
							{/each}
						</div>
						<div
							class="bg-[#fcfdfa] px-5 py-4 border-t border-slate-200/80 text-[11.5px] font-medium text-slate-500 leading-relaxed"
						>
							Larger purchases unlock lower per-credit rates. Credits are added
							to your wallet instantly after payment.
						</div>
					</Card.Root>
				</div>
			</div>
		{/if}

		{#if currentTab === "subscription"}
			<div
				class="max-w-[728px] mx-auto flex flex-col gap-4"
				in:fly={{ y: 10, duration: 300, delay: 150 }}
			>
				{#each SUBS as sub, i}
					{@const Icon = sub.icon}
					<div
						role="button"
						tabindex="0"
						class="relative w-full text-left bg-white border-2 rounded-xl p-5 transition-all cursor-pointer group {subIdx ===
						i
							? 'border-brand shadow-md shadow-brand/10'
							: 'border-slate-200 hover:border-brand/40 hover:shadow-sm'}"
						onclick={() => (subIdx = i)}
						onkeydown={(e) => e.key === 'Enter' && (subIdx = i)}
					>
						{#if i === 0}
							<div
								class="absolute -top-[1.5px] right-4 bg-brand text-white text-[9.5px] font-bold px-3 py-1 rounded-b-md uppercase tracking-widest shadow-sm"
							>
								Most Popular
							</div>
						{/if}

						<div class="flex items-start justify-between mb-4">
							<div class="flex items-start gap-3">
								<div
									class="w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center shrink-0 {subIdx ===
									i
										? 'border-brand bg-brand'
										: 'border-slate-300 bg-white group-hover:border-brand/50'} transition-colors"
								>
									<div
										class="w-1.5 h-1.5 rounded-full bg-white opacity-0 transition-opacity {subIdx ===
										i
											? 'opacity-100'
											: ''}"
									></div>
								</div>
								<div>
									<div class="flex items-center gap-2 mb-1.5">
										<h3
											class="text-[14.5px] font-bold text-slate-900 tracking-tight"
										>
											{sub.name}
										</h3>
									</div>
									<div
										class="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-[12.5px] font-bold px-2.5 py-1 rounded-md"
									>
										<Icon class="w-3.5 h-3.5" />
										{fi(sub.credits)} credits / month
									</div>
								</div>
							</div>
							<div class="text-right">
								<div
									class="font-mono text-[18px] font-bold text-slate-900 tracking-tight"
								>
									₦{fi(sub.price)}
								</div>
								<div class="text-[11.5px] font-medium text-slate-500 mt-0.5">
									per month
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-1.5 pl-7 mb-4">
							{#each sub.perks as perk}
								<div
									class="flex items-center gap-2 text-[12.5px] text-slate-600 font-medium"
								>
									<Check
										class="w-3.5 h-3.5 text-brand shrink-0"
										stroke-width={3}
									/>
									{perk}
								</div>
							{/each}
						</div>

						<div class="flex justify-end mt-2">
							<Button 
								size="sm" 
								class="h-8 px-4 text-[10.5px] font-bold uppercase tracking-wider transition-all {subIdx === i ? 'bg-brand hover:bg-[#2c520d] text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-none shadow-none'}"
								onclick={(e) => { e.stopPropagation(); subIdx = i; doSubPay(); }}
							>
								Purchase Now
							</Button>
						</div>
					</div>
				{/each}

				<!-- SUB CHECKOUT CARD -->
				<Card.Root
					class="border-slate-200 shadow-sm rounded-xl overflow-hidden border-2 border-brand/10 mt-2"
				>
					<div class="bg-[#fcfdfa] p-6">
						<p class="text-[12.5px] font-semibold text-slate-500 mb-1.5">
							{SUBS[subIdx].name}
						</p>
						<div
							class="flex items-baseline gap-1 font-mono text-[34px] font-bold text-slate-900 tracking-tight mb-5"
						>
							<span class="text-[18px] font-medium text-slate-400">₦</span>{fi(
								SUBS[subIdx].price,
							)}
						</div>

						<div
							class="flex flex-col gap-2.5 pt-4 border-t border-slate-200/80 mb-5"
						>
							<div class="flex justify-between text-[12.5px]">
								<span class="text-slate-500 font-medium">Credits / month</span>
								<span class="font-bold text-slate-900"
									>{fi(SUBS[subIdx].credits)}</span
								>
							</div>
							<div class="flex justify-between text-[12.5px]">
								<span class="text-slate-500 font-medium">Billing</span>
								<span class="font-medium text-slate-900"
									>Monthly <span class="text-slate-300 mx-1">•</span> Cancel anytime</span
								>
							</div>
							<div
								class="flex justify-between text-[13px] pt-2 border-t border-slate-200 mt-1"
							>
								<span class="font-bold text-slate-900">Due today</span>
								<span class="font-bold text-slate-900 text-[14px]"
									>₦{fi(SUBS[subIdx].price)}</span
								>
							</div>
						</div>

						<Button
							class="w-full h-[46px] bg-brand hover:bg-[#2c520d] text-white font-bold text-[13.5px] shadow-lg shadow-brand/20 transition-all rounded-lg group"
							disabled={isCheckingOut}
							onclick={doSubPay}
						>
							{#if isCheckingOut}
								<div
									class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
								></div>
								 Processing...
							{:else}
								Subscribe with Paystack <ArrowRight
									class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
								/>
							{/if}
						</Button>
						<p
							class="text-[11.5px] text-slate-400 text-center mt-3.5 font-medium flex items-center justify-center gap-1.5"
						>
							<ShieldCheck class="w-3.5 h-3.5" /> Cancel anytime from account settings
						</p>
					</div>
				</Card.Root>
			</div>
		{/if}
	</div>
</div>

<!-- SUCCESS OVERLAY -->
<Dialog.Root bind:open={showOverlay}>
	<Dialog.Content
		class="sm:max-w-[400px] p-0 overflow-hidden border-slate-200 rounded-2xl shadow-2xl"
	>
		<div
			class="px-8 pt-10 pb-8 text-center bg-white flex flex-col items-center"
		>
			<div
				class="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-5 relative"
			>
				<div
					class="absolute inset-0 border border-brand/20 rounded-full animate-ping opacity-50"
				></div>
				<Check class="w-8 h-8" stroke-width={3} />
			</div>

			<h2 class="text-[21px] font-bold text-slate-900 tracking-tight mb-1.5">
				Credits added!
			</h2>
			<p class="text-[13px] text-slate-500 mb-6 font-medium leading-relaxed">
				Your payment was successful and credits have been added to your wallet.
			</p>

			<div
				class="inline-flex items-center gap-2 bg-[#f0f7e6] border border-[#c0df90] rounded-xl px-5 py-2.5 mb-6"
			>
				<span class="font-mono text-[30px] font-bold text-brand"
					>{fi(successDetails.credits)}</span
				>
				<span
					class="text-[13px] font-bold text-[#4e8a17] leading-tight text-left"
					>credits<br />added</span
				>
			</div>

			<div
				class="bg-[#fcfdfa] border border-slate-200/80 rounded-xl px-4 py-1 mb-8 text-left w-full"
			>
				<div
					class="flex justify-between py-2.5 border-b border-slate-200/60 last:border-0 text-[13px]"
				>
					<span class="text-slate-500 font-medium">Amount paid</span>
					<span class="font-bold text-slate-900"
						>₦{fm(successDetails.amount)}</span
					>
				</div>
				<div
					class="flex justify-between py-2.5 border-b border-slate-200/60 last:border-0 text-[13px]"
				>
					<span class="text-slate-500 font-medium">New balance</span>
					<span class="font-bold text-slate-900">{fi(balance)} credits</span>
				</div>
				<div
					class="flex justify-between py-2.5 border-b border-slate-200/60 last:border-0 text-[13px]"
				>
					<span class="text-slate-500 font-medium">Reference</span>
					<span class="font-mono text-xs font-semibold text-slate-400"
						>{successDetails.ref}</span
					>
				</div>
			</div>

			<Button
				class="w-full h-11 bg-brand hover:bg-[#2c520d] text-white font-bold text-[13.5px] rounded-lg shadow-md"
				onclick={() => (showOverlay = false)}
			>
				Start practising <ArrowRight class="w-4 h-4 ml-2" />
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
