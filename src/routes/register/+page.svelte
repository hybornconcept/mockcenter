<script lang="ts">
	import { Eye, EyeOff, ChevronDown } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	let firstName = $state("");
	let lastName = $state("");
	let email = $state("");
	let middleName = $state("");
	let phoneNumber = $state("");
	let password = $state("");
	let confirmPassword = $state("");
	let agreed = $state(false);

	let submitted = $state(false);
</script>

<div class="min-h-screen bg-[#f5f5f5] flex font-sans text-slate-900">
	<!-- Left Side: Masonry Grid -->
	<div
		class="hidden lg:flex lg:w-[60%] h-screen sticky top-0 items-start justify-center overflow-hidden"
	>
		<div class="grid grid-cols-3 gap-4 w-[80%]">
			<!-- Column 1 -->
			<div class="flex flex-col gap-4">
				<div
					class="relative w-full h-64 rounded-b-2xl overflow-hidden shadow-sm group"
				>
					<img
						src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&q=80"
						alt="Student friends"
						class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
					/>
					<div
						class="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/20"
					></div>
				</div>
				<div
					class="relative w-full h-72 rounded-2xl overflow-hidden shadow-sm group"
				>
					<img
						src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&q=80"
						alt="Students working together"
						class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
					/>
					<div
						class="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/20"
					></div>
				</div>
			</div>

			<!-- Column 2 -->
			<div class="flex flex-col gap-4">
				<div
					class="relative w-full h-52 rounded-b-2xl overflow-hidden shadow-sm group"
				>
					<img
						src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80"
						alt="Student studying with laptop"
						class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
					/>
					<div
						class="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/20"
					></div>
				</div>
				<div
					class="relative w-full h-80 rounded-2xl overflow-hidden shadow-sm group"
				>
					<img
						src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&q=80"
						alt="Graduation students"
						class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
					/>
					<div
						class="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/20"
					></div>
				</div>
			</div>

			<!-- Column 3 -->
			<div class="flex flex-col gap-4">
				<div
					class="relative w-full h-60 rounded-b-2xl overflow-hidden shadow-sm group"
				>
					<img
						src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=500&q=80"
						alt="Library studying"
						class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
					/>
					<div
						class="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/20"
					></div>
				</div>
				<div
					class="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm group"
				>
					<img
						src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80"
						alt="Group study"
						class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
					/>
					<div
						class="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/20"
					></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right Side: Registration Form Container -->
	<div
		class="w-full lg:w-[40%] flex flex-col items-start justify-center p-6 md:p-12 lg:py-4 lg:pl-2 overflow-y-auto"
	>
		<!-- White Floating Card -->
		<div class="w-[90%] bg-white rounded-xl shadow-lg p-8 lg:p-8 my-auto">
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

			<h1 class="text-2xl font-bold text-slate-800 mb-8">Create an account</h1>

			<form
				class="space-y-5"
				onsubmit={(e) => {
					e.preventDefault();
					submitted = true;
				}}
			>
				<!-- Name Row -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-1">
						<Label
							for="firstName"
							class="text-xs font-normal text-slate-600 pl-1">First Name</Label
						>
						<Input
							type="text"
							id="firstName"
							bind:value={firstName}
							placeholder="First Name"
							class="h-11 bg-white border-slate-300 focus-visible:ring-brand focus-visible:border-brand rounded-lg placeholder:text-slate-300"
						/>
						{#if submitted && !firstName}
							<p class="text-[10px] font-bold text-red-500 pl-1">
								First name is required.
							</p>
						{/if}
					</div>
					<div class="space-y-1">
						<Label
							for="lastName"
							class="text-xs font-normal text-slate-600 pl-1">Last Name</Label
						>
						<Input
							type="text"
							id="lastName"
							bind:value={lastName}
							placeholder="Last Name"
							class="h-11 bg-white border-slate-300 focus-visible:ring-brand focus-visible:border-brand rounded-lg placeholder:text-slate-300"
						/>
					</div>
				</div>

				<!-- Middle Name & Phone Row -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-1">
						<Label
							for="middleName"
							class="text-xs font-normal text-slate-600 pl-1">Middle Name</Label
						>
						<Input
							type="text"
							id="middleName"
							bind:value={middleName}
							placeholder="Middle Name"
							class="h-11 bg-white border-slate-300 focus-visible:ring-brand focus-visible:border-brand rounded-lg placeholder:text-slate-300"
						/>
					</div>
					<div class="space-y-1">
						<Label
							for="phoneNumber"
							class="text-xs font-normal text-slate-600 pl-1"
							>Phone Number</Label
						>
						<div class="relative flex items-center">
							<div
								class="absolute left-3 flex items-center gap-1.5 border-r border-slate-200 pr-2 h-6"
							>
								<img
									src="https://flagcdn.com/w20/ng.png"
									alt="Nigeria"
									class="w-4 h-3 object-cover rounded-[1px]"
								/>
								<span class="text-xs font-bold text-slate-600">+234</span>
								<ChevronDown class="w-3 h-3 text-slate-400" />
							</div>
							<Input
								type="tel"
								id="phoneNumber"
								bind:value={phoneNumber}
								placeholder="Phone Number"
								class="h-11 pl-24 bg-white border-slate-300 focus-visible:ring-brand focus-visible:border-brand rounded-lg placeholder:text-slate-300"
							/>
						</div>
					</div>
				</div>

				<!-- Email -->
				<div class="space-y-1">
					<Label for="email" class="text-xs font-normal text-slate-600 pl-1"
						>Email</Label
					>
					<Input
						type="email"
						id="email"
						bind:value={email}
						placeholder="Email"
						class="h-11 bg-white border-slate-300 focus-visible:ring-brand focus-visible:border-brand rounded-lg placeholder:text-slate-300"
					/>
					{#if submitted && !email}
						<p class="text-[10px] font-bold text-red-500 pl-1">
							Email is required.
						</p>
					{/if}
				</div>

				<!-- Password -->
				<div class="space-y-1">
					<Label for="password" class="text-xs font-normal text-slate-600 pl-1"
						>Password</Label
					>
					<div class="relative">
						<Input
							type={showPassword ? "text" : "password"}
							id="password"
							bind:value={password}
							placeholder="Password"
							class="h-11 bg-white border-slate-300 focus-visible:ring-brand focus-visible:border-brand pr-10 rounded-lg placeholder:text-slate-300"
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

				<!-- Confirm Password -->
				<div class="space-y-1">
					<Label
						for="confirmPassword"
						class="text-xs font-normal text-slate-600 pl-1"
						>Confirm Password</Label
					>
					<div class="relative">
						<Input
							type={showConfirmPassword ? "text" : "password"}
							id="confirmPassword"
							bind:value={confirmPassword}
							placeholder="Confirm Password"
							class="h-11 bg-white border-slate-300 focus-visible:ring-brand focus-visible:border-brand pr-10 rounded-lg placeholder:text-slate-300"
						/>
						<button
							type="button"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
						>
							{#if showConfirmPassword}
								<EyeOff class="w-4 h-4" />
							{:else}
								<Eye class="w-4 h-4" />
							{/if}
						</button>
					</div>
				</div>

				<!-- Referral Code -->
				<div class="space-y-1">
					<Label for="referral" class="text-xs font-normal text-slate-600 pl-1"
						>Referral Code(Optional)</Label
					>
					<div class="relative group">
						<div
							class="h-11 w-full p-3 bg-white border border-slate-300 rounded-lg flex items-center justify-between cursor-pointer group-hover:border-slate-400 transition-colors"
						>
							<span class="text-sm font-medium text-slate-500">0</span>
							<div class="flex items-center gap-2">
								<span class="text-slate-300 text-xs">×</span>
								<ChevronDown class="w-4 h-4 text-slate-400" />
							</div>
						</div>
					</div>
				</div>

				<!-- Terms -->
				<div class="flex gap-3 pt-2">
					<input
						type="checkbox"
						id="terms"
						bind:checked={agreed}
						class="w-4 h-4 mt-0.5 accent-teal-600 rounded border-slate-300"
					/>
					<label
						for="terms"
						class="text-[11px] font-bold text-slate-500 leading-relaxed cursor-pointer"
					>
						By signing up, you agree to our <span
							class="text-slate-700 underline decoration-slate-300"
							>Terms of Use</span
						>
						,
						<span class="text-slate-700 underline decoration-slate-300"
							>Privacy Policy</span
						>
						and
						<span class="text-slate-700 underline decoration-slate-300"
							>Risk Disclosure</span
						>.
					</label>
				</div>

				<!-- Submit Button -->
				<Button
					type="submit"
					class="w-full h-12 bg-brand text-white font-bold text-base shadow-none hover:bg-brand-dark transition-colors rounded-lg mt-2"
				>
					Continue
				</Button>
			</form>
		</div>
	</div>
</div>
