import { object, string, email, minLength, pipe, optional, boolean, number, picklist, forward, check } from "valibot";

export const loginSchema = object({
    email: pipe(string(), email("Please enter a valid email address")),
    password: pipe(string(), minLength(8, "Password must be at least 8 characters"))
});

export const registerSchema = pipe(
    object({
        firstName: pipe(string(), minLength(2, "First name is too short")),
        lastName: pipe(string(), minLength(2, "Last name is too short")),
        email: pipe(string(), email("Please enter a valid email address")),
        password: pipe(string(), minLength(8, "Password must be at least 8 characters")),
        confirmPassword: string(),
        referralCode: optional(string())
    }),
    forward(
        check(
            (input) => input.password === input.confirmPassword,
            "Passwords do not match"
        ),
        ["confirmPassword"]
    )
);

export const onboardingSchema = object({
    userType: picklist(["student", "professional"], "Please select a user type"),
    phoneNumber: pipe(string(), minLength(10, "Please enter a valid phone number")),
    targetExam: pipe(string(), minLength(1, "Please select an exam")),
    examLevel: optional(string()),
    targetScore: number("Please enter a valid score"),
    examDate: pipe(string(), minLength(1, "Please select an exam date")),
    state: pipe(string(), minLength(1, "Please select a state"))
});

export const combinedSchema = pipe(
    object({
        // Registration fields
        firstName: pipe(string(), minLength(2, "First name is too short")),
        lastName: pipe(string(), minLength(2, "Last name is too short")),
        email: pipe(string(), email("Please enter a valid email address")),
        password: pipe(string(), minLength(8, "Password must be at least 8 characters")),
        confirmPassword: string(),
        referralCode: optional(string()),
        // Onboarding fields
        userType: picklist(["student", "professional"], "Please select a user type"),
        phoneNumber: pipe(string(), minLength(10, "Please enter a valid phone number")),
        targetExam: pipe(string(), minLength(1, "Please select an exam")),
        examLevel: optional(string()),
        targetScore: number("Please enter a valid score"),
        examDate: pipe(string(), minLength(1, "Please select an exam date")),
        state: pipe(string(), minLength(1, "Please select a state"))
    }),
    forward(
        check(
            (input) => input.password === input.confirmPassword,
            "Passwords do not match"
        ),
        ["confirmPassword"]
    )
);

export type LoginSchema = typeof loginSchema;
export type RegisterSchema = typeof registerSchema;
export type OnboardingSchema = typeof onboardingSchema;
export type CombinedSchema = typeof combinedSchema;


