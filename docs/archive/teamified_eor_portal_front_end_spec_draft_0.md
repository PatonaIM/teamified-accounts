# Front‑End Specification — Teamified EOR Portal (Draft 0)

**Audience:** UX, Front‑End, QA, PM, Architect\
**Source docs:** Project Brief v1, PRD Draft 0\
**Date:** 28 Aug 2025 (AEST)

---

## 0) Design System Integration & Assets

**Stack:** CSS‑first design system using semantic HTML and CSS Custom Properties. Include the Teamified design tokens and components stylesheet and load Plus Jakarta Sans.\
**Include in **``**:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/teamified-design-system.css">
```

**Tokens & conventions used in this spec:**

- **Typography:** `--font-family-primary`, `--font-size-h1..h6`, `--font-size-body-*`, `--line-height-*`
- **Colors:** `--color-brand-purple`, `--color-brand-blue`, `--color-bg-*`, `--color-text-*`, status colors
- **Spacing:** `--spacing-1..10` (8px scale) and container widths `--container-*`
- **Components:** base `.btn`, `.form-group`, `.form-label`, `.form-input`, `.card`, plus variants `.btn-primary`, `.btn-secondary`, `.form-input--error`
- **Icons:** 24×24 SVG, consistent strokes, platform (purple) vs service (blue) usage
- **Accessibility:** Skip link, visible focus outlines, keyboard‑first flows.

**Layout pattern reference:** Sidebar + main content, mobile menu toggle, and skip link per the design system example.

---

## 1) Design Principles

- **Clarity first:** Content‑first layouts with consistent type scale and spacing.
- **Mobile‑first:** Base styles for mobile, enhance at larger breakpoints.
- **Trust & privacy:** Clear system feedback, audit hints on saves and approvals.
- **Accessible by default:** Skip links, semantic HTML, visible focus, WCAG AA contrast.
- **System feedback:** Inline validation, optimistic UI with clear success/error states.

---

## 2) Information Architecture & Navigation

Two primary spaces:

- **My Portal** (EOR) → `/app/*`
- **Admin Console** (Ops/System Admin) → `/admin/*`

### Global Nav (authenticated)

- **Header:** Product name/logo (TBD), context switcher (My Portal ↔ Admin Console per role), notifications bell, user menu (Profile, Documents, Sign out).
- **Footer:** Version, help link, legal/privacy.

### Route Map

```
/app
  /dashboard
  /profile
  /cv
  /timesheets
    /new | /:weekId | /history
  /leave
    /new | /requests/:id | /history
  /documents
    /payslips | /hr-docs

/admin
  /dashboard
  /invitations
    /new | /:inviteId
  /people
    /eors | /admins | /users/:id
  /clients
    /:clientId/roster | /assignments
  /approvals
    /timesheets | /leave
  /documents
    /publish | /library
  /reports  (P1)
  /settings
    /countries | /holidays (P2) | /roles
```

---

## 3) Role‑Based Experiences

### EOR (My Portal)

- **Dashboard**: First‑run checklist (profile completeness), current week timesheet status, leave balance/status (if available), recent payslip card, helpful links.
- **Profile**: Personal/contact information with country‑aware fields; audit note shown on save.
- **CV**: Upload/download, version history; “Set as current” action.
- **Timesheets**: Create/submit weekly; status Draft/Submitted/Approved/Rejected; reminder banner if due.
- **Leave**: Request/cancel; see approvals and history.
- **Documents**: Payslips (by month); HR docs (handbook, policies) with tags.

### Ops Admin (Admin Console)

- **Dashboard**: Invites pending, approvals queue (timesheets/leave), recent changes (audit), roster by client.
- **Invitations**: Create/resend/cancel; filter by status (Pending/Accepted/Expired).
- **People**: EOR directory (search, filters: client, country, status); Admins list.
- **Clients/Rosters**: View roster per client; manage EOR assignment (enforce single active).
- **Approvals**: Bulk actions for timesheets/leave; inline comments.
- **Documents**: Publish to user/cohort (by client/country); library with versioning.
- **Reports (P1)**: Exports for timesheets/leave/roster.
- **Settings**: Countries (IN/LK/PH basics), roles, email templates (invite/reminders).

---

## 4) Page‑Level Specifications

### 4.1 My Portal → Dashboard (`/app/dashboard`)

**Components**: Welcome header, Profile Completion meter, “This Week’s Timesheet” card, “Leave at a glance” card, “Latest Payslip” card, Tips panel.\
**Empty states**: If no payslip, show CTA: “Payslips will appear after your first payroll cycle.”\
**Actions**: “Update profile”, “Open timesheet”, “Request leave”, “View payslips”.

### 4.2 My Portal → Profile (`/app/profile`)

**Fields (required unless noted)**

- Legal Name, Preferred Name (opt), Email, Phone, Address, Country (IN/LK/PH at MVP), Timezone (auto‑suggest), Emergency Contact (opt).\
  **Validation**: Email format; phone E.164 suggestion; address lines max 100 chars; input masks by country where helpful.\
  **UI classes map**: Use `.form-group` → `.form-label` + `.form-input` + `.form-help`/`.form-error`. Primary actions use `.btn.btn-primary`; secondary links as `.btn.btn-secondary` where appropriate.\
  **Interactions**: Inline save per section; success toast; audit label: “Saved — audit recorded”.

### 4.3 My Portal → CV (`/app/cv`) (`/app/cv`)

**Components**: File uploader, version list table (filename, uploaded at, size, current tag).\
**Constraints**: PDF/DOCX ≤ 10MB; virus scan hook (server‑side).\
**Actions**: Upload new; Download; Set as current; Delete (confirm).\
**Empty state**: “No CV on file — upload to keep your profile current.”

### 4.4 My Portal → Timesheets (`/app/timesheets`)

**List**: Weeks with status; quick CTA for current week.\
**Form** (`/:weekId` or `/new`):

- Grid of days (Mon–Sun default; country‑configurable week start).
- Per‑day: hours (0–24, step 0.5), free‑text note (max 500 chars).
- Totals bar with weekly sum; validation prevents submit if any day invalid.
- Status chip; actions: Save Draft, Submit, Withdraw (if Submitted and before approval).\
  **UI classes map**: `.form-group`, `.form-label`, `.form-input`; Approve/Reject buttons `.btn.btn-primary`/`.btn.btn-secondary`; table layout uses `.card` with `.card-header` and `.card-body`. **Errors**: Show inline; preserve inputs on error.\
  **Success**: “Timesheet submitted — awaiting approval.”

### 4.5 My Portal → Leave (`/app/leave`) (`/app/leave`)

**Form**: Type (Annual/Sick/Other [configurable]), Date range picker, Partial‑day toggle (P2), Note (opt 300 chars).\
**Rules**: Cannot overlap approved leave; cancellation allowed until start date.\
**List**: Requests with Status; filters (type, status, date range).\
**Edge cases**: If balances are not available, show helper text: “Balance tracking coming soon — submit based on policy.”

### 4.6 My Portal → Documents (`/app/documents`)

**Payslips**: Table (Period, Available on, Actions [View/Download]); secure file fetch; no preview caching.\
**HR Docs**: Card/grid with tags; search by title/tag.

### 4.7 Admin → Invitations (`/admin/invitations`)

**Create**: First/Last name, Email, Country, Client; Role (EOR/Admin); optional welcome note.\
**Business rules**: One‑time link, expires in 7 days; resend; revoke; audit events on each action.\
**Table**: Invitee, Role, Client, Country, Status, Sent, Expires, Actions.\
**UI classes map**: Form uses `.form-group`/`.form-label`/`.form-input`/`.form-select`; primary CTA uses `.btn.btn-primary`; secondary actions `.btn.btn-secondary`.

### 4.8 Admin → People (`/admin/people`) (`/admin/people`)

**EORs**: Data table with search; filters: Client, Country, Status (Active/Inactive/Invited).\
**Row actions**: View Profile, Open Timesheets, Assign/Transition Client, Documents.\
**Admins**: List of admin users with role badges; invite admin.

### 4.9 Admin → Clients & Assignments (`/admin/clients`)

**Roster view**: Client selector → table of EORs (Name, Country, Assignment status, Start/End).\
**Assign/Transition modal**: Enforce single active client; requires start date; transition requires end date for current + start date for next; writes history.\
**Guards**: Prevent overlapping dates; show warning if open timesheets exist in transition week.

### 4.10 Admin → Approvals (`/admin/approvals`)

**Timesheets**: Queue; bulk Approve/Reject; per‑row comment; export Approved to CSV.\
**Leave**: Queue; conflict warning (date overlap); per‑row comment; audit on decision.

### 4.11 Admin → Documents (`/admin/documents`)

**Publish**: Upload PDF; target by user, client, and/or country; “Notify recipients” checkbox; show delivery log.\
**Library**: List with filters; versioning for HR docs; payslips are immutable.

### 4.12 Admin → Reports (P1)

**Exports**: Timesheets, Leave, Roster; filters (date range, client, country); CSV with consistent column mapping.

### 4.13 Admin → Settings (`/admin/settings`)

**Countries**: Enable/disable; set week start; date format; placeholders for holiday calendars (P2).\
**Roles**: Role matrix reference; add/remove Admins.\
**Email templates**: Invite, reminder, expiry (variables: {{firstName}}, {{inviteLink}}, {{expiryDate}}).

---

## 5) Component Inventory (Design System CSS)

Use **Teamified design system classes**; avoid framework‑specific naming. Key contracts:

**Buttons**

- Base: `.btn`
- Primary: `.btn.btn-primary`
- Secondary: `.btn.btn-secondary`
- Sizes: `.btn-lg`, `.btn-md`, `.btn-sm`
- States: `:hover`, `:active`, `:disabled`, modifier `.btn--loading`

**Forms**

- Group: `.form-group`
- Label: `.form-label`
- Input: `.form-input` (error variant `.form-input--error`)
- Help/Error: `.form-help`, `.form-error`
- Select: `.form-select`

**Cards**

- Container: `.card` → `.card-header`, `.card-body`, `.card-footer`
- Variant: `.card--feature` with `.card-icon`

**Navigation**

- Primary nav: `.nav`, `.nav-container`, `.nav-menu`, `.nav-link`
- Sidebar pattern: `.sidebar`, `.sidebar-nav`, `.sidebar-nav-link`, `.sidebar-nav-icon`

**Icons**

- Use inline **SVG** at 24×24 with consistent stroke (2px).
- Color per context: platform = `var(--color-brand-purple)`, service = `var(--color-brand-blue)`.

**Typography helpers**

- Headings: `.h1`…`.h6`
- Display: `.display-large|medium|small`
- Body: `.body-large|medium|small`
- Caption: `.caption`

**Utilities (selected)**

- Spacing utilities `.mt-*`, `.mb-*`, `.ml-*`, `.mr-*`, `.m-*`, `.p-*` mapped to the 8px scale.
- Containers: `--container-sm|md|lg|xl` for layout bounds.

---

## 6) States & Validation

**Loading**: Skeletons for tables/cards; button `.btn--loading` disables interactions.\
**Empty**: Use contextual copy + CTA.\
**Error**: Inline field errors via `.form-input--error` and `.form-error`; page‑level callout for systemic failures.\
**Success**: Toast confirmation; subtle success banner on navigation.\
**Validation Rules (samples)**:

- Body text **min 16px**, line‑height ≥ 1.5.
- File types: CV = pdf, docx (≤10MB).
- Timesheet hours 0–24 (step 0.5); weekly total ≤ 84.
- Invite expiry = 7 days; resend regenerates link and extends expiry (audit event).

---

## 7) Accessibility & UX Writing

- **WCAG 2.1 AA**: Ensure text contrast (≥4.5:1 normal), interactive elements (≥3:1).
- **Skip link**: Add `<a href="#main-content" class="skip-link">Skip to main content</a>` as the first focusable element; style per design system.
- **Keyboard**: Logical tab order; visible focus outlines on `.btn`, `.nav-link`, `.form-input`; trap focus in modals.
- **Semantics**: Use landmark roles (`header`, `nav`, `main`, `footer`), labels tied to inputs, ARIA where needed.
- **Tone**: Clear, supportive microcopy; error messages actionable.

---

## 8) Responsiveness & Breakpoints

- **Breakpoints**: Mobile ≤767px, Tablet 768–1023px, Desktop 1024–1439px, Large ≥1440px.
- **Mobile**: Single‑column forms, sticky submit bar, collapsible cards; sidebar hidden behind mobile menu toggle.
- **Tablet**: Two‑column forms when space allows.
- **Desktop**: Grid layouts; data tables with horizontal scroll if needed.
- **TimesheetGrid**: Mobile shows one day per accordion; desktop shows full week grid.

---

## 9) Notifications & Emails (MVP)

- **Emails**: Invite (send, reminder day 3, expiry day 7), timesheet due, leave status changes.
- **In‑app**: Bell menu with unread dot; settings page for notification preferences (email only at MVP).
- **Focus on reduced motion**: Respect `prefers-reduced-motion` for notification toasts and transitions.

**Email Template Tokens**: `{{firstName}}`, `{{inviteLink}}`, `{{expiryDate}}`, `{{supportEmail}}`

---

## 10) Analytics & Event Tracking (supports MVP metrics)

- **Activation funnel**: Invite\_Sent → Invite\_Accepted → Onboard\_Completed.
- **Timesheets**: Timesheet\_Open → Timesheet\_Submit → Timesheet\_Approved.
- **Leave**: Leave\_Submit → Leave\_Approved/Rejected.
- **Docs**: Payslip\_View/Download.
- **Ops efficiency**: Invite\_Created (duration), Bulk\_Approve\_Used.\
  Payload includes user role, country, clientId (where applicable), timestamp.

**QA hooks**: Add data‑attributes to key actions for automated a11y checks and analytics (e.g., `data-a11y="focus-visible"`).

---

## 11) Security & Privacy (UI‑level)

- Mask sensitive fields where appropriate.
- Show role and client context in Admin actions.
- Confirm destructive actions; show audit labels post‑save/decision.
- Enforce least‑privilege defaults and visible focus states on admin actions.

---

## 12) QA Acceptance Checklist (UI)

- Forms: client‑side + server‑side validation; `.form-input--error` styling; error persistence.
- Accessibility: keyboard traversal, **skip link present**, screen reader labels, visible focus indicators.
- Mobile: P0 flows tested on iOS/Android latest + one back version.
- Permissions: verify EOR cannot access Admin routes; deep‑link guards.
- Internationalization basics: date/time formatting per country; week start per setting.
- Color contrast checks (text ≥4.5:1, interactive ≥3:1).
- Modal focus trap and Escape to close behavior verified.

---

## 13) Open Questions

- Do EORs see leave balances at MVP, or just policy text?
- Approver identity: Ops only vs client‑designated approvers?
- Any client‑facing read‑only portal needed (future)?
- Required HR document categories beyond handbook?
- Email provider & sender domain (DKIM/SPF) details?
- Branding palette & logo (affects tokens and components).
- Icon library scope for MVP (navigation, actions, status) and standard sizes (16/20/24/32/48).
