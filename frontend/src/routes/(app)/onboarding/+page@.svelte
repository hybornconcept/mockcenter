<script lang="ts">
	import {
		Check,
		Briefcase,
		GraduationCap,
		CalendarIcon,
		Sparkles,
		ChevronDown,
		X,
	} from "lucide-svelte";
	import MultiSelect from "$lib/components/ui/multi-select/MultiSelect.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Spinner } from "$lib/components/ui/spinner";
	import { Label } from "$lib/components/ui/label";
	import { Calendar } from "$lib/components/ui/calendar";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { toast } from "svelte-sonner";
	import * as v from "valibot";
	import { slide } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import {
		DateFormatter,
		parseDate,
		getLocalTimeZone,
		today,
	} from "@internationalized/date";
	import { cn } from "$lib/utils";

	let formData = $state({
		userType: "",
		phoneNumber: "",
		targetExam: "",
		targetScore: "",
		examDate: "",
		state: "",
		school: "",
		prepHours: [] as string[],
		prepDays: "",
		hardSubjects: [] as string[],
		hasTutor: "",
		biggestChallenge: [] as string[],
		reminderPreference: [] as string[],

		examLevel: "",
		employmentStatus: "",
		timesTaken: "",
		yearsExperience: "",
		hardTopicAreas: [] as string[],
		reason: "",
	});

	let isCalendarOpen = $state(false);
	let submitting = $state(false);

	const df = new DateFormatter("en-US", { dateStyle: "long" });

	let { data } = $props();
	let {
		STUDENT_EXAMS = [],
		PROFESSIONAL_EXAMS = [],
		EXAM_LEVELS = [],
		NIGERIAN_STATES = [],
		PREP_HOURS_OPTS = [],
		STUDENT_HARD_SUBJECTS = [],
		PROF_HARD_TOPICS = [],
		TUTOR_OPTS = [],
		STUDENT_CHALLENGES = [],
		PROF_CHALLENGES = [],
		REMINDER_OPTS = [],
		EMP_STATUS_OPTS = [],
		PROF_REASONS = [],
	} = $derived(data);

	let scoreConfig = $derived.by(() => {
		let e = formData.targetExam;
		if (formData.userType === "student") {
			if (e === "jamb")
				return {
					label: "What score are you targeting?",
					min: 100,
					max: 400,
					step: 1,
				};
			if (["waec", "neco", "nabteb"].includes(e))
				return {
					label: "How many credits are you targeting?",
					min: 1,
					max: 9,
					step: 1,
				};
			if (e === "post_utme" || e === "common_entrance")
				return {
					label: "What score are you targeting?",
					min: 1,
					max: 100,
					step: 1,
				};
		} else {
			if (["ican", "citn"].includes(e))
				return {
					label: "How many papers are you sitting this sitting?",
					min: 1,
					max: 6,
					step: 1,
				};
			if (e === "ican_atswa")
				return {
					label: "How many papers are you sitting this sitting?",
					min: 1,
					max: 3,
					step: 1,
				};
			if (e === "law_school")
				return {
					label: "How many papers are you sitting this sitting?",
					min: 1,
					max: 5,
					step: 1,
				};
			if (e === "ielts")
				return {
					label: "What band score are you targeting?",
					min: 4,
					max: 9,
					step: 0.5,
				};
			return {
				label: "What score are you targeting?",
				min: 1,
				max: 100,
				step: 1,
			};
		}
		return { label: "Target Score", min: 0, max: 100, step: 1 };
	});

	function toggleArrayItem(arr: string[], val: string, max?: number) {
		if (arr.includes(val)) {
			return arr.filter((i) => i !== val);
		} else {
			if (max && arr.length >= max) return arr;
			return [...arr, val];
		}
	}

	let formErrors = $state<Record<string, string>>({});

	const studentSchema = v.object({
		userType: v.literal("student"),
		phoneNumber: v.pipe(
			v.string(),
			v.nonEmpty("Please enter your phone number."),
		),
		targetExam: v.pipe(
			v.string(),
			v.nonEmpty("Please select your target exam."),
		),
		targetScore: v.pipe(
			v.union([v.string(), v.number()]),
			v.custom((val) => val !== "", "Target score is required."),
		),
		examDate: v.pipe(v.string(), v.nonEmpty("Please select an exam date.")),
		state: v.pipe(v.string(), v.nonEmpty("Please select your location.")),
		school: v.pipe(v.string(), v.nonEmpty("Please enter your school name.")),
		prepHours: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select at least one preferred time."),
		),
		hasTutor: v.pipe(
			v.string(),
			v.nonEmpty("Please select if you have a tutor."),
		),
		biggestChallenge: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select your biggest challenge."),
		),
		hardSubjects: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select your difficult subjects."),
		),
		reminderPreference: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select a reminder preference."),
		),
	});

	const professionalSchema = v.object({
		userType: v.literal("professional"),
		phoneNumber: v.pipe(
			v.string(),
			v.nonEmpty("Please enter your phone number."),
		),
		targetExam: v.pipe(
			v.string(),
			v.nonEmpty("Please select your target exam."),
		),
		targetScore: v.pipe(
			v.union([v.string(), v.number()]),
			v.custom((val) => val !== "", "Target score is required."),
		),
		examDate: v.pipe(v.string(), v.nonEmpty("Please select an exam date.")),
		state: v.pipe(v.string(), v.nonEmpty("Please select your location.")),
		examLevel: v.pipe(v.string(), v.nonEmpty("Please select your exam level.")),
		employmentStatus: v.pipe(
			v.string(),
			v.nonEmpty("Please select your employment status."),
		),
		timesTaken: v.pipe(
			v.union([v.string(), v.number()]),
			v.custom(
				(val) => val !== "",
				"Please state how many times you've taken this exam.",
			),
		),
		yearsExperience: v.optional(v.union([v.string(), v.number()])),
		prepHours: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select at least one preferred time."),
		),
		reason: v.pipe(
			v.string(),
			v.nonEmpty("Please select your reason for taking this exam."),
		),
		biggestChallenge: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select your biggest challenge."),
		),
		hardTopicAreas: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select your difficult topic areas."),
		),
		reminderPreference: v.pipe(
			v.array(v.string()),
			v.minLength(1, "Please select a reminder preference."),
		),
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		formErrors = {};

		if (!formData.userType) {
			toast.error("Please select a user type first.");
			return;
		}

		const schema =
			formData.userType === "student" ? studentSchema : professionalSchema;
		const result = v.safeParse(schema, formData);

		if (!result.success) {
			toast.error("Please fix the errors in the form.");
			const flatErrors = v.flatten<typeof schema>(result.issues);
			if (flatErrors.nested) {
				for (const [key, issues] of Object.entries(flatErrors.nested)) {
					if (issues && issues.length > 0) {
						formErrors[key] = issues[0];
					}
				}
			}
			return;
		}

		submitting = true;
		try {
			const normalizedState = formData.state === 'FCT (Abuja)' ? 'FCT' : formData.state;
			const payload = {
				...formData,
				state: normalizedState,
				examDate: formData.examDate ? new Date(formData.examDate).toISOString() : null,
				// Backend expects examLevel to be "not_applicable" for student or ielts/other
				examLevel: formData.userType === 'student' ? 'not_applicable' : (formData.examLevel || 'not_applicable'),
			};

			const res = await fetch('/api/users/onboarding', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				toast.error('Onboarding failed', {
					description: (err as any).message || 'Please try again.',
				});
				submitting = false;
				return;
			}

			toast.success("Profile complete! Setting up your dashboard...");
			window.location.href = '/dashboard';
		} catch (err) {
			toast.error('Something went wrong. Please try again.');
			submitting = false;
		}
	}

	const masonryColumns = [
		[
			{
				src: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=70&auto=format,compress",
				alt: "Happy black student taking online test",
				height: "h-[380px]",
				rounded: "rounded-b-2xl",
				loading: "eager"
			},
			{
				src: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=70&auto=format,compress",
				alt: "Happy black student taking online test",
				height: "h-[310px]",
				rounded: "rounded-2xl",
				loading: "lazy"
			}
		],
		[
			{
				src: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=600&q=70&auto=format,compress",
				alt: "Happy black student taking online test",
				height: "h-[308px]",
				rounded: "rounded-b-2xl",
				loading: "eager"
			},
			{
				src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=70&auto=format,compress",
				alt: "Happy diverse students taking online test",
				height: "h-[360px]",
				rounded: "rounded-2xl",
				loading: "lazy"
			}
		],
		[
			{
				src: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&q=70&auto=format,compress",
				alt: "Happy black student taking online test",
				height: "h-[356px]",
				rounded: "rounded-b-2xl",
				loading: "eager"
			},
			{
				src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=70&auto=format,compress",
				alt: "Happy black student taking online test",
				height: "h-[285px]",
				rounded: "rounded-2xl",
				loading: "lazy"
			}
		]
	];
