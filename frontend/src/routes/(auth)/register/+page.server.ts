import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { redirect, fail } from '@sveltejs/kit';
import { registerSchema } from '$lib/schemas';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getUser() ?? null;

	// If the user is already signed in and has completed onboarding, send to dashboard
	if (user && (user as any).targetExam) {
		throw redirect(302, '/dashboard');
	}

	// If the user is signed in (e.g. Google) but hasn't onboarded, send to onboarding
	if (user && !(user as any).targetExam) {
		throw redirect(302, '/onboarding');
	}

	const form = await superValidate(valibot(registerSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, valibot(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { firstName, lastName, email, password } = form.data;

		const signUpRes = await fetch('/api/auth/sign-up/email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: `${firstName} ${lastName}`,
				email,
				password,
				// callbackURL tells Better Auth where to redirect after email verification (future use)
				callbackURL: '/dashboard',
			})
		});

		if (!signUpRes.ok) {
			const error = await signUpRes.json().catch(() => ({}));
			const errMsg = (error.message as string) || '';

			// Detect duplicate email — Better Auth returns "User already exists"
			if (
				errMsg.toLowerCase().includes('already exists') ||
				errMsg.toLowerCase().includes('already registered') ||
				errMsg.toLowerCase().includes('email already in use') ||
				signUpRes.status === 409
			) {
				return message(
					form,
					'An account with this email already exists. Please log in instead.',
					{ status: 409 }
				);
			}

			return message(form, errMsg || 'Registration failed. Please try again.', { status: 400 });
		}

		// Successfully registered — redirect to onboarding
		throw redirect(302, '/onboarding');
	}
};
