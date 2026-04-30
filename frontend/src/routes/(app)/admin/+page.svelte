<script lang="ts">
	import type { PageProps } from "./$types";
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	import {
		BookOpen,
		Users,
		PlayCircle,
		Download,
		Upload,
		Image as ImageIcon,
		Zap,
		Target,
		Database,
		Cloud,
		Lock,
		CreditCard,
		Mail,
		AlertTriangle,
		Plus,
		CheckCircle,
		Info,
		Dna,
		Ruler,
		Pencil,
		FlaskConical,
		Atom,
		Landmark,
		Scroll,
		ArrowUpRight,
		MoreHorizontal,
		TrendingUp,
		Activity,
		Server,
	} from "@lucide/svelte";
	import { toast } from "svelte-sonner";
	import { onMount } from "svelte";
	import Empty from "$lib/components/Empty.svelte";

	let { data }: PageProps = $props();

	// Icon Mapping for data driven icons
	const iconMap: Record<string, any> = {
		alert: AlertTriangle,
		zap: Zap,
		credit: CreditCard,
		check: CheckCircle,
		info: Info,
		dna: Dna,
		ruler: Ruler,
		pencil: Pencil,
		flask: FlaskConical,
		atom: Atom,
		landmark: Landmark,
		scroll: Scroll,
		database: Database,
		cloud: Cloud,
		lock: Lock,
		mail: Mail,
		// Subject aliases
		biology: Dna,
		mathematics: Ruler,
		english: Pencil,
		chemistry: FlaskConical,
		physics: Atom,
		government: Landmark,
		history: Scroll,
	};

	// Data States
	let now = $state(new Date());
	let greeting = $derived(
		now.getHours() < 12
			? "Good morning"
			: now.getHours() < 17
				? "Good afternoon"
				: "Good evening",
	);
	let formattedDate = $derived(
		now.toLocaleDateString("en-GB", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		}),
	);

	// svelte-ignore state_referenced_locally
	let activity = $state(data.initialActivity);

	// Real-time ticker — rotates through messages derived from live activity
	onMount(() => {
		const pool = data.initialActivity?.length
			? data.initialActivity
			: [
					{
						dot: "bg-blue-500",
						actor: "User",
						text: "started a practice session",
						time: "Just now",
					},
					{
						dot: "bg-green-500",
						actor: "User",
						text: "completed a mock exam",
						time: "Just now",
					},
				];
		const interval = setInterval(() => {
			const randomItem = {
				...pool[Math.floor(Math.random() * pool.length)],
				time: "Just now",
			};
			activity = [randomItem, ...activity.slice(0, 11)];
		}, 8000);
		return () => clearInterval(interval);
	});
</script>

