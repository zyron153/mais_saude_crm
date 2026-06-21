# M4 — Health Plan Management

> **Priority:** 🟠 High · **Phase:** 2 (Months 3–5)
> **Dependencies:** M2 (Patient CRM), M6 (Billing), M1 (Appointments)

---

## 1. Overview

Manages the clinic's two plan types — **Plano Familiar** (Family) and **Plano Empresarial** (Corporate) — with full lifecycle support: creation, member management, utilisation tracking, renewals, and a self-service portal for corporate HR.

---

## 2. Plan Types

### 2.1 Plano Familiar
- Single patient or family unit on one plan
- Coverage: defined number of consultations and exams per year/quarter
- Monthly or annual billing
- Auto-renews 7 days before expiry (with patient WhatsApp notification at 30/15/7 days)

### 2.2 Plano Empresarial
- Linked to a `companies` record
- HR admin can add/remove employees
- Usage reports available per employee (anonymised for HR, detailed for admin)
- Invoiced to the company monthly; individual employees do not pay at point of care

---

## 3. Core Features

### 3.1 Plan Administration

- Plan product catalogue: define coverage tiers, pricing, included services
- Subscribe a patient or company to a plan via admin UI
- Set start/end dates, monthly fee, auto-renew flag
- Suspend or cancel a plan with reason and effective date

### 3.2 Member Management

- Add individual patients to a corporate plan by phone or NIF lookup
- Remove members (soft-delete retains history)
- Member list exportable as CSV

### 3.3 Utilisation Tracking

Each appointment or exam linked to a health plan automatically decrements the usage counter:
- `consultations_used` / `consultations_included`
- `exams_used` / `exams_included`

When a patient tries to book a service covered by their plan, the booking widget:
1. Shows "Incluído no seu plano" label
2. Applies plan pricing (often zero co-pay)
3. Decrements counter; alerts if plan limit reached

### 3.4 Renewal Reminders

Automated BullMQ jobs query plans expiring in 30, 15, and 7 days and send `health_plan_expiring` WhatsApp template.

Corporate plans send renewal reminders to the HR contact email.

### 3.5 Upsell Alerts

When a patient who has a plan repeatedly books services outside their plan's coverage, the system flags this in the patient CRM for the receptionist to offer a plan upgrade.

---

## 4. Member Self-Service Portal (Phase 4)

- Patient logs in to view plan details, utilisation, and included services
- Book plan-included appointments directly from the portal
- Download invoices and receipts

---

## 5. Corporate HR Portal (Phase 4)

- HR admin logs in with `corporate_hr` role
- See active member list, total utilisation, aggregate usage reports
- Add/remove employees
- Download monthly usage report for accounting

---

## 6. Data Model

See `DATABASE-SCHEMA.md` → Section 5:
- `health_plan_products`
- `health_plans`
- `companies`
- `corporate_plan_members`

---

## 7. API Endpoints

See `API-SPEC.md` → Section 5 (Health Plans)

---

## 8. Business Rules

- A patient can hold only one active plan at a time
- Plan utilisation resets at the start of each plan period (not calendar year)
- Services booked outside plan coverage are billed at standard rates
- Corporate plan members cannot see other members' clinical data
- Admin can manually adjust utilisation counters with an audit log entry

---

*Module M4 · v1.0 · June 2026*
