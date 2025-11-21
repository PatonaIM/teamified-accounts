# PO Validation & Sharded Backlog — Teamified EOR Portal (MVP)

**Owner:** Product Owner (Teamified)  
**Date:** 28 Aug 2025 (AEST)  
**Sources:** Project Brief v1, PRD Draft 0, Front‑End Spec (Draft 0), Full‑Stack Architecture (Draft 0)

---

## 0) Summary & Guiding Principles
- **Outcome:** Replace Zoho People for core flows (invites/onboarding, profile & CV, timesheets, leave, payslips/HR docs) and enable efficient Ops administration.  
- **Guardrails:** Ship a high‑quality MVP by **Q4 2025** with a **modular monolith** back end, secure document delivery, and strong a11y.  
- **Scope discipline:** Prioritize P0 only; defer payroll calculations, deep country packs, SSO/MFA to P1/P2.

---

## 1) Definition of Ready (DoR)
A story is **Ready** when: problem statement clear, acceptance criteria written, UX spec or wireframes linked (if UI), data model/API touched identified, non‑functionals noted, and test data defined.

## 2) Definition of Done (DoD)
- Code reviewed, unit/integration tests passing (coverage threshold agreed), a11y checks pass (keyboard nav + contrast + screen reader labels).  
- API conforms to OpenAPI, error model (RFC7807), and logs structured.  
- Feature behind a flag if risky; analytics + audit events wired; docs updated.

---

## 3) MVP Scope (P0 Recap)
- Invitations & onboarding  
- Profile & CV  
- Timesheets (weekly)  
- Leave requests  
- Payslips & HR documents (publish + view/download)  
- Clients & single active assignment model  
- Approvals (timesheets/leave)  
- Notifications (email + basic in‑app)  
- Admin Console basics (people, invites, docs, approvals)  
- Security, audit, country basics (IN/LK/PH)

---

## 4) Epic A — Invitations & Onboarding
**Goal:** Allow Ops to invite EOR/Admin; EOR accepts, verifies email, sets password, and completes basic profile.

- **A1. Create invite (Ops)** — *API + Admin UI*  
  **AC:** Given first/last, email, country, client, role → when submitted → then an invite with one‑time token valid **7 days** is created, email sent, audit written.  
  **Notes:** Idempotency via `Idempotency-Key`.  
  **Est.:** 5 SP  
  **Deps:** Email provider, Audit module.

- **A2. Resend/Revoke invite (Ops)** — *API + Admin UI*  
  **AC:** Resend regenerates token, extends expiry; Revoke invalidates; both audit.  
  **Est.:** 3 SP

- **A3. Accept invite (EOR/Admin)** — *Public UI*  
  **AC:** One‑time token → set password (policy), verify email, log in; redirect to first‑run checklist.  
  **Est.:** 5 SP  

- **A4. First‑run checklist (EOR)** — *App UI*  
  **AC:** Prompt to complete profile (required fields), upload CV (optional), acknowledge handbook (optional).  
  **Est.:** 3 SP

**Release criteria (Epic A):** Invite→Accept funnel ≥90% within 14 days.

---

## 5) Epic B — Profile & CV
**Goal:** EOR can maintain personal/contact data and CV with version history; Ops sees read‑only in Admin.

- **B1. Edit profile (EOR)** — *API + App UI*  
  **AC:** Edit legal/preferred name, email, phone, address, country, timezone; country‑aware validation; audit on save.  
  **Est.:** 5 SP

- **B2. CV upload & versioning (EOR)** — *API + App UI + Storage*  
  **AC:** Upload PDF/DOCX ≤10MB; virus‑scan queued; version marked current; download previous versions.  
  **Est.:** 5 SP  
  **Deps:** Storage, Virus scanning job.

- **B3. View profile (Ops)** — *Admin UI*  
  **AC:** Read‑only view; deep link to documents and assignment.  
  **Est.:** 2 SP

---

## 6) Epic C — Timesheets (Weekly)
**Goal:** Capture and approve weekly hours per EOR.

- **C1. Create/Submit timesheet (EOR)** — *API + App UI*  
  **AC:** One sheet per week (country week start); hours 0–24 step 0.5; notes ≤500; statuses Draft→Submitted→Approved/Rejected; prevent duplicates.  
  **Est.:** 8 SP

- **C2. Approve/Reject timesheets (Ops)** — *API + Admin UI*  
  **AC:** Bulk approve; per‑row comment; export approved to CSV; audit decision.  
  **Est.:** 5 SP

