<script lang="ts">
	import { Mail, ArrowLeft, RefreshCw } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	let { data } = $props();

	let email = $derived(data.email || "");
	let cooldown = $state(0);
	let loading = $state(false);
	let message = $state("");

	// Poll every 3s to check if the user has verified their email
	onMount(() => {
		const interval = setInterval(async () => {
			try {
				const res = await fetch("/api/users/me");
				if (res.ok) {
					const json = await res.json();
					const user = json?.data;
					if (user?.emailVerified === "true" || user?.emailVerified === true) {
						clearInterval(interval);
						goto("/dashboard", { replaceState: true });
					}
				}
			} catch {
				// silently ignore polling errors
			}
		}, 3000);

		return () => clearInterval(interval);
	});

	async function resendEmail() {
		if (cooldown > 0) return;
		loading = true;
		try {
			const res = await fetch("/api/auth/send-verification-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ 
					email, 
					callbackURL: `${window.location.origin}/dashboard` 
				}),
			});
			if (res.ok) {
				message = "Email resent! Check your inbox.";
				cooldown = 60;
				const timer = setInterval(() => {
					cooldown -= 1;
					if (cooldown <= 0) clearInterval(timer);
				}, 1000);
			} else {
				const err = await res.json().catch(() => ({}));
				message = err.message || "Failed to resend email. Please try again.";
			}
		} catch (e) {
			message = "An error occurred. Please try again.";
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
	<div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
		<div class="mx-auto w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
			<Mail class="w-8 h-8 text-brand" />
		</div>

		<div class="space-y-2">
			<h1 class="text-2xl font-bold text-slate-900">Check your inbox</h1>
			<p class="text-slate-500 text-sm">
				We sent a verification link to <span class="font-semibold text-slate-700">{email || "your email"}</span>.
				Click it to activate your account and receive 20 free credits.
			</p>
		</div>

		{#if message}
			<p class="text-sm font-medium {message.includes('resent') ? 'text-emerald-600' : 'text-red-500'} bg-slate-50 py-2 rounded-lg">
				{message}
			</p>
		{/if}

		<div class="space-y-4 pt-2">
			<Button
				variant="outline"
				class="w-full h-11 font-bold"
				onclick={resendEmail}
				disabled={loading || cooldown > 0}
			>
				{#if loading}
					<RefreshCw class="w-4 h-4 mr-2 animate-spin" />
				{/if}
				{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
			</Button>

			<a
				href="/login"
				class="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-brand transition-colors"
			>
				<ArrowLeft class="w-4 h-4" />
				Back to login
			</a>
		</div>
	</div>
</div>
