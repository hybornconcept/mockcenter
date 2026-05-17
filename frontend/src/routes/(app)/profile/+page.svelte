<script lang="ts">
	import type { PageProps } from "./$types";
	import { onMount } from "svelte";
	import {
		User,
		Mail,
		Phone,
		MapPin,
		School,
		Calendar,
		Edit,
		Settings,
		Target,
		Trophy,
		Zap,
		BookOpen,
		TrendingUp,
		History,
		CreditCard,
		Bell,
		Trash2,
		Download,
		Check,
		Plus,
		ChevronRight,
		Star,
		Clock,
		ArrowUpRight,
		Flame,
		CheckCircle2,
		ShieldCheck,
		FileText,
		BarChart3,
		Calculator,
		Beaker,
		Dna,
		MoreVertical,
		Shield,
	} from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
	import { CalendarDate } from "@internationalized/date";
	import type { DateRange } from "bits-ui";
	import { toast } from "svelte-sonner";
	import { KpiCard } from "$lib/components";
	import Empty from "$lib/components/Empty.svelte";

	let { data }: PageProps = $props();

	// ── ICON MAPPING ──
	const icons: Record<string, any> = {
		User,
		Mail,
		Phone,
		MapPin,
		School,
		Calendar,
		Edit,
		Settings,
		Target,
		Trophy,
		Zap,
		BookOpen,
		TrendingUp,
		History,
		CreditCard,
		Bell,
		Trash2,
		Download,
		Check,
		Plus,
		ChevronRight,
		Star,
		Clock,
		ArrowUpRight,
		Flame,
		CheckCircle2,
		ShieldCheck,
		FileText,
		BarChart3,
	};

	// ── STATE ──
	let selectedSubjects = $state(new Set<string>());

	$effect(() => {
		if (selectedSubjects.size === 0 && data.initialSelectedSubjects) {
			selectedSubjects = new Set(data.initialSelectedSubjects);
		}
	});
	let currentTab = $state("overview");
	let historyFilter = $state("all");
	let isLoaded = $state(false);

	// ── DERIVED ──
	let filteredHistory = $derived(
		historyFilter === "all"
			? data.examHistory
			: data.examHistory.filter((e) => e.subject === historyFilter),
	);
	let maxCreditUsage = $derived(
		Math.max(...data.creditUsage.map((u) => u.val)),
	);
	let totalCredits = $derived(
		filteredHistory.reduce((acc, e) => acc + e.credits, 0),
	);

	let calendarValue = $state<DateRange>({
		start: new CalendarDate(2025, 4, 1),
		end: new CalendarDate(2025, 5, 2),
	});

	function toggleSubj(s: string) {
		if (selectedSubjects.has(s)) {
			selectedSubjects.delete(s);
		} else {
			selectedSubjects.add(s);
		}
		selectedSubjects = new Set(selectedSubjects);
	}

	onMount(() => {
		setTimeout(() => {
			isLoaded = true;
		}, 100);
	});
</script>

