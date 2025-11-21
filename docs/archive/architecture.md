# Full‑Stack Architecture — Teamified EOR Portal (v1 patched)

**Audience:** Architect, Backend, Front‑End, DevOps, Security, QA, PM\
**Inputs:** Project Brief v1, PRD Draft 0, Front‑End Spec Draft 0\
**Date:** 28 Aug 2025 (AEST)

> This version patches the Draft 0 with: (a) **Notifications API routes**, (b) **Delivery log** guidance, and (c) **terminology** note (UI “Ops Admin” vs code `OpsAdmin`).

---

## 0) Executive Summary & Key Decisions

- **Goal:** Replace Zoho People with an in‑house EOR portal for profiles/CV, timesheets, leave, payslips/docs, and admin controls.
- **Architecture approach:** **Modular Monolith** for MVP (keeps deployment simple; clear module boundaries for later extraction).
- **Stack:** TypeScript **Node.js** (NestJS) • **PostgreSQL 15+** • **Redis** (cache/queues) • **S3‑compatible object storage** for documents • **OpenAPI** for REST v1 • **Playwright/Jest** for tests.
- **Security defaults:** Argon2 password hashing • JWT (short‑lived) + Refresh tokens • RBAC • Audit logging • Signed URLs for documents • HTTPS only • OWASP ASVS‑guided controls.
- **Tenancy model:** Single Teamified org; **Clients** act as tenants for scoping EOR assignments and data access.
- **Country scope:** India, Sri Lanka, Philippines at MVP; country‑aware date/week formatting and settings.

---

## 1) NFRs & Constraints

- **Availability:** 99.9% monthly uptime.
- **Performance:** P95 < 300ms for read APIs; P95 < 600ms for write APIs (excluding file uploads).
- **Scale assumption (MVP):** \~1–2k EORs, \~50–200 Admins, weekly peaks on timesheet submission.
- **Security/Privacy:** PII encryption in transit/at rest; least‑privilege access; immutable payslip files; audit of sensitive actions.
- **Cost:** Prefer managed Postgres/object storage; single region to start (data residency TBD).

---

## 2) System Context

**Actors:** EOR, Ops Admin, System Admin.\
**External systems:** Email provider (SMTP/ESP), Object Storage (S3‑compatible), Payroll doc source (manual upload or connector), (Future) SSO/IdP.\
**Data sources:** Zoho People export (one‑time migration).

---

## 3) High‑Level Architecture

```
[Web App (SPA)] ──REST/JSON──> [API Gateway / NestJS App]
                               |-- Module: Auth & Users
                               |-- Module: Profiles & CV
                               |-- Module: Invitations
                               |-- Module: Timesheets
                               |-- Module: Leave
                               |-- Module: Documents (Payslips/HR)
                               |-- Module: Clients & Assignments
                               |-- Module: Approvals
                               |-- Module: Reporting/Exports (P1)
                               |-- Module: Settings (Countries/Roles/Email Templates)
                               |-- Module: Audit & Admin
                               |
                               |-- PostgreSQL (primary)
                               |-- Redis (cache + BullMQ queues)
                               |-- Object Storage (S3)
                               |-- Email Provider
```

**Communication:** REST/JSON over HTTPS. Internal jobs and notifications via **BullMQ** (Redis).\
**Docs:** OpenAPI spec auto‑generated; Postman collection published; JSON Schema for payloads.

---

## 4) Domain Model

**Core entities:** User, Role, Session, EORProfile, Client, Assignment, Invitation, Timesheet, TimesheetEntry, LeaveRequest, Document, Payslip (Document subtype), CountryConfig, AuditLog, Notification, EmailTemplate.

**ERD (ASCII):**

```
User (id) 1─1 EORProfile (id?)
User (id) 1─* Session
User (id) *─* Role (via UserRole)
EORProfile (id) 1─* Assignment (*exactly one active period; no overlaps*)
EORProfile 1─* Timesheet 1─* TimesheetEntry
EORProfile 1─* LeaveRequest
EORProfile 1─* Document (includes Payslip)
Client (id) 1─* Assignment
CountryConfig (code) 1─* User/EORProfile (by reference)
AuditLog links to User and entity via (entity_type, entity_id)
```

**PostgreSQL constraint for single active client assignment:**

```sql
-- Prevent overlapping client assignments per EOR across time
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  eor_id UUID NOT NULL REFERENCES eor_profiles(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  period DATERANGE NOT NULL, -- [start, end) with end optional for current
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);
-- Exclude overlapping periods for the same EOR
CREATE INDEX assignments_eor_period_gist ON assignments USING gist (eor_id, period);
ALTER TABLE assignments
  ADD CONSTRAINT assignments_no_overlap
  EXCLUDE USING gist (eor_id WITH =, period WITH &&);
```

---

## 5) Tenancy, RBAC & Authorization

