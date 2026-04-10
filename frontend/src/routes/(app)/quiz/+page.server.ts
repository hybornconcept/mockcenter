import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async () => {
	// Generate 20 questions (reduced from 50)
	const questions: Question[] = Array.from({ length: 20 }, (_, i) => {
		const id = i + 1;
		let section = "General";

		// Default State declarations
		let status: QuestionStatus = "not-visited";
		let selectedOption: number | null = null;
		let isBookmarked = false;

		// Mock Data Distribution - Reset to clean state as requested
		if (id === 1) {
			status = "not-answered"; // Current active (Q1)
		} else if (id < 1) {
			status = "not-answered"; // None visited
		} else {
			status = "not-visited";
		}

		// Cycle through 5 different question templates to create variety
		const templates = [
			{
				text: "The following question, consists of an incomplete sentence or a sentence which is split into four parts. All four parts are jumbled up and are named as P, Q, R and S. These four parts are not given in their proper order. Arrange the jumbled parts of the sentence and find out which of the four combinations from the given options will correctly complete the sentence.\n\nFor some people patriotism ____________________ as much as to any one country.",
				options: ["Q: 21", "Q: 21", "Q: 21", "Q: 21"]
			},
			{
				text: "In the following question, a sentence has been given in Active/Passive Voice. Out of the four alternatives suggested, select the one which best expresses the same sentence in Passive/Active Voice.\n\nHe was driving a car.",
				options: ["A car was being driven by him.", "A car is being driven by him.", "A car was driven by him.", "A car had been driven by him."]
			},
			{
				text: "Select the most appropriate word to fill in the blank.\n\nThe company has ___________ a new policy for employee welfare.",
				options: ["adopted", "adapted", "adepted", "accepted"]
			},
			{
				text: "Find the synonym of the given word.\n\nCANDID",
				options: ["Frank", "Secretive", "Cruel", "Arrogant"]
			},
			{
				text: "Choose the correctly spelt word.",
				options: ["Accommodation", "Acommodation", "Accommudation", "Acommodatlon"]
			}
		];

		const template = templates[i % 5];

		return {
			id,
			section,
			text: template.text,
			options: template.options,
			selectedOption,
			status,
			isBookmarked,
		};
	});

	// Initial State Adjustments
	questions[14].status = "not-answered"; // Q15 active
	questions[14].selectedOption = null;

	// Simplified single section for UI
	const sections: Section[] = [
		{ name: "General Intelligence", range: [1, 20] }
	];

	return {
		sections,
		questions
	};
};
