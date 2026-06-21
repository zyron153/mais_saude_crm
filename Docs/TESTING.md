# Mais Saúde 360 — Testing Strategy

> **Version:** 1.0 · **Date:** June 2026
> Tools: Jest (unit/integration), Playwright (E2E), k6 (performance), OWASP ZAP (security)

---

## 1. Testing Philosophy

- **Test the business logic** — unit tests focus on domain rules (appointment conflict, plan utilisation), not infrastructure plumbing
- **Integration tests own the API contracts** — every endpoint tested with real DB and Redis
- **E2E tests cover critical user journeys** — booking flow, check-in, exam result delivery
- **Performance tests run before every major release** — validate 4G load time and concurrent user targets

---

## 2. Test Pyramid

```
         ╱╲
        ╱E2E╲          ~20 tests — Playwright (critical flows only)
       ╱──────╲
      ╱  Integ  ╲      ~150 tests — Supertest + real DB
     ╱────────────╲
    ╱     Unit      ╲  ~500 tests — Jest (business logic, services)
   ╱──────────────────╲
```

---

## 3. Unit Tests

**Tool:** Jest + ts-jest
**Location:** `apps/api/src/**/*.spec.ts`

### 3.1 What to Unit Test

- Service layer business logic (not controllers, not DB queries)
- Utility functions (slot availability calculation, token generation, price computation)
- Bot FSM state transitions
- Reminder job scheduling logic
- Input validation rules

### 3.2 Key Test Suites

#### Appointment Service
```typescript
describe('AppointmentService', () => {
  it('should prevent double-booking for the same staff slot', async () => { ... })
  it('should apply buffer time between appointments', async () => { ... })
  it('should release Redis lock if booking fails', async () => { ... })
  it('should auto-set no-show 30 minutes after scheduled start', async () => { ... })
  it('should notify waitlisted patient when slot opens', async () => { ... })
})
```

#### Health Plan Service
```typescript
describe('HealthPlanService', () => {
  it('should decrement consultation counter on appointment completion', async () => { ... })
  it('should block booking when plan consultations exhausted', async () => { ... })
  it('should trigger renewal reminder 30 days before expiry', async () => { ... })
  it('should apply zero co-pay for plan-included services', async () => { ... })
})
```

#### Billing Service
```typescript
describe('BillingService', () => {
  it('should generate sequential invoice numbers', async () => { ... })
  it('should mark invoice as paid when full amount received', async () => { ... })
  it('should mark invoice as partially_paid for partial payment', async () => { ... })
  it('should apply health plan discount correctly', async () => { ... })
})
```

#### Bot FSM
```typescript
describe('WhatsAppBotFSM', () => {
  it('should return main menu on any unrecognised first message', async () => { ... })
  it('should advance to BOOK_SPECIALTY after user selects "1" from MENU', async () => { ... })
  it('should reset to IDLE after 30 minutes of inactivity', async () => { ... })
  it('should escalate to agent on "humano" keyword at any state', async () => { ... })
})
```

### 3.3 Coverage Target

- Minimum 80% line coverage on `src/modules/**/*.service.ts`
- 100% coverage on core business logic: `appointment.service.ts`, `billing.service.ts`, `health-plan.service.ts`

---

## 4. Integration Tests

**Tool:** Jest + Supertest + `@nestjs/testing` + test PostgreSQL container
**Location:** `apps/api/test/integration/**/*.spec.ts`

### 4.1 Setup

```typescript
// test/helpers/setup.ts
beforeAll(async () => {
  // Start test PostgreSQL via testcontainers
  // Run Prisma migrations
  // Seed reference data (services, staff, rooms)
  // Bootstrap NestJS app
})

afterAll(async () => {
  // Teardown DB container
})

afterEach(async () => {
  // Truncate all tables (preserve reference data)
})
```

### 4.2 Key Integration Scenarios

#### Appointment Booking API
```
POST /appointments → 201 created + confirmation enqueued
POST /appointments (conflict) → 409 Conflict
GET /appointments/availability → correct slots returned
PATCH /appointments/:id (cancel) → status updated + reminder jobs cancelled
```

#### Patient CRM API
```
POST /patients → 201 created
POST /patients (duplicate phone) → 409 Conflict
GET /patients?search=Maria → returns fuzzy matches
GET /patients/:id → includes active health plan
```

#### Auth Guard Tests
```
GET /patients (no token) → 401
GET /patients (patient token) → 403 (wrong role)
GET /patients (receptionist token) → 200
GET /clinical-notes (receptionist token) → 403
GET /clinical-notes (doctor token) → 200 (own patients only)
```

#### Billing Flow
```
POST /invoices → 201
POST /invoices/:id/issue → status = issued
POST /invoices/:id/payments (full) → status = paid
POST /invoices/:id/payments (partial) → status = partially_paid
```

---

## 5. End-to-End Tests

**Tool:** Playwright
**Location:** `apps/web/e2e/**/*.spec.ts`
**Environments:** Runs against staging environment

