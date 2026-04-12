<script lang="ts">
	import {
		LayoutGrid,
		Library,
		Play,
		CircleDot,
		Target,
		ArrowUpRight,
		Diamond,
		PieChart,
		Bookmark,
		Bell,
		ChevronLeft,
		ChevronRight,
		Sparkles,
		LogOut,
		Settings,
	} from "lucide-svelte";
	import { page } from "$app/stores";
	import "../layout.css";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	let { children } = $props();
	let isExpanded = $state(true);

	const mainLinks = [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: LayoutGrid,
			active: "/dashboard",
		},
		{
			href: "/questions",
			label: "Questions",
			icon: Library,
			active: "/questions",
		},
		{
			href: "/start_practice",
			label: "Start Practice",
			icon: Play,
			active: "/start_practice",
		},
		{ href: "#", label: "Mock Exam", icon: CircleDot, badge: "New" },
	];

	const performanceLinks = [
		{ href: "/results", label: "My Results", icon: Target, active: "/results" },
		{
			href: "/analytics",
			label: "Analytics",
			icon: ArrowUpRight,
			active: "/analytics",
		},
		{ href: "#", label: "Leaderboard", icon: Diamond },
	];

	const earnLinks = [
		{ href: "/referrals", label: "Refer & Earn", icon: PieChart },
		{ href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
		{
			href: "/notifications",
			label: "Notifications",
			icon: Bell,
			badgeCount: 3,
		},
	];
</script>

<Sidebar.Provider
	bind:open={isExpanded}
	style="--sidebar-width: 230px; --sidebar-width-icon: 80px;"
	class="flex h-screen w-full bg-[#f8f9fc] overflow-hidden font-sans relative antialiased"
>
	<!-- Sidebar -->
	<Sidebar.Root
		collapsible="icon"
		class="bg-[#f8f9fc] border-r border-gray-100 flex flex-col shrink-0 h-screen z-30 pb-8 transition-all duration-[300ms] shadow-[8px_0_24px_-10px_rgba(0,0,0,0.08)] {isExpanded
			? 'w-[230px] min-w-[230px]'
			: 'w-[80px] min-w-[80px]'} group/sidebar p-0 m-0"
	>
		<Sidebar.Content class="bg-transparent p-0 m-0 h-full flex flex-col gap-0">
			<div
				class="py-6 flex items-center sticky top-0 bg-white z-10 px-5 {isExpanded
					? 'justify-between'
					: 'justify-center'}"
			>
				<!-- Logo Mock -->
				<a
					href="/dashboard"
					class="flex items-center gap-2.5 overflow-hidden group/logo"
				>
					<div
						class="w-7 h-7 bg-brand/10 border border-brand/20 rounded flex items-center justify-center shrink-0 group-hover/logo:bg-brand/20 transition-colors"
					>
						<Sparkles class="w-4 h-4 text-brand" stroke-width={1.2} />
					</div>
					{#if isExpanded}
						<h1
							class="text-[17px] font-bold text-[#141522] tracking-wide shrink-0"
						>
							mockcenter
						</h1>
					{/if}
				</a>

				{#if isExpanded}
					<button
						onclick={() => (isExpanded = false)}
						class="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-brand hover:bg-white hover:shadow-sm transition-all duration-300 shrink-0"
						title="Hide Sidebar"
					>
						<ChevronLeft class="w-3.5 h-3.5" />
					</button>
				{/if}
			</div>

			<div class="flex flex-col mt-1 gap-y-5 {isExpanded ? 'px-4' : 'px-3'}">
				<!-- MAIN -->
				<div class="flex flex-col gap-0.5">
					<h3
						class="text-[10px] font-bold text-[#b0b8c4] uppercase tracking-widest mb-1 transition-all {isExpanded
							? 'px-3 text-left'
							: 'text-center px-0'}"
					>
						{#if isExpanded}MAIN{/if}
					</h3>
					{#each mainLinks as link}
						{@const Icon = link.icon}
						<a
							href={link.href}
							class="relative flex items-center py-1.5 rounded-lg font-medium text-[13px] transition-all {$page
								.url.pathname === link.href ||
							$page.url.pathname === link.active
								? 'bg-brand/15 text-brand shadow-sm'
								: 'text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] border-transparent'} {isExpanded
								? link.badge
									? 'px-3 justify-between'
									: 'gap-3 px-3 justify-start'
								: 'px-0 justify-center'}"
							title={link.label}
						>
							<div class="flex items-center gap-3">
								<Icon class="w-5 h-5 shrink-0" stroke-width={1.2} />
								{#if isExpanded}<span>{link.label}</span>{/if}
							</div>
							{#if link.badge}
								{#if isExpanded}
									<span
										class="bg-[#e44d4d] text-white text-[9px] items-center flex font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase shrink-0"
										>{link.badge}</span
									>
								{:else}
									<div
										class="absolute top-[6px] right-[6px] w-2.5 h-2.5 rounded-full bg-[#e44d4d] border-2 border-white"
									></div>
								{/if}
							{/if}
						</a>
					{/each}
				</div>

				<!-- PERFORMANCE -->
				<div class="flex flex-col gap-0.5">
					<h3
						class="text-[10px] font-bold text-[#b0b8c4] uppercase tracking-widest mb-1 transition-all {isExpanded
							? 'px-3 text-left'
							: 'text-center px-0'}"
					>
						{#if isExpanded}PERFORMANCE{/if}
					</h3>
					{#each performanceLinks as link}
						{@const Icon = link.icon}
						<a
							href={link.href}
							class="relative flex items-center gap-3 py-1.5 rounded-lg font-medium text-[13px] transition-all {$page
								.url.pathname === link.href ||
							$page.url.pathname === link.active
								? 'bg-brand/15 text-brand shadow-sm'
								: 'text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] border-transparent'} {isExpanded
								? 'px-3 justify-start'
								: 'px-0 justify-center'}"
							title={link.label}
						>
							<Icon class="w-5 h-5 shrink-0" stroke-width={1.2} />
							{#if isExpanded}<span>{link.label}</span>{/if}
						</a>
					{/each}
				</div>

				<!-- EARN -->
				<div class="flex flex-col gap-0.5">
					<h3
						class="text-[10px] font-bold text-[#b0b8c4] uppercase tracking-widest mb-1 transition-all {isExpanded
							? 'px-3 text-left'
							: 'text-center px-0'}"
					>
						{#if isExpanded}EARN{/if}
					</h3>
					{#each earnLinks as link}
						{@const Icon = link.icon}
						<a
							href={link.href}
							class="relative flex items-center py-1.5 rounded-lg font-medium text-[13px] transition-all {$page
								.url.pathname === link.href ||
							$page.url.pathname === link.active
								? 'bg-brand/15 text-brand shadow-sm'
								: 'text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] border-transparent'} {isExpanded
								? link.badgeCount
									? 'px-3 justify-between'
									: 'gap-3 px-3 justify-start'
								: 'px-0 justify-center'}"
							title={link.label}
						>
							<div class="flex items-center gap-3">
								<Icon class="w-5 h-5 shrink-0" stroke-width={1.2} />
								{#if isExpanded}<span>{link.label}</span>{/if}
							</div>
							{#if link.badgeCount}
								{#if isExpanded}
									<div
										class="bg-[#e44d4d] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none shrink-0"
									>
										{link.badgeCount}
									</div>
								{:else}
									<div
										class="absolute top-[6px] right-[6px] w-[14px] h-[14px] rounded-full bg-[#e44d4d] border-[1.5px] border-white flex items-center justify-center text-[7px] text-white font-bold leading-none"
									>
										{link.badgeCount}
									</div>
								{/if}
							{/if}
						</a>
					{/each}
				</div>
				<!-- Credit Balance Widget -->
				<div
					class="mt-auto mb-[25vh] {isExpanded
						? '-px-2'
						: 'px-3'} transition-all duration-300"
				>
					{#if isExpanded}
						<div
							class="bg-[#0b3b6c] rounded-lg px-6 py-4 shadow-md relative overflow-hidden"
						>
							<div class="relative z-10">
								<h4
									class="text-[10px] font-extrabold tracking-widest text-white/90 uppercase mb-2"
								>
									Credit Balance
								</h4>
								<div class="flex items-baseline gap-2 mb-2">
									<span
										class="text-2xl font-black tracking-tighter text-white leading-none"
										>240</span
									>
									<span class="text-[12px] font-bold text-white/80"
										>credits</span
									>
								</div>
								<p class="text-[10px] text-white/70 font-semibold mb-2">
									~120 questions remaining
								</p>

								<button
									class="w-full bg-white hover:bg-slate-50 text-[#0b3b6c] text-xs font-bold py-2 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
								>
									+ Buy More Credits
								</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- SETTINGS & LOGOUT -->
				<div
					class="mt-auto pb-4 flex flex-col gap-0.5 border-t border-gray-50 pt-4"
				>
					<a
						href="/settings"
						class="flex items-center gap-3 py-1.5 rounded-lg font-medium text-[13px] transition-all text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] {isExpanded
							? 'px-3 justify-start'
							: 'px-0 justify-center'}"
						title="Settings"
					>
						<Settings class="w-5 h-5 shrink-0" stroke-width={1.2} />
						{#if isExpanded}<span>Settings</span>{/if}
					</a>
					<a
						href="/logout"
						class="flex items-center gap-3 py-1.5 rounded-lg font-medium text-[13px] transition-all text-red-500/80 hover:bg-red-50 hover:text-red-600 {isExpanded
							? 'px-3 justify-start'
							: 'px-0 justify-center'}"
						title="Log Out"
					>
						<LogOut class="w-5 h-5 shrink-0" stroke-width={1.2} />
						{#if isExpanded}<span>Log Out</span>{/if}
					</a>
				</div>
			</div>
		</Sidebar.Content>
	</Sidebar.Root>

	<!-- Main Content Wrapper -->
	<Sidebar.Inset
		class="flex-1 min-w-0 flex flex-col pb-10 px-8 h-screen overflow-y-auto custom-scrollbar relative transition-all duration-300 border-none bg-[#f8f9fc]"
	>
		<header
			class="flex items-center justify-between mb-5 bg-white py-4 px-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-gray-100 -mx-8 w-[calc(100%+4rem)] z-10 sticky top-0 m-0"
		>
			<div class="flex items-center gap-4">
				{#if !isExpanded}
					<button
						onclick={() => (isExpanded = true)}
						class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-brand hover:border-brand/40 transition-all duration-300 group/show"
						title="Show Sidebar"
					>
						<ChevronRight
							class="w-4 h-4 group-hover/show:translate-x-0.5 transition-transform"
						/>
					</button>
				{/if}
				<div class="flex flex-col">
					<h2 class="text-[20px] font-bold text-[#141522] tracking-tight">
						{#if $page.url.pathname === "/results"}
							My Results
						{:else if $page.url.pathname === "/analytics"}
							Analytics
						{:else if $page.url.pathname === "/bookmarks"}
							Bookmarks
						{:else}
							<span class="font-light italic text-slate-400">Good morning,</span
							>
							Chukwuemeka
						{/if}
					</h2>
					<div
						class="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mt-1"
					>
						{#if $page.url.pathname === "/analytics"}
							<span
								>Deep dive into your performance trends, speed, and AI-powered
								insights</span
							>
						{:else}
							<span>Saturday, 28 March 2026</span>
							<span class="text-gray-300">•</span>
							<span class="text-brand font-semibold">
								{#if $page.url.pathname === "/results"}
									Your detailed performance analytics
								{:else if $page.url.pathname === "/bookmarks"}
									Questions you saved for later review
								{:else}
									Keep pushing, your exam is close!
								{/if}
							</span>
						{/if}
					</div>
				</div>
			</div>
			<div class="flex items-center gap-5">
				<!-- Credits -->
				<div
					class="flex items-center gap-2.5 px-3 py-2 bg-brand/10 rounded-xl border border-brand/20"
				>
					<div
						class="w-5 h-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-sm relative"
					>
						<div class="absolute inset-x-0 top-1 h-[1px] bg-black/10"></div>
					</div>
					<span class="text-[12px] font-bold text-brand">240 credits</span>
				</div>

				<!-- Notifications -->
				<button
					class="relative text-gray-400 hover:text-brand transition-colors"
				>
					<div
						class="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm"
					>
						<Bell class="w-4 h-4" stroke-width={1.2} />
					</div>
					<span
						class="absolute top-0 right-0 w-2.5 h-2.5 bg-[#e44d4d] rounded-full border-2 border-white"
					></span>
				</button>

				<!-- Profile -->
				<div class="flex items-center gap-3 pl-2 cursor-pointer group">
					<div
						class="w-9 h-9 bg-brand/10 rounded-full flex items-center justify-center text-[12px] font-bold text-brand border-2 border-white shadow-sm transition-transform group-hover:scale-105"
					>
						CE
					</div>
					<span class="text-[13px] font-bold text-[#141522]">My Account</span>
				</div>
			</div>
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #cbd5e1;
	}
	:global(body) {
		font-family: "Plus Jakarta Sans", sans-serif;
	}
</style>
