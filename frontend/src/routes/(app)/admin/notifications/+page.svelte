<script lang="ts">
	import type { PageProps } from "./$types";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import {
		Bell,
		Megaphone,
		Check,
		Plus,
		Clock,
		Mail,
		Smartphone,
		MessageSquare,
		ChevronRight,
		ShieldAlert,
		History,
		BarChart3,
		Send,
		Search,
		MoreHorizontal,
		Trash2,
		Eye,
		ChevronDown,
		CheckCircle,
		AlertTriangle,
		Zap,
		Info,
		CreditCard,
	} from "@lucide/svelte";
	import { toast } from "svelte-sonner";
	import { fade } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";
	import Empty from "$lib/components/Empty.svelte";

	let { data }: PageProps = $props();

	// Icon Mapping for Notifications
	const iconMap = {
		ShieldAlert,
		CheckCircle,
		AlertTriangle,
		Zap,
		Info,
		CreditCard,
	};

	// Local State
	// svelte-ignore state_referenced_locally
	let notifs = $state([...data.notifs]);
	// svelte-ignore state_referenced_locally
	let broadcasts = $state([...data.broadcasts]);
	// svelte-ignore state_referenced_locally
	let templates = $state([...data.templates]);
	let activeInboxTab = $state("all");

	// Broadcast Modal State
	let showBroadcastModal = $state(false);
	let broadcastTitle = $state("");
	let broadcastBody = $state("");
	let selectedAudience = $state("all-users");
	let selectedChannels = $state({
		email: true,
		push: true,
		sms: false,
		whatsapp: false,
	});
	let scheduleDateTime = $state("");
	let selectedTemplate = $state("");

	// Template Modal State
	let showTemplateModal = $state(false);
	let newTemplateName = $state("");
	let newTemplateSubject = $state("");
	let newTemplateBody = $state("");
	let newTemplateChannel = $state("Email");

	// Derived
	const unreadCount = $derived(notifs.filter((n) => n.unread).length);
	const filteredNotifs = $derived(
		activeInboxTab === "all"
			? notifs
			: notifs.filter((n) => n.type === activeInboxTab),
	);

	// Actions
	function markAllRead() {
		notifs = notifs.map((n) => ({ ...n, unread: false }));
		toast.success("All notifications marked as read");
	}

	function readNotif(id: number) {
		notifs = notifs.map((n) => (n.id === id ? { ...n, unread: false } : n));
	}

	function applyTemplate(val: string) {
		selectedTemplate = val;
		if (!val) return;
		const content =
			data.templateContents[val as keyof typeof data.templateContents];
		if (content) {
			broadcastTitle = content.title;
			broadcastBody = content.body;
		}
	}

	function sendBroadcast() {
		if (!broadcastTitle || !broadcastBody) {
			toast.error("Please fill in the title and message");
			return;
		}

		const newBroadcast = {
			title: broadcastTitle,
			audience:
				selectedAudience === "all-users"
					? "All users"
					: selectedAudience === "active"
						? "Active only"
						: "Premium",
			channel: Object.entries(selectedChannels)
				.filter(([, v]) => v)
				.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
				.join(" + "),
			sent: "Today",
			opens: "—",
		};

		broadcasts = [newBroadcast, ...broadcasts];
		showBroadcastModal = false;
		broadcastTitle = "";
		broadcastBody = "";
		toast.success("Broadcast sent successfully!");
	}

	function saveTemplate() {
		if (!newTemplateName || !newTemplateBody) {
			toast.error("Template name and body are required");
			return;
		}

		templates = [
			...templates,
			{
				name: newTemplateName,
				channel: newTemplateChannel,
				preview: newTemplateBody.slice(0, 80) + "...",
			},
		];

		showTemplateModal = false;
		newTemplateName = "";
		newTemplateSubject = "";
		newTemplateBody = "";
		toast.success("Template created successfully");
	}

	function saveSettings() {
		toast.success("Notification settings saved successfully");
	}
</script>

<div
	class="notification-container min-h-screen -mx-8 -mb-10 px-8 pt-6 pb-20 mt-[-24px]"
