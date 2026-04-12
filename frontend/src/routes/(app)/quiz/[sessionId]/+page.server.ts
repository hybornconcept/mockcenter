import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	return {
		sessionId: params.sessionId,
		mode: url.searchParams.get('mode') || 'ai',
		questionsPerPage: parseInt(url.searchParams.get('questionsPerPage') || '5'),
		duration: parseInt(url.searchParams.get('duration') || '0'),
		passMark: parseInt(url.searchParams.get('passMark') || '40'),
		shuffle: url.searchParams.get('shuffle') === 'true',
		redemption: url.searchParams.get('redemption') === 'true',
		skip: url.searchParams.get('skip') !== 'false',
		subjectName: url.searchParams.get('subjectName') || 'Subject',
		examType: url.searchParams.get('examType') || 'Exam',
		year: url.searchParams.get('year') || 'Year'
	};
};
