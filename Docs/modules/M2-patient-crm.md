# M2 — Patient CRM

> **Priority:** 🔴 Critical · **Phase:** 1 (Months 1–3)
> **Dependencies:** None (foundational module)

---

## 1. Overview

The Patient CRM is the single source of truth for every patient in the clinic. All other modules (appointments, billing, exams, WhatsApp) reference and enrich the patient record. It replaces the current state of zero structured patient data.

---

## 2. Core Features

### 2.1 Unified Patient Profile

Each patient record contains:

**Demographics:**
- Full name, date of birth, gender, nationality
- NIF (Cabo Verde tax ID) — used for invoice generation
- Photo (uploaded to R2)

**Contact:**
- WhatsApp phone (primary — unique identifier for bot interaction)
- Secondary phone, email
- Residential address and zone (neighbourhood/district)

**Clinical context:**
- Primary physician assignment
- Active health plan (linked from M4)
- Tags: `VIP`, `Chronic`, `Paediatric`, `Home Visit Only`, `Corporate Plan`

**Administrative:**
- Emergency contact name and phone
- Consent forms and privacy agreements (uploaded documents)

### 2.2 Patient History Timeline

Chronological feed displayed in the patient record view, aggregating:
- All appointments (status, service, doctor, notes)
- All exam requests and results
- Home visit history
- Invoices and payment history
- All WhatsApp / SMS / email communications
- Manual staff notes

Each event is expandable inline. Clinical notes visible only to authorised roles.

### 2.3 Communication Log

Every interaction with the patient is automatically appended:
- Inbound/outbound WhatsApp messages (from M3 webhook)
- Emails sent via SendGrid (delivery status tracked)
- SMS sent via Africa's Talking
- Manual notes added by staff
- Staff can attach follow-up tasks with due dates

### 2.4 Patient Search

- Search by name, phone, NIF, or email
- Full-text search using PostgreSQL `pg_trgm` extension
- Filter by tag, health plan status, last visit date
- Results ranked by relevance; phone search returns instant match

### 2.5 Duplicate Detection

- On new patient creation, the system checks for existing records with same phone or NIF
- Presents potential duplicates to staff before allowing creation
- Merge tool available to admin to combine duplicate records

---

## 3. Data Model

See `DATABASE-SCHEMA.md` → sections 1.1, 3.1, 3.2, 3.3:
- `patients`
- `patient_documents`
- `patient_notes`
- `communication_log`

---

## 4. API Endpoints

See `API-SPEC.md` → Section 2 (Patients)

---

## 5. Access Control

| Data | patient | receptionist | doctor | nurse | admin |
|---|---|---|---|---|---|
| Demographics | own | ✅ | read | read (assigned) | ✅ |
| Clinical notes | 🔒 | summary | ✅ own | assigned only | read |
| Communication log | own | ✅ | 🔒 | 🔒 | ✅ |
| Documents | own | ✅ | ✅ | upload | ✅ |
| Tags | 🔒 | ✅ | ✅ | 🔒 | ✅ |
| Delete/merge | 🔒 | 🔒 | 🔒 | 🔒 | ✅ |

---

## 5. UI Screens

| Screen | Description |
|---|---|
| Patient Search | Search bar + results table with quick-view card |
| Patient Profile | Full profile with tabs: Overview, History, Documents, Comms |
| New Patient Form | Multi-step registration (demographics → contact → consent) |
| Patient Timeline | Scrollable chronological activity feed |
| Communication Log | Threaded message view per channel |
| Document Manager | Upload, categorise, and download patient documents |

---

## 6. GDPR / Data Privacy

- Patient consent for data processing captured at registration (consent form stored as document)
- Data portability: admin can export full patient record as JSON or PDF
- Right to erasure: soft-delete clears PII but retains anonymised billing records (legal requirement)
- Access log: every view of a patient record is written to `audit_log`
- Data retention: inactive patient records archived after 7 years (configurable)

---

*Module M2 · v1.0 · June 2026*