<div class="flex flex-col gap-6 w-full -mt-2">
	<!-- GREETING BANNER -->
	<div
		class="bg-brand-dark rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-lg shadow-brand/10 border border-white/5 relative overflow-hidden"
	>
		<!-- Background Accents -->
		<div
			class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"
		></div>
		<div
			class="absolute bottom-0 left-0 w-32 h-32 bg-brand/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"
		></div>

		<div
			class="flex flex-col gap-1 relative z-10 w-full md:w-auto text-center md:text-left"
		>
			<span
				class="text-brand-muted/80 text-[11px] font-bold uppercase tracking-[0.15em]"
				>{formattedDate}</span
			>
			<h2 class="text-2xl font-black text-white tracking-tight">
				{greeting}, Admin 👋
			</h2>
			<p class="text-brand-muted/70 text-[13px] font-medium max-w-md">
				The MockCenter platform is running smoothly. You have <span
					class="text-white font-bold">{data.notifications?.length ?? 0}</span
				> live notifications.
			</p>
		</div>

		<div class="flex items-center gap-4 mt-6 md:mt-0 relative z-10">
			<Card class="bg-white/10 border-white/10 backdrop-blur-md">
				<CardContent class="py-2.5 px-6 text-center">
					<div class="text-xl font-black text-white">
						{data.kpi?.activeToday?.toLocaleString() ?? "—"}
					</div>
					<div
						class="text-[9px] font-bold text-brand-muted uppercase tracking-wider"
					>
						Active Today
					</div>
				</CardContent>
			</Card>
			<Card class="bg-white/10 border-white/10 backdrop-blur-md">
				<CardContent class="py-2.5 px-6 text-center">
					<div class="text-xl font-black text-white">
						{data.kpi?.totalQuestions?.toLocaleString() ?? "—"}
					</div>
					<div
						class="text-[9px] font-bold text-brand-muted uppercase tracking-wider"
					>
						Sessions
					</div>
				</CardContent>
			</Card>
			<Card
				class="bg-white/10 border-white/10 backdrop-blur-md hidden sm:block"
			>
				<CardContent class="py-2.5 px-6 text-center">
					<div class="text-xl font-black text-white">
						{data.kpi?.questionsAnswered?.toLocaleString() ?? "—"}
					</div>
					<div
						class="text-[9px] font-bold text-brand-muted uppercase tracking-wider"
					>
						Answers
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- SNAPSHOT KPI ROW (Matched to App Dashboard Styling) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
		<!-- Card 1: Questions -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
			onclick={() => toast.info("Opening Question Bank...")}
			onkeydown={(e) =>
				e.key === "Enter" && toast.info("Opening Question Bank...")}
			role="button"
			tabindex="0"
		>
			<BookOpen
				class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>QUESTIONS</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
				>{data.kpi?.totalQuestions?.toLocaleString() ?? "—"}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
					<span class="text-[10px] font-bold text-green-600 leading-none"
						>+{data.kpi?.newQuestions ?? 0}</span
					>
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>vs last week</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-brand-dark bg-brand-muted border-brand/20"
				>
					Question Bank
				</Badge>
			</div>
		</div>

		<!-- Card 2: Users -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
			onclick={() => toast.info("Opening Users...")}
			onkeydown={(e) => e.key === "Enter" && toast.info("Opening Users...")}
			role="button"
			tabindex="0"
		>
			<Users
				class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>USERS</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
				>{data.kpi?.totalUsers?.toLocaleString() ?? "—"}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
					<span class="text-[10px] font-bold text-green-600 leading-none"
						>+{data.kpi?.newUsers ?? 0}</span
					>
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>this month</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-brand-dark bg-brand-muted border-brand/20"
				>
					Growing
				</Badge>
			</div>
		</div>

		<!-- Card 3: Media -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
			onclick={() => toast.info("Viewing Media Library...")}
			onkeydown={(e) =>
				e.key === "Enter" && toast.info("Viewing Media Library...")}
			role="button"
			tabindex="0"
		>
			<ImageIcon
				class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>MEDIA FILES</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
				>{data.kpi?.totalMedia?.toLocaleString() ?? "—"}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<span
					class="text-[10px] font-bold text-gray-400 mt-px mr-px leading-none"
					>→ {data.kpi?.orphanCount ?? 0} orphaned</span
				>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-red-700 bg-red-50 border-red-100/50"
				>
					Review Needed
				</Badge>
			</div>
		</div>

		<!-- Card 4: Revenue -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
		>
			<Zap
				class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>REVENUE</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
				>{data.kpi?.creditsInCirculation != null
					? `₦${Math.round(data.kpi.creditsInCirculation / 1000)}k`
					: "—"}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
					<span class="text-[10px] font-bold text-green-600 leading-none"
						>+22%</span
					>
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>vs yesterday</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-blue-700 bg-blue-50 border-blue-100/50"
				>
					Healthy
				</Badge>
			</div>
		</div>

		<!-- Card 5: Pass Rate -->
		<div
			class="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between h-[115px] group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 hover:bg-brand-muted/20 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
		>
			<Target
				class="w-6 h-6 text-brand/10 absolute right-3 top-3 group-hover:text-brand/20 transition-colors duration-500 scale-125"
				stroke-width={1.5}
			/>

			<div class="flex items-center justify-between relative z-10">
				<span class="text-[12px] font-medium text-gray-500 tracking-tight"
					>AVG PASS RATE</span
				>
				<button class="text-gray-400/50 hover:text-brand transition-colors"
					><MoreHorizontal class="w-3.5 h-3.5" stroke-width={2} /></button
				>
			</div>

			<span
				class="text-[26px] font-extrabold text-slate-800 leading-none tracking-tight group-hover:text-brand transition-colors block relative z-10"
				>{data.kpi?.passRate != null ? `${data.kpi.passRate}%` : "—"}</span
			>

			<div class="flex items-center justify-between w-full relative z-10">
				<div class="flex items-center gap-1">
					<ArrowUpRight class="w-2.5 h-2.5 text-green-600" />
					<span class="text-[10px] font-bold text-green-600 leading-none"
						>+3%</span
					>
					<span class="text-[10px] font-bold text-gray-400 leading-none ml-0.5"
						>overall growth</span
					>
				</div>
				<Badge
					variant="outline"
					class="px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest leading-none text-amber-700 bg-amber-50 border-amber-100/50"
				>
					Platform Avg
				</Badge>
			</div>
		</div>
	</div>

	<!-- MAIN CONTENT GRID -->
	<div class="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-6 items-start">
		<!-- COLUMN 1: QUICK ACTIONS & HEALTH -->
		<div class="flex flex-col gap-6">
			<Card class="bg-white shadow-sm border-slate-100 overflow-hidden">
				<CardHeader class="pb-3 border-b border-slate-50">
					<div class="flex items-center justify-between">
						<CardTitle
							class="text-[13px] font-bold text-slate-800 tracking-tight"
							>Quick Actions</CardTitle
						>
						<span
							class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
							>Management</span
						>
					</div>
				</CardHeader>
				<CardContent class="p-0">
					<div class="grid grid-cols-2 gap-[1px] bg-slate-50">
						<button
							class="flex items-center gap-3 p-5 bg-white hover:bg-slate-50 transition-colors text-left group"
							onclick={() => toast.info("Opening question form...")}
						>
							<div
								class="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<Plus class="w-5 h-5" />
							</div>
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-bold text-slate-800"
									>Add Question</span
								>
								<span class="text-[10px] font-medium text-slate-400"
									>Manual entry form</span
								>
							</div>
						</button>
						<button
							class="flex items-center gap-3 p-5 bg-white hover:bg-slate-50 transition-colors text-left group"
						>
							<div
								class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<Upload class="w-5 h-5" />
							</div>
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-bold text-slate-800">Bulk Import</span
								>
								<span class="text-[10px] font-medium text-slate-400"
									>CSV or Excel file</span
								>
							</div>
						</button>
						<button
							class="flex items-center gap-3 p-5 bg-white hover:bg-slate-50 transition-colors text-left group"
						>
							<div
								class="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<PlayCircle class="w-5 h-5" />
							</div>
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-bold text-slate-800"
									>New Exam Type</span
								>
								<span class="text-[10px] font-medium text-slate-400"
									>Configure rules</span
								>
							</div>
						</button>
						<button
							class="flex items-center gap-3 p-5 bg-white hover:bg-slate-50 transition-colors text-left group"
						>
							<div
								class="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<ImageIcon class="w-5 h-5" />
							</div>
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-bold text-slate-800"
									>Upload Images</span
								>
								<span class="text-[10px] font-medium text-slate-400"
									>R2 Media Library</span
								>
							</div>
						</button>
						<button
							class="flex items-center gap-3 p-5 bg-white hover:bg-slate-50 transition-colors text-left group"
						>
							<div
								class="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<Users class="w-5 h-5" />
							</div>
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-bold text-slate-800"
									>Manage Users</span
								>
								<span class="text-[10px] font-medium text-slate-400"
									>View all accounts</span
								>
							</div>
						</button>
						<button
							class="flex items-center gap-3 p-5 bg-white hover:bg-slate-50 transition-colors text-left group"
						>
							<div
								class="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<Download class="w-5 h-5" />
							</div>
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-bold text-slate-800">Export Data</span
								>
								<span class="text-[10px] font-medium text-slate-400"
									>JSON or CSV dump</span
								>
							</div>
						</button>
					</div>
				</CardContent>
			</Card>

			<Card class="bg-white shadow-sm border-slate-100">
				<CardHeader class="pb-3 px-5">
					<CardTitle class="text-[13px] font-bold text-slate-800 tracking-tight"
						>Content Health</CardTitle
					>
				</CardHeader>
				<CardContent class="flex flex-col gap-2.5 px-5 pb-5">
					{#each data.healthWarnings as warning}
						{@const Icon = iconMap[warning.iconId]}
						<div
							class="flex items-start gap-4 p-3.5 rounded-xl border transition-all {warning.type ===
							'error'
								? 'bg-red-50/50 border-red-100 text-red-900 animate-pulse-subtle'
								: warning.type === 'warn'
									? 'bg-amber-50/50 border-amber-100 text-amber-900'
									: warning.type === 'info'
										? 'bg-blue-50/50 border-blue-100 text-blue-900'
										: 'bg-green-50/50 border-green-100 text-green-900'}"
						>
							<div
								class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {warning.type ===
								'error'
									? 'bg-red-500 text-white'
									: warning.type === 'warn'
										? 'bg-amber-500 text-white'
										: warning.type === 'info'
											? 'bg-blue-500 text-white'
											: 'bg-green-500 text-white'}"
							>
								{#if Icon}
									<Icon class="w-4 h-4" />
								{:else}
									<Shield class="w-4 h-4" />
								{/if}
							</div>
							<div class="flex flex-col grow gap-0.5">
								<h4 class="text-[12px] font-bold tracking-tight">
									{warning.title}
								</h4>
								<p class="text-[11px] opacity-70 leading-relaxed font-medium">
									{warning.desc}
								</p>
								{#if warning.action}
									<button
										class="text-[10px] font-black uppercase tracking-wider mt-2 hover:underline text-left"
										>{warning.action}</button
									>
								{/if}
							</div>
						</div>
					{:else}
						<Empty
							title="All systems healthy"
							message="No warnings or errors detected at this time."
							icon={CheckCircle}
							compact={true}
						/>
					{/each}
				</CardContent>
			</Card>
		</div>

		<!-- COLUMN 2: LIVE ACTIVITY FEED -->
		<Card class="bg-white shadow-sm border-slate-100 flex flex-col h-full">
			<CardHeader
				class="pb-4 px-5 border-b border-slate-50 flex flex-row items-center justify-between"
			>
				<div class="flex flex-col gap-0.5">
					<CardTitle class="text-[13px] font-bold text-slate-800 tracking-tight"
						>Live Activity</CardTitle
					>
					<span class="text-[10px] font-bold text-slate-400"
						>Platform events</span
					>
				</div>
				<Badge
					class="bg-green-500 text-white border-none text-[9px] font-black uppercase tracking-tighter h-5 px-1.5 shine"
					>Real-time</Badge
				>
			</CardHeader>
			<CardContent
				class="grow p-0 overflow-y-auto max-h-[820px] custom-scrollbar"
			>
				<div class="flex flex-col">
					{#each activity as item, i}
						<div
							class="flex items-start gap-3.5 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors {i ===
							0
								? 'bg-green-50/30'
								: ''}"
						>
							<div
								class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 {item.dot}"
							></div>
							<div class="flex flex-col gap-0.5 grow">
								<p
									class="text-[12px] leading-relaxed text-slate-700 font-medium"
								>
									<span class="font-bold text-slate-900">{item.actor}</span>
									{item.text}
								</p>
								<span class="text-[10px] font-bold text-slate-400"
									>{item.time}</span
								>
							</div>
						</div>
					{/each}
					{#if activity.length === 0}
						<div class="py-10">
							<Empty
								title="No recent activity"
								message="Platform events will appear here."
								icon={Activity}
								compact={true}
							/>
						</div>
					{/if}
				</div>
			</CardContent>
			<div class="p-4 bg-slate-50/50 border-t border-slate-100">
				<button
					class="text-[11px] font-bold text-brand hover:underline w-full text-center"
					>View audit logs</button
				>
			</div>
		</Card>

		<!-- COLUMN 3: SIDEBAR (STATUS & COVERAGE) -->
		<div class="flex flex-col gap-6">
			<!-- SYSTEM STATUS -->
			<Card class="bg-white shadow-sm border-slate-100 overflow-hidden">
				<CardHeader class="p-4 bg-slate-50/50 border-b border-slate-100">
					<div class="flex items-center justify-between">
						<CardTitle
							class="text-[12px] font-bold text-slate-800 tracking-tight"
							>System Status</CardTitle
						>
						<div class="flex items-center gap-2">
							<div
								class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
							></div>
							<span class="text-[10px] font-bold text-green-600">Stable</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="p-4 flex flex-col gap-1">
					{#each data.systemStatus as sys}
						{@const Icon = iconMap[sys.iconId]}
						<div
							class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
						>
							<div class="flex items-center gap-2.5">
								{#if Icon}
									<Icon class="w-3.5 h-3.5 text-slate-400" />
								{:else}
									<div class="w-3.5 h-3.5 bg-slate-100 rounded-full"></div>
								{/if}
								<span class="text-[11px] font-bold text-slate-600"
									>{sys.name}</span
								>
							</div>
							<div class="flex items-center gap-1.5">
								<div class="w-1.5 h-1.5 rounded-full {sys.color}"></div>
								<span
									class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter"
									>{sys.status}</span
								>
							</div>
						</div>
					{:else}
						<div class="py-4">
							<Empty
								title="No systems"
								message="No system status to display."
								icon={Server}
								compact={true}
							/>
						</div>
					{/each}
				</CardContent>
			</Card>

			<!-- QUESTION COVERAGE -->
			<Card class="bg-white shadow-sm border-slate-100">
				<CardHeader class="p-4 border-b border-slate-100">
					<div class="flex items-center justify-between">
						<CardTitle
							class="text-[12px] font-bold text-slate-800 tracking-tight"
							>Question Coverage</CardTitle
						>
						<button class="text-[10px] font-bold text-brand hover:underline"
							>Manage →</button
						>
					</div>
				</CardHeader>
				<CardContent class="p-4 flex flex-col gap-5">
					{#each data.subjectCoverage as sub}
						{@const Icon = iconMap[sub.iconId]}
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div
										class="w-7 h-7 rounded-lg {sub.color}/10 {sub.color.replace(
											'bg',
											'text',
										)} flex items-center justify-center shrink-0"
									>
										{#if Icon}
											<Icon class="w-4 h-4" />
										{:else}
											<BookOpen class="w-4 h-4" />
										{/if}
									</div>
									<span class="text-[11px] font-bold text-slate-700"
										>{sub.name}</span
									>
								</div>
								<div class="flex items-baseline gap-1">
									<span class="text-[12px] font-black text-slate-900"
										>{sub.count}</span
									>
									<span class="text-[9px] font-bold text-slate-400"
										>/ {sub.target}</span
									>
								</div>
							</div>
							<div
								class="bg-slate-100 h-1.5 rounded-full relative flex w-full items-center overflow-hidden"
							>
								<div
									class="h-full {sub.color === 'bg-sepia-500'
										? 'bg-[#854F0B]'
										: sub.color} transition-all duration-1000 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
									style="width: {Math.min(
										100,
										(sub.count / sub.target) * 100,
									)}%"
								></div>
							</div>
						</div>
					{:else}
						<div class="py-4">
							<Empty
								title="No coverage data"
								message="Import questions to see coverage."
								icon={BookOpen}
								compact={true}
							/>
						</div>
					{/each}
				</CardContent>
			</Card>
		</div>
	</div>
</div>

<style>
	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 4px;
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

	@keyframes pulse-subtle {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.85;
		}
	}
	.animate-pulse-subtle {
		animation: pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.shine {
		position: relative;
		overflow: hidden;
	}
	.shine::after {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 50%;
		height: 100%;
		background: linear-gradient(
			to right,
			transparent,
			rgba(255, 255, 255, 0.4),
			transparent
		);
		transform: skewX(-25deg);
		animation: shine 3s infinite;
	}
	@keyframes shine {
		100% {
			left: 200%;
		}
	}
</style>
