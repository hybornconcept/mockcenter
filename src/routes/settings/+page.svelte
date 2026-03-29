<script lang="ts">
	import {
		X,
		Image,
		Shuffle,
		RotateCcw,
		SkipForward,
		Database,
		BadgeCheck,
		FileText,
		Move,
		Zap,
		LayoutGrid,
		Clock,
	} from "@lucide/svelte";
	import { Switch } from "$lib/components/ui/switch";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	let shuffle = $state(true);
	let redemption = $state(false);
	let skip = $state(true);
	let adaptive = $state(false);
	let passMark = $state(50);
	let passUnit = $state("percent"); // percent | point
</script>

<div class="min-h-screen bg-white flex flex-col font-sans text-slate-900">
	<!-- Top Bar -->
	<header
		class="h-16 border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur-md z-20"
	>
		<Button
			variant="ghost"
			size="icon"
			class="rounded-lg hover:bg-slate-100 text-slate-500"
		>
			<X class="w-5 h-5" />
		</Button>
		<h1 class="font-bold text-base tracking-tight">Create new Quiz</h1>
		<Button
			class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm px-6 rounded-lg transition-colors"
		>
			Continue
		</Button>
	</header>

	<div class="flex-1 flex w-full max-w-[1400px] mx-auto">
		<!-- Left Panel: Preview/Details -->
		<div class="flex-1 p-8 lg:p-8 overflow-y-auto">
			<div class="max-w-3xl mx-auto space-y-10">
				<!-- Banner Area -->
				<div
					class="group relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-[2.2/1] shadow-sm"
				>
					<!-- Background Pattern/Image Placeholder -->
					<div
						class="absolute inset-0 bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] flex items-center justify-center p-4"
					>
						<img
							src="https://img.freepik.com/free-vector/ui-ux-designers-isometric-composition-with-small-people-creating-custom-design-web-site_1284-68939.jpg"
							alt="Banner"
							class="w-full h-full object-contain mix-blend-multiply opacity-90 transition-transform duration-700"
						/>
					</div>

					<!-- Floating Actions -->
					<div
						class="absolute bottom-4 right-4 flex gap-2 opacity-100 transition-all"
					>
						<Button
							variant="secondary"
							size="sm"
							class="gap-1.5 bg-white shadow-sm hover:bg-slate-50 border border-slate-200 text-xs font-bold h-8 rounded-lg text-slate-700 px-3"
						>
							<Image class="w-3.5 h-3.5" /> Update thumbnail
						</Button>
						<Button
							variant="secondary"
							size="sm"
							class="gap-1.5 bg-white shadow-sm hover:bg-slate-50 border border-slate-200 text-xs font-bold h-8 rounded-lg text-slate-700 px-3"
						>
							<Move class="w-3.5 h-3.5" /> Reposition
						</Button>
					</div>

					<!-- Icon Badge -->
					<div
						class="absolute -bottom-6 left-8 w-16 h-16 bg-[#FBBF24] rounded-2xl border-[5px] border-white shadow-lg flex items-center justify-center z-10"
					>
						<FileText class="w-8 h-8 text-white stroke-[2.5]" />
					</div>
				</div>

				<div class="space-y-8 pt-4">
					<div>
						<h2
							class="text-[28px] font-extrabold text-slate-900 mb-5 tracking-tight leading-tight"
						>
							UI Design Fundamentals & Best Practice
						</h2>

						<div class="flex flex-wrap items-center gap-6 text-sm">
							<div class="flex items-center gap-3">
								<LayoutGrid class="w-4 h-4 text-slate-400" />
								<span class="text-slate-500 font-medium">Category</span>
								<div class="flex gap-2">
									<span
										class="px-2.5 py-1 bg-[#F1F5F9] text-slate-600 rounded-md text-[11px] font-bold"
										>Fundamental</span
									>
									<span
										class="px-2.5 py-1 bg-[#F1F5F9] text-slate-600 rounded-md text-[11px] font-bold"
										>Design</span
									>
									<span
										class="px-2.5 py-1 bg-[#F1F5F9] text-slate-600 rounded-md text-[11px] font-bold"
										>Not Urgent</span
									>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<Clock class="w-4 h-4 text-slate-400" />
								<span class="text-slate-500 font-medium">Estimate duration</span
								>
								<span class="font-bold text-slate-800 text-sm">1 hours</span>
							</div>
						</div>
					</div>

					<div
						class="prose prose-slate max-w-none text-slate-600 text-[13px] leading-relaxed"
					>
						<p>
							Unlock the secrets to crafting compelling and user-centric digital
							experiences with our "UI Design Fundamentals & Best Practices"
							course. Whether you're a beginner eager to dive into the world of
							User Interface (UI) design or a seasoned professional looking to
							enhance your skills, this course provides a comprehensive journey
							through the core principles and industry-best practices.
						</p>

						<p class="font-bold text-slate-900 mt-6 mb-2">Instructions:</p>
						<ul class="space-y-1 list-disc pl-4 marker:text-slate-400 mt-0">
							<li>There are 10 questions in this quiz.</li>
							<li>
								Each question will present a brief description of UI Design
								Fundamentals & Best Practice.
							</li>
							<li>
								Choose the answer that you believe best matches the description.
							</li>
							<li>You have 1mins to answer each question.</li>
						</ul>

						<p class="mt-6 text-slate-500">
							I hope this helps! If you have any more questions or need further
							assistance, feel free to ask.
						</p>
					</div>
				</div>

				<div class="pt-2">
					<div class="relative">
						<Input
							placeholder="Let your learner know a little about the quiz"
							class="border-0 border-b border-slate-200 rounded-none px-0 py-2 text-sm focus-visible:ring-0 focus-visible:border-indigo-600 transition-all placeholder:text-slate-400"
						/>
						<span
							class="absolute right-0 bottom-2 text-[10px] text-slate-400 font-medium"
							>302/400</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Right Panel: Settings Sidebar -->
		<aside
			class="w-[700px] bg-white border-l border-slate-100 flex flex-col shadow-[box-shadow: -4px 0 24px rgba(0,0,0,0.02)] z-10"
		>
			<div class="p-6">
				<div class="flex items-center gap-3 mb-8">
					<button
						class="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
					>
						<SkipForward class="w-3.5 h-3.5 rotate-180" />
					</button>
					<h3 class="font-extrabold text-[17px] text-slate-900">
						Question Settings
					</h3>
				</div>

				<div class="grid grid-cols-2 gap-6 items-start">
					<!-- Question Section -->
					<div class="space-y-4">
						<div
							class="flex items-center justify-between cursor-pointer group pb-1"
						>
							<h4
								class="font-bold text-[13px] text-slate-800 group-hover:text-indigo-600 transition-colors"
							>
								Question
							</h4>
							<SkipForward class="w-3.5 h-3.5 text-slate-400 rotate-90" />
						</div>

						<!-- Settings Stack -->
						<div class="space-y-4">
							<!-- Standard Card -->
							<div
								class="bg-white rounded-xl border border-slate-200 pt-1 pb-1 shadow-sm overflow-hidden"
							>
								<div
									class="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
								>
									<div class="flex gap-3">
										<div
											class="mt-0.5 w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-600 shadow-sm bg-white"
										>
											<Shuffle class="w-3.5 h-3.5" />
										</div>
										<div class="space-y-1">
											<label
												for="shuffle"
												class="text-[13px] font-bold text-slate-900 block cursor-poinster"
												>Shuffle questions</label
											>
											<p
												class="text-[10px] text-slate-500 leading-relaxed max-w-[220px]"
											>
												Let the system randomly select a defined amount of
												questions from your question pool.
											</p>
										</div>
									</div>
									<Switch
										id="shuffle"
										bind:checked={shuffle}
										class="data-[state=checked]:bg-emerald-500 scale-90"
									/>
								</div>

								<div class="h-px bg-slate-100 mx-4"></div>

								<div
									class="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
								>
									<div class="flex gap-3">
										<div
											class="mt-0.5 w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-600 shadow-sm bg-white"
										>
											<RotateCcw class="w-3.5 h-3.5" />
										</div>
										<div class="space-y-1">
											<label
												for="redemption"
												class="text-[13px] font-bold text-slate-900 block cursor-pointer"
												>Redemption Question</label
											>
											<p
												class="text-[10px] text-slate-500 leading-relaxed max-w-[220px]"
											>
												Allow learners to reattempt a few incorrect questions.
											</p>
										</div>
									</div>
									<Switch
										id="redemption"
										bind:checked={redemption}
										class="data-[state=checked]:bg-emerald-500 scale-90"
									/>
								</div>
							</div>

							<!-- Pro Feature Card -->
							<div
								class="bg-white rounded-xl border border-[#FCD34D] p-5 shadow-sm relative overflow-hidden ring-1 ring-amber-100"
							>
								<!-- Header -->
								<div class="flex items-center gap-3 mb-5 relative z-10">
									<div
										class="w-8 h-8 rounded-full bg-[#FBBF24] flex items-center justify-center shrink-0 text-white shadow-sm ring-2 ring-white"
									>
										<Zap class="w-4 h-4 fill-white" />
									</div>
									<div>
										<div class="flex items-center gap-2">
											<span class="font-bold text-slate-900 text-[13px]"
												>Improve test scores</span
											>
											<span
												class="bg-[#FBBF24] text-white text-[9px] font-bold px-1.5 py-px rounded"
												>Pro</span
											>
										</div>
										<p class="text-[10px] font-medium text-slate-500">
											Try out these super features to promote mastery
										</p>
									</div>
								</div>

								<!-- Items -->
								<div class="space-y-5 relative z-10">
									<div class="flex items-start justify-between gap-4">
										<div class="flex gap-3">
											<div
												class="mt-0.5 w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-600 shadow-sm bg-white"
											>
												<SkipForward class="w-3.5 h-3.5" />
											</div>
											<div class="space-y-1">
												<label
													for="skip"
													class="text-[13px] font-bold text-slate-900 block cursor-pointer"
													>Skip Questions & Attempt Later</label
												>
												<p class="text-[10px] text-slate-500 leading-relaxed">
													Allow students to skip questions and revisit them
													later during the quiz.
												</p>
												<button
													class="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5 mt-1"
													>See how it Works <Move
														class="w-3 h-3 rotate-180"
													/></button
												>
											</div>
										</div>
										<Switch
											id="skip"
											bind:checked={skip}
											class="data-[state=checked]:bg-emerald-500 shrink-0 scale-90"
										/>
									</div>

									<div class="h-px bg-amber-100"></div>

									<div
										class="flex items-start justify-between gap-4 opacity-40 hover:opacity-100 transition-opacity"
									>
										<div class="flex gap-3">
											<div
												class="mt-0.5 w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-600 shadow-sm bg-white"
											>
												<Database class="w-3.5 h-3.5" />
											</div>
											<div class="space-y-1">
												<label
													for="adaptive"
													class="text-[13px] font-bold text-slate-900 block cursor-pointer"
													>Adaptive question bank mode</label
												>
												<p class="text-[10px] text-slate-500 leading-relaxed">
													Generate a unique set of questions every time to
													prevent copying and rote learning.
												</p>
												<button
													class="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5 mt-1"
													>Preview Templates <Move
														class="w-3 h-3 rotate-180"
													/></button
												>
											</div>
										</div>
										<Switch
											id="adaptive"
											bind:checked={adaptive}
											class="data-[state=checked]:bg-emerald-500 shrink-0 scale-90"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Right Column (Answers + Attempts) -->
					<div class="space-y-8">
						<!-- Answer Section -->
						<div class="space-y-4">
							<div
								class="flex items-center justify-between cursor-pointer group pb-1"
							>
								<h4
									class="font-bold text-[13px] text-slate-800 group-hover:text-indigo-600 transition-colors"
								>
									Answer
								</h4>
								<SkipForward class="w-3.5 h-3.5 text-slate-400 rotate-90" />
							</div>

							<div
								class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5"
							>
								<div class="flex items-start justify-between gap-4">
									<div class="flex gap-3">
										<div
											class="mt-0.5 w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-600 shadow-sm bg-white"
										>
											<BadgeCheck class="w-3.5 h-3.5" />
										</div>
										<div class="space-y-1">
											<label
												for="passmark"
												class="text-[13px] font-bold text-slate-900 block cursor-pointer"
												>Pass mark</label
											>
											<p
												class="text-[10px] text-slate-500 leading-relaxed max-w-[200px]"
											>
												This will let you set minimum point to your learners to
												earn to pass through this quiz.
											</p>
										</div>
									</div>
									<Switch
										id="passmark"
										checked={true}
										class="data-[state=checked]:bg-emerald-500 scale-90"
									/>
								</div>

								<div class="pt-1">
									<div
										class="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
									>
										<span>Value</span>
										<span>Unit</span>
									</div>
									<div class="flex items-center justify-between gap-4">
										<div class="w-full relative">
											<Input
												type="number"
												bind:value={passMark}
												class="pl-3 bg-[#F8FAFC] border-slate-100 font-bold text-slate-900 text-sm h-9 focus-visible:ring-indigo-500"
											/>
											<span
												class="absolute right-3 inset-y-0 flex items-center text-slate-400 font-bold text-[10px] uppercase"
												>{passUnit === "percent" ? "%" : "Pts"}</span
											>
										</div>

										<div
											class="flex items-center gap-6 shrink-0 bg-transparent p-0 rounded-lg border-none"
										>
											<label
												class="flex items-center gap-2 cursor-pointer group"
											>
												<div
													class="w-4 h-4 rounded-full border bg-white flex items-center justify-center transition-all {passUnit ===
													'percent'
														? 'border-[#4338ca]'
														: 'border-slate-300 group-hover:border-slate-400'}"
												>
													{#if passUnit === "percent"}
														<div
															class="w-2 h-2 bg-[#4338ca] rounded-full"
														></div>
													{/if}
												</div>
												<span class="text-[13px] font-bold text-slate-800"
													>%</span
												>
												<input
													type="radio"
													value="percent"
													bind:group={passUnit}
													class="hidden"
												/>
											</label>

											<label
												class="flex items-center gap-2 cursor-pointer group"
											>
												<div
													class="w-4 h-4 rounded-full border bg-white flex items-center justify-center transition-all {passUnit ===
													'point'
														? 'border-[#4338ca]'
														: 'border-slate-300 group-hover:border-slate-400'}"
												>
													{#if passUnit === "point"}
														<div
															class="w-2 h-2 bg-[#4338ca] rounded-full"
														></div>
													{/if}
												</div>
												<span class="text-[13px] font-bold text-slate-800"
													>Point</span
												>
												<input
													type="radio"
													value="point"
													bind:group={passUnit}
													class="hidden"
												/>
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div
							class="flex items-center justify-between opacity-50 cursor-pointer pt-2"
						>
							<h4 class="font-bold text-[13px] text-slate-800">Attempt</h4>
							<SkipForward class="w-3.5 h-3.5 text-slate-400 rotate-90" />
						</div>
					</div>
				</div>
			</div>
		</aside>
	</div>
</div>
