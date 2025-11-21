# Payroll System PRD (India & Philippines)

**Version:** v0.2\
**Date:** 22 September 2025 (AEST)\
**Owner:** Payroll Systems Project Team\
**Reviewers:** HR/Legal (India, Philippines)

---

## 1. Executive Summary

Teamified requires a **multi-country payroll system** starting with **India** and **Philippines**, integrated with **timesheet and leave management**. The goal is to ensure compliance with statutory requirements, provide employee self-service, and streamline payroll operations across EOR talent.

---

## 2. Objectives

- Automate payroll calculations for India and Philippines.
- Ensure compliance with statutory deductions and reporting.
- **Extend the existing Employee & Client Self‑Service portal** with: (a) **timesheet tracking** and approvals, and (b) **payroll self‑service** (payslips, tax forms/declarations, contributions view).
- Enable scalable, configurable rules for future country expansion.

---

## 3. Scope

### In Scope

- Extend **existing portals** (not net‑new builds):
  - **Employee:** timesheet entry, timesheet history, leave balance view, **payslip download**, **tax declarations** (India TDS proofs), **PH contributions view**.
  - **Client Manager:** **timesheet approvals**, leave approvals, team cost snapshots,&#x20;
  - **HR Manager:** payroll cut‑off alerts, **payslip re‑send**.
- Payroll engine (India & Philippines statutory compliance).
- Timesheet submission, approval workflows, and payroll integration.
- Leave management system with local entitlement rules.
- Compliance reporting (PF/ESI/TDS in India; SSS/PhilHealth/Pag‑IBIG/BIR in PH).

### Out of Scope

- Rebuilding authentication/SSO and base navigation of the portals.
- Complex state‑specific Indian leave encashment beyond configurable rules.
- Third‑party integrations beyond bank file exports (Phase 1).

---

## 4. User Stories

- **As an employee (India/PH)**, I want to submit timesheets and leave requests so my payroll is accurate.
- **As an HR admin**, I want automated statutory deductions so compliance is maintained.
- **As a client manager**, I want to approve timesheets/leave so I can control costs.
- **As finance**, I want automated compliance reports so I can file returns easily.

---

## 5. Functional Requirements

### Payroll Core

- Configure pay cycles (monthly for India, semi-monthly for PH).
- Auto-calculate:
  - India: PF, ESI, PT, TDS, bonus, gratuity.
  - Philippines: SSS, PhilHealth, Pag-IBIG, withholding tax, 13th month.
- Payslip generation with statutory fields.
- Bank-ready disbursement files.

### Timesheets

- Employee self-service entry.
- Overtime calculation (India: 2x rate; PH: 125–200% multipliers).
- Night shift differential (PH: 10% premium).
- Approval workflow (multi-level).
- Export approved timesheets into payroll.

### Leave Management

- Configurable leave types (annual, sick, SIL, maternity, etc.).
- Auto-entitlement accruals (PH: 5 days SIL; India: state rules configurable).
- Carry forward and encashment rules.
- Leave approval workflows.
- Payroll integration (unpaid leave deductions, paid leave credits).

### Compliance & Reporting

- India: PF & ESI monthly, TDS quarterly.
- PH: SSS, PhilHealth, Pag-IBIG monthly; BIR tax returns.
- Configurable dashboards for HR and finance.

### Portals (Enhancements Only)

- **Employee (existing → enhanced):**
  - Submit/edit **timesheets** (daily/weekly) before cut‑off; view approval status.
  - View **leave balances** and accrual forecasts.
  - Download **payslips** (PDF) and year‑to‑date totals.
  - Manage **tax declarations** (India: Section 80C/80D proofs upload & status; PH: update exemption/dependent info); see **PF/ESI/SSS/PhilHealth/Pag‑IBIG** contributions YTD.
  - Receive notifications: submission due, approvals, payroll posted.
- **Client Manager (existing → enhanced):**
  - Approve **timesheets/leave** (single/bulk), with comments and change requests.
  - View **team cost** previews pre‑payroll; export to CSV.
  - Trigger **payslip re‑send** and correct metadata (no edits to net pay).
- **HR/Finance (existing back‑office):**
  - Configure country rules, cut‑offs, calendars, and statutory tables.
  - Run payroll, lock periods, publish payslips, generate remittances.

---

## 6. Non-Functional Requirements

- **Scalability:** Support additional countries in future.
- **Security & Privacy:** Role‑based access, field‑level permissions (employee sees own data; client sees their assigned workers), encryption at rest/in transit.
- **Auditability:** Immutable audit log for timesheet edits, approvals, payroll locks, payslip publishes.
- **Availability:** 99.9% uptime target.
- **Performance:** Payroll processing < 2 minutes for 1,000 employees; portal page loads < 2s P95.
- **Compliance:** GDPR and local data privacy laws.

---

- **Scalability:** Support additional countries in future.
- **Security:** Role-based access, encrypted data.
- **Availability:** 99.9% uptime target.
- **Performance:** Payroll processing < 2 minutes for 1,000 employees.
- **Compliance:** GDPR and local data privacy laws.

