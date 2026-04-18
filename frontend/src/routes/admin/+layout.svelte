<script lang="ts">
	import {
		LayoutGrid,
		TrendingUp,
		Users,
		Library,
		GraduationCap,
		Image as ImageIcon,
		Upload,
		Settings2,
		Bell,
		User,
		Settings,
		ChevronLeft,
		ChevronRight,
		ShieldCheck,
		LogOut
	} from "lucide-svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import "../layout.css";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Confirmation from "$lib/components/Confirmation.svelte";

	let { children } = $props();
	let isExpanded = $state(true);
	let showLogoutModal = $state(false);

	const overviewLinks = [
		{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
		{ href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
		{ href: "/admin/users", label: "Users", icon: Users, badge: "12" },
	];

	const contentLinks = [
		{ href: "/admin", label: "Question Bank", icon: Library, active: "/admin" },
		{ href: "/admin/exams", label: "Exams & Subjects", icon: GraduationCap },
		{ href: "/admin/media", label: "Media Library", icon: ImageIcon, badgeGreen: "R2" },
		{ href: "/admin/import", label: "Bulk Import", icon: Upload },
	];

	const settingsLinks = [
		{ href: "/admin/scoring", label: "Scoring Rules", icon: Settings2 },
		{ href: "/admin/notifications", label: "Notifications", icon: Bell },
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
					href="/admin"
					class="flex items-center gap-2.5 overflow-hidden group/logo"
				>
					<div
						class="w-7 h-7 bg-brand/10 border border-brand/20 rounded flex items-center justify-center shrink-0 group-hover/logo:bg-brand/20 transition-colors"
					>
						<ShieldCheck class="w-4 h-4 text-brand" stroke-width={1.2} />
					</div>
					{#if isExpanded}
						<div class="flex flex-col shrink-0">
							<h1 class="text-[17px] font-bold text-[#141522] tracking-wide leading-tight">
								PrepMaster
							</h1>
							<span class="text-[10px] text-gray-400 font-medium tracking-wide">Admin Console</span>
						</div>
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
				<!-- OVERVIEW -->
				<div class="flex flex-col gap-0.5">
					<h3
						class="text-[10px] font-bold text-[#b0b8c4] uppercase tracking-widest mb-1 transition-all {isExpanded
							? 'px-3 text-left'
							: 'text-center px-0'}"
					>
						{#if isExpanded}Overview{/if}
					</h3>
					{#each overviewLinks as link}
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

				<!-- CONTENT -->
				<div class="flex flex-col gap-0.5">
					<h3
						class="text-[10px] font-bold text-[#b0b8c4] uppercase tracking-widest mb-1 transition-all {isExpanded
							? 'px-3 text-left'
							: 'text-center px-0'}"
					>
						{#if isExpanded}Content{/if}
					</h3>
					{#each contentLinks as link}
						{@const Icon = link.icon}
						<a
							href={link.href}
							class="relative flex items-center py-1.5 rounded-lg font-medium text-[13px] transition-all {$page
								.url.pathname === link.href ||
							$page.url.pathname === link.active
								? 'bg-brand/15 text-brand shadow-sm'
								: 'text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] border-transparent'} {isExpanded
								? link.badgeGreen
									? 'px-3 justify-between'
									: 'gap-3 px-3 justify-start'
								: 'px-0 justify-center'}"
							title={link.label}
						>
							<div class="flex items-center gap-3">
								<Icon class="w-5 h-5 shrink-0" stroke-width={1.2} />
								{#if isExpanded}<span>{link.label}</span>{/if}
							</div>
							{#if link.badgeGreen && isExpanded}
								<span
									class="bg-brand/20 text-brand-dark text-[9px] items-center flex font-bold px-1.5 py-0.5 rounded-md shrink-0"
									>{link.badgeGreen}</span
								>
							{/if}
						</a>
					{/each}
				</div>

				<!-- SETTINGS -->
				<div class="flex flex-col gap-0.5">
					<h3
						class="text-[10px] font-bold text-[#b0b8c4] uppercase tracking-widest mb-1 transition-all {isExpanded
							? 'px-3 text-left'
							: 'text-center px-0'}"
					>
						{#if isExpanded}Settings{/if}
					</h3>
					{#each settingsLinks as link}
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

				<!-- User Actions -->
				<div
					class="mt-auto pb-4 flex flex-col gap-0.5 border-t border-gray-50 pt-4"
				>
					<a
						href="/admin/profile"
						class="flex items-center gap-3 py-1.5 rounded-lg font-medium text-[13px] transition-all text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] {isExpanded
							? 'px-3 justify-start'
							: 'px-0 justify-center'}"
						title="Profile"
					>
						<User class="w-5 h-5 shrink-0" stroke-width={1.2} />
						{#if isExpanded}<span>Profile</span>{/if}
					</a>
					<a
						href="/admin/settings"
						class="flex items-center gap-3 py-1.5 rounded-lg font-medium text-[13px] transition-all text-[#58677c] hover:bg-slate-50 hover:text-[#1e293b] {isExpanded
							? 'px-3 justify-start'
							: 'px-0 justify-center'}"
						title="Global Settings"
					>
						<Settings class="w-5 h-5 shrink-0" stroke-width={1.2} />
						{#if isExpanded}<span>Settings</span>{/if}
					</a>
					<button
						onclick={() => (showLogoutModal = true)}
						class="w-full text-left flex items-center gap-3 py-1.5 rounded-lg font-medium text-[13px] transition-all text-red-500/80 hover:bg-red-50 hover:text-red-600 {isExpanded
							? 'px-3 justify-start'
							: 'px-0 justify-center'}"
						title="Log out"
					>
						<LogOut class="w-5 h-5 shrink-0" stroke-width={1.2} />
						{#if isExpanded}<span>Log out</span>{/if}
					</button>
				</div>
			</div>
		</Sidebar.Content>
	</Sidebar.Root>

	<!-- Main Content Wrapper -->
	<Sidebar.Inset
		class="flex-1 min-w-0 flex flex-col pb-10 px-8 h-screen overflow-y-auto custom-scrollbar relative transition-all duration-300 border-none bg-[#f8f9fc]"
	>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<Confirmation
	bind:open={showLogoutModal}
	title="End Session"
	description="Are you sure you want to log out of the admin console?"
	confirmText="Log Out"
	cancelText="Cancel"
	icon={LogOut}
	iconColorClass="text-red-500"
	iconBgClass="bg-red-50"
	confirmBtnClass="bg-[#e44d4d] hover:bg-[#d43d3d] shadow-lg shadow-red-500/20 text-white"
	onConfirm={() => goto("/")}
/>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}
</style>
