# Mais Saúde 360 — Roles & Permissions (RBAC)

> **Auth Provider:** Keycloak (self-hosted)
> Roles are assigned per user in Keycloak and embedded in the JWT `realm_access.roles` claim.
> All API routes are guarded by `RolesGuard` in NestJS.

---

## 1. Role Definitions

| Role ID | Display Name | Description |
|---|---|---|
| `patient` | Paciente | Self-service portal: book, view results, manage own plan |
| `receptionist` | Recepcionista | Front-desk: schedule, check-in, billing, WhatsApp inbox |
| `doctor` | Médico | Clinical: own schedule, write notes, prescriptions, referrals |
| `nurse` | Enfermeira / Técnico | Exams, home visits, results upload, assigned tasks only |
| `lab_tech` | Técnico de Laboratório | Exam worklist and result upload only |
| `admin` | Administrador | Full access to all modules, settings, staff management |
| `corporate_hr` | RH Empresarial | Corporate health plan admin for their company only |

---

## 2. Module-Level Access Matrix

✅ Full access · 📖 Read-only · 🔒 No access · ✏️ Limited write

| Module | patient | receptionist | doctor | nurse | lab_tech | admin | corporate_hr |
|---|---|---|---|---|---|---|---|
| M1 – Appointments | ✅ own | ✅ all | ✅ own | 📖 assigned | 🔒 | ✅ all | 🔒 |
| M2 – Patient CRM | 📖 own | ✅ no-clinical | 📖 clinical | 📖 assigned | 🔒 | ✅ all | 🔒 |
| M3 – WhatsApp Inbox | ✅ own msgs | ✅ full | 📖 | 📖 | 🔒 | ✅ full | 🔒 |
| M4 – Health Plans | 📖 own | ✅ view/assign | 📖 | 🔒 | 🔒 | ✅ full | ✅ own company |
| M5 – Exams & Results | 📖 own | ✅ request | 📖+request | ✅ upload | ✅ worklist+upload | ✅ full | 🔒 |
| M6 – Billing | 📖 own invoices | ✅ create/collect | 📖 | 🔒 | 🔒 | ✅ full | 📖 company bills |
| M7 – Clinical Records | 🔒 | 📖 summary only | ✅ own patients | ✅ assigned | 🔒 | 📖 no-edit | 🔒 |
| M8 – Staff Scheduler | 🔒 | 📖 | 📖 own shifts | 📖 own shifts | 📖 own shifts | ✅ full | 🔒 |
| M9 – Home Visits | ✅ request | ✅ assign | 📖 assigned | ✅ assigned | 🔒 | ✅ full | 🔒 |
| M10 – Analytics | 🔒 | 📖 basic | 📖 own stats | 🔒 | 🔒 | ✅ full | 📖 plan usage |
| Settings / Config | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ✅ full | 🔒 |

---

## 3. Detailed Action-Level Permissions

### 3.1 Appointments (M1)

| Action | patient | receptionist | doctor | nurse | lab_tech | admin |
|---|---|---|---|---|---|---|
| Create appointment (self) | ✅ | ✅ | ✅ | 🔒 | 🔒 | ✅ |
| Create appointment (others) | 🔒 | ✅ | ✅ own schedule | 🔒 | 🔒 | ✅ |
| View appointment list | own only | all | own schedule | assigned | 🔒 | all |
| Update appointment status | cancel own | ✅ | check-in/complete | 🔒 | 🔒 | ✅ |
| Drag-and-drop reschedule | 🔒 | ✅ | own schedule | 🔒 | 🔒 | ✅ |
| View full calendar | 🔒 | ✅ | own view | 🔒 | 🔒 | ✅ |
| Manage waitlist | 🔒 | ✅ | 🔒 | 🔒 | 🔒 | ✅ |
| Configure reminder sequences | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ✅ |

### 3.2 Patient CRM (M2)

