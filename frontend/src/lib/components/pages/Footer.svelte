<script lang="ts">
</script>

<footer class="w-full bg-brand-dark pt-12 pb-6 px-6 border-t border-white/5">
	<div class="max-w-[1240px] mx-auto">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-4 mb-10">
			<!-- Logo and Description -->
			<div class="lg:col-span-6 flex flex-col gap-3">
				<div class="flex items-center gap-2.5">
					<div class="w-7 h-7 bg-white rounded-md flex items-center justify-center text-brand-dark font-black text-base">
						m
					</div>
					<span class="text-xl font-black text-white tracking-tight" style="font-family: 'Inter Tight', sans-serif;">mockcenter</span>
				</div>
				<p class="text-white/50 text-xs md:text-[13px] leading-relaxed max-w-sm font-medium">
					Nigeria's most powerful CBT exam prep platform. Practice JAMB, WAEC, and NECO past questions with AI-powered coaching.
				</p>
			</div>

			<!-- Platform Links -->
			<div class="lg:col-span-2 flex flex-col gap-3">
				<h4 class="text-[9px] font-bold text-brand-muted uppercase tracking-[0.2em]">Platform</h4>
				<ul class="flex flex-col gap-1.5">
					<li><a href="/dashboard" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Dashboard</a></li>
					<li><a href="/subjects" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Subjects</a></li>
					<li><a href="/exams" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Mock Exams</a></li>
					<li><a href="/analytics" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Analytics</a></li>
					<li><a href="/leaderboard" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Leaderboard</a></li>
				</ul>
			</div>

			<!-- Exams Links -->
			<div class="lg:col-span-2 flex flex-col gap-3">
				<h4 class="text-[9px] font-bold text-brand-muted uppercase tracking-[0.2em]">Exams</h4>
				<ul class="flex flex-col gap-1.5">
					<li><a href="/jamb" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">JAMB / UTME</a></li>
					<li><a href="/waec" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">WAEC / SSCE</a></li>
					<li><a href="/neco" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">NECO</a></li>
					<li><a href="/post-utme" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Post-UTME</a></li>
					<li><a href="/gce" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">GCE</a></li>
				</ul>
			</div>

			<!-- Company Links -->
			<div class="lg:col-span-2 flex flex-col gap-3">
				<h4 class="text-[9px] font-bold text-brand-muted uppercase tracking-[0.2em]">Company</h4>
				<ul class="flex flex-col gap-1.5">
					<li><a href="/about" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">About us</a></li>
					<li><a href="/blog" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Blog</a></li>
					<li><a href="/refer" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Invite Friends</a></li>
					<li><a href="/privacy" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Privacy policy</a></li>
					<li><a href="/terms" class="text-[11px] md:text-[12px] font-semibold text-white/60 hover:text-brand transition-colors">Terms of service</a></li>
				</ul>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div class="pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
			<div class="flex items-center gap-1.5 text-[10px] md:text-[11px] font-medium text-white/30">
				<span>© 2026 mockcenter. Built with </span>
				<svg class="w-2.5 h-2.5 fill-brand/80 mx-0.5" viewBox="0 0 24 24">
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
				</svg>
				<span> for <span class="text-white/60 font-bold">Nigerian students.</span></span>
			</div>

			<!-- Social Icons -->
			<div class="flex items-center gap-1.5">
				<a href="/" aria-label="Twitter" class="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-brand/20 hover:border-brand/40 transition-all shadow-xs active:scale-95">
					<svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
						<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
					</svg>
				</a>
				<a href="/" aria-label="LinkedIn" class="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-brand/20 hover:border-brand/40 transition-all shadow-xs active:scale-95">
					<svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
					</svg>
				</a>
				<a href="/" aria-label="Mobile app" class="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-brand/20 hover:border-brand/40 transition-all shadow-xs active:scale-95">
					<svg class="w-3 h-3 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
						<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
						<line x1="12" y1="18" x2="12.01" y2="18"></line>
					</svg>
				</a>
				<a href="/" aria-label="YouTube" class="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-brand/20 hover:border-brand/40 transition-all shadow-xs active:scale-95">
					<svg class="w-3 h-3 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<polygon points="10 8 16 12 10 16 10 8"></polygon>
					</svg>
				</a>
			</div>
		</div>
	</div>
</footer>
