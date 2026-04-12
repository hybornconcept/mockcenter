<script lang="ts">
	import { 
		RotateCcw, Zap, Bot, Clock, Calendar, GraduationCap, CheckCircle2, XCircle, TrendingUp, 
		Target, Bookmark, ArrowRight, ArrowLeft, Play, Award, Sparkles, AlertTriangle, Trophy,
		Share2, Link2, Camera, ChevronDown
	} from "lucide-svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { AreaChart, Area, ChartClipPath } from "layerchart";
	import { scaleUtc } from "d3-scale";
	import { curveNatural } from "d3-shape";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { fade, slide } from "svelte/transition";

	let { data } = $props();

	// Component data
	const score = 74, correct = 15, wrong = 5, skipped = 0, readinessBoost = "+3";
	const timeTaken = "18m 24s", avgSpeed = "38s/q", date = "Mar 28, 2026", subject = "Biology", examType = "JAMB 2022";

	const questions = [
		{ q:"Which of the following is NOT a function of the cell membrane?", opts:["Controls passage of substances","Provides structural support","Synthesizes proteins for cell growth","Allows cell-to-cell recognition"], ans:2, chosen:2, time:38, flagged:false, exp:"Protein synthesis occurs at ribosomes, not the cell membrane. The membrane controls substance passage, provides structural support, and enables cell recognition." },
		{ q:"In which organelle does aerobic respiration primarily occur?", opts:["Nucleus","Ribosomes","Mitochondria","Golgi apparatus"], ans:2, chosen:2, time:32, flagged:false, exp:"Mitochondria are the powerhouses of the cell, producing ATP through the Krebs cycle and electron transport chain." },
		{ q:"The process by which plants make food using sunlight is called:", opts:["Respiration","Transpiration","Photosynthesis","Osmosis"], ans:2, chosen:2, time:28, flagged:false, exp:"Photosynthesis: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Occurs in chloroplasts." },
		{ q:"Which blood group is the universal donor?", opts:["AB","A","B","O"], ans:3, chosen:0, time:45, flagged:true, exp:"Blood group O negative lacks A, B, and Rh antigens — compatible with all blood types. AB is the universal recipient, not donor." },
		{ q:"DNA replication occurs during which phase?", opts:["G1 phase","S phase","G2 phase","M phase"], ans:1, chosen:1, time:41, flagged:false, exp:"S (Synthesis) phase — each chromosome is duplicated so daughter cells each receive a complete set." },
		{ q:"Which characteristic is shared by ALL living organisms?", opts:["Visible to naked eye","Reproduce sexually","Respond to stimuli","Fixed lifespan"], ans:2, chosen:2, time:29, flagged:false, exp:"All living organisms exhibit irritability — they respond to stimuli from their environment." },
		{ q:"The functional unit of the kidney is the:", opts:["Ureter","Nephron","Glomerulus","Bowman's capsule"], ans:1, chosen:1, time:33, flagged:false, exp:"The nephron filters blood and produces urine. Each kidney contains ~1 million nephrons." },
		{ q:"Chromosomes are made up of:", opts:["RNA only","Protein only","DNA and protein","Lipids and carbohydrates"], ans:2, chosen:2, time:37, flagged:false, exp:"Chromosomes are DNA wound around histone proteins — together called chromatin." },
		{ q:"Which hormone lowers blood sugar levels?", opts:["Glucagon","Adrenaline","Insulin","Thyroxine"], ans:2, chosen:1, time:52, flagged:true, exp:"Insulin (beta cells, islets of Langerhans) lowers blood glucose. Glucagon raises it — remember: insulin IN, glucagon OUT." },
		{ q:"The scientific study of heredity is called:", opts:["Ecology","Genetics","Morphology","Taxonomy"], ans:1, chosen:1, time:25, flagged:false, exp:"Genetics — studies how traits are passed from parents to offspring and variation between organisms." }
	];

	const trendChartData = [
		{ date: new Date("2026-03-01"), score: 55 }, { date: new Date("2026-03-05"), score: 60 },
		{ date: new Date("2026-03-10"), score: 58 }, { date: new Date("2026-03-14"), score: 65 },
		{ date: new Date("2026-03-18"), score: 61 }, { date: new Date("2026-03-22"), score: 70 },
		{ date: new Date("2026-03-25"), score: 68 }, { date: new Date("2026-03-28"), score: 74 }
	];

	const comparisons = [
		{ label: "You", value: 74, color: "bg-[#3B6D11]" },
		{ label: "Top 10%", value: 91, color: "bg-[#185FA5]" },
		{ label: "Platform avg", value: 58, color: "bg-[#BA7517]" },
		{ label: "Your best", value: 84, color: "bg-[#639922]" }
	];

	let activeReviewFilter = $state("all");
	let expandedQuestion = $state<number | null>(null);

	const reviewFilters = [
		{ label: "all", text: "All", count: 20 },
		{ label: "correct", text: "Correct", count: 15 },
		{ label: "wrong", text: "Wrong", count: 5 },
		{ label: "skipped", text: "Skipped", count: 0 },
		{ label: "flagged", text: "Flagged", count: 3 }
	];

	const filteredQuestions = $derived(
		questions.filter(q => {
			if (activeReviewFilter === 'all') return true;
			if (activeReviewFilter === 'flagged') return q.flagged;
			const status = (q.chosen === null) ? 'skipped' : (q.chosen === q.ans ? 'correct' : 'wrong');
			return activeReviewFilter === status;
		})
	);
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-[#f8f9fc] font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- UNIFIED BRAND TOP SECTION -->
	<div class="bg-[#2B4716] bg-gradient-to-br from-[#101F10] via-[#2F5215] to-[#427A1C] relative overflow-hidden pb-10">
		<!-- Aesthetic background circles -->
		<div class="absolute inset-0 pointer-events-none opacity-20">
			<div class="w-[1000px] h-[1000px] rounded-full border-[1.5px] border-white/20 absolute -right-[300px] -top-[300px]"></div>
			<div class="w-[700px] h-[700px] rounded-full border-[1.5px] border-white/20 absolute -right-[150px] -top-[100px]"></div>
		</div>

		<!-- TOPBAR -->
		<header class="flex items-center justify-between py-5 px-8 sticky top-0 z-50 transition-all backdrop-blur-md bg-gradient-to-b from-black/20 to-transparent">
			<div class="flex items-center gap-3">
				<a href="/dashboard" class="flex items-center font-bold text-[20px] text-white tracking-tight">
					ExamNow
				</a>
				<span class="text-white/20 font-light text-[18px] pb-1">|</span>
				<div class="text-[14px] text-white/50 font-medium tracking-tight">
					<strong class="text-white/80 font-bold">{subject}</strong> · JAMB 2022 · Practice mode · 20 questions
				</div>
			</div>
			<div class="flex gap-2.5">
				<Button variant="outline" class="font-bold text-white bg-white/5 border-white/10 rounded-[10px] h-[38px] px-4 hover:bg-white/10 tracking-tight text-[13px] border">← Dashboard</Button>
				<Button class="bg-[#3C7B1F] hover:bg-[#4E932A] p-1 pr-4 font-bold rounded-[10px] h-[38px] text-white flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-all tracking-tight text-[13px] border-none">
					<div class="bg-[#0B3A6F] rounded-[8px] p-1.5 flex items-center justify-center -ml-0.5 border border-[#165a9e]">
						<RotateCcw class="w-3.5 h-3.5 text-white" stroke-width={2.5} />
					</div>
					Redemption mode
				</Button>
				<Button variant="outline" class="font-bold text-white bg-white/5 border-white/10 rounded-[10px] h-[38px] px-4 hover:bg-white/10 flex items-center gap-2 tracking-tight text-[13px] border">
					↺ Retry test
				</Button>
			</div>
		</header>

		<div class="flex flex-col gap-6 w-full max-w-[1140px] mx-auto pt-6 px-4 animate-in fade-in slide-in-from-top-4 duration-1000 antialiased">
			<!-- SCORE HERO -->
			<div class="overflow-hidden rounded-[20px] relative">
				<div class="relative px-6 py-6 lg:px-12 lg:py-8 flex flex-col md:flex-row items-center gap-14 w-full text-white">
					
					<!-- Score Ring -->
					<div class="relative z-10 shrink-0">
						<div class="relative w-[190px] h-[190px] flex items-center justify-center">
							<svg class="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
								<circle cx="80" cy="80" r="66" fill="none" class="stroke-white/10" stroke-width="14" />
								<circle cx="80" cy="80" r="66" fill="none" class="stroke-[#7ACF2F]" stroke-width="14" stroke-dasharray="414.7" stroke-dashoffset={414.7 - (414.7 * score) / 100} stroke-linecap="round" />
							</svg>
							<div class="absolute inset-0 flex flex-col items-center justify-center pt-2">
								<span class="text-[48px] font-black leading-none tracking-tighter mb-1">{score}%</span>
								<span class="text-[11px] font-medium tracking-[0.05em] text-white/40">SCORE</span>
							</div>
						</div>
					</div>

					<!-- Hero Info -->
					<div class="flex flex-col flex-1 pb-2 relative z-10 text-left items-start mt-2">
						<div class="bg-[#1E3B5B] text-[#A2CAED] px-4 py-[5px] rounded-full mb-4 font-semibold tracking-wide text-[12px] flex items-center gap-2 self-start ring-1 ring-inset ring-white/10 shadow-sm">
							<span class="text-[14px]">👍</span> Good Performance
						</div>
						<h2 class="text-[34px] font-extrabold leading-[1] mb-4 tracking-[-0.02em]">You scored {score}% — keep pushing!</h2>
						<p class="text-[15px] text-white/60 leading-[1.65] max-w-[620px] mb-6 font-medium">
							You answered {correct} out of 20 questions correctly in {subject} JAMB 2022.<br>
							Your AI readiness score improved by <strong class="text-[#84DE3D] font-bold">+{readinessBoost.replace('+', '')} points</strong> after this session.
						</p>
						<div class="flex flex-wrap items-center gap-6 text-[13px] text-white/40">
							<div class="flex items-center gap-1.5"><Clock class="w-[15px] h-[15px]" stroke-width={2} /> Time taken: <strong class="text-white/80 font-bold text-[14px]">18m 24s</strong></div>
							<div class="flex items-center gap-1.5"><Calendar class="w-[15px] h-[15px]" stroke-width={2} /> <strong class="text-white/80 font-bold text-[14px]">{date}</strong></div>
							<div class="flex items-center gap-1.5 text-[#E8C340]"><Zap class="w-[15px] h-[15px]" fill="#E8C340" /> <span class="text-white/40">Avg speed:</span> <strong class="text-white/80 font-bold text-[14px]">{avgSpeed}</strong></div>
							<div class="flex items-center gap-1.5"><GraduationCap class="w-[16px] h-[16px]" stroke-width={2} /> <span class="text-white/40">JAMB 2022</span></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-6 w-full max-w-[1140px] mx-auto pb-20 px-4 -mt-8 relative z-20">
		<Card.Root class="border border-gray-200 shadow-xl overflow-hidden rounded-[20px] bg-white">
			<!-- Stats Strip -->
			<div class="flex divide-x divide-gray-100 bg-white">
				{#each [
					{v: correct, l: 'Correct', s: '75% of answers', vc: 'text-[#46861E]', sc: 'text-[#488920]'},
					{v: wrong, l: 'Wrong', s: '25% of answers', vc: 'text-[#DD4040]', sc: 'text-[#DD4040]'},
					{v: skipped, l: 'Skipped', s: 'All attempted', vc: 'text-[#CC7D17]', sc: 'text-[#CC7D17]'},
					{v: '38s', l: 'Avg per question', s: 'Ideal pace ✓', vc: 'text-black', sc: 'text-[#488920]'},
					{v: readinessBoost, l: 'Readiness boost', s: 'Now 68/100', vc: 'text-[#216CBD]', sc: 'text-[#216CBD]'}
				] as stat}
					<div class="flex-1 flex flex-col items-center justify-center py-7 px-4 hover:bg-gray-50/50 transition-colors">
						<span class="text-[32px] font-extrabold tracking-tight mb-2 leading-none {stat.vc}">{stat.v}</span>
						<span class="text-[14px] text-gray-400 mb-0.5 tracking-tight">{stat.l}</span>
						<span class="text-[12px] font-semibold {stat.sc}">{stat.s}</span>
					</div>
				{/each}
			</div>
		</Card.Root>

		<!-- AI VERDICT BANNER -->
		<div class="bg-[#0B3D6A] rounded-[16px] px-8 py-7 flex gap-5 border border-[#1b4a7a]/50 relative overflow-hidden group">
			<div class="absolute top-0 right-0 p-10 opacity-[0.03] text-white">
				<Bot class="w-40 h-40" />
			</div>
			<!-- background decorations -->
			<div class="w-[64px] h-[64px] bg-[#14477A] rounded-[16px] flex items-center justify-center shrink-0 shadow-inner relative z-10 border border-[#275E96]/60">
				<Bot class="w-8 h-8 text-white opacity-95" stroke-width={1.5} />
			</div>
			<div class="flex flex-col flex-1 relative z-10">
				<div class="flex items-center gap-3 mb-2">
					<h3 class="text-[16px] font-extrabold text-white tracking-wide">AI performance analysis</h3>
					<span class="text-[11px] bg-[#23588D] text-[#A6CFF1] px-2.5 py-0.5 rounded-full font-bold border border-[#3E7AAA]/50">Updated live</span>
				</div>
				<p class="text-[14px] leading-[1.6] text-[#7DB9ED] mb-4.5 font-medium max-w-[95%]">
					Your Biology score of 74% is your second best ever — solid improvement from 61% last month. You maintained ideal speed at 38s/q throughout. The 5 wrong answers were all in <strong class="text-white">Reproduction & Genetics</strong> (questions 4, 9, 13, 17, 19) — a pattern AI detected across your last 3 sessions. Recommend 2 focused sessions on Genetics before your next Biology attempt.
				</p>
				<div class="flex flex-wrap gap-2.5">
					<span class="px-3.5 py-[5px] rounded-full text-[11px] font-semibold bg-[#124227] text-[#6ED34C] tracking-tight border border-[#21613A]">✓ Speed: Ideal (38s/q)</span>
					<span class="px-3.5 py-[5px] rounded-full text-[11px] font-semibold bg-[#124227] text-[#6ED34C] tracking-tight border border-[#21613A]">✓ Biology avg: 78% → now 79%</span>
					<span class="px-3.5 py-[5px] rounded-full text-[11px] font-semibold bg-[#542131] text-[#ECA0B2] tracking-tight border border-[#7D3247]">⚠ Weak: Reproduction & Genetics (32%)</span>
					<span class="px-3.5 py-[5px] rounded-full text-[11px] font-semibold bg-[#542131] text-[#ECA0B2] tracking-tight border border-[#7D3247]">⚠ Missed same 3 Genetics questions as last session</span>
				</div>
			</div>
		</div>

		<!-- MAIN GRID -->
		<div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
			<!-- Left Main Column -->
			<section class="flex flex-col gap-6 min-w-0">
				<!-- Trend Chart -->
				<Card.Root class="p-8 rounded-[24px] bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
					<div class="flex items-center justify-between mb-10">
						<div>
							<h3 class="text-[16px] font-bold text-[#141522]">Score trend — {subject}</h3>
							<p class="text-[12px] text-gray-400 mt-0.5">Performance tracking over recent attempts</p>
						</div>
						<div class="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 text-[11px] text-gray-400 font-bold">LAST 8 SESSIONS</div>
					</div>
					<div class="h-[200px] w-full">
						<Chart.Container config={{score:{label:"You",color:"#3B6D11"}}} class="h-full w-full">
							<AreaChart data={trendChartData} x="date" xScale={scaleUtc()} series={[{key:"score",label:"Your score",color:"#3B6D11"}]} padding={{left:10,right:10,top:20,bottom:20}} 
								props={{ area:{curve:curveNatural, "fill-opacity":0.1, line:{class:"stroke-[3] drop-shadow-sm"}}, xAxis:{format:v=>v.toLocaleDateString(),tickPadding:12}, yAxis:{format:v=>`${v}%`,tickPadding:12} }}>
							</AreaChart>
						</Chart.Container>
					</div>
				</Card.Root>

				<!-- Answer Review -->
				<Card.Root class="p-8 rounded-[24px] bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
					<div class="flex items-center justify-between mb-8 flex-wrap gap-5">
						<div>
							<h3 class="text-[16px] font-bold text-[#141522]">Answer review</h3>
							<p class="text-[12px] text-gray-400 mt-0.5">Interactive breakdown of your session</p>
						</div>
						<div class="flex flex-wrap gap-1.5 bg-gray-50/80 p-1 rounded-xl">
							{#each reviewFilters as f}
								<button 
									class="px-4 py-2 rounded-lg text-[11px] font-bold transition-all duration-300 
									{activeReviewFilter === f.label ? 'bg-[#3B6D11] text-white shadow-md' : 'text-slate-500 hover:text-[#3B6D11]'}"
									onclick={() => activeReviewFilter = f.label}
								>
									{f.text} <span class="ml-1 opacity-60 text-[10px]">{f.count}</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="flex flex-col gap-3">
						{#each filteredQuestions as q, i}
							{@const isCorrect = q.chosen === q.ans}
							{@const isSkipped = q.chosen === null}
							{@const status = isSkipped ? 'skipped' : (isCorrect ? 'correct' : 'wrong')}
							<div class="border border-gray-50 rounded-[16px] overflow-hidden transition-all duration-300 {expandedQuestion === i ? 'shadow-lg border-emerald-100/50 bg-[#fafcfa]' : 'hover:border-gray-200'}">
								<button 
									class="w-full flex items-start gap-3.5 p-4.5 text-left border-l-[5px]
										{status === 'correct' ? 'border-l-[#3B6D11]' : status === 'wrong' ? 'border-l-[#E24B4A]' : 'border-l-slate-300'}"
									onclick={() => expandedQuestion = expandedQuestion === i ? null : i}
								>
									<div class="size-[28px] rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 shadow-sm
										{status === 'correct' ? 'bg-emerald-50 text-[#3B6D11]' : status === 'wrong' ? 'bg-rose-50 text-[#A32D2D]' : 'bg-slate-100 text-slate-500'}">
										{i+1}
									</div>
									<div class="flex-1 font-semibold text-[14px] text-slate-800 leading-[1.5] pr-6">{q.q}</div>
									<div class="flex flex-col items-end gap-2 shrink-0">
										<Badge class="capitalize text-[10px] font-black tracking-tight px-3 py-1 rounded-full border-none shadow-none
											{status === 'correct' ? 'bg-emerald-100 text-[#3B6D11]' : status === 'wrong' ? 'bg-rose-100 text-[#A32D2D]' : 'bg-slate-100 text-slate-500'}">
											{status === 'correct' ? '✓ Correct' : status === 'wrong' ? '✗ Incorrect' : '— Skipped'}
										</Badge>
										<span class="text-[11px] text-[#bbb] font-bold flex items-center gap-1"><Clock class="w-3 h-3" /> {q.time}s</span>
									</div>
								</button>

								{#if expandedQuestion === i}
									<div class="px-5 pb-5 border-t border-gray-100" transition:slide>
										<div class="py-4 space-y-2">
											{#each q.opts as opt, oi}
												<div class="flex items-center gap-3 p-3 rounded-xl border text-[13px] transition-all
													{oi === q.ans ? 'bg-emerald-50/70 border-emerald-200 text-[#3B6D11] font-bold shadow-sm' : 
													 (oi === q.chosen && !isCorrect ? 'bg-rose-50/70 border-rose-200 text-[#A32D2D]' : 'bg-white border-gray-100')}">
													<div class="size-[24px] rounded-md flex items-center justify-center text-[11px] font-bold shrink-0
														{oi === q.ans ? 'bg-[#3B6D11] text-white' : (oi === q.chosen ? 'bg-[#E24B4A] text-white' : 'bg-gray-100 text-gray-500')}">
														{String.fromCharCode(65 + oi)}
													</div>
													<span class="flex-1 text-[#444]">{opt}</span>
													{#if oi === q.ans}<CheckCircle2 class="size-4 text-[#3B6D11]" />{/if}
													{#if oi === q.chosen && !isCorrect}<XCircle class="size-4 text-[#A32D2D]" />{/if}
												</div>
											{/each}
										</div>
										<div class="bg-blue-50/50 p-4 rounded-[16px] border border-blue-100/30">
											<div class="flex items-center gap-2 text-[11px] font-black text-[#185FA5] mb-2 uppercase tracking-wide">🤖 AI Explanation</div>
											<p class="text-[13px] text-[#2b6ba1] leading-[1.6] font-medium">{q.exp}</p>
										</div>
										<div class="flex gap-2.5 mt-4">
											<Button size="sm" variant="outline" class="h-8.5 text-[11px] font-bold px-4 rounded-xl border-emerald-200 text-[#3B6D11] bg-white hover:bg-emerald-50 transition-colors">🔖 Bookmark Question</Button>
											<Button size="sm" variant="outline" class="h-8.5 text-[11px] font-bold px-4 rounded-xl border-gray-200 bg-white hover:bg-gray-50">▷ Practice Topic</Button>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</Card.Root>
			</section>

			<!-- Right Sidebar -->
			<aside class="flex flex-col gap-6 shrink-0">
				<!-- Redemption Mode -->
				<div class="bg-gradient-to-br from-[#141522] to-[#2D3A14] rounded-[24px] p-6 text-emerald-400 relative overflow-hidden group shadow-xl">
					<div class="absolute top-0 right-0 p-5 size-32 opacity-10 group-hover:opacity-25 transition-all rotate-12 group-hover:rotate-0">
						<RotateCcw class="size-full" stroke-width={1} />
					</div>
					<div class="relative z-10">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-[16px] font-bold text-white tracking-wide">Redemption Mode</h3>
							<span class="bg-emerald-500/20 text-[#C0DD97] font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tighter">Active</span>
						</div>
						<p class="text-[13px] leading-[1.55] mb-6 text-white/50 font-medium">Retry only the 5 wrong answers while they're fresh. No credits used.</p>
						<div class="grid grid-cols-3 gap-2.5 mb-6 text-center">
							{#each [{v:5,l:'Wrong'}, {v:0,l:'Cost'}, {v:'~5m',l:'Est'}] as r}
								<div class="bg-white/5 rounded-xl py-3 px-2 border border-white/5 transition-all hover:bg-white/10 decoration-white/20">
									<div class="text-[20px] font-black text-white leading-none">{r.v}</div>
									<div class="text-[9px] font-bold text-[#8FA882] mt-1.5 uppercase tracking-wide">{r.l}</div>
								</div>
							{/each}
						</div>
						<Button class="w-full h-12 bg-[#3B6D11] hover:bg-[#5A9A1A] text-white font-bold rounded-xl active:scale-95 transition-all text-[14px] shadow-lg shadow-emerald-950/20 border-none">Start Redemption →</Button>
						<p class="text-[11px] text-white/30 text-center mt-3 font-semibold italic">Score remains unaffected</p>
					</div>
				</div>

				<!-- What's Next -->
				<Card.Root class="p-6 rounded-[24px] bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
					<h3 class="text-[15px] font-bold text-[#141522] mb-5 tracking-tight">What's next?</h3>
					<div class="flex flex-col gap-2">
						{#each [
							{t:'Practice Bio Again', s:'New set of questions', i:Play, bg:'bg-emerald-50 text-[#3B6D11]'},
							{t:'Topic: Genetics', s:'AI recommendation', i:Target, bg:'bg-rose-50 text-[#A32D2D]'},
							{t:'Review Bookmarks', s:'12 saved items', i:Bookmark, bg:'bg-blue-50 text-blue-600'},
							{t:'Full Mock Exam', s:'180q · 120m', i:Award, bg:'bg-indigo-50 text-indigo-600'}
						] as qa}
							<button class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-50 hover:bg-gray-50/80 transition-all text-left group">
								<div class="size-[38px] rounded-xl {qa.bg} flex items-center justify-center shrink-0 border border-gray-50 group-hover:scale-105 transition-transform"><qa.i class="size-5" /></div>
								<div class="flex-1 min-w-0 pr-6">
									<span class="block text-[13px] font-bold text-slate-800 leading-tight mb-1 truncate">{qa.t}</span>
									<span class="text-[11px] font-bold text-slate-400 capitalize opacity-70 tracking-tighter">{qa.s}</span>
								</div>
								<ArrowRight class="size-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
							</button>
						{/each}
					</div>
				</Card.Root>

				<!-- Timeline -->
				<Card.Root class="p-6 rounded-[24px] bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
					<h3 class="text-[15px] font-bold text-[#141522] mb-6 tracking-tight">Session timeline</h3>
					<div class="relative space-y-4">
						<div class="absolute left-[13px] top-6 bottom-6 w-px bg-gray-100"></div>
						{#each [
							{t:'Session started', s:'Biology · JAMB 2022', i:'▷', bg:'bg-emerald-50 text-emerald-600', time:'10:02 AM'},
							{t:'3 questions flagged', s:'Q4, Q13, Q17 marked', i:'🚩', bg:'bg-amber-50 text-amber-600', time:'10:09 AM'},
							{t:'Submitted & scored', s:'74% · 18m 24s', i:'⬆', bg:'bg-[#3B6D11] text-white', time:'10:20 AM'}
						] as tl}
							<div class="flex gap-4 relative z-10 group/tl">
								<div class="size-[28px] rounded-full {tl.bg} border-2 border-white shadow-sm flex items-center justify-center text-[11px] shrink-0 font-black">{tl.i}</div>
								<div class="flex-1 min-w-0 pr-10">
									<span class="block text-[13px] font-bold text-slate-800 leading-tight mb-0.5 truncate">{tl.t}</span>
									<span class="text-[11px] font-medium text-slate-400 tracking-tight">{tl.s}</span>
								</div>
								<span class="text-[10px] absolute right-0 top-0.5 font-bold text-[#ddd] uppercase tracking-tighter">{tl.time}</span>
							</div>
						{/each}
					</div>
				</Card.Root>

				<!-- Share -->
				<div class="bg-white rounded-[24px] border-none p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
					<h3 class="text-[14px] font-extrabold text-[#141522]">Share your result</h3>
					<div class="flex flex-wrap gap-2">
						<Button size="sm" class="bg-[#25D366] hover:opacity-95 font-bold px-5 rounded-xl text-white border-none shadow-md shadow-emerald-900/10 text-[12px] h-10">💬 WhatsApp</Button>
						<Button size="sm" variant="outline" class="border-gray-100 font-bold px-5 rounded-xl bg-gray-50 text-[#555] text-[12px] h-10 hover:bg-white transition-all"><Link2 class="size-4 mr-2" /> Copy link</Button>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>

<style>
	:global(.chart-container) { font-family: inherit !important; }
	:global(body) { background-color: #f8f9fc; }
</style>
