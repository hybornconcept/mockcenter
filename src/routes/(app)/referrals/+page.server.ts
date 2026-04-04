import type { PageServerLoad } from './$types';

export const load = (async () => {
    const stats = [
        {
            label: "Total referrals sent",
            value: "7",
            iconName: "Users",
            subtitle: "Links clicked by friends",
            badge: "Active sharing",
            badgeClass: "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
            label: "Successful sign-ups",
            value: "5",
            iconName: "CheckCircle2",
            subtitle: "2 still pending sign-up",
            badge: "71% conv.",
            badgeClass: "text-green-700 bg-green-50 border-green-200",
        },
        {
            label: "Credits bought by refs",
            value: "3",
            iconName: "CreditCard",
            subtitle: "3 of 5 bought credits",
            badge: "60% Rate",
            badgeClass: "text-[#38761d] bg-[#38761d]/10 border-[#38761d]/20",
        },
        {
            label: "Total credits earned",
            value: "150",
            iconName: "Trophy",
            subtitle: "Worth ~75 free questions",
            badge: "Keep going!",
            badgeClass: "text-[#38761d] bg-[#38761d]/10 border-[#38761d]/20",
        },
    ];

    const history = [
        {
            initials: "AM",
            name: "Amara M.",
            email: "amara@gmail.com",
            joined: "Mar 20, 2026",
            status: "Bought credits",
            earned: "+50 credits",
            action: "Remind",
            bg: "bg-green-100",
            text: "text-green-700",
            statusBg: "bg-blue-50",
            statusText: "text-blue-600",
        },
        {
            initials: "TK",
            name: "Tunde K.",
            email: "tundek@yahoo.com",
            joined: "Mar 18, 2026",
            status: "Bought credits",
            earned: "+50 credits",
            action: "Remind",
            bg: "bg-blue-100",
            text: "text-blue-700",
            statusBg: "bg-blue-50",
            statusText: "text-blue-600",
        },
        {
            initials: "OB",
            name: "Obiora B.",
            email: "obiora@gmail.com",
            joined: "Mar 15, 2026",
            status: "Bought credits",
            earned: "+50 credits",
            action: "Remind",
            bg: "bg-amber-100",
            text: "text-amber-700",
            statusBg: "bg-blue-50",
            statusText: "text-blue-600",
        },
        {
            initials: "CN",
            name: "Chinonso N.",
            email: "chinonso@gmail.com",
            joined: "Mar 12, 2026",
            status: "Signed up",
            earned: "None yet",
            action: "Remind",
            bg: "bg-purple-100",
            text: "text-purple-700",
            statusBg: "bg-emerald-50",
            statusText: "text-emerald-700",
        },
        {
            initials: "EO",
            name: "Emeka O.",
            email: "emeka@gmail.com",
            joined: "Mar 10, 2026",
            status: "Failed",
            earned: "None",
            action: "None",
            bg: "bg-red-100",
            text: "text-red-700",
            statusBg: "bg-red-50",
            statusText: "text-red-600",
        },
    ];

    const summaryStats = [
        { value: "3", label: "Paid referrals" },
        { value: "50", label: "Credits each" },
        { value: "2", label: "Pending friends" },
        { value: "+100", label: "Potential credits" }
    ];

    const leaderboard = [
        { rank: 1, initials: "AO", name: "Adeola O.", refs: "22 refs", credits: "1,100 cr", isUser: false, category: "orange" },
        { rank: 2, initials: "BU", name: "Blessing U.", refs: "18 refs", credits: "900 cr", isUser: false, category: "blue" },
        { rank: 3, initials: "KA", name: "Kemi A.", refs: "14 refs", credits: "700 cr", isUser: false, category: "purple" },
        { rank: 4, initials: "FI", name: "Femi I.", refs: "9 refs", credits: "450 cr", isUser: false, category: "green" },
        { rank: 12, initials: "CE", name: "You", refs: "3 refs", credits: "150 cr", isUser: true, category: "brand" }
    ];

    const referralSteps = [
        {
            number: 1,
            title: "Share your link",
            description: "Copy your unique referral link and send it to friends on WhatsApp, Twitter, or any platform.",
            bg: "bg-[#1359a0]"
        },
        {
            number: 2,
            title: "Friend signs up",
            description: "Your friend clicks the link, creates a PrepMaster account. They get 20 free credits.",
            subtext: "Friend gets 20 credits",
            bg: "bg-[#1359a0]"
        },
        {
            number: 3,
            title: "Friend buys credits",
            description: "When your friend makes their first credit purchase on PrepMaster.",
            bg: "bg-[#1359a0]"
        },
        {
            number: 4,
            title: "You earn credits",
            description: "50 credits are added to your balance instantly. No limits!",
            subtext: "You earn 50 credits",
            bg: "bg-emerald-500",
            shadow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        }
    ];

    return {
        stats,
        history,
        summaryStats,
        leaderboard,
        referralSteps,
        referralLink: "https://mockcenter.com/ref/CHUKZ47",
        code: "CHUKZ47"
    };
}) satisfies PageServerLoad;