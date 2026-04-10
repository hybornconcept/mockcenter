import { z } from "zod";

export const onboardingSchema = z.object({
  userType: z.enum(["student", "professional"]),

  phoneNumber: z.string().min(10, "Please enter a valid phone number").optional(),

  targetExam: z.enum([
    "jamb", "waec", "neco", "post_utme", "common_entrance", "nabteb",
    "ican", "ican_atswa", "citn", "law_school", "trcn", "ielts", "nimasa", "other"
  ]),

  examLevel: z.enum([
    "foundation", "skills", "professional", "not_applicable"
  ]).default("not_applicable"),

  // targetScore meaning depends on exam type:
  // JAMB: 100–400 (raw score)
  // WAEC/NECO/NABTEB: 1–9 (number of credits)
  // Post-UTME: 1–100 (percentage)
  // Common Entrance: 50–100 (percentage)
  // ICAN/CITN/Law School/ICAN ATSWA: 1–6 (number of papers)
  // IELTS: 4–9 (band score, stored as x10 integer e.g. 7.5 → stored as 75)
  // TRCN/NIMASA/Other: 1–100 (percentage)
  targetScore: z.number()
    .min(1, "Enter a valid target")
    .max(400, "Value out of range"),

  examDate: z.string()
    .refine((val) => new Date(val) > new Date(), {
      message: "Exam date must be in the future",
    }),

  state: z.enum([
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti",
    "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
    "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
  ]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
