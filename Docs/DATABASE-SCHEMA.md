# Mais Saúde 360 — Database Schema

> **Database:** PostgreSQL 16
> **ORM:** Prisma 5+
> All timestamps are `TIMESTAMPTZ` (UTC). Soft deletes use `deleted_at`.

---

## 1. Core Domain Tables

### 1.1 `patients`

```sql
CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nif             VARCHAR(20) UNIQUE,                  -- Cabo Verde tax ID
  full_name       VARCHAR(255) NOT NULL,
  date_of_birth   DATE,
  gender          VARCHAR(10),                         -- male | female | other
  nationality     VARCHAR(100),
  phone_whatsapp  VARCHAR(20) NOT NULL UNIQUE,         -- primary contact
  phone_secondary VARCHAR(20),
  email           VARCHAR(255),
  address         TEXT,
  zone            VARCHAR(100),                        -- district/neighbourhood
  emergency_contact_name  VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  primary_doctor_id       UUID REFERENCES staff(id),
  photo_url       TEXT,                                -- R2 object key
  tags            TEXT[],                              -- VIP, Chronic, Paediatric, etc.
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_patients_phone ON patients(phone_whatsapp);
CREATE INDEX idx_patients_nif ON patients(nif);
CREATE INDEX idx_patients_name ON patients USING gin(to_tsvector('portuguese', full_name));
```

---

### 1.2 `staff`

```sql
CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(50) NOT NULL,     -- admin | doctor | nurse | receptionist | lab_tech | hr
  specialty       VARCHAR(100),             -- Cardiology, Dental, etc. (doctors only)
  phone           VARCHAR(20),
  email           VARCHAR(255) UNIQUE NOT NULL,
  keycloak_user_id VARCHAR(255) UNIQUE,     -- link to auth provider
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

---

### 1.3 `services`

```sql
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,   -- consultation | exam | dental | ultrasound | home_visit
  specialty       VARCHAR(100),
  description     TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  buffer_minutes  INT NOT NULL DEFAULT 5,  -- gap after appointment
  base_price      NUMERIC(10,2) NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 2. Appointment Module (M1)

### 2.1 `appointments`

```sql
CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  room_id         UUID REFERENCES rooms(id),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  status          VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  -- scheduled | confirmed | checked_in | in_progress | completed | cancelled | no_show
  booking_source  VARCHAR(30),             -- web | whatsapp_bot | phone | walk_in
  cancellation_reason TEXT,
  health_plan_id  UUID REFERENCES health_plans(id),
  notes           TEXT,
  created_by      UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_appt_patient ON appointments(patient_id);
CREATE INDEX idx_appt_staff ON appointments(staff_id);
CREATE INDEX idx_appt_starts ON appointments(starts_at);
CREATE INDEX idx_appt_status ON appointments(status);
-- Prevent double-booking: unique on (staff_id, starts_at) where deleted_at IS NULL
CREATE UNIQUE INDEX idx_appt_no_double_book ON appointments(staff_id, starts_at)
  WHERE deleted_at IS NULL AND status NOT IN ('cancelled', 'no_show');
```

### 2.2 `appointment_reminders`

```sql
CREATE TABLE appointment_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  channel         VARCHAR(20) NOT NULL,    -- whatsapp | sms | email
  send_at         TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | sent | failed
  bull_job_id     VARCHAR(255),            -- BullMQ job reference
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 `waitlist`

```sql
CREATE TABLE waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  staff_id        UUID REFERENCES staff(id),           -- preferred doctor (optional)
  preferred_date  DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'waiting',  -- waiting | notified | booked | expired
  notified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.4 `rooms`

```sql
CREATE TABLE rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  capacity        INT NOT NULL DEFAULT 1,
  equipment       TEXT[],                              -- ['ECG machine', 'Ultrasound']
  is_active       BOOLEAN NOT NULL DEFAULT true
);
```

---

## 3. Patient CRM Module (M2)

### 3.1 `patient_documents`

```sql
CREATE TABLE patient_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,  -- id_document | consent | exam_result | insurance | other
  file_url        TEXT NOT NULL,         -- R2 object key
  file_name       VARCHAR(255),
  uploaded_by     UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 `patient_notes`

```sql
CREATE TABLE patient_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES staff(id),
  note            TEXT NOT NULL,
  is_private      BOOLEAN NOT NULL DEFAULT false,  -- clinical-only vs. all staff
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.3 `communication_log`

```sql
CREATE TABLE communication_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  channel         VARCHAR(20) NOT NULL,  -- whatsapp | sms | email | phone | in_person
  direction       VARCHAR(10) NOT NULL,  -- inbound | outbound
  message_body    TEXT,
  message_id      VARCHAR(255),          -- WhatsApp message ID
  staff_id        UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comm_log_patient ON communication_log(patient_id);
CREATE INDEX idx_comm_log_created ON communication_log(created_at DESC);
```

---

## 4. WhatsApp Integration Module (M3)

### 4.1 `whatsapp_conversations`

