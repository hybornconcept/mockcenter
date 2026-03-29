<script lang="ts">
	import "./layout.css";
	import {
		Home,
		Search,
		Bookmark,
		LayoutGrid,
		Folder,
		Users,
		PieChart,
		Settings,
		Plus,
		Zap,
		MessageSquare,
		Archive,
		LayoutTemplate,
		ChevronDown,
		ChevronLeft,
		Clock,
		ArrowUpRight,
		Sparkles,
	} from "@lucide/svelte";

	import { page } from "$app/stores";

	let { children } = $props();

	let activeProject = $state("Fikri studio");
	let sidebarOpen = $state(true);
</script>

{#if $page.url.pathname.startsWith("/settings") || $page.url.pathname.startsWith("/scores")}
	<div class="flex min-h-screen w-full bg-white">
		<!-- Leftmost Mini-Rail -->
		<!-- ... (existing sidebar content for settings/scores) ... -->
		<aside
			class="w-16 border-r border-slate-100 flex flex-col items-center py-6 gap-6 shrink-0 sticky top-0 h-screen z-30 bg-white"
		>
			<!-- Logo (Toggle) -->
			<button
				onclick={() => (sidebarOpen = !sidebarOpen)}
				class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors cursor-pointer"
				title="Toggle Sidebar"
			>
				t
			</button>

			<!-- Nav Icons -->
			<nav class="flex flex-col gap-4 mt-2">
				<a
					href="/items"
					class="p-2.5 {$page.url.pathname.startsWith('/items')
						? 'text-indigo-600 bg-indigo-50'
						: 'text-slate-400 hover:text-slate-900'} rounded-lg transition-colors"
				>
					<LayoutGrid class="w-5 h-5" />
				</a>
				<button
					class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
				>
					<Home class="w-5 h-5" />
				</button>
				<button
					class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
				>
					<Search class="w-5 h-5" />
				</button>
				<button
					class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
				>
					<Bookmark class="w-5 h-5" />
				</button>
				<button
					class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
				>
					<Folder class="w-5 h-5" />
				</button>
				<button
					class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
				>
					<Users class="w-5 h-5" />
				</button>
				<button
					class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
				>
					<PieChart class="w-5 h-5" />
				</button>
			</nav>

			<!-- Bottom Icons -->
			<div class="mt-auto flex flex-col gap-4">
				<button
					class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm"
				>
					<Plus class="w-4 h-4" />
				</button>
				<button
					class="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-white shadow-sm"
				>
					<Zap class="w-4 h-4 fill-white" />
				</button>
				<button
					class="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
				>
					<MessageSquare class="w-5 h-5" />
				</button>
				<a
					href="/settings"
					class="p-2.5 {$page.url.pathname.startsWith('/settings')
						? 'text-indigo-600 bg-indigo-50'
						: 'text-slate-400 hover:text-slate-900'} rounded-lg transition-colors"
				>
					<Settings class="w-5 h-5" />
				</a>
				<!-- Profile -->
				<div
					class="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-800 border-2 border-white shadow-sm"
				>
					RF
				</div>
			</div>
		</aside>

		<!-- Main Sidebar -->
		<aside
			class="border-r border-slate-100 flex flex-col bg-slate-50/30 overflow-hidden shrink-0 sticky top-0 h-screen z-20 transition-all duration-300 ease-in-out {sidebarOpen
				? 'w-64 opacity-100'
				: 'w-0 opacity-0 border-none'}"
		>
			<div class="px-6 py-7 flex items-center justify-between min-w-[16rem]">
				<h2 class="font-bold text-lg text-slate-900 tracking-tight">
					Learning Content
				</h2>
				<button
					class="text-slate-400 hover:text-slate-600"
					onclick={() => (sidebarOpen = false)}
				>
					<ChevronLeft class="w-4 h-4" />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto px-4 custom-scrollbar">
				<!-- Main Nav -->
				<div class="space-y-1 mb-6">
					<button
						class="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all text-sm font-medium"
					>
						<Clock class="w-4 h-4" /> Recents
					</button>
					<button
						class="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all text-sm font-medium"
					>
						<Users class="w-4 h-4" /> Shared Content
					</button>
					<button
						class="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all text-sm font-medium"
					>
						<Archive class="w-4 h-4" /> Archived
					</button>
					<button
						class="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all text-sm font-medium"
					>
						<LayoutTemplate class="w-4 h-4" /> Templates
					</button>
				</div>

				<!-- Favorites -->
				<div class="space-y-4 mb-8">
					<div class="flex items-center justify-between px-3">
						<div class="flex items-center gap-2">
							<span
								class="text-xs font-bold text-slate-400 uppercase tracking-widest"
								>Favorites</span
							>
							<span
								class="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold"
								>3</span
							>
						</div>
						<ChevronDown class="w-3 h-3 text-slate-400" />
					</div>
					<div class="space-y-1">
						<button
							class="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-all text-sm font-medium"
						>
							<div
								class="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center"
							>
								<div class="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
							</div>
							Figma Basic
						</button>
						<button
							class="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-all text-sm font-medium"
						>
							<div
								class="w-5 h-5 rounded bg-blue-100 flex items-center justify-center"
							>
								<Folder class="w-3 h-3 text-blue-500 fill-blue-500" />
							</div>
							Folder NEW 2024
						</button>
						<button
							class="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-all text-sm font-medium"
						>
							<div
								class="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center"
							>
								<Bookmark class="w-3 h-3 text-indigo-500 fill-indigo-500" />
							</div>
							Assignment 101
						</button>
						<button
							class="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-all text-sm font-medium"
						>
							<div
								class="w-5 h-5 rounded bg-amber-100 flex items-center justify-center"
							>
								<PieChart class="w-3 h-3 text-amber-500 fill-amber-500" />
							</div>
							Quiz Figma
						</button>
					</div>
				</div>

				<!-- Projects -->
				<div class="space-y-4">
					<div class="flex items-center justify-between px-3">
						<div class="flex items-center gap-2">
							<span
								class="text-xs font-bold text-slate-400 uppercase tracking-widest"
								>Projects</span
							>
							<span
								class="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold"
								>2</span
							>
						</div>
						<Plus class="w-3 h-3 text-slate-400" />
					</div>
					<div class="space-y-1">
						<button
							class="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-white rounded-lg transition-all text-sm font-medium"
						>
							<div class="w-2 h-2 rounded-full bg-slate-200"></div>
							Figma basic
						</button>
						<button
							class="w-full flex items-center gap-3 px-3 py-2 bg-white text-slate-900 rounded-lg shadow-sm border border-slate-100 transition-all text-sm font-bold"
						>
							<div class="w-2 h-2 rounded-full bg-pink-400"></div>
							Fikri studio
						</button>
					</div>
				</div>

				<!-- Trenning AI Card -->
				<div
					class="mt-8 mb-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group"
				>
					<div
						class="absolute -top-6 -right-6 w-16 h-16 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform"
					></div>
					<div class="relative z-10 space-y-3">
						<div
							class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"
						>
							<Sparkles class="w-4 h-4" />
						</div>
						<div>
							<h4 class="font-bold text-sm text-slate-900">Get Trenning AI</h4>
							<p class="text-[11px] text-slate-500 leading-relaxed mt-1">
								Use AI in every action on Trenning webapp
							</p>
						</div>
						<button
							class="w-full py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
						>
							Try it now <ArrowUpRight class="w-3 h-3" />
						</button>
					</div>
				</div>
			</div>
		</aside>

		<!-- Main Content Area -->
		<main class="flex-1 min-w-0">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 10px;
	}
</style>
