<script lang="ts">
	import {
		Home,
		Palette,
		Zap,
		Target,
		Cloud,
		Database,
		Key,
		Mail,
		Shield,
		AlertTriangle,
		Save,
		RotateCcw,
		Check,
		Copy,
		Trash2,
		Plus,
		ExternalLink,
		Settings as SettingsIcon,
		HelpCircle,
		Lock,
		Globe,
		HardDrive,
		Image as ImageIcon,
		Layout,
		Eye,
		Monitor,
		AlertOctagon,
		Bell,
		Activity,
	} from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { toast } from "svelte-sonner";
	import Confirmation from "$lib/components/Confirmation.svelte";
	import { browser } from "$app/environment";
	import { fade, slide } from "svelte/transition";
	import { enhance } from "$app/forms";

	let { data } = $props();

	// --- State ---
	let activeSection = $state("general");
	let isDirty = $state(false);

	// Settings state — initialised from server (live DB + defaults)
	// svelte-ignore state_referenced_locally
	let settings = $state(data.settings);

	let showConfirmModal = $state(false);
	let confirmAction = $state({ title: "", description: "", onConfirm: () => {} });

	// --- Helpers ---
	function markDirty() {
		isDirty = true;
	}

	async function handleSave() {
		// Collect every changed key and POST to /admin/settings via form action
		const pairs: { key: string; value: unknown }[] = [
			{ key: 'general.name',               value: settings.general.name },
			{ key: 'general.supportEmail',        value: settings.general.supportEmail },
			{ key: 'general.platformUrl',         value: settings.general.platformUrl },
			{ key: 'general.tagline',             value: settings.general.tagline },
			{ key: 'general.maintenanceMode',     value: settings.general.maintenanceMode },
			{ key: 'general.openRegistration',    value: settings.general.openRegistration },
			{ key: 'general.emailVerification',   value: settings.general.emailVerification },
			{ key: 'general.trialCredits',        value: settings.general.trialCredits },
			{ key: 'general.trialAmount',         value: settings.general.trialAmount },
			{ key: 'scoring.correct',             value: settings.scoring.correct },
			{ key: 'scoring.wrong',               value: settings.scoring.wrong },
			{ key: 'scoring.skipped',             value: settings.scoring.skipped },
			{ key: 'scoring.negativeMarking',     value: settings.scoring.negativeMarking },
			{ key: 'scoring.negativeAmount',      value: settings.scoring.negativeAmount },
			{ key: 'scoring.grades',              value: settings.scoring.grades },
			{ key: 'branding.primaryColor',       value: settings.branding.primaryColor },
			{ key: 'branding.headerBg',           value: settings.branding.headerBg },
			{ key: 'branding.accentColor',        value: settings.branding.accentColor },
			{ key: 'branding.fontFamily',         value: settings.branding.fontFamily },
			{ key: 'branding.fontSize',           value: settings.branding.fontSize },
			{ key: 'branding.darkMode',           value: settings.branding.darkMode },
			{ key: 'storage.bucketName',          value: settings.storage.bucketName },
			{ key: 'storage.publicUrl',           value: settings.storage.publicUrl },
			{ key: 'storage.autoCompress',        value: settings.storage.autoCompress },
			{ key: 'storage.maxSize',             value: settings.storage.maxSize },
		];

		try {
			await Promise.all(pairs.map(async ({ key, value }) => {
				const fd = new FormData();
				fd.set('key', key);
				fd.set('value', JSON.stringify(value));
				await fetch('?/saveSetting', { method: 'POST', body: fd });
			}));
			toast.success('Settings saved successfully!');
			isDirty = false;
		} catch (err) {
			toast.error('Failed to save some settings. Please try again.');
		}
	}

	function handleDiscard() {
		settings = data.settings; // restore from SSR snapshot
		isDirty = false;
		toast.info('Changes discarded');
	}

	function triggerAction(action: string) {
		confirmAction = {
			title: `Confirm ${action}`,
			description: `Are you sure you want to ${action.toLowerCase()}? This action may be irreversible.`,
			onConfirm: () => {
				toast.success(`${action} completed successfully`);
			},
		};
		showConfirmModal = true;
	}

	function copyToClipboard(text: string) {
		if (browser) {
			navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		}
	}

	const iconMapping: Record<string, any> = {
		home: Home,
		palette: Palette,
		zap: Zap,
		target: Target,
		bell: Bell,
		cloud: Cloud,
		database: Database,
		key: Key,
		mail: Mail,
		monitor: Monitor,
		shield: Shield,
		"alert-triangle": AlertTriangle
	};

	const sections = data.sections;

	const groupLabels = ["Platform", "Integrations", "Admin prefs"];

</script>

