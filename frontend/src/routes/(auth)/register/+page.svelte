<script lang="ts">
	import {
		Eye,
		EyeOff,
		Check,
		Briefcase,
		GraduationCap,
		LoaderCircle,
		CalendarIcon,
		Sparkles,
		Phone,
		ChevronDown,
	} from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Spinner } from "$lib/components/ui/spinner";
	import { Label } from "$lib/components/ui/label";
	import { Calendar } from "$lib/components/ui/calendar";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { goto } from "$app/navigation";
	import { slide, fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		today,
		parseDate,
	} from "@internationalized/date";
	import { cn } from "$lib/utils";
	import { superForm } from "sveltekit-superforms";
	import { valibotClient } from "sveltekit-superforms/adapters";
	import {
		registerSchema,
		onboardingSchema,
		combinedSchema,
	} from "$lib/schemas";

	import { untrack } from "svelte";
	// --- Data from Page Server ---
	let { data } = $props();
	const {
		user,
		NIGERIAN_STATES,
		STUDENT_EXAMS,
		PROFESSIONAL_EXAMS,
		EXAM_LEVELS,
		SCORE_CONFIGS,
	} = $derived(data);

	// --- Form Handling ---
	// We use the combined schema if no user exists, otherwise just onboarding
	const activeSchema = $derived(user ? onboardingSchema : combinedSchema);
	const activeInitialForm = $derived(user ? data.onboardingForm : data.combinedForm);

	const mainForm = superForm(activeInitialForm as any, {
		validators: valibotClient(activeSchema as any),
		dataType: "json",
		onSubmit: ({ jsonData }) => {
			const d = jsonData as any;
			if (d.userType === "student") {
				d.examLevel = "not_applicable";
			}
		},
		onUpdated: ({ form }) => {
			if (form.valid) {
				toast.success("Registration complete", {
					description: "Setting up your account...",
				});
				goto("/dashboard");
			} else {
				toast.error("Validation failed", {
					description: "Please check all required fields.",
				});
			}
		},
	});

	const {
		form: formData,
		errors,
		enhance: formEnhance,
		delayed,
	} = mainForm;

	let showPassword = $state(false);
	let isCalendarOpen = $state(false);

	// Calendar State
	const df = new DateFormatter("en-US", { dateStyle: "long" });

	// Pre-fill if user exists (e.g. Google login)
	$effect(() => {
		if (user) {
			untrack(() => {
				const names = user.name?.split(" ") || [];
				if (!$formData.firstName) $formData.firstName = names[0] || "";
				if (!$formData.lastName)
					$formData.lastName = names.length > 1 ? names.slice(1).join(" ") : "";
				if (!$formData.email) $formData.email = user.email || "";
			});
		}
	});

	// --- Derived Logic ---
	let scoreConfig = $derived(
		SCORE_CONFIGS[$formData.targetExam] || {
			label: "Target",
			min: 1,
			max: 400,
			step: 1,
			placeholder: "",
		},
	);

	// --- Reset fields when userType changes ---
	let lastType = $state($formData.userType);
	$effect(() => {
		const currentType = $formData.userType;
		if (currentType && currentType !== lastType) {
			untrack(() => {
				// Clear all exam-specific fields to start fresh for the new type selection
				$formData.targetExam = "";
				$formData.targetScore = "" as any;
				$formData.examDate = "";

				// Handle exam level specifically
				if (currentType === "student") {
					$formData.examLevel = "not_applicable";
				} else {
					$formData.examLevel = "";
				}
				lastType = currentType;
			});
		}
	});

	// Synchronize examLevel if targetExam changes for specific professional exams
	$effect(() => {
		const target = $formData.targetExam;
		const type = $formData.userType;
		if (type === "professional") {
			untrack(() => {
				if (target === "ielts" || target === "other") {
					if ($formData.examLevel !== "not_applicable") {
						$formData.examLevel = "not_applicable";
					}
				} else if ($formData.examLevel === "not_applicable") {
					$formData.examLevel = "";
				}
			});
		}
	});

	// Actions
	async function handleRegister(e: Event) {
		e.preventDefault();
	}
