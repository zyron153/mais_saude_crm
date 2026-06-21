# M8 — Staff & Resource Scheduler

> **Priority:** 🟡 Medium · **Phase:** 3 (Months 5–8)
> **Dependencies:** M1 (Appointments — availability engine)

---

## 1. Overview

Manages doctor and staff shifts, room/equipment calendars, and leave requests. Feeds availability data to the appointment booking engine (M1) so patients only see slots when a doctor and room are both free.

---

## 2. Staff Management

### 2.1 Staff Profiles

Each staff member has:
- Name, role, specialty (doctors)
- Email (Keycloak login)
- Phone
- Active/inactive status
- Default weekly availability template

### 2.2 Weekly Availability Templates

Each staff member defines their default working hours per day of week:
- Monday: 08:00–17:00
- Tuesday: 08:00–17:00
- etc.

These form the base availability. Shifts can override the template for specific dates. Leave requests block availability.

### 2.3 Shift Scheduling

Admin creates specific shifts per staff member per date:
- Override the default template (e.g., shorter Saturday shift)
- Add extra shift (e.g., emergency Sunday duty)

The availability engine for slot calculation uses:
```
Available = Shifts (or default template)
          - Confirmed appointments (with buffers)
          - Approved leave
          - Public holidays (configurable calendar)
```

### 2.4 Leave Management

- Staff submit leave requests via the platform
- Admin approves or rejects
- Approved leave automatically blocks all appointment slots in that period
- Appointments already booked during leave are flagged for manual rescheduling

Leave types: Annual / Sick / Personal / Unpaid

---

## 3. Room & Equipment Calendar

### 3.1 Rooms

Each consulting room / procedure room is a resource that can be assigned to appointments:
- Name (e.g., "Sala de Cardiologia", "Sala de Ecografia")
- Equipment list (tags)
- Active/inactive

### 3.2 Equipment

Equipment with limited units (e.g., one Holter device) is tracked:
- When an exam requiring specific equipment is booked, the equipment is reserved
- Conflict alert if equipment already reserved for that time

### 3.3 Conflict Detection

The system alerts if:
- A doctor is booked while on approved leave
- A room is double-booked
- Required equipment is not available
- A staff member has overlapping appointments

---

## 4. Data Model

See `DATABASE-SCHEMA.md` → Section 9:
- `staff`
- `staff_shifts`
- `staff_availability`
- `leave_requests`
- `rooms`

---

## 5. API Endpoints

See `API-SPEC.md` → Section 9 (Staff & Shifts)

---

## 6. UI Screens

| Screen | Role | Description |
|---|---|---|
| Staff List | Admin | All staff with role, status, next shift |
| Shift Planner | Admin | Week-view grid for all staff; drag to assign shifts |
| My Schedule | Doctor / Nurse | Personal week view with appointments and shifts |
| Leave Requests | Admin | Pending requests with approve/reject |
| Room Calendar | Admin / Receptionist | Resource view of room bookings |
| Conflict Alert | Admin | List of detected scheduling conflicts |

---

## 7. Business Rules

- A doctor must have at least one shift or default availability to appear in the booking widget
- Leave requests require 48h notice (configurable); emergency leave is admin-granted immediately
- Room assignment is optional for standard consultations; mandatory for procedures requiring specific rooms
- Public holidays list is admin-configurable and blocks availability clinic-wide

---

*Module M8 · v1.0 · June 2026*
