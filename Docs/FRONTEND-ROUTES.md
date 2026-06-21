# Frontend Route Map

Next.js App Router routes for the `apps/web` application.

## Route Groups

### `(auth)` — unauthenticated

| Path | File | Description |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Keycloak PKCE redirect |
| `/login/callback` | `(auth)/login/callback/page.tsx` | Handles Keycloak redirect after login |

### `(app)` — requires authentication (guarded by layout middleware)

#### Dashboard

| Path | File | Roles | Description |
|---|---|---|---|
| `/` | `(app)/dashboard/page.tsx` | all staff | Today's appointments, quick stats |

#### Appointments

| Path | File | Roles | Description |
|---|---|---|---|
| `/appointments` | `(app)/appointments/page.tsx` | all staff | FullCalendar week/day/month view |
| `/appointments/new` | `(app)/appointments/new/page.tsx` | receptionist, admin | Create booking form |
| `/appointments/[id]` | `(app)/appointments/[id]/page.tsx` | all staff | Detail: status, notes, patient |
| `/appointments/waitlist` | `(app)/appointments/waitlist/page.tsx` | receptionist, admin | Waitlist management |

#### Patients

| Path | File | Roles | Description |
|---|---|---|---|
| `/patients` | `(app)/patients/page.tsx` | all staff | Searchable patient list |
| `/patients/new` | `(app)/patients/new/page.tsx` | receptionist, admin | Registration form |
| `/patients/[id]` | `(app)/patients/[id]/page.tsx` | all staff | Profile + timeline |
| `/patients/[id]/documents` | `(app)/patients/[id]/documents/page.tsx` | doctor, nurse, lab_tech, admin | Upload & download |

#### Billing

| Path | File | Roles | Description |
|---|---|---|---|
| `/billing` | `(app)/billing/page.tsx` | receptionist, admin | Invoice list + filters |
| `/billing/new` | `(app)/billing/new/page.tsx` | receptionist, admin | Manual invoice creation |
| `/billing/[id]` | `(app)/billing/[id]/page.tsx` | receptionist, admin | Invoice + payment recording |

#### Health Plans

| Path | File | Roles | Description |
|---|---|---|---|
| `/health-plans` | `(app)/health-plans/page.tsx` | admin, receptionist | Plan list |
| `/health-plans/products` | `(app)/health-plans/products/page.tsx` | admin | Product catalogue |
| `/health-plans/products/new` | `(app)/health-plans/products/new/page.tsx` | admin | Create product |
| `/health-plans/products/[id]` | `(app)/health-plans/products/[id]/page.tsx` | admin | Edit product |

#### Companies

| Path | File | Roles | Description |
|---|---|---|---|
| `/companies` | `(app)/companies/page.tsx` | admin | Company list |
| `/companies/new` | `(app)/companies/new/page.tsx` | admin | Register company |
| `/companies/[id]` | `(app)/companies/[id]/page.tsx` | admin, corporate_hr | Company detail + plans |

#### Admin

| Path | File | Roles | Description |
|---|---|---|---|
| `/admin/staff` | `(app)/admin/staff/page.tsx` | admin | Staff roster + Keycloak links |
| `/admin/rooms` | `(app)/admin/rooms/page.tsx` | admin | Room management |
| `/admin/services` | `(app)/admin/services/page.tsx` | admin | Service catalogue + pricing |
| `/admin/holidays` | `(app)/admin/holidays/page.tsx` | admin | Public holiday calendar |
| `/admin/audit` | `(app)/admin/audit/page.tsx` | admin | Audit log |

### `(patient)` — patient self-service portal

| Path | File | Description |
|---|---|---|
| `/portal` | `(patient)/portal/page.tsx` | Dashboard: upcoming appointments |
| `/portal/book` | `(patient)/portal/book/page.tsx` | Self-booking flow |
| `/portal/results` | `(patient)/portal/results/page.tsx` | Exam results list |
| `/portal/invoices` | `(patient)/portal/invoices/page.tsx` | Own invoices |
| `/portal/profile` | `(patient)/portal/profile/page.tsx` | Edit contact info |

## API Proxy

All `/api/*` requests are rewritten by `next.config.ts` to `http://localhost:3001/v1/*`.

## Auth Guard

- The `(app)` layout reads the Keycloak session via `@react-keycloak/web` (or `next-auth` with Keycloak provider).
- Unauthenticated requests are redirected to `/login`.
- Role-based route restrictions are enforced client-side; the API enforces them server-side via `RolesGuard`.
