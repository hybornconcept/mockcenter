<script lang="ts">
	import { ArrowRight, MoveUpRight } from "@lucide/svelte";
	import { onMount } from "svelte";

	let days = $state(37);
	let hours = $state(1);
	let mins = $state(3);
	let secs = $state(49);

	// Simple countdown logic to make it feel alive
	onMount(() => {
		const interval = setInterval(() => {
			if (secs > 0) {
				secs--;
			} else {
				if (mins > 0) {
					mins--;
					secs = 59;
				} else {
					if (hours > 0) {
						hours--;
						mins = 59;
						secs = 59;
					} else {
						if (days > 0) {
							days--;
							hours = 23;
							mins = 59;
							secs = 59;
						}
					}
				}
			}
		}, 1000);

		return () => clearInterval(interval);
	});

	function formatNum(num: number) {
		return num.toString().padStart(2, "0");
	}
</script>

<section
	class="py-12 px-6 md:px-10 lg:px-20 bg-brand/5 overflow-hidden relative"
>
	<div class="max-w-4xl mx-auto">
		<div
			class="relative w-full bg-white rounded-[2rem] p-7 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center"
		>
			<!-- Heading -->
			<h2
				class="text-3xl md:text-4xl lg:text-[3.8rem] font-black tracking-[-0.05em] leading-[0.95] text-brand-dark mb-5 max-w-2xl"
				style="font-family: 'Inter Tight', 'Inter', sans-serif; font-style: italic;"
			>
				Your exam is in <span class="text-brand not-italic">37</span>
				<br class="hidden md:block" />
				days. Start today.
			</h2>

			<!-- Subtext -->
			<p
				class="text-gray-500/80 text-sm md:text-base font-medium max-w-[420px] mb-9 leading-relaxed"
			>
				Every day you wait is a day of practice you'll never get back. Join
				50,000+ students already preparing smarter.
			</p>

			<!-- Buttons -->
			<div class="flex flex-wrap justify-center gap-2.5 mb-12">
				<button
					class="bg-brand-dark text-white px-6 py-3 rounded-full font-bold text-[15px] flex items-center gap-2 hover:bg-brand hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/20 transition-all duration-300 active:scale-95"
				>
					Create free account <ArrowRight class="w-4 h-4" />
				</button>
				<button
					class="bg-white text-brand-dark border-[1.5px] border-brand/10 px-6 py-3 rounded-full font-bold text-[15px] flex items-center gap-2 hover:bg-brand/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 active:scale-95"
				>
					View credit packs <MoveUpRight class="w-4 h-4 text-brand/40" />
				</button>
			</div>

			<!-- Countdown Display -->
			<div class="flex flex-wrap justify-center gap-2 md:gap-3">
				<!-- Days -->
				<div
					class="w-18 h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 bg-brand-muted/10 border border-brand/5 rounded-xl flex flex-col items-center justify-center shadow-sm"
				>
					<span
						class="text-xl md:text-2xl lg:text-3xl font-black text-brand-dark tracking-tighter"
						>{formatNum(days)}</span
					>
					<span
						class="text-[8px] md:text-[9px] font-bold text-brand-dark/40 tracking-[0.15em] uppercase mt-1"
						>Days</span
					>
				</div>

				<!-- Hours -->
				<div
					class="w-18 h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 bg-brand-muted/10 border border-brand/5 rounded-xl flex flex-col items-center justify-center shadow-sm"
				>
					<span
						class="text-xl md:text-2xl lg:text-3xl font-black text-brand-dark tracking-tighter"
						>{formatNum(hours)}</span
					>
					<span
						class="text-[8px] md:text-[9px] font-bold text-brand-dark/40 tracking-[0.15em] uppercase mt-1"
						>Hours</span
					>
				</div>

				<!-- Mins -->
				<div
					class="w-18 h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 bg-brand-muted/10 border border-brand/5 rounded-xl flex flex-col items-center justify-center shadow-sm"
				>
					<span
						class="text-xl md:text-2xl lg:text-3xl font-black text-brand-dark tracking-tighter"
						>{formatNum(mins)}</span
					>
					<span
						class="text-[8px] md:text-[9px] font-bold text-brand-dark/40 tracking-[0.15em] uppercase mt-1"
						>Mins</span
					>
				</div>

				<!-- Secs -->
				<div
					class="w-18 h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 bg-brand-muted/10 border border-brand/5 rounded-xl flex flex-col items-center justify-center shadow-sm"
				>
					<span
						class="text-xl md:text-2xl lg:text-3xl font-black text-brand-dark tracking-tighter"
						>{formatNum(secs)}</span
					>
					<span
						class="text-[8px] md:text-[9px] font-bold text-brand-dark/40 tracking-[0.15em] uppercase mt-1"
						>Secs</span
					>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	h2 {
		/* Force Inter Tight or similar impact font if available */
		/* The negative tracking is key to that high-end editorial feel */
		font-variant-numeric: tabular-nums;
	}
</style>
