<script lang="ts">
	import { Mail, ArrowLeft, LoaderCircle, Sparkles } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	let email = $state("");
	let loading = $state(false);
	let message = $state("");
	let error = $state("");

	async function handleReset(e: Event) {
		e.preventDefault();
		loading = true;
		error = "";
		message = "";

		try {
			const res = await fetch("/api/auth/reset-password-request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email })
			});

			if (res.ok) {
				message = "Check your email for a password reset link.";
			} else {
				const data = await res.json();
				error = data.message || "Failed to send reset email.";
			}
		} catch (e) {
			error = "A network error occurred. Please try again.";
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6 font-sans overflow-y-auto">
	<div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 lg:p-10 space-y-8">
		<!-- Header -->
		<div class="text-center space-y-3">
			<div class="mx-auto w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
				<Mail class="w-6 h-6 text-brand" />
			</div>
			<h1 class="text-2xl font-bold text-slate-900">Forgot Password?</h1>
			<p class="text-slate-500 text-sm">
				No worries! Enter your email and we'll send you a link to reset your password.
			</p>
		</div>

		{#if message}
			<div class="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
				<p class="text-sm font-medium text-emerald-700">{message}</p>
			</div>
		{:else}
			<form class="space-y-6" onsubmit={handleReset}>
				<div class="space-y-2">
					<Label for="email" class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Email Address</Label>
					<div class="relative group">
						<Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
						<Input type="email" id="email" bind:value={email} placeholder="you@example.com" class="h-12 pl-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" required />
					</div>
				</div>

				{#if error}
					<p class="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 text-center">{error}</p>
				{/if}

				<Button type="submit" disabled={loading} class="w-full h-12 bg-brand hover:bg-brand-dark text-white font-extrabold text-sm shadow-md rounded-xl flex items-center justify-center gap-2">
					{#if loading}
						<LoaderCircle class="w-4 h-4 animate-spin" />
						Sending Link...
					{:else}
						<Sparkles class="w-4 h-4" />
						Send Reset Link
					{/if}
				</Button>
			</form>
		{/if}

		<div class="pt-2 text-center">
			<a
				href="/login"
				class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand transition-colors"
			>
				<ArrowLeft class="w-4 h-4" />
				Back to Login
			</a>
		</div>
	</div>
</div>
