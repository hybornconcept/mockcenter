<script lang="ts">
	import { cn } from "$lib/utils";

	let scrollY = $state(0);
	let isScrolled = $derived(scrollY > 20);

	const navItems = [
		{ name: "Exams", href: "#exams" },
		{ name: "Features", href: "#features" },
		{ name: "Invite Friends", href: "#refer" },
		{ name: "Pricing", href: "#pricing" },
		{ name: "Testimonials", href: "#testimonials" },
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
					behavior: "smooth",
				});

				// Update URL hash without jumping
				history.pushState(null, "", href);
			}
		}
	}
</script>

<svelte:window bind:scrollY />

<header
	class={cn(
		"fixed left-0 right-0 z-50 transition-all duration-500 flex justify-center",
		isScrolled ? "top-4 px-4" : "top-0",
	)}
>
	<div
		class={cn(
			"w-full transition-all duration-500 flex items-center justify-between",
			isScrolled
				? "max-w-[1100px] bg-[#f2f2f2]/80 backdrop-blur-xl border border-black/5 shadow-md rounded-full py-2.5 px-4 pr-3 relative overflow-hidden"
				: "max-w-[1350px] py-5 px-6 md:px-10 lg:px-16 bg-transparent",
		)}
	>
		<!-- Left: Logo (takes 1/3 space) -->
		<div class="flex-1 flex items-center">
			<a href="/" class="flex items-center gap-3 group transition-all shrink-0">
				<div class="flex gap-1 rotate-45">
					<div
						class="w-1.5 h-3 bg-brand-dark rounded-[2px] -translate-y-0.5 transition-colors group-hover:bg-brand"
					></div>
					<div
						class="w-1.5 h-3 bg-brand-dark rounded-[2px] translate-y-0.5 transition-colors group-hover:bg-brand"
					></div>
				</div>
				<span
					class="text-[17.5px] font-bold text-brand-dark tracking-[-0.02em] whitespace-nowrap"
					style="font-family: 'Playfair Display', 'Poppins', sans-serif;"
					>/ mockcenter</span
				>
			</a>
		</div>

		<!-- Center: Navigation (takes 1/3 space) -->
		<nav
			class="hidden lg:flex items-center justify-center gap-5 xl:gap-8 flex-1"
		>
			{#each navItems as item}
				<a
					href={item.href}
					onclick={(e) => handleSmoothScroll(e, item.href)}
					class={cn(
						"text-[0.85rem] font-semibold transition-all duration-300 whitespace-nowrap",
						isScrolled
							? "text-brand-dark/80 hover:text-brand"
							: "text-brand-dark hover:text-brand",
					)}
				>
					{item.name}
				</a>
			{/each}
		</nav>

		<!-- Right: Actions (takes 1/3 space) -->
		<div class="flex-1 flex items-center justify-end gap-4 min-w-fit">
			<a
				href="/login"
				class="hidden sm:block text-[0.92rem] font-bold text-brand-dark hover:text-brand transition-colors whitespace-nowrap px-2"
			>
				Log in
			</a>

			<a
				href="/signup"
				class="border-[1.5px] border-brand-dark bg-brand-dark/5 px-6 py-2.5 rounded-full font-bold text-brand-dark text-[0.82rem] flex items-center gap-1.5 hover:bg-brand-dark/10 transition-all hover:scale-[1.03] active:scale-95 whitespace-nowrap"
			>
				Get Started <span
					class="hidden xl:inline text-brand-dark/70 font-medium ml-1"
					>— It's Free</span
				>
			</a>
		</div>

		<!-- Mobile Menu Toggle -->
		<button
			class="lg:hidden flex flex-col gap-1.5 p-2 pr-0 group cursor-pointer ml-1"
		>
			<span
				class="w-5 h-[2px] bg-gray-900 rounded-full transition-all group-hover:bg-brand"
			></span>
			<span
				class="w-5 h-[2px] bg-gray-900 rounded-full transition-all group-hover:bg-brand"
			></span>
		</button>
	</div>
</header>

<style>
	header > div {
		/* Ensures the glassy effect works cleanly */
		-webkit-backdrop-filter: blur(24px);
		backdrop-filter: blur(24px);
	}
</style>
