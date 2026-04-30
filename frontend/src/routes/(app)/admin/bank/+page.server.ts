import type { PageServerLoad, Actions } from './$types';
import { adminFetch } from '$lib/server/adminApi';
import { fail } from '@sveltejs/kit';

const FALLBACK_SUBJECTS = ['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry', 'Government', 'History', 'Geography', 'Economics'];

export const load: PageServerLoad = async ({ fetch, url }) => {
  const page   = Number(url.searchParams.get('page')   ?? 1);
  const search = url.searchParams.get('search') ?? undefined;
  const year   = url.searchParams.get('year')   ?? undefined;

  const params = new URLSearchParams({ limit: '1000', page: String(page) });
  if (search) params.set('search', search);
  if (year)   params.set('year', year);

  const [qResult, sResult, eResult] = await Promise.all([
    adminFetch<{ questions: any[]; total: number }>(fetch, `/questions?${params}`),
    adminFetch<any[]>(fetch, '/subjects'),
    adminFetch<any[]>(fetch, '/exams'),
  ]);

  const questions = qResult.ok
    ? qResult.data.questions.map((q: any) => ({
        id:          q.id,
        text:        q.body,
        type:        'MCQ',
        subject:     q.subjectName?.trim() ?? '—',
        exam:        q.examType?.toUpperCase() ?? q.examName ?? '—',
        year:        String(q.year ?? ''),
        explanation: q.explanationBody ?? '',
        img_url:     q.imageUrl ?? null,
        marks:       q.creditCost ?? 1,
        date:        q.createdAt ? new Date(q.createdAt).toISOString().slice(0, 10) : '',
        attempts:    q.attempts ?? 0,
        correctRate: q.correctRate ?? null,
        diff:        q.diff ?? 'Medium',
        options:     q.options ?? [],
      }))
    : [];

  const total    = qResult.ok ? qResult.data.total : 0;
  const subjects = sResult.ok ? sResult.data.map((s: any) => ({ id: s.id, name: s.name })) : [];
  const exams    = eResult.ok ? eResult.data.map((e: any) => ({ id: e.id, name: e.name, type: e.type })) : [];

  // Compute subject balance from actual questions
  const subjectMap = new Map<string, number>();
  questions.forEach((q: any) => {
    if (q.subject !== '—') {
      subjectMap.set(q.subject, (subjectMap.get(q.subject) ?? 0) + 1);
    }
  });

  const subjectBalance = Array.from(subjectMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const breakdown = {
    difficulty: [
      { name: "Easy", count: Math.floor(questions.length * 0.4), c: "bg-emerald-500", ct: "text-emerald-700" },
      { name: "Med", count: Math.floor(questions.length * 0.4), c: "bg-amber-500", ct: "text-amber-700" },
      { name: "Hard", count: questions.length - 2 * Math.floor(questions.length * 0.4), c: "bg-red-500", ct: "text-red-700" },
    ],
    types: [
      { name: "MCQ", count: questions.length, c: "bg-blue-500", ct: "text-blue-700" },
      { name: "T/F", count: 0, c: "bg-brand", ct: "text-brand-dark" },
      { name: "FIB", count: 0, c: "bg-amber-500", ct: "text-amber-700" },
    ]
  };

  return {
    questions,
    total,
    page,
    subjects,
    subjectNames: subjects.length 
      ? [...new Set(subjects.map((s: any) => s.name.trim()))] 
      : FALLBACK_SUBJECTS,
    exams,
    subjectBalance,
    breakdown,
  };
};

export const actions: Actions = {
  /** Create a single question with options */
  createQuestion: async ({ request, fetch }) => {
    const form = await request.formData();
    const body = form.get('body')?.toString();
    if (!body) return fail(400, { error: 'Question text is required' });

    const optionsJson = form.get('options')?.toString() ?? '[]';
    let opts: unknown[];
    try { opts = JSON.parse(optionsJson); } catch { return fail(400, { error: 'Invalid options JSON' }); }

    const payload = {
      subjectId:   form.get('subjectId')?.toString() ?? '',
      examId:      form.get('examId')?.toString()    ?? '',
      body,
      topic:       form.get('topic')?.toString()       || undefined,
      year:        form.get('year')   ? Number(form.get('year'))   : undefined,
      creditCost:  form.get('cost')   ? Number(form.get('cost'))   : 1,
      explanation: form.get('explanation')?.toString() || undefined,
      imageUrl:    form.get('imageUrl')?.toString()    || undefined,
      options: opts,
    };

    if (!payload.subjectId || !payload.examId) {
      return fail(400, { error: 'Subject and Exam are required' });
    }

    const result = await adminFetch(fetch, '/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Edit an existing question (partial update) */
  editQuestion: async ({ request, fetch }) => {
    const form = await request.formData();
    const id   = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Question ID is required' });

    const patch: Record<string, unknown> = {};
    const str = (k: string) => form.get(k)?.toString() || undefined;
    if (str('body'))        patch.body        = str('body');
    if (str('topic'))       patch.topic       = str('topic');
    if (str('explanation')) patch.explanation = str('explanation');
    if (str('imageUrl'))    patch.imageUrl    = str('imageUrl');
    if (str('subjectId'))   patch.subjectId   = str('subjectId');
    if (str('examId'))      patch.examId      = str('examId');
    if (str('year'))        patch.year        = Number(str('year'));
    if (str('cost'))        patch.creditCost  = Number(str('cost'));

    const result = await adminFetch(fetch, `/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Delete a question by ID */
  deleteQuestion: async ({ request, fetch }) => {
    const form = await request.formData();
    const id   = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Question ID is required' });

    const result = await adminFetch(fetch, `/questions/${id}`, { method: 'DELETE' });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },
};