>
	<!-- Page Header Action Area -->
	<div class="flex items-center justify-between pb-6 relative z-10">
		<div class="hidden md:block">
			<h3 class="text-sm font-semibold text-gray-400 tracking-tight">
				System control panel for automated alerts & broadcast messaging
			</h3>
		</div>
		<div class="flex items-center gap-3">
			<Button
				variant="outline"
				class="gap-2 border-white bg-white/50 backdrop-blur-sm shadow-sm hover:bg-white transition-all rounded-xl"
				onclick={() => (showBroadcastModal = true)}
			>
				<Megaphone class="w-4 h-4 text-brand" />
				Broadcast
			</Button>
			<Button
				class="gap-2 bg-brand hover:bg-brand-dark shadow-lg shadow-brand/20 transition-all rounded-xl"
				onclick={saveSettings}
			>
				<Check class="w-4 h-4" />
				Save Settings
			</Button>
		</div>
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
		<!-- Left Content (Main) -->
		<div class="xl:col-span-8 space-y-8">
			<!-- Admin Inbox -->
			<Card.Root
				class="bg-white rounded-xl border border-brand/20 shadow-sm group hover:-translate-y-1 hover:shadow-lg hover:border-brand/40 transition-all duration-300 relative overflow-hidden antialiased cursor-pointer"
			>
				<Card.Header
					class="flex flex-row items-center justify-between px-8 pt-1 pb-3 border-b border-slate-100 "
				>
					<div class="flex items-center gap-3">
						<Card.Title
							class="text-[22px] font-black tracking-tight text-[#1a1c2d]"
							>Message Inbox</Card.Title
						>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100"
						>
							<Mail class="w-5 h-5 text-brand" />
						</div>
					</div>
				</Card.Header>
				<Card.Content class="p-0 mb-0">
					<Tabs.Root bind:value={activeInboxTab} class="w-full">
						<div class="px-8 pb-8">
							<Tabs.List
								class="bg-transparent w-full h-auto flex flex-wrap gap-2 px-0 py-2 overflow-visible"
							>
								<Tabs.Trigger
									value="all"
									class="rounded-full px-5 py-4 text-[13px] font-bold border border-brand/30 bg-white text-slate-500 shadow-sm transition-all
                                           data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:border-brand data-[state=active]:shadow-md data-[state=active]:shadow-brand/20 relative"
								>
									All
								</Tabs.Trigger>
								<Tabs.Trigger
									value="system"
									class="rounded-full px-5 py-4 text-[13px] font-bold border border-brand/30 bg-white text-slate-500 shadow-sm transition-all
                                           data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:border-brand data-[state=active]:shadow-md data-[state=active]:shadow-brand/20"
									>System</Tabs.Trigger
								>
								<Tabs.Trigger
									value="users"
									class="rounded-full px-5 py-4 text-[13px] font-bold border border-brand/30 bg-white text-slate-500 shadow-sm transition-all
                                           data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:border-brand data-[state=active]:shadow-md data-[state=active]:shadow-brand/20"
									>Users</Tabs.Trigger
								>
								<Tabs.Trigger
									value="flagged"
									class="rounded-full px-5 py-4 text-[13px] font-bold border border-brand/30 bg-white text-slate-500 shadow-sm transition-all
                                           data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:border-brand data-[state=active]:shadow-md data-[state=active]:shadow-brand/20"
									>Flagged</Tabs.Trigger
								>
								<Tabs.Trigger
									value="broadcast"
									class="rounded-full px-5 py-4 text-[13px] font-bold border border-brand/30 bg-white text-slate-500 shadow-sm transition-all
                                           data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:border-brand data-[state=active]:shadow-md data-[state=active]:shadow-brand/20"
									>Broadcasts</Tabs.Trigger
								>
							</Tabs.List>
						</div>
						<Separator class="bg-brand/10" />

						<Tabs.Content value={activeInboxTab} class="mt-0">
							{#key activeInboxTab}
								<div
									class="px-0 pb-4"
									in:fade={{ duration: 250, easing: cubicInOut }}
								>
									<Accordion.Root type="single" collapsible class="w-full">
										{#each filteredNotifs as notif (notif.id)}
											{@const Icon =
												iconMap[notif.iconName as keyof typeof iconMap]}
											<Accordion.Item
												value={notif.id.toString()}
												class="border-b border-slate-200 last:border-b-0"
											>
												<Accordion.Trigger
													class="w-full hover:no-underline py-4 px-8 cursor-pointer group transition-all hover:bg-slate-50/80 relative"
													onclick={() => readNotif(notif.id)}
												>
													<div class="flex items-start gap-4 text-left w-full">
														<div
															class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
															style="background-color: {notif.bg}; border-color: {notif.color}30"
														>
															{#if Icon}
																<Icon
																	class="w-5 h-5"
																	style="color: {notif.color}"
																	strokeWidth={2}
																/>
															{:else}
																<Bell class="w-5 h-5" style="color: {notif.color}" />
															{/if}
														</div>

														<div
															class="flex-1 min-w-0 pr-2 flex flex-col gap-0.5"
														>
															<!-- Line 1: Sender & Time -->
															<div class="flex items-center justify-between">
																<h4
																	class="text-[14px] font-bold tracking-tight transition-colors"
																	style="color: {notif.color}"
																>
																	{notif.title}
																</h4>
																<span
																	class="text-[12px] text-gray-400 font-medium whitespace-nowrap ml-2"
																>
																	{notif.time}
																</span>
															</div>

															<!-- Line 2: Subject/Tag & New Badge -->
															<div class="flex items-center justify-between">
																<span
																	class="text-[12px] font-semibold text-slate-700 tracking-tight"
																>
																	{notif.tag} Notification
																</span>
																{#if notif.unread}
																	<Badge
																		class="bg-brand/10 text-brand border-none text-[10px] h-5 px-1.5 font-bold rounded-md"
																	>
																		New
																	</Badge>
																{/if}
															</div>

															<!-- Line 3: Message Preview -->
															<p
																class="text-[12px] text-gray-500 leading-snug line-clamp-2 pr-6"
															>
																{@html notif.desc.replace(/<[^>]*>/g, "")}
															</p>
														</div>
													</div>
												</Accordion.Trigger>
												<Accordion.Content
													class="pb-6 px-8 pt-4 transition-all bg-slate-50/50"
												>
													<div class="ml-16 space-y-4">
														<div
															class="p-4 bg-white border border-slate-100 shadow-sm rounded-lg space-y-4"
														>
															<p
																class="text-[13px] text-gray-500 leading-relaxed"
															>
																{@html notif.desc}
															</p>

															<div
																class="flex items-center justify-between pt-3 border-t border-slate-50"
															>
																<div class="flex items-center gap-2">
																	<Badge
																		variant="outline"
																		class="bg-white text-[10px] font-bold border-gray-100 text-gray-400 h-5"
																	>
																		{notif.tag}
																	</Badge>
																</div>

																<div class="flex items-center gap-2">
																	<Button
																		variant="ghost"
																		size="sm"
																		class="h-8 px-3 text-[11px] font-bold text-gray-400 hover:text-brand hover:bg-brand/5 gap-2 rounded-lg"
																	>
																		<Eye class="w-4 h-4" />
																		Details
																	</Button>
																	<Button
																		variant="ghost"
																		size="sm"
																		class="h-8 px-3 text-[11px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 gap-2 rounded-lg"
																	>
																		<Trash2 class="w-4 h-4" />
																		Archive
																	</Button>
																</div>
															</div>
														</div>
													</div>
												</Accordion.Content>
											</Accordion.Item>
										{:else}
											<div class="py-10">
												<Empty title="No messages" message="Inbox is clear." icon={Bell} compact={true} />
											</div>
										{/each}
									</Accordion.Root>
								</div>
							{/key}
						</Tabs.Content>
					</Tabs.Root>
				</Card.Content>
			</Card.Root>

			<!-- Broadcast History -->
			<Card.Root class="border-gray-100 shadow-sm overflow-hidden">
				<Card.Header
					class="flex flex-row items-center justify-between border-b border-slate-100 bg-white/50 py-4"
				>
					<Card.Title class="text-[15px] font-bold flex items-center gap-2">
						<Megaphone class="w-4 h-4 text-brand" />
						Broadcast History
					</Card.Title>
					<Badge
						variant="outline"
						class="bg-slate-50 text-gray-500 border-gray-100 text-[10px]"
					>
						Last 30 days
					</Badge>
				</Card.Header>
				<Card.Content class="p-0">
					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-slate-50/50">
									<th
										class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"
										>Message</th
									>
									<th
										class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"
										>Audience</th
									>
									<th
										class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"
										>Channel</th
									>
									<th
										class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"
										>Sent</th
									>
									<th
										class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"
										>Opens</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each broadcasts as b}
									<tr class="hover:bg-slate-50/50 transition-colors">
										<td class="px-6 py-4">
											<span class="text-[12.5px] font-bold text-[#141522]"
												>{b.title}</span
											>
										</td>
										<td class="px-6 py-4 text-xs">
											<Badge
												variant="outline"
												class="bg-gray-100/50 text-gray-500 border-gray-200 text-[10px]"
											>
												{b.audience}
											</Badge>
										</td>
										<td
											class="px-6 py-4 text-[11px] text-gray-400 font-medium whitespace-nowrap"
										>
											{b.channel}
										</td>
										<td
											class="px-6 py-4 text-[11px] text-gray-400 font-medium whitespace-nowrap"
										>
											{b.sent}
										</td>
										<td class="px-6 py-4">
											<Badge
												class="bg-brand/10 text-brand hover:bg-brand/20 border-transparent text-[10px] font-bold"
											>
												{b.opens}
											</Badge>
										</td>
									</tr>
								{:else}
									<tr>
										<td colspan="5" class="py-10">
											<Empty title="No broadcasts" message="Broadcast history will appear here." icon={Megaphone} compact={true} />
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Content>
				<Card.Footer
					class="bg-slate-50/30 border-t border-gray-50 py-3 flex justify-center"
				>
					<Button
						variant="ghost"
						size="sm"
						class="text-[11px] text-brand/70 hover:text-brand flex items-center gap-1 font-medium"
					>
						View full broadcast logs
						<ChevronRight class="w-3 h-3" />
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>

		<!-- Right Content (Stats & Settings) -->
		<div class="xl:col-span-4 space-y-6">
			<!-- Delivery Stats -->
			<Card.Root class="border-gray-100 shadow-sm overflow-hidden">
				<Card.Header
					class="flex flex-row items-center justify-between border-b border-gray-50 bg-white/50 py-3 px-4"
				>
					<Card.Title class="text-[13px] font-bold flex items-center gap-2">
						<BarChart3 class="w-4 h-4 text-blue-500" />
						Delivery Stats
					</Card.Title>
					<Badge
						class="bg-[#EAF3DE] text-[#3B6D11] border-transparent text-[10px] font-semibold"
						>This Week</Badge
					>
				</Card.Header>
				<Card.Content class="p-4 bg-white">
					<div class="grid grid-cols-2 gap-3">
						{#each data.deliveryStats as stat}
							<div
								class="p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md hover:shadow-slate-100 flex flex-col group"
							>
								<span
									class="text-xl font-black tracking-tight {stat.color} group-hover:scale-105 transition-transform origin-left"
									>{stat.value}</span
								>
								<span
									class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5"
									>{stat.label}</span
								>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Quick Templates -->
			<Card.Root class="border-gray-100 shadow-sm">
				<Card.Header
					class="flex flex-row items-center justify-between border-b border-slate-100 py-3 px-4"
				>
					<Card.Title class="text-[13px] font-bold">Quick Templates</Card.Title>
					<Button
						variant="outline"
						size="sm"
						class="h-7 text-[10px] px-2 gap-1 border-brand/20 text-brand"
						onclick={() => (showTemplateModal = true)}
					>
						<Plus class="w-3 h-3" />
						New
					</Button>
				</Card.Header>
				<Card.Content class="p-4 space-y-2.5">
					{#each templates as t}
						<button
							class="w-full text-left group p-3 rounded-xl border border-gray-100 hover:border-brand/40 hover:bg-brand/[0.02] transition-all"
						>
							<div class="flex items-center justify-between mb-1">
								<span class="text-[11px] font-bold text-[#141522]"
									>{t.name}</span
								>
								<Badge
									variant="outline"
									class="text-[9px] h-4 bg-gray-50 border-gray-100 text-gray-400 font-bold px-1.5"
									>{t.channel}</Badge
								>
							</div>
							<p class="text-[10px] text-gray-400 line-clamp-2 leading-tight">
								{t.preview}
							</p>
						</button>
					{:else}
						<div class="py-4">
							<Empty title="No templates" message="Create your first template." icon={Megaphone} compact={true} />
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<!-- Scheduled Queue -->
			<Card.Root
				class="border-gray-100 shadow-sm border-l-2 border-l-orange-400"
			>
				<Card.Header
					class="flex flex-row items-center justify-between border-b border-slate-100 py-3 px-4"
				>
					<Card.Title class="text-[13px] font-bold flex items-center gap-2">
						<Clock class="w-4 h-4 text-orange-500" />
						Scheduled Queue
					</Card.Title>
					<Badge
						class="bg-orange-50 text-orange-600 border-none text-[10px] font-bold"
						>4 pending</Badge
					>
				</Card.Header>
				<Card.Content class="p-3 space-y-1">
					{#each data.queue as item}
						<div
							class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
						>
							<div
								class="w-2 h-2 rounded-full shrink-0"
								style="background-color: {item.color}"
							></div>
							<div class="flex-1 min-w-0">
								<div class="text-[11px] font-bold text-[#141522] truncate">
									{item.title}
								</div>
								<div class="text-[9px] text-gray-400 font-medium">
									Scheduled for {item.time}
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								class="w-6 h-6 text-gray-300 hover:text-red-500"
							>
								<Trash2 class="w-3 h-3" />
							</Button>
						</div>
					{:else}
						<div class="py-4">
							<Empty title="Empty queue" message="No scheduled broadcasts." icon={Clock} compact={true} />
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<!-- Channel Settings -->
			<Card.Root class="border-gray-100 shadow-sm">
				<Card.Header class="border-b border-slate-100 py-3 px-4">
					<Card.Title class="text-[13px] font-bold">Channel Settings</Card.Title
					>
				</Card.Header>
				<Card.Content class="p-0 divide-y divide-slate-100">
					{#each data.channels as channel}
						<div class="flex items-center justify-between p-4 bg-white/50">
							<div>
								<div class="text-[11px] font-bold text-[#141522]">
									{channel.label}
								</div>
								<div class="text-[9px] text-gray-400">{channel.subtext}</div>
							</div>
							<Switch
								checked={channel.active}
								class="data-[state=checked]:bg-brand"
							/>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<!-- Auto-Triggers -->
			<Card.Root class="border-gray-100 shadow-sm">
				<Card.Header class="border-b border-slate-100 py-3 px-4">
					<Card.Title class="text-[13px] font-bold"
						>Auto-Trigger Events</Card.Title
					>
				</Card.Header>
				<Card.Content class="p-0 divide-y divide-slate-100">
					<div class="h-[250px] overflow-y-auto custom-scrollbar">
						{#each data.autoTriggers as trigger}
							<div class="flex items-center justify-between p-4 bg-white/50">
								<div>
									<div class="text-[11px] font-bold text-[#141522]">
										{trigger.label}
									</div>
									<div class="text-[9px] text-gray-400">{trigger.subtext}</div>
								</div>
								<Switch
									checked={trigger.active}
									class="data-[state=checked]:bg-brand"
								/>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<!-- Send Broadcast Modal -->
<Dialog.Root bind:open={showBroadcastModal}>
	<Dialog.Content
		class="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl"
	>
		<div class="bg-brand px-6 py-8 text-white relative overflow-hidden">
			<div class="relative z-10">
				<Dialog.Title class="text-xl font-black mb-1"
					>Send Broadcast</Dialog.Title
				>
				<Dialog.Description class="text-white/70 text-sm"
					>Target your audience across multiple messaging channels</Dialog.Description
				>
			</div>
			<div
				class="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-3xl"
			></div>
		</div>

		<div class="p-6 space-y-5 bg-white max-h-[80vh] overflow-y-auto">
			<div class="space-y-4">
				<div class="grid w-full items-center gap-1.5">
					<Label
						for="title"
						class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
						>Message Title *</Label
					>
					<Input
						id="title"
						placeholder="e.g. JAMB 2025 prep tips are here!"
						bind:value={broadcastTitle}
						class="border-gray-200 focus-visible:ring-brand font-medium h-10"
					/>
				</div>

				<div class="grid w-full items-center gap-1.5">
					<Label
						for="message"
						class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
						>Message Body *</Label
					>
					<textarea
						id="message"
						placeholder="Write your message to students..."
						bind:value={broadcastBody}
						class="min-h-[120px] w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent leading-relaxed text-sm"
					></textarea>
				</div>

				<div class="space-y-2">
					<Label
						class="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 block"
						>Target Audience</Label
					>
					<div class="grid grid-cols-1 gap-2">
						{#each [{ id: "all-users", label: "All users", sub: `Send to all ${data.totalUsers?.toLocaleString() ?? '—'} registered accounts` }, { id: "active", label: "Active users only", sub: `${data.activeUsers?.toLocaleString() ?? '—'} accounts with active status` }, { id: "premium", label: "Premium users", sub: "Users on premium plan" }, { id: "pending", label: "Pending verification", sub: `${data.pendingUsers?.toLocaleString() ?? '—'} users awaiting email confirm` }] as opt}
							<button
								class="flex items-center gap-3 p-3 text-left rounded-xl border border-gray-100 transition-all {selectedAudience ===
								opt.id
									? 'bg-brand/[0.03] border-brand/30 shadow-sm'
									: 'hover:bg-gray-50'}"
								onclick={() => (selectedAudience = opt.id)}
							>
								<div
									class="w-4 h-4 rounded-full border-2 {selectedAudience ===
									opt.id
										? 'border-brand flex items-center justify-center bg-brand'
										: 'border-gray-300'} transition-all"
								>
									{#if selectedAudience === opt.id}
										<div class="w-1.5 h-1.5 rounded-full bg-white"></div>
									{/if}
								</div>
								<div>
									<div class="text-xs font-bold text-[#141522]">
										{opt.label}
									</div>
									<div class="text-[10px] text-gray-400">{opt.sub}</div>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<Separator class="bg-gray-100" />

				<div class="space-y-2">
					<Label
						class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
						>Channels</Label
					>
					<div class="flex flex-wrap gap-2 pt-1">
						<button
							class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all {selectedChannels.email
								? 'bg-brand text-white border-brand'
								: 'bg-gray-50 text-gray-500 border-gray-100'}"
							onclick={() => (selectedChannels.email = !selectedChannels.email)}
						>
							<Mail class="w-3.5 h-3.5" /> Email
						</button>
						<button
							class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all {selectedChannels.push
								? 'bg-brand text-white border-brand'
								: 'bg-gray-50 text-gray-500 border-gray-100'}"
							onclick={() => (selectedChannels.push = !selectedChannels.push)}
						>
							<Bell class="w-3.5 h-3.5" /> Push
						</button>
						<button
							class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all {selectedChannels.sms
								? 'bg-brand text-white border-brand'
								: 'bg-gray-50 text-gray-500 border-gray-100'}"
							onclick={() => (selectedChannels.sms = !selectedChannels.sms)}
						>
							<Smartphone class="w-3.5 h-3.5" /> SMS
						</button>
						<button
							class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all {selectedChannels.whatsapp
								? 'bg-green-600 text-white border-green-600'
								: 'bg-gray-50 text-gray-500 border-gray-100'}"
							onclick={() =>
								(selectedChannels.whatsapp = !selectedChannels.whatsapp)}
						>
							<MessageSquare class="w-3.5 h-3.5" /> WhatsApp
						</button>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<Label
							class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
							>Schedule</Label
						>
						<Input type="datetime-local" class="text-xs border-gray-200 h-9" />
					</div>
					<div class="space-y-1.5">
						<Label
							class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
							>Quick Template</Label
						>
						<Select.Root
							type="single"
							bind:value={selectedTemplate}
							onValueChange={applyTemplate}
						>
							<Select.Trigger class="text-xs border-gray-200 h-9">
								{selectedTemplate ? selectedTemplate : "Start from scratch"}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="Start from scratch">Start from scratch</Select.Item>
								<Select.Item value="welcome" label="Welcome message">Welcome message</Select.Item>
								<Select.Item value="credit" label="Low credit alert">Low credit alert</Select.Item>
								<Select.Item value="exam" label="Exam reminder">Exam reminder</Select.Item>
								<Select.Item value="result" label="Result available">Result available</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</div>
		</div>

		<div
			class="p-6 bg-slate-50 flex items-center justify-between border-t border-gray-100"
		>
			<Button
				variant="ghost"
				class="text-xs font-bold text-gray-400"
				onclick={() => (showBroadcastModal = false)}>Cancel</Button
			>
			<div class="flex gap-3">
				<Button
					variant="outline"
					class="gap-2 text-xs border-blue-100 text-blue-600 hover:bg-blue-50/50"
				>
					<Clock class="w-3.5 h-3.5" />
					Schedule
				</Button>
				<Button
					class="gap-2 text-xs bg-brand hover:bg-brand-dark px-6 shadow-lg shadow-brand/20"
					onclick={sendBroadcast}
				>
					<Send class="w-3.5 h-3.5" />
					Send Now
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- New Template Modal -->
<Dialog.Root bind:open={showTemplateModal}>
	<Dialog.Content class="sm:max-w-[460px] p-6 rounded-2xl">
		<Dialog.Header class="mb-4">
			<Dialog.Title class="text-lg font-black flex items-center gap-2">
				<Plus class="w-5 h-5 text-brand" />
				New Template
			</Dialog.Title>
			<Dialog.Description class="text-xs"
				>Create a reusable notification blueprint</Dialog.Description
			>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="grid w-full items-center gap-1.5">
				<Label
					for="tm-name"
					class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
					>Template Name *</Label
				>
				<Input
					id="tm-name"
					placeholder="e.g. Welcome message"
					bind:value={newTemplateName}
					class="border-gray-200"
				/>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label
					for="tm-subject"
					class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
					>Subject Line</Label
				>
				<Input
					id="tm-subject"
					placeholder="e.g. Welcome to MockCenter 🎉"
					bind:value={newTemplateSubject}
					class="border-gray-200"
				/>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label
					for="tm-body"
					class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
					>Body *</Label
				>
				<textarea
					id="tm-body"
					placeholder="Use {{ name }}, {{ exam }}, {{ score }} as variables..."
					bind:value={newTemplateBody}
					class="min-h-[140px] w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent leading-relaxed text-sm"
				></textarea>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label
					class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
					>Default Channel</Label
				>
				<Select.Root
					onSelectedChange={(v) => (newTemplateChannel = v?.value as string)}
				>
					<Select.Trigger class="border-gray-200 h-10">
						<Select.Value placeholder="Select channel" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="Email">Email</Select.Item>
						<Select.Item value="Push">Push</Select.Item>
						<Select.Item value="SMS">SMS</Select.Item>
						<Select.Item value="All channels">All channels</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<div class="mt-8 flex gap-3">
			<Button
				variant="ghost"
				class="flex-1 text-gray-400 font-bold"
				onclick={() => (showTemplateModal = false)}>Cancel</Button
			>
			<Button
				class="flex-[2] bg-brand hover:bg-brand-dark px-6 font-bold shadow-lg shadow-brand/20"
				onclick={saveTemplate}>Save Template</Button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(.brand-shadow) {
		box-shadow: 0 10px 25px -5px rgba(59, 109, 17, 0.2);
	}

	.notification-container {
		background-color: #f8fbff;
		background-image: linear-gradient(#e5e7eb 0.5px, transparent 0.5px),
			linear-gradient(90deg, #e5e7eb 0.5px, transparent 0.5px);
		background-size: 40px 40px;
		background-position: center center;
		position: relative;
	}

	.notification-container::before {
		content: "";
		position: absolute;
		inset: 0;
		background: radial-gradient(
			circle at 50% 50%,
			rgba(255, 255, 255, 0) 0%,
			#f8fbff 100%
		);
		pointer-events: none;
	}

	:global(.notification-card-glow) {
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.02),
			0 20px 50px -12px rgba(0, 0, 0, 0.08),
			0 0 40px rgba(167, 139, 250, 0.03);
	}
</style>
