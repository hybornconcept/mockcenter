<script lang="ts">
	// Reverted to the rounded-card hero layout within a white page container 
	// to perfectly match the provided design screenshot using Tailwind.
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="w-full min-h-screen overflow-x-hidden font-sans antialiased text-gray-900 bg-[#f9f9f9]">
	<!-- HERO SECTION - Edge-to-Edge -->
	<section
		class="relative w-full bg-gradient-to-b from-[#bdc0c2] via-[#e5e6e8] to-[#f4f4f4] px-6 md:px-12 lg:px-20 pt-6 pb-10 shadow-sm"
	>
		<div class="max-w-[1400px] mx-auto">
			<!-- HEADER -->
			<header class="flex flex-wrap justify-between items-center pb-6">
				<!-- Logo -->
				<div class="flex items-center gap-3 font-bold text-gray-900 text-[0.95rem]">
					<div class="flex gap-1 rotate-45">
						<div class="w-1.5 h-3 bg-black rounded-[2px] -translate-y-0.5"></div>
						<div class="w-1.5 h-3 bg-black rounded-[2px] translate-y-0.5"></div>
					</div>
					<span>/ Sales@reelers.io</span>
				</div>

				<!-- Desktop Nav -->
				<nav class="hidden md:flex items-center gap-6 text-[0.85rem] font-bold text-gray-900">
					<a href="#product" class="hover:text-gray-500 transition-colors">Product</a>
					<span class="text-xl text-gray-400 mt-[-8px]">.</span>
					<a href="#solutions" class="hover:text-gray-500 transition-colors">Solutions</a>
					<span class="text-xl text-gray-400 mt-[-8px]">.</span>
					<a href="#pricing" class="hover:text-gray-500 transition-colors">Pricing</a>
					<span class="text-xl text-gray-400 mt-[-8px]">.</span>
					<a href="#developers" class="hover:text-gray-500 transition-colors">Developers</a>
				</nav>

				<!-- Auth -->
				<div class="flex flex-wrap items-center gap-5">
					<button class="font-bold text-gray-900 text-[0.9rem] hover:text-gray-600 transition-colors">
						Log in
					</button>
					<button
						class="border-[1.5px] border-black bg-transparent px-5 py-2.5 rounded-full font-bold text-gray-900 text-[0.85rem] flex items-center gap-1.5 hover:bg-black/5 transition-colors"
					>
						Get it Now <span class="text-gray-500 font-medium ml-1">— It's Free</span>
					</button>
				</div>
			</header>

			<!-- MAIN HERO CONTENT -->
			<main class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-4 lg:mt-8">
				<!-- LEFT COLUMN: Typography & Action -->
				<div class="flex flex-col gap-4 lg:pr-8 text-center lg:text-left items-center lg:items-start relative z-10">
					<!-- Badge -->
					<div class="inline-flex items-center gap-4 rounded-full">
						<div class="w-9 h-9 bg-black text-white rounded-full flex justify-center items-center shrink-0">
							<svg
								viewBox="0 0 24 24"
								width="14"
								height="14"
								stroke="currentColor"
								stroke-width="2.5"
								fill="none"
								class="ml-0.5"
								aria-hidden="true"
							>
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						</div>
						<div class="text-[0.85rem] leading-snug text-left text-gray-900">
							<span class="font-black tracking-tight">20M+ User</span><br />
							<span class="text-gray-800 font-medium"
								>Read Our <u class="font-bold decoration-2 underline-offset-4 cursor-pointer hover:text-black"
									>Success Stories</u
								></span
							>
						</div>
					</div>

					<!-- Hero Title -->
					<h1
						class="text-[5rem] md:text-[6.5rem] font-medium leading-[0.8] tracking-tighter text-gray-900 relative inline-block my-2"
						style="font-family: 'Playfair Display', serif;"
					>
						Grow<sup
							class="text-[2.5rem] md:text-[3rem] absolute top-2 md:top-0 -right-7 md:-right-10 font-sans font-normal text-gray-800 tracking-normal"
							>+</sup
						>
					</h1>

					<!-- Hero Subtitle -->
					<p class="text-[1.05rem] leading-relaxed text-gray-800 max-w-sm m-0 font-medium pb-1">
						Drive Sales Growth, And Harness Ai-Powered User Content — Up To 50x Faster.
					</p>

					<hr class="border-t border-black/15 my-2 w-[70%]" />

					<!-- Ratings Review -->
					<div class="flex items-center justify-center lg:justify-start gap-4">
						<div class="relative shrink-0">
							<img
								src="https://randomuser.me/api/portraits/women/44.jpg"
								alt="User"
								class="w-10 h-10 rounded-full object-cover shadow-sm bg-white"
							/>
							<div class="absolute -top-1.5 -left-2 text-[#ff5733]">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
								</svg>
							</div>
						</div>
						<div class="flex flex-col text-[0.85rem] text-left">
							<div class="font-semibold flex items-center gap-2 text-gray-900">
								<span>Loved the performance</span>
								<span class="text-gray-400 font-normal">/</span>
								<span class="font-black flex items-center gap-1"
									><span class="text-gray-800">★</span> 4.9</span
								>
							</div>
							<div class="text-gray-600 font-medium mt-0.5">100% Satisfied</div>
						</div>
					</div>

					<hr class="border-t border-black/15 my-2 w-[70%]" />

					<!-- Call To Action -->
					<div class="flex flex-wrap justify-center lg:justify-start items-center gap-8 mt-4">
						<button
							class="bg-black text-white px-8 py-4 rounded-full font-bold text-[0.95rem] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
						>
							Download <span class="text-white/60 font-medium ml-1">— It's Free</span>
						</button>
						<a
							href="#pricing"
							class="text-gray-900 font-bold text-[1rem] flex items-center gap-2 hover:opacity-75 transition-opacity group"
						>
							Our Pricing <span class="text-xl font-normal group-hover:translate-x-1 transition-transform">↗</span>
						</a>
					</div>
				</div>

				<!-- RIGHT COLUMN: Visuals & Floating UI -->
				<div class="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] bg-transparent flex items-center justify-center xl:justify-end mt-10 lg:mt-0">
					<!-- Vibrant Orange Splash -->
					<div
						class="absolute right-[5%] lg:right-[15%] top-0 bottom-0 w-[80%] sm:w-[65%] rounded-[2.5rem] bg-gradient-to-br from-[#ff6b36] via-[#fe5115] to-[#c72600] z-0"
					></div>

					<!-- Subject Photography -->
					<img
						src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800&h=1000"
						alt="Sport Model"
						class="relative z-10 h-[105%] max-h-full object-cover object-top mr-[20%] drop-shadow-xl contrast-[1.05] saturate-[1.1]"
					/>

					<!-- FLOATING: Glass Stats Card (Top Right) -->
					<div
						class="absolute top-[5%] -right-[2%] lg:-right-[5%] p-6 w-44 z-20 backdrop-blur-xl bg-gradient-to-br from-white/50 to-white/10 border border-white/50 border-b-white/20 border-r-white/20 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
					>
						<div class="text-[0.65rem] font-bold text-gray-700 tracking-wider mb-2">— UP TO</div>
						<div class="text-[2.5rem] font-black leading-none mb-1.5 text-gray-900">60%</div>
						<div class="text-[0.85rem] font-medium leading-snug text-gray-800">More sales this week</div>
					</div>

					<!-- FLOATING: Glass Product Card (Bottom Right) -->
					<div
						class="absolute -bottom-[5%] -right-[5%] lg:-right-[10%] p-5 flex items-center gap-5 w-[300px] z-20 backdrop-blur-xl bg-gradient-to-br from-white/50 to-white/10 border border-white/50 border-b-white/20 border-r-white/20 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
					>
						<div class="flex-1 pl-1">
							<h3 class="text-[1.1rem] font-bold text-gray-900 leading-tight mb-2">NIke Shoes<br />Jordan</h3>
							<div class="text-2xl font-black text-gray-900 mb-2">$849.99</div>
							<div
								class="inline-flex items-center gap-1.5 bg-white px-2.5 py-0.5 rounded-full text-[0.8rem] font-bold text-gray-900"
							>
								★ 4.6
							</div>
						</div>
						<div
							class="w-[85px] h-[85px] bg-[#f0f0f0] rounded-[1.25rem] overflow-hidden flex items-center justify-center shrink-0"
						>
							<img
								src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200"
								alt="Shoe"
								class="max-w-[130%] h-auto -rotate-[15deg] mix-blend-multiply"
							/>
						</div>
					</div>

					<!-- FLOATING: Bubble (Top Left) -->
					<div
						class="absolute top-[28%] left-[5%] lg:-left-[10%] z-20 bg-white px-5 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex items-center gap-3"
					>
						<div class="w-[20px] h-[20px] rounded bg-[#ff6b35] flex items-center justify-center shrink-0">
							<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" class="w-3.5 h-3.5"><path d="M20 6L9 17l-5-5" /></svg>
						</div>
						<span class="font-bold text-[0.85rem] text-gray-900 whitespace-nowrap">How is the fit?</span>
					</div>

					<!-- FLOATING: Bubble (Middle Left) -->
					<div
						class="absolute top-[42%] -left-[5%] lg:-left-[18%] z-20 bg-white px-5 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex items-center gap-3"
					>
						<div class="w-[20px] h-[20px] rounded bg-blue-500 flex items-center justify-center shrink-0">
							<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" class="w-3.5 h-3.5"><path d="M20 6L9 17l-5-5" /></svg>
						</div>
						<span class="font-bold text-[0.85rem] text-gray-900 whitespace-nowrap">Do you like the design?</span>
					</div>

					<!-- FLOATING: Play Button Center -->
					<button
						class="absolute top-[48%] left-[30%] lg:left-[25%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[0_12px_25px_rgba(0,0,0,0.12)] flex items-center justify-center z-20 text-gray-900 hover:scale-105 transition-transform"
						aria-label="Play video"
					>
						<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" class="translate-x-[1px]" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
					</button>
				</div>
			</main>
		</div>
	</section>

	<!-- LOGOS SECTION -->
	<section class="w-full pt-12 pb-10 px-6">
		<div
			class="max-w-[1200px] mx-auto flex flex-wrap justify-center lg:justify-between items-center gap-10 text-black/80"
		>
			<div class="font-bold text-[1.3rem] tracking-tighter">Rakuten</div>

			<div class="font-bold text-[1.3rem] flex items-center gap-1.5 opacity-90">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
					aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg
				>
				NCR
			</div>

			<div class="font-extrabold text-[1.4rem] tracking-tight opacity-95">
				#.monday<span class="font-normal tracking-normal text-[1.35rem]">.com</span>
			</div>

			<div
				class="text-[1.6rem] font-medium tracking-normal opacity-90"
				style="font-family: 'Playfair Display', serif; font-style: italic;"
			>
				Disney
			</div>

			<div class="font-bold text-[1.3rem] flex items-center gap-2 opacity-90">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
					><path d="M12 2l-6 4 6 4 6-4-6-4zM6 10l-6 4 6 4 6-4-6-4zM18 10l-6 4 6 4 6-4-6-4zM12 22l-6-4v-4l6 4 6-4v4l-6 4z" /></svg
				>
				Dropbox
			</div>
		</div>
	</section>
</div>
