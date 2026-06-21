# Mais Saúde 360 — Security & Compliance

> **Version:** 1.0 · **Date:** June 2026
> Healthcare data security requirements for Cabo Verde context, with LGPD (Brazil) as compliance reference.

---

## 1. Threat Model

| Threat | Likelihood | Impact | Primary Control |
|---|---|---|---|
| Unauthorised access to clinical records | Medium | Critical | RBAC + MFA + audit log |
| Patient data breach (DB exfiltration) | Low | Critical | Encryption at rest + VPC isolation |
| WhatsApp message interception | Low | High | TLS in transit; end-to-end via Meta |
| Exam result link abuse | Medium | High | Token expiry (72h) + access logging |
| Brute-force login | Medium | Medium | Keycloak lockout policy + rate limiting |
| SQL injection | Low | Critical | Prisma parameterised queries; no raw SQL |
| Insider threat (staff) | Low | High | Audit log; RBAC; role-minimum access |
| Account takeover | Low | High | MFA for admin/doctor; TOTP |

---

## 2. Authentication

### 2.1 Keycloak Configuration

- **Realm:** `maissaude`
- **Password policy:** min 10 chars, 1 uppercase, 1 digit
- **Brute force protection:** 5 failed attempts → 60-second lockout (exponential backoff)
- **Session timeout:** 8 hours (active); 15 minutes (idle)
- **Refresh token rotation:** enabled

### 2.2 JWT Tokens

- **Algorithm:** RS256 (asymmetric — Keycloak signs; API verifies with public key)
- **Access token TTL:** 15 minutes
- **Refresh token TTL:** 8 hours
- Tokens carry: `sub` (user ID), `realm_access.roles`, `email`, `patient_id` (for patient role)

### 2.3 Multi-Factor Authentication (MFA)

| Role | Requirement | Method |
|---|---|---|
| admin | Mandatory | TOTP (Google Authenticator / Authy) |
| doctor | Mandatory | TOTP |
| receptionist | Recommended | TOTP |
| nurse / lab_tech | Recommended | TOTP |
| patient | Optional | SMS OTP |
| corporate_hr | Mandatory | TOTP |

---

## 3. Authorisation (RBAC)

- All API routes decorated with `@Roles(...)` guard in NestJS
- Role claims extracted from JWT; no database lookup per request
- Resource-level isolation enforced in service layer (not just route level)
- Admin actions that bypass normal restrictions are logged with `is_admin_override: true` in audit log

See `ROLES-PERMISSIONS.md` for full permission matrix.

---

## 4. Encryption

### 4.1 Data at Rest

| Data | Encryption |
|---|---|
| PostgreSQL database | AES-256 via Hetzner/AWS volume encryption |
| Redis cache | In-memory only; no sensitive data persisted to disk beyond session |
| R2 file storage | AES-256 server-side encryption (Cloudflare R2 default) |
| Backup files | AES-256 encrypted before upload to S3/R2 |

### 4.2 Data in Transit

- All external communications: TLS 1.3
- Internal service-to-service (within K8s cluster): mutual TLS (mTLS) enforced via service mesh (Linkerd or Istio)
- Database connections: `sslmode=require` in PostgreSQL connection string
- Redis: TLS enabled; auth password required

### 4.3 Sensitive Fields

The following fields are encrypted at the application layer (in addition to disk encryption) using AES-256-GCM before storage:

- `patients.nif`
- `patients.date_of_birth`
- `clinical_notes.*` (all fields)
- `prescriptions.*`

Encryption key stored in HashiCorp Vault (never in environment variables directly).

---

## 5. API Security

### 5.1 Rate Limiting

| Endpoint Group | Limit | Tool |
|---|---|---|
| Public (booking widget) | 60 req/min per IP | Redis-backed rate limiter |
| Authenticated API | 300 req/min per user | Redis-backed rate limiter |
| Auth endpoints | 10 req/min per IP | Keycloak + NGINX |
| WhatsApp webhook | 1000 req/min | No IP limit (Meta IPs whitelisted) |