<div class=" mx-auto px-2 pt-4 pb-10 space-y-6 font-sans antialiased">
	<!-- HERO SECTION -->
	<!-- HERO SECTION REDESIGN (HORIZONTAL PORTFOLIO STYLE) -->
	<Card.Root class="rounded-lg border-slate-200/60 shadow-sm overflow-hidden">
		<Card.Content class="py-4 px-6">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				<!-- LEFT: Profile Identity & Actions -->
				<div class="lg:col-span-5 flex flex-col md:flex-row items-center gap-8">
					<!-- Avatar -->
					<div class="relative group shrink-0">
						<div
							class="w-36 h-36 rounded-full p-1 bg-slate-50 border border-slate-100 shadow-inner"
						>
							<div
								class="w-full h-full rounded-full border-[6px] border-white bg-transparent text-slate-700 text-3xl font-semibold flex items-center justify-center shadow-lg overflow-hidden relative"
							>
								<Avatar.Root class="w-full h-full">
									<Avatar.Image
										src={data.user.avatarUrl}
										alt={data.user.name}
										class="object-cover w-full h-full rounded-full"
									/>
									<Avatar.Fallback class="bg-slate-100 text-slate-400"
										>{data.user.initials}</Avatar.Fallback
									>
								</Avatar.Root>
							</div>
						</div>
						<Button
							size="icon"
							variant="secondary"
							class="absolute bottom-1 right-1 w-9 h-9 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-all bg-white text-slate-600"
							onclick={() => toast.info("Avatar upload coming soon")}
						>
							<Edit class="w-4 h-4" />
						</Button>
					</div>

					<!-- Name & Buttons -->
					<div
						class="flex flex-col items-center md:items-start text-center md:text-left flex-1"
					>
						<div class="mb-4">
							<h2 class="text-xl font-semibold text-slate-900 leading-tight">
								{data.user.name}
							</h2>
							<span
								class="text-[11px] font-semibold uppercase tracking-widest text-brand mt-1 block"
								>{data.user.plan}</span
							>
						</div>

						<div class="flex gap-3">
							<Button
								variant="outline"
								class="h-9 px-5 gap-2 rounded-lg border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
								onclick={() => (currentTab = "settings")}
							>
								<Settings class="w-4 h-4" />
								Settings
							</Button>
							<Button
								class="h-9 px-6 gap-2 bg-brand hover:bg-brand-dark rounded-lg shadow-lg shadow-brand/10 transition-all font-semibold text-white"
								onclick={() => (currentTab = "settings")}
							>
								<User class="w-4 h-4" />
								Edit Profile
							</Button>
						</div>
					</div>
				</div>

				<!-- RIGHT: Bio & Details -->
				<div
					class="lg:col-span-7 lg:border-l lg:border-slate-100 lg:pl-8 flex flex-col gap-4"
				>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3">
						<!-- ROW 1 -->
						<div class="space-y-0.5 border-b border-slate-100 pb-1.5">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block"
								>Target Exam</span
							>
							<p class="text-[13px] font-semibold text-slate-800">
								{data.user.targetExam}
							</p>
						</div>
						<div class="space-y-0.5 border-b border-slate-100 pb-1.5">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block"
								>Current Streak</span
							>
							<div class="flex items-center gap-2">
								<Flame class="w-3.5 h-3.5 text-amber-500" />
								<p class="text-[13px] font-semibold text-slate-800">
									{data.user.streak}-day streak
								</p>
							</div>
						</div>
						<div class="space-y-0.5 border-b border-slate-100 pb-1.5">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block"
								>Institution</span
							>
							<p class="text-[13px] font-semibold text-slate-800 truncate">
								{data.user.institution}
							</p>
						</div>

						<!-- ROW 2 -->
						<div class="space-y-1.5 border-b border-slate-100 pb-1.5">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block"
								>Subjects of Interest</span
							>
							<div class="flex flex-wrap gap-1.5">
								<Badge
									class="bg-blue-50 text-blue-600 border-blue-100 text-[9px] h-5 px-1.5 gap-1 font-semibold"
								>
									<Calculator class="w-2.5 h-2.5" /> Mathematics
								</Badge>
								<Badge
									class="bg-amber-50 text-amber-600 border-amber-100 text-[9px] h-5 px-1.5 gap-1 font-semibold"
								>
									<Zap class="w-2.5 h-2.5" /> Physics
								</Badge>
								<Badge
									class="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] h-5 px-1.5 gap-1 font-semibold"
								>
									<Beaker class="w-2.5 h-2.5" /> Chemistry
								</Badge>
								<Badge
									class="bg-rose-50 text-rose-600 border-rose-100 text-[9px] h-5 px-1.5 gap-1 font-semibold"
								>
									<Dna class="w-2.5 h-2.5" /> Biology
								</Badge>
							</div>
						</div>
						<div class="space-y-0.5 border-b border-slate-100 pb-1.5">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block"
								>Availability</span
							>
							<div
								class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100"
							>
								<div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
								<span class="text-[9px] font-bold uppercase tracking-wider"
									>Exam Ready</span
								>
							</div>
						</div>
						<div class="space-y-1.5 border-b border-slate-100 pb-1.5">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block"
								>Badges</span
							>
							<div class="flex items-center gap-1.5">
								<Badge
									class="bg-amber-50 text-amber-600 border-amber-100 font-semibold text-[9px] h-5 px-2"
									>🌟 Top Achiever</Badge
								>
								<Badge
									class="bg-blue-50 text-blue-600 border-blue-100 font-semibold text-[9px] h-5 px-2"
									>🛡️ Verified</Badge
								>
							</div>
						</div>
					</div>

					<div class="flex flex-wrap items-center gap-10 mt-1">
						<div class="flex flex-col">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
								>Focus Areas</span
							>
							<div class="flex items-center gap-1.5">
								<span class="text-[11px] font-semibold text-slate-500"
									>#Calculus</span
								>
								<span class="text-[11px] font-semibold text-slate-500"
									>#Mechanics</span
								>
								<span class="text-[11px] font-semibold text-slate-500"
									>#OrganicChem</span
								>
							</div>
						</div>
						<div class="flex flex-col">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
								>Email Address</span
							>
							<div class="flex items-center gap-1.5">
								<Mail class="w-3 h-3 text-brand/60" />
								<span class="text-[11px] font-semibold text-slate-600"
									>chukwuemeka@mockcenter.com</span
								>
							</div>
						</div>
						<div class="flex flex-col">
							<span
								class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
								>Phone Number</span
							>
							<div class="flex items-center gap-1.5">
								<Phone class="w-3 h-3 text-brand/60" />
								<span class="text-[11px] font-semibold text-slate-600"
									>+234 812 345 6789</span
								>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- KPI STATS -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
		<KpiCard
			title="Total Sessions"
			value="87"
			Icon={BookOpen}
			colorClass="text-blue-500"
			subtext="practice & mock exams"
			badgeText="+12 this week"
		/>
		<KpiCard
			title="Average Score"
			value="68%"
			Icon={Target}
			colorClass="text-brand"
			subtext="across all subjects"
			badgeText="Above Avg"
		/>
		<KpiCard
			title="Credits Balance"
			value="142"
			Icon={Zap}
			colorClass="text-amber-500"
			subtext="available to spend"
			badgeText="Top-up"
		/>
		<KpiCard
			title="Global Rank"
			value="#341"
			Icon={Trophy}
			colorClass="text-purple-500"
			subtext="out of 3,812 students"
			badgeText="Top 10%"
		/>
	</div>

	<!-- MAIN CONTENT TABS -->
	<Tabs.Root bind:value={currentTab} class="w-full mt-6">
		<div class="w-full border-b border-slate-200">
			<Tabs.List
				class="w-[40%] justify-between bg-transparent p-0 rounded-none h-auto"
			>
				<Tabs.Trigger
					value="overview"
					class="border-0 shadow-none rounded-none px-0 py-2 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-brand data-[state=active]:border-b-2 data-[state=active]:border-brand font-medium text-sm transition-all bg-transparent border-b-2 border-transparent -mb-[1px] flex items-center text-slate-600 hover:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
				>
					Overview
				</Tabs.Trigger>
				<Tabs.Trigger
					value="history"
					class="border-0 shadow-none rounded-none px-0 py-2 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-brand data-[state=active]:border-b-2 data-[state=active]:border-brand font-medium text-sm transition-all bg-transparent border-b-2 border-transparent -mb-[1px] flex items-center text-slate-600 hover:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
				>
					History
				</Tabs.Trigger>
				<Tabs.Trigger
					value="settings"
					class="border-0 shadow-none rounded-none px-0 py-2 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-brand data-[state=active]:border-b-2 data-[state=active]:border-brand font-medium text-sm transition-all bg-transparent border-b-2 border-transparent -mb-[1px] flex items-center text-slate-600 hover:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
				>
					Settings
				</Tabs.Trigger>
			</Tabs.List>
		</div>

		<!-- OVERVIEW TAB -->
		<Tabs.Content value="overview" class="mt-6 space-y-6">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<div class="lg:col-span-7 space-y-6">
					<!-- CURRENT BALANCE (COMPACTED & LIGHT THEME) -->
					<Card.Root
						class="bg-cyan-50 border border-cyan-100 shadow-sm text-cyan-950 relative overflow-hidden rounded-2xl"
					>
						<div
							class="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-200/20 rounded-full blur-2xl"
						></div>
						<Card.Content class="py-4 px-5 relative z-10">
							<div class="flex items-center justify-between mb-3">
								<div
									class="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 backdrop-blur-md"
								>
									<Zap class="w-5 h-5 text-cyan-600" />
								</div>
								<Badge
									class="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 font-semibold px-3 py-1 rounded-full text-[10px]"
									>Active Account</Badge
								>
							</div>
							<div class="flex flex-row items-center justify-between">
								<div>
									<span
										class="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800/60 mb-1 block"
										>Available Credits</span
									>
									<div class="flex items-baseline gap-2">
										<h2
											class="text-4xl font-black tracking-tighter text-cyan-950"
										>
											142
										</h2>
										<span class="text-sm font-bold text-cyan-800/50"
											>credits</span
										>
									</div>
								</div>
								<div class="flex gap-2">
									<Button
										size="sm"
										class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 h-9 rounded-lg"
									>
										<Zap class="w-3.5 h-3.5 mr-1.5" />
										Top-up
									</Button>
									<Button
										variant="outline"
										size="sm"
										class="bg-white/50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 font-bold px-4 h-9 rounded-lg"
									>
										<History class="w-3.5 h-3.5" />
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- STREAK ACTIVITY (REDESIGNED) -->
					<Card.Root
						class="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden"
					>
						<Card.Header
							class="py-2 px-6 border-b border-slate-200 flex flex-row items-center justify-between space-y-0"
						>
							<Card.Title class="text-[13px] font-bold text-slate-900 m-0">
								Study streak
							</Card.Title>
							<Badge
								class="bg-emerald-100/50 text-emerald-700 border-none font-bold px-2 py-0 rounded-full text-[10px] flex items-center gap-1"
							>
								<span>🔥</span> 14 days
							</Badge>
						</Card.Header>
						<Card.Content class="p-4">
							<p class="text-[11px] text-slate-400 mb-1.5">
								Last 35 days activity
							</p>

							<!-- Grid (14 columns) -->
							<div class="grid grid-cols-14 gap-0.5 mb-3">
								{#each data.streakDots.slice(-35) as s, i}
									{#if s === "done"}
										<div
											class="aspect-square rounded-[2px] bg-emerald-800"
										></div>
									{:else if s === "today"}
										<div
											class="aspect-square rounded-[2px] bg-emerald-500"
										></div>
									{:else}
										<div class="aspect-square rounded-[2px] bg-slate-100"></div>
									{/if}
								{/each}
							</div>

							<!-- Footer -->
							<div
								class="flex items-center justify-between text-[11px] font-medium text-slate-400"
							>
								<p>
									Best streak: <span class="text-emerald-800 font-bold"
										>21 days</span
									>
								</p>
								<p>
									This month: <span class="text-slate-700 font-bold"
										>26/30 days</span
									>
								</p>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- RECENT ACTIVITY -->
					<Card.Root
						class="border-slate-200/60 shadow-sm overflow-hidden rounded-2xl"
					>
						<Card.Header
							class="py-4 px-6 border-b border-slate-200 flex flex-row items-center justify-between space-y-0"
						>
							<Card.Title class="text-[14px] font-bold text-slate-900">
								Recent Activity
							</Card.Title>
							<Clock class="w-4 h-4 text-slate-400" />
						</Card.Header>
						<Card.Content class="p-0 divide-y divide-slate-100">
							{#each data.activities as a}
								{@const Icon = icons[a.iconName] || Clock}
								<div
									class="py-4 px-5 flex items-start gap-4 hover:bg-slate-50 transition-all hover:translate-x-1"
								>
									<div
										class="w-10 h-10 rounded-full {a.bg} {a.color} flex items-center justify-center shrink-0"
									>
										<Icon class="w-5 h-5" />
									</div>
									<div class="flex-1 min-w-0">
										<h5
											class="text-[13px] font-bold text-slate-900 leading-tight"
										>
											{a.title}
										</h5>
										<p class="text-[12px] text-slate-500 font-medium mt-0.5">
											{a.sub}
										</p>
									</div>
									<div class="text-right shrink-0 pt-0.5">
										<span class="text-[12px] text-slate-900 font-bold block"
											>{a.date}</span
										>
										<span
											class="text-[9px] text-slate-400 font-bold uppercase tracking-widest block"
											>{a.time}</span
										>
									</div>
								</div>
							{:else}
								<div class="py-6">
									<Empty title="No recent activity" message="You don't have any recent activity." compact />
								</div>
							{/each}
						</Card.Content>
					</Card.Root>
				</div>

				<div class="lg:col-span-5 space-y-6">
					<!-- COMBINED SUBJECT STRENGTH & ACHIEVEMENTS -->
					<Card.Root
						class="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden"
					>
						<Card.Header
							class="py-4 px-6 border-b border-slate-200 flex flex-row items-center justify-between space-y-0"
						>
							<Card.Title
								class="text-[15px] font-bold flex items-center gap-2 text-slate-900"
							>
								<BarChart3 class="w-4 h-4 text-slate-500" />
								Subject Strength
							</Card.Title>
							<button
								class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shrink-0"
							>
								<MoreVertical class="w-4 h-4" />
							</button>
						</Card.Header>
						<Card.Content class="p-5">
							<!-- List -->
							<div
								class="flex flex-col bg-slate-50 p-2 rounded-2xl border border-slate-100/50"
							>
								{#each data.subjects as s}
									{@const Icon = icons[s.iconName] || BookOpen}
									<div
										class="flex items-center gap-4 py-2 px-3 hover:bg-white transition-all hover:translate-x-1 rounded-xl"
									>
										<!-- Left Column: Icon -->
										<div class="flex-shrink-0">
											<div
												class="w-8 h-8 rounded-full border border-current bg-transparent flex items-center justify-center {s.text}"
											>
												<Icon class="w-4 h-4" />
											</div>
										</div>

										<!-- Right Column: Text & Bar -->
										<div class="flex-1 flex flex-col gap-1.5">
											<div class="flex items-center justify-between">
												<span
													class="text-[13px] font-normal text-slate-700 leading-none"
													>{s.name}</span
												>
												<span
													class="text-[13px] font-normal text-slate-700 leading-none"
													>{s.pct}%</span
												>
											</div>
											<div
												class="h-[6px] w-full bg-slate-200/50 rounded-full overflow-hidden"
											>
												<div
													class="h-full {s.color} transition-all duration-1000 rounded-full"
													style="width: {isLoaded ? s.pct : 0}%"
												></div>
											</div>
										</div>
									</div>
								{:else}
									<Empty title="No subjects" message="You don't have any subject performance data yet." compact />
								{/each}
							</div>

							<!-- ACHIEVEMENTS TIMELINE SECTION -->
							<div
								class="flex flex-row items-center justify-between pb-3 border-b border-slate-200 mb-4 mt-10"
							>
								<h3
									class="text-[15px] font-bold text-slate-900 leading-tight flex items-center gap-2"
								>
									Achievements
								</h3>
								<Badge
									variant="outline"
									class="text-slate-500 font-bold bg-slate-50 border-slate-200"
									>7 / 16 earned</Badge
								>
							</div>

							<!-- Timeline -->
							<div class="relative mt-2">
								<div class="flex flex-col gap-0">
									{#each data.achievements.slice(0, 7) as a, index}
										{@const Icon = icons[a.iconName] || Trophy}
										<div
											class="flex gap-4 relative group transition-all hover:translate-x-1 p-2 -ml-2 rounded-xl hover:bg-slate-50/50"
										>
											<!-- Connecting Line -->
											{#if index !== Math.min(data.achievements.length, 7) - 1}
												<div
													class="absolute left-[27.5px] top-[42px] bottom-[-4px] w-px {a.status ===
													'completed'
														? 'bg-brand'
														: 'bg-slate-200'} z-0"
												></div>
											{/if}

											<div class="mt-0.5 shrink-0 relative z-10">
												{#if a.status === "completed"}
													<div
														class="w-10 h-10 rounded-full bg-brand flex items-center justify-center shadow-sm ring-[6px] ring-white"
													>
														<Icon class="w-4 h-4 text-white" />
													</div>
												{:else if a.status === "current"}
													<div
														class="w-10 h-10 rounded-full bg-white border-[1.5px] border-brand flex items-center justify-center ring-[6px] ring-white"
													>
														<Icon class="w-4 h-4 text-brand" />
													</div>
												{:else}
													<div
														class="w-10 h-10 rounded-full bg-white border-[1.5px] border-slate-200 ring-[6px] ring-white flex items-center justify-center"
													>
														<Icon class="w-4 h-4 text-slate-300" />
													</div>
												{/if}
											</div>
											<div
												class="flex-1 pb-4 flex justify-between items-start gap-4"
											>
												<div class="pt-1">
													<h4
														class="text-[14px] font-semibold text-slate-900 mb-0.5"
													>
														{a.name}
													</h4>
													<p class="text-xs text-slate-500 leading-tight">
														{a.sub}
													</p>
												</div>
												<div class="text-right shrink-0 pt-1">
													{#if a.date}
														<p
															class="text-[14px] font-semibold text-slate-900 mb-0.5"
														>
															{a.date}
														</p>
														<p
															class="text-[9px] font-bold text-slate-400 uppercase tracking-widest"
														>
															{a.time}
														</p>
													{/if}
												</div>
											</div>
										</div>
									{:else}
										<Empty title="No achievements" message="You haven't earned any achievements yet." compact />
									{/each}
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		</Tabs.Content>

		<!-- HISTORY TAB -->
		<Tabs.Content value="history" class="mt-6 space-y-6">
			<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
				<Card.Header
					class="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-200 gap-4"
				>
					<Card.Title class="text-[14px] font-bold flex items-center gap-2">
						<History class="w-4 h-4 text-brand" />
						Exam Session History
					</Card.Title>
					<div class="flex items-center gap-3">
						<div class="w-48">
							<Select.Root type="single" bind:value={historyFilter}>
								<Select.Trigger
									class="h-9 text-xs font-semibold rounded-lg border-slate-200"
								>
									{historyFilter === "all"
										? "All Subjects"
										: historyFilter || "Filter by Subject"}
								</Select.Trigger>
								<Select.Content class="rounded-lg">
									<Select.Item value="all" label="All Subjects" class="text-xs"
										>All Subjects</Select.Item
									>
									<Select.Item
										value="English Language"
										label="English Language"
										class="text-xs">English Language</Select.Item
									>
									<Select.Item
										value="Mathematics"
										label="Mathematics"
										class="text-xs">Mathematics</Select.Item
									>
									<Select.Item value="Physics" label="Physics" class="text-xs"
										>Physics</Select.Item
									>
									<Select.Item
										value="Chemistry"
										label="Chemistry"
										class="text-xs">Chemistry</Select.Item
									>
								</Select.Content>
							</Select.Root>
						</div>

						<Popover.Root>
							<Popover.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										size="sm"
										class="h-9 text-xs font-semibold rounded-lg border-slate-200 gap-2"
									>
										<Calendar class="w-3.5 h-3.5 text-slate-400" />
										Range
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content
								class="w-auto p-0 rounded-xl overflow-hidden shadow-2xl border-slate-200"
								align="end"
							>
								<RangeCalendar
									bind:value={calendarValue}
									class="rounded-none border-0"
									numberOfMonths={2}
								/>
							</Popover.Content>
						</Popover.Root>

						<Badge
							variant="outline"
							class="text-brand font-bold bg-brand/5 border-brand/20 px-3 h-9 rounded-lg"
						>
							<Zap class="w-3 h-3 mr-1.5" />
							{totalCredits} Credits Used
						</Badge>
					</div>
				</Card.Header>
				<Card.Content class="p-0">
					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-slate-50/50">
									<th
										class="px-6 py-3 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100"
										>Datetime</th
									>
									<th
										class="px-6 py-3 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100"
										>Subject</th
									>
									<th
										class="px-6 py-3 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100"
										>Details</th
									>
									<th
										class="px-6 py-3 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100"
										>Score</th
									>
									<th
										class="px-6 py-3 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100"
										>Credits Used</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each filteredHistory as e}
									<tr class="hover:bg-slate-50/50 transition-colors">
										<td class="px-6 py-4">
											<div class="flex flex-col">
												<span class="text-[14px] font-bold text-slate-900 block"
													>{e.date}</span
												>
												<span
													class="text-[9px] text-slate-500 font-bold block mt-0.5 uppercase tracking-widest"
													>{e.time}</span
												>
											</div>
										</td>
										<td class="px-6 py-4">
											<span
												class="text-[13px] font-semibold text-slate-900 block"
												>{e.subject}</span
											>
											<Badge
												variant="outline"
												class="text-[9px] h-4 mt-1 bg-white border-slate-200 text-slate-400 font-semibold px-1.5"
												>{e.type}</Badge
											>
										</td>
										<td class="px-6 py-4">
											<span class="text-[12px] text-slate-500 font-medium"
												>{e.questions} Qs · {e.duration}</span
											>
										</td>
										<td class="px-6 py-4">
											<div class="flex flex-col items-end w-24">
												<span
													class="text-lg font-semibold {e.score >= 70
														? 'text-emerald-600'
														: e.score >= 50
															? 'text-amber-500'
															: 'text-rose-500'}">{e.score}%</span
												>
												<div
													class="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden"
												>
													<div
														class="h-full {e.score >= 70
															? 'bg-emerald-500'
															: e.score >= 50
																? 'bg-amber-500'
																: 'bg-rose-500'}"
														style="width: {e.score}%"
													></div>
												</div>
											</div>
										</td>
										<td class="px-6 py-4">
											<div class="flex flex-col items-end w-24">
												<div class="flex items-center gap-1.5 mb-1">
													<CreditCard class="w-3.5 h-3.5 text-cyan-500" />
													<span class="text-[13px] text-slate-900 font-bold"
														>{e.credits} Credits</span
													>
												</div>
												<div
													class="w-full h-1.5 bg-cyan-100/30 rounded-full overflow-hidden"
												>
													<div
														class="h-full bg-cyan-500 rounded-full transition-all duration-1000"
														style="width: {(e.credits / 15) * 100}%"
													></div>
												</div>
											</div>
										</td>
									</tr>
								{:else}
									<tr>
										<td colspan="5" class="py-12">
											<Empty title="No history found" message="No exam sessions match your filter." />
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- SETTINGS TAB -->
		<Tabs.Content value="settings" class="mt-6">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<div class="lg:col-span-7 space-y-6">
					<Card.Root class="border-slate-200 shadow-sm">
						<Card.Header class="py-4 border-b border-slate-100">
							<Card.Title class="text-[15px] font-bold flex items-center gap-2">
								<User class="w-4 h-4 text-slate-500" />
								Personal Information
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-6 space-y-6">
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label
										for="fname"
										class="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
										>First Name</Label
									>
									<Input
										id="fname"
										value="Chukwuemeka"
										class="rounded-lg border-slate-200 focus-visible:ring-brand"
									/>
								</div>
								<div class="space-y-2">
									<Label
										for="lname"
										class="text-[10px] font-black uppercase tracking-widest text-slate-400"
										>Last Name</Label
									>
									<Input
										id="lname"
										value="Adeyemi"
										class="rounded-xl border-slate-200 focus-visible:ring-brand"
									/>
								</div>
							</div>
							<div class="space-y-2">
								<Label
									for="email"
									class="text-[10px] font-black uppercase tracking-widest text-slate-400"
									>Email Address</Label
								>
								<Input
									id="email"
									type="email"
									value="chukwuemeka.adeyemi@gmail.com"
									class="rounded-xl border-slate-200 focus-visible:ring-brand"
								/>
							</div>
							<div class="space-y-2">
								<Label
									for="phone"
									class="text-[10px] font-black uppercase tracking-widest text-slate-400"
									>Phone Number</Label
								>
								<Input
									id="phone"
									type="tel"
									value="+234 812 345 6789"
									class="rounded-xl border-slate-200 focus-visible:ring-brand"
								/>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label
										class="text-[10px] font-black uppercase tracking-widest text-slate-400"
										>State</Label
									>
									<Select.Root type="single" value="Lagos">
										<Select.Trigger class="rounded-xl border-slate-200 h-10">
											Lagos
										</Select.Trigger>
										<Select.Content class="rounded-xl">
											<Select.Item value="Lagos" label="Lagos"
												>Lagos</Select.Item
											>
											<Select.Item value="Abuja FCT" label="Abuja FCT"
												>Abuja FCT</Select.Item
											>
											<Select.Item value="Kano" label="Kano">Kano</Select.Item>
											<Select.Item value="Rivers" label="Rivers"
												>Rivers</Select.Item
											>
										</Select.Content>
									</Select.Root>
								</div>
								<div class="space-y-2">
									<Label
										for="school"
										class="text-[10px] font-black uppercase tracking-widest text-slate-400"
										>School</Label
									>
									<Input
										id="school"
										value="Kings College Lagos"
										class="rounded-xl border-slate-200 focus-visible:ring-brand"
									/>
								</div>
							</div>
							<Button
								class="bg-brand hover:bg-brand-dark rounded-lg px-8 font-semibold"
								onclick={() => toast.success("Profile updated ✓")}
								>Save Changes</Button
							>
						</Card.Content>
					</Card.Root>

					<Card.Root class="border-slate-200 shadow-sm">
						<Card.Header class="py-4 border-b border-slate-100">
							<Card.Title class="text-[15px] font-bold flex items-center gap-2">
								<Star class="w-4 h-4 text-brand" />
								Exam Preferences
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-6 space-y-6">
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label
										class="text-[10px] font-black uppercase tracking-widest text-slate-400"
										>Target Exam</Label
									>
									<Select.Root type="single" value="JAMB UTME">
										<Select.Trigger class="rounded-xl border-slate-200 h-10">
											JAMB UTME
										</Select.Trigger>
										<Select.Content class="rounded-xl">
											<Select.Item value="JAMB UTME" label="JAMB UTME"
												>JAMB UTME</Select.Item
											>
											<Select.Item value="WAEC" label="WAEC">WAEC</Select.Item>
											<Select.Item value="NECO" label="NECO">NECO</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>
								<div class="space-y-2">
									<Label
										class="text-[10px] font-black uppercase tracking-widest text-slate-400"
										>Target Year</Label
									>
									<Select.Root type="single" value="2025">
										<Select.Trigger class="rounded-xl border-slate-200 h-10">
											2025
										</Select.Trigger>
										<Select.Content class="rounded-xl">
											<Select.Item value="2025" label="2025">2025</Select.Item>
											<Select.Item value="2026" label="2026">2026</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>
							</div>
							<div class="space-y-4">
								<Label
									class="text-[10px] font-black uppercase tracking-widest text-slate-400"
									>Primary Subjects</Label
								>
								<div class="flex flex-wrap gap-2">
									{#each data.allSubjects as s}
										<button
											class="text-xs font-bold px-4 py-2 rounded-full border transition-all
												{selectedSubjects.has(s)
												? 'bg-brand/10 border-brand/30 text-brand'
												: 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}"
											onclick={() => toggleSubj(s)}
										>
											{s}
										</button>
									{/each}
								</div>
							</div>
							<Button
								class="bg-brand hover:bg-brand-dark rounded-lg px-8 font-semibold"
								onclick={() => toast.success("Preferences saved ✓")}
								>Save Preferences</Button
							>
						</Card.Content>
					</Card.Root>
				</div>

				<div class="lg:col-span-5 space-y-8">
					<Card.Root class="border-slate-200 shadow-sm">
						<Card.Header class="py-3 border-b border-slate-100">
							<Card.Title class="text-[15px] font-bold flex items-center gap-2">
								<User class="w-4 h-4 text-slate-500" />
								Personal Information
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-5 space-y-5">
							<div class="space-y-2">
								<Label
									class="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
									>Current Password</Label
								>
								<Input
									type="password"
									placeholder="••••••••"
									class="rounded-lg border-slate-200"
								/>
							</div>
							<div class="space-y-2">
								<Label
									class="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
									>New Password</Label
								>
								<Input
									type="password"
									placeholder="••••••••"
									class="rounded-lg border-slate-200"
								/>
							</div>
							<Button
								class="bg-slate-900 hover:bg-black rounded-lg w-full font-semibold"
								onclick={() => toast.success("Password updated ✓")}
								>Change Password</Button
							>
						</Card.Content>
					</Card.Root>

					<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
						<Card.Header class="py-4 border-b border-slate-100">
							<Card.Title class="text-[15px] font-bold flex items-center gap-2">
								<Bell class="w-4 h-4 text-brand" />
								Notifications
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-0 divide-y divide-slate-100">
							{#each [{ title: "Result Notifications", sub: "When mock results are ready", active: true }, { title: "Study Reminders", sub: "Daily nudge for your streak", active: true }, { title: "Low Credit Alerts", sub: "Alert when balance is < 10", active: true }, { title: "Leaderboard Updates", sub: "When your rank changes", active: false }] as n}
								<div
									class="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
								>
									<div>
										<h6
											class="text-[13px] font-semibold text-slate-900 leading-tight"
										>
											{n.title}
										</h6>
										<p class="text-[11px] text-slate-400 font-medium mt-0.5">
											{n.sub}
										</p>
									</div>
									<Switch
										checked={n.active}
										class="data-[state=checked]:bg-brand"
									/>
								</div>
							{/each}
						</Card.Content>
					</Card.Root>

					<Card.Root class="border-rose-100 shadow-sm bg-rose-50/20">
						<Card.Header class="py-4 border-b border-rose-100">
							<Card.Title
								class="text-[15px] font-bold text-rose-600 flex items-center gap-2"
							>
								<Trash2 class="w-4 h-4" />
								Account Actions
							</Card.Title>
						</Card.Header>
						<Card.Content class="p-6 space-y-4">
							<Button
								variant="outline"
								class="w-full border-slate-200 text-slate-600 font-semibold rounded-lg h-11"
								onclick={() => toast.info("Preparing your data download…")}
							>
								<Download class="w-4 h-4 mr-2" />
								Download My Data
							</Button>
							<Button
								variant="outline"
								class="w-full border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-lg h-11"
								onclick={() =>
									toast.error("Account deletion requires email verification")}
							>
								<Trash2 class="w-4 h-4 mr-2" />
								Delete Account
							</Button>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	:global(.no-scrollbar::-webkit-scrollbar) {
		display: none;
	}
	:global(.no-scrollbar) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.bg-grid-pattern {
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
	}
</style>
