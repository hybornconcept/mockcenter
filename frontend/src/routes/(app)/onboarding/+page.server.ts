import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { onboardingSchema } from '$lib/schemas';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ locals }) => {
    const user = locals.user as any;

    // Guard: must be logged in
    if (!user) {
        throw redirect(302, '/login');
    }

    // Already completed onboarding
    if (user.targetExam) {
        throw redirect(302, '/dashboard');
    }

    const form = await superValidate(valibot(onboardingSchema), {
        defaults: {
            userType: '' as any,
            phoneNumber: '',
            targetExam: '',
            examLevel: '',
            targetScore: '' as any,
            examDate: '',
            state: ''
        }
    });

    return {
        form,
        user,
        STUDENT_EXAMS: [
            { value: "jamb", label: "JAMB / UTME" },
            { value: "waec", label: "WAEC / SSCE" },
            { value: "neco", label: "NECO" },
            { value: "post_utme", label: "Post-UTME" },
            { value: "common_entrance", label: "Common Entrance" },
            { value: "nabteb", label: "NABTEB" },
        ],
        PROFESSIONAL_EXAMS: [
            { value: "ican", label: "ICAN" },
            { value: "ican_atswa", label: "ICAN ATSWA" },
            { value: "citn", label: "CITN" },
            { value: "law_school", label: "Law School" },
            { value: "trcn", label: "TRCN" },
            { value: "ielts", label: "IELTS" },
            { value: "nimasa", label: "NIMASA" },
            { value: "other", label: "Other" },
        ],
        EXAM_LEVELS: [
            { value: "foundation", label: "Foundation" },
            { value: "skills", label: "Skills" },
            { value: "professional", label: "Professional" },
        ],
        NIGERIAN_STATES: [
            "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
            "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
            "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
            "Sokoto", "Taraba", "Yobe", "Zamfara",
        ],
        PREP_HOURS_OPTS: ["Mornings", "Afternoons", "Evenings", "Nights"],
        STUDENT_HARD_SUBJECTS: [
            "Maths", "English", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature", "Geography",
            "CRS/IRS", "Commerce", "Accounting",
        ],
        PROF_HARD_TOPICS: [
            "Financial Reporting", "Audit & Assurance", "Taxation", "Management Accounting", "Business Law", "Ethics",
            "Finance", "Corporate Strategy",
        ],
        TUTOR_OPTS: [
            "Yes (private tutor)", "Yes (extra classes)", "No (self-prepping)", "No (planning to)",
        ],
        STUDENT_CHALLENGES: [
            "Staying consistent", "Understanding concepts", "Time management", "Exam anxiety", "Lack of resources",
            "Distractions at home",
        ],
        PROF_CHALLENGES: [
            "Work-life balance", "Staying consistent", "Technical concepts", "Time management", "Exam anxiety",
            "Finding quality materials",
        ],
        REMINDER_OPTS: [
            "Push notifications", "Email reminders", "WhatsApp", "SMS Reminders", "No reminders",
        ],
        EMP_STATUS_OPTS: [
            "Fully employed", "Part-time / contract", "Self-employed", "Unemployed / full-time prep", "Student",
        ],
        PROF_REASONS: [
            "Career growth", "Promotion", "School admission", "Relocation (e.g. IELTS)", "Other",
        ],
        SCORE_CONFIGS: {
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
        }
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, fetch, cookies }) => {
        const form = await superValidate(request, valibot(onboardingSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        const { phoneNumber, ...onboardingData } = form.data as any;
        const normalizedState = onboardingData.state === 'FCT (Abuja)' ? 'FCT' : onboardingData.state;

        const res = await fetch('/api/users/onboarding', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'cookie': cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ')
            },
            body: JSON.stringify({
                ...onboardingData,
                state: normalizedState,
                phoneNumber,
                examDate: onboardingData.examDate ? new Date(onboardingData.examDate) : null
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return message(form, err.message || 'Onboarding failed. Please try again.', { status: 400 });
        }

        throw redirect(302, '/dashboard');
    }
};