</script>

<div
	class="min-h-screen bg-[#f5f5f5] flex font-sans text-slate-900 overflow-x-hidden"
>
	<!-- Left Side: Masonry Grid -->
	<div
		class="hidden lg:flex lg:w-[60%] h-screen sticky top-0 items-start justify-center overflow-hidden"
	>
		<div class="grid grid-cols-3 gap-4 w-[80%]">
			<!-- Col 1 -->
			<div class="flex flex-col gap-4">
				<div
					class="relative w-full h-64 rounded-b-2xl overflow-hidden shadow-sm group bg-slate-200"
				>
					<img
						src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=70&auto=format,compress"
						alt="Student"
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="eager"
						decoding="async"
					/>
					<div class="absolute inset-0 bg-black/40"></div>
				</div>
				<div
					class="relative w-full h-72 rounded-2xl overflow-hidden shadow-sm group bg-slate-200"
				>
					<img
						src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=70&auto=format,compress"
						alt="Students"
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
						decoding="async"
					/>
					<div class="absolute inset-0 bg-black/40"></div>
				</div>
			</div>
			<!-- Col 2 -->
			<div class="flex flex-col gap-4">
				<div
					class="relative w-full h-52 rounded-b-2xl overflow-hidden shadow-sm group bg-slate-200"
				>
					<img
						src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=70&auto=format,compress"
						alt="Study"
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="eager"
						decoding="async"
					/>
					<div class="absolute inset-0 bg-black/40"></div>
				</div>
				<div
					class="relative w-full h-80 rounded-2xl overflow-hidden shadow-sm group bg-slate-200"
				>
					<img
						src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=70&auto=format,compress"
						alt="Graduation"
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
						decoding="async"
					/>
					<div class="absolute inset-0 bg-black/40"></div>
				</div>
			</div>
			<!-- Col 3 -->
			<div class="flex flex-col gap-4">
				<div
					class="relative w-full h-60 rounded-b-2xl overflow-hidden shadow-sm group bg-slate-200"
				>
					<img
						src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=70&auto=format,compress"
						alt="Library"
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="eager"
						decoding="async"
					/>
					<div class="absolute inset-0 bg-black/40"></div>
				</div>
				<div
					class="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm group bg-slate-200"
				>
					<img
						src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=70&auto=format,compress"
						alt="Group Study"
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
						decoding="async"
					/>
					<div class="absolute inset-0 bg-black/40"></div>
				</div>

			</div>
		</div>
	</div>

	<!-- Right Side: Form Container -->
	<div
		class="w-full lg:w-[40%] flex flex-col items-start justify-center p-6 md:p-12 lg:py-12 lg:pl-2 overflow-y-auto"
	>
		<div class="w-[90%] bg-white rounded-xl shadow-lg p-8 lg:p-8 my-auto">
				<div class="flex items-center gap-2 mb-6">
					<img
						src="/use.png"
						alt="Logo"
						class="w-10 h-10 object-contain"
						loading="lazy"
					/>
					<span
						class="font-extrabold text-lg tracking-tight text-brand"
						style="font-family: 'Kodchasan', sans-serif;">Mockcenter</span
					>
				</div>

			<h1 class="text-2xl font-bold text-slate-800 mb-6">
				{user ? "Complete your profile" : "Create an account"}
			</h1>

			{#if !user}
				<div class="space-y-4 mb-6">
					<a
						href="/login/google"
						rel="external"
						data-sveltekit-reload
						class="w-full h-12 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
					>
						<img
							src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
							alt="Google"
							class="w-5 h-5"
							loading="lazy"
						/>
						Continue with Google
					</a>

					<div class="flex items-center gap-3">
						<div class="flex-1 h-px bg-slate-100"></div>
						<span
							class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
							>Or sign up with email</span
						>
						<div class="flex-1 h-px bg-slate-100"></div>
					</div>
				</div>
			{/if}

			<!-- SHARED FORM WRAPPER (In real use, they might be separate <form> tags) -->
			<div class="space-y-6">
                <form method="POST" use:formEnhance class="space-y-6">
				<!-- SECTION 1: Account Details (Shown only for new users) -->
				{#if !user}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Form.Field form={mainForm} name="firstName">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label class="text-xs font-semibold text-slate-600 pl-1"
											>First Name</Form.Label
										>
										<Input
											{...props}
											bind:value={$formData.firstName}
											placeholder="First Name"
											class="h-11 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors
									class="text-[10px] font-bold text-red-500 mt-1 pl-1"
								/>
							</Form.Field>
							<Form.Field form={mainForm} name="lastName">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label class="text-xs font-semibold text-slate-600 pl-1"
											>Last Name</Form.Label
										>
										<Input
											{...props}
											bind:value={$formData.lastName}
											placeholder="Last Name"
											class="h-11 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors
									class="text-[10px] font-bold text-red-500 mt-1 pl-1"
								/>
							</Form.Field>
						</div>

						<Form.Field form={mainForm} name="email">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-xs font-semibold text-slate-600 pl-1"
										>Email</Form.Label
									>
									<Input
										{...props}
										type="email"
										bind:value={$formData.email}
										placeholder="you@example.com"
										class="h-11 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors
								class="text-[10px] font-bold text-red-500 mt-1 pl-1"
							/>
						</Form.Field>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Form.Field form={mainForm} name="password">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label class="text-xs font-semibold text-slate-600 pl-1"
											>Password</Form.Label
										>
										<div class="relative">
											<Input
												{...props}
												type={showPassword ? "text" : "password"}
												bind:value={$formData.password}
												placeholder="Min. 8 characters"
												class="h-11 bg-white border-slate-300 focus-visible:ring-brand pr-10 rounded-lg"
											/>
											<button
												type="button"
												onclick={() => (showPassword = !showPassword)}
												class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
											>
												{#if showPassword}
													<EyeOff class="w-4 h-4" />
												{:else}
													<Eye class="w-4 h-4" />
												{/if}
											</button>
										</div>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors
									class="text-[10px] font-bold text-red-500 mt-1 pl-1"
								/>
							</Form.Field>

							<Form.Field form={mainForm} name="confirmPassword">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label class="text-xs font-semibold text-slate-600 pl-1"
											>Confirm Password</Form.Label
										>
										<div class="relative">
											<Input
												{...props}
												type={showPassword ? "text" : "password"}
												bind:value={$formData.confirmPassword}
												placeholder="Repeat password"
												class="h-11 bg-white border-slate-300 focus-visible:ring-brand pr-10 rounded-lg"
											/>
											<button
												type="button"
												onclick={() => (showPassword = !showPassword)}
												class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
											>
												{#if showPassword}
													<EyeOff class="w-4 h-4" />
												{:else}
													<Eye class="w-4 h-4" />
												{/if}
											</button>
										</div>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors
									class="text-[10px] font-bold text-red-500 mt-1 pl-1"
								/>
							</Form.Field>
						</div>

						<Form.Field form={mainForm} name="referralCode">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-xs font-semibold text-slate-600 pl-1"
										>Referral Code (Optional)</Form.Label
									>
									<Input
										{...props}
										bind:value={$formData.referralCode}
										placeholder="Discount / Invite code"
										class="h-11 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors
								class="text-[10px] font-bold text-red-500 mt-1 pl-1"
							/>
						</Form.Field>
					<div class="flex items-center gap-3 py-1">
						<div class="flex-1 h-px bg-slate-100"></div>
						<span class="text-[10px] font-bold text-slate-400 uppercase"
							>Profile Details</span
						>
						<div class="flex-1 h-px bg-slate-100"></div>
					</div>
				{:else}
					<div class="p-4 bg-brand/5 border border-brand/10 rounded-xl mb-2">
						<p class="text-sm font-medium text-brand flex items-center gap-2">
							<Check class="w-4 h-4" />
							Connected as {user.email}
						</p>
					</div>
				{/if}

				<!-- SECTION 2: User Type & Onboarding -->
					<div class="space-y-5">
					<div class="space-y-3 pt-1">
						<p
							class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1"
						>
							Which best describes you?
						</p>
						<div class="grid grid-cols-2 gap-3">
							<button
								type="button"
								onclick={() => ($formData.userType = "student")}
								class="relative p-4 rounded-xl border-2 text-left transition-all {$formData.userType ===
								'student'
									? 'border-brand bg-brand/5'
									: 'border-slate-100 bg-white hover:border-slate-200'}"
							>
								<GraduationCap
									class="w-5 h-5 {$formData.userType === 'student'
										? 'text-brand'
										: 'text-slate-400'} mb-2"
								/>
								<h3 class="text-sm font-bold text-slate-800">Student</h3>
								<div
									class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center {$formData.userType ===
									'student'
										? 'border-brand bg-brand text-white'
										: 'border-slate-200 bg-white text-transparent'}"
								>
									<Check class="w-3 h-3" />
								</div>
							</button>
							<button
								type="button"
								onclick={() => ($formData.userType = "professional")}
								class="relative p-4 rounded-xl border-2 text-left transition-all {$formData.userType ===
								'professional'
									? 'border-brand bg-brand/5'
									: 'border-slate-100 bg-white hover:border-slate-200'}"
							>
								<Briefcase
									class="w-5 h-5 {$formData.userType === 'professional'
										? 'text-brand'
										: 'text-slate-400'} mb-2"
								/>
								<h3 class="text-sm font-bold text-slate-800">Professional</h3>
								<div
									class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center {$formData.userType ===
									'professional'
										? 'border-brand bg-brand text-white'
										: 'border-slate-200 bg-white text-transparent'}"
								>
									<Check class="w-3 h-3" />
								</div>
							</button>
						</div>
						{#if $errors.userType}<p
								class="text-[10px] font-bold text-red-500 pl-1"
							>
								{$errors.userType[0]}
							</p>{/if}
					</div>

					<!-- ONBOARDING QUESTIONS (Appear all at once when userType is selected) -->
					{#if $formData.userType}
						<div
							class="space-y-4 pt-1"
							transition:slide={{ duration: 400, easing: cubicOut }}
						>
							<Form.Field form={mainForm} name="targetExam">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label class="text-xs font-semibold text-slate-600 pl-1"
											>Which exam are you preparing for?</Form.Label
										>
										<div class="relative">
											<select
												{...props}
												bind:value={$formData.targetExam}
												class="w-full h-11 px-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm outline-none appearance-none focus:ring-brand focus:border-brand transition-all"
											>
												<option value="" selected>Select an exam</option>
												{#if $formData.userType === "student"}
													{#each STUDENT_EXAMS as exam}<option
															value={exam.value}>{exam.label}</option
														>{/each}
												{:else}
													{#each PROFESSIONAL_EXAMS as exam}<option
															value={exam.value}>{exam.label}</option
														>{/each}
												{/if}
											</select>
											<ChevronDown
												class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
											/>
										</div>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors
									class="text-[10px] font-bold text-red-500 mt-1 pl-1"
								/>
							</Form.Field>

							{#if $formData.userType === "professional" && $formData.targetExam && $formData.targetExam !== "ielts" && $formData.targetExam !== "other"}
								<Form.Field form={mainForm} name="examLevel">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label
												class="text-xs font-semibold text-slate-600 pl-1"
												>What level are you sitting?</Form.Label
											>
											<div class="relative">
												<select
													{...props}
													bind:value={$formData.examLevel}
													class="w-full h-11 px-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm outline-none appearance-none focus:ring-brand focus:border-brand transition-all"
												>
													<option value="" selected>Select level</option>
													{#each EXAM_LEVELS as level}<option
															value={level.value}>{level.label}</option
														>{/each}
												</select>
												<ChevronDown
													class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
												/>
											</div>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors
										class="text-[10px] font-bold text-red-500 mt-1 pl-1"
									/>
								</Form.Field>
							{/if}

							<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
								<Form.Field form={mainForm} name="targetScore">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label
												class="text-xs font-semibold text-slate-600 pl-1"
												>{scoreConfig.label}</Form.Label
											>
											<Input
												{...props}
												type="number"
												step={scoreConfig.step}
												min={scoreConfig.min}
												max={scoreConfig.max}
												bind:value={$formData.targetScore}
												placeholder={scoreConfig.placeholder}
												class="h-11 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
											/>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors
										class="text-[10px] font-bold text-red-500 mt-1 pl-1"
									/>
								</Form.Field>

								<Form.Field form={mainForm} name="state">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label
												class="text-xs font-semibold text-slate-600 pl-1"
												>State</Form.Label
											>
											<div class="relative">
												<select
													{...props}
													bind:value={$formData.state}
													class="w-full h-11 px-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm outline-none appearance-none focus:ring-brand focus:border-brand transition-all"
												>
													<option value="" selected>Select State</option>
													{#each NIGERIAN_STATES as s}<option value={s}
															>{s}</option
														>{/each}
												</select>
												<ChevronDown
													class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
												/>
											</div>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors
										class="text-[10px] font-bold text-red-500 mt-1 pl-1"
									/>
								</Form.Field>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
								<Form.Field form={mainForm} name="phoneNumber">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label
												class="text-xs font-semibold text-slate-600 pl-1"
												>Phone Number</Form.Label
											>
											<div class="relative">
												<Input
													{...props}
													type="tel"
													bind:value={$formData.phoneNumber}
													placeholder="+234 800 000 0000"
													class="h-11 bg-white border-slate-300 focus-visible:ring-brand pl-10 rounded-lg"
												/>
												<Phone
													class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
												/>
											</div>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors
										class="text-[10px] font-bold text-red-500 mt-1 pl-1"
									/>
								</Form.Field>
								<Form.Field form={mainForm} name="examDate">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label
												class="text-xs font-semibold text-slate-600 pl-1"
												>Exam Date</Form.Label
											>
											<Popover.Root bind:open={isCalendarOpen}>
												<Popover.Trigger 
													class={cn(
														"w-full h-11 justify-start text-left font-semibold border border-slate-300 rounded-lg bg-white flex items-center px-3 text-sm hover:bg-slate-50 transition-colors",
														!$formData.examDate && "text-slate-400 font-normal",
													)}
												>
													<CalendarIcon class="mr-2 h-4 w-4 shrink-0" />
													{#if $formData.examDate && $formData.examDate.includes("-")}
														{df.format(parseDate($formData.examDate).toDate(getLocalTimeZone()))}
													{:else}
														Pick a date
													{/if}
												</Popover.Trigger>
												<Popover.Content
													class="w-auto p-0 border-none shadow-2xl bg-white rounded-lg z-[100]"
													align="center"
													sideOffset={8}
													collisionPadding={20}
												>
													<Calendar
                                                        type="single"
														value={$formData.examDate && $formData.examDate.includes("-") ? parseDate($formData.examDate) : undefined}
														onValueChange={(v) => {
															if (v) {
                                                                $formData.examDate = v.toString();
																isCalendarOpen = false;
                                                            }
														}}
														minValue={today(getLocalTimeZone())}
														initialFocus
													/>
												</Popover.Content>
											</Popover.Root>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors
										class="text-[10px] font-bold text-red-500 mt-1 pl-1"
									/>
								</Form.Field>
							</div>
						</div>
					{/if}

					<!-- Submission -->
					<div class="pt-4">
						<Button
							type="submit"
							disabled={$delayed}
							class="w-full h-12 bg-brand text-white font-bold text-base shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if $delayed}
								<Spinner class="w-5 h-5 mr-2" />
								Submitting...
							{:else}
								<Sparkles class="w-4 h-4 mr-2" />
								{user ? "Complete Profile" : "Create my account"}
							{/if}
						</Button>

						{#if !user}
							<p class="text-center text-xs text-slate-500 mt-6">
								Already have an account?
								<a href="/login" class="text-brand font-bold hover:underline"
									>Login</a
								>
							</p>
						{/if}
					</div>
				</div>
				</form>
			</div>
		</div>
	</div>
</div>
