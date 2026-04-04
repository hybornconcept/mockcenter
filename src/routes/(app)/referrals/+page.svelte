<script lang="ts">
	import {
		Copy,
		Gift,
		Link as LinkIcon,
		Share2,
		Infinity,
		Handshake,
		Trophy,
		CreditCard,
		CheckCircle2,
		Users,
		Award,
		Flame,
		Crown,
		MessageCircle,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		Search,
		Trash2,
		Key,
	} from "lucide-svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { slide, fly } from "svelte/transition";

	let { data } = $props();
	const {
		stats,
		history,
		summaryStats,
		leaderboard,
		referralSteps,
		referralLink,
		code,
	} = data;

	let showTiers = $state(false);
	let copiedCode = $state(false);
	let copiedLink = $state(false);

	function copyToClipboard(text: string, type: "code" | "link") {
		navigator.clipboard.writeText(text);
		if (type === "code") {
			copiedCode = true;
			setTimeout(() => (copiedCode = false), 800);
		} else {
			copiedLink = true;
			setTimeout(() => (copiedLink = false), 800);
		}
	}

	const iconMap: Record<string, any> = {
		Users,
		CheckCircle2,
		CreditCard,
		Trophy,
	};

	const themes = {
		orange: {
			ring: "border-orange-300 text-orange-600",
			badge: "text-orange-700 bg-orange-50 border-orange-100",
		},
		blue: {
			ring: "border-blue-300 text-blue-600",
			badge: "text-blue-700 bg-blue-50 border-blue-100",
		},
		purple: {
			ring: "border-purple-300 text-purple-600",
			badge: "text-purple-700 bg-purple-50 border-purple-100",
		},
		green: {
			ring: "border-emerald-300 text-emerald-600",
			badge: "text-emerald-700 bg-emerald-50 border-emerald-100",
		},
		brand: {
			ring: "border-brand text-brand",
			badge: "text-brand bg-brand-muted border-brand/20",
		},
	};
</script>

