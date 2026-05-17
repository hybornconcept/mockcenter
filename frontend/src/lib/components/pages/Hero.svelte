<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import {
		Users,
		Star,
		ArrowUpRight,
		CirclePlus,
		Package,
	} from "@lucide/svelte";

	let isSecondCardHovered = $state(false);
	let isThirdCardHovered = $state(false);

	$derived: {
		// derived widths kept as reactive computations for clarity
	}

	const BASE_W = 150;
	const EXPANDED_W = 310;
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="w-full min-h-screen overflow-x-hidden font-sans antialiased text-gray-900"
>
	<!-- HERO SECTION - Edge-to-Edge -->
	<section
		class="relative w-full bg-linear-to-b from-brand/35 via-brand-muted/20 to-background pt-22 md:pt-22"
	>
		<div class="max-w-[1350px] mx-auto w-full px-6 md:px-10 lg:px-16">
			<!-- MAIN HERO CONTENT -->
			<main
				class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-4 lg:mt-8"
			>
				<!-- LEFT COLUMN: Typography & Action -->
				<div
					class="flex flex-col gap-2.5 lg:pr-8 text-center lg:text-left items-center lg:items-start relative z-10"
				>
					<!-- Badge -->
					<div class="inline-flex items-center gap-2.5 rounded-full">
						<div
							class="w-8 h-8 bg-brand-dark text-white rounded-full flex justify-center items-center shrink-0"
						>
							<Users class="w-3.5 h-3.5" strokeWidth={2.5} />
						</div>
						<div class="text-[0.8rem] leading-tight text-left text-brand-dark">
							<span class="font-black tracking-tight">100k+ Users</span><br />
							<span class="text-brand-dark/80 font-medium"
								>Read Our <a href="#testimonials">
									<u
										class="font-bold decoration-2 underline-offset-1 cursor-pointer hover:text-brand transition-colors"
										>Success Stories</u
									></a
								></span
							>
						</div>
					</div>

					<!-- Hero Title -->
					<h1
						class="mb-1 text-7xl leading-[0.95] tracking-tight font-black text-brand-dark"
						style="font-family: 'Poppins', 'Nunito Sans', 'Inter', sans-serif;"
					>
						Pass your<br /> Exam with Confidence.
					</h1>

					<!-- Hero Subtitle -->
					<p
						class="text-md mb-2 leading-snug text-brand-dark/80 max-w-md m-0 font-medium"
					>
						Join thousands of students who've boosted their online exam's
						performace with our AI-driven platform that
					</p>

					<hr class="border-t border-brand-dark/15 my-1 w-[70%]" />

					<!-- Ratings Review -->
					<div
						class="flex items-center justify-center lg:justify-start gap-2.5"
					>
						<div class="relative shrink-0">
							<img src="https://randomuser.me/api/portraits/women/44.jpg"
								alt="User"
								class="w-9 h-9 rounded-full object-cover shadow-sm bg-white" loading="lazy" />
							<div class="absolute -top-1 -left-1.5 text-brand">
								<Star class="w-3.5 h-3.5 fill-current stroke-none" />
							</div>
						</div>
						<div class="flex flex-col text-[0.8rem] text-left">
							<div
								class="font-semibold flex items-center gap-2 text-brand-dark"
							>
								<span>Loved the performance</span>
								<span class="text-brand-dark/40 font-normal">/</span>
								<span class="font-black flex items-center gap-1"
									><span class="text-brand">★</span> 4.9</span
								>
							</div>
							<div class="text-brand-dark/70 font-medium">100% Satisfied</div>
						</div>
					</div>

					<hr class="border-t border-brand-dark/15 my-1 w-[70%]" />

					<!-- Call To Action -->
					<div
						class="flex flex-wrap justify-center lg:justify-start items-center gap-4 mt-1.5"
					>
						<a
							href="/dashboard"
							class="bg-brand-dark text-white px-6 py-3 rounded-full font-bold text-[0.9rem] hover:bg-brand hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-200"
						>
							Get Started <span class="text-white/70 font-medium ml-1"
								>— It's Free</span
							>
						</a>
						<a
							href="#pricing"
							class="text-brand-dark font-bold text-[0.95rem] flex items-center gap-1 hover:text-brand transition-colors group"
						>
							Our Pricing <ArrowUpRight
								class="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
							/>
						</a>
					</div>
				</div>

				<!-- RIGHT COLUMN: Interactive Animated Cards -->
				<div
					class="flex w-full items-center justify-center xl:justify-end gap-3 sm:gap-4 mt-10 lg:mt-0 overflow-visible perspective-[1000px]"
				>
					<!-- Main Card -->
					<Card
						id="first-card"
						class="relative z-10 h-[418px] lg:h-[462px] shrink-0 overflow-hidden rounded-2xl shadow-xl border-brand/30"
						style="
							width: {isSecondCardHovered || isThirdCardHovered ? BASE_W : EXPANDED_W}px;
							transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1);
							will-change: width;
						"
					>
						<CardContent class="h-full w-full p-0">
							<img src="happy-student-girl.jpg"
								alt="Writing Course"
								class="absolute inset-0 h-full w-full object-cover"
								style="
									transform: scale({isSecondCardHovered || isThirdCardHovered ? 1.04 : 1});
									object-position: {isSecondCardHovered || isThirdCardHovered
									? '40% center'
									: 'center'};
									transition: transform 320ms cubic-bezier(0.4, 0, 0.2, 1), object-position 320ms cubic-bezier(0.4, 0, 0.2, 1);
									will-change: transform;
								" loading="lazy" />
							<!-- Brand overlay -->
							<div class="pointer-events-none absolute inset-0">
								<div
									class="h-full w-full bg-linear-to-t from-brand-dark/70 via-brand-dark/15 to-transparent"
								></div>
							</div>
							<div class="absolute bottom-6 left-6 text-white min-w-[200px]">
								<div class="text-xl font-semibold drop-shadow border-none">
									Writing Course
								</div>
								<div class="mt-1 flex items-end gap-1">
									<span class="text-2xl font-bold drop-shadow">100</span>
									<span
										class="mb-1 text-[10px] font-bold tracking-wide drop-shadow border-none text-brand-muted uppercase"
										>Topics</span
									>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Tall Card 1 -->
					<Card
						id="second-card"
						class="relative z-10 h-[418px] lg:h-[462px] shrink-0 overflow-hidden rounded-2xl shadow-xl border-brand/30 cursor-pointer"
						style="
							width: {isSecondCardHovered ? EXPANDED_W : BASE_W}px;
							transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1);
							will-change: width;
						"
						onmouseenter={() => (isSecondCardHovered = true)}
						onmouseleave={() => (isSecondCardHovered = false)}
					>
						<CardContent class="h-full w-full p-0">
							<img src="second.jpg"
								alt="Writing"
								class="absolute inset-0 h-full w-full object-cover"
								style="
									transform: scale({isSecondCardHovered ? 1 : 1.04});
									object-position: {isSecondCardHovered ? 'center' : '60% center'};
									transition: transform 320ms cubic-bezier(0.4, 0, 0.2, 1), object-position 320ms cubic-bezier(0.4, 0, 0.2, 1);
									will-change: transform;
								" loading="lazy" />
							<!-- Brand overlay -->
							<div class="pointer-events-none absolute inset-0">
								<div
									class="h-full w-full bg-linear-to-t from-brand-dark/70 via-brand-dark/15 to-transparent"
								></div>
							</div>
							<div
								class="absolute bottom-8 left-1/2 origin-bottom-left -translate-x-1/2 -rotate-90"
								style="opacity: {!isSecondCardHovered
									? 1
									: 0}; transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1);"
							>
								<span
									class="text-lg font-semibold tracking-wide text-brand-muted drop-shadow whitespace-nowrap border-none"
									>Writing</span
								>
							</div>
							<div
								class="absolute bottom-6 left-6 min-w-[200px]"
								style="opacity: {isSecondCardHovered
									? 1
									: 0}; transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1) {isSecondCardHovered
									? '80ms'
									: '0ms'};"
							>
								<div
									class="text-xl font-semibold text-white drop-shadow border-none"
								>
									Writing
								</div>
								<div class="mt-1 flex items-end gap-1 border-none">
									<span
										class="text-2xl font-bold text-white drop-shadow border-none"
										>80</span
									>
									<span
										class="mb-1 text-[10px] font-bold tracking-wide text-brand-muted drop-shadow border-none uppercase"
										>Topics</span
									>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Tall Card 2 -->
					<Card
						id="third-card"
						class="relative h-[418px] lg:h-[462px] shrink-0 overflow-hidden rounded-2xl shadow-xl border-brand/30 cursor-pointer"
						style="
							width: {isThirdCardHovered ? EXPANDED_W : BASE_W}px;
							transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1);
							will-change: width;
						"
						onmouseenter={() => (isThirdCardHovered = true)}
						onmouseleave={() => (isThirdCardHovered = false)}
					>
						<CardContent class="h-full p-0 w-full border-none">
							<img src="third.jpg"
								alt="Business"
								class="absolute inset-0 h-full w-full object-cover"
								style="
									transform: scale({isThirdCardHovered ? 1 : 1.04});
									object-position: {isThirdCardHovered ? 'center' : '60% center'};
									transition: transform 320ms cubic-bezier(0.4, 0, 0.2, 1), object-position 320ms cubic-bezier(0.4, 0, 0.2, 1);
									will-change: transform;
								" loading="lazy" />
							<!-- Brand overlay -->
							<div class="pointer-events-none absolute inset-0">
								<div
									class="h-full w-full bg-linear-to-t from-brand-dark/70 via-brand-dark/15 to-transparent"
								></div>
							</div>
							<div
								class="absolute bottom-8 left-1/2 origin-bottom-left -translate-x-1/2 -rotate-90"
								style="opacity: {!isThirdCardHovered
									? 1
									: 0}; transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1);"
							>
								<span
									class="text-lg font-semibold tracking-wide text-brand-muted drop-shadow whitespace-nowrap border-none"
									>Business</span
								>
							</div>
							<div
								class="absolute bottom-6 left-6 min-w-[200px]"
								style="opacity: {isThirdCardHovered
									? 1
									: 0}; transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1) {isThirdCardHovered
									? '80ms'
									: '0ms'};"
							>
								<div
									class="text-xl font-semibold text-white drop-shadow border-none"
								>
									Business
								</div>
								<div class="mt-1 flex items-end gap-1">
									<span
										class="text-2xl font-bold text-white drop-shadow border-none"
										>65</span
									>
									<span
										class="mb-1 text-[10px] font-bold tracking-wide text-brand-muted drop-shadow border-none uppercase"
										>Topics</span
									>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	</section>

	<!-- LOGOS SECTION -->
	<!-- <section class="w-full pt-12 pb-10 px-6">
		<div
			class="max-w-[1200px] mx-auto flex flex-wrap justify-center lg:justify-between items-center gap-10 text-black/80"
		>
			<div class="font-bold text-[1.3rem] tracking-tighter">Rakuten</div>

			<div class="font-bold text-[1.3rem] flex items-center gap-1.5 opacity-90">
				<CirclePlus class="w-[22px] h-[22px]" strokeWidth={2.5} />
				NCR
			</div>

			<div class="font-extrabold text-[1.4rem] tracking-tight opacity-95">
				#.monday<span class="font-normal tracking-normal text-[1.35rem]"
					>.com</span
				>
			</div>

			<div
				class="text-[1.6rem] font-medium tracking-normal opacity-90"
				style="font-family: 'Playfair Display', serif; font-style: italic;"
			>
				Disney
			</div>

			<div class="font-bold text-[1.3rem] flex items-center gap-2 opacity-90">
				<Package class="w-6 h-6 fill-current stroke-none" />
				Dropbox
			</div>
		</div>
	</section> -->
</div>
