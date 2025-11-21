# Project Brief: **Teamified EOR Portal**

**Project Type:** Greenfield Full‑Stack Application\
**Prepared by:** BMad Analyst\
**Mode:** YOLO Draft (placeholders ready for your edits)\
**Date:** 28 Aug 2025 (AEST)

---

## 1) Executive Summary

Teamified is building an in‑house portal for Employer‑of‑Record (EOR) team members to self‑serve their personal and employment information (CV, contact details, records) and complete core HR workflows (timesheets, leave, payslips and documents). The portal will replace Zoho People for these flows to reduce cost, protect our IP, and give us full product control. Teamified operations staff will administer the platform, including inviting users (admins or EORs) and managing client team membership.

EORs are employed by Teamified and work full‑time for a single client at any given time; they may finish with one client and move to another, but never work across multiple clients concurrently.

## 2) Problem Statement

Describe the user pain and why current solutions fall short.

- **Current State & Pain Points:** Reliance on Zoho People drives ongoing license costs, limits customization, and constrains IP/roadmap control. We also need to manage EORs across India, Sri Lanka and the Philippines with country‑specific needs.
- **Impact:** Strategic to our goals: own the platform, reduce costs, and deliver EOR‑specific features that improve the team member experience and operational efficiency.
- **Why existing solutions fall short:** They functionally work but do not support our EOR‑specific single‑client assignment model, multi‑tenant client administration, or the degree of customization we require.
- **Urgency & importance:** High — cost, control, and strategic differentiation.

## 3) Target Users & Personas

- **Primary persona:** EOR team members
- **Secondary personas:** Teamified operations staff
- **Key jobs‑to‑be‑done:**
  - Accept invitation and sign in
  - Update personal details and CV
  - Submit and review timesheets
  - Request and track leave
  - Access payslips and employee documents (e.g., handbooks)
  - *Ops:* Invite users, administer client team members, manage roles and assignments

## 4) Goals & Non‑Goals

**Goals (what success looks like):**
- Replace Zoho People for EOR timesheets, leave, and payslip/document access by the MVP launch.
- Provide self‑service profile updates for 100% of active EORs.
- Enforce a single‑active‑client assignment per EOR with clean transition flows and audit history.
- Support multi‑country operations at launch (India, Sri Lanka, Philippines).

**Non‑Goals (explicitly out of scope for MVP):**
- Simultaneous assignment of one EOR to multiple clients.
- Full ATS/recruitment, performance reviews, or learning management.
- Building a payroll calculation engine; MVP focuses on timesheets/leave and payslip/document distribution.

## 5) Success Metrics (MVP)

Define measurable outcomes for the first release.

- **Activation/Adoption:** ≥ 90% of invited EORs complete onboarding within 14 days of invite.
- **Engagement/Usage:** ≥ 95% weekly timesheet submission rate; ≥ 90% leave requests submitted via portal.
- **Operational/Cost:** Reduce HR SaaS spend vs Zoho People baseline by ≥ 30% by month 3 post‑launch; < 5 minutes median time for Ops to invite and onboard a user.
- **Quality:** < 1% data error rate on core profile fields post‑migration; 99.9% monthly uptime target.

## 6) Solution Overview

High‑level view of how the product solves the problem.

- **Core concept & approach:** Multi‑tenant, role‑based portal with EOR and Admin experiences. API‑first with an admin console for invitations, assignments, and reporting.
- **Key differentiators:** EOR‑specific single‑client assignment model; strong client‑level data segregation; country configuration for India, Sri Lanka, Philippines; ownership of IP and roadmap.
- **Why we’ll win:** Reduced cost, faster iteration on EOR‑centric features, and a tailored UX that matches our operating model.

## 7) Feature Set & MVP Cut

Break down features by priority.

