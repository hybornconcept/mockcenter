// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: Record<string, unknown> | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	type QuestionStatus =
		| "not-visited"
		| "not-answered"
		| "answered"
		| "marked"
		| "marked-answered";

	interface Question {
		id: number;
		section: string;
		text: string;
		options: string[];
		selectedOption: number | null;
		status: QuestionStatus;
		isBookmarked: boolean;
	}

	interface Section {
		name: string;
		range: [number, number]; // start (inclusive), end (inclusive)
	}
}

export {};
