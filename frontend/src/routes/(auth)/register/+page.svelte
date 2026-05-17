<script lang="ts">
	import { Eye, EyeOff, LoaderCircle, Sparkles, Mail, User, KeyRound } from "@lucide/svelte";
	import { toast } from "svelte-sonner";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Form from "$lib/components/ui/form/index.js";
	import { fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { superForm } from "sveltekit-superforms";
	import { valibotClient } from "sveltekit-superforms/adapters";
	import { registerSchema } from "$lib/schemas";
	import { authClient } from "$lib/auth-client";

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: valibotClient(registerSchema),
		onUpdated({ form }) {
			if (!form.valid && form.message) {
				toast.error(form.message, {
					description:
						form.message.toLowerCase().includes("already exists")
							? "Try logging in instead."
							: "Please check your details and try again.",
				});
			}
		},
	});

	const { form: formData, errors, enhance, delayed, message } = form;

	let showPassword = $state(false);
	let showConfirm = $state(false);

	async function signUpWithGoogle() {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: `${window.location.origin}/auth/callback`,
		});
	}

	// Show server-side message in toaster when it arrives
	$effect(() => {
		if ($message) {
			toast.error($message, {
				description: $message.toLowerCase().includes("already exists")
					? "Try logging in instead."
					: "Please check your details and try again.",
			});
		}
	});
</script>