| Priority | Feature | User Value | Notes |
|---|---|---|---|
| P0 (MVP) | Secure invite & onboarding | Simple, safe first access | One‑time invite links; email‑based sign‑in (SSO later) |
| P0 (MVP) | Profile & CV management | Keep records accurate | Personal info, contact details, CV upload/history |
| P0 (MVP) | Timesheets submission | Capture time reliably | Weekly submission, edit before approval; basic export for Ops |
| P0 (MVP) | Leave requests & tracking | Self‑serve leave | Apply/cancel; status tracking; policy text surfaced |
| P0 (MVP) | Payslips & documents | Access key employment docs | View/download payslips; employee handbook & other docs |
| P0 (MVP) | Client assignment model | Correct single‑client work context | One active client at a time; transition workflow & history |
| P0 (MVP) | Admin console & roles | Efficient operations | Invite users; assign roles (Admin/EOR); manage client teams |
| P0 (MVP) | Multi‑country basics | Works across regions | Timezones/date formats; country metadata for IN/LK/PH |
| P0 (MVP) | Audit trail | Trust & compliance | Change history for profile and assignments |
| P0 (MVP) | Notifications & reminders | Drive compliance | Timesheet due reminders; leave status updates |
| P1 | Data migration tooling (Zoho) | Smooth cutover | Export mapping, dry‑run imports, validation |
| P1 | Reporting & exports | Operational visibility | Timesheets, leave, roster by client/country |
| P1 | Mobile‑first polish | Better adoption | Optimized responsive UX for phones |
| P2 | SSO & advanced auth | Enterprise readiness | SSO, MFA options |
| P2 | Deeper country packs | Scale globally | Holiday calendars, localized docs; additional countries |

**Critical MVP assumptions:**
- Existing payroll provider can supply payslips/documents for distribution via the portal.
- Zoho People data export is available and mappable to the new data model.
- EORs have unique, accessible email addresses for invitations and notifications.

## 8) Constraints & Assumptions

- **Business constraints (budget/timeline):** Target MVP window: Q4 2025; budget and team allocation *[TBD]*.
- **Technical constraints (stack/integrations):** Multi‑tenant architecture and RBAC required; API endpoints for future integrations; initial payslip ingestion via file upload or simple connector; scalable to additional countries.
- **Compliance/security/privacy:** Handle PII securely (encryption in transit/at rest), audit logging, least‑privilege access; consider data residency and employment law obligations for India, Sri Lanka, Philippines.
- **Assumptions to validate:** Availability and quality of Zoho People exports; timesheet cadence (weekly) and leave policies by country/client; payslip source and format; notification channels.

## 9) Competitive Landscape (Snapshot)

- **Alternatives/competitors:** Continue on Zoho People (status quo) or adopt a generic HRIS/EOR tool.
- **Comparative advantages:** Cost control, IP ownership, EOR‑specific workflows (single‑client assignment, client roster administration), faster custom feature delivery.
- **Gaps/opportunities:** Build only the flows we need now; expand later to additional HR modules and countries.

## 10) Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Underestimating payroll/payslip integration scope | M | H | Treat payroll as document distribution for MVP; defer calculations; define clear interface with provider |
| Data migration complexity from Zoho People | M | M | Define mapping early; run sample exports; staged import with validation and roll‑back |
| Compliance differences across countries | M | H | Engage counsel/HR leads; ship country basics at MVP, add deeper packs iteratively |
| Low adoption/change management | M | M | Clear comms; in‑app guidance; pilot program and champions |
| Security/privacy vulnerabilities | L | H | RBAC, auditing, encryption, secure SDLC and penetration testing |

## 11) Release Plan (MVP)

- **Target date/window:** Q4 2025.
- **Launch scope:** P0 feature set listed above.
- **Pilot/beta plan:** Pilot with a small cohort of EORs across India, Sri Lanka and the Philippines and 1–2 Ops admins; incorporate feedback before GA.
- **Post‑launch metrics review cadence:** Weekly dashboard during the first 8 weeks, then monthly.

## 12) Appendices / Notes

- **Open questions:**
  - Final product name and brand choices.
  - Scope of payroll at MVP (document distribution only vs. calculations).
  - Timesheet approval flow and SLA; who approves (Ops vs client)?
  - Leave policies/entitlements by country and handling of accruals.
  - Document retention periods and storage location(s).
  - Required languages beyond English; accessibility needs.
  - SSO/IdP preferences (if any).
  - Data residency requirements and preferred cloud region(s).
  - Zoho People export access, field mapping and historical depth.
  - Holiday calendars and country‑specific rules.
- **Reference links/files:** *[TBD]*

---

### Workflow Snapshot (for this project)

- ✅ Step 1 — **Project Brief (this doc)**
- ⏭️ Step 2 — PRD (by PM)
- ⏭️ Step 3 — Front‑End Spec (by UX)
- ⏭️ Step 4 — (Optional) AI UI Prompt (v0/Lovable)
- ⏭️ Step 5 — Full‑Stack Architecture (by Architect)
- ⏭️ Step 6 — PO Validation & Sharding for Dev

> *Edit this draft directly. When you’re done, say “Proceed” and we’ll generate the PRD from it.*

