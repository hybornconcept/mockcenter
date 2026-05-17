import { z } from "zod";

export const onboardingSchema = z.object({
  userType: z.enum(["student", "professional"]),

  phoneNumber: z.string().min(10, "Please enter a valid phone number").optional(),

  targetExam: z.enum([
    "jamb", "waec", "neco", "post_utme", "common_entrance", "nabteb",
    "ican", "ican_atswa", "citn", "law_school", "trcn", "ielts", "nimasa", "other",
  ]),

  examLevel: z
    .enum(["foundation", "skills", "professional", "not_applicable"])
    .default("not_applicable"),

  // targetScore meaning depends on exam type:
  //   JAMB: 100–400 | WAEC/NECO/NABTEB: 1–9 | Post-UTME: 1–100
  //   Common Entrance: 50–100 | ICAN/CITN/etc: 1–6 papers
  //   IELTS: 4.0–9.0 (send as number, stored as-is) | TRCN/NIMASA: 1–100
  targetScore: z.number().min(1, "Enter a valid target").max(400, "Value out of range"),

  examDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)) && new Date(val) > new Date(),
    { message: "Exam date must be a valid future date" }
  ),

  state: z.enum([
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti",
    "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara",
  ]),

  avatarUrl: z.string().url("Please provide a valid image URL").optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
