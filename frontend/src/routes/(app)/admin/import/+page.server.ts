import type { PageServerLoad, Actions } from './$types';
import { adminFetch } from '$lib/server/adminApi';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch }) => {
  const [sResult, eResult] = await Promise.all([
    adminFetch<any[]>(fetch, '/subjects'),
    adminFetch<any[]>(fetch, '/exams'),
  ]);

  const subjects: { id: string; name: string }[] = sResult.ok
    ? sResult.data.map((s: any) => ({ id: s.id, name: s.name }))
    : [];

  const exams: { id: string; name: string; type: string }[] = eResult.ok
    ? eResult.data.map((e: any) => ({ id: e.id, name: e.name, type: e.type }))
    : [];

  const colDefs = [
    { key: 'question',    label: 'Question text',    required: true,  values: 'Any text' },
    { key: 'type',        label: 'Question type',    required: true,  values: 'MCQ · TF · FIB · THEORY' },
    { key: 'opt_a',       label: 'Option A',         required: false, values: 'Text (MCQ only)' },
    { key: 'opt_b',       label: 'Option B',         required: false, values: 'Text (MCQ only)' },
    { key: 'opt_c',       label: 'Option C',         required: false, values: 'Text (MCQ only)' },
    { key: 'opt_d',       label: 'Option D',         required: false, values: 'Text (MCQ only)' },
    { key: 'correct',     label: 'Correct answer',   required: true,  values: 'A/B/C/D · True/False · text' },
    { key: 'subject',     label: 'Subject',          required: false, values: subjects.slice(0, 3).map(s => s.name).join(' · ') + ' etc.' },
    { key: 'exam',        label: 'Exam type',        required: false, values: exams.map(e => e.name).join(' · ') },
    { key: 'year',        label: 'Year',             required: false, values: 'e.g. 2023' },
    { key: 'explanation', label: 'Explanation',      required: false, values: 'Any text' },
    { key: 'credit_cost', label: 'Credit cost',      required: false, values: '1–20 (default: 1)' },
  ];

  return {
    subjects,
    exams,
    subjectNames: subjects.map(s => s.name),
    colDefs,
  };
};

export const actions: Actions = {
  /**
   * importCsv — receives a pre-parsed JSON payload from the client
   * (the frontend reads the CSV file and sends the rows as JSON).
   * Returns { inserted, errors } from the backend.
   */
  importCsv: async ({ request, fetch }) => {
    const form = await request.formData();
    const rowsJson = form.get('rows')?.toString() ?? '[]';
    const defaultSubjectId = form.get('defaultSubjectId')?.toString() ?? '';
    const defaultExamId    = form.get('defaultExamId')?.toString()    ?? '';

    if (!defaultSubjectId || !defaultExamId) {
      return fail(400, { error: 'Please select a default subject and exam before importing.' });
    }

    let rows: unknown[];
    try {
      rows = JSON.parse(rowsJson);
      if (!Array.isArray(rows) || rows.length === 0) throw new Error('Empty');
    } catch {
      return fail(400, { error: 'Invalid CSV data. Make sure the file is correctly formatted.' });
    }

    const result = await adminFetch<{ inserted: number; errors: { row: number; error: string }[] }>(
      fetch,
      '/questions/import',
      {
        method: 'POST',
        body: JSON.stringify({ rows, defaultSubjectId, defaultExamId }),
      },
    );

    if (!result.ok) {
      return fail(500, { error: result.error });
    }

    return { success: true, inserted: result.data.inserted, errors: result.data.errors };
  },
};