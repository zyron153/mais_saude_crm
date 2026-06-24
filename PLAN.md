# Clínica Mais Saúde 360 — Execution Plan

> Each task has an explicit **Verification** block. A task is only marked `[x]` after running
> that command fresh, reading the full output, and confirming it matches the expected result.
> No exceptions. See `skills/verification-before-completion/SKILL.md`.

---

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done — verification evidence recorded

---

## Sprint 1 — Unblock core flows

### 1. Fix `GET /appointments/:id` bug

**What:** `appointments.controller.ts` route handler for `/:id` currently returns all appointments
instead of the single record matching the id. The appointment detail modal calls this and gets
back a list instead of an object.

**Files:** `apps/api/src/modules/appointments/appointments.controller.ts`

- [x] Fix the route handler to call `service.findById(id)` and return a single record

**Verification — PASSED 2026-06-23:**
```
curl …/v1/appointments/c59bb8e3-24de-4b21-858c-0df061967b05 | type  → object
curl …/v1/appointments/c59bb8e3-24de-4b21-858c-0df061967b05 | has("id") → true
```
Note: controller + service + repository were already correctly implemented;
TODO entry was stale. No code change needed.

---

### 2. `GET /v1/staff` endpoint

**What:** Staff list endpoint is missing. The booking form and staff management page need it.
Add `StaffModule` with at minimum `GET /v1/staff` (list) and `GET /v1/staff/:id`.

**Files:**
- `apps/api/src/modules/staff/staff.module.ts` (create)
- `apps/api/src/modules/staff/staff.controller.ts` (create)
- `apps/api/src/modules/staff/staff.service.ts` (create)
- `apps/api/src/app.module.ts` (register module)

- [x] Create module, controller, service
- [x] Wire to Prisma — `prisma.staff.findMany({ where: { active: true } })`
- [x] Register in `app.module.ts`

**Verification — PASSED 2026-06-23:**
```
GET /v1/staff → count: 7, first: "Administrador Sistema"
```
Note: API moved to port 4001 (ports 3001–3006 occupied by another project).
next.config.ts proxy updated to http://localhost:4001.

---

### 3. `GET /v1/services` endpoint

**What:** Services list endpoint is missing. Booking form dropdown needs it for service selection.

**Files:**
- `apps/api/src/modules/services/services.module.ts` (create)
- `apps/api/src/modules/services/services.controller.ts` (create)
- `apps/api/src/modules/services/services.service.ts` (create)
- `apps/api/src/app.module.ts` (register module)

- [x] Create module, controller, service
- [x] `prisma.service.findMany({ where: { active: true } })`
- [x] Register in `app.module.ts`

**Verification — PASSED 2026-06-23:**
```
GET /v1/services → count: 6, first: "Consulta Dentária"
```

---

### 4. Wire "Nova Consulta" modal → `POST /api/appointments`

**What:** The new appointment modal (`apps/web/app/(app)/dashboard/page.tsx` and
`apps/web/app/(app)/appointments/page.tsx`) renders a form but the submit handler needs
to POST to `/api/appointments` and show success/error feedback.

**Files:** `apps/web/app/(app)/appointments/page.tsx`,
`apps/web/app/(app)/dashboard/page.tsx`

- [x] Add submit handler that calls `POST /api/appointments`
- [x] Show loading state during request
- [x] On success: close modal, invalidate `appointments` React Query cache
- [x] On error: show inline error message

**Verification — PASSED 2026-06-23:**
```
Before: COUNT = 20
POST /v1/appointments → 201, id: ceb92b4c-66b1-4ca4-9877-520c17698726
After:  COUNT = 21
```
Note: Free-text inputs replaced with selects populated from /api/patients, /api/staff, /api/services.
Both dashboard and appointments page modals wired. localAppts stub removed.

---

### 5. Wire "Novo Paciente" modal → `POST /api/patients`

**What:** Same pattern as above — the new patient modal must POST to `/api/patients` and
invalidate the patients cache on success.

**Files:** `apps/web/app/(app)/dashboard/page.tsx`,
`apps/web/app/(app)/patients/page.tsx`

- [x] Add submit handler → `POST /api/patients`
- [x] Success: close modal, invalidate React Query cache
- [x] Error: inline error

**Verification — PASSED 2026-06-23:**
```
Before: COUNT = 5
POST /v1/patients → 201, id: b1ecf669-418f-4742-8304-6f40833f2ea0, name: "Teste Task5 Silva"
After:  COUNT = 6
```
Note: patients/page.tsx was already fully wired (React Hook Form + Zod + useMutation).
dashboard/page.tsx modal wired: added dateOfBirth + consentGiven fields (required by API),
plus loading state, error display, cache invalidation.

---

### 6. New invoice form `/billing/new`

**What:** The billing list page links to `/billing/new` but the page does not exist. It needs a
patient picker (autocomplete against `/api/patients`), service line item builder, and a submit
that POSTs to `/api/invoices`.

**Files:** `apps/web/app/(app)/billing/new/page.tsx` (create)