- **Tenancy:** Global org (Teamified). Data is partitioned by **Client** for roster/assignment; EOR self‑service is scoped to their own record; Admins are scoped to all clients or selected clients (future enhancement: client‑scoped admin).
- **Roles (MVP):** `EOR`, `OpsAdmin`, `SystemAdmin`.
- **Terminology:** UI copy uses **“Ops Admin”**; code/roles use `OpsAdmin`.
- **Policy examples:**
  - EOR may **only** read/update own profile, CV, timesheets, leave, documents.
  - OpsAdmin may invite users, manage assignments, view/approve timesheets/leave, publish documents, run exports.
  - SystemAdmin can configure countries/roles/templates and view audit logs.
- **Enforcement:** Route guards in API; field‑level checks; query filters by `client_id` and `user_id`.
- **Data filtering pattern:** Use repository helpers to auto‑inject `WHERE` scopes based on role/context.

---

## 6) API Design (REST v1)

**Principles:**

- Resource‑oriented URIs; nouns; plural collections.
- Pagination = `page` + `pageSize`; sorting via `sort` (e.g., `-createdAt`).
- Filtering via query params (e.g., `?clientId=…&country=IN&status=Submitted`).
- Idempotency for POST of invitations and document publishes via `Idempotency-Key` header.
- Error model: RFC 7807 `application/problem+json`.

**Top‑level routes (samples)**

```
POST   /v1/auth/login
POST   /v1/auth/refresh
POST   /v1/auth/logout

GET    /v1/users/me
PATCH  /v1/users/me           (update profile subset)

POST   /v1/invitations        (Ops)  
GET    /v1/invitations        (Ops)  
POST   /v1/invitations/:id/resend (Ops)
DELETE /v1/invitations/:id    (Ops)

GET    /v1/timesheets         (EOR/Ops)
POST   /v1/timesheets         (EOR)
GET    /v1/timesheets/:id
PATCH  /v1/timesheets/:id     (EOR pre‑approval)
POST   /v1/timesheets/:id/submit (EOR)
POST   /v1/timesheets/:id/approve (Ops)
POST   /v1/timesheets/:id/reject  (Ops)

GET    /v1/leave              (EOR/Ops)
POST   /v1/leave              (EOR)
POST   /v1/leave/:id/approve  (Ops)
POST   /v1/leave/:id/reject   (Ops)

GET    /v1/documents/payslips (EOR self)
GET    /v1/documents/hr       (EOR self)
POST   /v1/documents/publish  (Ops)

GET    /v1/clients/:id/roster (Ops)
POST   /v1/assignments        (Ops)
POST   /v1/assignments/:id/transition (Ops)

GET    /v1/reports/…          (Ops, P1)
GET    /v1/audit              (SystemAdmin)
GET    /v1/settings/countries (SystemAdmin)

GET    /v1/notifications      (EOR/Ops)
PATCH  /v1/notifications/:id/read
PATCH  /v1/notifications/read-all
GET    /v1/users/me/notification-preferences
PATCH  /v1/users/me/notification-preferences

GET    /v1/documents/publishes (Ops)  -- optional; can also be derived via /v1/audit filters
```

**OpenAPI example (excerpt)**

```yaml
openapi: 3.1.0
info: { title: Teamified API, version: 1.0.0 }
paths:
  /v1/invitations:
    post:
      summary: Create an invitation
      headers:
        Idempotency-Key: { schema: { type: string }, required: false }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [firstName, lastName, email, country, role, clientId]
              properties:
                firstName: { type: string, maxLength: 100 }
                lastName:  { type: string, maxLength: 100 }
                email:     { type: string, format: email }
                country:   { type: string, enum: [IN, LK, PH] }
                role:      { type: string, enum: [EOR, Admin] }
                clientId:  { type: string, format: uuid }
      responses:
        '201': { description: Created }
        '400': { $ref: '#/components/responses/BadRequest' }
        '409': { description: Conflict }
```

---

## 7) Authentication & Sessions

- **Flow:** Email + password (MVP) with email verification on invite acceptance.
- **Tokens:** JWT access (15 min) + refresh (30 days, rotation, revocation on use).
- **Password hashing:** Argon2id with memory‑hard params.
- **Brute‑force protection:** Rate limiting by IP + account; incremental backoff.
- **CORS/CSRF:** For SPA with cookies, enable SameSite=Lax and anti‑CSRF token; or use Authorization header with local storage (recommended: cookies + CSRF).
- **Sessions table** stores refresh token family with device metadata.

---

## 8) Documents & Storage

- **Buckets/Prefixes:**
  - `payslips/{eorId}/{yyyy-mm}.pdf` (immutable)
  - `hr-docs/{docId}.pdf` (versioned)
  - `cv/{eorId}/{versionId}.pdf|docx`
- **Access:** Server‑generated, short‑lived **signed URLs**; enforce ownership/role checks.
- **Virus scanning:** Async scan on upload; quarantine on fail.
- **Metadata:** Content type, size, SHA‑256 checksum, tags (clientId, country, period).
- **Retention:** Payslips immutable; HR docs versioned; CVs retain N latest versions (configurable).

---

## 9) Timesheets Module

