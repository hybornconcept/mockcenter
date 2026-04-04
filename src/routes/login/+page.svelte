<script lang="ts">
	import { slide, fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { Eye, EyeOff } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	let showPassword = $state(false);
</script>

<div
	class="min-h-screen bg-white flex font-sans text-slate-900 overflow-hidden"
>
	<!-- Left Side: Dropping Images -->
	<div
		class="hidden lg:flex w-[60%] relative items-start justify-center overflow-hidden"
	>
		<!-- Decorative Background -->
		<div class="absolute inset-0">
			<div
				class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#4b5563_1px,transparent_1px)] bg-size-[16px_16px]"
			></div>
		</div>

		<div
			class="w-full h-full max-w-4xl relative flex justify-center gap-6 px-10"
		>
			<!-- Image 1 -->
			<div
				class="w-[91%] rounded-b-full overflow-hidden relative shadow-xl shadow-indigo-900/10 transition-all duration-700 ease-in-out hover:scale-[1.1] hover:z-20 origin-top cursor-pointer group"
				style="height: 65vh;"
				in:fly={{ y: -800, duration: 1000, delay: 0, easing: cubicOut }}
			>
				<img
					src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"
					alt="Student reading"
					class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				<div
					class="absolute inset-0 bg-indigo-900/40 transition-opacity duration-700 group-hover:opacity-60"
				></div>
			</div>

			<!-- Image 2 (Longest) -->
			<div
				class="w-[91%] rounded-b-full overflow-hidden relative shadow-xl shadow-indigo-900/10 transition-all duration-700 ease-in-out hover:scale-[1.1] hover:z-20 origin-top cursor-pointer group"
				style="height: 85vh;"
				in:fly={{ y: -1000, duration: 1200, delay: 100, easing: cubicOut }}
			>
				<img
					src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
					alt="Students collaborating"
					class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				<div
					class="absolute inset-0 bg-orange-900/40 transition-opacity duration-700 group-hover:opacity-60"
				></div>
			</div>

			<!-- Image 3 -->
			<div
				class="w-[91%] rounded-b-full overflow-hidden relative shadow-xl shadow-indigo-900/10 transition-all duration-700 ease-in-out hover:scale-[1.1] hover:z-20 origin-top cursor-pointer group"
				style="height: 55vh;"
				in:fly={{ y: -600, duration: 1100, delay: 200, easing: cubicOut }}
			>
				<img
					src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
					alt="Student portrait"
					class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				<div
					class="absolute inset-0 bg-teal-900/40 transition-opacity duration-700 group-hover:opacity-60"
				></div>
			</div>
		</div>
	</div>

	<!-- Right Side: Login Form -->
	<div
		class="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-12 relative z-10"
	>
		<div
			class="w-full max-w-105 bg-white rounded-2xl shadow-xl md:border border-slate-100 p-0 md:p-10"
		>
			<!-- Logo -->
			<div class="flex items-center gap-2 mb-8">
				<img
					src="/use.png"
					alt="Mockcenter Logo"
					class="w-10 h-10 object-contain"
				/>
				<span
					class="font-extrabold text-lg tracking-tight text-brand"
					style="font-family: 'Kodchasan', sans-serif;"
					>Mockcenter</span
				>
			</div>

			<div class="mb-8 space-y-2">
				<h1 class="text-[28px] font-bold text-slate-900 leading-tight">
					Login
				</h1>
				<p class="text-slate-500 text-sm">
					Welcome back, please enter your details
				</p>
			</div>

			<form class="space-y-5">
				<div class="space-y-2">
					<Label for="email" class="text-xs font-bold text-slate-700"
						>Email Address</Label
					>
					<Input
						type="email"
						id="email"
						placeholder="Email"
						class="h-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand placeholder:text-slate-300 placeholder:font-light"
					/>
				</div>

				<div class="space-y-2">
					<Label for="password" class="text-xs font-bold text-slate-700"
						>Password</Label
					>
					<div class="relative">
						<Input
							type={showPassword ? "text" : "password"}
							id="password"
							placeholder="Password"
							class="h-11 bg-white border-slate-200 focus-visible:ring-brand focus-visible:border-brand pr-10 placeholder:text-slate-300 placeholder:font-light"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
						>
							{#if showPassword}
								<EyeOff class="w-4 h-4" />
							{:else}
								<Eye class="w-4 h-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="flex justify-end">
					<button
						type="button"
						class="text-xs font-bold text-brand hover:text-brand-dark transition-colors"
					>
						Forgot Password?
					</button>
				</div>

				<Button
					type="submit"
					class="w-full h-11 bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-sm"
				>
					Login
				</Button>
			</form>

			<div class="mt-8 text-center">
				<p class="text-xs text-slate-500">
					Don't have an account?
					<a
						href="/register"
						class="font-bold text-brand hover:text-brand-dark transition-colors"
						>Sign up</a
					>
				</p>
			</div>
		</div>
	</div>

</div>