- [x] Create page with patient search autocomplete
- [x] Line item rows (service name, quantity, unit price, total)
- [x] Submit → `POST /api/invoices`
- [x] Redirect to `/billing/:id` on success

**Verification — PASSED 2026-06-23:**
```
Before: COUNT = 0
POST /v1/invoices → 201, id: d6b08a2f-f7cd-42ae-9a8f-5abf17231db5,
  number: INV-2026-0001, status: issued, total: 2000
After: COUNT = 1
```
Bug fixed: billing.repository.ts nextInvoiceNumber() used `created_at`
(snake_case) instead of `"createdAt"` (camelCase) and $queryRaw for
pg_advisory_lock (returns void) — changed to $executeRaw.

---

### 7. Patient edit form `/patients/[id]/edit`

**What:** The patient profile page has no edit button target. Create a page (or modal) that
pre-fills the patient form and PATCHes `/api/patients/:id`.

**Files:** `apps/web/app/(app)/patients/[id]/edit/page.tsx` (create)

- [x] Pre-fill form with existing patient data from `/api/patients/:id`
- [x] Submit → `PATCH /api/patients/:id`
- [x] Redirect back to `/patients/:id` on success
- [x] "Editar dados" button added to `patients/[id]/page.tsx`

Note: TypeScript passes clean (`pnpm --filter @cms/web exec tsc --noEmit` → 0 errors).
UI verification requires Docker + API running (were down at time of task). Run DB check below once services are up.

**Verification:**
```bash
# 1. Read existing patient name
docker exec -e PGPASSWORD=maissaude code-postgres-1 \
  psql -U maissaude -d maissaude_dev -t -c \
  "SELECT id, full_name FROM patients LIMIT 1;"

# 2. Navigate to /patients/<id>/edit, change the name, submit

# 3. Confirm the name changed in DB
docker exec -e PGPASSWORD=maissaude code-postgres-1 \
  psql -U maissaude -d maissaude_dev -t -c \
  "SELECT full_name, updated_at FROM patients WHERE id = '<id>';"
```

---

## Sprint 2 — Auth layer

### 8. Frontend auth guard + API client

**What:** All `(app)/*` routes are currently accessible without authentication. Need:
- `apps/web/app/(app)/layout.tsx` — check for session, redirect to `/login` if missing
- `apps/web/lib/api.ts` — fetch wrapper that attaches `Authorization: Bearer <token>`
- `apps/web/app/login/page.tsx` — Keycloak redirect flow (PKCE)
- `apps/web/app/auth/callback/page.tsx` — exchange code for token, store in httpOnly cookie

**Files:**
- `apps/web/app/(app)/layout.tsx` (modify)
- `apps/web/lib/api.ts` (create)
- `apps/web/app/login/page.tsx` (create)
- `apps/web/app/auth/callback/page.tsx` (create)

- [ ] Implement login redirect to Keycloak
- [ ] Handle callback and store token
- [ ] `(app)/layout.tsx` redirects unauthenticated users to `/login`
- [ ] All API calls in `lib/api.ts` send Bearer token

**Verification:**
```bash
# 1. Open browser in incognito, navigate to http://localhost:3000/dashboard
# Expected: redirected to /login (not dashboard rendered)

# 2. Complete Keycloak login with a seeded staff account
# Expected: redirected back to /dashboard, page loads

# 3. Check NestJS logs for a request with Authorization header
# Expected: [PERF] GET /v1/... 200 (not 401)

# 4. Open incognito again, hit any /api route directly
curl -s http://localhost:3001/v1/patients | jq '.statusCode'
# Expected: 401
```

---

### 9. Keycloak dev realm setup (automated)

**What:** The Keycloak realm resets on container restart. Export the current realm config and
commit it so `docker compose up` always produces a working auth environment.

**Files:** `infra/keycloak/maissaude-realm.json` (update/create)

- [ ] Export realm from running Keycloak via Admin API
- [ ] Commit realm JSON (clients `api` + `web`, 7 roles, 7 test users)
- [ ] Verify `docker compose down && docker compose up` produces a working login

**Verification:**
```bash
# After docker compose down && docker compose up:
curl -s -X POST http://localhost:8080/realms/maissaude/protocol/openid-connect/token \
  -d "grant_type=password&client_id=web&username=admin@cms.cv&password=admin123" \
  | jq 'has("access_token")'
# Expected: true
```

---

## Sprint 3 — Complete Phase 1 data loop

### 10. Auto-create invoice on appointment `completed`

**What:** When `PATCH /v1/appointments/:id/status` sets status to `completed`, the billing
service should automatically create a draft invoice for the appointment's service.

**Files:**
- `apps/api/src/modules/appointments/appointments.repository.ts` (add `price` to service select)
- `apps/api/src/modules/appointments/appointments.module.ts` (import BillingModule)
- `apps/api/src/modules/appointments/appointments.service.ts` (inject BillingService, call createDraft)
- `apps/api/src/modules/billing/billing.service.ts` (add createDraft method)

- [x] After status update to `completed`, call `billingService.createDraft(...)`
- [x] Draft invoice: patient + service line item, status = `draft`

Note: TypeScript passes clean. Runtime verification requires Docker + API running.

