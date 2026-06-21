# Mais Saúde 360 — API Specification

> **Base URL:** `https://api.maissaudecv.com/v1`
> **Auth:** Bearer JWT (Keycloak) — include `Authorization: Bearer <token>` on all protected routes
> **Content-Type:** `application/json`
> **Error format:** `{ "statusCode": 400, "message": "...", "error": "Bad Request" }`

---

## 1. Authentication

### POST `/auth/token`
Exchange Keycloak credentials for a JWT (for mobile/non-browser clients).

```
POST /auth/token
Body: { "username": "string", "password": "string" }
Response 200: { "access_token": "...", "refresh_token": "...", "expires_in": 3600 }
```

### POST `/auth/refresh`
```
Body: { "refresh_token": "string" }
Response 200: { "access_token": "...", "expires_in": 3600 }
```

### POST `/auth/logout`
```
Headers: Authorization: Bearer <token>
Response 204: No Content
```

---

## 2. Patients (M2)

### GET `/patients`
**Roles:** receptionist, admin
**Query params:** `q` (name/phone/NIF search), `planFilter` (`all` | `plan` | `none`, default `all`), `page` (default 1), `limit` (default 20)

> `planFilter` is applied server-side in the Prisma `WHERE` clause so pagination totals are accurate. `plan` = patients with an active health plan; `none` = self-pay patients.

```
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Maria Silva",
      "phone_whatsapp": "+2389001234",
      "date_of_birth": "1985-03-12",
      "tags": ["VIP"],
      "health_plan": { "id": "uuid", "product_name": "Plano Familiar" }
    }
  ],
  "meta": { "total": 120, "page": 1, "limit": 20 }
}
```

### POST `/patients`
**Roles:** receptionist, admin

```
Body:
{
  "full_name": "string (required)",
  "phone_whatsapp": "string (required, unique)",
  "date_of_birth": "YYYY-MM-DD",
  "gender": "male | female | other",
  "nif": "string",
  "email": "string",
  "address": "string",
  "zone": "string",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string"
}
Response 201: { ...patient object }
```

### GET `/patients/:id`
**Roles:** receptionist, doctor, admin (patients see own via `/me`)

```
Response 200: Full patient profile including active health plan and last 5 appointments
```

### PATCH `/patients/:id`
**Roles:** receptionist, admin
```
Body: Partial patient fields
Response 200: Updated patient object
```

### GET `/patients/:id/timeline`
**Roles:** receptionist, doctor, admin

```
Response 200:
{
  "appointments": [...],
  "exam_requests": [...],
  "home_visits": [...],
  "invoices": [...],
  "communication_log": [...]
}
```

### POST `/patients/:id/notes`
**Roles:** receptionist, doctor, nurse, admin
```
Body: { "note": "string", "is_private": false }
Response 201: { ...note object }
```

---

## 3. Appointments (M1)

### GET `/appointments`
**Roles:** receptionist, doctor (own), admin
**Query params:** `staffId`, `from`, `to` (YYYY-MM-DD), `status`, `patientId`, `page`, `limit`

> `from` and `to` are validated by `AppointmentCalendarQuerySchema` (Zod `.refine()`). Invalid calendar dates such as `2026-06-31` return `400 Bad Request` instead of propagating to the database.

```
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "patient": { "id": "uuid", "full_name": "...", "phone_whatsapp": "..." },
      "staff": { "id": "uuid", "full_name": "Dr. João Andrade", "specialty": "Cardiology" },
      "service": { "id": "uuid", "name": "Consulta de Cardiologia", "duration_minutes": 45 },
      "starts_at": "2026-06-15T09:00:00Z",
      "ends_at": "2026-06-15T09:45:00Z",
      "status": "scheduled",
      "booking_source": "web"
    }
  ],
  "meta": { "total": 45, "page": 1, "limit": 20 }
}
```

### POST `/appointments`
**Roles:** patient (own), receptionist, doctor, admin

```
Body:
{
  "patient_id": "uuid (required)",
  "staff_id": "uuid (required)",
  "service_id": "uuid (required)",
  "starts_at": "ISO8601 datetime (required)",
  "room_id": "uuid (optional)",
  "health_plan_id": "uuid (optional)",
  "notes": "string",
  "booking_source": "web | whatsapp_bot | phone | walk_in"
}
Response 201: Appointment object + confirmation sent via WhatsApp/email
Response 409: { "message": "Slot unavailable — conflict detected" }
```

### PATCH `/appointments/:id`
**Roles:** receptionist, admin, doctor (status only)

