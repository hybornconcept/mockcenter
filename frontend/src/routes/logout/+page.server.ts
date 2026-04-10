import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	// Call backend to invalidate session
	await fetch('/api/auth/sign-out', { method: 'POST' });
	
	// Clear the session cookies explicitly
	cookies.delete('better-auth.session_token', { path: '/' });
	cookies.delete('better-auth.session-token', { path: '/' }); // Support both if naming varies
	
	// Redirect to login
	throw redirect(302, '/login');
};

