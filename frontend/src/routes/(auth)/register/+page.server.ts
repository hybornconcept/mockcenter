import { superValidate, fail, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import { registerSchema, onboardingSchema, combinedSchema } from '$lib/schemas';
import type { PageServerLoad, Actions } from './$types';


export const load: PageServerLoad = async ({ locals }) => {
	const NIGERIAN_STATES = [
		"Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
		"Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
		"Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
		"Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
		"Taraba", "Yobe", "Zamfara"
	];

	const STUDENT_EXAMS = [
		{ value: "jamb", label: "JAMB/UTME" },
		{ value: "waec", label: "WAEC/SSCE" },
		{ value: "neco", label: "NECO" },
		{ value: "post_utme", label: "Post-UTME" },
		{ value: "common_entrance", label: "Common Entrance" },
		{ value: "nabteb", label: "NABTEB" }
	];

	const PROFESSIONAL_EXAMS = [
		{ value: "ican", label: "ICAN" },
		{ value: "ican_atswa", label: "ICAN ATSWA" },
		{ value: "citn", label: "CITN" },
		{ value: "law_school", label: "Law School" },
		{ value: "trcn", label: "TRCN" },
		{ value: "ielts", label: "IELTS" },
		{ value: "nimasa", label: "NIMASA" },
		{ value: "other", label: "Other" }
	];

	const EXAM_LEVELS = [
		{ value: "foundation", label: "Foundation" },
		{ value: "skills", label: "Skills" },
		{ value: "professional", label: "Professional" }
	];

	const SCORE_CONFIGS: Record<string, any> = {
		jamb: { label: "What score are you targeting?", min: 100, max: 400, step: 1, placeholder: "e.g. 280" },
		waec: { label: "How many credits are you targeting?", min: 1, max: 9, step: 1, placeholder: "e.g. 6" },
		neco: { label: "How many credits are you targeting?", min: 1, max: 9, step: 1, placeholder: "e.g. 6" },
		nabteb: { label: "How many credits are you targeting?", min: 1, max: 9, step: 1, placeholder: "e.g. 5" },
		post_utme: { label: "What score are you targeting?", min: 1, max: 100, step: 1, placeholder: "e.g. 70" },
		common_entrance: { label: "What score are you targeting?", min: 50, max: 100, step: 1, placeholder: "e.g. 75" },
		ican: { label: "How many papers are you sitting?", min: 1, max: 6, step: 1, placeholder: "e.g. 2" },
		ican_atswa: { label: "How many papers are you sitting?", min: 1, max: 3, step: 1, placeholder: "e.g. 3" },
		citn: { label: "How many papers are you sitting?", min: 1, max: 6, step: 1, placeholder: "e.g. 2" },
		law_school: { label: "How many papers are you sitting?", min: 1, max: 5, step: 1, placeholder: "e.g. 3" },
		trcn: { label: "What score are you targeting?", min: 40, max: 100, step: 1, placeholder: "e.g. 60" },
		ielts: { label: "What band score are you targeting?", min: 4, max: 9, step: 0.5, placeholder: "e.g. 7.0" },
		nimasa: { label: "What score are you targeting?", min: 40, max: 100, step: 1, placeholder: "e.g. 60" },
		other: { label: "What score are you targeting?", min: 1, max: 100, step: 1, placeholder: "e.g. 50" }
	};

	// Read user from locals (set once by hooks.server.ts — no extra fetch needed)
	const user = locals.user ?? null;

	const [registerForm, onboardingForm, combinedForm] = await Promise.all([
		superValidate(valibot(registerSchema)),
		superValidate(valibot(onboardingSchema), {
			defaults: {
				userType: "" as any,
				phoneNumber: "",
				targetExam: "",
				examLevel: "",
				targetScore: "" as any,
				examDate: "",
				state: ""
			}
		}),
		superValidate(valibot(combinedSchema), {
			defaults: {
				userType: "" as any,
				phoneNumber: "",
				targetExam: "",
				examLevel: "",
				targetScore: "" as any,
				examDate: "",
				state: "",
				firstName: "",
				lastName: "",
				email: "",
				password: "",
				confirmPassword: "",
				referralCode: ""
			}
		}),
	]);

	return {
		user,
		registerForm,
		onboardingForm,
		combinedForm,
		NIGERIAN_STATES,
		STUDENT_EXAMS,
		PROFESSIONAL_EXAMS,
		EXAM_LEVELS,
		SCORE_CONFIGS
	};
};

export const actions: Actions = {
	default: async ({ request, fetch, locals, cookies, url }) => {
		const user = locals.user ?? null;

		// Base frontend URL for callback redirects
		const appOrigin = url.origin;

		// Determine which schema to use
		const schema = user ? onboardingSchema : combinedSchema;
		const form = await superValidate(request, valibot(schema as any));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { firstName, lastName, email, password, referralCode, phoneNumber, ...onboardingData } = form.data as any;

		// Save onboarding data (state must match backend enum, e.g. "FCT" not "FCT (Abuja)")
		const normalizedState = onboardingData.state === 'FCT (Abuja)' ? 'FCT' : onboardingData.state;
		
		const fullOnboardingPayload = {
			...onboardingData,
			state: normalizedState,
			phone: phoneNumber,
			examDate: onboardingData.examDate ? new Date(onboardingData.examDate) : null
		};

		if (!user) {
			// User does not exist, so we are signing up AND onboarding them
			const signUpRes = await fetch('/api/auth/sign-up/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					name: `${firstName} ${lastName}`, 
					email, 
					password, 
					referralCode,
					// callbackURL tells Better Auth where to redirect after email verification
					callbackURL: `${appOrigin}/dashboard`,
					...fullOnboardingPayload
				})
			});

			if (!signUpRes.ok) {
				const error = await signUpRes.json().catch(() => ({}));
				return message(form, error.message || 'Signup failed. Please try again.', { status: 400 });
			}

			// Better auth sign-up successful - ordinarily this would go to verify email, but it's disabled.
			// throw redirect(302, `/verify-email?email=${encodeURIComponent(email)}`);
			throw redirect(302, '/dashboard');
		}

		// If user exists (e.g. from Google OAuth), they just need to onboard via a PATCH call
		const onboardingRes = await fetch('/api/users/onboarding', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'cookie': cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ')
			},
			body: JSON.stringify({
                ...onboardingData,
                state: normalizedState,
                // Onboarding patch API still expects phoneNumber mapped to phone in DB, but the API handles the mapping if it accepts phoneNumber
                phoneNumber 
            })
		});

		if (onboardingRes.ok) {
			throw redirect(302, '/dashboard');
		}

		const onboardErr = await onboardingRes.json().catch(() => ({}));
		return message(form, onboardErr.message || 'Onboarding failed. Please try again.', { status: 400 });
	}
};