```
Body: { "status": "confirmed|checked_in|completed|cancelled|no_show", "starts_at": "...", "room_id": "..." }
Response 200: Updated appointment + notification sent if rescheduled/cancelled
```

### GET `/appointments/availability`
**Roles:** Public (used by booking widget)
**Query params:** `staff_id`, `service_id`, `date_from`, `date_to`

```
Response 200:
{
  "available_slots": [
    { "starts_at": "2026-06-15T09:00:00Z", "ends_at": "2026-06-15T09:45:00Z" },
    { "starts_at": "2026-06-15T10:00:00Z", "ends_at": "2026-06-15T10:45:00Z" }
  ]
}
```

### GET `/appointments/:id/reminders`
**Roles:** receptionist, admin
```
Response 200: List of scheduled/sent reminders for this appointment
```

---

## 4. WhatsApp Integration (M3)

### POST `/whatsapp/webhook`
**Auth:** WhatsApp webhook verify token (not JWT)

```
Handles inbound messages from Meta WhatsApp Cloud API.
Returns 200 immediately; processing is async.
```

### GET `/whatsapp/webhook`
**Auth:** Webhook verification (hub.verify_token)
```
Used by Meta for webhook verification during setup.
```

### GET `/whatsapp/conversations`
**Roles:** receptionist, admin
**Query params:** `status` (bot|agent|resolved), `assigned_to`, `page`, `limit`

```
Response 200: Paginated conversation list with last message preview
```

### GET `/whatsapp/conversations/:id/messages`
**Roles:** receptionist, admin

```
Response 200: Full message thread for a conversation
```

### POST `/whatsapp/conversations/:id/assign`
**Roles:** receptionist, admin
```
Body: { "staff_id": "uuid" }
Response 200: Conversation assigned; patient notified via bot
```

### POST `/whatsapp/conversations/:id/messages`
**Roles:** receptionist, admin
```
Body: { "message": "string", "template_name": "string (optional)" }
Response 201: Message sent and logged
```

### POST `/whatsapp/send`
**Roles:** receptionist, admin (internal use; also called by reminder jobs)
```
Body:
{
  "to": "+238xxxxxxxx",
  "type": "template | text",
  "template_name": "appointment_reminder",
  "template_params": ["Maria", "15 Junho", "09:00", "Cardiologia"]
}
Response 202: Accepted
```

---

## 5. Health Plans (M4)

### GET `/health-plans`
**Roles:** receptionist, admin
**Query params:** `status`, `type`, `expiring_before`, `page`, `limit`

```
Response 200: Paginated plan list with member count and utilisation %
```

### POST `/health-plans`
**Roles:** admin
```
Body:
{
  "product_id": "uuid",
  "patient_id": "uuid (for family plans)",
  "company_id": "uuid (for corporate plans)",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "auto_renew": true
}
Response 201: Health plan object
```

### GET `/health-plans/:id`
**Roles:** receptionist, admin, patient (own), corporate_hr (own company)
```
Response 200: Plan details + utilisation stats + member list
```

### POST `/health-plans/:id/members`
**Roles:** admin, corporate_hr
```
Body: { "patient_id": "uuid" }
Response 201: Member added
```

### DELETE `/health-plans/:id/members/:patient_id`
**Roles:** admin, corporate_hr
```
Response 204: Member removed
```

---

## 6. Exams & Results (M5)

### GET `/exam-requests`
**Roles:** receptionist, doctor (own requests), nurse, lab_tech, admin
**Query params:** `status`, `assigned_tech_id`, `patient_id`, `date_from`, `date_to`

```
Response 200: Worklist of exam requests
```

### POST `/exam-requests`
**Roles:** receptionist, doctor, admin
```
Body:
{
  "patient_id": "uuid",
  "service_id": "uuid",
  "requesting_doctor_id": "uuid",
  "urgency": "routine | urgent | stat",
  "clinical_notes": "string",
  "appointment_id": "uuid (optional)"
}
Response 201: Exam request created + preparation instructions sent to patient
```

### PATCH `/exam-requests/:id`
**Roles:** nurse, lab_tech, admin
```
Body: { "status": "in_progress | resulted", "assigned_tech_id": "uuid" }
Response 200: Updated request
```

### POST `/exam-requests/:id/results`
**Roles:** nurse, lab_tech, admin
```
Body: multipart/form-data
  - file: PDF/image (max 20MB)
  - summary: string
Response 201: Result stored, download token generated, patient notified
```