- **C3. Reminders** — *Jobs*  
  **AC:** Day‑before and due‑day reminders to Draft/empty; analytics event emitted.  
  **Est.:** 3 SP

---

## 7) Epic D — Leave Management
**Goal:** Simple leave requests with approval and conflict prevention.

- **D1. Request/Cancel leave (EOR)** — *API + App UI*  
  **AC:** Types: Annual/Sick/Other; date range; optional note; no overlap with approved leave; cancel allowed pre‑start.  
  **Est.:** 5 SP

- **D2. Approve/Reject leave (Ops)** — *API + Admin UI*  
  **AC:** Conflict warning if overlapping; decision comment; audit.  
  **Est.:** 3 SP

---

## 8) Epic E — Documents (Payslips & HR Docs)
**Goal:** Secure doc distribution and viewing.

- **E1. Publish HR docs (Ops)** — *API + Admin UI + Storage*  
  **AC:** Upload PDF; target by user/client/country; optional notify; versioning for HR docs; audit publish.  
  **Est.:** 5 SP

- **E2. View/download payslips (EOR)** — *API + App UI + Storage*  
  **AC:** List by period; secure signed URL; only own payslips.  
  **Est.:** 3 SP

- **E3. Delivery log (Ops)** — *Admin UI*  
  **AC:** Show publish target and notification status (success/fail).  
  **Est.:** 3 SP

---

## 9) Epic F — Clients & Assignments
**Goal:** Maintain exactly one **active** client per EOR, with transitions.

- **F1. Assign EOR to client (Ops)** — *API + Admin UI*  
  **AC:** Start date required; system enforces at most one active; historical view retained.  
  **Est.:** 5 SP

- **F2. Transition between clients (Ops)** — *API + Admin UI*  
  **AC:** Requires end date for current + start date for next; block overlaps; warn if open timesheets in transition week.  
  **Est.:** 5 SP

---

## 10) Epic G — Approvals Hub (Admin)
- **G1. Timesheets queue** — bulk actions, comments, export. (linked to C2) — 2 SP (UI shell)  
- **G2. Leave queue** — conflicts + comments. (linked to D2) — 2 SP (UI shell)

---

## 11) Epic H — Notifications & In‑App Alerts
- **H1. Email templates** — Invite, reminder day 3, expiry day 7, timesheet due, leave status. — 3 SP  
- **H2. In‑app bell + toasts** — Respect reduced motion; unread dot; basic preferences page. — 3 SP

---

## 12) Epic J — Security, Auth, Audit (Cross‑Cutting)
- **J1. AuthN/AuthZ** — JWT access + refresh; RBAC middleware; password policy; rate limits. — 8 SP  
- **J2. Audit logging** — Invites, logins, profile edits, assignments, approvals, document actions, settings. — 5 SP  
- **J3. Virus scanning** — Async scan for uploads; quarantine on fail. — 5 SP

---

## 13) Epic K — Settings & Country Config
- **K1. Country basics (IN/LK/PH)** — week start, date formats, timezone defaults. — 3 SP  
- **K2. Admin settings UI** — roles, countries, email templates. — 5 SP

---

## 14) Epic M — Data Migration (Zoho → Portal)
- **M1. Field mapping & sample export** — define mapping; normalize phones/addresses. — 3 SP  
- **M2. Import CLI (dry‑run + validate)** — produces report of rejects/fixes. — 5 SP  
- **M3. Pilot cohort import** — seed Admins → pilot EORs; reconcile counts. — 3 SP  
- **M4. Full import & cutover plan** — checklist, rollback procedure. — 3 SP

---

## 15) Epic N — Observability & DevEx
- **N1. Structured logs + tracing (OTel)** — 3 SP  
- **N2. Metrics & dashboards** — latency, error rate, job success, storage failures. — 3 SP  
- **N3. Error pages & support links** — user‑friendly failures. — 2 SP

---

## 16) P1/P2 (Post‑MVP) Parking Lot
- **Reporting/Exports (P1):** CSV exports with filters for timesheets/leave/roster.  
- **SSO/MFA (P2), deeper country packs (P2), holiday calendars (P2), mobile polish (P1).**

---