```sql
CREATE TABLE whatsapp_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID REFERENCES patients(id),
  wa_phone        VARCHAR(20) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'bot',  -- bot | agent | resolved | closed
  assigned_to     UUID REFERENCES staff(id),
  bot_state       JSONB,                   -- current bot FSM state
  last_message_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_conv_phone ON whatsapp_conversations(wa_phone);
CREATE INDEX idx_wa_conv_status ON whatsapp_conversations(status);
```

### 4.2 `whatsapp_messages`

```sql
CREATE TABLE whatsapp_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id),
  wa_message_id   VARCHAR(255) UNIQUE,
  direction       VARCHAR(10) NOT NULL,  -- inbound | outbound
  message_type    VARCHAR(20) NOT NULL,  -- text | interactive | template | media | location
  body            TEXT,
  media_url       TEXT,
  template_name   VARCHAR(100),
  status          VARCHAR(20),           -- sent | delivered | read | failed
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.3 `whatsapp_templates`

```sql
CREATE TABLE whatsapp_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL UNIQUE,
  category        VARCHAR(50),           -- UTILITY | MARKETING | AUTHENTICATION
  language        VARCHAR(10) NOT NULL DEFAULT 'pt',
  body_template   TEXT NOT NULL,         -- with {{1}} placeholders
  is_active       BOOLEAN NOT NULL DEFAULT true,
  meta_template_id VARCHAR(255),         -- approved template ID from Meta
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. Health Plans Module (M4)

### 5.1 `health_plan_products`

```sql
CREATE TABLE health_plan_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(20) NOT NULL,  -- family | corporate
  description     TEXT,
  monthly_fee     NUMERIC(10,2) NOT NULL,
  included_consultations INT,            -- NULL = unlimited
  included_exams  INT,
  coverage_details JSONB,                -- detailed coverage rules
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.2 `health_plans` (subscriptions)

```sql
CREATE TABLE health_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES health_plan_products(id),
  patient_id      UUID REFERENCES patients(id),        -- NULL for corporate plans
  company_id      UUID REFERENCES companies(id),       -- NULL for family plans
  status          VARCHAR(20) NOT NULL DEFAULT 'active',  -- active | expired | cancelled | suspended
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  monthly_fee     NUMERIC(10,2) NOT NULL,              -- snapshot at sign-up
  consultations_used INT NOT NULL DEFAULT 0,
  exams_used      INT NOT NULL DEFAULT 0,
  auto_renew      BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plan_patient ON health_plans(patient_id);
CREATE INDEX idx_plan_end_date ON health_plans(end_date);
```

### 5.3 `companies`

```sql
CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  nif             VARCHAR(20) UNIQUE,
  contact_name    VARCHAR(255),
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(20),
  hr_staff_id     UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.4 `corporate_plan_members`

```sql
CREATE TABLE corporate_plan_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_plan_id  UUID NOT NULL REFERENCES health_plans(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at      TIMESTAMPTZ,
  UNIQUE(health_plan_id, patient_id)
);
```

---

## 6. Exams & Results Module (M5)

### 6.1 `exam_requests`

```sql
CREATE TABLE exam_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_id  UUID REFERENCES appointments(id),
  requesting_doctor_id UUID REFERENCES staff(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  urgency         VARCHAR(20) NOT NULL DEFAULT 'routine',  -- routine | urgent | stat
  clinical_notes  TEXT,
  status          VARCHAR(30) NOT NULL DEFAULT 'requested',
  -- requested | scheduled | sample_collected | in_progress | resulted | delivered
  assigned_tech_id UUID REFERENCES staff(id),
  scheduled_at    TIMESTAMPTZ,
  resulted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6.2 `exam_results`

```sql
CREATE TABLE exam_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_request_id UUID NOT NULL REFERENCES exam_requests(id) UNIQUE,
  file_url        TEXT NOT NULL,           -- R2 object key (PDF/image/DICOM)
  file_type       VARCHAR(20),             -- pdf | jpeg | dicom
  summary         TEXT,
  uploaded_by     UUID NOT NULL REFERENCES staff(id),
  download_token  VARCHAR(255) UNIQUE,     -- secure time-limited token
  token_expires_at TIMESTAMPTZ,
  patient_notified_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. Billing Module (M6)

### 7.1 `invoices`

```sql
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,  -- MS-2026-0001
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_id  UUID REFERENCES appointments(id),
  health_plan_id  UUID REFERENCES health_plans(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'draft',
  -- draft | issued | paid | partially_paid | overdue | cancelled
  subtotal        NUMERIC(10,2) NOT NULL,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'CVE',
  issued_at       TIMESTAMPTZ,
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  created_by      UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_patient ON invoices(patient_id);
CREATE INDEX idx_invoice_status ON invoices(status);
```

### 7.2 `invoice_items`

```sql
CREATE TABLE invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  service_id      UUID REFERENCES services(id),
  description     VARCHAR(255) NOT NULL,
  quantity        INT NOT NULL DEFAULT 1,
  unit_price      NUMERIC(10,2) NOT NULL,
  total_price     NUMERIC(10,2) NOT NULL
);
```

### 7.3 `payments`

