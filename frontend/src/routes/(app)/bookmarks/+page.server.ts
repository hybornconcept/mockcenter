import { BookOpen, Folder, CheckSquare, Hourglass, Tag, PenLine, Sparkles, RotateCcw } from "lucide-svelte";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const stats = [
        { label: "Total bookmarks", value: 47, icon: "Bookmark", color: "text-brand-dark" },
        { label: "Collections", value: 5, icon: "Folder", color: "text-brand-dark" },
        { label: "Practised again", value: 18, icon: "CheckSquare", color: "text-brand-dark" },
        { label: "Still to review", value: 29, icon: "Hourglass", color: "text-brand-dark" }
    ];

    const bookmarkData = [
        {
            id: 1,
            subject: "Chemistry",
            exam: "JAMB",
            year: "2023",
            status: "Needs work",
            question: "Which of the following best explains why noble gases are chemically inert? They have a complete outer electron shell and therefore do not readily form chemical bonds with other elements.",
            note: "Noble gases: full outer shell = no bonding. Remember: He=2e, all others=8e outer shell (octet rule)",
            options: [
                { label: "A", text: "They are very large atoms with many electrons" },
                { label: "B", text: "They have high ionisation energies only", isWrong: true },
                { label: "C", text: "They have a complete outer electron shell", isCorrect: true },
                { label: "D", text: "They exist as monatomic molecules" }
            ],
            aiExplanation: "Noble gases have a full outer electron shell (2 electrons for He, 8 for others), satisfying the octet rule. This makes them extremely stable and unreactive. High ionisation energy (B) is a consequence, not the cause, of their stability.",
            tags: ["Organic Chemistry", "Electron Configuration", "Noble Gases"],
            footerStats: {
                result: "Got wrong last time",
                savedDate: "Mar 22, 2026",
                reviewedCount: 2,
                mastery: "Not mastered"
            }
        },
        {
            id: 2,
            subject: "Biology",
            exam: "WAEC",
            year: "2022",
            status: "Mastered",
            question: "The process by which organisms maintain a stable internal environment despite changes in the external environment is known as homeostasis. Which organ plays the primary role in osmoregulation?",
            footerStats: {
                result: "Got correct last time",
                savedDate: "Mar 20, 2026",
                reviewedCount: 5,
                mastery: "Mastered"
            }
        },
        {
            id: 3,
            subject: "Physics",
            exam: "JAMB",
            year: "2021",
            status: "In progress",
            question: "A body of mass 5kg is moving with a velocity of 10ms⁻¹. What is the kinetic energy of the body? (KE = ½mv²)",
            footerStats: {
                result: "Mixed results",
                savedDate: "Mar 18, 2026",
                reviewedCount: 3,
                mastery: "In progress"
            }
        },
        {
            id: 4,
            subject: "Mathematics",
            exam: "NECO",
            year: "2022",
            status: "Needs work",
            question: "Solve the quadratic equation 2x² - 5x + 3 = 0 and find the values of x using the factorisation method.",
            footerStats: {
                result: "Got wrong last time",
                savedDate: "Mar 15, 2026",
                reviewedCount: 1,
                mastery: "Not mastered"
            }
        },
        {
            id: 5,
            subject: "IELTS Reading",
            exam: "IELTS",
            year: "Academic",
            status: "Mastered",
            question: "In the IELTS Reading passage, the author's primary purpose in paragraph 3 is to illustrate the contradiction between economic growth and environmental sustainability using specific industrial examples.",
            footerStats: {
                result: "Got correct last time",
                savedDate: "Mar 10, 2026",
                reviewedCount: 4,
                mastery: "Mastered"
            }
        }
    ];

    const collections = [
        { name: "All bookmarks", count: 47, icon: "BookOpen", color: "bg-brand-muted/30 text-brand" },
        { name: "Chemistry weak spots", count: 12, icon: "PenLine", color: "bg-teal-100 text-teal-600" },
        { name: "Physics calculations", count: 9, icon: "Sparkles", color: "bg-purple-100 text-purple-600" },
        { name: "Maths — tough ones", count: 8, icon: "RotateCcw", color: "bg-amber-100 text-amber-600" },
        { name: "IELTS prep", count: 3, icon: "text:GB", color: "bg-slate-100 text-slate-600" },
        { name: "Must revise before exam", count: 15, icon: "Sparkles", color: "bg-amber-100 text-amber-600", highlighted: true }
    ];

    const subjectPerformance = [
        { name: "Chemistry", count: 12, percentage: 85, color: "bg-red-500" },
        { name: "Mathematics", count: 10, percentage: 70, color: "bg-amber-500" },
        { name: "Biology", count: 9, percentage: 65, color: "bg-green-600" },
        { name: "Physics", count: 8, percentage: 55, color: "bg-blue-500" },
        { name: "English", count: 6, percentage: 40, color: "bg-indigo-500" },
        { name: "Others", count: 2, percentage: 15, color: "bg-slate-400" }
    ];

    return {
        stats,
        bookmarkData,
        collections,
        subjectPerformance
    };
};