<script lang="ts">
	import { slide, fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { Eye, EyeOff, LoaderCircle, Mail, Sparkles } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Form from "$lib/components/ui/form/index.js";
	import { goto } from "$app/navigation";
	import { superForm } from "sveltekit-superforms";
	import { valibotClient } from "sveltekit-superforms/adapters";
	import { loginSchema } from "$lib/schemas";

	import { authClient } from "$lib/auth-client";

	let { data } = $props();

	const loginForm = superForm(() => data.form, {
		validators: valibotClient(loginSchema)
	});

	const { form: formData, errors, enhance, delayed } = loginForm;
	let showPassword = $state(false);

	async function signInWithGoogle() {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: `${window.location.origin}/dashboard`
		});
	}
</script>

<div class="min-h-screen bg-white flex font-sans text-slate-900 overflow-hidden">
	<!-- Left Side: Dropping Images -->
	<div class="hidden lg:flex w-[60%] relative items-start justify-center overflow-hidden">
		<!-- Decorative Background -->
		<div class="absolute inset-0">
			<div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#4b5563_1px,transparent_1px)] bg-size-[16px_16px]"></div>
		</div>

		<div class="w-full h-full max-w-4xl relative flex justify-center gap-6 px-10">
			<!-- Image 1 -->
			<div class="w-[91%] rounded-b-full overflow-hidden relative shadow-xl shadow-indigo-900/10 transition-all duration-700 ease-in-out hover:scale-[1.1] hover:z-20 origin-top cursor-pointer group" style="height: 65vh;" in:fly={{ y: -800, duration: 1000, delay: 0, easing: cubicOut }}>
				<img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80" alt="Student reading" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
				<div class="absolute inset-0 bg-indigo-900/40 transition-opacity duration-700 group-hover:opacity-60"></div>
			</div>

			<!-- Image 2 (Longest) -->
			<div class="w-[91%] rounded-b-full overflow-hidden relative shadow-xl shadow-indigo-900/10 transition-all duration-700 ease-in-out hover:scale-[1.1] hover:z-20 origin-top cursor-pointer group" style="height: 85vh;" in:fly={{ y: -1000, duration: 1200, delay: 100, easing: cubicOut }}>
				<img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" alt="Students collaborating" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
				<div class="absolute inset-0 bg-orange-900/40 transition-opacity duration-700 group-hover:opacity-60"></div>
			</div>

			<!-- Image 3 -->
			<div class="w-[91%] rounded-b-full overflow-hidden relative shadow-xl shadow-indigo-900/10 transition-all duration-700 ease-in-out hover:scale-[1.1] hover:z-20 origin-top cursor-pointer group" style="height: 55vh;" in:fly={{ y: -600, duration: 1100, delay: 200, easing: cubicOut }}>
				<img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80" alt="Student portrait" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
				<div class="absolute inset-0 bg-teal-900/40 transition-opacity duration-700 group-hover:opacity-60"></div>
			</div>
		</div>
	</div>

	<!-- Right Side: Login Form -->
	<div class="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-12 relative z-10">
		<div class="w-full max-w-md bg-white rounded-2xl shadow-xl md:border border-slate-100 p-0 md:p-10">
			<!-- Logo -->
			<div class="flex items-center gap-2 mb-8">
				<img src="/use.png" alt="Mockcenter Logo" class="w-10 h-10 object-contain" loading="lazy" />
				<span class="font-extrabold text-lg tracking-tight text-brand" style="font-family: 'Kodchasan', sans-serif;">Mockcenter</span>
			</div>

			<div class="mb-8 space-y-2">
				<h1 class="text-[28px] font-bold text-slate-900 leading-tight">Welcome Back</h1>
				<p class="text-slate-500 text-sm">Please enter your credentials to access your dashboard.</p>
			</div>

				<form method="POST" use:enhance class="space-y-6">
					<Form.Field form={loginForm} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Email Address</Form.Label>
								<div class="relative group">
									<Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
									<Input {...props} type="email" bind:value={$formData.email} placeholder="you@example.com" class="h-12 pl-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" />
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
					</Form.Field>

					<Form.Field form={loginForm} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex justify-between items-center pr-1">
									<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</Form.Label>
									<a href="/forgot-password" class="text-xs font-bold text-brand hover:underline">Forgot?</a>
								</div>
								<div class="relative group">
									<Input {...props} type={showPassword ? "text" : "password"} bind:value={$formData.password} placeholder="••••••••" class="h-12 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand pr-12 rounded-xl" />
									<button type="button" onclick={() => (showPassword = !showPassword)} class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
										{#if showPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
									</button>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
					</Form.Field>

					<Button type="submit" disabled={$delayed} class="w-full h-12 bg-brand hover:bg-brand-dark text-white font-extrabold text-sm shadow-md rounded-xl flex items-center justify-center gap-2">
						{#if $delayed}
							<LoaderCircle class="w-4 h-4 animate-spin" />
							Logging in...
						{:else}
							<Sparkles class="w-4 h-4" />
							Login to Account
						{/if}
					</Button>
				</form>

			<div class="mt-8 space-y-6">
				<div class="flex items-center gap-3">
					<div class="flex-1 h-px bg-slate-100"></div>
					<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
					<div class="flex-1 h-px bg-slate-100"></div>
				</div>

				<button
					onclick={signInWithGoogle}
					type="button"
					class="w-full h-12 bg-white border border-brand/40 hover:bg-slate-50 text-slate-900 font-bold text-[15px] rounded-full transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
				>
					<img
						src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
						alt="Google"
						class="w-5 h-5"
					/>
					Continue with Google
				</button>

				<p class="text-center text-xs text-slate-500">
					Don't have an account?
					<a href="/register" class="font-bold text-brand hover:text-brand-dark transition-colors">Sign up for free</a>
				</p>
			</div>
		</div>
	</div>
</div>
