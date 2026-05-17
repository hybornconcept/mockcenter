import type { PageServerLoad } from './$types';

// Pricing tier bands — these are static business rules, not per-package.
// They define the cost-per-credit at different volume thresholds.
const PRICING_TIERS = [
    { min: 1,      max: 4_999,   rate: 0.010, savings: null },
    { min: 5_000,  max: 9_999,   rate: 0.009, savings: "10%" },
    { min: 10_000, max: 24_999,  rate: 0.008, savings: "20%" },
    { min: 25_000, max: 49_999,  rate: 0.007, savings: "30%" },
    { min: 50_000, max: 99_999,  rate: 0.006, savings: "40%" },
    { min: 100_000, max: 999_999, rate: 0.005, savings: "50%" },
];

// Subscription plans — static business config.
// Once these are stored in credit_packages they can be fetched dynamically.
const SUBSCRIPTION_PLANS = [
    {
        name: "Hustler Monthly",
        credits: 3_000,
        price: 2_000,
        iconName: "Zap",
        perks: [
            "3,000 new credits every billing cycle",
            "Unused credits roll over (up to 6,000)",
            "Cancel anytime from account settings",
        ],
    },
    {
        name: "Champion Monthly",
        credits: 8_000,
        price: 4_500,
        iconName: "Flame",
        perks: [
            "8,000 credits per billing cycle",
            "Rollover up to 16,000 credits",
            "Priority support + Champion badge",
            "Cancel anytime",
        ],
    },
    {
        name: "Legend Monthly",
        credits: 20_000,
        price: 9_000,
        iconName: "Crown",
        perks: [
            "20,000 credits per month",
            "Unlimited rollover",
            "Legend badge + dedicated support",
            "Early access to new features",
        ],
    },
];

export const load: PageServerLoad = async ({ fetch, locals }) => {
    const user = await locals.getUser() as any;

    // Try to fetch live credit packages from the DB
    let packages: any[] = [];
    if (user) {
        try {
            const res = await fetch('/api/users/credit-packages', { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                packages = json.data?.packages ?? [];
            }
        } catch (err) {
            console.error('[buy_credits] credit-packages fetch failed:', err);
        }
    }

    // creditBalance for showing current balance on the page
    const creditBalance = user?.creditBalance ?? 0;

    return {
        tiers: PRICING_TIERS,
        subs: SUBSCRIPTION_PLANS,
        packages,        // live from DB — for pre-built package buttons
        creditBalance,
    };
};