- **Model:** `Timesheet { id, eorId, weekStartDate, status, totalHours }`; `TimesheetEntry { day, hours, note }`.
- **Status machine:** Draft → Submitted → Approved|Rejected.
- **Rules:** Week start by `CountryConfig`; prevent overlapping/duplicate week per EOR.
- **Reminders:** Jobs run weekly to nudge Draft/empty weeks; due‑day reminder job.
- **Exports:** Approved rows exportable to CSV (streaming).

---

## 10) Leave Module

- **Model:** `LeaveRequest { id, eorId, type, startDate, endDate, note, status }`.
- **Status:** Draft → Submitted → Approved|Rejected; cancellation allowed pre‑start.
- **Conflicts:** Prevent overlap with existing approved leave; warn on timesheet impacts.
- **Balances:** MVP optional; show policy text if balances unavailable.

---

## 11) Invitations & Onboarding

- **Create invite:** Ops provides first/last, email, country, client, role.
- **Token:** One‑time, **7‑day** expiry; resend regenerates; all actions audited.
- **Acceptance:** User sets password, verifies email, completes profile checklist.
- **Abuse:** Throttle resends; soft‑delete invites after expiry window (e.g., 30 days).

---

## 12) Audit Logging

- **Event schema:** `{ id, at, actorUserId, actorRole, action, entityType, entityId, changes?, ip, userAgent }`.
- **Coverage:** Invites, logins, profile updates, assignments, approvals, document publish/download, settings changes.
- **Delivery log:** The Admin UI reads from **AuditLog** (filter by `entityType=Document` and actions `publish`/`notify`) to display document delivery status. Optionally expose a thin read API `GET /v1/documents/publishes` as a convenience over audit queries.
- **Access:** SystemAdmin (read) + OpsAdmin (read subset).
- **Retention:** 13 months (TBD); export to cold storage periodically.

---

## 13) Reporting & Exports (P1)

- Server‑side CSV generation (streaming) for timesheets/leave/roster with filters (date range, client, country).
- Job‑based for large datasets; downloadable via signed URL.

---

## 14) Internationalization & Country Config

- **CountryConfig:** `{ code, name, weekStart (Mon/Sun), dateFormat, timezoneDefault, holidayCalendarId? }`.
- **Formatting:** Front‑end uses locale hints; back‑end validates week boundaries per country.

---

## 15) Data Migration (Zoho → Portal)

- **Mapping:** Email, personal/contact fields, country, current client, timesheet history (recent N weeks), leave history (optional), payslips (file import).
- **Tooling:** Import CLI with **dry‑run** and validation reports; field normalization (phone E.164, addresses).
- **Stages:** Admins → pilot EOR cohort → full import.
- **Reconciliation:** Dashboard to compare counts and sample records.

---

## 16) Deployment Topology

```
[Client SPA]
   |
[API App (NestJS)]  <—>  [PostgreSQL]
   |  \__ BullMQ Jobs <—> [Redis]
   |  \__ Object Storage (S3)
   \__ Email Provider (ESP)
```

- **Environments:** Dev, Staging, Prod.
- **Images:** Docker; run 2–3 replicas behind LB; sticky sessions **not** required (JWT).
- **Migrations:** Run via CI before app rollout; use zero‑downtime patterns.

---

## 17) Observability

- **Logging:** Structured JSON (request/response IDs, userId, role, clientId).
- **Tracing:** OpenTelemetry (HTTP spans, job spans).
- **Metrics:** Latency, error rate, queue depth, job success/fail, storage failures.
- **Dashboards/Alerts:** P95 latency, 5xx rate, login failures, invite send failures.

---

## 18) CI/CD Pipeline

- **CI:** Lint (ESLint), typecheck (tsc), unit tests (Jest), API contract tests, DB migration dry‑run.
- **Security:** SCA, secret scanning, Docker image scan.
- **CD:** Staging deploy on main; smoke tests; manual approval to Prod; feature flags for risky features.

---

## 19) Data Retention & Privacy

- **User deletion:** Soft‑delete EOR on offboarding; retain audit/docs per policy.
- **Documents:** Payslips immutable; HR docs versioned; CVs keep last N versions.
- **Backups:** PITR for Postgres; daily object storage lifecycle to IA tier.
- **DPO/legal review:** Confirm retention windows per country.

---

## 20) Risks & Mitigations

- **Payroll/payslip integration scope** → Treat as doc distribution; define provider handoff.
- **Zoho data quality** → Early sample exports; mapping table; normalization.
- **Country compliance variance** → Ship base config; add country packs iteratively.
- **Adoption friction** → In‑app guidance, pilot program, reminders.
- **Security gaps** → Pen‑test pre‑GA; fix gates in CI; audit coverage review.

---

## 21) Next Steps

1. Approve architecture decisions (modular monolith, stack, storage).
2. Generate **OpenAPI** for all MVP endpoints and share Postman collection.
3. Detail DB schema (DDL) for all modules; finalize indexes & constraints.
4. Define background jobs (cron schedule) for reminders and cleanup.
5. Build migration CLI & mapping sheet; test with sample Zoho export.
6. Align front‑end client with routes and error model; add QA hooks.

