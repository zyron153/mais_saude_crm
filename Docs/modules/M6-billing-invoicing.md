# M6 — Billing & Invoicing

> **Priority:** 🟠 High · **Phase:** 1 (Months 1–3)
> **Dependencies:** M2 (Patient CRM), M1 (Appointments), M4 (Health Plans)

---

## 1. Overview

Eliminates revenue leakage from manual and untracked billing. Auto-generates invoices at check-in, supports multiple payment methods including health plan claims, and delivers receipts to patients via WhatsApp.

---

## 2. Core Features

### 2.1 Service Price Catalogue

- Admin-managed list of all billable services with base price (CVE)
- Health-plan-specific pricing (often 0 co-pay for included services)
- Bulk price update capability

### 2.2 Invoice Generation

Invoices are created:
- **Automatically** at appointment check-in (receptionist clicks "Check In")
- **Manually** by receptionist for walk-ins or additional services

Invoice includes:
- Auto-incremented invoice number: `MS-2026-00001`
- Patient name and NIF
- Line items: service, quantity, unit price, total
- Health plan discount (if applicable)
- Subtotal, discount, **Total in CVE**
- Clinic details, tax ID

### 2.3 Payment Collection

Supported methods:
- Cash
- Bank transfer (reference noted)
- Health plan claim (marks service as consumed on plan)
- Vinti4 (Phase 4)
- Card (Phase 4)

Partial payments supported: invoice status → `partially_paid` until balance cleared.

### 2.4 Receipt Delivery

On full payment:
- PDF receipt generated (server-side using Puppeteer or PDFKit)
- Receipt sent to patient via WhatsApp (`invoice_receipt` template with download link)
- Receipt also emailed if patient has email on record

### 2.5 Outstanding Balances

- Dashboard showing all patients with outstanding invoices
- Overdue alert: invoices unpaid > 30 days flagged in patient CRM
- Admin can send payment reminder directly from invoice detail page

---

## 3. Reporting

- Daily cash summary (total collected by method, by staff)
- Monthly revenue by: service, doctor, plan type
- Outstanding receivables report
- All reports exportable to Excel and PDF (M10 Analytics integration)

---

## 4. Data Model

See `DATABASE-SCHEMA.md` → Section 7:
- `invoices`
- `invoice_items`
- `payments`

---

## 5. API Endpoints

See `API-SPEC.md` → Section 7 (Billing)

---

## 6. UI Screens

| Screen | Role | Description |
|---|---|---|
| Check-in & Invoice | Receptionist | Check in patient + auto-created invoice |
| Invoice List | Receptionist / Admin | Filterable list of all invoices |
| Invoice Detail | Receptionist / Admin | Line items, payment history, actions |
| Payment Modal | Receptionist | Record payment — method, amount, reference |
| Outstanding Balances | Admin | Patients with unpaid invoices |
| Revenue Dashboard | Admin | Charts and tables by service/doctor/period |

---

## 7. Business Rules

- Invoices cannot be deleted; only cancelled (with reason)
- Cancelled invoices retain full audit trail
- Receipts are issued for each payment (not just on full settlement)
- Health plan services: system checks plan utilisation before applying zero co-pay
- Each payment recorded by staff member for accountability

---

*Module M6 · v1.0 · June 2026*