<div class="min-h-screen bg-white flex font-sans text-slate-900 overflow-hidden">
	<!-- Left Side: Masonry Photo Grid -->
	<div class="hidden lg:flex w-[58%] relative items-start justify-center overflow-hidden bg-[#f7f8fb]">
		<div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#4b5563_1px,transparent_1px)] bg-size-[16px_16px]"></div>
		<div class="grid grid-cols-3 gap-3 w-[88%] pt-0">
			<!-- Col 1 -->
			<div class="flex flex-col gap-3">
				<div class="relative w-full rounded-b-2xl overflow-hidden shadow group bg-slate-200" style="height: 66vh;" in:fly={{ y: -700, duration: 1000, delay: 0, easing: cubicOut }}>
					<img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=70&auto=format,compress" alt="Student" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="eager" decoding="async" />
					<div class="absolute inset-0 bg-indigo-900/30"></div>
				</div>
				<div class="relative w-full rounded-2xl overflow-hidden shadow group bg-slate-200" style="height: 30vh;" in:fly={{ y: -400, duration: 900, delay: 100, easing: cubicOut }}>
					<img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=70&auto=format,compress" alt="Students" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
					<div class="absolute inset-0 bg-orange-900/30"></div>
				</div>
			</div>
			<!-- Col 2 -->
			<div class="flex flex-col gap-3">
				<div class="relative w-full rounded-b-2xl overflow-hidden shadow group bg-slate-200" style="height: 38vh;" in:fly={{ y: -500, duration: 1100, delay: 50, easing: cubicOut }}>
					<img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=70&auto=format,compress" alt="Study" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="eager" decoding="async" />
					<div class="absolute inset-0 bg-teal-900/30"></div>
				</div>
				<div class="relative w-full rounded-2xl overflow-hidden shadow group bg-slate-200" style="height: 56vh;" in:fly={{ y: -600, duration: 1000, delay: 150, easing: cubicOut }}>
					<img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=70&auto=format,compress" alt="Graduation" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
					<div class="absolute inset-0 bg-purple-900/30"></div>
				</div>
			</div>
			<!-- Col 3 -->
			<div class="flex flex-col gap-3">
				<div class="relative w-full rounded-b-2xl overflow-hidden shadow group bg-slate-200" style="height: 50vh;" in:fly={{ y: -600, duration: 1050, delay: 80, easing: cubicOut }}>
					<img src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=70&auto=format,compress" alt="Library" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="eager" decoding="async" />
					<div class="absolute inset-0 bg-slate-900/30"></div>
				</div>
				<div class="relative w-full rounded-2xl overflow-hidden shadow group bg-slate-200" style="height: 44vh;" in:fly={{ y: -500, duration: 950, delay: 180, easing: cubicOut }}>
					<img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=70&auto=format,compress" alt="Group Study" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
					<div class="absolute inset-0 bg-rose-900/30"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right Side: Registration Form -->
	<div class="w-full lg:w-[42%] flex items-center justify-center p-8 lg:p-12 relative z-10">
		<div class="w-full max-w-md">
			<!-- Logo -->
			<div class="flex items-center gap-2 mb-8">
				<img src="/use.png" alt="Mockcenter Logo" class="w-10 h-10 object-contain" loading="lazy" />
				<span class="font-extrabold text-lg tracking-tight text-brand" style="font-family: 'Kodchasan', sans-serif;">Mockcenter</span>
			</div>

			<div class="mb-8">
				<h1 class="text-[28px] font-bold text-slate-900 leading-tight">Create your account</h1>
				<p class="text-slate-500 text-sm mt-1">Join thousands of students acing their exams.</p>
			</div>

			<!-- Google Sign-Up -->
			<button
				onclick={signUpWithGoogle}
				type="button"
				class="w-full h-12 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm mb-6"
			>
				<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-5 h-5" />
				Continue with Google
			</button>

			<div class="flex items-center gap-3 mb-6">
				<div class="flex-1 h-px bg-slate-100"></div>
				<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or sign up with email</span>
				<div class="flex-1 h-px bg-slate-100"></div>
			</div>

			<form method="POST" use:enhance class="space-y-4">
				<!-- Name Row -->
				<div class="grid grid-cols-2 gap-3">
					<Form.Field {form} name="firstName">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">First Name</Form.Label>
								<div class="relative group">
									<User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
									<Input {...props} bind:value={$formData.firstName} placeholder="First" class="h-11 pl-10 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" />
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
					</Form.Field>

					<Form.Field {form} name="lastName">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Last Name</Form.Label>
								<Input {...props} bind:value={$formData.lastName} placeholder="Last" class="h-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
					</Form.Field>
				</div>

				<!-- Email -->
				<Form.Field {form} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Email Address</Form.Label>
							<div class="relative group">
								<Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
								<Input {...props} type="email" bind:value={$formData.email} placeholder="you@example.com" class="h-11 pl-10 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" />
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
				</Form.Field>

				<!-- Password -->
				<Form.Field {form} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Password</Form.Label>
							<div class="relative group">
								<KeyRound class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
								<Input {...props} type={showPassword ? "text" : "password"} bind:value={$formData.password} placeholder="Min. 8 characters" class="h-11 pl-10 pr-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" />
								<button type="button" onclick={() => (showPassword = !showPassword)} class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
									{#if showPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
								</button>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
				</Form.Field>

				<!-- Confirm Password -->
				<Form.Field {form} name="confirmPassword">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Confirm Password</Form.Label>
							<div class="relative group">
								<KeyRound class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
								<Input {...props} type={showConfirm ? "text" : "password"} bind:value={$formData.confirmPassword} placeholder="Repeat password" class="h-11 pl-10 pr-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" />
								<button type="button" onclick={() => (showConfirm = !showConfirm)} class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
									{#if showConfirm}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
								</button>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
				</Form.Field>

				<!-- Referral Code (Optional) -->
				<Form.Field {form} name="referralCode">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">
								Referral Code <span class="normal-case font-normal text-slate-400">(optional)</span>
							</Form.Label>
							<Input {...props} bind:value={$formData.referralCode} placeholder="Discount / invite code" class="h-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand rounded-xl" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="text-xs font-bold text-red-500 mt-1 pl-1" />
				</Form.Field>

				<Button
					type="submit"
					disabled={$delayed}
					class="w-full h-12 bg-brand hover:bg-brand-dark text-white font-extrabold text-sm shadow-md rounded-xl flex items-center justify-center gap-2 mt-2"
				>
					{#if $delayed}
						<LoaderCircle class="w-4 h-4 animate-spin" />
						Creating account...
					{:else}
						<Sparkles class="w-4 h-4" />
						Create my account
					{/if}
				</Button>

				<p class="text-center text-xs text-slate-500 pt-1">
					Already have an account?
					<a href="/login" class="font-bold text-brand hover:text-brand-dark transition-colors">Log in</a>
				</p>
			</form>
		</div>
	</div>
</div>