| Action | patient | receptionist | doctor | nurse | lab_tech | admin |
|---|---|---|---|---|---|---|
| View own profile | ✅ | — | — | — | — | — |
| Create patient record | 🔒 | ✅ | 🔒 | 🔒 | 🔒 | ✅ |
| Edit patient demographics | 🔒 | ✅ | 🔒 | 🔒 | 🔒 | ✅ |
| View clinical history | 🔒 | summary only | ✅ | assigned visits | 🔒 | ✅ |
| Add manual notes | 🔒 | ✅ | ✅ | ✅ | 🔒 | ✅ |
| Upload documents | 🔒 | ✅ | ✅ | ✅ | ✅ | ✅ |
| View communication log | own | ✅ | 🔒 | 🔒 | 🔒 | ✅ |
| Assign tags | 🔒 | ✅ | ✅ | 🔒 | 🔒 | ✅ |
| Delete patient record | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ✅ (soft) |

### 3.3 Clinical Records (M7)

| Action | patient | receptionist | doctor | nurse | lab_tech | admin |
|---|---|---|---|---|---|---|
| View clinical notes | 🔒 | summary only | own patients | assigned visits | 🔒 | read (no edit) |
| Create SOAP note | 🔒 | 🔒 | ✅ (own patients) | 🔒 | 🔒 | 🔒 |
| Lock note | 🔒 | 🔒 | ✅ auto after 24h | 🔒 | 🔒 | 🔒 |
| Create prescription | 🔒 | 🔒 | ✅ | 🔒 | 🔒 | 🔒 |
| Create referral | 🔒 | 🔒 | ✅ | 🔒 | 🔒 | 🔒 |

### 3.4 Billing (M6)

| Action | patient | receptionist | doctor | nurse | lab_tech | admin |
|---|---|---|---|---|---|---|
| View own invoices | ✅ | — | — | — | — | — |
| Create invoice | 🔒 | ✅ | 🔒 | 🔒 | 🔒 | ✅ |
| Record payment | 🔒 | ✅ | 🔒 | 🔒 | 🔒 | ✅ |
| Issue credit/refund | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ✅ |
| View revenue reports | 🔒 | 🔒 | own consultations | 🔒 | 🔒 | ✅ |
| Export to Excel/PDF | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ✅ |

---

## 4. Data Isolation Rules

### 4.1 Clinical Data Isolation
- Doctors can only access clinical notes for patients assigned to their appointments
- Exception: `admin` can read (not edit) all clinical records for auditing
- Notes are locked 24 hours after creation — only `admin` can unlock

### 4.2 Corporate HR Isolation
- `corporate_hr` users see only members and utilisation data for their own company
- Filter enforced at the API query level: `WHERE company_id = :user.company_id`
- Billing access limited to corporate plan invoices, not individual patient invoices

### 4.3 Patient Self-Service Isolation
- `patient` users have a strict row-level security filter on `patient_id = auth.patient_id`
- Cannot access other patients' data under any circumstance
- Exam result download links are token-based, expiring, and logged

---

## 5. Keycloak Configuration

### 5.1 Realm: `maissaude`

```json
{
  "realm": "maissaude",
  "enabled": true,
  "internationalizationEnabled": true,
  "supportedLocales": ["pt", "en"],
  "defaultLocale": "pt",
  "passwordPolicy": "length(10) and upperCase(1) and digits(1)",
  "bruteForceProtected": true,
  "failureFactor": 5,
  "waitIncrementSeconds": 60
}
```

### 5.2 Client: `api-server`

```json
{
  "clientId": "api-server",
  "protocol": "openid-connect",
  "publicClient": false,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": true
}
```

### 5.3 Client: `web-app`

```json
{
  "clientId": "web-app",
  "protocol": "openid-connect",
  "publicClient": true,
  "redirectUris": [
    "https://app.maissaudecv.com/*",
    "https://maissaudecv.com/*"
  ],
  "webOrigins": ["+"]
}
```

### 5.4 Role Mapper

Each role in Keycloak maps to a NestJS guard check:

```typescript
// NestJS decorator usage
@Roles('doctor', 'admin')
@Get('/patients/:id/clinical-notes')
getClinicalNotes(@Param('id') patientId: string) { ... }
```

---

## 6. MFA Policy

| Role | MFA Required | Method |
|---|---|---|
| admin | ✅ Mandatory | TOTP (Google Authenticator) |
| doctor | ✅ Mandatory | TOTP |
| receptionist | 🔶 Recommended | TOTP |
| nurse / lab_tech | 🔶 Recommended | TOTP |
| patient | 🔷 Optional | SMS OTP |
| corporate_hr | ✅ Mandatory | TOTP |

---

*Mais Saúde 360 · Roles & Permissions v1.0 · June 2026*