</script>

<div
	class="min-h-screen bg-[#f5f5f5] flex font-sans text-slate-900 overflow-x-hidden"
>
	<!-- Left Side: Masonry Grid -->
	<div
		class="hidden lg:flex lg:w-[60%] h-screen sticky top-0 items-start justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-8"
	>
		<div class="grid grid-cols-3 gap-4 w-[96%]">
			{#each masonryColumns as col}
				<div class="flex flex-col gap-4">
					{#each col as img}
						<div
							class="relative w-full {img.height} {img.rounded} overflow-hidden shadow-sm group bg-slate-200"
						>
							<img
								src={img.src}
								alt={img.alt}
								class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
								loading={img.loading === "eager" ? "eager" : "lazy"}
								decoding="async"
							/>
							<div class="absolute inset-0 bg-black/40"></div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<!-- Right Side: Form Container -->
	<div
		class="w-full lg:w-[45%] flex flex-col items-start justify-center p-4 md:p-8 lg:py-10 lg:pl-2 overflow-y-auto"
	>
		<div
			class="w-full md:w-[95%] bg-white rounded-xl shadow-lg p-6 lg:p-7 my-auto max-w-[550px] mx-auto"
		>
			<div class="flex items-center gap-2 mb-8">
				<div class="flex items-center gap-1.5">
					<div
						class="w-8 h-8 bg-[#8a3ab9] rounded-lg flex items-center justify-center"
					>
						<span class="text-white font-bold text-xl leading-none">m.</span>
					</div>
					<span class="font-bold text-xl tracking-tight text-[#008ba3]"
						>Mockcenter</span
					>
				</div>
			</div>

			<h1 class="text-2xl font-bold text-slate-800 mb-6">
				Complete your profile
			</h1>

			{#snippet fieldError(error: string | undefined)}
				{#if error}
					<p class="text-[11px] text-red-500 mt-1 font-semibold pl-1">
						{error}
					</p>
				{/if}
			{/snippet}

			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- Step 0: Who Are You? -->
				<div class="space-y-4 pt-1">
					<p
						class="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1"
					>
						WHICH BEST DESCRIBES YOU?
					</p>
					<div class="grid grid-cols-2 gap-4">
						<button
							type="button"
							onclick={() => (formData.userType = "student")}
							class="relative flex flex-col justify-between h-[102px] p-5 rounded-2xl border-2 text-left transition-all {formData.userType ===
							'student'
								? 'border-brand bg-[#f0fcfb]'
								: 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}"
						>
							<div class="flex justify-between items-start w-full">
								<GraduationCap
									class="w-6 h-6 {formData.userType === 'student'
										? 'text-brand'
										: 'text-slate-400'}"
								/>
								<div
									class="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center {formData.userType ===
									'student'
										? 'border-brand bg-brand text-white'
										: 'border-slate-200 bg-white'}"
								>
									{#if formData.userType === "student"}<Check
											class="w-3 h-3"
										/>{/if}
								</div>
							</div>
							<h3 class="text-base font-bold text-slate-800">Student</h3>
						</button>
						<button
							type="button"
							onclick={() => (formData.userType = "professional")}
							class="relative flex flex-col justify-between h-[102px] p-5 rounded-2xl border-2 text-left transition-all {formData.userType ===
							'professional'
								? 'border-brand bg-[#f0fcfb]'
								: 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}"
						>
							<div class="flex justify-between items-start w-full">
								<Briefcase
									class="w-6 h-6 {formData.userType === 'professional'
										? 'text-brand'
										: 'text-slate-400'}"
								/>
								<div
									class="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center {formData.userType ===
									'professional'
										? 'border-brand bg-brand text-white'
										: 'border-slate-200 bg-white'}"
								>
									{#if formData.userType === "professional"}<Check
											class="w-3 h-3"
										/>{/if}
								</div>
							</div>
							<h3 class="text-base font-bold text-slate-800">Professional</h3>
						</button>
					</div>
				</div>

				{#if formData.userType}
					<div
						class="space-y-6 pt-1"
						transition:slide={{ duration: 400, easing: cubicOut }}
					>
						<!-- Q1: Which exam -->
						<div class="space-y-2">
							<Label class="text-xs font-semibold text-slate-600 pl-1">
								{formData.userType === "student"
									? "Which exam are you preparing for?"
									: "Which professional exam are you sitting?"}
							</Label>
							<div class="relative">
								<select
									bind:value={formData.targetExam}
									required
									class="w-full h-11 px-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm outline-none appearance-none focus:ring-brand focus:border-brand transition-all"
								>
									<option value="" selected disabled>Select an exam</option>
									{#if formData.userType === "student"}
										{#each STUDENT_EXAMS as exam}<option value={exam.value}
												>{exam.label}</option
											>{/each}
									{:else}
										{#each PROFESSIONAL_EXAMS as exam}<option value={exam.value}
												>{exam.label}</option
											>{/each}
									{/if}
								</select>
								<ChevronDown
									class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
								/>
							</div>
							{@render fieldError(formErrors.targetExam)}
						</div>

						<!-- Q2 (Prof only): What level -->
						{#if formData.userType === "professional" && formData.targetExam && !["ielts", "other"].includes(formData.targetExam)}
							<div class="space-y-2">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>What level are you sitting?</Label
								>
								<div class="relative">
									<select
										bind:value={formData.examLevel}
										required
										class="w-full h-11 px-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm outline-none appearance-none focus:ring-brand focus:border-brand transition-all"
									>
										<option value="" selected disabled>Select level</option>
										{#each EXAM_LEVELS as level}<option value={level.value}
												>{level.label}</option
											>{/each}
									</select>
									<ChevronDown
										class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
									/>
								</div>
								{@render fieldError(formErrors.examLevel)}
							</div>
						{/if}

						<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
							<!-- Target Score -->
							<div class="space-y-2">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>{scoreConfig.label}</Label
								>
								<Input
									type="number"
									step={scoreConfig.step}
									min={scoreConfig.min}
									max={scoreConfig.max}
									required
									bind:value={formData.targetScore}
									placeholder="e.g. {scoreConfig.min}"
									class="h-11 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
								/>
								{@render fieldError(formErrors.targetScore)}
							</div>

							<!-- Exam Date -->
							<div class="space-y-2">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>When is your exam{formData.userType === "professional"
										? " sitting"
										: ""}?</Label
								>
								<Popover.Root bind:open={isCalendarOpen}>
									<Popover.Trigger
										class={cn(
											"w-full h-11 justify-start text-left font-semibold border border-slate-300 rounded-lg bg-white flex items-center px-3 text-sm hover:bg-slate-50 transition-colors",
											!formData.examDate && "text-slate-400 font-normal",
										)}
									>
										<CalendarIcon class="mr-2 h-4 w-4 shrink-0" />
										{#if formData.examDate && formData.examDate.includes("-")}
											{df.format(
												parseDate(formData.examDate).toDate(getLocalTimeZone()),
											)}
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
											value={formData.examDate &&
											formData.examDate.includes("-")
												? parseDate(formData.examDate)
												: undefined}
											onValueChange={(v) => {
												if (v) {
													formData.examDate = v.toString();
													isCalendarOpen = false;
												}
											}}
											minValue={today(getLocalTimeZone())}
											initialFocus
										/>
									</Popover.Content>
								</Popover.Root>
								{@render fieldError(formErrors.examDate)}
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<!-- Phone Number -->
							<div class="space-y-1.5">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>Phone Number</Label
								>
								<Input
									type="tel"
									bind:value={formData.phoneNumber}
									required
									placeholder="e.g. 08012345678"
									class="h-10 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
								/>
								{@render fieldError(formErrors.phoneNumber)}
							</div>

							<!-- Current Location -->
							<div class="space-y-1.5">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>What is your current location?</Label
								>
								<div class="relative">
									<select
										bind:value={formData.state}
										required
										class="w-full h-10 px-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm outline-none appearance-none focus:ring-brand focus:border-brand transition-all"
									>
										<option value="" selected disabled>Select State</option>
										{#each NIGERIAN_STATES as s}<option value={s}>{s}</option
											>{/each}
									</select>
									<ChevronDown
										class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
									/>
								</div>
								{@render fieldError(formErrors.state)}
							</div>
						</div>

						{#if formData.userType === "professional"}
							<!-- Times taken (100% width) -->
							<div class="space-y-1.5 w-full">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>How many times have you previously sat this exam?</Label
								>
								<Input
									type="number"
									min="0"
									max="20"
									required
									bind:value={formData.timesTaken}
									class="h-10 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
								/>
								{@render fieldError(formErrors.timesTaken)}
							</div>
						{/if}

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if formData.userType === "student"}
								<!-- School -->
								<div class="space-y-1.5">
									<Label class="text-xs font-semibold text-slate-600 pl-1"
										>What school do you attend?</Label
									>
									<Input
										type="text"
										bind:value={formData.school}
										required
										placeholder="School name"
										class="h-10 bg-white border-slate-300 focus-visible:ring-brand rounded-lg"
									/>
									{@render fieldError(formErrors.school)}
								</div>
							{:else}
								<!-- Employment Status -->
								<div class="space-y-1.5">
									<Label class="text-xs font-semibold text-slate-600 pl-1"
										>Current employment status?</Label
									>
									<div class="relative">
										<Select.Root
											type="single"
											bind:value={formData.employmentStatus}
											name="employmentStatus"
										>
											<Select.Trigger
												class="w-full min-h-[44px] bg-white border border-slate-300 rounded-lg text-sm focus:ring-brand focus:border-brand"
											>
												{formData.employmentStatus
													? formData.employmentStatus
													: "Select status..."}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													{#each EMP_STATUS_OPTS as opt}
														<Select.Item value={opt} label={opt}
															>{opt}</Select.Item
														>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									</div>
									{@render fieldError(formErrors.employmentStatus)}
								</div>
							{/if}

							<!-- Prep Hours -->
							<div class="space-y-1.5">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>When can you dedicate to the quiz?</Label
								>
								<MultiSelect
									options={PREP_HOURS_OPTS}
									bind:selected={formData.prepHours}
									placeholder="Select hours..."
								/>
								{@render fieldError(formErrors.prepHours)}
							</div>

							{#if formData.userType === "student"}
								<!-- Tutor (Single Select) -->
								<div class="space-y-1.5">
									<Label class="text-xs font-semibold text-slate-600 pl-1"
										>Any tutor or extramural lessons?</Label
									>
									<div class="relative">
										<Select.Root
											type="single"
											bind:value={formData.hasTutor}
											name="tutor"
										>
											<Select.Trigger
												class="w-full min-h-[44px] bg-white border border-slate-300 rounded-lg text-sm focus:ring-brand focus:border-brand"
											>
												{formData.hasTutor
													? formData.hasTutor
													: "Select an option"}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													{#each TUTOR_OPTS as opt}
														<Select.Item value={opt} label={opt}
															>{opt}</Select.Item
														>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									</div>
									{@render fieldError(formErrors.hasTutor)}
								</div>
							{:else}
								<!-- Reason -->
								<div class="space-y-1.5">
									<Label class="text-xs font-semibold text-slate-600 pl-1"
										>Why are you taking this quiz?</Label
									>
									<div class="relative">
										<Select.Root
											type="single"
											bind:value={formData.reason}
											name="reason"
										>
											<Select.Trigger
												class="w-full min-h-[44px] bg-white border border-slate-300 rounded-lg text-sm focus:ring-brand focus:border-brand"
											>
												{formData.reason
													? formData.reason
													: "Select reasons..."}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													{#each PROF_REASONS as opt}
														<Select.Item value={opt} label={opt}
															>{opt}</Select.Item
														>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
									</div>
									{@render fieldError(formErrors.reason)}
								</div>
							{/if}

							<!-- Reminders -->
							<div class="space-y-1.5">
								<Label class="text-xs font-semibold text-slate-600 pl-1"
									>Medium(s) for quiz reminders ?</Label
								>
								<MultiSelect
									options={REMINDER_OPTS}
									bind:selected={formData.reminderPreference}
									placeholder="Select preferences..."
								/>
								{@render fieldError(formErrors.reminderPreference)}
							</div>
						</div>

						<!-- Biggest Challenge (100% width) -->
						<div class="space-y-1.5 w-full">
							<Label class="text-xs font-semibold text-slate-600 pl-1"
								>What is your biggest challenge with quiz?</Label
							>
							<MultiSelect
								options={formData.userType === "student"
									? STUDENT_CHALLENGES
									: PROF_CHALLENGES}
								bind:selected={formData.biggestChallenge}
								placeholder="Select challenges..."
							/>
							{@render fieldError(formErrors.biggestChallenge)}
						</div>

						<!-- Difficult Subjects / Topics (100% width) -->
						<div class="space-y-1.5 w-full">
							<Label class="text-xs font-semibold text-slate-600 pl-1"
								>{formData.userType === "student"
									? "Which subjects do you find hardest?"
									: "Which topic areas do you find most difficult?"}</Label
							>
							{#if formData.userType === "student"}
								<MultiSelect
									options={STUDENT_HARD_SUBJECTS}
									bind:selected={formData.hardSubjects}
									placeholder="Select subjects..."
									maxSelections={5}
								/>
								{@render fieldError(formErrors.hardSubjects)}
							{:else}
								<MultiSelect
									options={PROF_HARD_TOPICS}
									bind:selected={formData.hardTopicAreas}
									placeholder="Select topics..."
									maxSelections={5}
								/>
								{@render fieldError(formErrors.hardTopicAreas)}
							{/if}
						</div>

						<!-- Submission & Terms -->
						<div class="pt-4 pb-8 flex flex-col gap-5">
							<div class="flex items-center gap-3 px-1">
								<div class="relative flex items-center">
									<input
										type="checkbox"
										id="terms"
										required
										class="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer"
									/>
								</div>
								<Label
									for="terms"
									class="text-[13px] text-slate-500 cursor-pointer select-none"
								>
									I agree to the <a
										href="/terms"
										class="text-brand hover:underline font-semibold"
										>Terms of Service</a
									>
									and
									<a
										href="/privacy"
										class="text-brand hover:underline font-semibold"
										>Privacy Policy</a
									>.
								</Label>
							</div>

							<Button
								type="submit"
								disabled={submitting}
								class="w-full h-[54px] bg-brand text-white font-bold text-base shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{#if submitting}
									<Spinner class="w-5 h-5 mr-2" />
									Submitting...
								{:else}
									<Sparkles class="w-4 h-4 mr-2" />
									Start my quiz
								{/if}
							</Button>
						</div>
					</div>
				{/if}
			</form>
		</div>
	</div>
</div>