### 5.2 Input Validation

- All request bodies validated via `class-validator` DTOs in NestJS
- Prisma parameterised queries for all DB operations (no raw SQL)
- File uploads: MIME type validation server-side; virus scan via ClamAV on upload

### 5.3 CORS

- Allowed origins: `https://maissaudecv.com`, `https://app.maissaudecv.com`
- Methods: GET, POST, PATCH, DELETE, OPTIONS
- Credentials: true (for JWT cookie handling)

### 5.4 HTTPS & Headers

NGINX enforces:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "default-src 'self'; ..." always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## 6. Audit Logging

Every sensitive action is written to `audit_log`:

| Action Type | Logged Fields |
|---|---|
| Patient record viewed | staff_id, patient_id, timestamp, IP |
| Clinical note created/edited | staff_id, note_id, before/after values |
| Prescription created | staff_id, patient_id |
| Admin role escalation | staff_id, resource, reason |
| Login success/failure | user_id, IP, timestamp |
| File downloaded (exam result) | token, IP, timestamp |
| Invoice created/modified | staff_id, invoice_id, delta |
| Patient record deleted | staff_id, patient_id, reason |

Audit logs are:
- Append-only (no update/delete operations on `audit_log` table)
- Retained for 7 years (regulatory requirement)
- Exportable for compliance audits

---

## 7. Patient Data Privacy (LGPD-aligned)

### 7.1 Consent

- Explicit consent form signed at registration (stored as patient document)
- Consent records: purpose, date, version
- Separate consent for: data processing, marketing communications, data sharing

### 7.2 Data Subject Rights

| Right | Implementation |
|---|---|
| Right to access | Admin exports full patient data as JSON/PDF on request |
| Right to rectification | Patient can request corrections; receptionist applies |
| Right to erasure | Soft-delete clears PII; billing records retained (legal) |
| Right to portability | JSON export of all patient data |
| Right to withdraw consent | Unsubscribe from communications; restrictions applied |

### 7.3 Data Minimisation

- Only collect data necessary for clinical care and billing
- Optional fields (NIF, nationality) only requested when needed (e.g., invoice generation)
- Marketing tracking (booking source) anonymised in analytics

---

## 8. WhatsApp Security

- Webhook verify token validated on every incoming webhook
- Inbound messages processed asynchronously — webhook returns 200 immediately
- Meta-approved templates only for outbound messages outside 24h window
- No patient clinical data included in WhatsApp messages (links only)
- Download links are tokens — not direct S3 URLs

---

## 9. File Security

- All files stored in Cloudflare R2 (not publicly accessible by default)
- Patient access via signed URLs (time-limited, 72 hours)
- Staff access via presigned URLs generated server-side on request
- File access logged in `audit_log`
- Bucket policy: no public read; only authenticated service account can write

---

## 10. Infrastructure Security

- PostgreSQL accessible only from within the private VPC (not publicly exposed)
- Redis accessible only from within the private VPC
- Keycloak admin console behind VPN or IP allowlist
- SSH access to servers via key pairs only (no password auth)
- Automatic OS security patches enabled
- Docker images: non-root user; read-only filesystem where possible
- Dependency scanning via Snyk or GitHub Dependabot on CI/CD

---

## 11. Incident Response

1. Detect — Sentry alert or Grafana anomaly triggers PagerDuty notification
2. Contain — Revoke compromised tokens; block IPs; take affected service offline if needed
3. Assess — Review audit logs; determine scope
4. Notify — Inform clinic management within 1 hour; patients within 72 hours if data exposed
5. Remediate — Patch, rotate credentials, deploy fix
6. Post-mortem — Document timeline, root cause, and prevention measures

See also: Cabo Verde data protection authority notification requirements (consult local legal counsel).

---

*Mais Saúde 360 · Security & Compliance v1.0 · June 2026*
