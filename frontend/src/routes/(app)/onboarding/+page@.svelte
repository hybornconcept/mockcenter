<script lang="ts">
	import { onMount } from "svelte";
	import { fade, fly, slide } from "svelte/transition";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import {
		ChevronRight,
		ChevronLeft,
		Sparkles,
		Lightbulb,
		Check,
		MoveLeft,
		MoveRight,
		Info,
		Calendar,
		Smartphone,
		Laptop,
		Monitor,
		Upload,
		ArrowRight,
		Phone,
		Clock,
		Target,
		Zap,
		Bell,
		MessageSquare,
		GraduationCap,
		Briefcase,
		PartyPopper,
		X,
	} from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { cn } from "$lib/utils.js";
	import { toast } from "svelte-sonner";

	let { data } = $props();

	// -- STATE --
	let currentStep = $state(1);
	let userType = $state<"student" | "professional" | null>(null);
	let isSubmitting = $state(false);
	let isSuccess = $state(false);

	// -- FORM DATA --
	let formData = $state({
		phoneNumber: "",
		targetExam: "",
		targetScore: [280],
		examDate: "",
		school: "",
		state: "",
		profExam: "",
		examLevel: "",
		papersSitting: [2],
		timesTaken: [0],
		yearsExperience: [0],
		prepHours: [] as string[],
		prepDays: [5],
		hardSubjects: [] as string[],
		hardTopicAreas: [] as string[],
		hasTutor: "",
		employmentStatus: "",
		biggestChallenge: "",
		reminderPreference: [] as string[],
		reason: "",
		confidence: [3],
		photo: null as File | null,
		aiTone: "",
		photoPreview: "",
		sittingCourses: [] as string[],
	});

	const progress = $derived(
		Math.round(((currentStep - 1) / data.steps.length) * 100),
	);

	// -- CONFIGS --
	const {
		steps,
		STUDENT_EXAMS,
		PROFESSIONAL_EXAMS,
		EXAM_LEVELS,
		STATES,
		PREP_HOURS_OPTS,
		STUDENT_HARD_SUBJECTS,
		PROF_HARD_TOPICS,
		TUTOR_OPTS,
		STUDENT_CHALLENGES,
		PROF_CHALLENGES,
		REMINDER_OPTS,
		EMP_STATUS_OPTS,
		PROF_REASONS,
		studentTargetConfig,
		profTargetConfig,
	} = $derived(data);

	// -- METHODS --
	function nextStep() {
		/* 
		if (currentStep === 1 && !userType) {
			toast.error("Please select what describes you best.");
			return;
		}

		if (currentStep === 2) {
			if (!formData.phoneNumber) {
				toast.error("Please enter your phone number.");
				return;
			}
			const exam =
				userType === "student" ? formData.targetExam : formData.profExam;
			if (!exam) {
				toast.error("Please select your exam.");
				return;
			}
			if (
				userType === "professional" &&
				!formData.examLevel &&
				!["ielts", "trcn", "nimasa", "other"].includes(formData.profExam)
			) {
				toast.error("Please select your exam level.");
				return;
			}
			if (!formData.examDate) {
				toast.error("Please select your exam date.");
				return;
			}
			if (userType === "student" && !formData.school) {
				toast.error("Please enter your school name.");
				return;
			}
			if (userType === "professional" && !formData.employmentStatus) {
				toast.error("Please select your employment status.");
				return;
			}
			if (!formData.state) {
				toast.error("Please select your current location.");
				return;
			}
		}
		*/

		if (currentStep < 4) {
			currentStep++;
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}

	function toggleSelection(arr: string[], val: string, max?: number) {
		if (arr.includes(val)) {
			return arr.filter((i) => i !== val);
		} else {
			if (max && arr.length >= max) {
				toast.warning(`You can only select up to ${max} items.`);
				return arr;
			}
			return [...arr, val];
		}
	}

	async function handleSubmit() {
		isSubmitting = true;
		setTimeout(() => {
			isSubmitting = false;
			isSuccess = true;
			window.scrollTo({ top: 0, behavior: "smooth" });
		}, 1500);
	}

	function updateStudentExam(val: string) {
		formData.targetExam = val;
		const cfg = studentTargetConfig[val];
		if (cfg) formData.targetScore = [cfg.def];
	}

	function updateProfExam(val: string) {
		formData.profExam = val;
		const cfg = profTargetConfig[val];
		if (cfg) formData.papersSitting = [cfg.def];
	}

	function handlePhotoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			formData.photo = input.files[0];
			const reader = new FileReader();
			reader.onload = (ev) => {
				formData.photoPreview = ev.target?.result as string;
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
</script>

{#snippet OptionButton(val: any, current: any, onclick: () => void, classes = "", rounded = "rounded-xl")}
	<button
		{onclick}
		class={cn(
			"px-4 py-2 text-[12.5px] font-bold border-2 transition-all duration-200",
			rounded,
			(Array.isArray(current) ? current.includes(val) : current === val)
				? "border-brand bg-brand/5 text-brand"
				: "border-slate-100 bg-white text-slate-400 hover:border-slate-200",
			classes,
		)}
	>
		{val}
	</button>
{/snippet}

{#snippet TagInput(label: string, placeholder: string, tags: string[], onAdd: (v: string) => void, onRemove: (v: string) => void, subtitle = "Type and press Enter")}
	<div class="space-y-4">
		<Label class="text-[13px] font-bold text-slate-800">
			{label} <span class="text-slate-400 text-[11px] font-medium">({subtitle})</span>
		</Label>
		<div class="space-y-3">
			<Input
				type="text"
				{placeholder}
				class="h-12 rounded-xl border-slate-200 focus:ring-brand focus:border-brand"
				onkeydown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						const val = e.currentTarget.value.trim();
						if (val) {
							onAdd(val);
							e.currentTarget.value = "";
						}
					}
				}}
			/>
			<div class="flex flex-wrap gap-2">
				{#each tags as t}
					<div class="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fcfb] text-brand rounded-full text-[12px] font-bold border border-brand/10">
						{t}
						<button 
							onclick={() => onRemove(t)}
							class="hover:text-red-500 transition-colors"
						>
							<X class="w-3.5 h-3.5" />
						</button>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/snippet}

<div class="min-h-screen bg-white font-sans antialiased text-[#1a1a1a] pb-24">
	<!-- MAIN CONTAINER -->
	<div class="max-w-3xl mx-auto pt-12 px-6 sm:px-10">
		{#if !isSuccess}
			<!-- HEADER SECTION -->
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-base font-black text-slate-800 tracking-tight">
					Tell us about yourself
				</h2>
				<span class="text-xs font-black text-brand">{progress}%</span>
			</div>

			<!-- PROGRESS BAR -->
			<div class="mb-14">
				<div class="h-1 w-full bg-slate-200 rounded-full mb-8 overflow-hidden">
					<div
						class="h-full bg-brand rounded-full transition-all duration-500"
						style="width: {progress}%"
					></div>
				</div>

				<div class="flex justify-between relative px-2">
					<!-- Step Connection Line -->
					<div
						class="absolute top-[12px] left-[10%] right-[10%] h-[1px] bg-slate-200 -z-10"
					></div>

					{#each steps as step}
						<div class="flex flex-col items-center gap-2">
							<div
								class={cn(
									"w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 shadow-sm",
									currentStep > step.id
										? "bg-brand text-white"
										: currentStep === step.id
											? "bg-white border-2 border-brand text-brand shadow-[0_0_0_4px_rgba(59,109,17,0.1)]"
											: "bg-white border border-slate-300 text-slate-400",
								)}
							>
								{#if currentStep > step.id}
									<Check class="w-3.5 h-3.5" stroke-width={4} />
								{:else}
									{step.id}
								{/if}
							</div>
							<span
								class={cn(
									"text-[9px] font-black uppercase tracking-widest transition-all duration-300",
									currentStep >= step.id ? "text-brand" : "text-slate-400",
								)}
							>
								{step.label}
							</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- STEP CONTENT -->
			<div class="space-y-8">
				<div class="space-y-2">
					<div
						class="text-[10px] font-black text-brand uppercase tracking-[0.25em]"
					>
						Step {currentStep} of {steps.length}
					</div>
					<h1
						class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-[1.1]"
					>
						{steps[currentStep - 1]?.title}
					</h1>
					<p
						class="text-slate-400 text-[15px] font-medium max-w-xl leading-relaxed"
					>
						{steps[currentStep - 1]?.subtitle}
					</p>
				</div>

				{#if currentStep === 1}
					<!-- PHASE 1: IDENTITY -->
					<div in:fade={{ duration: 400 }} class="space-y-5">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<!-- STUDENT CARD -->
							<button
								onclick={() => {
									userType = "student";
									nextStep();
								}}
								class={cn(
									"group relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-300 text-left h-full",
									userType === "student"
										? "border-brand bg-white shadow-xl ring-4 ring-brand/10"
										: "border-slate-200 bg-white/60 hover:border-slate-300 hover:shadow-md",
								)}
							>
								<div class="flex items-center gap-3 mb-3">
									{#if userType === "student"}
										<div
											class="w-5 h-5 bg-brand rounded-full flex items-center justify-center text-white shrink-0 border-2 border-transparent"
										>
											<Check class="w-3 h-3" stroke-width={4} />
										</div>
									{:else}
										<div
											class="w-5 h-5 border-[1.5px] border-slate-300 bg-white rounded-full shrink-0"
										></div>
									{/if}

									<GraduationCap
										class={cn(
											"w-8 h-8 shrink-0 transition-colors duration-300",
											userType === "student" ? "text-brand" : "text-slate-800",
										)}
										stroke-width={1.5}
									/>

									<h3
										class={cn(
											"text-xl font-semibold tracking-tight ml-1 transition-colors duration-300",
											userType === "student" ? "text-brand" : "text-slate-900",
										)}
									>
										I'm a Student
									</h3>
								</div>

								<p
									class="text-[12px] text-slate-500 font-medium leading-relaxed mb-2"
								>
									Preparing for school exams — secondary school, university
									entrance, or international tests.
								</p>

								<div class="flex flex-wrap gap-1 mt-auto">
									{#each ["JAMB", "WAEC", "NECO", "IELTS", "Post-UTME"] as tag}
										<span
											class={cn(
												"text-[8px] font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase",
												userType === "student"
													? "bg-[#f0fcfb] text-brand"
													: "bg-white border border-slate-200 text-slate-400",
											)}>{tag}</span
										>
									{/each}
								</div>
							</button>

							<!-- PROFESSIONAL CARD -->
							<button
								onclick={() => {
									userType = "professional";
									nextStep();
								}}
								class={cn(
									"group relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-300 text-left h-full",
									userType === "professional"
										? "border-brand bg-white shadow-xl ring-4 ring-brand/10"
										: "border-slate-200 bg-white/60 hover:border-slate-300 hover:shadow-md",
								)}
							>
								<div class="flex items-center gap-3 mb-3">
									{#if userType === "professional"}
										<div
											class="w-5 h-5 bg-brand rounded-full flex items-center justify-center text-white shrink-0 border-2 border-transparent"
										>
											<Check class="w-3 h-3" stroke-width={4} />
										</div>
									{:else}
										<div
											class="w-5 h-5 border-[1.5px] border-slate-300 bg-white rounded-full shrink-0"
										></div>
									{/if}
									<Briefcase
										class={cn(
											"w-8 h-8 shrink-0 transition-colors duration-300",
											userType === "professional"
												? "text-brand"
												: "text-amber-900",
										)}
										stroke-width={1.5}
									/>

									<h3
										class={cn(
											"text-xl font-semibold tracking-tight ml-1 transition-colors duration-300",
											userType === "professional"
												? "text-brand"
												: "text-slate-900",
										)}
									>
										I'm a Professional
									</h3>
								</div>

								<p
									class="text-[12px] text-slate-500 font-medium leading-relaxed mb-6"
								>
									Preparing for professional or career certification exams —
									accounting, law, teaching, and more.
								</p>

								<div class="flex flex-wrap gap-1 mt-auto">
									{#each ["ICAN", "CITN", "Law School", "TRCN", "NIMASA"] as tag}
										<span
											class={cn(
												"text-[8px] font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase",
												userType === "professional"
													? "bg-[#f0fcfb] text-brand"
													: "bg-white border border-slate-200 text-slate-400",
											)}>{tag}</span
										>
									{/each}
								</div>
							</button>
						</div>
					</div>
				{:else if currentStep === 2}
					<!-- PHASE 2: EXAM DETAILS -->
					<div in:fade={{ duration: 400 }} class="space-y-5">
						<div class="flex justify-center">
							<Card.Root
								class="w-full max-w-3xl border border-slate-200 shadow-sm rounded-[20px] bg-white overflow-hidden"
							>
								<div
									class="px-6 py-4 flex items-center justify-between border-b border-slate-100"
								>
									<h2 class="text-xl font-bold text-slate-900 tracking-tight">
										Exam Details
									</h2>
									<span class="text-[13px] font-bold text-slate-500"
										>Step 2 of 4</span
									>
								</div>

								<div class="p-6 pb-12 space-y-8">
									<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
										<!-- Phone Number -->
										<div class="space-y-1">
											<Label class="text-[13px] font-bold text-slate-800">
												What is your phone number? <span class="text-red-500"
													>*</span
												>
											</Label>
											<Input
												type="tel"
												bind:value={formData.phoneNumber}
												placeholder="08012345678"
												class="!h-12 !w-full rounded-lg border-slate-200 bg-white font-medium text-slate-900"
											/>
										</div>

										<!-- Location -->
										<div class="space-y-1">
											<Label class="text-[13px] font-bold text-slate-800">
												What is your current location? <span
													class="text-red-500">*</span
												>
											</Label>
											<Select.Root type="single" bind:value={formData.state}>
												<Select.Trigger
													class="!h-12 !w-full justify-between rounded-lg border-slate-200 bg-white font-medium text-slate-900"
												>
													{formData.state ? formData.state : "Select state"}
												</Select.Trigger>
												<Select.Content
													class="rounded-xl shadow-lg border-slate-100 max-h-60"
												>
													{#each STATES as state}
														<Select.Item value={state} class="font-medium"
															>{state}</Select.Item
														>
													{/each}
												</Select.Content>
											</Select.Root>
										</div>

										<!-- Exam Selection -->
										<div class="space-y-1">
											<Label class="text-[13px] font-bold text-slate-800">
												{userType === "student"
													? "Which exam are you preparing for?"
													: "Which professional exam are you sitting?"}
												<span class="text-red-500">*</span>
											</Label>
											{#if userType === "student"}
												<Select.Root
													type="single"
													bind:value={formData.targetExam}
													onValueChange={updateStudentExam}
												>
													<Select.Trigger
														class="!h-12 !w-full justify-between rounded-lg border-slate-200 bg-white font-medium text-slate-900"
													>
														{formData.targetExam
															? STUDENT_EXAMS.find(
																	(e) => e.value === formData.targetExam,
																)?.label
															: "Select exam"}
													</Select.Trigger>
													<Select.Content
														class="rounded-xl shadow-lg border-slate-100"
													>
														{#each STUDENT_EXAMS as exam}
															<Select.Item
																value={exam.value}
																class="font-medium">{exam.label}</Select.Item
															>
														{/each}
													</Select.Content>
												</Select.Root>
											{:else}
												<Select.Root
													type="single"
													bind:value={formData.profExam}
													onValueChange={updateProfExam}
												>
													<Select.Trigger
														class="!h-12 !w-full justify-between rounded-lg border-slate-200 bg-white font-medium text-slate-900"
													>
														{formData.profExam
															? PROFESSIONAL_EXAMS.find(
																	(e) => e.value === formData.profExam,
																)?.label
															: "Select exam"}
													</Select.Trigger>
													<Select.Content
														class="rounded-xl shadow-lg border-slate-100"
													>
														{#each PROFESSIONAL_EXAMS as exam}
															<Select.Item
																value={exam.value}
																class="font-medium">{exam.label}</Select.Item
															>
														{/each}
													</Select.Content>
												</Select.Root>
											{/if}
										</div>

										{#if userType === "student"}
											<!-- Exam Date -->
											<div class="space-y-1">
												<Label class="text-[13px] font-bold text-slate-800">
													When is your exam? <span class="text-red-500">*</span>
												</Label>
												<Input
													type="date"
													bind:value={formData.examDate}
													class="!h-12 !w-full rounded-lg border-slate-200 bg-white font-medium text-slate-900"
												/>
											</div>

											<!-- School -->
											<div class="space-y-1">
												<Label class="text-[13px] font-bold text-slate-800">
													What school do you attend? <span class="text-red-500"
														>*</span
													>
												</Label>
												<Input
													type="text"
													bind:value={formData.school}
													placeholder="University/College name"
													class="!h-12 !w-full rounded-lg border-slate-200 bg-white font-medium text-slate-900"
												/>
											</div>
										{:else}
											<!-- Exam Level -->
											<div class="space-y-1">
												<Label class="text-[13px] font-bold text-slate-800">
													What level are you sitting? <span class="text-red-500"
														>*</span
													>
												</Label>
												<Select.Root
													type="single"
													bind:value={formData.examLevel}
													disabled={[
														"ielts",
														"trcn",
														"nimasa",
														"other",
													].includes(formData.profExam)}
												>
													<Select.Trigger
														class="!h-12 !w-full justify-between rounded-lg border-slate-200 bg-white font-medium text-slate-900"
													>
														{formData.examLevel
															? EXAM_LEVELS.find(
																	(l) => l.value === formData.examLevel,
																)?.label
															: "Select Level"}
													</Select.Trigger>
													<Select.Content
														class="rounded-xl shadow-lg border-slate-100"
													>
														{#each EXAM_LEVELS as level}
															<Select.Item
																value={level.value}
																class="font-medium">{level.label}</Select.Item
															>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>

											<!-- Sitting Date -->
											<div class="space-y-1">
												<Label class="text-[13px] font-bold text-slate-800">
													When is your exam date? <span class="text-red-500"
														>*</span
													>
												</Label>
												<Input
													type="date"
													bind:value={formData.examDate}
													class="!h-12 !w-full rounded-lg border-slate-200 bg-white font-medium text-slate-900"
												/>
											</div>

											<!-- Employment Status -->
											<div class="space-y-1">
												<Label class="text-[13px] font-bold text-slate-800">
													What is your current employment status? <span
														class="text-red-500">*</span
													>
												</Label>
												<Select.Root
													type="single"
													bind:value={formData.employmentStatus}
												>
													<Select.Trigger
														class="!h-12 !w-full justify-between rounded-lg border-slate-200 bg-white font-medium text-slate-900"
													>
														{formData.employmentStatus
															? formData.employmentStatus
															: "Select Status"}
													</Select.Trigger>
													<Select.Content
														class="rounded-xl shadow-lg border-slate-100"
													>
														{#each EMP_STATUS_OPTS as opt}
															<Select.Item value={opt} class="font-medium"
																>{opt}</Select.Item
															>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>


										{/if}

												{#if userType === "student"}
													<div class="space-y-4">
														<div
															class="flex items-center justify-between min-h-[40px]"
														>
															<Label class="text-[13px] font-bold text-slate-800">
																{formData.targetExam
																	? studentTargetConfig[formData.targetExam].label
																	: "What score are you targeting?"}
																<span class="text-red-500">*</span>
															</Label>
															<span class="text-lg font-black text-brand">
																{formData.targetScore[0]}
															</span>
														</div>
														<Slider
															bind:value={formData.targetScore}
															min={formData.targetExam
																? studentTargetConfig[formData.targetExam].min
																: 0}
															max={formData.targetExam
																? studentTargetConfig[formData.targetExam].max
																: 400}
															step={formData.targetExam
																? studentTargetConfig[formData.targetExam].step
																: 1}
															class="[&_[role=slider]]:bg-brand [&_[role=slider]]:size-5"
														/>
													</div>
												{/if}
													
													<!-- Sitting Courses (Tag Input) - Full Width -->
													<div class="md:col-span-2 pt-2">
														{@render TagInput(
															"What are the courses are you sitting for?",
															"e.g. Maths, English, Financial Reporting...",
															formData.sittingCourses,
															(v) => { if (!formData.sittingCourses.includes(v)) formData.sittingCourses = [...formData.sittingCourses, v] },
															(v) => formData.sittingCourses = formData.sittingCourses.filter(i => i !== v)
														)}
													</div>
												</div>
											</div>
										</Card.Root>
									</div>
								</div>
				{:else if currentStep === 3}
					<!-- PHASE 3: HABITS -->
					<div in:fade={{ duration: 400 }} class="space-y-12">
						<Card.Root
							class="border-slate-100 shadow-none rounded-2xl bg-white overflow-hidden"
						>
							<div class="p-6 space-y-5">
								<div class="grid grid-cols-1 gap-y-8">
									<!-- Study Hours -->
									<div class="space-y-4">
										<Label class="text-[13px] font-bold text-slate-800">
											What hours can you dedicate to exam prep? <span
												class="text-red-500">*</span
											>
										</Label>
										<div class="flex flex-wrap gap-2">
											{#each PREP_HOURS_OPTS as t}
												{@render OptionButton(
													t,
													formData.prepHours,
													() =>
														(formData.prepHours = toggleSelection(
															formData.prepHours,
															t,
														)),
													"px-5",
												)}
											{/each}
										</div>
									</div>



									{#if userType === "student"}
										<!-- Hardest Subjects (Tag Input) -->
										{@render TagInput(
											"Which subjects do you find hardest?",
											"e.g. Mathematics, Physics...",
											formData.hardSubjects,
											(v) => { if (!formData.hardSubjects.includes(v) && formData.hardSubjects.length < 5) formData.hardSubjects = [...formData.hardSubjects, v] },
											(v) => formData.hardSubjects = formData.hardSubjects.filter(i => i !== v)
										)}

										<!-- Tutor Status -->
										<div class="space-y-4">
											<Label class="text-[13px] font-bold text-slate-800">
												Do you currently have a tutor or attend extra classes? <span
													class="text-red-500">*</span
												>
											</Label>
											<div class="flex flex-wrap gap-2">
												{#each TUTOR_OPTS as o}
													{@render OptionButton(
														o,
														formData.hasTutor,
														() => (formData.hasTutor = o),
														"px-5",
														"rounded-full"
													)}
												{/each}
											</div>
										</div>
									{:else}
										<!-- Hardest Topics (Tag Input) -->
										{@render TagInput(
											"Which topic areas do you find most difficult?",
											"e.g. Audit, Taxation...",
											formData.hardTopicAreas,
											(v) => { if (!formData.hardTopicAreas.includes(v) && formData.hardTopicAreas.length < 5) formData.hardTopicAreas = [...formData.hardTopicAreas, v] },
											(v) => formData.hardTopicAreas = formData.hardTopicAreas.filter(i => i !== v)
										)}
									{/if}
								</div>
							</div>
						</Card.Root>
					</div>
				{:else if currentStep === 4}
					<!-- PHASE 4: PREFERENCES -->
					<div in:fade={{ duration: 400 }} class="space-y-12">
						<Card.Root
							class="border-slate-100 shadow-none rounded-2xl bg-white overflow-hidden"
						>
							<div class="p-6 space-y-8">
								<div class="space-y-4">
									<Label class="text-[13px] font-bold text-slate-800">
										What is your biggest challenge with exam prep? <span
											class="text-red-500">*</span
										>
									</Label>
									<div class="flex flex-wrap gap-2">
										{#each userType === "student" ? STUDENT_CHALLENGES : PROF_CHALLENGES as c}
											{@render OptionButton(
												c,
												formData.biggestChallenge,
												() => (formData.biggestChallenge = c),
											)}
										{/each}
									</div>
								</div>

								<div class="space-y-4">
									<Label class="text-[13px] font-bold text-slate-800">
										How should we remind you about your prep? <span
											class="text-red-500">*</span
										>
									</Label>
									<div class="flex flex-wrap gap-2">
										{#each REMINDER_OPTS as r}
											{@render OptionButton(
												r,
												formData.reminderPreference,
												() =>
													(formData.reminderPreference = toggleSelection(
														formData.reminderPreference,
														r,
													)),
											)}
										{/each}
									</div>
								</div>

								<!-- Why taking exam -->
								<div class="space-y-4">
									<Label class="text-[13px] font-bold text-slate-800">
										Why are you taking this exam? <span
											class="text-slate-400 text-[11px] font-medium"
											>(Optional)</span
										>
									</Label>
									<div class="flex flex-wrap gap-2">
										{#each userType === "student" ? ["School Admission", "Career Prep", "Personal Development", "Other"] : PROF_REASONS as r}
											{@render OptionButton(
												r,
												formData.reason,
												() => (formData.reason = r),
												"px-5",
											)}
										{/each}
									</div>
								</div>

								<div class="pt-6 border-t border-slate-100">
									<Label
										class="text-[13px] font-bold text-slate-800 mb-4 block"
									>
										Add a profile photo <span
											class="text-slate-400 text-[11px] font-medium"
											>(Optional)</span
										>
									</Label>
									<div class="flex items-center gap-8">
										<div
											class="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden"
										>
											{#if formData.photoPreview}
												<img
													src={formData.photoPreview}
													alt="Preview"
													class="w-full h-full object-cover"
												/>
											{:else}
												<span class="text-slate-300 font-bold text-2xl"
													>{$page.data.user?.name?.[0] || "M"}</span
												>
											{/if}
										</div>
										<div class="space-y-3">
											<Input
												type="file"
												accept="image/*"
												class="hidden"
												id="photo-upload"
												onchange={handlePhotoUpload}
											/>
											<Button
												variant="outline"
												class="h-10 px-4 rounded-lg font-bold text-[12px] border-slate-200 hover:bg-slate-50"
												onclick={() =>
													document.getElementById("photo-upload")?.click()}
											>
												<Upload class="w-4 h-4 mr-2" />Upload Image
											</Button>
											<p class="text-[11px] text-slate-400 font-medium">
												Square crop recommended · Max 2MB
											</p>
										</div>
									</div>
								</div>
							</div>
						</Card.Root>
					</div>
				{/if}
			</div>

			<!-- FOOTER NAVIGATION -->
			<div class="flex items-center justify-between mt-8 mb-5">
				<Button
					variant="ghost"
					onclick={prevStep}
					disabled={currentStep === 1}
					class="h-14 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2"
				>
					<MoveLeft class="w-4 h-4" stroke-width={1} />
					Back
				</Button>

				{#if currentStep < 4}
					<Button
						onclick={nextStep}
						class="h-14 px-10 rounded-xl bg-brand hover:bg-brand-muted hover:text-brand text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-2"
					>
						Continue
						<MoveRight class="w-4 h-4" stroke-width={1} />
					</Button>
				{:else}
					<Button
						onclick={handleSubmit}
						disabled={isSubmitting}
						class="h-14 px-10 rounded-xl bg-brand hover:bg-brand-muted hover:text-brand text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-2"
					>
						{#if isSubmitting}<Sparkles
								class="w-4 h-4 animate-spin"
							/>Submitting...{:else}Submit
							<MoveRight class="w-4 h-4" stroke-width={1} />{/if}
					</Button>
				{/if}
			</div>
		{:else}
			<!-- SUCCESS SCREEN -->
			<div
				in:fly={{ y: 60, duration: 800 }}
				class="max-w-2xl mx-auto py-24 text-center space-y-12"
			>
				<div class="relative inline-block">
					<div
						class="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto border-[6px] border-[#f0fcfb] animate-bounce"
					>
						<PartyPopper class="w-16 h-16 text-brand" stroke-width={1.5} />
					</div>
					<div
						class="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-50"
					>
						<Sparkles class="w-6 h-6 text-brand" />
					</div>
				</div>
				<div class="space-y-4">
					<h1
						class="text-4xl font-black text-slate-900 tracking-tight leading-[1.0]"
					>
						Profile Complete!
					</h1>
					<p
						class="text-slate-500 text-lg font-bold max-w-sm mx-auto leading-relaxed"
					>
						Your AI practice routine is ready. We've calibrated your targets and
						schedule.
					</p>
				</div>
				<Button
					onclick={() => goto("/dashboard")}
					class="w-4/5 mx-auto h-14 rounded-2xl bg-brand hover:bg-brand-muted hover:text-brand text-white font-black text-lg shadow-xl group transition-all hover:scale-[1.02] active:scale-95"
					>Enter Dashboard<ArrowRight
						class="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform"
						stroke-width={4}
					/></Button
				>
			</div>
		{/if}
	</div>
</div>

<style>
	@reference "../../layout.css";
	:global(body) {
		background-color: #ffffff;
	}
	:global([data-slot="slider-track"]) {
		@apply bg-slate-200/50 h-1;
	}
	:global([data-slot="slider-range"]) {
		@apply bg-brand;
	}
	:global([data-slot="slider-thumb"]) {
		@apply border-white border-[4px] shadow-none scale-110 transition-transform bg-brand;
	}
</style>