<div class="flex flex-col gap-6 w-full -mt-4 pb-20 antialiased">
	<!-- TOPBAR / ACTIONS -->
	<div class="flex items-center justify-between bg-white p-4 px-6 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-30">
		<div class="flex flex-col">
			<h2 class="text-[17px] font-bold text-slate-800 tracking-tight">Platform Settings</h2>
			<p class="text-[11px] text-slate-400 font-medium">Configure global platform behavior and integrations</p>
		</div>
		<div class="flex items-center gap-3">
			<Button variant="outline" size="sm" class="h-9 px-4 text-[12px] font-bold text-slate-500 border-slate-200" onclick={() => triggerAction("Reset to defaults")}>
				<RotateCcw class="w-3.5 h-3.5 mr-2" />
				Reset defaults
			</Button>
			<Button size="sm" class="h-9 px-6 text-[12px] font-bold bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/10" onclick={handleSave}>
				<Save class="w-3.5 h-3.5 mr-2" />
				Save all changes
			</Button>
		</div>
	</div>

	<!-- UNSAVED BANNER -->
	{#if isDirty}
		<div transition:slide={{ axis: 'y' }} class="bg-amber-50 border border-amber-200 rounded-xl p-3 px-5 flex items-center justify-between shadow-sm">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
					<AlertTriangle class="w-4 h-4" />
				</div>
				<span class="text-[13px] font-bold text-amber-800">You have unsaved changes in {activeSection}</span>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" class="h-8 px-4 text-[12px] font-bold text-amber-700 hover:bg-amber-100" onclick={handleDiscard}>Discard</Button>
				<Button size="sm" class="h-8 px-5 text-[12px] font-bold bg-amber-600 hover:bg-amber-700 text-white" onclick={handleSave}>Save now</Button>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-[240px_1fr] gap-6 items-start">
		<!-- SETTINGS SIDEBAR -->
		<div class="flex flex-col gap-1 sticky top-[160px]">
			{#each groupLabels as group}
				<div class="mb-4 last:mb-0">
					<h3 class="px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{group}</h3>
					<div class="flex flex-col gap-0.5">
						{#each sections.filter(s => s.group === group) as s}
							<button 
								onclick={() => activeSection = s.id}
								class="flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group {activeSection === s.id ? 'bg-brand/10 text-brand-dark shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}"
							>
								<div class="flex items-center gap-3">
									{#if s.iconType && iconMapping[s.iconType]}
										{@const Icon = iconMapping[s.iconType]}
										<Icon class="w-4 h-4 {activeSection === s.id ? 'text-brand' : 'text-slate-400 group-hover:text-slate-600'}" strokeWidth={2} />
									{:else}
										<SettingsIcon class="w-4 h-4 {activeSection === s.id ? 'text-brand' : 'text-slate-400 group-hover:text-slate-600'}" strokeWidth={2} />
									{/if}
									<span class="text-[13px] font-bold">{s.label}</span>
								</div>
								{#if s.badge}
									<span class="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white">{s.badge}</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- CONTENT AREA -->
		<div class="flex flex-col gap-6">
			<!-- GENERAL SECTION -->
			{#if activeSection === 'general'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-[14px] font-bold text-slate-800">General platform settings</Card.Title>
							<Card.Description class="text-[11px]">Core identity and global behavior</Card.Description>
						</div>
						<Badge class="bg-brand/10 text-brand-dark border-none font-bold text-[10px] px-3">Live</Badge>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-6">
						<div class="grid gap-6">
							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-brand">Platform Identity</h4>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Platform Name</Label>
										<Input bind:value={settings.general.name} oninput={markDirty} class="h-10 text-[13px] font-medium" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Support Email</Label>
										<Input bind:value={settings.general.supportEmail} oninput={markDirty} type="email" class="h-10 text-[13px] font-medium" />
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Platform URL</Label>
										<Input bind:value={settings.general.platformUrl} oninput={markDirty} type="url" class="h-10 text-[13px] font-medium" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Admin Panel URL</Label>
										<Input bind:value={settings.general.adminUrl} oninput={markDirty} type="url" class="h-10 text-[13px] font-medium" />
									</div>
								</div>
								<div class="grid gap-1.5">
									<Label class="text-[11px] font-bold text-slate-500">Platform Tagline</Label>
									<Input bind:value={settings.general.tagline} oninput={markDirty} class="h-10 text-[13px] font-medium" />
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-brand">Platform Behaviour</h4>
								
								<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
									<div class="flex flex-col gap-0.5">
										<span class="text-[13px] font-bold text-slate-800">Maintenance Mode</span>
										<p class="text-[11px] text-slate-500">Puts the site into read-only mode for students.</p>
									</div>
									<Switch bind:checked={settings.general.maintenanceMode} onCheckedChange={markDirty} />
								</div>

								<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
									<div class="flex flex-col gap-0.5">
										<span class="text-[13px] font-bold text-slate-800">Open Registration</span>
										<p class="text-[11px] text-slate-500">Allow new students to sign up automatically.</p>
									</div>
									<Switch bind:checked={settings.general.openRegistration} onCheckedChange={markDirty} />
								</div>

								<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
									<div class="flex flex-col gap-0.5">
										<span class="text-[13px] font-bold text-slate-800">Email Verification</span>
										<p class="text-[11px] text-slate-500">Requires users to verify email before login.</p>
									</div>
									<Switch bind:checked={settings.general.emailVerification} onCheckedChange={markDirty} />
								</div>

								<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
									<div class="flex flex-col gap-0.5">
										<span class="text-[13px] font-bold text-slate-800">Free Trial Credits</span>
										<p class="text-[11px] text-slate-500">Grant credits to new accounts upon signup.</p>
									</div>
									<div class="flex items-center gap-4">
										{#if settings.general.trialCredits}
											<div class="flex items-center gap-2 pr-4 border-r border-slate-200">
												<span class="text-[11px] font-bold text-slate-400">Amount:</span>
												<Input type="number" bind:value={settings.general.trialAmount} oninput={markDirty} class="w-16 h-7 text-[12px] px-2" />
											</div>
										{/if}
										<Switch bind:checked={settings.general.trialCredits} onCheckedChange={markDirty} />
									</div>
								</div>
							</div>
						</div>
					</Card.Content>
					<Card.Footer class="bg-slate-50/50 py-3 block px-6">
						<Button size="sm" class="bg-brand hover:bg-brand-dark text-white font-bold h-8" onclick={handleSave}>Save general settings</Button>
					</Card.Footer>
				</Card.Root>
			{/if}

			<!-- BRANDING SECTION -->
			{#if activeSection === 'branding'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-[14px] font-bold text-slate-800">Branding & Appearance</Card.Title>
							<Card.Description class="text-[11px]">Customize looking and feel of the student UI</Card.Description>
						</div>
						<Button variant="ghost" size="sm" class="h-8 text-[11px] font-bold text-blue-600 hover:bg-blue-50">
							<Eye class="w-3.5 h-3.5 mr-2" />
							Preview Student UI
						</Button>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-8">
						<div class="grid gap-6">
							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-brand">Logo & Assets</h4>
								<div class="grid grid-cols-2 gap-4">
									<div class="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer hover:border-brand hover:bg-brand/5 transition-all">
										<div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
											<ImageIcon class="w-6 h-6" />
										</div>
										<div class="text-center">
											<span class="text-[12px] font-bold text-slate-700 block">Platform Logo</span>
											<span class="text-[10px] text-slate-400">PNG, SVG • 200x60px</span>
										</div>
									</div>
									<div class="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer hover:border-brand hover:bg-brand/5 transition-all">
										<div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
											<Globe class="w-6 h-6" />
										</div>
										<div class="text-center">
											<span class="text-[12px] font-bold text-slate-700 block">Favicon</span>
											<span class="text-[10px] text-slate-400">ICO, PNG • 32x32px</span>
										</div>
									</div>
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-brand">Brand Colors</h4>
								<div class="grid gap-4">
									<div class="grid gap-2">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Color</Label>
										<div class="flex items-center gap-3 flex-wrap">
											{#each ['#3B6D11', '#0C447C', '#534AB7', '#A32D2D', '#854F0B', '#0F6E56'] as color}
												<button 
													class="w-10 h-10 rounded-xl border-2 transition-all duration-200 {settings.branding.primaryColor === color ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}"
													style="background-color: {color}"
													onclick={() => { settings.branding.primaryColor = color; markDirty(); }}
													title={color}
												></button>
											{/each}
											<div class="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center relative overflow-hidden">
												<Plus class="w-4 h-4 text-slate-300" />
												<input type="color" bind:value={settings.branding.primaryColor} oninput={markDirty} class="absolute inset-0 opacity-0 cursor-pointer" />
											</div>
										</div>
									</div>

									<div class="grid grid-cols-2 gap-4">
										<div class="grid gap-1.5">
											<Label class="text-[11px] font-bold text-slate-500">Header Background</Label>
											<div class="flex items-center gap-2">
												<div class="w-8 h-8 rounded-lg border border-slate-200" style="background-color: {settings.branding.headerBg}"></div>
												<Input bind:value={settings.branding.headerBg} oninput={markDirty} class="flex-1 h-9 text-[13px]" />
											</div>
										</div>
										<div class="grid gap-1.5">
											<Label class="text-[11px] font-bold text-slate-500">Accent Color</Label>
											<div class="flex items-center gap-2">
												<div class="w-8 h-8 rounded-lg border border-slate-200" style="background-color: {settings.branding.accentColor}"></div>
												<Input bind:value={settings.branding.accentColor} oninput={markDirty} class="flex-1 h-9 text-[13px]" />
											</div>
										</div>
									</div>
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-brand">Typography & UX</h4>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Font Family</Label>
										<Input bind:value={settings.branding.fontFamily} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Base Font Size</Label>
										<Input bind:value={settings.branding.fontSize} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
								</div>
								<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
									<div class="flex flex-col gap-0.5">
										<span class="text-[13px] font-bold text-slate-800">Dark Mode Support</span>
										<p class="text-[11px] text-slate-500">Allow users to switch between light and dark modes.</p>
									</div>
									<Switch bind:checked={settings.branding.darkMode} onCheckedChange={markDirty} />
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- CREDITS & BILLING SECTION -->
			{#if activeSection === 'credits'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-[14px] font-bold text-slate-800">Credits & Billing</Card.Title>
							<Card.Description class="text-[11px]">Manage credit bundles and pricing</Card.Description>
						</div>
						<Badge class="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[10px] px-3">Paystack Connected</Badge>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-8">
						<div class="grid gap-6">
							<div class="grid gap-4">
								<div class="flex items-center justify-between">
									<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Credit Bundles</h4>
									<Button variant="ghost" size="sm" class="h-7 text-[10px] font-black text-[#3B6D11] hover:bg-[#EAF3DE]">
										<Plus class="w-3 h-3 mr-1" /> ADD NEW
									</Button>
								</div>
								<div class="grid gap-2">
									{#each settings.credits.bundles as bundle, i}
										<div class="flex items-center gap-4 p-3 pr-4 rounded-xl border border-slate-100 bg-slate-50/30 group transition-all hover:bg-white hover:shadow-md hover:border-[#EAF3DE]">
											<div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#3B6D11] font-bold text-[11px]">
												{bundle.label[0]}
											</div>
											<div class="flex-1 grid grid-cols-3 gap-4">
												<div class="grid gap-0.5 text-left">
													<Input bind:value={bundle.label} oninput={markDirty} class="h-8 text-[12px] font-bold border-none bg-transparent p-0" />
													<span class="text-[9px] text-slate-400 font-black uppercase">Bundle Name</span>
												</div>
												<div class="grid gap-0.5">
													<div class="flex items-center">
														<span class="text-[12px] font-bold text-slate-700">⚡</span>
														<Input type="number" bind:value={bundle.credits} oninput={markDirty} class="h-8 text-[12px] font-bold border-none bg-transparent p-0 w-16" />
													</div>
													<span class="text-[9px] text-slate-400 font-black uppercase">Credits</span>
												</div>
												<div class="grid gap-0.5">
													<Input bind:value={bundle.price} oninput={markDirty} class="h-8 text-[12px] font-bold border-none bg-transparent p-0 text-right" />
													<span class="text-[9px] text-slate-400 font-black uppercase text-right">Price</span>
												</div>
											</div>
											<button class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all p-1" onclick={() => { settings.credits.bundles.splice(i, 1); markDirty(); }}>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
									{/each}
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Spending Rules</h4>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Credits per Question</Label>
										<Input type="number" bind:value={settings.credits.rules.perQuestion} oninput={markDirty} class="h-10 text-[13px] font-medium" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Credits per Mock Exam</Label>
										<Input type="number" bind:value={settings.credits.rules.perMock} oninput={markDirty} class="h-10 text-[13px] font-medium" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Referral Bonus</Label>
										<Input type="number" bind:value={settings.credits.rules.referralBonus} oninput={markDirty} class="h-10 text-[13px] font-medium" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Daily Login Bonus</Label>
										<Input type="number" bind:value={settings.credits.rules.dailyBonus} oninput={markDirty} class="h-10 text-[13px] font-medium" />
									</div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- SCORING RULES SECTION -->
			{#if activeSection === 'scoring'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
						<Card.Title class="text-[14px] font-bold text-slate-800">Scoring Rules</Card.Title>
						<Card.Description class="text-[11px]">Applied across all platform exam sessions</Card.Description>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-8">
						<div class="grid gap-6">
							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Marks Configuration</h4>
								<div class="grid grid-cols-3 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Correct Answer</Label>
										<Input type="number" bind:value={settings.scoring.correct} oninput={markDirty} class="h-10 text-[13px] font-bold text-[#3B6D11]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Wrong Answer</Label>
										<Input type="number" bind:value={settings.scoring.wrong} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500">Skipped Question</Label>
										<Input type="number" bind:value={settings.scoring.skipped} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
								</div>
								
								<div class="flex flex-col gap-4 mt-2">
									<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
										<div class="flex flex-col gap-0.5">
											<span class="text-[13px] font-bold text-slate-800">Negative Marking</span>
											<p class="text-[11px] text-slate-500">Deduct marks for incorrect answers.</p>
										</div>
										<Switch bind:checked={settings.scoring.negativeMarking} onCheckedChange={markDirty} />
									</div>

									{#if settings.scoring.negativeMarking}
										<div transition:slide class="p-4 rounded-xl border border-red-100 bg-red-50/30 grid grid-cols-2 gap-4">
											<div class="grid gap-1.5">
												<Label class="text-[11px] font-bold text-red-600">Deduction Amount</Label>
												<Input type="number" step="0.05" bind:value={settings.scoring.negativeAmount} oninput={markDirty} class="h-9 text-[13px] border-red-100" />
											</div>
											<div class="grid gap-1.5">
												<Label class="text-[11px] font-bold text-red-600">Apply to Exams</Label>
												<div class="flex flex-wrap gap-2 pt-1">
													{#each ['JAMB', 'WAEC', 'NECO', 'POST-UTME'] as exam}
														<button 
															class="text-[9px] font-black px-2.5 py-1 rounded-full border transition-all {settings.scoring.examTypes.includes(exam) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200'}"
															onclick={() => {
																if(settings.scoring.examTypes.includes(exam)) {
																	settings.scoring.examTypes = settings.scoring.examTypes.filter(e => e !== exam);
																} else {
																	settings.scoring.examTypes.push(exam);
																}
																markDirty();
															}}
														>
															{exam}
														</button>
													{/each}
												</div>
											</div>
										</div>
									{/if}
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<div class="flex items-center justify-between">
									<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Grade Thresholds</h4>
									<Button variant="ghost" size="sm" class="h-7 text-[10px] font-black text-[#3B6D11] hover:bg-[#EAF3DE]">
										<Plus class="w-3 h-3 mr-1" /> ADD GRADE
									</Button>
								</div>
								<div class="grid gap-2">
									{#each settings.scoring.grades as grade, i}
										<div class="flex items-center gap-4 p-2 px-3 rounded-xl border border-slate-100 bg-slate-50/30 transition-all hover:bg-white hover:shadow-md">
											<div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border shadow-sm" style="background-color: {grade.color}15; color: {grade.color}; border-color: {grade.color}30">
												{grade.label}
											</div>
											<div class="flex-1 grid grid-cols-2 gap-8">
												<div class="flex items-center gap-2">
													<span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Min Score:</span>
													<div class="flex items-center gap-1">
														<Input type="number" bind:value={grade.min} oninput={markDirty} class="w-14 h-8 text-[13px] font-black border-none bg-transparent p-0" />
														<span class="text-slate-400 font-bold text-[13px]">%</span>
													</div>
												</div>
												<div class="flex items-center gap-2">
													<span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Label:</span>
													<Input bind:value={grade.label} oninput={markDirty} class="h-8 text-[13px] font-black border-none bg-transparent p-0" />
												</div>
											</div>
											<div class="flex items-center gap-2">
												<input type="color" bind:value={grade.color} oninput={markDirty} class="w-6 h-6 rounded-full cursor-pointer border-none p-0 bg-transparent" />
												<button class="text-red-400 hover:text-red-500 transition-all p-1" onclick={() => { settings.scoring.grades.splice(i, 1); markDirty(); }}>
													<Trash2 class="w-4 h-4" />
												</button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- STORAGE SECTION -->
			{#if activeSection === 'storage'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-[#0b1120] text-white py-6 px-8 relative overflow-hidden">
						<div class="relative z-10">
							<Card.Title class="text-[16px] font-bold flex items-center gap-2">
								<Cloud class="w-5 h-5 text-blue-400" />
								Cloudflare R2 Storage
							</Card.Title>
							<Card.Description class="text-blue-100/50 text-[11px] font-medium mt-1 uppercase tracking-widest">Connected • Active</Card.Description>
						</div>
						<Activity class="w-32 h-32 text-blue-500/5 absolute -right-8 -bottom-8 rotate-12" />
					</Card.Header>
					<Card.Content class="p-8 flex flex-col gap-6">
						<div class="grid gap-6">
							<div class="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-4">
								<div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
									<HardDrive class="w-6 h-6 text-blue-600" />
								</div>
								<div class="flex-1">
									<div class="flex items-center justify-between mb-1">
										<span class="text-[13px] font-bold text-slate-800">Usage Analytics</span>
										<span class="text-[11px] font-black text-blue-600">
											{data.mediaCount != null ? `${data.mediaCount.toLocaleString()} files in R2` : 'R2 Connected'}
										</span>
									</div>
									<div class="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
										<div class="h-full bg-blue-600 transition-all" style="width: {Math.min(100, Math.max(1, Math.round((data.mediaCount ?? 0) / 10)))}%"></div>
									</div>
								</div>
							</div>

							<div class="grid gap-5">
								<div class="grid gap-1.5">
									<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account ID</Label>
									<Input bind:value={settings.storage.accountId} oninput={markDirty} class="h-10 text-[13px] font-mono bg-slate-50/50" />
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access Key ID</Label>
										<Input bind:value={settings.storage.accessKey} oninput={markDirty} class="h-10 text-[13px] font-mono bg-slate-50/50" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Secret Access Key</Label>
										<Input bind:value={settings.storage.secretKey} oninput={markDirty} type="password" class="h-10 text-[13px] font-mono bg-slate-50/50" />
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bucket Name</Label>
										<Input bind:value={settings.storage.bucketName} oninput={markDirty} class="h-10 text-[13px] bg-slate-50/50" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Public URL Prefix</Label>
										<Input bind:value={settings.storage.publicUrl} oninput={markDirty} type="url" class="h-10 text-[13px] bg-slate-50/50" />
									</div>
								</div>

								<Separator class="my-2" />

								<div class="grid gap-4">
									<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
										<div class="flex flex-col gap-0.5">
											<span class="text-[13px] font-bold text-slate-800">Auto-compress Images</span>
											<p class="text-[11px] text-slate-500">Convert uploads to WebP to save storage space.</p>
										</div>
										<Switch bind:checked={settings.storage.autoCompress} onCheckedChange={markDirty} />
									</div>
									<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
										<div class="flex flex-col gap-0.5">
											<span class="text-[13px] font-bold text-slate-800">Max Upload Size</span>
											<p class="text-[11px] text-slate-500">Limit individual file sizes (MB).</p>
										</div>
										<div class="flex items-center gap-3">
											<Input type="number" bind:value={settings.storage.maxSize} oninput={markDirty} class="h-8 w-16 text-[12px] px-2" />
											<span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">MB</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card.Content>
					<Card.Footer class="bg-slate-50/50 py-4 px-8 flex justify-between border-t border-slate-100">
						<Button variant="outline" size="sm" class="h-9 px-6 text-[12px] font-bold text-slate-600 border-slate-200" onclick={() => triggerAction("Test storage connection")}>Test Connection</Button>
						<Button size="sm" class="h-9 px-8 text-[12px] font-bold bg-[#0b1120] hover:bg-black text-white" onclick={handleSave}>Save Config</Button>
					</Card.Footer>
				</Card.Root>
			{/if}

			<!-- DANGER ZONE -->
			{#if activeSection === 'danger'}
				<Card.Root class="border-red-200 shadow-sm overflow-hidden bg-red-50/10">
					<Card.Header class="bg-red-50 border-b border-red-100 py-6 px-8">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 rotate-12">
								<AlertTriangle class="w-6 h-6" />
							</div>
							<div>
								<Card.Title class="text-[17px] font-black text-red-700 uppercase tracking-tighter">Danger Zone</Card.Title>
								<Card.Description class="text-red-500/70 text-[11px] font-bold">Irreversible actions and system resets</Card.Description>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="flex flex-col">
							<div class="p-6 px-8 border-b border-red-50 flex items-center justify-between group transition-colors hover:bg-red-50/40">
								<div class="flex flex-col gap-1">
									<span class="text-[14px] font-bold text-red-800">Purge Orphaned Media</span>
									<p class="text-[12px] text-red-600/60 max-w-md">Permanently delete R2 files not attached to any question. Frees storage immediately.</p>
								</div>
								<Button variant="outline" class="h-10 px-6 border-red-200 text-red-600 hover:bg-red-100 font-bold text-[12px]" onclick={() => triggerAction("Purge orphaned media from R2")}>Purge Now</Button>
							</div>

							<div class="p-6 px-8 border-b border-red-50 flex items-center justify-between group transition-colors hover:bg-red-50/40">
								<div class="flex flex-col gap-1">
									<span class="text-[14px] font-bold text-red-800">Clear Question Cache</span>
									<p class="text-[12px] text-red-600/60 max-w-md">Wipe in-memory cache. Platform will re-build from Postgres on next request.</p>
								</div>
								<Button variant="outline" class="h-10 px-6 border-red-200 text-red-600 hover:bg-red-100 font-bold text-[12px]" onclick={() => triggerAction("Clear question cache")}>Clear Cache</Button>
							</div>

							<div class="p-6 px-8 border-b border-red-50 flex items-center justify-between group transition-colors hover:bg-red-50/40">
								<div class="flex flex-col gap-1">
									<span class="text-[14px] font-bold text-red-800">Reset Platform Statistics</span>
									<p class="text-[12px] text-red-600/60 max-w-md">Zero out all aggregated analytics counters. Raw session data is preserved.</p>
								</div>
								<Button variant="outline" class="h-10 px-6 border-red-200 text-red-600 hover:bg-red-100 font-bold text-[12px]" onclick={() => triggerAction("Reset platform statistics")}>Reset Stats</Button>
							</div>

							<div class="p-8 px-8 bg-red-100/30 flex items-center justify-between border-t border-red-100">
								<div class="flex items-center gap-4">
									<div class="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
										<AlertOctagon class="w-5 h-5" />
									</div>
									<div class="flex flex-col gap-0.5">
										<span class="text-[14px] font-black text-red-600 uppercase tracking-tight">Wipe ALL Question Bank Data</span>
										<p class="text-[12px] text-red-700/70 font-medium">Permanently delete every question, option and exam assignment. This CANNOT be undone.</p>
									</div>
								</div>
								<Button class="h-12 px-8 bg-red-600 hover:bg-red-700 text-white font-black text-[13px] shadow-lg shadow-red-500/20" onclick={() => triggerAction("Wipe ALL question bank data")}>DANGER: WIPE DATABASE</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- NOTIFICATIONS SECTION -->
			{#if activeSection === 'notifications'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-[14px] font-bold text-slate-800">Notification Settings</Card.Title>
							<Card.Description class="text-[11px]">Admin alerts and student notification defaults</Card.Description>
						</div>
						<Badge class="bg-red-50 text-red-600 border-red-100 font-bold text-[10px] px-3">Notification Settings</Badge>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="px-6 pt-6">
							<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11] mb-4">Admin Notification Matrix</h4>
						</div>
						<div class="overflow-x-auto">
							<table class="w-full text-left border-collapse">
								<thead class="bg-slate-50/50 border-y border-slate-100">
									<tr>
										<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Event</th>
										<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">In-App</th>
										<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Email</th>
										<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">SMS</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-50">
									{#each ['New user registration', 'Bulk import completed', 'System error / 5xx', 'Credit payment failed', 'Database backup completed'] as event}
										<tr class="hover:bg-slate-50/50 transition-colors">
											<td class="px-6 py-4 text-[13px] font-medium text-slate-700">{event}</td>
											<td class="px-6 py-4 text-center"><Switch class="mx-auto scale-75" checked onCheckedChange={markDirty} /></td>
											<td class="px-6 py-4 text-center"><Switch class="mx-auto scale-75" checked onCheckedChange={markDirty} /></td>
											<td class="px-6 py-4 text-center"><Switch class="mx-auto scale-75" onCheckedChange={markDirty} /></td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<div class="p-6 flex flex-col gap-4 border-t border-slate-100 mt-6">
							<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Student Notification Defaults</h4>
							<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
								<div class="flex flex-col gap-0.5">
									<span class="text-[13px] font-bold text-slate-800">Welcome Email</span>
									<p class="text-[11px] text-slate-500">Send login instructions to new students.</p>
								</div>
								<Switch checked onCheckedChange={markDirty} />
							</div>
							<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
								<div class="flex flex-col gap-0.5">
									<span class="text-[13px] font-bold text-slate-800">Low Credits Warning</span>
									<p class="text-[11px] text-slate-500">Notify students when credits fall below 20.</p>
								</div>
								<Switch checked onCheckedChange={markDirty} />
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- DATABASE SECTION -->
			{#if activeSection === 'database'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-[14px] font-bold text-slate-800">PostgreSQL Database</Card.Title>
							<Card.Description class="text-[11px]">System storage and health metrics</Card.Description>
						</div>
						<Badge class="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] px-3">Operational</Badge>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-6">
						<div class="grid gap-6">
							<div class="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-4">
								<div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
									<Database class="w-5 h-5 text-emerald-600" />
								</div>
								<div class="flex-1 grid grid-cols-4 gap-4">
									<div class="flex flex-col">
										<span class="text-[9px] font-black text-emerald-700/60 uppercase">Uptime</span>
										<span class="text-[13px] font-bold text-emerald-800">99.98%</span>
									</div>
									<div class="flex flex-col">
										<span class="text-[9px] font-black text-emerald-700/60 uppercase">Latency</span>
										<span class="text-[13px] font-bold text-emerald-800">12ms</span>
									</div>
									<div class="flex flex-col">
										<span class="text-[9px] font-black text-emerald-700/60 uppercase">Users</span>
										<span class="text-[13px] font-bold text-emerald-800">{(data.kpiTotals?.totalUsers ?? 0).toLocaleString()}</span>
									</div>
									<div class="flex flex-col">
										<span class="text-[9px] font-black text-emerald-700/60 uppercase">Questions</span>
										<span class="text-[13px] font-bold text-emerald-800">{(data.kpiTotals?.totalQuestions ?? 0).toLocaleString()}</span>
									</div>
								</div>
							</div>

							<div class="grid gap-5">
								<div class="grid gap-1.5">
									<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Connection String (DATABASE_URL)</Label>
									<div class="relative">
										<Input bind:value={settings.database.url} oninput={markDirty} type="password" class="h-10 text-[13px] font-mono pr-10" />
										<button class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600" onclick={() => copyToClipboard(settings.database.url)}>
											<Copy class="w-4 h-4" />
										</button>
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Max Connections</Label>
										<Input type="number" bind:value={settings.database.maxConnections} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timeout (ms)</Label>
										<Input type="number" bind:value={settings.database.timeout} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
								</div>
								
								<Separator />

								<div class="grid gap-4">
									<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Backup & Maintenance</h4>
									<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
										<div class="flex flex-col gap-0.5">
											<span class="text-[13px] font-bold text-slate-800">Automated Daily Backups</span>
											<p class="text-[11px] text-slate-500">Backup full DB every 24h. Retain last 30 days.</p>
										</div>
										<Switch bind:checked={settings.database.autoBackup} onCheckedChange={markDirty} />
									</div>
									<div class="grid grid-cols-2 gap-4">
										<div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
											<span class="text-[10px] font-bold text-slate-400 uppercase">Last Backup</span>
											<span class="text-[12px] font-bold text-slate-600">Today, 02:00 AM</span>
										</div>
										<div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
											<span class="text-[10px] font-bold text-slate-400 uppercase">Next Backup</span>
											<span class="text-[12px] font-bold text-slate-600">Tomorrow, 02:00 AM</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card.Content>
					<Card.Footer class="bg-slate-50/50 py-3 px-6 flex justify-between border-t border-slate-100">
						<Button size="sm" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8" onclick={() => triggerAction("Manual backup trigger")}>Trigger Backup Now</Button>
						<Button variant="ghost" size="sm" class="text-[12px] font-bold text-emerald-600 hover:bg-emerald-100 h-8" onclick={handleSave}>Apply DB Settings</Button>
					</Card.Footer>
				</Card.Root>
			{/if}

			<!-- API & WEBHOOKS SECTION -->
			{#if activeSection === 'api'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-[14px] font-bold text-slate-800">API Keys & Webhooks</Card.Title>
							<Card.Description class="text-[11px]">External integration access points</Card.Description>
						</div>
						<Button size="sm" class="h-8 bg-[#3B6D11] hover:bg-[#2d540d] text-white font-bold text-[11px]" onclick={() => triggerAction("Generate new API key")}>
							<Plus class="w-3.5 h-3.5 mr-1" /> New Key
						</Button>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-8">
						<div class="grid gap-6">
							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Active API Keys</h4>
								<div class="grid gap-3">
									{#each settings.api.keys as key, i}
										<div class="p-4 rounded-xl border border-slate-100 bg-slate-50/30 flex items-center justify-between group transition-all hover:bg-white hover:shadow-md">
											<div class="flex flex-col gap-1">
												<div class="flex items-center gap-2">
													<span class="text-[13px] font-bold text-slate-800">{key.name}</span>
													<Badge variant="outline" class="text-[8px] h-4 px-1.5 font-bold uppercase tracking-widest border-slate-200">sk_live</Badge>
												</div>
												<p class="text-[10px] text-slate-400 font-medium">Created {key.created} • Last used {key.last}</p>
											</div>
											<div class="flex items-center gap-3">
												<code class="text-[11px] font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden group-hover:block">{key.key}</code>
												<div class="flex items-center gap-1">
													<Button variant="ghost" size="icon" class="w-8 h-8 text-slate-400 hover:text-slate-600" onclick={() => copyToClipboard(key.key)}>
														<Copy class="w-3.5 h-3.5" />
													</Button>
													<Button variant="ghost" size="icon" class="w-8 h-8 text-red-300 hover:text-red-500 hover:bg-red-50" onclick={() => triggerAction(`Revoke key ${key.name}`)}>
														<Trash2 class="w-3.5 h-3.5" />
													</Button>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<div class="flex items-center justify-between">
									<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Webhooks</h4>
									<div class="flex items-center gap-2">
										<Input placeholder="https://your-server.com/webhook" class="h-8 text-[11px] w-64" />
										<Button size="sm" class="h-8 bg-slate-800 hover:bg-black text-white font-bold text-[11px]">ADD</Button>
									</div>
								</div>
								<div class="grid gap-2">
									{#each settings.api.webhooks as hook, i}
										<div class="p-3 pr-4 rounded-xl border border-slate-100 bg-slate-50/30 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all group">
											<div class="flex items-center gap-4 flex-1 min-w-0">
												<div class="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
													<Terminal class="w-4 h-4" />
												</div>
												<div class="flex flex-col gap-0.5 min-w-0">
													<span class="text-[12px] font-mono text-blue-600 truncate">{hook.url}</span>
													<span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Events: {hook.events}</span>
												</div>
											</div>
											<div class="flex items-center gap-4">
												<Badge class="text-[9px] font-black uppercase tracking-widest {hook.status === 'ok' ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-red-50 text-red-600'}">
													{hook.status === 'ok' ? 'Active' : 'Failing'}
												</Badge>
												<button class="text-slate-300 hover:text-red-500 transition-colors p-1" onclick={() => { settings.api.webhooks.splice(i, 1); markDirty(); }}>
													<Trash2 class="w-4 h-4" />
												</button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- EMAIL & SMS SECTION -->
			{#if activeSection === 'email'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
						<Card.Title class="text-[14px] font-bold text-slate-800">Email & SMS Integration</Card.Title>
						<Card.Description class="text-[11px]">Communication gateway configuration</Card.Description>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-8">
						<div class="grid gap-6">
							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">SMTP Configuration (Email)</h4>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SMTP Host</Label>
										<Input bind:value={settings.email.smtp.host} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Port</Label>
										<Input type="number" bind:value={settings.email.smtp.port} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Username</Label>
										<Input bind:value={settings.email.smtp.user} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</Label>
										<Input type="password" bind:value={settings.email.smtp.pass} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sender Name</Label>
										<Input bind:value={settings.email.from.name} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sender Email</Label>
										<Input type="email" bind:value={settings.email.from.email} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">SMS Gateway (Termii)</h4>
								<div class="grid grid-cols-2 gap-4">
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Provider</Label>
										<Input bind:value={settings.email.sms.provider} oninput={markDirty} class="h-10 text-[13px]" />
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sender ID</Label>
										<Input bind:value={settings.email.sms.senderId} oninput={markDirty} maxlength="11" class="h-10 text-[13px] font-black tracking-widest shadow-inner bg-slate-50/50" />
									</div>
								</div>
								<div class="grid gap-1.5">
									<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">API API Key</Label>
									<Input type="password" bind:value={settings.email.sms.key} oninput={markDirty} class="h-10 text-[13px] font-mono" />
								</div>
							</div>
						</div>
					</Card.Content>
					<Card.Footer class="bg-slate-50/50 py-3 px-6 flex justify-between border-t border-slate-100">
						<Button variant="outline" size="sm" class="h-8 text-[11px] font-bold text-slate-600 border-slate-200" onclick={() => triggerAction("Send test email")}>Test Email</Button>
						<Button size="sm" class="bg-[#3B6D11] hover:bg-[#2d540d] text-white font-bold h-8" onclick={handleSave}>Save Config</Button>
					</Card.Footer>
				</Card.Root>
			{/if}

			<!-- APPEARANCE SECTION -->
			{#if activeSection === 'appearance'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
						<Card.Title class="text-[14px] font-bold text-slate-800">Admin Panel Appearance</Card.Title>
						<Card.Description class="text-[11px]">Your personal preferences and workspace options</Card.Description>
					</Card.Header>
					<Card.Content class="p-6 flex flex-col gap-8">
						<div class="grid gap-6">
							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Interface Theme</h4>
								<div class="grid grid-cols-3 gap-4">
									{#each [{id: 'light', label: 'Light', icon: '☀'}, {id: 'dark', label: 'Dark', icon: '🌙'}, {id: 'system', label: 'System', icon: '⚙'}] as theme}
										<button 
											onclick={() => { settings.appearance.theme = theme.id; markDirty(); }}
											class="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 {settings.appearance.theme === theme.id ? 'bg-[#EAF3DE] border-[#3B6D11] shadow-md scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300'}"
										>
											<span class="text-3xl">{theme.icon}</span>
											<span class="text-[13px] font-bold {settings.appearance.theme === theme.id ? 'text-[#3B6D11]' : 'text-slate-600'}">{theme.label}</span>
										</button>
									{/each}
								</div>
							</div>

							<Separator />

							<div class="grid gap-4">
								<h4 class="text-[10px] font-black uppercase tracking-widest text-[#3B6D11]">Display Preferences</h4>
								<div class="grid gap-3">
									<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
										<div class="flex flex-col gap-0.5">
											<span class="text-[13px] font-bold text-slate-800">Compact Sidebar</span>
											<p class="text-[11px] text-slate-500">Collapse sidebar to icons only to maximize area.</p>
										</div>
										<Switch bind:checked={settings.appearance.compactSidebar} onCheckedChange={markDirty} />
									</div>
									<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
										<div class="flex flex-col gap-0.5">
											<span class="text-[13px] font-bold text-slate-800">Live Activity Feed</span>
											<p class="text-[11px] text-slate-500">Show real-time events on the dashboard home.</p>
										</div>
										<Switch bind:checked={settings.appearance.liveActivity} onCheckedChange={markDirty} />
									</div>
									<div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
										<div class="flex flex-col gap-0.5">
											<span class="text-[13px] font-bold text-slate-800">Confirm Destructive Actions</span>
											<p class="text-[11px] text-slate-500">Show confirmation prompt before question deletion.</p>
										</div>
										<Switch bind:checked={settings.appearance.confirmDelete} onCheckedChange={markDirty} />
									</div>
								</div>

								<div class="grid gap-1.5 mt-2">
									<Label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Default Table Rows</Label>
									<div class="flex bg-slate-100/50 p-1 rounded-xl w-fit border border-slate-200">
										{#each [10, 12, 20, 50] as count}
											<button 
												onclick={() => { settings.appearance.rowsPerPage = count; markDirty(); }}
												class="px-4 py-1.5 text-[11px] font-black rounded-lg transition-all {settings.appearance.rowsPerPage === count ? 'bg-white text-[#3B6D11] shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
											>
												{count}
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- ADMIN ACCOUNTS SECTION -->
			{#if activeSection === 'admins'}
				<Card.Root class="border-slate-200 shadow-sm overflow-hidden">
					<Card.Header class="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-[14px] font-bold text-slate-800">Admin Accounts</Card.Title>
							<Card.Description class="text-[11px]">Manage team access and permissions</Card.Description>
						</div>
						<Button size="sm" class="h-8 bg-[#3B6D11] hover:bg-[#2d540d] text-white font-bold text-[11px]" onclick={() => triggerAction("Invite new admin")}>
							<Plus class="w-3.5 h-3.5 mr-1" /> Invite Admin
						</Button>
					</Card.Header>
					<Card.Content class="p-0">
						<table class="w-full text-left border-collapse">
							<thead class="bg-slate-50/50 border-y border-slate-100">
								<tr>
									<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Admin</th>
									<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
									<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Login</th>
									<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
									<th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-50">
								{#each (data.adminEmails ?? []).map((e, i) => ({ name: e.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email: e, role: i === 0 ? 'Super Admin' : 'Admin', last: 'N/A', status: 'Active', you: i === 0 })) as admin}
									<tr class="hover:bg-slate-50/50 transition-colors group">
										<td class="px-6 py-4">
											<div class="flex items-center gap-3">
												<div class="w-9 h-9 rounded-full bg-[#0C447C] flex items-center justify-center text-white font-black text-[11px] shadow-sm">
													{admin.name.split(' ').map(n=>n[0]).join('')}
												</div>
												<div class="flex flex-col">
													<div class="flex items-center gap-2">
														<span class="text-[13px] font-bold text-slate-800">{admin.name}</span>
														{#if admin.you}<Badge class="bg-[#EAF3DE] text-[#3B6D11] border-none text-[8px] h-3.5 font-black uppercase px-1.5">YOU</Badge>{/if}
													</div>
													<span class="text-[11px] text-slate-400 font-medium">{admin.email}</span>
												</div>
											</div>
										</td>
										<td class="px-6 py-4">
											<Badge variant="outline" class="text-[10px] font-bold border-slate-200 text-slate-600 bg-white">
												{admin.role}
											</Badge>
										</td>
										<td class="px-6 py-4 text-[12px] font-medium text-slate-400">{admin.last}</td>
										<td class="px-6 py-4">
											<div class="flex items-center gap-1.5">
												<div class="w-1.5 h-1.5 rounded-full bg-[#3B6D11]"></div>
												<span class="text-[12px] font-bold text-slate-700">{admin.status}</span>
											</div>
										</td>
										<td class="px-6 py-4 text-right">
											{#if !admin.you}
												<div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<Button variant="ghost" size="icon" class="w-8 h-8 text-slate-400 hover:text-slate-600">
														<SettingsIcon class="w-3.5 h-3.5" />
													</Button>
													<Button variant="ghost" size="icon" class="w-8 h-8 text-red-300 hover:text-red-500">
														<Trash2 class="w-3.5 h-3.5" />
													</Button>
												</div>
											{:else}
												<span class="text-[10px] text-slate-300 font-bold uppercase mr-4">Master</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</Card.Content>
				</Card.Root>
			{/if}

			{#if !['general', 'branding', 'credits', 'scoring', 'storage', 'danger', 'notifications', 'database', 'api', 'email', 'appearance', 'admins'].includes(activeSection)}
				<Card.Root class="border-slate-200 shadow-sm border-dashed bg-slate-50/30">
					<Card.Content class="p-20 flex flex-col items-center justify-center text-center gap-4">
						<div class="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-slate-300">
							<Terminal class="w-8 h-8" />
						</div>
						<div>
							<h3 class="text-[16px] font-bold text-slate-700">{sections.find(s => s.id === activeSection)?.label} module is under construction</h3>
							<p class="text-[12px] text-slate-400 font-medium max-w-xs mx-auto">This sub-module is being migrated to the new administrative visual system. Available in early access soon.</p>
						</div>
						<Button variant="outline" size="sm" class="bg-white border-slate-200 text-[11px] font-bold" onclick={() => activeSection = 'general'}>Return to General</Button>
					</Card.Content>
				</Card.Root>
			{/if}

		</div>
	</div>
</div>

<Confirmation
	bind:open={showConfirmModal}
	title={confirmAction.title}
	description={confirmAction.description}
	confirmText="Proceed"
	cancelText="Cancel"
	icon={AlertTriangle}
	iconColorClass="text-red-500"
	iconBgClass="bg-red-50"
	onConfirm={confirmAction.onConfirm}
/>

<style>
	:global(body) {
		background-color: #f8f9fc;
	}
	
	/* Interactive elements transitions */
	:global(input), :global(button), :global(select) {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.lucide) {
		stroke-width: 1.5;
	}
</style>
