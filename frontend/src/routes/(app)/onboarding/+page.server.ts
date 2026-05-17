import type { PageServerLoad } from './$types';

export const load = (async () => {
	const STUDENT_EXAMS = [
		{ value: "jamb", label: "JAMB / UTME" },
		{ value: "waec", label: "WAEC / SSCE" },
		{ value: "neco", label: "NECO" },
		{ value: "post_utme", label: "Post-UTME" },
		{ value: "common_entrance", label: "Common Entrance" },
		{ value: "nabteb", label: "NABTEB" },
	];

	const PROFESSIONAL_EXAMS = [
		{ value: "ican", label: "ICAN" },
		{ value: "ican_atswa", label: "ICAN ATSWA" },
		{ value: "citn", label: "CITN" },
		{ value: "law_school", label: "Law School" },
		{ value: "trcn", label: "TRCN" },
		{ value: "ielts", label: "IELTS" },
		{ value: "nimasa", label: "NIMASA" },
		{ value: "other", label: "Other" },
	];

	const EXAM_LEVELS = [
		{ value: "foundation", label: "Foundation / Level 1" },
		{ value: "skills", label: "Skills / Level 2" },
		{ value: "professional", label: "Professional / Final" }
	];

	const steps = [
		{ id: 1, label: "Who are you?", title: "What describes you best?", subtitle: "This helps MockCenter's AI personalise your practice plan, quiz difficulty, and recommendations." },
		{ id: 2, label: "Your exam", title: "Tell us about your exam", subtitle: "We need these details to build your customized practice schedule and track your targets." },
		{ id: 3, label: "Quiz habits", title: "How do you practice?", subtitle: "Let's figure out the best routine to match your schedule." },
		{ id: 4, label: "About you", title: "One last thing...", subtitle: "Finalize your preferences to help us customize your quiz experience." },
	];

	const STATES = [
		"Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
		"Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
		"Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
		"Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
		"Taraba", "Yobe", "Zamfara",
	];

	const PREP_HOURS_OPTS = ["Morning", "Afternoon", "Evening", "Night"];

	const STUDENT_HARD_SUBJECTS = [
		"Maths", "English", "Physics", "Chemistry", "Biology", "Economics",
		"Government", "Literature", "Geography", "CRS/IRS", "Commerce", "Accounting",
	];

	const PROF_HARD_TOPICS = [
		"Financial Reporting", "Audit & Assurance", "Taxation", "Management Accounting",
		"Business Law", "Ethics", "Finance", "Corporate Strategy",
	];

	const TUTOR_OPTS = [
		"Yes (private tutor)",
		"Yes (extra classes)",
		"No (self-prepping)",
		"No (planning to)",
	];

	const STUDENT_CHALLENGES = [
		"Staying consistent",
		"Understanding concepts",
		"Time management",
		"Exam anxiety",
		"Lack of resources",
		"Distractions at home",
	];

	const PROF_CHALLENGES = [
		"Work-life balance",
		"Staying consistent",
		"Technical concepts",
		"Time management",
		"Exam anxiety",
		"Finding quality materials",
	];

	const REMINDER_OPTS = [
		"Push notifications",
		"Email reminders",
		"WhatsApp",
		"No reminders",
	];

	const EMP_STATUS_OPTS = [
		"Fully employed",
		"Part-time / contract",
		"Self-employed",
		"Unemployed / full-time prep",
		"Student",
	];

	const PROF_REASONS = [
		"Career growth",
		"Promotion",
		"School admission",
		"Relocation (e.g. IELTS)",
		"Other",
	];

	const studentTargetConfig: Record<string, any> = {
		jamb: {
			min: 100,
			max: 400,
			step: 1,
			def: 280,
			hint: "JAMB scores range from 100–400. Universities usually require 200+.",
			label: "What score are you targeting?",
		},
		waec: {
			min: 1,
			max: 9,
			step: 1,
			def: 6,
			hint: "Credits (A1–C6). Target at least 5 including English & Maths.",
			label: "How many credits are you targeting?",
		},
		neco: {
			min: 1,
			max: 9,
			step: 1,
			def: 6,
			hint: "Credits (A1–C6). Target at least 5 for university admission.",
			label: "How many credits are you targeting?",
		},
		post_utme: {
			min: 1,
			max: 100,
			step: 1,
			def: 70,
			hint: "Post-UTME cut-offs vary — typically 50-70%.",
			label: "What score are you targeting (%)?",
		},
		common_entrance: {
			min: 50,
			max: 100,
			step: 1,
			def: 75,
			hint: "Common Entrance — top schools require 75%+.",
			label: "What score are you targeting?",
		},
		nabteb: {
			min: 1,
			max: 9,
			step: 1,
			def: 5,
			hint: "NABTEB credits. Target at least 4-5.",
			label: "How many credits are you targeting?",
		},
	};

	const profTargetConfig: Record<string, any> = {
		ican: {
			min: 1,
			max: 6,
			step: 1,
			def: 2,
			hint: "Papers you're taking this diet.",
			label: "How many papers are you taking?",
			noLevel: false,
		},
		ican_atswa: {
			min: 1,
			max: 3,
			step: 1,
			def: 3,
			hint: "Papers you're taking this diet.",
			label: "How many papers are you taking?",
			noLevel: false,
		},
		citn: {
			min: 1,
			max: 6,
			step: 1,
			def: 2,
			hint: "Papers you're taking this diet.",
			label: "How many papers are you taking?",
			noLevel: false,
		},
		law_school: {
			min: 1,
			max: 5,
			step: 1,
			def: 3,
			hint: "Nigerian Law School Bar Final papers.",
			label: "How many papers are you taking?",
			noLevel: false,
		},
		trcn: {
			min: 40,
			max: 100,
			step: 1,
			def: 60,
			hint: "TRCN requires 50% to pass.",
			label: "What score are you targeting (%)?",
			noLevel: true,
		},
		ielts: {
			min: 4,
			max: 9,
			step: 0.5,
			def: 7,
			hint: "IELTS band scores 1–9. Professional bodies require 6.0+.",
			label: "What band score are you targeting?",
			noLevel: true,
		},
		nimasa: {
			min: 40,
			max: 100,
			step: 1,
			def: 60,
			hint: "NIMASA target percentage.",
			label: "What score are you targeting (%)?",
			noLevel: true,
		},
		other: {
			min: 1,
			max: 100,
			step: 1,
			def: 60,
			hint: "What score are you targeting?",
			label: "What score are you targeting?",
			noLevel: true,
		},
	};

	return {
		steps,
		STUDENT_EXAMS,
		PROFESSIONAL_EXAMS,
		EXAM_LEVELS,
		STATES,
		PREP_HOURS_OPTS,
		STUDENT_HARD_SUBJECTS,
		PROF_HARD_TOPICS,
		TUTOR_OPTS,
		STUDENT_CHALLENGES,
		PROF_CHALLENGES,
		REMINDER_OPTS,
		EMP_STATUS_OPTS,
		PROF_REASONS,
		studentTargetConfig,
		profTargetConfig
	};
}) satisfies PageServerLoad;