{#snippet leaderboardRow(item: any)}
	{@const theme = themes[item.category as keyof typeof themes] || themes.brand}
	<div
		class="flex items-center gap-4 p-1.5 rounded-xl transition-all group {item.isUser
			? 'bg-emerald-50'
			: 'hover:bg-slate-50'} border-b border-slate-100 last:border-b-0 group-hover:border-transparent"
	>
		<div
			class="w-10 h-10 rounded-full bg-white text-brand flex items-center justify-center font-normal text-[13px] uppercase shrink-0 ring-1 ring-brand/30 transition-all group-hover:ring-brand"
		>
			{item.initials}
		</div>
		<div class="flex flex-col flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<span class="text-[14px] font-normal text-slate-800 truncate"
					>{item.name}</span
				>
				{#if item.isUser}
					<Badge
						variant="outline"
						class="text-[9px] font-black tracking-wide text-brand bg-brand-muted px-1.5 py-0.5 rounded-full border-brand/20 leading-none h-auto uppercase"
						>Me</Badge
					>
				{/if}
			</div>
			<span class="text-[11px] font-medium text-slate-400 mt-0.5"
				>{item.refs}</span
			>
		</div>
		<div class="flex flex-col items-end">
			<span class="text-[13px] font-semibold text-slate-700 tracking-tight"
				>{item.credits}</span
			>
		</div>
	</div>
{/snippet}

<div class="flex flex-col w-full text-[#141522] antialiased gap-6 pb-10">
	<!-- Hero & How It Works Space -->
	<div
		class="bg-[#0b3b6c] rounded-lg p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row gap-6 lg:gap-8 border border-slate-200 relative overflow-hidden transition-all duration-300 lg:items-center"
	>
		<div
			class="absolute inset-0 bg-gradient-to-r from-[#0c325c] to-transparent pointer-events-none"
		></div>

		<div
			class="absolute top-4 right-5 sm:top-5 sm:right-6 lg:top-3 lg:right-6 z-20 flex items-center gap-2"
		>
			{#if copiedCode}
				<div
					in:fly={{ y: 10, duration: 400 }}
					out:fly={{ y: -20, duration: 600 }}
					class="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1"
				>
					<CheckCircle2 class="w-3 h-3" /> Copied!
				</div>
			{/if}
			<button
				onclick={() => copyToClipboard(code, "code")}
				class="shrink-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 text-[11px] px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all hover:bg-emerald-500/20"
			>
				<Key class="w-3.5 h-3.5 text-emerald-400" stroke-width={1.5} />
				<span class="font-medium hidden sm:inline">Copy code:</span>
				<span class="font-extrabold">{code}</span>
			</button>
		</div>

		<!-- Left Side: Banner Details -->
		<div
			class="flex flex-col lg:w-[35%] xl:w-[30%] gap-4 relative z-10 pb-5 border-b border-white/10 lg:pb-0 lg:border-b-0 lg:border-r lg:pr-6"
		>
			<div class="flex items-start gap-3 w-full">
				<div
					class="w-[42px] h-[42px] rounded-xl bg-white/10 hidden xl:flex items-center justify-center shrink-0 border border-white/5 shadow-inner"
				>
					<Gift class="w-5 h-5 text-blue-50" stroke-width={1.5} />
				</div>
				<div class="flex flex-col w-full">
					<h3 class="text-[14px] font-bold text-white mb-1.5 tracking-wide">
						Referral program details
					</h3>
					<p class="text-[12px] text-blue-100/80 leading-snug mb-3 font-medium">
						Share your unique referral link with classmates and friends. For
						every friend who signs up and buys credits, you both get rewarded
						instantly.
					</p>
					<div class="flex flex-wrap gap-2 items-center">
						<Badge
							variant="outline"
							class="flex flex-row items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide bg-emerald-500/10 border-emerald-500/20 text-emerald-100"
						>
							<CheckCircle2
								class="w-3 h-3 text-emerald-400"
								stroke-width={1.5}
							/> You earn 50 credits
						</Badge>
						<Badge
							variant="outline"
							class="flex flex-row items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide bg-[#1359a0]/50 border-white/10 text-white"
						>
							<Infinity class="w-3 h-3 text-white" stroke-width={1.5} /> No limit
						</Badge>
					</div>
				</div>
			</div>

			<!-- Referral Link Bar inside Banner -->
			<div class="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
				<div
					class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center min-w-0 w-full shadow-inner"
				>
					<span
						class="text-[11px] font-mono text-gray-700 font-medium truncate w-full group"
						>{referralLink}</span
					>
				</div>
				<div class="relative w-full sm:w-auto">
					{#if copiedLink}
						<div
							in:fly={{ y: 10, duration: 400 }}
							out:fly={{ y: -20, duration: 600 }}
							class="absolute -top-9 left-1/2 -translate-x-1/2 bg-brand/50 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 whitespace-nowrap z-30"
						>
							<CheckCircle2 class="w-3 h-3" /> Link copied!
						</div>
					{/if}
					<button
						onclick={() => copyToClipboard(referralLink, "link")}
						class="shrink-0 bg-brand hover:bg-brand/80 text-white flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold shadow-sm transition-colors w-full sm:w-auto"
					>
						<Copy stroke-width={2.5} class="w-3.5 h-3.5" /> Copy link
					</button>
				</div>
			</div>
		</div>

		<!-- Right Side: How it works timeline integrated -->
		<div class="relative z-10 lg:w-[65%] xl:w-[70%] lg:pt-8 pr-1">
			<div class="flex flex-col sm:flex-row relative justify-between gap-3">
				<!-- Connecting Line -->
				<div
					class="hidden sm:block absolute top-[16px] left-[10%] right-[10%] h-[1px] bg-white/10"
				></div>

				{#each referralSteps as step}
					<div
						class="flex-1 flex flex-col items-center text-center relative z-10 px-1 {step.number <
						4
							? 'mb-5 sm:mb-0'
							: ''}"
					>
						<div
							class="w-8 h-8 rounded-full {step.bg} text-white flex items-center justify-center font-black text-sm mb-2.5 border-2 border-[#0b3b6c] {step.shadow ||
								'shadow-sm'}"
						>
							{step.number}
						</div>
						<h4 class="font-bold text-[11px] xl:text-[12px] text-white mb-1">
							{step.title}
						</h4>
						<p
							class="text-[9px] xl:text-[10px] text-blue-100/70 font-medium leading-tight {step.subtext
								? 'mb-1'
								: ''}"
						>
							{step.description}
						</p>
						{#if step.subtext}
							<span
								class="text-[8px] xl:text-[9px] font-bold {step.number === 4
									? 'uppercase tracking-wider font-extrabold text-emerald-400'
									: 'text-emerald-400'}"
							>
								{step.subtext}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
	<!-- Link & Stats Space -->

	<!-- Small stat cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		{#each stats as stat}
			{@const StatIcon = iconMap[stat.iconName]}
			<div
				class="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden cursor-default"
			>
				<StatIcon
					class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
					stroke-width={1.5}
				/>
				<span
					class="text-[12px] font-medium text-gray-500 tracking-tight relative z-10"
					>{stat.label}</span
				>
				<span
					class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
					>{stat.value}</span
				>
				<div class="flex items-center justify-between w-full relative z-10">
					<span class="text-[10px] font-medium text-gray-400 leading-none"
						>{stat.subtitle}</span
					>
					<Badge
						variant="outline"
						class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none {stat.badgeClass}"
						>{stat.badge}</Badge
					>
				</div>
			</div>
		{/each}
	</div>

	<!-- Tiers Space -->
	<Card.Root
		class="border-slate-200 shadow-sm overflow-hidden flex flex-col justify-center bg-white w-full rounded-lg"
	>
		<button
			class="px-6 py-1.5 flex items-center gap-3.5 w-full hover:bg-slate-50/80 transition-all border-b border-transparent data-[state=open]:border-slate-100"
			onclick={() => (showTiers = !showTiers)}
			data-state={showTiers ? "open" : "closed"}
		>
			<div
				class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"
			>
				<Trophy class="w-3.5 h-3.5 text-slate-500" stroke-width={2} />
			</div>

			<div class="flex flex-col items-start flex-1 text-left">
				<h3 class="text-[13px] font-bold text-slate-800 leading-none mb-0.5">
					Referral tiers
				</h3>
				<p class="text-[10px] font-medium text-slate-400 leading-none">
					The more you refer, the more you earn — unlock better rewards
				</p>
			</div>

			<div class="flex items-center gap-3">
				<Badge
					variant="outline"
					class="hidden sm:inline-flex bg-white text-slate-400 border-slate-200 text-[9px] font-bold py-0.5 px-2 uppercase tracking-wide"
				>
					{showTiers ? "Collapse" : "Show Details"}
				</Badge>
				<ChevronDown
					class="w-4 h-4 text-slate-300 transition-transform duration-300"
					style="transform: rotate({showTiers ? '180deg' : '0deg'})"
				/>
			</div>
		</button>
		{#if showTiers}
			<div transition:slide={{ duration: 300 }}>
				<Card.Content
					class="px-6 pb-6 pt-1 grid grid-cols-1 md:grid-cols-3 gap-5"
				>
					<!-- Starter Tier -->
					<div
						class="bg-[#f0fdf4] border-[#bbf7d0] border rounded-xl p-5 relative overflow-hidden flex flex-col group transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
					>
						<div class="w-full h-1 bg-[#22c55e] absolute top-0 left-0"></div>
						<Badge
							class="absolute top-4 right-4 bg-transparent border-transparent text-[#166534] font-bold hover:bg-transparent tracking-tight"
							>Current tier</Badge
						>

						<div
							class="w-10 h-10 mb-2 flex items-center justify-center text-3xl"
						>
							🌱
						</div>
						<h4 class="text-[18px] font-black text-[#166534] tracking-tight">
							Starter
						</h4>
						<span class="text-[11px] font-bold text-[#15803d]"
							>0 - 4 referrals</span
						>

						<div class="my-5 flex flex-col gap-1.5">
							<span class="text-[14px] font-bold text-[#166534]"
								>50 credits per referral</span
							>
							<div class="flex items-center gap-2 mt-1">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#22c55e]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#166534]"
									>Basic referral rewards</span
								>
							</div>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#22c55e]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#166534]"
									>Share via link or code</span
								>
							</div>
						</div>

						<div class="mt-auto">
							<div
								class="flex items-center justify-between text-[11px] font-bold text-[#15803d] mb-1"
							>
								<span>3 referrals done</span>
								<span class="opacity-70">Need 5 for next tier</span>
							</div>
							<div class="w-full h-2 bg-[#dcfce7] rounded-full overflow-hidden">
								<div class="h-full bg-[#166534] w-[60%] rounded-full"></div>
							</div>
						</div>
					</div>

					<!-- Hustler Tier -->
					<div
						class="bg-[#fefce8] border-[#fde047] border rounded-xl p-5 relative overflow-hidden flex flex-col group transition-all hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]"
					>
						<Badge
							class="absolute top-4 right-4 bg-transparent border-transparent text-[#854d0e] font-bold hover:bg-transparent tracking-tight"
							>Next tier</Badge
						>

						<div
							class="w-10 h-10 mb-2 flex items-center justify-center text-3xl"
						>
							🔥
						</div>
						<h4 class="text-[18px] font-black text-[#854d0e] tracking-tight">
							Hustler
						</h4>
						<span class="text-[11px] font-bold text-[#a16207]"
							>5 - 14 referrals</span
						>

						<div class="my-5 flex flex-col gap-1.5">
							<span class="text-[14px] font-bold text-[#854d0e] mb-1"
								>75 credits per referral</span
							>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#eab308]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#854d0e]"
									>50% more credits per ref</span
								>
							</div>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#eab308]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#854d0e]"
									>Priority support</span
								>
							</div>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#eab308]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#854d0e]"
									>Hustler badge on profile</span
								>
							</div>
						</div>

						<div class="mt-auto">
							<div
								class="flex items-center justify-between text-[11px] font-bold text-[#a16207] mb-1"
							>
								<span>Locked</span>
								<span class="opacity-70">Need 5 referrals</span>
							</div>
							<div class="w-full h-2 bg-[#fef08a] rounded-full overflow-hidden">
								<div class="h-full bg-[#166534] w-0 rounded-full"></div>
							</div>
						</div>
					</div>

					<!-- Champion Tier -->
					<div
						class="bg-[#eff6ff] border-[#bfdbfe] border rounded-xl p-5 relative overflow-hidden flex flex-col group transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
					>
						<Badge
							class="absolute top-4 right-4 bg-transparent border-transparent text-[#1e3a8a] font-bold hover:bg-transparent tracking-tight"
							>Elite</Badge
						>

						<div
							class="w-10 h-10 mb-2 flex items-center justify-center text-3xl"
						>
							👑
						</div>
						<h4 class="text-[18px] font-black text-[#1e3a8a] tracking-tight">
							Champion
						</h4>
						<span class="text-[11px] font-bold text-[#1d4ed8]"
							>15+ referrals</span
						>

						<div class="my-5 flex flex-col gap-1.5">
							<span class="text-[14px] font-bold text-[#1e3a8a] mb-1"
								>100 credits per referral</span
							>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#3b82f6]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#1e3a8a]"
									>Double credits per referral</span
								>
							</div>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#3b82f6]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#1e3a8a]"
									>Monthly bonus credits</span
								>
							</div>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#3b82f6]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#1e3a8a]"
									>Champion badge + perks</span
								>
							</div>
							<div class="flex items-center gap-2">
								<CheckCircle2
									class="w-3.5 h-3.5 text-[#3b82f6]"
									stroke-width={2.5}
								/>
								<span class="text-[12px] font-medium text-[#1e3a8a]"
									>Cash withdrawal option</span
								>
							</div>
						</div>

						<div class="mt-auto pt-2">
							<div
								class="flex items-center justify-between text-[11px] font-bold text-[#1d4ed8] mb-1"
							>
								<span>Locked</span>
								<span class="opacity-70">Need 15 referrals</span>
							</div>
							<div class="w-full h-2 bg-[#dbeafe] rounded-full overflow-hidden">
								<div class="h-full bg-[#166534] w-0 rounded-full"></div>
							</div>
						</div>
					</div>
				</Card.Content>
			</div>
		{/if}
	</Card.Root>

	<!-- History Space -->
	<div class="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-5">
		<!-- History Table -->
		<Card.Root
			class="border-slate-200 shadow-sm overflow-hidden flex flex-col bg-white rounded-2xl"
		>
			<Card.Header class="pb-0 px-0 pt-6">
				<div class="px-8 pb-4 flex items-center justify-between">
					<Card.Title class="text-[16px] font-extrabold text-slate-800">
						Referral history (125)
					</Card.Title>
				</div>

				<!-- Tabs -->
				<div class="px-8 flex gap-8 border-b border-slate-100">
					<button
						class="pb-3 text-[13px] font-bold text-brand border-b-2 border-brand"
						>All</button
					>
					<button
						class="pb-3 text-[13px] font-medium text-slate-400 hover:text-slate-600"
						>Successful</button
					>
					<button
						class="pb-3 text-[13px] font-medium text-slate-400 hover:text-slate-600"
						>Pending</button
					>
				</div>

				<!-- Search & Filters -->
				<div class="px-8 py-4 flex items-center justify-between gap-4">
					<div class="flex items-center gap-3 flex-1">
						<div class="relative w-full max-w-[240px]">
							<Search
								class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
							/>
							<input
								type="text"
								placeholder="Search friends..."
								class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all shadow-inner"
							/>
						</div>
						<Select.Root type="single" value="all_status">
							<Select.Trigger
								class="w-auto h-9 text-[12px] font-bold bg-slate-50 border-slate-200 rounded-lg px-4 shadow-none focus:ring-0 gap-2"
							>
								Status
							</Select.Trigger>
						</Select.Root>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-[11px] font-bold text-slate-400">Sort by:</span>
						<Select.Root type="single" value="newest">
							<Select.Trigger
								class="w-auto h-9 text-[12px] font-bold bg-white/50 border-slate-200 rounded-lg px-3 shadow-none focus:ring-0 gap-1.5"
							>
								Newest
							</Select.Trigger>
						</Select.Root>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="px-0 pb-0 flex-1">
				<div
					class="grid grid-cols-[1.8fr_1fr_1fr_1fr_0.8fr] gap-4 px-8 pb-2.5 border-b border-slate-100 text-[11px] font-black text-slate-700 tracking-wider uppercase"
				>
					<div>Friend Account</div>
					<div>Date Joined</div>
					<div>Status</div>
					<div>Credits</div>
					<div class="text-right">Action</div>
				</div>
				<div class="flex flex-col">
					{#each history as item}
						<div
							class="grid grid-cols-[1.8fr_1fr_1fr_1fr_0.8fr] gap-4 px-8 py-4 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all group"
						>
							<!-- Friend -->
							<div class="flex items-center gap-3.5">
								<div
									class="w-10 h-10 rounded-full bg-white text-brand flex items-center justify-center font-normal text-[13px] uppercase shrink-0 ring-1 ring-brand/30 transition-all group-hover:ring-brand"
								>
									{item.initials}
								</div>
								<div class="flex flex-col min-w-0">
									<span
										class="text-[13px] font-bold text-slate-800 truncate leading-tight group-hover:text-brand transition-colors"
										>{item.name}</span
									>
									<span
										class="text-[11px] font-medium text-slate-400 truncate mt-0.5"
										>{item.email}</span
									>
								</div>
							</div>

							<!-- Joined -->
							<div class="text-[12px] font-medium text-slate-600">
								{item.joined}
							</div>

							<!-- Status -->
							<div>
								<Badge
									variant="outline"
									class="{item.statusText} {item.statusBg} border-transparent text-[10px] font-bold py-0.5 px-2 rounded w-fit h-auto shadow-none uppercase tracking-tighter"
								>
									{item.status}
								</Badge>
							</div>

							<!-- Credits -->
							<div>
								<Badge
									variant="outline"
									class="{item.status === 'Bought credits'
										? 'bg-emerald-50 text-emerald-700 border-emerald-100'
										: 'bg-slate-50 text-slate-400 border-slate-100'} text-[11px] font-bold px-2 py-0.5 rounded-md shadow-none tracking-tight"
								>
									{item.earned}
								</Badge>
							</div>

							<!-- Action -->
							<div class="flex justify-end pr-1 items-center gap-2">
								{#if item.action === "Remind"}
									<button
										class="text-[12px] font-normal hover:font-semibold text-brand hover:text-white hover:bg-brand border border-brand rounded-sm transition-colors py-1 px-2 flex items-center"
									>
										Remind
									</button>
								{:else}
									<span class="text-slate-300 font-bold px-0">—</span>
								{/if}
								<button
									class="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-300 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>

			<!-- Pagination Footer -->
			<div
				class="px-8 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30"
			>
				<div class="flex items-center gap-1.5">
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
					>
						<ChevronLeft class="w-4 h-4" />
					</button>
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg bg-brand text-white text-[12px] font-bold shadow-sm"
						>1</button
					>
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-[12px] font-bold"
						>2</button
					>
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-[12px] font-bold"
						>3</button
					>
					<span class="px-1 text-slate-300 text-[12px] font-bold">...</span>
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-[12px] font-bold"
						>10</button
					>
					<button
						class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
					>
						<ChevronRight class="w-4 h-4" />
					</button>
				</div>
				<div class="flex items-center gap-2">
					<span
						class="text-[11px] font-bold text-slate-400 uppercase tracking-wide"
						>Show: 10 rows</span
					>
					<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
				</div>
			</div>
		</Card.Root>

		<!-- Right Stats Panel -->
		<div class="flex flex-col gap-5">
			<!-- Total Earned Card -->
			<div
				class="bg-brand rounded-2xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden h-fit"
			>
				<span
					class="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1"
					>Total credits earned from referrals</span
				>
				<div class="flex items-baseline gap-2 mb-1 relative z-10">
					<span class="text-[40px] font-black leading-none">150</span>
					<span class="text-[14px] font-bold text-white/90">credits</span>
				</div>
				<span class="text-[11px] text-white/70 font-medium mb-6 relative z-10"
					>= 75 free practice questions</span
				>

				<div class="grid grid-cols-2 gap-2 relative z-10">
					{#each summaryStats as stat}
						<div
							class="bg-black/10 rounded-lg p-3 group transition-colors hover:bg-black/20"
						>
							<span class="block text-[16px] font-bold mb-0.5 mt-0.5"
								>{stat.value}</span
							>
							<span class="text-[10px] text-white/70 font-medium"
								>{stat.label}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<!-- Leaderboard Card -->
			<Card.Root
				class="border-slate-200 shadow-sm overflow-hidden flex flex-col justify-center bg-white h-fit rounded-2xl"
			>
				<Card.Header
					class="pb-0.5 px-5 pt-2 flex flex-row items-center justify-between"
				>
					<Card.Title class="text-[13px] font-extrabold text-slate-800"
						>Top referrers this month</Card.Title
					>
				</Card.Header>
				<Card.Content class="px-5 pb-3">
					<div class="flex flex-col gap-0.5 mt-1">
						{#each leaderboard as entry}
							{@render leaderboardRow(entry)}
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
