import type { PageServerLoad } from './$types';
import { THUMBNAIL_MAP } from '$lib/utils/subjectMeta';

const SUBJECT_META: Record<
	string,
	{ title: string; category: string; iconColor: string; description: string }
> = {
	Biology: {
		title: "Comprehensive Biology: Life Sciences & Ecosystems",
		category: "Sciences",
		iconColor: "bg-emerald-400",
		description:
			"Master cell biology, genetics, ecology, and human anatomy. Covers all major JAMB and WAEC Biology topics with past questions. Dive deep into the study of life processes, organism structures, evolutionary biology, and ecological interactions. This comprehensive module provides extensive practice materials designed to ensure complete preparedness, sharpen your analytical skills, and dramatically improve your exam performance.",
	},
	Chemistry: {
		title: "Chemistry: Atomic Structure to Organic Reactions",
		category: "Sciences",
		iconColor: "bg-blue-400",
		description:
			"From the periodic table to organic chemistry — a complete guide covering acids, bases, reactions, and quantitative chemistry. Master the fundamental principles of chemical reactions, stoichiometry, atomic theory, and physical chemistry. By practicing with real exam questions, you will build the analytical foundation needed to excel in laboratory concepts and complex theoretical calculations for your final examinations.",
	},
	Physics: {
		title: "Physics: Mechanics, Waves & Modern Physics",
		category: "Sciences",
		iconColor: "bg-violet-400",
		description:
			"Build a strong foundation in Newtonian mechanics, electromagnetism, optics, and modern physics for JAMB and WAEC. This rigorous practice module helps you understand the fundamental laws governing energy, matter, and the universe. Engage with comprehensive numerical problems and theoretical questions designed to enhance your critical thinking and ensure outstanding results in all standard physics examinations.",
	},
	Mathematics: {
		title: "Mathematics: Algebra, Calculus & Statistics",
		category: "Sciences",
		iconColor: "bg-sky-400",
		description:
			"Sharpen your maths skills across algebra, trigonometry, calculus, probability, and statistics with exam-focused questions. Develop a robust problem-solving methodology by tackling real past questions across all major mathematical topics. This extensive practice environment is specifically tailored to build your speed, accuracy, and confidence, ensuring you are fully equipped to handle any numerical challenge in your exams.",
	},
	"English Language": {
		title: "English Language: Comprehension & Grammar Mastery",
		category: "General",
		iconColor: "bg-orange-400",
		description:
			"Improve comprehension, essay writing, lexis & structure, and oral English skills. Targeted at JAMB, WAEC, and NECO candidates. Develop exceptional communication abilities through rigorous practice with diverse comprehension passages, intricate grammar rules, and complex vocabulary exercises. This complete guide ensures you master the nuances of the English language required to achieve top-tier grades in any examination.",
	},
	"Use of English": {
		title: "Use of English: Communication Skills",
		category: "General",
		iconColor: "bg-orange-400",
		description:
			"Master lexis, structure, comprehension passages, and summary writing essential for JAMB Use of English. Enhance your ability to identify grammatical errors, understand complex contextual meanings, and quickly analyze dense reading materials. By practicing with real past questions, you will develop the precise linguistic skills and time-management strategies necessary to conquer the compulsory English language exam section.",
	},
	Economics: {
		title: "Economics: Micro & Macro Economic Principles",
		category: "Commercial",
		iconColor: "bg-rose-400",
		description:
			"Understand supply and demand, market structures, national income, fiscal policy, and economic development for exam success. Gain a comprehensive understanding of both microeconomic behaviors and macroeconomic systems. This module provides extensive practice on economic theories, graphs, and practical calculations to ensure you are fully prepared to tackle complex economic scenarios and secure a high score.",
	},
	Geography: {
		title: "Geography: Physical & Human Geography",
		category: "Arts",
		iconColor: "bg-teal-400",
		description:
			"Explore landforms, weather, population, and settlement patterns. Covers both physical and human geography topics. Journey through diverse environmental systems, geographical phenomena, and the intricate relationship between humans and their environments. Through detailed map-reading exercises and theoretical past questions, this practice module equips you with the spatial awareness and geographical knowledge needed for exam excellence.",
	},
	Commerce: {
		title: "Commerce: Trade, Banking & Business Operations",
		category: "Commercial",
		iconColor: "bg-cyan-400",
		description:
			"Learn about trade, communication, transportation, banking, and commercial documents for WAEC and NECO. Master the foundational principles of business operations, market dynamics, and international trade relationships. This comprehensive practice guide provides targeted questions on the commercial environment, equipping you with the practical business knowledge and analytical skills required to excel in your upcoming commerce examinations.",
	},
	Agriculture: {
		title: "Agriculture: Crop & Animal Production",
		category: "Sciences",
		iconColor: "bg-lime-500",
		description:
			"Covers soil science, crop production, animal husbandry, farm management, and agricultural economics. Gain in-depth knowledge of sustainable farming practices, agricultural machinery, and modern food production systems. By working through these extensive practice questions, you will develop a profound understanding of the agricultural sector, fully preparing you for success in both practical and theoretical agricultural science exams.",
	},
	Government: {
		title: "Government: Political Theory & Nigerian Governance",
		category: "Arts",
		iconColor: "bg-indigo-400",
		description:
			"Study political concepts, Nigerian government structures, constitutions, and international relations. Delve into the history of political development, electoral systems, and the roles of international organizations. This extensive practice module is designed to give you a complete understanding of governance and civic responsibilities, ensuring you are thoroughly prepared to excel in your government and political science exams.",
	},
	CRS: {
		title: "Christian Religious Studies: Bible & Moral Living",
		category: "Arts",
		iconColor: "bg-amber-400",
		description:
			"In-depth coverage of Old and New Testament themes, church history, and Christian moral values. Explore the profound historical context of biblical narratives, the teachings of the prophets, and the early Christian church. By practicing with these comprehensive questions, you will deepen your understanding of religious principles and easily master the complete syllabus required for examination success.",
	},
	"Christian Religious Studies": {
		title: "Christian Religious Studies: Bible & Moral Living",
		category: "Arts",
		iconColor: "bg-amber-400",
		description:
			"In-depth coverage of Old and New Testament themes, church history, and Christian moral values. Explore the profound historical context of biblical narratives, the teachings of the prophets, and the early Christian church. By practicing with these comprehensive questions, you will deepen your understanding of religious principles and easily master the complete syllabus required for examination success.",
	},
	"Literature in English": {
		title: "Literature in English: Poetry, Prose & Drama",
		category: "Arts",
		iconColor: "bg-fuchsia-400",
		description:
			"Analyse prescribed texts across poetry, prose, and drama. Develop critical thinking and literary appreciation skills. Dive deep into thematic exploration, character analysis, and literary devices used by renowned authors. This comprehensive practice module guides you through rigorous textual interpretations and comparative analysis, ensuring you are completely prepared to tackle complex essay questions and objective tests alike.",
	},
	Literature: {
		title: "Literature in English: Poetry, Prose & Drama",
		category: "Arts",
		iconColor: "bg-fuchsia-400",
		description:
			"Analyse prescribed texts across poetry, prose, and drama. Develop critical thinking and literary appreciation skills. Dive deep into thematic exploration, character analysis, and literary devices used by renowned authors. This comprehensive practice module guides you through rigorous textual interpretations and comparative analysis, ensuring you are completely prepared to tackle complex essay questions and objective tests alike.",
	},
};

