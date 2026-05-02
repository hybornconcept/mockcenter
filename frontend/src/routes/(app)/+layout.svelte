<script lang="ts">
	import {
		LayoutGrid,
		Library,
		Play,
		Target,
		ArrowUpRight,
		PieChart,
		Bookmark,
		Bell,
		ChevronLeft,
		ChevronRight,
		ChevronDown,
		Sparkles,
		LogOut,
		Settings,
		User,
		CreditCard,
		TrendingUp,
		Users,
		Image as ImageIcon,
		Upload,
		ShieldCheck,
	} from "@lucide/svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import "../layout.css";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import Confirmation from "$lib/components/Confirmation.svelte";
	import { authClient } from "$lib/auth-client.js";

	let { children } = $props();
	let isExpanded = $state(true);
	let showLogoutModal = $state(false);
	let loggingOut = $state(false);

	let isAdminView = $derived($page.url.pathname.startsWith("/admin"));

	async function handleLogout() {
		loggingOut = true;
		try {
			await authClient.signOut();
		} catch {
			// Session may already be gone — proceed anyway
		} finally {
			loggingOut = false;
			goto("/login");
		}
	}

	// APP LINKS
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
	];

	const performanceLinks = [
		{ href: "/results", label: "My Results", icon: Target, active: "/results" },
		{
			href: "/analytics",
			label: "Analytics",
			icon: ArrowUpRight,
			active: "/analytics",
		},
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

	// ADMIN LINKS
	const overviewLinks = [
		{ href: "/admin", label: "Dashboard", icon: LayoutGrid, active: "/admin" },
		{ href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
		{ href: "/admin/users", label: "Users", icon: Users, badge: "12" },
	];

	const contentLinks = [
		{
			href: "/admin/bank",
			label: "Question Bank",
			icon: Library,
			active: "/admin/bank",
		},
		{
			href: "/admin/media",
			label: "Media Library",
			icon: ImageIcon,
			badgeGreen: "R2",
		},
		{ href: "/admin/import", label: "Bulk Import", icon: Upload },
	];

	const settingsLinks = [
		{ href: "/admin/notifications", label: "Notifications", icon: Bell },
		{ href: "/admin/settings", label: "Settings", icon: Settings },
		{ href: "/admin/profile", label: "Profile", icon: User },
	];

	const dropdownLinks = [
		{ href: "/settings", label: "Profile", icon: User },
		{
			href: "/notifications",
			label: "Notifications",
			icon: Bell,
			badge: "New",
		},
		{ href: "/referrals", label: "Referrals", icon: PieChart },
	];

	const adminDropdownLinks = [
		{ href: "/admin/profile", label: "Profile", icon: User },
		{
			href: "/admin/notifications",
			label: "Notifications",
			icon: Bell,
			badge: "New",
		},
		{ href: "/admin/settings", label: "Settings", icon: Settings },
	];
</script>

{#snippet sidebarSection(title: string, links: any[])}
	<div class="flex flex-col gap-0.5">
		<h3
			class="text-[10px] font-bold text-[#b0b8c4] uppercase tracking-widest mb-1 transition-all {isExpanded
				? 'px-3 text-left'
				: 'text-center px-0'}"
		>
			{#if isExpanded}{title}{/if}
		</h3>
		{#each links as link}
			{@const Icon = link.icon}
			<a
				href={link.href}
				class="relative flex items-center py-1.5 rounded-lg font-medium text-[13px] transition-all {$page
					.url.pathname === link.href || $page.url.pathname === link.active
					? 'bg-brand/15 text-brand shadow-sm'
					: 'text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] border-transparent'} {isExpanded
					? link.badge || link.badgeCount || link.badgeGreen
						? 'px-3 justify-between'
						: 'gap-3 px-3 justify-start'
					: 'px-0 justify-center'}"
				title={link.label}
			>
				<div class="flex items-center gap-3">
					<Icon class="w-5 h-5 shrink-0" stroke-width={1.2} />
					{#if isExpanded}<span>{link.label}</span>{/if}
				</div>
				{#if link.badge || link.badgeCount || link.badgeGreen}
					{#if isExpanded}
						{#if link.badgeGreen}
							<span
								class="bg-brand/20 text-brand-dark text-[9px] items-center flex font-bold px-1.5 py-0.5 rounded-md shrink-0"
								>{link.badgeGreen}</span
							>
						{:else if link.badgeCount}
							<div
								class="bg-[#e44d4d] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none shrink-0"
							>
								{link.badgeCount}
							</div>
						{:else}
							<span
								class="bg-[#e44d4d] text-white text-[9px] items-center flex font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase shrink-0"
								>{link.badge}</span
							>
						{/if}
					{:else if link.badgeCount}
						<div
							class="absolute top-[6px] right-[6px] w-[14px] h-[14px] rounded-full bg-[#e44d4d] border-[1.5px] border-white flex items-center justify-center text-[7px] text-white font-bold leading-none"
						>
							{link.badgeCount}
						</div>
					{:else if !link.badgeGreen}
						<div
							class="absolute top-[6px] right-[6px] w-2.5 h-2.5 rounded-full bg-[#e44d4d] border-2 border-white"
						></div>
					{/if}
				{/if}
			</a>
		{/each}
	</div>
{/snippet}

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
					href={isAdminView ? "/admin" : "/dashboard"}
					class="flex items-center gap-2.5 overflow-hidden group/logo"
				>
					<div
						class="w-7 h-7 bg-brand/10 border border-brand/20 rounded flex items-center justify-center shrink-0 group-hover/logo:bg-brand/20 transition-colors"
					>
						{#if isAdminView}
							<ShieldCheck class="w-4 h-4 text-brand" stroke-width={1.2} />
						{:else}
							<Sparkles class="w-4 h-4 text-brand" stroke-width={1.2} />
						{/if}
					</div>
					{#if isExpanded}
						{#if isAdminView}
							<div class="flex flex-col shrink-0">
								<h1
									class="text-[17px] font-bold text-[#141522] tracking-wide leading-tight"
								>
									MockCenter
								</h1>
								<span
									class="text-[10px] text-gray-400 font-medium tracking-wide"
									>Admin Console</span
								>
							</div>
						{:else}
							<h1
								class="text-[17px] font-bold text-[#141522] tracking-wide shrink-0"
							>
								MockCenter
							</h1>
						{/if}
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
				{#if isAdminView}
					{@render sidebarSection("OVERVIEW", overviewLinks)}
					{@render sidebarSection("CONTENT", contentLinks)}
					{@render sidebarSection("SETTINGS", settingsLinks)}
				{:else}
					{@render sidebarSection("MAIN", mainLinks)}
					{@render sidebarSection("PERFORMANCE", performanceLinks)}
					{@render sidebarSection("EARN", earnLinks)}
				{/if}

				<!-- LOGOUT -->
				<div class="flex flex-col gap-0.5 mt-1">
					<button
						onclick={() => (showLogoutModal = true)}
						class="w-full text-left flex items-center gap-3 py-1.5 rounded-lg font-medium text-[13px] transition-all text-red-500/80 hover:bg-red-50 hover:text-red-600 {isExpanded
							? 'px-3 justify-start'
							: 'px-0 justify-center'}"
						title="Log Out"
					>
						<LogOut class="w-5 h-5 shrink-0" stroke-width={1.2} />
						{#if isExpanded}<span>Log Out</span>{/if}
					</button>
				</div>

				<!-- Credit Balance Widget (App only) -->
				{#if !isAdminView}
					<div
						class="mt-auto mb-[25vh] translate-y-[10px] {isExpanded
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
										>+ Buy More Credits</button
									>
								</div>
							</div>
						{/if}
					</div>

					<!-- APP SETTINGS -->
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
					</div>
				{/if}
			</div>
		</Sidebar.Content>

		{#if isAdminView}
			<!-- Bottom Fixed Profile (Admin Only) -->
			<div class="mt-auto pb-3">
				<div class="border-t border-slate-200/60 w-full mb-4"></div>
				<div
					class="flex items-center gap-3 transition-all duration-300 {isExpanded
						? 'px-5'
						: 'justify-center'}"
				>
					<div
						class="w-9 h-9 rounded-full border-2 border-brand flex items-center justify-center text-brand font-bold text-[12px] shrink-0 transition-transform hover:scale-105 cursor-pointer"
					>
						{#if $page.data.user}
							{$page.data.user.name
								?.split(" ")
								.map((n: string) => n[0])
								.join("")
								.slice(0, 2)
								.toUpperCase() || "U"}
						{:else}
							AO
						{/if}
					</div>
					{#if isExpanded}
						<div class="flex flex-col min-w-0">
							<span
								class="text-[#141522] font-bold text-[13px] leading-tight truncate"
								>{$page.data.user?.name || "Dr. Amaka Osei"}</span
							>
							<span
								class="text-slate-400 text-[11px] font-medium leading-tight mt-0.5 truncate"
								>Administrator</span
							>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</Sidebar.Root>

	<!-- Main Content Wrapper -->
	<Sidebar.Inset
		class="flex-1 min-w-0 flex flex-col pb-10 px-8 h-screen overflow-y-auto custom-scrollbar relative transition-all duration-300 border-none {isAdminView ? 'admin-grid-bg' : 'bg-[#f8f9fc]'}"
	>
		<header
			class="flex items-center justify-between mb-5 bg-white py-2 z-20 px-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-gray-100 -mx-8 w-[calc(100%+4rem)] z-10 sticky top-0 m-0"
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
					{#if isAdminView}
						<h2
							class="text-lg font-bold text-[#141522] tracking-tight leading-tight"
						>
							{#if $page.url.pathname === "/admin/bank"}
								Question Bank
							{:else if $page.url.pathname === "/admin/import"}
								Question Import Wizard
							{:else if $page.url.pathname === "/admin/media"}
								Media Library
							{:else if $page.url.pathname === "/admin"}
								Command Center
							{:else if $page.url.pathname === "/admin/users"}
								User Management
							{:else if $page.url.pathname === "/admin/analytics"}
								Analytics
							{:else if $page.url.pathname === "/admin/notifications"}
								Notifications
							{:else if $page.url.pathname === "/admin/settings"}
								Settings
							{:else if $page.url.pathname === "/admin/profile"}
								Profile
							{:else}
								{$page.url.pathname
									.split("/")
									.pop()
									?.replace("-", " ")
									?.replace(/\b\w/g, (l) => l.toUpperCase())}
							{/if}
						</h2>
						<p class="text-xs text-slate-500 font-medium mt-1">
							{#if $page.url.pathname === "/admin/bank"}
								Manage questions for JAMB · WAEC · NECO · POST-UTME
							{:else if $page.url.pathname === "/admin/import"}
								Complete the 5 steps below to ingest your data into the Question
								Bank.
							{:else if $page.url.pathname === "/admin/media"}
								All question images stored in Cloudflare R2 — upload, tag &
								manage
							{:else if $page.url.pathname === "/admin"}
								Platform overview, system health and real-time activity feed
							{:else if $page.url.pathname === "/admin/users"}
								Manage student accounts, performance records and platform access
							{:else if $page.url.pathname === "/admin/analytics"}
								Comprehensive platform analytics and user performance trends
							{:else if $page.url.pathname === "/admin/notifications"}
								Manage system alerts, push notifications and email broadcasts
							{:else if $page.url.pathname === "/admin/settings"}
								Configure system preferences and global parameters
							{:else if $page.url.pathname === "/admin/profile"}
								Manage your administrator profile and security settings
							{/if}
						</p>
					{:else}
						<h2 class="text-[20px] font-bold text-[#141522] tracking-tight">
							{#if $page.url.pathname === "/results"}
								My Results
							{:else if $page.url.pathname === "/analytics"}
								Analytics
							{:else if $page.url.pathname === "/bookmarks"}
								Bookmarks
							{:else}
								<span class="font-light italic text-slate-400"
									>Good morning,</span
								>
								{$page.data.user?.name?.split(" ")[0] || "User"}
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
								<span
									>{new Date().toLocaleDateString("en-GB", {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}</span
								>
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
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-5">
				{#if !isAdminView}
					<!-- Credits -->
					<div
						class="flex items-center gap-2.5 px-3 py-2 rounded-lg border-2 border-brand/5"
					>
						<CreditCard class="w-4 h-4 text-brand" stroke-width={1.2} />
						<span class="text-[12px] font-bold text-brand">240 credits</span>
					</div>
				{/if}

				<!-- Notifications (Admin only, app has it in dropdown) -->
				{#if isAdminView}
					<button
						class="relative text-gray-400 hover:text-brand transition-colors shadow-sm"
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
				{/if}

				<!-- Profile Dropdown -->
				<div class="pl-4 border-l border-gray-100 ml-2">
					{#if $page.data.user}
						{@const user = $page.data.user}
						{@const initials =
							user.name
								?.split(" ")
								.map((n: string) => n[0])
								.join("")
								.slice(0, 2)
								.toUpperCase() || "U"}
						<DropdownMenu.Root class="rounded-lg">
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<button
										{...props}
										class="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:bg-gray-50/80 px-2 py-1.5 rounded-xl"
									>
										{#if user.image}
											<img
												src={user.image}
												alt={user.name}
												class="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-105"
											/>
										{:else}
											<div
												class="w-9 h-9 bg-brand/10 rounded-full flex items-center justify-center text-[12px] font-bold text-brand border-2 border-white shadow-sm transition-transform group-hover:scale-105"
											>
												{initials}
											</div>
										{/if}
										<div class="flex flex-col items-start">
											<span
												class="text-[13px] font-bold text-[#141522] leading-tight"
												>{user.name}</span
											>
											<span class="text-[11px] text-gray-400 font-medium"
												>{user.email}</span
											>
										</div>
										<ChevronDown
											class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors ml-1"
										/>
									</button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								class="w-60 shadow-2xl border-gray-100 p-2 rounded-xl"
								align="end"
							>
								<DropdownMenu.Label
									class="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.1em] px-3 py-2"
									>My Account</DropdownMenu.Label
								>
								<DropdownMenu.Separator class="mx-2 my-1 bg-gray-200" />
								<DropdownMenu.Group>
									{#each isAdminView ? adminDropdownLinks : dropdownLinks as link}
										{@const Icon = link.icon}
										<DropdownMenu.Item
											onclick={() => goto(link.href)}
											class="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-slate-50 focus:bg-slate-50 group"
										>
											<Icon
												class="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors"
												stroke-width={1.2}
											/>
											<span class="font-medium text-[14px] text-[#1e293b]"
												>{link.label}</span
											>
											{#if link.badge}
												<div
													class="ml-auto bg-[#e44d4d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
												>
													{link.badge}
												</div>
											{/if}
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Group>
								<DropdownMenu.Separator class="mx-2 my-1 bg-gray-100" />
								<DropdownMenu.Item
									onclick={() => (showLogoutModal = true)}
									class="cursor-pointer flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-red-50 focus:bg-red-50 group"
								>
									<LogOut
										class="w-4 h-4 text-red-500 transition-colors"
										stroke-width={1.2}
									/>
									<span class="font-medium text-[14px] text-red-600"
										>Log out</span
									>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
				</div>
			</div>
		</header>

		<div class="pt-4 w-full">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<Confirmation
	bind:open={showLogoutModal}
	title={isAdminView ? "End Session" : "Are you sure?"}
	description={isAdminView
		? "Are you sure you want to log out of the admin console?"
		: "Are you sure you want to log out? This action will end your current session."}
	confirmText={loggingOut ? "Logging out…" : "Log Out"}
	cancelText="Cancel"
	icon={LogOut}
	iconColorClass="text-red-500"
	iconBgClass="bg-red-50"
	confirmBtnClass="bg-[#e44d4d] hover:bg-[#d43d3d] shadow-lg shadow-red-500/20 text-white"
	disabled={loggingOut}
	onConfirm={handleLogout}
/>

<style>
	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 6px;
		height: 6px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background: #e2e8f0;
		border-radius: 10px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
		background: #cbd5e1;
	}
	:global(.admin-grid-bg) {
		background-color: #f8fbff;
		background-image: linear-gradient(#e5e7eb 0.5px, transparent 0.5px),
			linear-gradient(90deg, #e5e7eb 0.5px, transparent 0.5px);
		background-size: 40px 40px;
		background-position: center center;
	}
	:global(.admin-grid-bg::before) {
		content: "";
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		background: radial-gradient(
			circle at 50% 50%,
			rgba(255, 255, 255, 0) 0%,
			#f8fbff 100%
		);
	}
	:global(body) {
		font-family:
			"Plus Jakarta Sans",
			-apple-system,
			BlinkMacSystemFont,
			"Segoe UI",
			sans-serif;
	}
</style>
