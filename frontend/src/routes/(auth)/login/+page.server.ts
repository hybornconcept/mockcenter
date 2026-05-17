import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(valibot(loginSchema));
	return { form, user: await locals.getUser() };
};

export const actions: Actions = {
	default: async ({ request, fetch, url }) => {
		const form = await superValidate(request, valibot(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const loginRes = await fetch('/api/auth/sign-in/email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form.data)
		});

		if (!loginRes.ok) {
			const error = await loginRes.json();
			return message(form, error.message || 'Login failed', { status: 400 });
		}

		const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

		// Success — session cookie is set; hooks.server.ts will route
		// the user correctly on the next request (verify → onboard → dashboard)
		throw redirect(302, redirectTo);
	}
};
