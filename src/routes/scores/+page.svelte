<script lang="ts">
	import {
		Search,
		Settings,
		Bell,
		ChevronDown,
		ArrowDown,
		ArrowUp,
		Filter,
		MoreVertical,
		Heart,
	} from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";

	// --- Mock Data ---
	const topLearners = [
		{
			name: "Ahmad Curtis",
			streak: "12 days",
			level: "Beginner",
			date: "June 21",
			progress: 59,
			avatar: "https://i.pravatar.cc/150?u=1",
		},
		{
			name: "Emma Smith",
			streak: "7 days",
			level: "Expert",
			date: "June 1",
			progress: 35,
			avatar: "https://i.pravatar.cc/150?u=2",
		},
		{
			name: "William Hall",
			streak: "7 days",
			level: "Intermediate",
			date: "May 16",
			progress: 88,
			avatar: "https://i.pravatar.cc/150?u=3",
		},
		{
			name: "Liam Lee",
			streak: "4days",
			level: "Beginner",
			date: "May 2",
			progress: 23,
			avatar: "https://i.pravatar.cc/150?u=4",
		},
	];
</script>

<div class="w-full min-h-full bg-white">
	<!-- Header -->
	<header
		class="flex items-center justify-between px-6 py-5 sticky top-0 bg-white/95 backdrop-blur-sm z-10"
	>
		<h1 class="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>

		<!-- Search -->
		<div class="relative w-[320px] hidden lg:block">
			<Search
				class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
			/>
			<Input
				placeholder="Search request..."
				class="pl-5 pr-10 h-10 rounded-full border-slate-200 bg-white hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-300 transition-all text-sm shadow-sm placeholder:text-slate-400"
			/>
		</div>

		<!-- Right Actions -->
		<div class="flex items-center gap-4">
			<button
				class="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
			>
				<Settings class="w-4 h-4" />
			</button>
			<button
				class="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors relative"
			>
				<Bell class="w-4 h-4" />
				<span
					class="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white ring-1 ring-white"
				></span>
			</button>
			<Button
				class="rounded-full bg-[#1e1e1e] text-white px-6 h-9 font-semibold text-xs hover:bg-black shadow-md"
			>
				Upgrade plan
			</Button>
			<div class="flex items-center gap-1 pl-1 cursor-pointer">
				<img
					src="https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg"
					alt="Profile"
					class="w-9 h-9 rounded-full object-cover border border-slate-200"
				/>
				<ChevronDown class="w-3 h-3 text-slate-400" />
			</div>
		</div>
	</header>

	<div class="px-6 pb-6">
		<!-- Top Section: Learners Goal -->
		<div class="flex items-center gap-12 mb-10 mt-2">
			<div class="shrink-0">
				<div class="flex items-baseline">
					<span
						class="text-[72px] font-bold leading-none tracking-tighter text-slate-900"
						>98</span
					>
				</div>
				<div class="text-slate-400 font-medium ml-1 text-sm mt-1">
					learners on the platform
				</div>
			</div>

			<div class="flex-1 space-y-3 pt-3">
				<div class="text-emerald-500 font-bold text-xs tracking-wide">
					20% <span class="text-slate-400 font-medium">closer to your goal</span
					>
				</div>
				<div
					class="h-[60px] w-full bg-white rounded-xl relative flex items-center px-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-50"
				>
					<!-- Gradient Bar Container -->
					<div class="absolute inset-0 rounded-xl overflow-hidden">
						<!-- The Gradient -->
						<div
							class="absolute top-0 left-0 bottom-0 w-[65%] bg-gradient-to-r from-[#fda4a4] via-[#fcd34d] to-[#6ee7b7]"
						></div>
						<!-- Blur effect for the glow -->
						<div
							class="absolute top-3 left-0 bottom-3 w-[65%] bg-gradient-to-r from-[#fda4a4] via-[#fcd34d] to-[#6ee7b7] blur-lg opacity-50"
						></div>
						<!-- Glass overlay -->
						<div
							class="absolute top-0 right-0 bottom-0 w-[35%] bg-slate-50/50 backdrop-blur-[2px]"
						></div>
					</div>

					<!-- Marker Line -->
					<div
						class="absolute top-[15%] bottom-[15%] left-[65%] w-[1.5px] bg-slate-800/80 rounded-full z-20"
					></div>

					<!-- Text Marker -->
					<div class="relative z-20 text-slate-900 font-bold text-xs ml-5">
						10k
					</div>
				</div>
			</div>
		</div>

		<!-- Stats Grid -->
		<div
			class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 border-b border-slate-100 pb-8"
		>
			<!-- Stat 1 -->
			<div class="pr-6 border-r border-slate-100 last:border-0">
				<div class="text-slate-900 text-xs font-bold mb-3">
					Active instructors
				</div>
				<div class="flex items-end gap-2">
					<div
						class="w-5 h-5 rounded-full bg-[#fee2e2] flex items-center justify-center text-red-500 mb-1"
					>
						<ArrowDown class="w-3 h-3 stroke-[3px]" />
					</div>
					<span class="text-2xl font-bold text-slate-900 leading-none"
						>12,639</span
					>
					<span class="text-red-400 text-[10px] font-bold mb-0.5 ml-1"
						>12% from last month</span
					>
				</div>
			</div>

			<!-- Stat 2 -->
			<div class="px-6 border-r border-slate-100 last:border-0">
				<div class="text-slate-900 text-xs font-bold mb-3">
					Active instructors
				</div>
				<div class="flex items-end gap-2">
					<div
						class="w-5 h-5 rounded-full bg-[#fee2e2] flex items-center justify-center text-red-500 mb-1"
					>
						<ArrowDown class="w-3 h-3 stroke-[3px]" />
					</div>
					<span class="text-2xl font-bold text-slate-900 leading-none"
						>12,639</span
					>
					<span class="text-red-400 text-[10px] font-bold mb-0.5 ml-1"
						>12% from last month</span
					>
				</div>
			</div>

			<!-- Stat 3 -->
			<div class="pl-6">
				<div class="text-slate-900 text-xs font-bold mb-3">
					Course completion rate
				</div>
				<div class="flex items-end gap-2">
					<div
						class="w-5 h-5 rounded-full bg-[#dcfce7] flex items-center justify-center text-emerald-600 mb-1"
					>
						<ArrowUp class="w-3 h-3 stroke-[3px]" />
					</div>
					<span class="text-2xl font-bold text-slate-900 leading-none">65%</span
					>
					<span class="text-emerald-500 text-[10px] font-bold mb-0.5 ml-1"
						>8% from last month</span
					>
				</div>
			</div>
		</div>

		<!-- Bottom Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
			<!-- Left: Top Learners -->
			<div>
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-baseline gap-3">
						<h3 class="text-lg font-bold text-slate-900">Top learners</h3>
						<span class="text-slate-400 text-xs font-medium"
							>125K total, review their progress</span
						>
					</div>
					<div
						class="border border-slate-100 p-0.5 rounded-full flex text-[10px] font-bold"
					>
						<button class="px-4 py-1.5 bg-slate-900 text-white rounded-full"
							>Week</button
						>
						<button
							class="px-4 py-1.5 text-slate-400 hover:text-slate-600 rounded-full"
							>Month</button
						>
					</div>
				</div>

				<div class="space-y-6">
					{#each topLearners as learner}
						<div class="flex items-center justify-between group">
							<div class="flex items-center gap-4 w-[35%]">
								<img
									src={learner.avatar}
									alt={learner.name}
									class="w-10 h-10 rounded-xl object-cover"
								/>
								<div>
									<div class="font-bold text-slate-900 text-sm">
										{learner.name}
									</div>
									<div class="text-slate-400 text-[10px] mt-0.5">
										Learning streak: {learner.streak}
									</div>
								</div>
							</div>

							<div class="w-[20%]">
								<div
									class="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-700 min-w-[90px]"
								>
									<span class="w-1 h-2.5 rounded-full bg-slate-800"></span>
									{learner.level}
								</div>
							</div>

							<div
								class="w-[20%] flex items-center gap-1.5 text-[11px] font-bold text-slate-500"
							>
								<span class="w-3.5 h-3.5 text-slate-300 fill-slate-300">📅</span
								>
								{learner.date}
							</div>

							<div class="flex items-center gap-2 w-[15%]">
								<div class="w-4 h-4 relative">
									<!-- Ring Background -->
									<svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
										<path
											class="text-slate-100"
											d="M18 2.0845
                                                      a 15.9155 15.9155 0 0 1 0 31.831
                                                      a 15.9155 15.9155 0 0 1 0 -31.831"
											fill="none"
											stroke="currentColor"
											stroke-width="4"
										/>
										<path
											class="text-indigo-400"
											stroke-dasharray="{learner.progress}, 100"
											d="M18 2.0845
                                                      a 15.9155 15.9155 0 0 1 0 31.831
                                                      a 15.9155 15.9155 0 0 1 0 -31.831"
											fill="none"
											stroke="currentColor"
											stroke-width="4"
											stroke-linecap="round"
										/>
									</svg>
								</div>
								<span class="text-[11px] font-bold text-slate-700"
									>{learner.progress}%</span
								>
							</div>

							<div class="flex justify-end w-[10%]">
								<button
									class="text-slate-300 hover:text-slate-600 transition-colors"
								>
									<MoreVertical class="w-4 h-4" />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Learner Trends Chart -->
			<div class="pl-8 border-l border-slate-100 h-full min-h-[400px]">
				<div class="flex items-center justify-between mb-10">
					<h3 class="text-lg font-bold text-slate-900">Learner trends</h3>
					<button
						class="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold hover:text-slate-800 transition-colors"
					>
						<Filter class="w-3 h-3" /> Filter
					</button>
				</div>

				<!-- Custom Flower Chart Implementation -->
				<div class="relative w-[340px] h-[340px] mx-auto mt-4">
					<svg viewBox="0 0 340 340" class="w-full h-full overflow-visible">
						<defs>
							<!-- Glow Filter for that soft diffuse look -->
							<filter
								id="petal-glow"
								x="-50%"
								y="-50%"
								width="200%"
								height="200%"
							>
								<feGaussianBlur stdDeviation="10" result="coloredBlur" />
								<feMerge>
									<feMergeNode in="coloredBlur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>

							<!-- Gradients matching the design -->
							<radialGradient
								id="grad-green"
								cx="50%"
								cy="50%"
								r="50%"
								fx="50%"
								fy="50%"
							>
								<stop offset="0%" stop-color="#86efac" stop-opacity="0.9" />
								<stop offset="100%" stop-color="#4ade80" stop-opacity="0.2" />
							</radialGradient>

							<radialGradient
								id="grad-lime"
								cx="50%"
								cy="50%"
								r="50%"
								fx="50%"
								fy="50%"
							>
								<stop offset="0%" stop-color="#bef264" stop-opacity="0.9" />
								<stop offset="100%" stop-color="#a3e635" stop-opacity="0.2" />
							</radialGradient>

							<radialGradient
								id="grad-orange"
								cx="50%"
								cy="50%"
								r="50%"
								fx="50%"
								fy="50%"
							>
								<stop offset="0%" stop-color="#fdba74" stop-opacity="0.9" />
								<stop offset="100%" stop-color="#fb923c" stop-opacity="0.2" />
							</radialGradient>

							<radialGradient
								id="grad-gray"
								cx="50%"
								cy="50%"
								r="50%"
								fx="50%"
								fy="50%"
							>
								<stop offset="0%" stop-color="#f8fafc" stop-opacity="1" />
								<stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.5" />
							</radialGradient>
						</defs>

						<!-- Rotate whole group to position first petal at top-rightish -->
						<g transform="translate(170, 170)">
							<!-- Petal 1: Focus Time (Left Top) - Lime/Green -->
							<!-- Rotation: -60deg (Top Left) -->
							<g transform="rotate(-60)">
								<path
									d="M0,-25 C-35,-60 -45,-120 0,-130 C45,-120 35,-60 0,-25"
									fill="url(#grad-green)"
									filter="url(#petal-glow)"
									opacity="0.9"
								/>
								<g transform="rotate(60) translate(-50, -65)">
									<text
										text-anchor="middle"
										class="font-bold text-[18px] fill-slate-800">90%</text
									>
									<text
										y="14"
										text-anchor="middle"
										class="font-bold text-[11px] fill-slate-500 uppercase"
										>Focus time</text
									>
								</g>
							</g>

							<!-- Petal 2: Engagement (Top Right) - Green -->
							<!-- Rotation: 0deg -->
							<g transform="rotate(0)">
								<path
									d="M0,-25 C-35,-60 -45,-120 0,-130 C45,-120 35,-60 0,-25"
									fill="url(#grad-green)"
									filter="url(#petal-glow)"
									opacity="0.9"
								/>
								<g transform="rotate(0) translate(0, -85)">
									<text
										text-anchor="middle"
										class="font-bold text-[18px] fill-slate-800">87%</text
									>
									<text
										y="14"
										text-anchor="middle"
										class="font-bold text-[11px] fill-slate-500 uppercase"
										>Engagement</text
									>
								</g>
							</g>

							<!-- Petal 3: Consistency (Top Right) - Lime -->
							<!-- Rotation: 60deg -->
							<g transform="rotate(60)">
								<path
									d="M0,-25 C-35,-60 -45,-120 0,-130 C45,-120 35,-60 0,-25"
									fill="url(#grad-lime)"
									filter="url(#petal-glow)"
									opacity="0.9"
								/>
								<g transform="rotate(-60) translate(50, -65)">
									<text
										text-anchor="middle"
										class="font-bold text-[18px] fill-slate-800">89%</text
									>
									<text
										y="14"
										text-anchor="middle"
										class="font-bold text-[11px] fill-slate-500 uppercase"
										>Consistency</text
									>
								</g>
							</g>

							<!-- Petal 4: Motivation (Bottom Right) - Orange -->
							<!-- Rotation: 120deg -->
							<g transform="rotate(120)">
								<path
									d="M0,-25 C-35,-50 -45,-90 0,-100 C45,-90 35,-50 0,-25"
									fill="url(#grad-orange)"
									filter="url(#petal-glow)"
									opacity="0.9"
								/>
								<g transform="rotate(-120) translate(50, 65)">
									<text
										text-anchor="middle"
										class="font-bold text-[18px] fill-slate-800">38%</text
									>
									<text
										y="14"
										text-anchor="middle"
										class="font-bold text-[11px] fill-slate-500 uppercase"
										>Motivation</text
									>
								</g>
							</g>

							<!-- Petal 5: Completion Rate (Bottom) - White/Gray -->
							<!-- Rotation: 180deg -->
							<g transform="rotate(180)">
								<path
									d="M0,-25 C-35,-40 -45,-80 0,-90 C45,-80 35,-40 0,-25"
									fill="#ffffff"
									filter="url(#petal-glow)"
									stroke="#f1f5f9"
									stroke-width="2"
								/>
								<g transform="rotate(-180) translate(0, 85)">
									<text
										text-anchor="middle"
										class="font-bold text-[18px] fill-slate-800">21%</text
									>
									<text
										y="12"
										text-anchor="middle"
										class="font-bold text-[10px] fill-slate-500 uppercase leading-none"
										>Completion</text
									>
									<text
										y="22"
										text-anchor="middle"
										class="font-bold text-[10px] fill-slate-500 uppercase leading-none"
										>rate</text
									>
								</g>
							</g>

							<!-- Petal 6: Retention (Bottom Left) - Orange -->
							<!-- Rotation: 240deg -->
							<g transform="rotate(240)">
								<path
									d="M0,-25 C-35,-50 -45,-90 0,-100 C45,-90 35,-50 0,-25"
									fill="url(#grad-orange)"
									filter="url(#petal-glow)"
									opacity="0.9"
								/>
								<g transform="rotate(-240) translate(-50, 65)">
									<text
										text-anchor="middle"
										class="font-bold text-[18px] fill-slate-800">39%</text
									>
									<text
										y="14"
										text-anchor="middle"
										class="font-bold text-[11px] fill-slate-500 uppercase"
										>Retention</text
									>
								</g>
							</g>
						</g>
					</svg>

					<!-- Center Heart -->
					<div
						class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm ring-4 ring-white"
					>
						<Heart class="w-5 h-5 text-slate-900 fill-slate-900" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar to match clean UI */
	::-webkit-scrollbar {
		width: 5px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