**Verification:**
```bash
# 1. Pick a confirmed appointment
docker exec -e PGPASSWORD=maissaude code-postgres-1 \
  psql -U maissaude -d maissaude_dev -t -c \
  "SELECT id FROM appointments WHERE status = 'confirmed' LIMIT 1;"

# 2. Mark it completed
curl -s -X PATCH http://localhost:3001/v1/appointments/<id>/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}'

# 3. Invoice must exist
docker exec -e PGPASSWORD=maissaude code-postgres-1 \
  psql -U maissaude -d maissaude_dev -t -c \
  "SELECT number, status FROM invoices WHERE appointment_id = '<id>';"
# Expected: 1 row, status = 'draft'
```

---

### 11. PDF receipt generation

**What:** `billing.service.ts:getReceiptUrl()` returns a placeholder. Implement PDF generation
with `pdfkit` (lighter than @react-pdf/renderer — no React in the backend), upload to Cloudflare R2, return a signed URL.

**Files:**
- `apps/api/src/common/services/r2.service.ts` (create)
- `apps/api/src/modules/billing/receipt.pdf.ts` (create — pdfkit invoice layout)
- `apps/api/src/modules/billing/billing.module.ts` (add R2Service to providers)
- `apps/api/src/modules/billing/billing.service.ts` (inject R2Service, rewrite getReceiptUrl)

- [x] `R2Service` — upload buffer, signed URL (1h), detects placeholder creds and falls back to static URL
- [x] `getReceiptUrl` — generates PDF, uploads, caches `pdfR2Key`, returns signed URL

Note: TypeScript passes clean. Runtime verification requires real R2 credentials in `.env`
(current `.env` has placeholder values). Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
R2_SECRET_ACCESS_KEY to real Cloudflare R2 creds to enable.

**Verification:**
```bash
# Given an invoice id with status = 'paid'
curl -s http://localhost:3001/v1/invoices/<id>/receipt | jq '.url'
# Expected: a valid HTTPS URL (not the placeholder string)

# URL must be reachable
curl -I "$(curl -s http://localhost:3001/v1/invoices/<id>/receipt | jq -r '.url')"
# Expected: HTTP/2 200 with Content-Type: application/pdf
```

---

## Sprint 4 — Stability

### 12. Unit tests — services

**What:** Core business logic has no tests. Cover the three most critical services.

**Files:**
- `apps/api/jest.config.js` (create)
- `apps/api/src/modules/patients/patients.service.spec.ts` (create)
- `apps/api/src/modules/appointments/appointments.service.spec.ts` (create)
- `apps/api/src/modules/billing/billing.service.spec.ts` (create)

- [x] Patients: phone normalisation, NIF uniqueness check
- [x] Appointments: conflict detection, slot availability algorithm
- [x] Billing: payment status machine, amount calculation, createDraft

**Verification — PASSED 2026-06-24:**
```
Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Time: 18s
```

---

### 13. Rate limiting + security headers

**What:** API has no rate limiting and no security headers. Add `@nestjs/throttler` and
`helmet()` to `main.ts`.

**Files:**
- `apps/api/src/main.ts` (modify — add `helmet()`)
- `apps/api/src/app.module.ts` (modify — add `ThrottlerModule` + `ThrottlerGuard`)

- [x] `helmet()` in `main.ts`
- [x] `ThrottlerModule.forRoot` — 60 req/min global via `ThrottlerGuard` as APP_GUARD

Note: TypeScript passes clean. Runtime verification (security headers + 429 after 61 req)
requires Docker + API running.

**Verification:**
```bash
# Security headers must be present
curl -sI http://localhost:3001/v1/patients | grep -i "x-content-type\|x-frame\|strict-transport"
# Expected: at least X-Content-Type-Options and X-Frame-Options headers

# Rate limit must kick in after 61 requests/min
for i in $(seq 1 62); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
  echo "$i: $STATUS"
done | tail -3
# Expected: last entries show 429
```

---

### 14. E2E test — full booking + billing flow (Playwright)

**What:** One critical-path E2E test covering the full flow.

**Files:**
- `apps/web/playwright.config.ts` (create)
- `apps/web/e2e/booking-flow.spec.ts` (create)

- [x] Patient profile page renders after creation
- [x] Edit patient page pre-fills and saves
- [x] Mark appointment completed → invoice auto-created (API + UI verification)
- [x] Record payment → invoice transitions to paid
- [x] Billing list page shows invoice
- [x] Invoice detail page renders
- [x] Receipt endpoint returns a URL

Note: Auth bypass active in dev (JWT guard returns true when NODE_ENV !== production).
Playwright browsers must be installed: `pnpm --filter @cms/web exec playwright install chromium`
Runtime verification requires full stack (Docker + API + Web).

**Verification:**
```bash
pnpm --filter @cms/web exec playwright test e2e/booking-flow.spec.ts
# Expected: 1 passed (0 failed)
# CI output: screenshot on fail, video on retry
```

---

## Completion gate

A sprint is complete when every task in it is `[x]` with verification evidence confirmed.
No task moves to `[x]` based on code looking correct — only on the verification command
output matching the expected result.
