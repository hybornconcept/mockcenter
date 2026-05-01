<script lang="ts">
	import {
		Search,
		Plus,
		DownloadCloud,
		Clock,
		TrendingUp,
		Users,
		ShieldAlert,
		ShieldCheck,
		Eye,
		Ban,
		Mail,
		Phone,
		BrainCircuit,
		Zap,
		Edit3,
		CreditCard,
		X,
		Star,
		Video,
		MapPin,
		ChevronRight,
		CalendarDays,
	} from "@lucide/svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Sheet from "$lib/components/ui/sheet";
	import { Badge } from "$lib/components/ui/badge";
	import * as Select from "$lib/components/ui/select";
	import * as Slider from "$lib/components/ui/slider";
	import { Button } from "$lib/components/ui/button";
	import { KpiCard } from "$lib/components";
	import Empty from "$lib/components/Empty.svelte";
	import Confirmation from "$lib/components/Confirmation.svelte";

	let { data } = $props();
	const cfg = $derived(data.config.filters);
	const meta = $derived(data.config.learningMetadata ?? null);
	const growthData = $derived(data.config.growthData ?? []);
	const walletStats = $derived(data.config.walletStats ?? []);

	// -- Core State --
	// svelte-ignore state_referenced_locally
	let USERS = $state(data.users);
	let selectedIds = $state<string[]>([]);
	let searchQuery = $state("");
	let filterStatus = $state("");
	let filterPlan = $state("");
	let sortBy = $state("newest");
	let filterQuick = $state("all");
	let page = $state(1);
	const itemsPerPage = 8;

	let activeUser = $state<any>(null);
	let showUserSheet = $state(false);
	let showAddModal = $state(false);

	let showBanConfirm = $state(false);
	let userToToggle = $state<any>(null);

	// -- Forms --
	let newUser = $state({
		first: "",
		last: "",
		email: "",
		phone: "",
		plan: "Free",
		credits: 0,
		exam: "JAMB",
	});

	let adjustAmount = $state<number[]>([0]);

	// -- Derived Data Management --
	let filteredUsers = $derived(
		USERS.filter((u) => {
			const s = searchQuery.toLowerCase();
			const match = (val: string) => val.toLowerCase().includes(s);
			const matchesSearch =
				!searchQuery ||
				match(u.first + " " + u.last) ||
				match(u.email) ||
				u.phone.includes(s);
			const matchesStatus = !filterStatus || u.status === filterStatus;
			const matchesPlan = !filterPlan || u.plan === filterPlan;

			let matchesQuick = true;
			switch (filterQuick) {
				case "active":
					matchesQuick = u.status === "Active";
					break;
				case "suspended":
					matchesQuick = u.status === "Suspended";
					break;

				case "premium":
					matchesQuick = u.plan === "Premium";
					break;
				case "zero":
					matchesQuick = u.credits === 0;
					break;
			}
			return matchesSearch && matchesStatus && matchesPlan && matchesQuick;
		}).sort((a, b) => {
			if (sortBy === "oldest")
				return new Date(a.joined).getTime() - new Date(b.joined).getTime();
			if (sortBy === "credits") return b.credits - a.credits;
			if (sortBy === "sessions") return b.sessions - a.sessions;
			return new Date(b.joined).getTime() - new Date(a.joined).getTime();
		}),
	);

	let totalPages = $derived(
		Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage)),
	);
	let paginatedUsers = $derived(
		filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage),
	);

	let kpi = $derived({
		total: USERS.length,
		active: USERS.filter((u) => u.status === "Active").length,
		suspended: USERS.filter((u) => u.status === "Suspended").length,

		totalCredits: USERS.reduce((a, u) => a + u.credits, 0),
	});

	const kpis = $derived([
		{
			title: "Total Users",
			value: kpi.total.toLocaleString(),
			Icon: Users,
			colorClass: "text-brand",
			subtext: "registered accounts",
			badgeText: "All time",
		},
		{
			title: "Active",
			value: kpi.active.toLocaleString(),
			Icon: ShieldCheck,
			colorClass: "text-emerald-500",
			subtext: "currently enabled",
			badgeText: "Live",
		},
		{
			title: "Suspended",
			value: kpi.suspended.toLocaleString(),
			Icon: ShieldAlert,
			colorClass: "text-red-500",
			subtext: "account restrictions",
			badgeText: "Review",
		},

		{
			title: "Total Credits",
			value:
				kpi.totalCredits > 1000
					? (kpi.totalCredits / 1000).toFixed(1) + "k"
					: kpi.totalCredits,
			Icon: CreditCard,
			colorClass: "text-brand",
			subtext: "in circulation",
			badgeText: "Stats",
		},
	]);

	// -- Action Logic --
	function openUserDetail(u: any) {
		activeUser = u;
		showUserSheet = true;
		adjustAmount = [u.credits];
	}

	function toggleUserStatus(u: any) {
		userToToggle = u;
		showBanConfirm = true;
	}

	async function confirmToggleStatus() {
		if (!userToToggle) return;
		const id = userToToggle.id;
		const newStatus =
			userToToggle.status === "suspended" ? "active" : "suspended";
		const res = await fetch(`/api/admin/users/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: newStatus }),
		});

		if (res.ok) {
			const u = USERS.find((ux) => ux.id === id);
			if (u) u.status = newStatus;
			if (activeUser && activeUser.id === id) {
				activeUser = { ...activeUser, status: newStatus };
			}
		}
		userToToggle = null;
	}

	async function handleCreditAdjustment(overrideDir: number = 0) {
		if (!activeUser) return;
		const userId = activeUser.id;
		const idx = USERS.findIndex((u) => u.id === userId);
		if (idx === -1) return;

		let delta = 0;
		if (overrideDir !== 0) {
			// Legacy support or quick buttons
			delta = overrideDir * adjustAmount[0];
		} else {
			// Absolute slider logic
			delta = adjustAmount[0] - activeUser.credits;
		}

		if (delta === 0) return;

		const res = await fetch(`/api/admin/users/${userId}/credits`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount: delta }),
		});

		if (res.ok) {
			const newVal = activeUser.credits + delta;
			USERS[idx] = {
				...USERS[idx],
				credits: newVal,
			};
			if (activeUser && activeUser.id === userId) {
				activeUser = { ...activeUser, credits: newVal };
			}
		}
	}

	async function createNewUser() {
		const res = await fetch("/api/admin/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: `${newUser.first} ${newUser.last}`,
				email: newUser.email,
				phone: newUser.phone,
				plan: newUser.plan,
				credits: Number(newUser.credits),
				targetExam: newUser.exam.toLowerCase(),
			}),
		});

		if (res.ok) {
			const data = await res.json();
			USERS = [data, ...USERS];
			showAddModal = false;
			newUser = {
				first: "",
				last: "",
				email: "",
				phone: "",
				plan: "Free",
				credits: 0,
				exam: "JAMB",
			};
		}
	}

	async function exportUsers() {
		const headers =
			"id,name,email,status,plan,credits,sessions,avgScore,joined\n";
		const rows = USERS.map(
			(u) =>
				`${u.id},${u.first} ${u.last},${u.email},${u.status},${u.plan},${u.credits},${u.sessions},${u.avgScore}%,${new Date(u.joined).toLocaleDateString()}`,
		).join("\n");
		const blob = new Blob([headers + rows], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "users-export.csv";
		a.click();
	}

	const fmtDate = (d: any) =>
		new Date(d).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
</script>

{#snippet formInput(labelTxt, obj, key, type = "text", placeholder = "")}
	<label class="flex flex-col gap-2">
		<span
			class="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
			>{labelTxt}</span
		>
		<input
			{type}
			bind:value={obj[key]}
			{placeholder}
			class="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand focus:bg-white transition-all"
		/>
	</label>
{/snippet}

{#snippet formSelect(labelTxt, obj, key, options)}
	<label class="flex flex-col gap-2">
		<span
			class="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
			>{labelTxt}</span
		>
		<div class="relative group">
			<select
				bind:value={obj[key]}
				class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 outline-none appearance-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all"
			>
				{#each options as opt}
					<option value={opt.value || opt}>{opt.label || opt}</option>
				{/each}
			</select>
			<ChevronRight
				class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90"
			/>
		</div>
	</label>
{/snippet}

{#snippet userRow(u)}
	<tr
		class="group transition-all hover:bg-slate-50/80 {activeUser?.id === u.id
			? 'bg-brand-muted/10 row-sel shadow-inner'
			: ''} {u.status === 'suspended' ? 'bg-red-50/40 hover:bg-red-50/60' : ''}"
	>
		<td class="py-4 px-3 pl-6">
			<div class="flex items-center gap-3">
				<div
					class="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-sm transition-transform group-hover:scale-110"
				>
					<img
						src="https://api.dicebear.com/7.x/avataaars/svg?seed={u.first}{u.last}"
						alt="avatar"
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="flex flex-col">
					<span
						class="text-[13px] font-semibold text-slate-900 leading-tight capitalize"
						>{u.first.toLowerCase()} {u.last.toLowerCase()}</span
					>
					<span
						class="text-[10px] text-slate-500 font-semibold tracking-tight mt-0.5"
						>{u.email}</span
					>
				</div>
			</div>
		</td>
		<td class="py-4 px-3 text-center">
			<div class="flex justify-center">
				<div
					class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-semibold capitalize tracking-wider {u.status ===
					'active'
						? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
						: u.status === 'suspended'
							? 'bg-red-50 text-red-600 border border-red-100/50'
							: 'bg-amber-50 text-amber-600 border border-amber-100/50'}"
				>
					{#if u.status === "active"}
						<div
							class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
						></div>
					{/if}
					{u.status}
				</div>
			</div>
		</td>
		<td class="py-4 px-3 text-center">
			<span
				class="text-[10px] font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-tight transition-all {u.plan ===
				'Premium'
					? 'bg-brand/10 text-brand border-brand/20 shadow-sm shadow-brand/5'
					: 'bg-slate-50 text-slate-500 border-slate-100'}"
			>
				{u.plan}
			</span>
		</td>
		<td class="py-4 px-3">
			<div class="flex flex-col gap-1.5 w-28">
				<div class="flex items-center justify-between">
					<span
						class="text-[11px] font-semibold text-slate-900 tracking-tighter"
						>{u.credits} <span class="text-slate-300"> Credits</span></span
					>
					<span class="text-[9px] font-semibold text-slate-400"
						>{Math.floor((u.credits / 1000) * 100)}%</span
					>
				</div>
				<div class="h-1.5 w-full bg-slate-100/50 rounded-full overflow-hidden">
					<div
						class="h-full {u.credits > 200
							? 'bg-brand'
							: u.credits > 50
								? 'bg-amber-500'
								: 'bg-red-500'} rounded-full transition-all duration-1000"
						style="width: {Math.min(100, (u.credits / 1000) * 100)}%"
					></div>
				</div>
			</div>
		</td>
		<td class="py-4 px-3 text-center">
			<div class="flex items-center justify-center gap-1">
				<Star class="w-3 h-3 text-amber-400 fill-amber-400" />
				<span class="text-[13px] font-semibold text-slate-900"
					>{(u.avgScore / 20).toFixed(1)}</span
				>
			</div>
		</td>

		<td class="py-4 pl-3 pr-6 text-right" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-end gap-1.5">
				<Button
					variant="ghost"
					size="icon"
					class="h-9 w-9 rounded-xl text-slate-400 hover:text-brand hover:bg-brand/5 active:scale-95 transition-all"
					onclick={() => openUserDetail(u)}
				>
					<Eye class="w-4.5 h-4.5" strokeWidth={2} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="h-9 w-9 rounded-xl {u.status === 'suspended'
						? 'text-emerald-500 hover:bg-emerald-50'
						: 'text-red-400 hover:bg-red-50'} active:scale-95 transition-all"
					onclick={() => toggleUserStatus(u)}
				>
					{#if u.status === "suspended"}<ShieldCheck
							class="w-4.5 h-4.5"
						/>{:else}<Ban class="w-4.5 h-4.5" strokeWidth={2} />{/if}
				</Button>
			</div>
		</td>
	</tr>
{/snippet}

{#snippet statsBox(value, label, colorClass)}
	<div
		class="bg-slate-50/80 border border-brand/10 rounded-lg p-4 flex flex-col items-center group hover:bg-white hover:shadow-lg hover:border-brand/20 transition-all duration-300"
	>
		<div class="text-[20px] font-semibold leading-none mb-1.5 {colorClass}">
			{value}
		</div>
		<div
			class="text-[9px] font-semibold text-slate-400 uppercase tracking-widest"
		>
			{label}
		</div>
	</div>
{/snippet}

{#snippet masteryRow(sub)}
	<div class="flex items-center justify-between group">
		<span class="text-[11.5px] font-semibold text-slate-600 w-16"
			>{sub.name}</span
		>
		<div class="flex items-center gap-2 flex-1 mx-4">
			<div class="h-1.5 bg-slate-100 rounded-full flex-1 overflow-hidden">
				<div
					class="h-full {sub.color} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.05)]"
					style="width: {sub.value}%"
				></div>
			</div>
		</div>
		<span
			class="text-[11px] font-semibold text-slate-800 w-8 text-right tabular-nums"
			>{sub.value}%</span
		>
	</div>
{/snippet}

<main class="w-full max-w-[1400px] mx-auto pb-6 antialiased">
	<!-- KPI Row -->
	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
		{#each kpis as item}
			<KpiCard
				title={item.title}
				value={item.value}
				Icon={item.Icon}
				colorClass={item.colorClass}
				subtext={item.subtext}
				badgeText={item.badgeText}
			/>
		{/each}
	</div>

	<div class="flex flex-col lg:flex-row gap-6 items-start w-full">
		<!-- Left: Table Section -->
		<div class="flex flex-col gap-6 w-full lg:w-[72.5%]">
			<div
				class="bg-white rounded-lg border border-brand/10 shadow-sm overflow-hidden hover:border-brand/40 hover:shadow-lg transition-all duration-500"
			>
				<!-- Table Header & Filters -->
				<div class="p-6 border-b border-gray-50 flex flex-col gap-6">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-[17px] font-semibold text-[#141522]">
								All Users
							</h3>
							<p class="text-[12px] text-slate-400 font-medium">
								Manage student accounts and permissions
							</p>
						</div>
						<div class="flex items-center gap-2">
							<Badge
								variant="outline"
								class="bg-brand/5 text-brand rounded-lg px-3 py-1.5 text-[11px] font-semibold border-brand/10 uppercase tracking-tighter"
							>
								{filteredUsers.length} Users
							</Badge>
							<Button
								onclick={exportUsers}
								class="flex items-center gap-2 h-8 px-4 text-[11px] font-semibold rounded-lg bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20 group"
							>
								<DownloadCloud class="w-3.5 h-3.5" stroke-width={2.5} />
								Export CSV
							</Button>
						</div>
					</div>

					<div class="flex flex-col gap-4">
						<div class="flex items-center gap-3">
							<div class="relative flex-1 group">
								<Search
									class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand transition-colors"
									stroke-width={1.5}
								/>
								<input
									type="text"
									bind:value={searchQuery}
									placeholder="Search name, email, phone..."
									class="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-brand/10 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand focus:bg-white transition-all"
								/>
							</div>

							<div class="flex items-center gap-2">
								<Select.Root type="single" bind:value={filterStatus}>
									<Select.Trigger
										class="w-[130px] h-10 px-4 bg-white border-brand/10 rounded-xl text-[12px] font-semibold text-slate-600 shadow-sm"
									>
										{filterStatus || "Status"}
									</Select.Trigger>
									<Select.Content class="rounded-xl border-slate-200 shadow-xl">
										<Select.Item value="" class="text-[12px] font-medium py-2"
											>All Status</Select.Item
										>
										<Select.Item
											value="Active"
											class="text-[12px] font-medium py-2">Active</Select.Item
										>
										<Select.Item
											value="Suspended"
											class="text-[12px] font-medium py-2"
											>Suspended</Select.Item
										>

									</Select.Content>
								</Select.Root>

								<Select.Root type="single" bind:value={sortBy}>
									<Select.Trigger
										class="w-[140px] h-10 px-4 bg-white border-brand/10 rounded-xl text-[12px] font-semibold text-slate-600 shadow-sm"
									>
										{sortBy === "newest"
											? "Newest Joined"
											: sortBy === "credits"
												? "Most Credits"
												: sortBy === "sessions"
													? "Most Sessions"
													: "Oldest Joined"}
									</Select.Trigger>
									<Select.Content class="rounded-xl border-slate-200 shadow-xl">
										<Select.Item
											value="newest"
											class="text-[12px] font-medium py-2"
											>Newest First</Select.Item
										>
										<Select.Item
											value="oldest"
											class="text-[12px] font-medium py-2"
											>Oldest First</Select.Item
										>
										<Select.Item
											value="credits"
											class="text-[12px] font-medium py-2"
											>Most Credits</Select.Item
										>
										<Select.Item
											value="sessions"
											class="text-[12px] font-medium py-2"
											>Most Sessions</Select.Item
										>
									</Select.Content>
								</Select.Root>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-2">
							{#each cfg.quickFilters as q}
								<button
									onclick={() => (filterQuick = q.id)}
									class="px-4 py-1.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider transition-all {filterQuick ===
									q.id
										? 'bg-brand border-brand text-white shadow-md'
										: 'bg-white border-brand/10 text-slate-500 hover:border-brand hover:text-brand'}"
								>
									{q.label}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Table -->
				<div class="overflow-x-auto overflow-y-hidden">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr
								class="bg-slate-50/50 border-b border-gray-100 uppercase tracking-widest text-[10px] font-semibold text-slate-500"
							>
								<th class="py-3 px-3 pl-6">User</th>
								<th class="py-3 px-3 text-center">Status</th>
								<th class="py-3 px-3 text-center">Plan</th>
								<th class="py-3 px-3">Credits</th>
								<th class="py-3 px-3 text-center">Avg Score</th>
								<th class="py-3 pl-3 pr-6 text-right">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50">
							{#each paginatedUsers as u (u.id)}
								{@render userRow(u)}
							{:else}
								<tr>
									<td colspan="8" class="py-20 text-center">
										<Empty
											title="No users found"
											message="Try broadening your search or filter"
										/>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pager -->
				<div
					class="px-6 py-4 border-t border-gray-50 flex items-center justify-between"
				>
					<span
						class="text-[11px] font-semibold text-slate-500 uppercase tracking-widest"
					>
						Showing {(page - 1) * itemsPerPage + 1}-{Math.min(
							page * itemsPerPage,
							filteredUsers.length,
						)} of {filteredUsers.length}
					</span>
					<div class="flex gap-1.5">
						<button
							onclick={() => (page = Math.max(1, page - 1))}
							disabled={page === 1}
							class="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
						>
							Prev
						</button>
						{#each Array(totalPages) as _, idx}
							<button
								onclick={() => (page = idx + 1)}
								class="w-8 h-8 rounded-lg border text-[11px] font-semibold transition-all {page ===
								idx + 1
									? 'bg-brand border-brand text-white shadow-md'
									: 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}"
							>
								{idx + 1}
							</button>
						{/each}
						<button
							onclick={() => (page = Math.min(totalPages, page + 1))}
							disabled={page === totalPages}
							class="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Sidebar Stats -->
		<div class="flex flex-col gap-6 w-full lg:flex-1 sticky top-[100px]">
			<!-- Mini Stats Card -->
			<div
				class="bg-white rounded-2xl border border-brand/10 shadow-sm p-6 hover:border-brand/40 hover:shadow-lg transition-all duration-300"
			>
				<h3
					class="text-[13px] font-semibold uppercase tracking-widest text-slate-800 mb-5 pb-3 border-b border-brand/5 flex items-center justify-between"
				>
					Weekly Growth
					<span
						class="text-[11px] text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg font-semibold"
						>+148</span
					>
				</h3>
				<div class="flex flex-col gap-4">
					{#each growthData as day}
						<div class="flex items-center gap-3">
							<span
								class="text-[10px] font-semibold text-slate-500 uppercase w-10"
								>{day.d}</span
							>
							<div
								class="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden"
							>
								<div
									class="h-full bg-brand rounded-full transition-all duration-1000"
									style="width: {(day.v / 40) * 100}%"
								></div>
							</div>
							<span class="text-[11px] font-semibold text-brand w-6 text-right"
								>{day.v}</span
							>
						</div>
					{:else}
						<div class="py-4">
							<Empty
								title="No data"
								message=""
								icon={TrendingUp}
								compact={true}
							/>
						</div>
					{/each}
				</div>
			</div>

			<!-- Quick Credit Distribution -->
			<div
				class="bg-white rounded-2xl border border-brand/10 shadow-sm p-6 hover:border-brand/40 hover:shadow-lg transition-all duration-300"
			>
				<h3
					class="text-[13px] font-bold uppercase tracking-widest text-slate-800 mb-5 pb-3 border-b border-brand/5"
				>
					Wallet Distribution
				</h3>
				<div class="flex flex-col gap-5">
					{#each walletStats as r}
						<div class="flex flex-col gap-1.5">
							<div
								class="flex items-center justify-between text-[11px] font-semibold uppercase"
							>
								<span class="text-slate-500 tracking-wider font-semibold"
									>{r.l}</span
								>
								<span class="text-slate-700 font-semibold">{r.c}</span>
							</div>
							<div class="h-1 bg-slate-50 rounded-full overflow-hidden">
								<div class="h-full {r.color}" style="width: {r.p}%"></div>
							</div>
						</div>
					{:else}
						<div class="py-4">
							<Empty
								title="No data"
								message=""
								icon={CreditCard}
								compact={true}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>

<!-- User Detail Sheet -->
<!-- User Detail Sheet (Premium Design) -->
<Sheet.Root bind:open={showUserSheet}>
	<Sheet.Content
		side="right"
		class="sm:max-w-3xl w-full bg-slate-50 border-l shadow-2xl overflow-hidden flex flex-col h-full z-[100] rounded-none"
	>
		{#if activeUser}
			<!-- Header -->
			<div
				class="px-4 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10"
			>
				<div class="flex flex-col gap-0.5">
					<h2
						class="text-lg font-semibold text-slate-900 tracking-tight capitalize"
					>
						{activeUser.first.toLowerCase()}
						{activeUser.last.toLowerCase()}
					</h2>
					<div class="flex items-center gap-1.5">
						{#if activeUser.status === "active"}
							<div
								class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
							></div>
							<span
								class="text-[11px] font-semibold text-emerald-500 tracking-wider"
								>Currently online</span
							>
						{:else}
							<span
								class="text-[11px] font-semibold text-slate-500 tracking-widest"
								>Last seen 2h ago</span
							>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-2">
					<button
						onclick={() => (showUserSheet = false)}
						class="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-90 shadow-sm"
					>
						<X class="w-5 h-5" stroke-width={3} />
					</button>
				</div>
			</div>

			<!-- Body -->
			<div
				class="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 bg-slate-50"
			>
				<!-- Main Profile Card -->
				<div
					class="bg-white rounded-lg pt-6 pb-3 px-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-brand/5 w-full mb-3 relative overflow-hidden group mt-[-20px]"
				>
					<div class="flex gap-5 items-stretch relative z-10">
						<!-- Avatar Container -->
						<div
							class="w-28 rounded-lg bg-slate-50 relative overflow-hidden flex-shrink-0 shadow-inner border border-slate-100 group/avatar"
						>
							<img
								src="https://i.pravatar.cc/400?u={activeUser.id}"
								alt=""
								class="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
							/>
							{#if activeUser.plan === "Premium"}
								<div class="absolute top-2 right-2">
									<div class="bg-brand text-white p-1 rounded-lg shadow-lg">
										<Zap class="w-3 h-3 fill-white" />
									</div>
								</div>
							{/if}
						</div>

						<!-- Core Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1.5">
								<Badge
									class="rounded-full px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider {activeUser.status ===
									'active'
										? 'bg-emerald-50 text-emerald-600 border-emerald-100'
										: 'bg-red-50 text-red-600 border-red-100'}"
									variant="outline"
								>
									<div
										class="w-1 h-1 rounded-full bg-current mr-1.5 {activeUser.status ===
										'active'
											? 'animate-pulse'
											: ''}"
									></div>
									{activeUser.status}
								</Badge>
								<Badge
									class="rounded-full px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider {activeUser.plan ===
									'Premium'
										? 'bg-brand/10 text-brand border-brand/20'
										: 'bg-slate-100 text-slate-500 border-slate-200'}"
									variant="outline"
								>
									{activeUser.plan}
								</Badge>
							</div>

							<h3
								class="text-sm font-semibold text-slate-900 mb-0.5 tracking-tight leading-tight truncate"
							>
								{activeUser.first}
								{activeUser.last}
							</h3>

							<!-- Stats Row (Reduced Size) -->
							<div class="flex flex-col gap-1 mt-1">
								<div
									class="flex items-center gap-2 text-slate-500 scale-90 origin-left"
								>
									<div class="flex items-center gap-1.5">
										<CreditCard class="w-3.5 h-3.5 text-slate-400" />
										<span class="text-[13px] font-medium text-slate-800"
											>{activeUser.credits}Credits
										</span>
									</div>
								</div>

								<div
									class="flex flex-col gap-1.5 pt-1.5 border-t border-brand/10 mt-1"
								>
									<div
										class="flex items-center gap-2 text-slate-700 font-semibold text-[11px]"
									>
										<Mail class="w-3.5 h-3.5 text-slate-400" />
										<span class="truncate">{activeUser.email}</span>
									</div>
									<div
										class="flex items-center gap-2 text-slate-500 font-semibold text-[11px]"
									>
										<Phone class="w-3.5 h-3.5 text-slate-400" />
										<span>{activeUser.phone || "No phone number"}</span>
									</div>
									<div
										class="flex items-center gap-2 text-slate-500 font-semibold text-[11px]"
									>
										<CalendarDays class="w-3.5 h-3.5 text-slate-400" />
										<span>Joined {fmtDate(activeUser.joined)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Wallet Credit Slider (Merged) -->
					<div class="mt-4 pt-4 border-t border-slate-50">
						<div class="flex items-center justify-between mb-4">
							<div class="flex flex-col">
								<span
									class="text-[10px] font-semibold uppercase text-brand tracking-widest"
									>Credit Management</span
								>
								<p class="text-[11px] text-slate-400 font-medium">
									Drag to update total credits
								</p>
							</div>
							<div
								class="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"
							>
								<span class="text-lg font-semibold text-slate-800 tabular-nums">
									{adjustAmount[0]}
								</span>
								<span
									class="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter"
									>Total Credits</span
								>
							</div>
						</div>

						<div class="px-2 pt-4 pb-2">
							<Slider.Root
								bind:value={adjustAmount}
								max={5000}
								step={10}
								class="w-full"
							/>
							<div class="flex justify-between mt-2 mb-3">
								<span class="text-[9px] font-semibold text-slate-300 uppercase"
									>0</span
								>
								<span class="text-[9px] font-semibold text-slate-300 uppercase"
									>2.5k</span
								>
								<span class="text-[9px] font-semibold text-slate-300 uppercase"
									>5k</span
								>
							</div>

							<div class="flex flex-col gap-2">
								<Button
									class="w-full h-10 rounded-xl bg-brand text-white font-semibold text-[13px] shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all active:scale-[0.98]"
									disabled={adjustAmount[0] === activeUser.credits}
									onclick={() => handleCreditAdjustment(0)}
								>
									{adjustAmount[0] > activeUser.credits
										? "Add"
										: adjustAmount[0] < activeUser.credits
											? "Subtract"
											: "Save"}
									{Math.abs(adjustAmount[0] - activeUser.credits)} Credits
								</Button>
								<button
									class="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest py-1"
									onclick={() => (adjustAmount = [activeUser.credits])}
								>
									Reset to Current
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Secondary Section -->
				<div class="space-y-3 px-2">
					<!-- Academic Performance Card (Restored) -->
					<div
						class="bg-white rounded-lg p-6 shadow-sm border border-slate-100 flex flex-col gap-4"
					>
						<div class="flex items-center justify-between">
							<h3
								class="text-[11px] font-semibold uppercase text-slate-500 tracking-widest"
							>
								Academic Performance
							</h3>
							<Badge
								variant="outline"
								class="text-[9px] font-semibold rounded-full bg-brand/10 text-brand border-brand/20 h-6 flex items-center justify-center px-3 uppercase tracking-wider"
								>{activeUser.targetExam || "JAMB"}</Badge
							>
						</div>

						<div class="grid grid-cols-3 gap-3">
							{@render statsBox(
								activeUser.avgScore + "%",
								"Avg Score",
								"text-brand",
							)}
							{@render statsBox(
								activeUser.sessions,
								"Sessions",
								"text-slate-800",
							)}
							{@render statsBox(
								"#" + (Math.floor(Math.random() * 100) + 1),
								"Ranking",
								"text-emerald-500",
							)}
						</div>

						<div class="space-y-3 pt-2 border-t border-slate-50">
							{@render masteryRow({
								name: "Physics",
								value: 75,
								color: "bg-brand",
							})}
							{@render masteryRow({
								name: "Maths",
								value: 88,
								color: "bg-blue-500",
							})}
							{@render masteryRow({
								name: "English",
								value: 64,
								color: "bg-amber-500",
							})}
						</div>
					</div>
				</div>
			</div>

			<div
				class="mt-auto py-6 px-2 bg-white border-t border-slate-100 sticky bottom-0 z-20"
			>
				<button
					onclick={() => toggleUserStatus(activeUser)}
					class="w-full py-2.5 rounded-lg font-semibold text-[13px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] {activeUser.status ===
					'suspended'
						? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
						: 'bg-white border-2 border-red-50 text-red-500 hover:bg-red-50 hover:border-red-100 hover:text-red-600'}"
				>
					{#if activeUser.status === "suspended"}
						<ShieldCheck class="w-4.5 h-4.5" stroke-width={2.5} />
						Activate Account
					{:else}
						<Ban class="w-4.5 h-4.5" stroke-width={2.5} />
						Suspend Account
					{/if}
				</button>
			</div>
		{:else}
			<div class="flex items-center justify-center h-full p-12 text-center">
				<Empty
					title="No User Selected"
					message="Select a user to view their details"
					icon={Users}
				/>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>

<!-- Add User Modal (Sheet) -->
<Sheet.Root bind:open={showAddModal}>
	<Sheet.Content
		side="right"
		class="sm:max-w-md w-full p-0 bg-white border-l shadow-2xl flex flex-col h-full z-[100]"
	>
		<Sheet.Header
			class="p-8 border-b border-slate-50 flex flex-col gap-1 bg-slate-50/30"
		>
			<Sheet.Title class="text-2xl font-semibold text-slate-900 tracking-tight"
				>Create User</Sheet.Title
			>
			<Sheet.Description
				class="text-[12px] text-slate-400 font-semibold uppercase tracking-widest"
			>
				Manual Account Provisioning
			</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 p-8 overflow-y-auto no-scrollbar flex flex-col gap-8">
			<div class="grid grid-cols-2 gap-4">
				{@render formInput("First Name", newUser, "first", "text", "e.g. John")}
				{@render formInput("Last Name", newUser, "last", "text", "e.g. Doe")}
			</div>
			{@render formInput(
				"Email Address",
				newUser,
				"email",
				"email",
				"student@example.com",
			)}
			{@render formInput("Phone Number", newUser, "phone", "tel", "+234...")}

			<div class="grid grid-cols-2 gap-4">
				{@render formSelect("Plan", newUser, "plan", cfg.plans)}
				{@render formInput("Credits", newUser, "credits", "number")}
			</div>
			{@render formSelect("Target Exam", newUser, "exam", [
				"JAMB",
				"WAEC",
				"NECO",
				"POST-UTME",
			])}

			<div class="mt-4 flex flex-col gap-5 border-t border-slate-100 pt-8">
				{#each [{ l: "Send welcome email", s: "Auto-generate login credentials" }, { l: "Require verification", s: "Identity check before first login" }] as item}
					<label class="flex items-center justify-between cursor-pointer group">
						<div class="flex flex-col">
							<span
								class="text-[14px] font-semibold text-slate-800 group-hover:text-brand transition-colors"
								>{item.l}</span
							>
							<span
								class="text-[11px] text-slate-400 font-semibold uppercase tracking-tight"
								>{item.s}</span
							>
						</div>
						<input
							type="checkbox"
							checked
							class="w-12 h-6 accent-brand rounded-full cursor-pointer transition-all hover:scale-110"
						/>
					</label>
				{/each}
			</div>
		</div>

		<div class="p-8 border-t border-slate-50 flex items-center gap-4 bg-white">
			<Button
				class="flex-1 py-7 rounded-[22px] text-[15px] font-semibold shadow-xl shadow-brand/10 hover:translate-y-[-2px] transition-all"
				onclick={createNewUser}>Provision Account</Button
			>
			<Button
				variant="ghost"
				class="px-8 py-7 rounded-[22px] text-[14px] font-semibold text-slate-400 hover:bg-slate-50 transition-all"
				onclick={() => (showAddModal = false)}>Cancel</Button
			>
		</div>
	</Sheet.Content>
</Sheet.Root>

<Confirmation
	bind:open={showBanConfirm}
	title={userToToggle?.status === "suspended"
		? "Activate Account?"
		: "Suspend Account?"}
	description={userToToggle?.status === "suspended"
		? `Are you sure you want to restore access for ${userToToggle?.first}?`
		: `Are you sure you want to suspend ${userToToggle?.first}? They will lose access to the platform.`}
	confirmText={userToToggle?.status === "suspended"
		? "Activate"
		: "Suspend User"}
	icon={userToToggle?.status === "suspended" ? ShieldCheck : Ban}
	iconColorClass={userToToggle?.status === "suspended"
		? "text-emerald-500"
		: "text-red-500"}
	iconBgClass={userToToggle?.status === "suspended"
		? "bg-emerald-50"
		: "bg-red-50"}
	confirmBtnClass={userToToggle?.status === "suspended"
		? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
		: "bg-red-500 hover:bg-red-600 shadow-red-500/20"}
	onConfirm={confirmToggleStatus}
/>

<style>
	:global(.accent-brand) {
		accent-color: #3b6d11;
	}
	table tr:last-child {
		border-bottom: none;
	}
	tr.row-sel td {
		background: #f0f7e8;
	}
	:global(.no-scrollbar::-webkit-scrollbar) {
		display: none;
	}
	:global(.no-scrollbar) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
