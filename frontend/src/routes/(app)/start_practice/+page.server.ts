import type { PageServerLoad } from './$types';
import { THUMBNAIL_MAP, CATEGORY_MAP, SUBJECT_COLORS, DEFAULT_COLORS } from '$lib/utils/subjectMeta';

function mapItem(s: any): any {
	const name         = s.title ?? s.name ?? '';
	const accuracy     = s.accuracy ?? 0;
	const completion   = s.completion ?? 0;
	const sessionCount = Math.round(completion / 10);
	const isCompleted  = completion >= 100;
	const colors       = SUBJECT_COLORS[name] ?? DEFAULT_COLORS;

	return {
		id:               s.id,
		subjectId:        s.subjectId ?? s.id,
		examId:           s.examId,
		title:            name,
		// Always resolve thumbnail — prefer API value, fallback to local map
		thumbnail:        s.thumbnail ?? THUMBNAIL_MAP[name] ?? null,
		category:         CATEGORY_MAP[name] ?? 'General',

		accuracy,
		completion,
		bestScore:        s.bestScore ?? accuracy,

		thumbnailGradient: s.gradient ?? colors.gradient,
		progressColor:     s.progress ?? colors.progress,
		brandText:         s.text    ?? colors.text,
		brandBadge:        s.badge   ?? colors.badge,
		buttonStyle:       s.button  ?? colors.button,
		buttonText:        sessionCount > 0 ? 'Continue' : 'Start Practice',

		timeLeftText:  isCompleted
			? 'Completed'
			: sessionCount > 0
			? `${sessionCount} session${sessionCount !== 1 ? 's' : ''} done`
			: 'Not started',

		masteryStars: accuracy >= 80 ? 3 : accuracy >= 60 ? 2 : accuracy >= 40 ? 1 : 0,
		difficulty:   accuracy >= 70 ? 'Mastered' : accuracy >= 40 ? 'Improving' : 'Beginner',
	};
}

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const user = await locals.getUser() as any;
	if (!user) return { items: [] };

	try {
		const res = await fetch('/api/users/subjects', { credentials: 'include' });
		if (!res.ok) throw new Error(`subjects fetch failed: ${res.status}`);
		const json = await res.json();
		let raw: any[] = json.data?.items ?? [];

		// Fallback: if user has no targetExam or DB has no matching subjects,
		// pull from /configure which returns ALL exams+subjects
		if (raw.length === 0) {
			const fallback = await fetch('/api/users/configure', { credentials: 'include' });
			if (fallback.ok) {
				const fb = await fallback.json();
				const allSubjects: any[] = fb.data?.subjects ?? [];
				const allExams:    any[] = fb.data?.exams    ?? [];
				const examMap = new Map(allExams.map((e: any) => [e.id, e]));

				raw = allSubjects.map((s: any, idx: number) => ({
					id:         idx + 1,
					subjectId:  s.id,
					examId:     s.examId,
					title:      s.name,
					thumbnail:  null,   // mapItem will resolve from THUMBNAIL_MAP
					accuracy:   0,
					completion: 0,
					bestScore:  0,
				}));
			}
		}

		return { items: raw.map(mapItem) };
	} catch (err) {
		console.error('[start_practice] load failed:', err);
		return { items: [] };
	}
};