## 17) Traceability Matrix (PRD ⇄ Epics ⇄ Stories)
| PRD Feature | Epic | Stories |
|---|---|---|
| Invitations & Onboarding | A | A1–A4 |
| Profile & CV | B | B1–B3 |
| Timesheets | C | C1–C3 |
| Leave | D | D1–D2 |
| Documents (Payslips/HR) | E | E1–E3 |
| Clients & Assignments | F | F1–F2 |
| Approvals | G | G1–G2 |
| Notifications | H | H1–H2 |
| Auth, Audit, Security | J | J1–J3 |
| Settings & Country | K | K1–K2 |
| Migration | M | M1–M4 |
| Observability/DevEx | N | N1–N3 |

---

## 18) Sprint Plan (Draft)
Assume 2‑week sprints, team capacity ≈ **30–35 SP**/sprint (backend+frontend). Order optimizes dependencies.

- **Sprint 1:** J1 AuthN/AuthZ (base), K1 Country basics, N1 Logs/tracing, A1 Create invite. *(~30)*  
- **Sprint 2:** A2 Resend/Revoke, A3 Accept invite, A4 First‑run checklist, B1 Edit profile. *(~32)*  
- **Sprint 3:** B2 CV upload/versioning, B3 View profile (Ops), C1 Timesheet create/submit (user side). *(~33)*  
- **Sprint 4:** C2 Approvals (timesheets), C3 Reminders, F1 Assign to client, K2 Admin settings UI. *(~31)*  
- **Sprint 5:** D1 Request/cancel leave, D2 Approvals (leave), F2 Transition client, H1 Email templates. *(~33)*  
- **Sprint 6:** E1 Publish HR docs, E2 Payslips view, E3 Delivery log, H2 In‑app notifications, J2 Audit logging, J3 Virus scan. *(~34)*  
- **Hardening/Pilot:** M1–M4 Migration tasks, N2 Metrics/dashboards, bugfix, a11y/contrast passes, perf polish. *(time‑boxed)*

**Critical path:** J1 → A1/A3 → B1 → C1 → C2 → F1 → D1/D2 → E1/E2 → M3 pilot.

---

## 19) QA & UAT Strategy
- **Story‑level BDD examples (samples):**  
  **Invites:** *Given* an Ops Admin with role, *when* they submit a valid invite, *then* a one‑time link is emailed and audit recorded.  
  **Timesheets:** *Given* an EOR with no sheet for week X, *when* they submit hours totalling ≤84, *then* status becomes Submitted and a reminder is cancelled.  
  **Assignments:** *Given* an EOR with an active client, *when* Ops schedules a transition with overlapping dates, *then* the system blocks it and explains why.
- **Test data:** Seed fixtures for IN/LK/PH users; two clients; sample payslips; holiday placeholders.
- **Non‑functional tests:** Load test create/submit timesheet, signed URL access, invite acceptance funnel.

---

## 20) Risk Register (PO View)
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Payslip source/process unclear | M | H | Treat as doc distribution MVP; define provider interface early (E1/E2). |
| Zoho export quality | M | M | Run M1 early; dry‑run import (M2) with error report. |
| Country compliance variance | M | H | Ship K1 basics; capture deltas for P2 packs. |
| Low EOR adoption | M | M | First‑run checklist, mobile‑first UX, reminders (C3,H1/H2). |
| Security gaps | L | H | Pen‑test pre‑GA; complete J1–J3; review ASVS items. |

---

## 21) Open Decisions (Proposed Defaults)
- **Approver:** Ops Admin is the approver for both timesheets and leave (client approver = P1).  
- **Email provider:** Use a single ESP (TBD) with sender domain + DKIM/SPF.  
- **Payslip ingestion:** Secure file upload by Ops (connector future).  
- **Data residency:** Single region to start; revisit after MVP pilot.  
- **SSO/MFA:** Defer to P2; use email+password + lockout rules at MVP.

---

## 22) Backlog Export (Ready‑to‑Import)
**Format:** `Key, Title, Type, Epic, Estimate, Acceptance Criteria` (CSV) — can be generated on request from this document.

**Example rows:**
- `A1, Create invite, Story, Invitations & Onboarding, 5, Given Ops provides required fields…`  
- `C1, Create/Submit timesheet, Story, Timesheets, 8, Given an EOR without a sheet for week…`  
- `F2, Transition between clients, Story, Clients & Assignments, 5, Given an active assignment…`

---

## 23) Go/No‑Go Checklist for MVP
- All P0 stories complete and behind feature flags where needed.  
- Invite→Accept≥90%; Timesheet submit rate≥95%; Leave via portal≥90%.  
- Uptime target hit in staging; pen‑test issues triaged; migration pilot complete.  
- Support runbooks + on‑call rotation prepared; analytics dashboards green.

