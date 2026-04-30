<script lang="ts">
	import {
		User,
		Lock,
		Activity,
		History,
		Smartphone,
		Laptop,
		Tablet,
		CheckCircle2,
		XCircle,
		FileText,
		Settings,
		Shield,
		Edit2,
		QrCode,
		AlertTriangle,
		Trash2,
		Image as ImageIcon,
		MapPin,
	} from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import Confirmation from "$lib/components/Confirmation.svelte";
	import Empty from "$lib/components/Empty.svelte";

	let { data } = $props();

	let activeTab = $state("personal");

	// svelte-ignore state_referenced_locally
	let profile = $state(data.profile);

	let security = $state({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
		twoFactorEnabled: false,
		totpCode: "",
	});

	let passwordScore = $derived(() => {
		let score = 0;
		const v = security.newPassword;
		if (v.length >= 8) score++;
		if (/[A-Z]/.test(v)) score++;
		if (/[0-9]/.test(v)) score++;
		if (/[^A-Za-z0-9]/.test(v)) score++;
		return score;
	});

	const getStrengthColor = (score: number) => {
		const colors = [
			"bg-[#E24B4A]",
			"bg-[#BA7517]",
			"bg-[#639922]",
			"bg-[#3B6D11]",
		];
		return score > 0 ? colors[score - 1] : "bg-slate-200";
	};

	const getStrengthLabel = (score: number) => {
		const labels = ["Weak", "Fair", "Good", "Strong"];
		return score > 0 ? labels[score - 1] : "Enter a new password";
	};

	let showConfirmModal = $state(false);
	let confirmAction = $state({
		title: "",
		description: "",
		onConfirm: () => {},
	});

	const triggerDelete = () => {
		confirmAction = {
			title: "Delete admin account",
			description:
				"Permanently delete this admin account. All content you've created (questions, subjects) will remain on the platform but will no longer be attributed to you. This action cannot be undone.",
			onConfirm: () => {
				showConfirmModal = false;
				console.log("Account deleted");
			},
		};
		showConfirmModal = true;
	};

	const triggerRevokeAll = () => {
		confirmAction = {
			title: "Revoke All Sessions",
			description:
				"Are you sure you want to sign out from all other devices? You will remain signed in on this current device.",
			onConfirm: () => {
				showConfirmModal = false;
				console.log("Sessions revoked");
			},
		};
		showConfirmModal = true;
	};

	const iconMapping: Record<string, any> = {
		laptop: Laptop,
		smartphone: Smartphone,
		tablet: Tablet,
		shield: Shield,
		question: FileText,
		media: ImageIcon,
		auth: Lock,
		settings: Settings
	};

	const activityStyles: Record<string, { bg: string; tc: string }> = {
		question: { bg: "bg-[#EAF3DE]", tc: "text-[#3B6D11]" },
		media: { bg: "bg-[#EEEDFE]", tc: "text-[#534AB7]" },
		auth: { bg: "bg-[#E6F1FB]", tc: "text-[#185FA5]" },
		settings: { bg: "bg-slate-100", tc: "text-slate-500" }
	};

	// svelte-ignore state_referenced_locally
	let sessions = $state(data.sessions);

	let fileInput: HTMLInputElement;

	function handleFileSelect(e: any) {
		const file = e.target.files[0];
		if (file) {
			console.log(file);
		}
	}
</script>