### GET `/exam-results/:token/download`
**Auth:** Token-based (no JWT required — patient link)
```
Returns signed R2 download URL or streams file.
Token expires in 72 hours. Access is logged.
```

---

## 7. Billing (M6)

### GET `/invoices`
**Roles:** receptionist, admin
**Query params:** `patient_id`, `status`, `date_from`, `date_to`, `page`, `limit`

```
Response 200: Paginated invoice list
```

### POST `/invoices`
**Roles:** receptionist, admin
```
Body:
{
  "patient_id": "uuid",
  "appointment_id": "uuid (optional)",
  "health_plan_id": "uuid (optional)",
  "items": [
    { "service_id": "uuid", "description": "string", "quantity": 1, "unit_price": 5000 }
  ]
}
Response 201: Invoice object with computed totals
```

### POST `/invoices/:id/issue`
**Roles:** receptionist, admin
```
Response 200: Invoice status → issued; PDF generated; sent to patient
```

### POST `/invoices/:id/payments`
**Roles:** receptionist, admin
```
Body:
{
  "amount": 5000,
  "method": "cash | bank_transfer | health_plan | vinti4",
  "reference": "string (optional)",
  "paidAt": "ISO8601 (optional, defaults to now)"
}
Response 201:
{
  "id": "uuid",
  "status": "partially_paid | paid",
  "amountPaid": 5000
}
```
> Returns only the updated status fields. The frontend re-fetches the full invoice detail (`GET /invoices/:id`) via React Query cache invalidation. Returning the full items+payments payload on every payment would be wasted work.

### GET `/invoices/:id/pdf`
**Roles:** receptionist, admin, patient (own)
```
Response 200: application/pdf stream
```

---

## 8. Clinical Records (M7)

### GET `/appointments/:id/clinical-note`
**Roles:** doctor (own patient), admin
```
Response 200: SOAP note or 404 if not yet created
```

### POST `/appointments/:id/clinical-note`
**Roles:** doctor
```
Body:
{
  "subjective": "string",
  "objective": "string",
  "assessment": "string",
  "plan": "string",
  "icd10_codes": ["J45.0", "..."]
}
Response 201: Clinical note created
```

### PATCH `/appointments/:id/clinical-note`
**Roles:** doctor (while unlocked), admin
```
Body: Partial SOAP fields
Response 200: Updated note
```

### POST `/clinical-notes/:id/prescriptions`
**Roles:** doctor
```
Body:
{
  "drug_name": "string",
  "dosage": "string",
  "frequency": "string",
  "duration": "string",
  "instructions": "string"
}
Response 201: Prescription added
```

### POST `/clinical-notes/:id/referrals`
**Roles:** doctor
```
Body:
{
  "referred_to_staff_id": "uuid (internal, optional)",
  "referred_to_external": "string (optional)",
  "specialty": "string",
  "reason": "string"
}
Response 201: Referral created; booking link sent to patient if internal
```

---

## 9. Staff & Shifts (M8)

### GET `/staff`
**Roles:** receptionist, admin
**Query params:** `role`, `specialty`, `is_active`
```
Response 200: Staff list
```

### GET `/staff/:id/availability`
**Roles:** receptionist, admin (and public for booking widget)
**Query params:** `date_from`, `date_to`
```
Response 200: Available time slots after subtracting booked appointments and leaves
```

### POST `/staff/:id/shifts`
**Roles:** admin
```
Body: { "date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM" }
Response 201: Shift created
```

### POST `/staff/:id/leave`
**Roles:** admin, (staff requesting own leave)
```
Body: { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "type": "annual | sick", "reason": "string" }
Response 201: Leave request submitted
```

---

## 10. Home Visits (M9)

### GET `/home-visits`
**Roles:** receptionist, nurse (assigned), admin
**Query params:** `status`, `assigned_staff_id`, `date`
```
Response 200: List with patient address and map link
```

### POST `/home-visits`
**Roles:** receptionist, admin, patient
```
Body:
{
  "patient_id": "uuid",
  "service_id": "uuid",
  "address": "string",
  "lat": 14.930,
  "lng": -23.513,
  "urgency": "routine | urgent | emergency",
  "reason": "string",
  "preferred_time": "ISO8601"
}
Response 201: Visit request created
```

### PATCH `/home-visits/:id/status`
**Roles:** nurse (assigned), admin
```
Body: { "status": "assigned | departed | at_patient | completed | cancelled" }
Response 200: Status updated with timestamp
```