---

## 7. Implementation Roadmap

- **Phase 1 (4–6 weeks):** Portal enhancements (timesheets UI + approvals), payroll core calc, payslip publishing.
- **Phase 2 (4–6 weeks):** Leave integration to payroll, TDS proofs (IN), contributions view (PH), bulk approvals, exports.
- **Phase 3 (4–6 weeks):** Advanced compliance (state PT/leave variants), analytics dashboards, bank feed integrations, SLA/perf hardening.

---

## 8. Detailed Workflows

### Workflow 1: Payroll Processing (India & PH)

1. HR sets period cut‑off; system displays countdown banners in portals.
2. Approved **timesheets** + **approved leave** feed the payroll engine.
3. Engine calculates net pay and statutory items (country‑specific).
4. HR reviews variances; locks period.
5. Payslips generated → **employee portal**; disbursement file → bank.
6. Compliance reports produced for filing.
7. **HR team sends payroll cut‑off alerts** (automated reminders to employees and managers before submission deadlines).

### Workflow 2: Timesheet Submission & Approval (Portal Enhancements)

1. Employee enters daily/weekly hours (regular, OT, night diff) → **autosave + validation**.
2. System computes **OT multipliers** (IN: 2x; PH: 125–200%) and flags anomalies (e.g., >16h/day).
3. Submit → Manager/Client notified (email + in‑app).
4. Manager approves/rejects/requests change; comments stored in audit log.
5. On approval, entries move to **Payroll‑Ready**; on rejection, employee edits and resubmits.

### Workflow 3: Leave Management

1. Employee requests leave → entitlement check (PH SIL, IN state rules configurable).
2. Routing to approver; decision captured; balances adjust.
3. If unpaid leave, payroll engine prorates salary; if paid, no deduction.

### Workflow 4: Payroll Self‑Service (Employee)

1. Payslips published → employee receives notification.
2. Employee views **net/gross breakdown**, **statutory deductions**, YTD totals.
3. India: upload/track **TDS proof documents**; status visible (Accepted/Pending/Rejected) with reason.
4. Philippines: view **SSS/PhilHealth/Pag‑IBIG** YTD contributions; download **13th‑month** statement.
5. **HR team can re‑send payslips** via the back‑office console when requested by employees/clients.

### Workflow 5: Compliance Reporting (Back‑Office)

1. Engine consolidates remittance schedules.
2. India: PF/ESI monthly, TDS quarterly; PH: SSS/PhilHealth/Pag‑IBIG monthly, BIR per calendar.
3. HR/Finance exports files; filing status tracked (Draft → Submitted → Acknowledged).

---

## 9. Risks & Assumptions

- Indian leave rules vary by state → system must be configurable.
- Philippine payroll requires strict adherence to BIR tables → update mechanism and versioning required.
- **Existing portal constraints** (auth, roles, UX) may limit UI patterns; accept incremental UX.
- Dual‑approval workflows may be needed (Teamified + client managers).
- Bank integrations differ per country → phased rollout.

---

## 10. API & Data Model (for Engineering)

### REST Endpoints (illustrative)

- `POST /timesheets` — create entry {employeeId, date, hoursRegular, hoursOT, hoursNight, projectId}
- `PATCH /timesheets/{id}` — edit until status ≠ Approved
- `POST /timesheets/{id}/submit` — route to approver
- `POST /approvals/{id}` — approve/reject with comment
- `GET /payslips?employeeId=…&period=…` — list/download
- `POST /tax-proofs` (IN) — upload, metadata, status transitions
- `GET /contributions` (PH) — SSS/PhilHealth/Pag‑IBIG YTD summary

### Core Entities

- **TimesheetEntry**: id, employeeId, date, hoursRegular, hoursOT, hoursNight, status [Draft|Submitted|Approved|Rejected|Payroll‑Ready], approverId, comments[], createdBy, createdAt, updatedAt
- **Payslip**: id, employeeId, periodStart, periodEnd, gross, net, deductions{…}, contributions{…}, publishedAt, pdfUrl, version
- **LeaveRequest**: id, employeeId, type, startDate, endDate, hours, status, approverId, balanceBefore, balanceAfter
- **Approval**: id, targetType, targetId, action, actorId, comment, createdAt
- **TaxProof (IN)**: id, employeeId, category, docUrl, amountClaimed, status, reviewerId, reviewedAt, reason

### Permissions

- Employee: CRUD own timesheets (until Approved), view own leaves/payslips, upload TDS proofs.
- Client Manager: Approve assigned workers’ timesheets/leave, view cost snapshots.
- HR/Finance: Configure rules, run payroll, publish payslips, manage filings.

---

## 11. Review & Escalation

- **HR/Legal validation required** before rollout.
- Escalate conflicts between statutory rules and client policies.

---

*This document is a working draft. It is not legal advice. Please seek HR/Legal review before publishing. Local variations may apply.*