```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id),
  amount          NUMERIC(10,2) NOT NULL,
  method          VARCHAR(30) NOT NULL,  -- cash | bank_transfer | health_plan | vinti4 | card
  reference       VARCHAR(255),          -- transfer ref or Vinti4 transaction ID
  received_by     UUID REFERENCES staff(id),
  paid_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 8. Clinical Records Module (M7)

### 8.1 `clinical_notes`

```sql
CREATE TABLE clinical_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) UNIQUE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  doctor_id       UUID NOT NULL REFERENCES staff(id),
  subjective      TEXT,    -- S: patient complaint / history
  objective       TEXT,    -- O: examination findings, vitals
  assessment      TEXT,    -- A: diagnosis / ICD-10 codes
  plan            TEXT,    -- P: treatment plan, referrals
  icd10_codes     TEXT[],
  is_locked       BOOLEAN NOT NULL DEFAULT false,  -- locked after 24hrs
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.2 `prescriptions`

```sql
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinical_note_id UUID NOT NULL REFERENCES clinical_notes(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  doctor_id       UUID NOT NULL REFERENCES staff(id),
  drug_name       VARCHAR(255) NOT NULL,
  dosage          VARCHAR(100),
  frequency       VARCHAR(100),
  duration        VARCHAR(100),
  instructions    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8.3 `referrals`

```sql
CREATE TABLE referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinical_note_id UUID NOT NULL REFERENCES clinical_notes(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  referring_doctor_id UUID NOT NULL REFERENCES staff(id),
  referred_to_staff_id UUID REFERENCES staff(id),    -- internal referral
  referred_to_external TEXT,                           -- external provider name
  specialty       VARCHAR(100),
  reason          TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | booked | completed
  appointment_id  UUID REFERENCES appointments(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 9. Staff & Resource Scheduling Module (M8)

### 9.1 `staff_shifts`

```sql
CREATE TABLE staff_shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  break_minutes   INT NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date, start_time)
);

CREATE INDEX idx_shifts_staff_date ON staff_shifts(staff_id, date);
```

### 9.2 `staff_availability`

```sql
CREATE TABLE staff_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  day_of_week     SMALLINT NOT NULL,  -- 0=Sunday … 6=Saturday
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(staff_id, day_of_week, start_time)
);
```

### 9.3 `leave_requests`

```sql
CREATE TABLE leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  type            VARCHAR(30) NOT NULL,  -- annual | sick | personal | unpaid
  reason          TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  approved_by     UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 10. Home Visit Module (M9)

### 10.1 `home_visits`

```sql
CREATE TABLE home_visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  address         TEXT NOT NULL,
  lat             NUMERIC(10,7),
  lng             NUMERIC(10,7),
  urgency         VARCHAR(20) NOT NULL DEFAULT 'routine',  -- routine | urgent | emergency
  reason          TEXT,
  preferred_time  TIMESTAMPTZ,
  assigned_staff_id UUID REFERENCES staff(id),
  status          VARCHAR(30) NOT NULL DEFAULT 'requested',
  -- requested | assigned | departed | at_patient | completed | cancelled
  departed_at     TIMESTAMPTZ,
  arrived_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  clinical_note_id UUID REFERENCES clinical_notes(id),
  invoice_id      UUID REFERENCES invoices(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_home_visits_status ON home_visits(status);
CREATE INDEX idx_home_visits_patient ON home_visits(patient_id);
```

---

## 11. Analytics (M10) — Materialised Views

```sql
-- Daily appointment summary (refreshed nightly)
CREATE MATERIALIZED VIEW mv_daily_appointments AS
SELECT
  DATE(starts_at) AS date,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  COUNT(*) FILTER (WHERE booking_source = 'web') AS online_bookings,
  COUNT(*) FILTER (WHERE booking_source = 'whatsapp_bot') AS bot_bookings
FROM appointments
WHERE deleted_at IS NULL
GROUP BY DATE(starts_at);

-- Monthly revenue summary
CREATE MATERIALIZED VIEW mv_monthly_revenue AS
SELECT
  DATE_TRUNC('month', paid_at) AS month,
  SUM(amount) AS total_revenue,
  COUNT(DISTINCT i.patient_id) AS unique_patients
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
GROUP BY DATE_TRUNC('month', paid_at);
```

---

## 12. Audit Log

```sql
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name      VARCHAR(100) NOT NULL,
  record_id       UUID NOT NULL,
  action          VARCHAR(10) NOT NULL,  -- INSERT | UPDATE | DELETE
  old_values      JSONB,
  new_values      JSONB,
  performed_by    UUID REFERENCES staff(id),
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

---

## 13. Index Summary

| Table | Key Indexes |
|---|---|
| patients | phone_whatsapp, nif, full_name (GIN FTS) |
| appointments | patient_id, staff_id, starts_at, status, unique(staff_id, starts_at) |
| invoices | patient_id, status |
| communication_log | patient_id, created_at |
| whatsapp_conversations | wa_phone, status |
| staff_shifts | staff_id, date |
| home_visits | status, patient_id |
| audit_log | table_name + record_id, created_at |

---

*Mais Saúde 360 · Database Schema v1.0 · June 2026*