### 5.1 Critical Flows

#### Patient Booking Flow
```
1. Navigate to maissaudecv.com booking widget
2. Select "Consulta de Cardiologia"
3. Select Dr. João Andrade
4. Select available date and time
5. Enter new patient details (name, phone)
6. Submit booking
7. Assert: appointment created in DB
8. Assert: WhatsApp confirmation sent (mock webhook)
9. Assert: reminder jobs queued in BullMQ
```

#### Receptionist Check-In Flow
```
1. Log in as receptionist
2. Open today's calendar
3. Find appointment → click Check In
4. Assert: appointment status = checked_in
5. Assert: invoice auto-created as draft
6. Record payment
7. Assert: invoice status = paid
8. Assert: receipt sent via WhatsApp
```

#### Doctor Clinical Note Flow
```
1. Log in as doctor
2. Navigate to scheduled appointment
3. Open EMR editor
4. Fill SOAP note + add ICD-10 code
5. Add prescription
6. Save note
7. Assert: note saved and linked to appointment
8. Assert: receptionist cannot see note body (only summary)
```

#### Exam Result Delivery Flow
```
1. Log in as lab_tech
2. Find pending exam request
3. Upload PDF result
4. Assert: patient WhatsApp notification sent
5. Follow download link
6. Assert: file accessible within 72h window
7. Assert: access logged in audit_log
```

---

## 6. Performance Tests

**Tool:** k6
**Location:** `tests/performance/`

### 6.1 Scenarios

```javascript
// tests/performance/booking-widget.js
export default function () {
  // Simulate 50 concurrent users completing booking flow
  const res = http.get('https://api.maissaudecv.com/v1/appointments/availability?...')
  check(res, { 'status 200': (r) => r.status === 200 })
  check(res, { 'response < 500ms': (r) => r.timings.duration < 500 })
}

export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],     // < 1% error rate
  },
}
```

### 6.2 Performance Targets (from PRD NFRs)

| Scenario | Target | k6 Threshold |
|---|---|---|
| Availability API (booking widget) | p95 < 500ms | `p(95)<500` |
| Appointment creation | p95 < 1000ms | `p(95)<1000` |
| Calendar load (week view, 50 appts) | p95 < 1000ms | `p(95)<1000` |
| Patient search | p95 < 300ms | `p(95)<300` |
| 50 concurrent users | < 1% errors | `rate<0.01` |

Performance tests run weekly in CI against staging; must pass before every production release.

---

## 7. Security Tests

**Tool:** OWASP ZAP (automated scan), manual penetration testing (quarterly)

### 7.1 Automated Scan (CI)

```yaml
# .github/workflows/security.yml
- name: Run OWASP ZAP scan
  uses: zaproxy/action-full-scan@v0.7.0
  with:
    target: 'https://staging.maissaudecv.com'
    rules_file_name: '.zap/rules.tsv'
    fail_action: true
```

Scans for: SQL injection, XSS, CSRF, insecure headers, exposed endpoints.

### 7.2 Security Test Checklist (Manual)

- [ ] JWT with tampered role claim is rejected
- [ ] Patient A cannot access Patient B's records
- [ ] Expired exam result token returns 401
- [ ] Admin actions appear in audit log
- [ ] Rate limits enforced on auth endpoints
- [ ] File upload rejects non-medical MIME types
- [ ] All API routes return 401 without token

---

## 8. Test Data Management

### 8.1 Seed Data (Development & Staging)

```typescript
// packages/database/prisma/seed.ts
// Creates:
// - 3 doctors (cardiology, paediatrics, dental)
// - 2 receptionists
// - 1 lab tech
// - 5 services (consultation, ECG, dental, ultrasound, home visit)
// - 3 rooms
// - 10 test patients
// - 20 appointments across next 7 days
// - 2 health plans (1 family, 1 corporate)
```

### 8.2 Test Patient Phone Numbers

Use fictional Cabo Verde numbers for testing:
- Receptionist test account: `+238 900 0001`
- Test patient 1: `+238 900 1001`
- Test patient 2: `+238 900 1002`

WhatsApp integration tests use mock webhook handler (no real messages sent).

---

## 9. Test Run Commands

```bash
# Unit tests
pnpm test

# Unit tests with coverage
pnpm test:cov

# Integration tests (requires running Docker services)
pnpm test:integration

# E2E tests (requires staging URL)
pnpm test:e2e

# Performance tests
k6 run tests/performance/booking-widget.js

# All tests (CI pipeline)
pnpm test:all
```

---

## 10. Definition of Done

A feature is complete when:
- Unit tests written and passing for all business logic
- Integration tests cover the new API endpoints (happy path + key error cases)
- E2E test added or updated if the feature affects a user-facing flow
- Test coverage does not drop below 80% for affected service files
- No new high-severity security findings from ZAP scan
- Performance regression check: no > 10% degradation vs. baseline

---

*Mais Saúde 360 · Testing Strategy v1.0 · June 2026*
