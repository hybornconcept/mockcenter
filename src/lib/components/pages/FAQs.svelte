<script lang="ts">
	import { Plus, HelpCircle, ChevronDown } from "lucide-svelte";
	import * as Accordion from "$lib/components/ui/accordion/index.ts";

	const faqs = [
		{
			id: "item-1",
			question: "How does the credit system work?",
			answer:
				"Each credit unlocks one full practice question including AI-powered step-by-step explanations. Credits never expire, giving you complete control over your study timeline.",
		},
		{
			id: "item-2",
			question: "Are the past questions real official questions?",
			answer:
				"Yes, we source our questions directly from official national exam bodies like JAMB, WAEC, and NECO, providing you with the most authentic mock experience in Nigeria.",
		},
		{
			id: "item-3",
			question: "How does the referral program work exactly?",
			answer:
				"Simply share your unique referral link with friends. When they create an account, you both automatically receive 50 free practice credits – there's no limit on how many friends you can invite.",
		},
		{
			id: "item-4",
			question: "How does AI know what I need to work on?",
			answer:
				"Every time you answer a question, our AI engine updates your performance profile. It tracks accuracy, speed, and conceptual mastery to build a roadmap that targets your specific weak points.",
		},
		{
			id: "item-5",
			question: "Can I use PrepMaster on my phone?",
			answer:
				"Absolutely. PrepMaster is designed as a fully responsive platform. It works seamlessly across iPhone, Android, and tablets through your standard mobile browser – no bulky app download required.",
		},
		{
			id: "item-6",
			question: "What if I run out of credits?",
			answer:
				"You can instantly top up with any of our credit packs (Basic, Value, or Enterprise) using local payment methods. Alternatively, earn more by referring friends or participating in weekend mock challenges.",
		},
	];
</script>

<section class="w-full py-20 bg-white font-sans overflow-hidden antialiased">
	<div class="max-w-3xl mx-auto px-6 lg:px-8">
		<!-- Header Section -->
		<div class="text-center mb-12">
			<div
				class="inline-flex items-center gap-1.5 mb-5 border border-brand/20 bg-brand/5 rounded-full px-3 py-1 text-brand"
			>
				<HelpCircle class="w-2.5 h-2.5" />
				<span class="text-[8px] font-bold tracking-[0.2em] uppercase">FAQ</span>
			</div>

			<h2
				class="text-4xl md:text-5xl font-black text-[#111827] leading-[0.95] -tracking-normal mb-5 max-w-2xl mx-auto"
			>
				Everything you <br /> need to know
			</h2>
		</div>

		<!-- Shadcn Accordion Layout -->
		<Accordion.Root type="single" class="space-y-3">
			{#each faqs as faq}
				<Accordion.Item
					value={faq.id}
					class="bg-[#f9fafb] border-[1.5px] border-transparent rounded-2xl overflow-hidden shadow-none group transition-all duration-300 hover:bg-white hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5"
				>
					<Accordion.Trigger
						class="flex items-center justify-between w-full p-4 md:p-5 hover:no-underline text-left group"
					>
						<span class="text-[13px] font-bold text-[#111827] tracking-tight"
							>{faq.question}</span
						>
					</Accordion.Trigger>
					<Accordion.Content class="px-5 pb-5">
						<p
							class="text-[13px] text-[#4b5563] font-medium leading-[1.6] max-w-2xl border-t border-gray-100 pt-2"
						>
							{faq.answer}
						</p>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
</section>

<style>
	/* Hide standard chevron in accordion trigger since we use a custom plus circle */
	:global([data-accordion-trigger] svg:last-child) {
		display: none;
	}
</style>