const getSubjectMeta = (subjectName: string) => {
	const DEFAULT_META = {
		title: `${subjectName}: Practice Questions`,
		category: "General",
		iconColor: "bg-brand",
		description: `Practice past exam questions in ${subjectName} to improve your score and boost exam confidence. This comprehensive practice module provides extensive materials designed to ensure complete preparedness, sharpen your analytical skills, and dramatically improve your overall academic performance in the subject.`,
	};

	return SUBJECT_META[subjectName] ?? DEFAULT_META;
};

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	const user = await locals.getUser() as any;
	
	const subjectName = url.searchParams.get('subjectName') || 'Biology';
	const subjectThumbnail = THUMBNAIL_MAP[subjectName] ?? null;
	const subjectMeta = getSubjectMeta(subjectName);

	if (!user) return { exams: [], subjects: [], subjectStats: null, subjectThumbnail, subjectMeta };

	const subjectId = url.searchParams.get('subjectId');

	try {
		// Fetch configure data (all exams + subjects) and subject stats in parallel
		const requests: Promise<Response>[] = [
			fetch('/api/users/configure', { credentials: 'include' }),
		];

		if (subjectId) {
			requests.push(
				fetch(`/api/users/subject-stats?subjectId=${encodeURIComponent(subjectId)}`, {
					credentials: 'include',
				})
			);
		}

		const [configRes, statsRes] = await Promise.all(requests);

		if (!configRes.ok) throw new Error('configure fetch failed');
		const configJson = await configRes.json();

		let subjectStats = null;
		if (statsRes && statsRes.ok) {
			const statsJson = await statsRes.json();
			subjectStats = statsJson.data ?? null;
		}

		return {
			exams:        configJson.data?.exams    ?? [],
			subjects:     configJson.data?.subjects ?? [],
			subjectStats,
			subjectThumbnail,
			subjectMeta,
		};
	} catch (err) {
		console.error('[configure] load failed:', err);
		return { exams: [], subjects: [], subjectStats: null, subjectThumbnail, subjectMeta };
	}
};
