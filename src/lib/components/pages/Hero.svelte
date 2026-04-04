<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import { tweened } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";
	import {
		Users,
		Star,
		ArrowUpRight,
		CirclePlus,
		Package,
	} from "lucide-svelte";

	let isSecondCardHovered = $state(false);
	let isThirdCardHovered = $state(false);

	const firstCardWidth = tweened(310, { duration: 350, easing: cubicInOut });
	const secondCardWidth = tweened(150, { duration: 350, easing: cubicInOut });
	const thirdCardWidth = tweened(150, { duration: 350, easing: cubicInOut });

	$effect(() => {
		if (isSecondCardHovered) {
			firstCardWidth.set(150);
			secondCardWidth.set(310);
			thirdCardWidth.set(150);
		} else if (isThirdCardHovered) {
			firstCardWidth.set(150);
			secondCardWidth.set(150);
			thirdCardWidth.set(310);
		} else {
			firstCardWidth.set(310);
			secondCardWidth.set(150);
			thirdCardWidth.set(150);
		}
	});
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
		class="relative w-full bg-linear-to-b from-brand/35 via-brand-muted/20 to-background px-6 md:px-12 lg:px-20 pt-6"
	>
		<div class="max-w-7xl mx-auto">
			<!-- HEADER -->
			<header class="flex flex-wrap justify-between items-center pb-6">
				<!-- Logo -->
				<div
					class="flex items-center gap-3 font-bold text-gray-900 text-[0.95rem]"
				>
					<div class="flex gap-1 rotate-45">
						<div
							class="w-1.5 h-3 bg-black rounded-[2px] -translate-y-0.5"
						></div>
						<div class="w-1.5 h-3 bg-black rounded-[2px] translate-y-0.5"></div>
					</div>
					<span>/ Sales@reelers.io</span>
				</div>

				<!-- Desktop Nav -->
				<nav
					class="hidden md:flex items-center gap-6 text-[0.85rem] font-bold text-gray-900"
				>
					<a href="#exams" class="hover:text-gray-500 transition-colors"
						>Exams</a
					>
					<span class="text-xl text-gray-400 mt-[-8px]">.</span>
					<a href="#features" class="hover:text-gray-500 transition-colors"
						>Features</a
					>
					<span class="text-xl text-gray-400 mt-[-8px]">.</span>
					<a href="#refer" class="hover:text-gray-500 transition-colors"
						>Refer & Earn</a
					>
					<span class="text-xl text-gray-400 mt-[-8px]">.</span>
					<a href="#pricing" class="hover:text-gray-500 transition-colors"
						>Pricing</a
					>
					<span class="text-xl text-gray-400 mt-[-8px]">.</span>
					<a href="#faq" class="hover:text-gray-500 transition-colors">FAQ</a>
				</nav>

				<!-- Auth -->
				<div class="flex flex-wrap items-center gap-5">
					<button
						class="font-bold text-gray-900 text-[0.9rem] hover:text-gray-600 transition-colors"
					>
						Log in
					</button>
					<button
						class="border-[1.5px] border-black bg-transparent px-5 py-2.5 rounded-full font-bold text-gray-900 text-[0.85rem] flex items-center gap-1.5 hover:bg-black/5 transition-colors"
					>
						Get it Now <span class="text-gray-500 font-medium ml-1"
							>— It's Free</span
						>
					</button>
				</div>
			</header>

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
							<span class="font-black tracking-tight">20M+ User</span><br />
							<span class="text-brand-dark/80 font-medium"
								>Read Our <u
									class="font-bold decoration-2 underline-offset-1 cursor-pointer hover:text-brand transition-colors"
									>Success Stories</u
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
							<img
								src="https://randomuser.me/api/portraits/women/44.jpg"
								alt="User"
								class="w-9 h-9 rounded-full object-cover shadow-sm bg-white"
							/>
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
						<button
							class="bg-brand-dark text-white px-6 py-3 rounded-full font-bold text-[0.9rem] hover:bg-brand hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 transition-all duration-200"
						>
							Download <span class="text-white/70 font-medium ml-1"
								>— It's Free</span
							>
						</button>
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
						style="width: {$firstCardWidth}px;"
					>
						<CardContent class="h-full w-full p-0">
							<img
								src="happy-student-girl.jpg"
								alt="Writing Course"
								class="absolute inset-0 h-full w-full object-cover"
							/>
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
						style="width: {$secondCardWidth}px;"
						onmouseenter={() => (isSecondCardHovered = true)}
						onmouseleave={() => (isSecondCardHovered = false)}
					>
						<CardContent class="h-full w-full p-0">
							<img
								src="second.jpg"
								alt="Writing"
								class="absolute inset-0 h-full w-full object-cover"
							/>
							<!-- Brand overlay -->
							<div class="pointer-events-none absolute inset-0">
								<div
									class="h-full w-full bg-linear-to-t from-brand-dark/70 via-brand-dark/15 to-transparent"
								></div>
							</div>
							<div
								class="absolute bottom-8 left-1/2 origin-bottom-left -translate-x-1/2 -rotate-90 transition-opacity duration-200"
								style:opacity={!isSecondCardHovered ? 1 : 0}
							>
								<span
									class="text-lg font-semibold tracking-wide text-brand-muted drop-shadow whitespace-nowrap border-none"
									>Writing</span
								>
							</div>
							<div
								class="absolute bottom-6 left-6 transition-opacity duration-200 min-w-[200px]"
								style:opacity={isSecondCardHovered ? 1 : 0}
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
						style="width: {$thirdCardWidth}px;"
						onmouseenter={() => (isThirdCardHovered = true)}
						onmouseleave={() => (isThirdCardHovered = false)}
					>
						<CardContent class="h-full p-0 w-full border-none">
							<img
								src="third.jpg"
								alt="Business"
								class="absolute inset-0 h-full w-full object-cover"
							/>
							<!-- Brand overlay -->
							<div class="pointer-events-none absolute inset-0">
								<div
									class="h-full w-full bg-linear-to-t from-brand-dark/70 via-brand-dark/15 to-transparent"
								></div>
							</div>
							<div
								class="absolute bottom-8 left-1/2 origin-bottom-left -translate-x-1/2 -rotate-90 transition-opacity duration-200"
								style:opacity={!isThirdCardHovered ? 1 : 0}
							>
								<span
									class="text-lg font-semibold tracking-wide text-brand-muted drop-shadow whitespace-nowrap border-none"
									>Business</span
								>
							</div>
							<div
								class="absolute bottom-6 left-6 transition-opacity duration-200 min-w-[200px]"
								style:opacity={isThirdCardHovered ? 1 : 0}
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
