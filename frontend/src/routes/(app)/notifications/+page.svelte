<script lang="ts">
	import {
		CheckCircle2,
		Clock,
		Zap,
		Gift,
		Trophy,
		UserCheck,
		Flame,
		Calendar,
		ArrowRight,
		MoreVertical,
		Brain,
		X,
	} from "@lucide/svelte";
	import { fly, fade } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Switch } from "$lib/components/ui/switch";
	import { Label } from "$lib/components/ui/label";
	import * as Select from "$lib/components/ui/select";
	import * as Tabs from "$lib/components/ui/tabs";
	import Empty from "$lib/components/Empty.svelte";
	import { cn } from "$lib/utils";

	let { data } = $props();

	const iconMap: Record<string, any> = {
		Zap,
		Gift,
		Clock,
		CheckCircle2,
		Trophy,
		Brain,
		Flame,
		UserCheck,
		Calendar,
	};

	const mapIcon = (item: any) => ({
		...item,
		icon: typeof item.icon === "string" ? iconMap[item.icon] : item.icon,
	});

	let activeFilter = $state("All");
	let sortBy = $state("newest");

	const sortOptions = [
		{ value: "newest", label: "Newest first" },
		{ value: "oldest", label: "Oldest first" },
		{ value: "unread", label: "Unread first" },
	];

	let notifications = $state(
		data.notifications.map((n: any) => ({
			...n,
			tags: n.tags ? n.tags.map(mapIcon) : [],
			icon: iconMap[n.icon],
		})),
	);

	let summaryStats = $derived([
		{
			label: "Unread",
			count: notifications.filter((n: any) => n.unread).length,
			color: "text-red-500",
		},
		{ label: "Total", count: notifications.length, color: "text-slate-900" },
		{
			label: "AI alerts",
			count: notifications.filter((n: any) => n.type === "ai-alert").length,
			color: "text-emerald-600",
		},
		{
			label: "Pending rewards",
			count: notifications.filter((n: any) => n.type === "referral-pending")
				.length,
			color: "text-amber-500",
		},
	]);

	let dynamicFilters = $derived([
		{ label: "All", count: notifications.length },
		{
			label: "Unread",
			count: notifications.filter((n: any) => n.unread).length,
		},
		{
			label: "AI alerts",
			count: notifications.filter(
				(n: any) => n.type === "ai-alert" || n.type === "ai-insight",
			).length,
		},
		{
			label: "Achievements",
			count: notifications.filter(
				(n: any) => n.type === "achievement" || n.type === "personal-best",
			).length,
		},
		{
			label: "Referrals",
			count: notifications.filter(
				(n: any) => n.type === "referral" || n.type === "referral-pending",
			).length,
		},
		{
			label: "Reminders",
			count: notifications.filter(
				(n: any) => n.type === "streak" || n.type === "challenge",
			).length,
		},
		{
			label: "System",
			count: notifications.filter((n: any) => n.type === "new-content").length,
		},
	]);

	let filteredNotifications = $derived(
		notifications
			.filter((n: any) => {
				if (activeFilter === "All") return true;
				if (activeFilter === "Unread") return n.unread;
				if (activeFilter === "AI alerts")
					return n.type === "ai-alert" || n.type === "ai-insight";
				if (activeFilter === "Achievements")
					return n.type === "achievement" || n.type === "personal-best";
				if (activeFilter === "Referrals")
					return n.type === "referral" || n.type === "referral-pending";
				if (activeFilter === "Reminders")
					return n.type === "streak" || n.type === "challenge";
				if (activeFilter === "System") return n.type === "new-content";
				return true;
			})
			.sort((a: any, b: any) => {
				if (sortBy === "newest") return b.id - a.id;
				if (sortBy === "oldest") return a.id - b.id;
				if (sortBy === "unread") {
					if (a.unread && !b.unread) return -1;
					if (!a.unread && b.unread) return 1;
					return b.id - a.id;
				}
				return 0;
			}),
	);

	let groupedNotifications = $derived(
		[
			{
				section: "TODAY",
				items: filteredNotifications.filter((n: any) => n.section === "TODAY"),
			},
			{
				section: "YESTERDAY",
				items: filteredNotifications.filter(
					(n: any) => n.section === "YESTERDAY",
				),
			},
			{
				section: "THIS WEEK",
				items: filteredNotifications.filter(
					(n: any) => n.section === "THIS WEEK",
				),
			},
		].filter((g) => g.items.length > 0),
	);

	function dismissNotification(id: number) {
		notifications = notifications.filter((n: any) => n.id !== id);
	}

	const settings = data.settings.map(mapIcon);
	const upcomingReminders = data.upcomingReminders.map(mapIcon);
