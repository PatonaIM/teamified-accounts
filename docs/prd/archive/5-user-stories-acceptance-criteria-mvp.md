# 5. User Stories & Acceptance Criteria (MVP)
## Epic A — Invitations & Onboarding
1. **As an Ops Admin,** I can invite a new EOR via email, so they can access the portal.
   - **AC:** Invite form requires first/last name, email, country, client; generates one‑time link expiring in 7 days; resend available; system logs audit event.
2. **As an EOR,** I can accept an invite, set a password, and sign in.
   - **AC:** One‑time link validates; password meets policy; first‑run checklist prompts profile completion.

## Epic B — Profile & CV
3. **As an EOR,** I can update personal and contact details.
   - **AC:** Required fields: legal name, preferred name (opt), email, phone, address, country; validation by country; changes captured in audit log.
4. **As an EOR,** I can upload and manage my CV.
   - **AC:** Accept PDF/DOCX up to 10MB; store version history; latest marked as “current”.

## Epic C — Timesheets
5. **As an EOR,** I can submit a weekly timesheet.
   - **AC:** Week definition follows country locale; entries per day with hours and notes; status Draft → Submitted → Approved/Rejected; reminders on due date.
6. **As an Ops Admin,** I can review and approve/reject timesheets.
   - **AC:** Bulk approve; inline comments; export approved timesheets to CSV.

## Epic D — Leave
7. **As an EOR,** I can request leave and track status.
   - **AC:** Request type (Annual/Sick/Other [configurable]); date range; optional note; status Draft/Submitted/Approved/Rejected; cancellation allowed before start.
8. **As an Ops Admin,** I can approve/reject leave requests.
   - **AC:** View conflicts; comment on decision; audit logging.

## Epic E — Documents
9. **As an EOR,** I can view/download payslips and HR documents.
   - **AC:** Payslip list by month; secure file delivery; access only to own documents.
10. **As an Ops Admin,** I can publish documents to an EOR or cohort.
    - **AC:** Upload PDF; tag by client/country; notify recipients.

## Epic F — Client Assignment
11. **As an Ops Admin,** I can assign an EOR to a single active client and transition when needed.
    - **AC:** System enforces max one active assignment; transition captures end date + start date; historical view retained; downstream lists filter by active client.

## Epic G — Reporting & Exports (P1)
12. **As an Ops Admin,** I can export timesheets, leave, and roster data.
    - **AC:** CSV exports with column mapping; date range filters; country/client filters.
