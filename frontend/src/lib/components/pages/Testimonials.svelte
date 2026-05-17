<script lang="ts">
	import { Star, Quote } from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";

	const testimonials = [
		{
			name: "Adaeze Okonkwo",
			meta: "JAMB Candidate",
			quote:
				"PrepMaster is a game-changer for Nigerian students looking to step up their performance in competitive exams. It's so massive, meticulously organized, has deep interactive flows and even an AI tutor! It's indispensable in the modern student's toolbox.",
			initials: "AO",
			color: "bg-teal-500 text-white",
		},
		{
			name: "Tunde Kehinde",
			meta: "WAEC 2024",
			quote:
				"The question navigator is a great resource and it always comes in handy to see what the best practices for real CBT exams are. It's quickly become my favorite inspiration resource for studying at home.",
			initials: "TK",
			color: "bg-blue-500 text-white",
		},
		{
			name: "Chioma Nwosu",
			meta: "Student @ UI",
			quote:
				"I can't imagine a product revision process without PrepMaster. The quality, clarity and precision it provides make it just as valuable as it is intuitive. I finally deleted that folder of 1,866 unorganized screenshots!",
			initials: "CN",
			color: "bg-purple-500 text-white",
		},
		{
			name: "Emeka Babatunde",
			meta: "NECO Prep",
			quote:
				"All my homies love PrepMaster. I mean that. By using the app, I save both my research time and space in my photo galleries filled with random study captures. I love how easy it is to search for specific topics.",
			initials: "EB",
			color: "bg-amber-500 text-white",
		},
		{
			name: "Fatima Obi",
			meta: "Scholarship Aspirant",
			quote:
				"PrepMaster is my go-to reference for app & web based testing. Apart from saving countless hours, it gives me insights on my design patterns, copywriting, and user flows of world-class products. It is a wonderful tool you cannot live without!",
			initials: "FO",
			color: "bg-emerald-500 text-white",
		},
		{
			name: "David Osei",
			meta: "Rivers State Mock",
			quote:
				"One of the best ways to stay on top of the latest patterns, modalities, and visual trends in exam preparation... it's an essential resource for my high school team.",
			initials: "DO",
			color: "bg-rose-500 text-white",
		},
		{
			name: "Oykun Yilmaz",
			meta: "International Student",
			quote:
				"Designing feasible solutions based on real-world products is easier with PrepMaster. It's one of those tabs I never close. It's the largest up-to-date library of CBT question screens in the country.",
			initials: "OY",
			color: "bg-slate-700 text-white",
		},
		{
			name: "Rachel How",
			meta: "Study Blogger",
			quote:
				"PrepMaster is one of my main tools for finding flows to gain UX and UI insights from. Going there saves me a lot of time from having to do it myself. It literally works!",
			initials: "RH",
			color: "bg-pink-500 text-white",
		},
		{
			name: "Sebastian Speier",
			meta: "Educational Tech",
			quote:
				"A great resource and it always comes in handy to see what the best practice standards are for mobile patterns in our current landscape. Unmatched in the inspiration space.",
			initials: "SS",
			color: "bg-indigo-600 text-white",
		},
		{
			name: "Haerin Song",
			meta: "Post-UTME Prep",
			quote:
				"The leaderboard made me study harder. Went from rank 145 to rank 8 in 3 weeks. Very competitive and very addictive! Shoutout to the team for doing God's work.",
			initials: "HS",
			color: "bg-blue-400 text-white",
		},
		{
			name: "Axel L.",
			meta: "JAMB Specialist",
			quote:
				"The question navigator is identical to JAMB's real interface. Zero surprises on exam day. Got B3 in Physics which I was failing before.",
			initials: "AL",
			color: "bg-orange-500 text-white",
		},
		{
			name: "Bobby G.",
			meta: "Teacher",
			quote:
				"I've recommended this to all my students. The AI study plan told one of them to do Physics daily and they went from 40% to 71% in two weeks.",
			initials: "BG",
			color: "bg-teal-600 text-white",
		},
	];
</script>

<section id="testimonials" class="w-full py-20 bg-white font-sans overflow-hidden antialiased">
	<div class="max-w-5xl mx-auto px-6 lg:px-8">
		<!-- Header Section -->
		<div class="text-center mb-12">
			<div
				class="inline-flex items-center gap-1.5 mb-5 border border-brand/20 bg-brand/5 rounded-full px-2.5 py-1 text-brand"
			>
				<Star class="w-2 h-2 fill-brand" />
				<span class="text-[8px] font-bold tracking-[0.2em] uppercase"
					>Student Stories</span
				>
			</div>

			<h2
				class="text-4xl md:text-5xl font-black text-[#111827] leading-[0.95] tracking-wide mb-5 max-w-2xl mx-auto"
			>
				Real results from <br />real students
			</h2>
		</div>

		<!-- Testimonials Masonry Grid -->
		<div
			class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
		>
			{#each testimonials as item}
				<div class="break-inside-avoid mb-4">
					<Card.Root
						class="relative bg-white border border-brand/30 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 group hover:border-brand"
					>
						<Card.Content class="p-4">
							<!-- User Profile (Mobbin Style Header) -->
							<div class="flex items-center gap-2.5 mb-4">
								<div class="relative shrink-0">
									<div
										class="w-8 h-8 rounded-full flex items-center justify-center text-[9.5px] font-normal bg-transparent text-[#111827] border border-brand"
									>
										{item.initials}
									</div>
									<div
										class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50"
									>
										<div class="w-2 h-2 bg-brand rounded-full"></div>
									</div>
								</div>
								<div class="flex flex-col gap-0.5">
									<span
										class="text-[10.5px] font-black text-[#111827] tracking-tight leading-none"
										>{item.name}</span
									>
									<span
										class="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none"
										>{item.meta}</span
									>
								</div>
							</div>

							<!-- Quote (Clean Body Text) -->
							<p class="text-xs text-[#4b5563] font-medium leading-[1.6]">
								{item.quote}
							</p>
						</Card.Content>
					</Card.Root>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Scale reduction utility matches the Pricing component's high-density look */
	:global(.antialiased) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>