<div class="flex flex-col gap-6 max-w-6xl mx-auto w-full">
	<!-- Top Bar Local Actions -->
	<div class="flex items-center justify-between pb-2">
		<div>
			<h2
				class="text-[18px] font-bold text-slate-800 tracking-tight leading-tight"
			>
				My Profile
			</h2>
			<p class="text-[12px] text-slate-500">
				Manage your admin account, security and activity
			</p>
		</div>
		<div class="flex items-center gap-3">
			<Button variant="outline" class="h-9 font-bold text-[12px] text-slate-600 bg-white shadow-sm hover:bg-slate-50 border-slate-200">
				View public profile
			</Button>
			<Button class="h-9 font-bold text-[12px] text-white bg-brand hover:bg-brand-dark shadow-sm">
				Save changes
			</Button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
		<!-- LEFT COLUMN -->
		<div class="flex flex-col gap-6">
			<!-- Identity Card -->
			<Card.Root class="border-slate-200 shadow-sm overflow-hidden bg-white">
				<Card.Content class="p-0">
					<!-- Avatar & Info -->
					<div class="p-6 text-center flex flex-col items-center">
						<div class="relative mb-3 group/avatar">
							<div
								class="w-24 h-24 rounded-full bg-[#0C447C] flex items-center justify-center text-white font-black text-3xl shadow-md border-4 border-white cursor-pointer hover:opacity-90 transition-opacity"
							>
								{profile.firstName[0] || "A"}{profile.lastName[0] || "D"}
							</div>
							<button
								onclick={() => fileInput.click()}
								class="absolute bottom-1 right-1 w-8 h-8 bg-brand border-2 border-white rounded-full flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
								title="Change avatar"
							>
								<Edit2 class="w-3.5 h-3.5" />
							</button>
							<input
								bind:this={fileInput}
								type="file"
								accept="image/*"
								class="hidden"
								onchange={handleFileSelect}
							/>
						</div>

						<h3
							class="text-[18px] font-bold text-slate-800 leading-tight mb-0.5"
						>
							{profile.firstName}
							{profile.lastName}
						</h3>
						<p class="text-[12px] font-medium text-slate-400">{profile.role}</p>
						<p class="text-[13px] font-medium text-brand mt-1">
							{profile.email}
						</p>

						<div class="flex flex-wrap gap-1.5 justify-center mt-3.5">
							<Badge
								class="bg-brand/10 text-brand-dark hover:bg-brand/15 border-none font-bold text-[9px] uppercase px-2 h-5"
								>Super Admin</Badge
							>
							<Badge
								class="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold text-[9px] uppercase px-2 h-5"
								>Active</Badge
							>
							<Badge
								class="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none font-bold text-[9px] uppercase px-2 h-5"
								>Since Jan 2024</Badge
							>
						</div>
					</div>

					<Separator class="bg-slate-100" />

					<!-- Stats Grid -->
					<div class="p-5 bg-slate-50/50">
						<div class="grid grid-cols-3 gap-2">
							<div
								class="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:border-brand/30 transition-colors"
							>
								<span class="text-[16px] font-extrabold text-brand">{data.kpiTotals?.totalQuestions?.toLocaleString() ?? '—'}</span>
								<span
									class="text-[9px] font-black uppercase text-slate-400 mt-1"
									>Questions</span
								>
							</div>
							<div
								class="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:border-brand/30 transition-colors"
							>
								<span class="text-[16px] font-extrabold text-brand-dark">{data.kpiTotals?.totalMedia?.toLocaleString() ?? '—'}</span>
								<span
									class="text-[9px] font-black uppercase text-slate-400 mt-1"
									>Media</span
								>
							</div>
							<div
								class="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:border-brand/30 transition-colors"
							>
								<span class="text-[16px] font-extrabold text-[#854F0B]">{data.activityData?.length?.toLocaleString() ?? '—'}</span>
								<span
									class="text-[9px] font-black uppercase text-slate-400 mt-1"
									>Actions</span
								>
							</div>
						</div>
						<p
							class="text-[11px] font-medium text-slate-400 text-center mt-3 pt-1"
						>
							Last login: Today at 9:14 AM · Lagos, Nigeria
						</p>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Active Sessions -->
			<Card.Root class="border-slate-200 shadow-sm overflow-hidden bg-white">
				<Card.Header
					class="px-5 py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0"
				>
					<Card.Title class="text-[14px] font-bold text-slate-800"
						>Active sessions</Card.Title
					>
					<Button
						variant="ghost"
						class="h-6 w-auto px-2 py-0 text-[10px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 uppercase tracking-widest bg-red-50/50"
						onclick={triggerRevokeAll}
					>
						Revoke All
					</Button>
				</Card.Header>
				<Card.Content class="p-5 flex flex-col gap-3">
					{#each sessions as session (session.id)}
						<div
							class="flex items-center gap-3 p-3 rounded-xl border {session.current
								? 'border-brand/30 bg-brand/5'
								: 'border-slate-100 bg-slate-50/50 hover:bg-white transition-colors'}"
						>
							<div
								class="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 text-slate-500 shadow-sm shrink-0"
							>
								{#if session.iconType && iconMapping[session.iconType]}
									{@const Icon = iconMapping[session.iconType]}
									<Icon class="w-4 h-4" />
								{:else}
									<Laptop class="w-4 h-4" />
								{/if}
							</div>
							<div class="flex flex-col min-w-0 flex-1">
								<div class="flex items-center gap-2 truncate">
									<h4 class="text-[12px] font-bold text-slate-800 truncate">
										{session.name}
									</h4>
									{#if session.current}
										<Badge
											class="bg-[#EAF3DE] text-[#3B6D11] border-none text-[8px] font-black px-1.5 h-3.5 leading-none shrink-0 uppercase tracking-widest"
											>Current</Badge
										>
									{/if}
								</div>
								<p
									class="text-[11px] text-slate-400 font-medium truncate mt-0.5"
								>
									{session.loc}
								</p>
							</div>
							<div
								class="shrink-0 text-right flex flex-col items-end justify-center"
							>
								{#if session.current}
									<span class="text-[11px] font-bold text-brand px-2"
										>{session.time}</span
									>
								{:else}
									<span class="text-[11px] font-medium text-slate-400 px-2 mb-1"
										>{session.time}</span
									>
									<button
										class="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
										>Revoke</button
									>
								{/if}
							</div>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- RIGHT COLUMN -->
		<div class="flex flex-col gap-6">
			<Card.Root class="border-slate-200 shadow-sm overflow-hidden bg-white">
				<Card.Header class="px-7 py-5 border-b border-slate-100">
					<Card.Title class="text-[16px] font-bold text-slate-800">
						{#if activeTab === "personal"}Personal information
						{:else if activeTab === "security"}Security & access
						{:else if activeTab === "activity"}Activity log
						{:else if activeTab === "logins"}Login history{/if}
					</Card.Title>
					<Card.Description class="text-[12px]">
						{#if activeTab === "personal"}Admin account details
						{:else if activeTab === "security"}Password, 2FA & danger zone
						{:else if activeTab === "activity"}All admin actions
						{:else if activeTab === "logins"}Recent login attempts{/if}
					</Card.Description>
				</Card.Header>

				<Card.Content class="p-7">
					<!-- Tabs Navigation -->
					<div
						class="flex items-center gap-1.5 p-1 bg-slate-100/70 border border-slate-200/60 rounded-xl mb-8"
					>
						{#each [{ id: "personal", label: "Personal info", icon: User }, { id: "security", label: "Security", icon: Shield }, { id: "activity", label: "Activity log", icon: Activity }, { id: "logins", label: "Login history", icon: History }] as tab}
							<button
								onclick={() => (activeTab = tab.id)}
								class="flex items-center justify-center gap-2 flex-1 h-9 text-[12px] font-bold rounded-lg transition-all {activeTab ===
								tab.id
									? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
									: 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/30'}"
							>
								<tab.icon class="w-3.5 h-3.5" stroke-width={2.5} />
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- TAB CONTENT: Personal Info -->
					{#if activeTab === "personal"}
						<div class="flex flex-col gap-5 animate-in fade-in duration-300">
							<div class="grid grid-cols-2 gap-5">
								<div class="grid gap-1.5">
									<Label
										class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
										>First name</Label
									>
									<Input
										bind:value={profile.firstName}
										class="h-10 text-[13px] font-medium"
									/>
								</div>
								<div class="grid gap-1.5">
									<Label
										class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
										>Last name</Label
									>
									<Input
										bind:value={profile.lastName}
										class="h-10 text-[13px] font-medium"
									/>
								</div>
							</div>

							<div class="grid gap-1.5">
								<Label
									class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
									>Display name</Label
								>
								<Input
									bind:value={profile.displayName}
									class="h-10 text-[13px] font-medium"
								/>
							</div>

							<div class="grid grid-cols-2 gap-5">
								<div class="grid gap-1.5">
									<Label
										class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
										>Email address</Label
									>
									<Input
										bind:value={profile.email}
										type="email"
										class="h-10 text-[13px] font-medium"
									/>
								</div>
								<div class="grid gap-1.5">
									<Label
										class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
										>Phone number</Label
									>
									<Input
										bind:value={profile.phone}
										type="tel"
										class="h-10 text-[13px] font-medium"
									/>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-5">
								<div class="grid gap-1.5">
									<Label
										class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
										>Role</Label
									>
									<Input
										value={profile.role}
										readonly
										class="h-10 text-[13px] font-bold text-slate-500 bg-slate-50 border-dashed"
									/>
								</div>
								<div class="grid gap-1.5">
									<Label
										class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
										>Language</Label
									>
									<select
										bind:value={profile.language}
										class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									>
										<option value="English (en-NG)">English (en-NG)</option>
										<option value="English (en-GB)">English (en-GB)</option>
										<option value="English (en-US)">English (en-US)</option>
									</select>
								</div>
							</div>

							<div class="grid gap-1.5">
								<Label
									class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
									>Bio / Notes</Label
								>
								<Textarea
									bind:value={profile.bio}
									placeholder="Optional admin notes about this account…"
									class="min-h-[80px] text-[13px] font-medium"
								/>
							</div>

							<div class="pt-4 border-t border-slate-100 flex justify-end">
								<Button
									class="h-10 px-6 font-bold text-[13px] text-white bg-brand hover:bg-brand-dark shadow-sm"
								>
									Save personal info
								</Button>
							</div>
						</div>
					{/if}

					<!-- TAB CONTENT: Security -->
					{#if activeTab === "security"}
						<div class="flex flex-col gap-8 animate-in fade-in duration-300">
							<!-- Password -->
							<div class="flex flex-col gap-5">
								<h4
									class="text-[11px] font-black tracking-widest text-brand uppercase"
								>
									Change password
								</h4>
								<div class="grid gap-1.5">
									<Label class="text-[11px] font-bold text-slate-500 uppercase"
										>Current password</Label
									>
									<Input
										bind:value={security.currentPassword}
										type="password"
										placeholder="Enter current password"
										class="h-10 text-[13px] font-medium"
									/>
								</div>
								<div class="grid grid-cols-2 gap-5">
									<div class="grid gap-1.5">
										<Label
											class="text-[11px] font-bold text-slate-500 uppercase"
											>New password</Label
										>
										<Input
											bind:value={security.newPassword}
											type="password"
											placeholder="Minimum 8 characters"
											class="h-10 text-[13px] font-medium"
										/>

										<!-- Password strength visualizer -->
										<div class="flex flex-col gap-1.5 mt-1.5">
											<div class="flex items-center gap-1.5">
												{#each [1, 2, 3, 4] as index}
													<div
														class="h-1.5 flex-1 rounded-full transition-colors duration-300 {passwordScore() >=
														index
															? getStrengthColor(passwordScore())
															: 'bg-slate-100'}"
													></div>
												{/each}
											</div>
											<span
												class="text-[10px] font-bold {passwordScore() > 0
													? getStrengthColor(passwordScore()).replace(
															'bg-',
															'text-',
														)
													: 'text-slate-400'}"
											>
												{getStrengthLabel(passwordScore())}
											</span>
										</div>
									</div>
									<div class="grid gap-1.5">
										<Label
											class="text-[11px] font-bold text-slate-500 uppercase"
											>Confirm new password</Label
										>
										<Input
											bind:value={security.confirmPassword}
											type="password"
											placeholder="Repeat new password"
											class="h-10 text-[13px] font-medium"
										/>
									</div>
								</div>
								<div>
									<Button
										class="h-9 px-6 font-bold text-[12px] text-white bg-slate-800 hover:bg-black shadow-sm"
									>
										Update password
									</Button>
								</div>
							</div>

							<Separator class="bg-slate-100" />

							<!-- 2FA -->
							<div class="flex flex-col gap-4">
								<h4
									class="text-[11px] font-black tracking-widest text-brand uppercase"
								>
									Two-factor authentication
								</h4>
								<div
									class="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm"
								>
									<div class="flex items-center justify-between">
										<div class="flex flex-col gap-1 pr-6">
											<span class="text-[14px] font-bold text-slate-800"
												>Authenticator app (TOTP)</span
											>
											<p class="text-[12px] text-slate-500 leading-snug">
												Use Google Authenticator, Authy or any TOTP app to
												generate login codes. Strongly recommended for admin
												accounts.
											</p>
										</div>
										<Switch bind:checked={security.twoFactorEnabled} />
									</div>

									{#if security.twoFactorEnabled}
										<div
											class="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 items-start animate-in zoom-in-95 duration-200"
										>
											<div
												class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center flex flex-col items-center"
											>
												<p class="text-[12px] font-bold text-slate-600 mb-4">
													Scan this QR code with your authenticator app
												</p>
												<div
													class="w-32 h-32 bg-slate-800 rounded-xl mb-4 flex items-center justify-center"
												>
													<QrCode class="w-16 h-16 text-white" />
												</div>
												<p class="text-[11px] text-slate-500 mb-2">
													Or enter code manually:
												</p>
												<code
													class="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-[13px] font-mono font-black tracking-widest border border-slate-200"
													>JBSWY3DPEHPK3PXP</code
												>
											</div>
											<div class="flex flex-col justify-center h-full gap-4">
												<div class="grid gap-1.5">
													<Label
														class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
														>Verify 6-digit code</Label
													>
													<Input
														bind:value={security.totpCode}
														placeholder="e.g. 123456"
														maxlength={6}
														class="h-12 text-center text-[16px] font-mono font-black tracking-[0.5em] shadow-inner bg-slate-50/50"
													/>
												</div>
												<Button
													class="h-11 font-bold text-[13px] text-white bg-brand hover:bg-brand-dark w-full"
												>
													Verify & Enable 2FA
												</Button>
											</div>
										</div>
									{/if}
								</div>
							</div>

							<Separator class="bg-slate-100" />

							<!-- Danger Zone -->
							<div class="flex flex-col gap-4">
								<h4
									class="text-[11px] font-black tracking-widest text-[#A32D2D] uppercase flex items-center gap-1.5"
								>
									<AlertTriangle class="w-3.5 h-3.5" /> Danger zone
								</h4>
								<div
									class="p-5 border border-red-200 bg-red-50/30 rounded-2xl flex items-center justify-between"
								>
									<div class="flex flex-col gap-1 pr-10">
										<span class="text-[14px] font-bold text-red-800"
											>Delete admin account</span
										>
										<p class="text-[12px] text-red-700/80 leading-snug">
											Permanently delete this admin account. All content you've
											created will remain on the platform but will no longer be
											attributed to you.
										</p>
									</div>
									<Button
										variant="outline"
										class="shrink-0 h-10 px-5 border-red-200 text-red-700 hover:bg-red-100 bg-white shadow-sm font-bold text-[12px]"
										onclick={triggerDelete}
									>
										Delete Account Permanently
									</Button>
								</div>
							</div>
						</div>
					{/if}

					<!-- TAB CONTENT: Activity Log -->
					{#if activeTab === "activity"}
						<div class="flex flex-col gap-6 animate-in fade-in duration-300">
							<!-- Filters -->
							<div class="flex items-center gap-3">
								<select
									class="flex h-9 w-[180px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-brand"
								>
									<option value="">All actions</option>
									<option value="question">Questions</option>
									<option value="media">Media</option>
									<option value="user">Users</option>
									<option value="settings">Settings</option>
									<option value="auth">Authentication</option>
								</select>
								<select
									class="flex h-9 w-[160px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-brand"
								>
									<option>Last 30 days</option>
									<option>Last 7 days</option>
									<option>Last 90 days</option>
								</select>
							</div>

							<!-- Timeline -->
							<div class="flex flex-col divide-y divide-slate-100">
								{#each data.activityData as log}
									{@const styles = activityStyles[log.type] || activityStyles.settings}
									{@const Icon = iconMapping[log.type] || iconMapping.settings}
									<div
										class="py-4 flex gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg -mx-2"
									>
										<div
											class="w-10 h-10 rounded-xl {styles.bg} {styles.tc} flex items-center justify-center shrink-0 border border-white shadow-sm"
										>
											<Icon class="w-4 h-4" />
										</div>
										<div
											class="flex flex-col min-w-0 flex-1 justify-center gap-0.5"
										>
											<h4 class="text-[13px] font-bold text-slate-800">
												{log.title}
											</h4>
											<p
												class="text-[12px] text-slate-500 font-medium truncate"
											>
												{log.desc}
											</p>
										</div>
										<div class="shrink-0 flex items-start pt-1">
											<span
												class="text-[11px] font-medium text-slate-400 whitespace-nowrap"
												>{log.time}</span
											>
										</div>
									</div>
								{:else}
									<div class="py-8">
										<Empty title="No activity" message="No activity recorded yet." icon={Activity} compact={true} />
									</div>
								{/each}
							</div>

							<div class="flex justify-center pt-2">
								<Button
									variant="outline"
									class="h-9 font-bold text-[12px] text-slate-600 bg-white border-slate-200 shadow-sm"
								>
									Load more activity
								</Button>
							</div>
						</div>
					{/if}

					<!-- TAB CONTENT: Login History -->
					{#if activeTab === "logins"}
						<div class="flex flex-col gap-5 animate-in fade-in duration-300">
							<div
								class="bg-brand/5 border border-brand/10 rounded-xl p-3 px-4 flex items-center gap-3 text-brand-dark"
							>
								<Activity class="w-4 h-4 shrink-0" stroke-width={2.5} />
								<span class="text-[12px] font-bold"
									>Showing the last 20 login attempts to your admin account.</span
								>
							</div>

							<div class="flex flex-col divide-y divide-slate-100">
								{#each data.loginData as login}
									{@const Icon = iconMapping[login.iconType] || iconMapping.shield}
									<div
										class="py-3 flex items-center gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg -mx-2 group"
									>
										<div
											class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all"
										>
											<Icon class="w-4 h-4" />
										</div>
										<div class="flex flex-col min-w-0 flex-1 gap-0.5">
											<div class="flex items-center gap-2">
												<h4 class="text-[13px] font-bold text-slate-800">
													{login.device}
												</h4>
												{#if login.current}
													<Badge
														class="bg-[#EAF3DE] text-[#3B6D11] border-none text-[8px] font-black px-1.5 h-3.5 leading-none shrink-0 uppercase tracking-widest"
														>Current</Badge
													>
												{/if}
											</div>
											<div
												class="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"
											>
												<MapPin class="w-3 h-3" />
												<span>{login.loc} · {login.ip}</span>
											</div>
										</div>
										<div class="shrink-0 flex flex-col items-end gap-1">
											<span class="text-[11px] font-medium text-slate-500"
												>{login.time}</span
											>
											<span
												class="text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider {login.success
													? 'text-[#3B6D11]'
													: 'text-red-600'}"
											>
												{#if login.success}
													<CheckCircle2 class="w-3 h-3" /> Success
												{:else}
													<XCircle class="w-3 h-3" /> Failed
												{/if}
											</span>
										</div>
									</div>
								{:else}
									<div class="py-8">
										<Empty title="No login history" message="No logins recorded." icon={Lock} compact={true} />
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
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
	confirmBtnClass="bg-red-600 hover:bg-red-700 text-white shadow-sm"
	onConfirm={confirmAction.onConfirm}
/>

<style>
	/* Make the container full height for structure */
</style>