</script>

<div class="min-h-screen bg-slate-50 px-5 py-6 font-sans text-slate-900">
	<div class="mx-auto max-w-[1100px]">
		<!-- Header / Filters -->
		<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<Tabs.Root bind:value={activeFilter} class="w-full sm:w-auto">
				<Tabs.List
					class="flex flex-wrap items-center gap-1.5 bg-transparent p-0 border-none h-auto justify-start"
				>
					{#each dynamicFilters as filter}
						<Tabs.Trigger
							value={filter.label}
							class={cn(
								"flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 shadow-none",
								"bg-white text-slate-700 border-slate-200 hover:border-slate-300 data-[state=active]:bg-[var(--brand)] data-[state=active]:text-white ",
							)}
						>
							{filter.label}
							<span
								class={cn(
									"rounded-full px-1.5 py-0.5 text-[11px] font-bold",
									"bg-slate-100 text-slate-500 data-[state=active]:bg-white/20 data-[state=active]:text-white",
								)}
							>
								{filter.count}
							</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>
			</Tabs.Root>

			<div class="flex items-center gap-2">
				<Select.Root
					type="single"
					bind:value={sortBy}
					onValueChange={(v) => (sortBy = v)}
				>
					<Select.Trigger
						class="w-[130px] h-9 rounded-lg bg-white border-slate-200 text-slate-700 font-semibold text-[11px] ring-offset-0 focus:ring-0"
					>
						{sortOptions.find((o) => o.value === sortBy)?.label ||
							"Newest first"}
					</Select.Trigger>
					<Select.Content class="rounded-xl border-slate-200 shadow-xl p-1">
						{#each sortOptions as option}
							<Select.Item
								value={option.value}
								label={option.label}
								class="rounded-lg text-[11px] font-medium transition-colors hover:bg-slate-50 cursor-pointer"
							>
								{option.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
			<!-- Main Content -->
			<div class="space-y-6">
				{#each groupedNotifications as group (group.section)}
					<div>
						<div class="mb-4 flex items-center gap-2.5">
							<h2
								class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
							>
								{group.section}
							</h2>
							<div class="h-px flex-1 bg-slate-200"></div>
						</div>

						<div class="space-y-3">
							{#each group.items as notification (notification.id)}
								<div
									animate:flip={{ duration: 350, easing: (t) => t }}
									out:fly={{ x: -40, duration: 300, opacity: 0 }}
									in:fade={{ duration: 200 }}
									class="overflow-hidden"
								>
									<Card
										class="group relative overflow-hidden rounded-lg border-slate-200 border hover:border-brand shadow-sm transition-all hover:bg-slate-50 cursor-pointer mb-3"
									>
										<CardContent class="px-3 py-2">
											<div class="flex items-start gap-4">
												<!-- Unread Dot Column -->
												<div
													class="w-2 shrink-0 py-1 flex items-center justify-center"
												>
													{#if notification.unread}
														<div
															class="h-2 w-2 rounded-full bg-emerald-600"
														></div>
													{/if}
												</div>

												<!-- Icon -->
												<div
													class={cn(
														"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
														notification.iconBg,
													)}
												>
													<notification.icon
														class={cn("h-4 w-4", notification.iconColor)}
													/>
												</div>

												<!-- Content -->
												<div class="flex-1 space-y-1">
													<div class="flex items-center gap-2">
														<h3
															class="text-[14px] font-bold text-slate-900 leading-tight"
														>
															{notification.title}
														</h3>
													</div>
													<p
														class="text-[12.5px] leading-relaxed text-slate-700 font-normal"
													>
														{notification.description}
													</p>

													<!-- Footer Info -->
													<div class="mt-4 flex flex-wrap items-center gap-4">
														<div
															class="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"
														>
															<Clock class="h-3.5 w-3.5" />
															{notification.time}
														</div>

														<div class="flex gap-2">
															{#each notification.tags as tag}
																<Badge
																	variant="secondary"
																	class={cn(
																		"rounded-full border-none px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1",
																		tag.color,
																	)}
																>
																	{#if tag.icon}
																		<tag.icon class="h-3 w-3" />
																	{/if}
																	{tag.text}
																</Badge>
															{/each}
														</div>
													</div>
												</div>

												<!-- Actions -->
												<div
													class="flex flex-col items-end gap-2 whitespace-nowrap min-w-[120px]"
												>
													<Button
														class="group/btn h-8.5 w-full rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-[11px] transition-all duration-300 shadow-sm hover:shadow-md hover-bounce-x"
													>
														<span>{notification.action}</span>
														<ArrowRight
															class="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"
														/>
													</Button>
													<Button
														variant="outline"
														onclick={() => dismissNotification(notification.id)}
														class="group/dismiss h-8 w-full rounded-lg border-red-200 bg-white hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 font-bold text-[11px] transition-all duration-300 hover-bounce-x"
													>
														<span>Dismiss</span>
														<X
															class="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover/dismiss:rotate-90 opacity-60 group-hover/dismiss:opacity-100"
														/>
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="mt-8">
						<Empty title="No notifications" message="You're all caught up! There are no notifications to display." />
					</div>
				{/each}
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Notification Summary -->
				<Card
					class="rounded-xl border border-slate-200 hover:border-brand shadow-sm bg-white transition-all cursor-pointer"
				>
					<CardContent class="p-3">
						<h3 class="mb-5 text-sm font-bold text-slate-900 tracking-tight">
							Notification summary
						</h3>
						<div class="grid grid-cols-2 gap-3">
							{#each summaryStats as stat}
								<div
									class="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 border border-slate-100"
								>
									<div
										class={cn(
											"mb-0.5 text-[20px] font-bold leading-none",
											stat.color,
										)}
									>
										{stat.count}
									</div>
									<div
										class="text-[10px] font-bold uppercase tracking-wide text-slate-500"
									>
										{stat.label}
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Notification Settings -->
				<Card
					class="rounded-xl border-slate-200 hover:border-brand shadow-sm bg-white transition-all"
				>
					<CardContent class="p-5">
						<h3
							class="mb-5 text-[14px] font-bold text-slate-900 tracking-tight"
						>
							Notification settings
						</h3>
						<div class="space-y-7">
							{#each settings as setting}
								<div class="flex items-start justify-between gap-4">
									<div class="flex gap-3">
										<div
											class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center"
										>
											<setting.icon class={cn("h-4 w-4", setting.iconColor)} />
										</div>
										<div class="space-y-0.5">
											<Label
												for={setting.id}
												class="text-[13px] font-semibold leading-none text-slate-900 cursor-pointer tracking-tight"
												>{setting.label}</Label
											>
											<p
												class="text-[11px] text-slate-500 font-normal leading-tight"
											>
												{setting.sub}
											</p>
										</div>
									</div>
									<Switch
										id={setting.id}
										checked={setting.checked}
										class="data-[state=checked]:bg-brand-dark"
									/>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<!-- Upcoming Reminders -->
				<Card
					class="rounded-xl border-slate-200 hover:border-brand shadow-sm bg-white transition-all cursor-pointer"
				>
					<CardContent class="p-5">
						<h3
							class="mb-5 text-[14px] font-bold text-slate-900 tracking-tight"
						>
							Upcoming reminders
						</h3>
						<div class="space-y-3">
							{#each upcomingReminders as reminder}
								<div
									class="group flex items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100/80 p-3 border border-slate-100 transition-all cursor-pointer"
								>
									<div class="flex items-center gap-3">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm"
										>
											<reminder.icon
												class={cn("h-4 w-4", reminder.iconColor)}
											/>
										</div>
										<span class="text-[13px] font-bold text-slate-800"
											>{reminder.label}</span
										>
									</div>
									<span
										class="text-[10px] font-bold text-slate-500 group-hover:text-slate-600"
										>{reminder.time}</span
									>
								</div>
							{:else}
								<Empty title="No reminders" message="You have no upcoming reminders." compact />
							{/each}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}

	@keyframes bounce-x {
		0%,
		100% {
			transform: scaleX(1);
		}
		50% {
			transform: scaleX(1.08);
		}
	}

	.hover-bounce-x:hover {
		animation: bounce-x 0.5s ease-in-out infinite;
	}
</style>
