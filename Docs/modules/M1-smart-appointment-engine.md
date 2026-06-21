# M1 — Smart Appointment Engine

> **Priority:** 🔴 Critical · **Phase:** 1 (Months 1–3)
> **Dependencies:** M2 (Patient CRM), M6 (Billing — check-in), M3 (WhatsApp — reminders)

---

## 1. Overview

The Smart Appointment Engine replaces all WhatsApp CTAs on maissaudecv.com with a structured, real-time booking experience. It manages the full lifecycle of every appointment from creation through completion or no-show.

---

## 2. Core Features

### 2.1 Embeddable Booking Widget
- Standalone React component embeddable on maissaudecv.com via `<script>` tag or iframe
- Service selector: Consulta (by specialty) → Exame → Dentária → Ultrassom → Visita Domiciliária
- Doctor/provider selector with photo, specialty, and next available slot
- Date and time slot picker — fetches live availability from `GET /appointments/availability`
- Patient identification: returning (phone lookup) or new (mini-registration form)
- Optional deposit payment for high-demand slots (Phase 4 — Vinti4)
- Mobile-first design; loads < 2 seconds on 4G

### 2.2 Multi-View Calendar
- Built with **FullCalendar** (React wrapper)
- Views: Day, Week, Month, Resource (by doctor/room)
- Colour-coded by service category:
  - 🔵 Cardiology · 🟢 Paediatrics · 🟣 Gynaecology · 🟡 Ophthalmology
  - 🟠 Dental · 🔴 Exam · ⚪ Ultrasound · 🟤 Home Visit
- Drag-and-drop rescheduling (triggers patient notification)
- Click-to-view appointment detail sidebar
- Real-time updates via Socket.io (new bookings appear without refresh)

### 2.3 Slot Availability Logic
```
Available slots = Staff working hours
                - Existing confirmed appointments
                - Leave periods
                - Buffer time between appointments
                - Room availability (if room required)
```
Slots are locked in Redis for 5 minutes during active booking to prevent double-booking.

### 2.4 Automated Reminder Sequence

| Reminder | Channel | Timing | Action CTA |
|---|---|---|---|
| Confirmation | WhatsApp + Email | Immediately after booking | — |
| Reminder 1 | WhatsApp | 48h before | Confirm / Cancel |
| Reminder 2 | WhatsApp | 24h before | Confirm / Cancel |
| Reminder 3 | WhatsApp + SMS | 2h before | — |

- Reminder jobs enqueued in **BullMQ** on appointment creation
- Jobs cancelled if appointment is cancelled or rescheduled
- No-show flag auto-set 30 minutes after scheduled start if status remains `scheduled`

### 2.5 Waitlist
- Patient joins waitlist for a specific service/doctor/date
- When a matching slot opens (cancellation), earliest waitlisted patient receives WhatsApp notification
- 15-minute response window; if no response, next patient notified

---

## 3. Data Model (key tables)

See `DATABASE-SCHEMA.md` → sections 2.1–2.4:
- `appointments`
- `appointment_reminders`
- `waitlist`
- `rooms`

---

## 4. API Endpoints

See `API-SPEC.md` → Section 3 (Appointments)

Key routes:
- `GET /appointments/availability` — public, used by booking widget
- `POST /appointments` — create booking
- `PATCH /appointments/:id` — update status / reschedule
- `GET /appointments` — calendar data

---

## 5. Business Rules

- A patient cannot have two appointments at the same time
- Same doctor cannot be double-booked (enforced by DB unique index)
- Cancellations less than 2 hours before appointment are flagged for admin review
- Recurring appointments (health plan members) auto-create next occurrence on completion
- Walk-ins can be added directly from the calendar without going through the widget

---

## 6. UI Screens

| Screen | Role | Description |
|---|---|---|
| Booking Widget | Patient (public) | Multi-step booking form on website |
| Calendar — Day View | Receptionist | Today's appointments with check-in buttons |
| Calendar — Week View | Admin/Receptionist | Clinic-wide weekly overview |
| My Schedule | Doctor | Own upcoming appointments only |
| Appointment Detail | All | Patient info, service, notes, status actions |
| Waitlist Manager | Receptionist/Admin | Active waitlist entries with notify button |

---

## 7. Notifications Summary

| Event | WhatsApp | SMS | Email |
|---|---|---|---|
| Booking confirmed | ✅ | — | ✅ |
| Reminder 48h | ✅ | — | — |
| Reminder 24h | ✅ | — | ✅ |
| Reminder 2h | ✅ | ✅ | — |
| Rescheduled | ✅ | — | ✅ |
| Cancelled | ✅ | — | — |
| No-show follow-up | ✅ | — | — |
| Slot available (waitlist) | ✅ | — | — |

---

*Module M1 · v1.0 · June 2026*
