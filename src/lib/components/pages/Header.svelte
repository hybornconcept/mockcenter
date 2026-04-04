<script lang="ts">
	import { cn } from "$lib/utils";

	let scrollY = $state(0);
	let isScrolled = $derived(scrollY > 20);

	const navItems = [
		{ name: "Exams", href: "#exams" },
		{ name: "Features", href: "#features" },
		{ name: "Refer & Earn", href: "#refer" },
		{ name: "Pricing", href: "#pricing" },
		{ name: "FAQ", href: "#faq" },
	];

	function handleSmoothScroll(e: MouseEvent, href: string) {
		if (href.startsWith("#")) {
			e.preventDefault();
			const targetId = href.replace("#", "");
			const targetElement = document.getElementById(targetId);
			
			if (targetElement) {
				// Offset by roughly the height of the sticky header
				const headerOffset = 90;
				const elementPosition = targetElement.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.scrollY - headerOffset;

				window.scrollTo({
					top: offsetPosition,
					behavior: "smooth"
				});
				
				// Update URL hash without jumping
				history.pushState(null, "", href);
			}
		}
	}
</script>

<svelte:window bind:scrollY={scrollY} />	const navItems = [
		{ name: "Exams", href: "#exams" },
		{ name: "Features", href: "#features" },
		{ name: "Refer & Earn", href: "#refer" },
		{ name: "Pricing", href: "#pricing" },
		{ name: "FAQ", href: "#faq" },
	];
</script>

<header
	class={cn(
		"fixed left-0 right-0 z-50 transition-all duration-500 flex justify-center",
		isScrolled ? "top-4 px-4" : "top-0"
	)}
>
	<div
		class={cn(
			"w-full transition-all duration-500 flex items-center justify-between",
			isScrolled
				? "max-w-[1100px] bg-[#f2f2f2]/80 backdrop-blur-xl border border-black/5 shadow-md rounded-full py-2.5 px-4 pr-3 relative overflow-hidden"
				: "max-w-[1400px] py-5 px-6 md:px-10 lg:px-16 bg-transparent"
		)}
	>
		<!-- Left: Logo -->
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center gap-1.5 group transition-all shrink-0">
				<div class="flex items-center mr-1">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="text-gray-900 group-hover:text-brand transition-colors">
						<rect x="14.1421" y="2.82843" width="6" height="12" rx="3" transform="rotate(45 14.1421 2.82843)" fill="currentColor"/>
						<rect x="6.36395" y="10.6066" width="6" height="12" rx="3" transform="rotate(45 6.36395 10.6066)" fill="currentColor"/>
					</svg>
				</div>
				<span
					class="text-[17px] font-bold text-gray-900 tracking-[-0.02em] whitespace-nowrap"
					style="font-family: 'Inter Tight', 'Inter', sans-serif;"
					>Mockcenter</span
				>
				<span class="text-gray-900 font-bold mx-1 hidden md:block">/</span>
				<span class="text-[15px] font-bold text-gray-900 hover:text-brand transition-colors hidden md:block whitespace-nowrap">hello@mockcenter.com</span>
			</a>
		</div>

		<!-- Center: Navigation -->
		<nav class="hidden lg:flex items-center gap-5 xl:gap-7 ml-auto mr-8">
			{#each navItems as item}
				<a
					href={item.href}
					onclick={(e) => handleSmoothScroll(e, item.href)}
					class="text-[14.5px] font-medium text-gray-700 hover:text-black transition-colors"
				>
					{item.name}
				</a>
			{/each}
		</nav>

		<!-- Right: Actions -->
		<div class="flex items-center gap-3">
			<a
				href="/login"
				class="hidden sm:block text-[14.5px] font-semibold text-brand-dark hover:text-brand transition-colors px-3 py-2"
			>
				Log in
			</a>

			<a
				href="/signup"
				class="group relative inline-flex items-center gap-1.5 px-5 py-2 border border-brand-dark rounded-full overflow-hidden transition-all hover:bg-brand hover:border-brand"
			>
				<span
					class="relative z-10 text-[14.5px] font-semibold text-brand-dark transition-colors group-hover:text-white flex items-center whitespace-nowrap"
				>
					Get it Now <span class="font-normal text-brand-dark/60 group-hover:text-white/80 ml-1.5">— It's Free</span>
				</span>
			</a>

			<!-- Mobile Menu Toggle -->
			<button class="lg:hidden flex flex-col gap-1.5 p-2 pr-0 group cursor-pointer ml-1">
				<span class="w-5 h-[2px] bg-gray-900 rounded-full transition-all group-hover:bg-brand"></span>
				<span class="w-5 h-[2px] bg-gray-900 rounded-full transition-all group-hover:bg-brand"></span>
			</button>
		</div>
	</div>
</header>

<style>
	header > div {
		/* Ensures the glassy effect works cleanly */
		-webkit-backdrop-filter: blur(24px);
		backdrop-filter: blur(24px);
	}
</style>
