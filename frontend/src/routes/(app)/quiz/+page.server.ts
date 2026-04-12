import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// If a user navigates to `/quiz` directly without a session ID, bounce them back to start_practice.
	throw redirect(303, '/start_practice');
};
