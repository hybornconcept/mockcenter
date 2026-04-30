# ExamNow — Onboarding Page Plan

> This document describes what the `/onboarding` page should look like and how it should behave.
> The onboarding page is **separate from the registration page**.
> It has **no email, password, or phone fields** — those are already collected on `/register`.

---

## What This Page Does

After a user creates their account on `/register` and logs into their `/dashboard`, a modal or dialog box from the `confirmation.svelte` component automatically pops up whenever the user clicks on anything on the dashboard. This modal interrupts the action and prompts the user to complete their onboarding before they can proceed.

The modal directs the user to `/onboarding` where they fill in their profile. Until onboarding is complete, the modal will keep appearing on every click — the user cannot use the dashboard freely until the form is submitted.

The answers collected here are used to personalise their exam prep plan, practice questions, and AI coaching.

The page is split into two paths depending on whether the user is a **Student** or a **Professional**. The user picks their type first, then answers questions relevant to their path.

---

## Page Structure

### Step 0 — Who Are You?

The user sees two large clickable cards:

- **I'm a Student** — for people preparing for JAMB, WAEC, NECO, Post-UTME, Common Entrance, or NABTEB
- **I'm a Professional** — for people preparing for ICAN, CITN, Law School, IELTS, TRCN, NIMASA, ICAN ATSWA, or Other

Clicking a card reveals the questions for that path below. The user can change their selection at any time before submitting.

---

## Student Path — 11 Questions

> Show these questions when the user selects "I'm a Student"

| # | Question | Input Type | Notes |
|---|---|---|---|
| 1 | Which exam are you preparing for? | Dropdown | JAMB/UTME, WAEC/SSCE, NECO, Post-UTME, Common Entrance, NABTEB |
| 2 | What is your target score / number of credits? | Number | Label and range change based on exam selected in Q1 |
| 3 | When is your exam? | Date picker | Must be a future date |
| 4 | What is your current location? | Dropdown | All 36 Nigerian states + FCT |
| 5 | What school do you attend? | Text input | Free text |
| 6 | What hours can you dedicate to exam prep? | Multi-select checkboxes | Morning, Afternoon, Evening, Night — pick all that apply |
| 7 | How many days per week are you available for exam prep? | Number | Between 1 and 7 |
| 8 | Which subjects do you find hardest? | Multi-select chips | Maths, English, Physics, Chemistry, Biology, Economics, Government, Literature, Geography, CRS/IRS, Commerce, Accounting — pick up to 5 |
| 9 | Do you currently have a tutor or attend extra classes? | Single-select pills | Yes (private tutor), Yes (extra classes), No (self-prepping), No (planning to) |
| 10 | What is your biggest challenge with exam prep? | Single-select pills | Staying consistent, Understanding concepts, Time management, Exam anxiety, Lack of resources, Distractions at home |
| 11 | How should we remind you about your exam prep? | Single-select pills | Push notifications, Email reminders, WhatsApp, No reminders |

### How Q2 changes based on exam (Student)

| Exam | Question label | Min | Max |
|---|---|---|---|
| JAMB / UTME | "What score are you targeting?" | 100 | 400 |
| WAEC / SSCE | "How many credits are you targeting?" | 1 | 9 |
| NECO | "How many credits are you targeting?" | 1 | 9 |
| NABTEB | "How many credits are you targeting?" | 1 | 9 |
| Post-UTME | "What score are you targeting?" | 1 | 100 |
| Common Entrance | "What score are you targeting?" | 50 | 100 |

---

## Professional Path — 13 Questions

> Show these questions when the user selects "I'm a Professional"

| # | Question | Input Type | Notes |
|---|---|---|---|
| 1 | Which professional exam are you sitting? | Dropdown | ICAN, ICAN ATSWA, CITN, Law School, TRCN, IELTS, NIMASA, Other |
| 2 | What level are you sitting? | Dropdown | Foundation, Skills, Professional — **hide this question for IELTS and Other**, auto-set to "not applicable" |
| 3 | What is your target score / number of papers? | Number | Label and range change based on exam selected in Q1 |
| 4 | When is your exam sitting? | Date picker | Must be a future date |
| 5 | What is your current location? | Dropdown | All 36 Nigerian states + FCT |
| 6 | What is your current employment status? | Single-select pills | Fully employed, Part-time / contract, Self-employed, Unemployed / full-time prep, Student |
| 7 | How many times have you previously sat this exam? | Number | 0 = first time, max 20 |
| 8 | How many years of relevant work experience do you have? | Number | Optional, 0–40 |
| 9 | What hours can you dedicate to exam prep? | Multi-select checkboxes | Morning, Afternoon, Evening, Night — pick all that apply |
| 10 | Which topic areas do you find most difficult? | Multi-select chips | Financial Reporting, Audit & Assurance, Taxation, Management Accounting, Business Law, Ethics, Finance, Corporate Strategy — pick up to 5 |
| 11 | What is your biggest challenge with exam prep? | Single-select pills | Work-life balance, Staying consistent, Technical concepts, Time management, Exam anxiety, Finding quality materials |
| 12 | How should we remind you about your exam prep? | Single-select pills | Push notifications, Email reminders, WhatsApp, No reminders |
| 13 | Why are you taking this exam? | Single-select pills | Optional — Career growth, Promotion, School admission, Relocation (e.g. IELTS), Other |

### How Q3 changes based on exam (Professional)

| Exam | Question label | Min | Max | Step |
|---|---|---|---|---|
| ICAN | "How many papers are you sitting this sitting?" | 1 | 6 | 1 |
| ICAN ATSWA | "How many papers are you sitting this sitting?" | 1 | 3 | 1 |
| CITN | "How many papers are you sitting this sitting?" | 1 | 6 | 1 |
| Law School | "How many papers are you sitting this sitting?" | 1 | 5 | 1 |
| TRCN | "What score are you targeting?" | 40 | 100 | 1 |
| IELTS | "What band score are you targeting?" | 4 | 9 | 0.5 |
| NIMASA | "What score are you targeting?" | 40 | 100 | 1 |
| Other | "What score are you targeting?" | 1 | 100 | 1 |

---

## Behaviour Rules

- The submit button is labelled **"Start my exam prep"** and only appears once all required questions are answered.
- Required questions are all questions **except** Q8 (years of experience) and Q13 (why are you taking this exam?) on the professional path.
- If the user has not selected a user type yet, no questions are shown and the submit button is hidden.
- The user can tap "Change" to switch between Student and Professional at any point before submitting.
- Once submitted, the user is redirected to `/verify-email`.

---

## What Is NOT on This Page

- No email field
- No password field
- No phone number field
- No referral code field
- No Google sign-in button

All of the above are handled on the `/register` page.

---

## Nigerian States List

Abia, Adamawa, Akwa Ibom, Anambra, Bauchi, Bayelsa, Benue, Borno, Cross River, Delta, Ebonyi, Edo, Ekiti, Enugu, FCT (Abuja), Gombe, Imo, Jigawa, Kaduna, Kano, Katsina, Kebbi, Kogi, Kwara, Lagos, Nasarawa, Niger, Ogun, Ondo, Osun, Oyo, Plateau, Rivers, Sokoto, Taraba, Yobe, Zamfara