### POST `/home-visits/:id/assign`
**Roles:** receptionist, admin
```
Body: { "staff_id": "uuid" }
Response 200: Visit assigned; nurse notified
```

---

## 11. Analytics (M10)

### GET `/analytics/dashboard`
**Roles:** admin
**Query params:** `period` (today | week | month | year)
```
Response 200:
{
  "appointments": { "total": 45, "completed": 38, "no_shows": 4, "cancelled": 3 },
  "revenue": { "total": 450000, "currency": "CVE" },
  "online_booking_rate": 0.62,
  "top_services": [...],
  "new_patients": 12
}
```

### GET `/analytics/appointments`
**Roles:** admin
**Query params:** `date_from`, `date_to`, `group_by` (day|week|month)
```
Response 200: Time-series data
```

### GET `/analytics/revenue`
**Roles:** admin
**Query params:** `date_from`, `date_to`, `group_by`, `by_service`, `by_doctor`
```
Response 200: Revenue breakdown
```

### GET `/analytics/export`
**Roles:** admin
**Query params:** `report` (appointments|revenue|patients|plans), `format` (pdf|xlsx), `date_from`, `date_to`
```
Response 200: File download
```

---

## 12. Services Catalogue

### GET `/services`
**Roles:** Public (used by booking widget)
**Query params:** `category`, `is_active`
```
Response 200: List of services with pricing
```

### POST `/services`
**Roles:** admin
```
Body: Full service object
Response 201: Service created
```

---

## 13. BFF — Backend for Frontend

Screen-aggregate endpoints that collapse multi-request UI patterns into a single parallel server-side fetch. All require the same authentication/roles as their constituent resource endpoints.

### GET `/bff/patient-screen/:id`
**Roles:** receptionist, doctor, nurse, admin

Returns the full patient profile (including health plan name) and the merged timeline in one request. Replaces the previous pattern of `GET /patients/:id` + `GET /patients/:id/timeline`.

```
Response 200:
{
  "patient": {
    "id": "uuid",
    "fullName": "Maria da Graça",
    "dateOfBirth": "1985-03-12",
    "gender": "female",
    "phone": "+2389001234",
    "email": "...",
    "address": "...",
    "nif": "...",
    "healthPlanId": "uuid",
    "healthPlan": {
      "planNumber": "PL-2024-001",
      "product": { "name": "Plano Familiar Mais+" }
    },
    ...
  },
  "timeline": [
    {
      "id": "uuid",
      "type": "appointment | communication | invoice | note",
      "title": "Consulta de Cardiologia",
      "description": "Dr. Nuno Barros — completed",
      "date": "2026-06-18T09:00:00Z",
      "metadata": { "status": "completed" }
    }
  ]
}
```

Timeline is sorted descending by date. Maximum 20 items per event type (appointments, communications, invoices).

---

### GET `/bff/billing-summary`
**Roles:** receptionist, admin

Returns aggregate KPI counts for the billing dashboard header cards.

```
Response 200:
{
  "issuedCount": 12,        // invoices with status "issued" this month
  "collectedAmount": 245000, // sum of amountPaid on "paid" invoices this month (CVE)
  "overdueCount": 3          // invoices with status "overdue" (all time)
}
```

---

## 14. Common HTTP Status Codes

| Code | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorised | Missing/expired token |
| 403 | Forbidden | Insufficient role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Double-booking, duplicate NIF |
| 422 | Unprocessable Entity | Business logic violation |
| 429 | Too Many Requests | Rate limit hit |
| 500 | Internal Server Error | Unexpected server error |

---

## 15. Rate Limiting

| Endpoint Group | Limit |
|---|---|
| Public (booking widget, availability) | 60 req/min per IP |
| Authenticated API | 300 req/min per user |
| WhatsApp webhook | 1000 req/min (Meta sends bursts) |
| Analytics export | 5 req/min per user |
| Auth endpoints | 10 req/min per IP |

---

## 16. Webhook Events (Outbound)

The platform emits webhook events to registered endpoints (configurable per clinic):

| Event | Trigger |
|---|---|
| `appointment.created` | New appointment booked |
| `appointment.cancelled` | Appointment cancelled |
| `appointment.no_show` | No-show flag set |
| `exam_result.ready` | Exam result uploaded |
| `invoice.paid` | Full payment received |
| `health_plan.expiring_soon` | 30/15/7 days before expiry |
| `home_visit.completed` | Home visit status → completed |

---

*Mais Saúde 360 · API Specification v1.2 · June 2026*
