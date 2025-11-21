# v0 / Lovable Prompt — Teamified EOR Portal

## Overview
Design and scaffold a responsive, accessible **Teamified EOR Portal** UI using a **CSS‑first design system**. Generate semantic HTML (or React if supported) that uses the **Teamified design system classes** and **CSS variables** (tokens). Prioritize mobile usability for EORs and efficient admin workflows for Operations.

**Primary audiences**  
- **EOR (team member)** — self‑service profile, CV, timesheets, leave, documents.  
- **Ops Admin** — invitations, client roster/assignments, approvals, documents, reports.

**Key flows (MVP)**  
- Invite → Onboard → Update profile + CV → Submit timesheets → Request leave → View payslips.  
- Admin: Invite users → Approve timesheets/leave → Assign/transition EORs → Publish documents → Export reports (P1).

## Design System / Assets
Load the following in `<head>` and assume a stylesheet that defines classes and tokens:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/teamified-design-system.css">
```

**Use these class contracts (do not invent new frameworks):**
- **Buttons:** `.btn`, `.btn.btn-primary`, `.btn.btn-secondary`, sizes `.btn-lg|.btn-md|.btn-sm`, modifier `.btn--loading`
- **Forms:** `.form-group` → `.form-label` + `.form-input` + `.form-help|.form-error`, selects `.form-select`, errors `.form-input--error`
- **Cards:** `.card` with `.card-header`, `.card-body`, `.card-footer`
- **Navigation:** `.nav`, `.nav-container`, `.nav-menu`, `.nav-link`; sidebar `.sidebar`, `.sidebar-nav`, `.sidebar-nav-link`, `.sidebar-nav-icon`
- **Typography:** `.h1..h6`, `.display-*`, `.body-*`, `.caption`
- **Utilities:** `.m* .p*` spacing utilities on an **8px scale**; container widths via `--container-*`
- **Icons:** inline 24×24 SVG; use brand purple for platform elements, brand blue for service elements

**Tokens (examples; read from CSS):**  
`--font-family-primary`, `--font-size-h1..h6`, `--font-size-body-*`, `--color-brand-purple`, `--color-brand-blue`, `--color-text-*`, `--color-bg-*`, `--spacing-1..10`

## Accessibility Requirements (must‑have)
- Add a **skip link** as the first focusable element: `<a href="#main-content" class="skip-link">Skip to main content</a>`
- Semantic landmarks: `header`, `nav`, `main#main-content`, `footer`
- **Visible focus** outlines on links, buttons, and inputs; keyboard navigable; modal focus trap
- Text contrast ≥ 4.5:1 (interactive ≥ 3:1), base body size ≥ 16px, line‑height ≥ 1.5
- Respect `prefers-reduced-motion`

## Layout Patterns
- **AppShell:** Top header (logo, product name, notifications bell, user menu), left sidebar for the Admin Console, content area for routes
- **Mobile:** Collapsible sidebar behind hamburger; sticky action bars on forms when helpful
- **Containers:** Use max width via `--container-lg|xl` for readability

## Breakpoints
- Mobile ≤ 767px, Tablet 768–1023px, Desktop 1024–1439px, Large ≥ 1440px

## Sitemap / Routes
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
    /countries | /holidays (P2) | /roles | /email-templates
```

## Page Briefs & Key UI (build the following screens)
### 1) EOR — Dashboard (`/app/dashboard`)
- Cards: **Profile Completion**, **This Week’s Timesheet** (hours/40, status), **Leave at a Glance**, **Latest Payslip**
- CTAs: Update profile, Open timesheet, Request leave, View payslips

### 2) EOR — Profile (`/app/profile`)
- Form sections using `.form-group` (Legal Name, Preferred Name, Email, Phone, Address, Country, Timezone, Emergency Contact)
- Save pattern: inline section save → toast → small audit label text

### 3) EOR — CV (`/app/cv`)
- Uploader (`.form-group` + `.form-input[type=file]`), version list table with actions (Download, Set current, Delete)

### 4) EOR — Timesheets (`/app/timesheets`)
- List/history + **form** (grid of days; hours 0–24 step 0.5; notes max 500)  
- Status chips; actions: **Save Draft**, **Submit**, **Withdraw**

### 5) EOR — Leave (`/app/leave`)
- Request form: Type (Annual/Sick/Other), Date range picker, Note; list with status and filters

### 6) EOR — Documents (`/app/documents`)
- Tabs/cards: **Payslips** (by period with View/Download), **HR Docs** (cards with tags)

### 7) Admin — Dashboard (`/admin/dashboard`)
- Summary cards: Pending invites, Approvals queue, Recent changes (audit), Roster by client

### 8) Admin — Invitations (`/admin/invitations`)
- **Create** form (First/Last, Email, Country, Client, Role) + table of invites (status, sent, expires, actions: resend/revoke)

### 9) Admin — People (`/admin/people`)
- EOR directory (search + filters: client, country, status), Admins list

### 10) Admin — Clients & Assignments (`/admin/clients`)
- Roster table per client; **Assign/Transition** modal enforcing single active client (start/end dates, warnings)

### 11) Admin — Approvals (`/admin/approvals`)
- Timesheets: queue with bulk Approve/Reject + per‑row comments, CSV export  
- Leave: queue with conflict warnings and comments

### 12) Admin — Documents (`/admin/documents`)
- **Publish** flow (target by user/client/country; notify recipients) + **Library** with filters and versioning

### 13) Admin — Reports (P1) & Settings
- Reports (exports); Settings for Countries, Roles, Email Templates (invite/reminder/expiry)

## Component Contracts (use these names & classes)
- `Header`, `Sidebar`, `PageHeader`, `Card`, `Stat`, `Badge`, `Table`, `Pagination`, `EmptyState`, `Toast`, `Callout`
- Domain: `TimesheetGrid`, `TimesheetTotalsBar`, `LeaveRequestForm`, `PayslipList`, `DocumentGrid`, `InviteForm`, `AssignmentModal`, `ApprovalQueue`, `ExportPanel`

## Validation & Rules (implement client‑side hints)
- Email format, E.164 phone hint, address max 100 chars; per‑country masks where helpful
- Timesheet weekly total ≤ 84; prevent submit with invalid days
- Invite expiry = 7 days; resend regenerates link and extends expiry; all write audit labels

## Notification Patterns
- Email templates exist (Invite, Reminder day 3, Expiry day 7, Timesheet due, Leave status)
- In‑app: bell menu; toast confirmations; respect reduced motion

## Example Markup (use this style)
**App shell & skip link**
```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="nav">
    <div class="nav-container">
      <a class="nav-link" href="/app/dashboard">Teamified</a>
      <nav class="nav-menu">
        <a class="nav-link" href="/app/dashboard">My Portal</a>
        <a class="nav-link" href="/admin/dashboard">Admin Console</a>
        <button class="btn btn-secondary" aria-label="Notifications">🔔</button>
        <button class="btn btn-secondary" aria-haspopup="menu" aria-expanded="false">Me</button>
      </nav>
    </div>
  </header>
  <div class="app-shell">
    <aside class="sidebar" aria-label="Admin navigation">
      <nav class="sidebar-nav">
        <a class="sidebar-nav-link" href="/admin/invitations"><span class="sidebar-nav-icon">✉️</span>Invitations</a>
        <a class="sidebar-nav-link" href="/admin/people"><span class="sidebar-nav-icon">👥</span>People</a>
        <a class="sidebar-nav-link" href="/admin/approvals"><span class="sidebar-nav-icon">✅</span>Approvals</a>
      </nav>
    </aside>
    <main id="main-content" class="main">
      <h1 class="h2">Admin → Invitations</h1>
      <section class="card">
        <div class="card-header"><h2 class="h3">Create invite</h2></div>
        <div class="card-body">
          <form aria-describedby="invite-help">
            <div class="form-group">
              <label class="form-label" for="first">First name</label>
              <input id="first" class="form-input" type="text" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input id="email" class="form-input" type="email" required>
              <p id="invite-help" class="form-help">A one‑time link will be sent. Expires in 7 days.</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="role">Role</label>
              <select id="role" class="form-select">
                <option>EOR</option>
                <option>Admin</option>
              </select>
            </div>
            <button class="btn btn-primary" type="submit">Send invite</button>
          </form>
        </div>
      </section>
      <section class="card">
        <div class="card-header"><h2 class="h3">Pending invites</h2></div>
        <div class="card-body">
          <table class="table">
            <thead>
              <tr><th>Invitee</th><th>Role</th><th>Client</th><th>Status</th><th>Sent</th><th>Expires</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Alex Lee</td><td>EOR</td><td>Alpha</td><td>Pending</td><td>28 Aug</td><td>04 Sep</td>
                <td><button class="btn btn-secondary">Resend</button> <button class="btn btn-secondary">Revoke</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
  <footer class="footer"><small class="caption">© Teamified · v0</small></footer>
</body>
```

**Timesheet day grid sketch (desktop)**
```html
<section class="card">
  <div class="card-header"><h2 class="h3">This week (Mon–Sun)</h2></div>
  <div class="card-body">
    <div class="timesheet-grid">
      <!-- 7 day columns with input[type=number] step=0.5 -->
    </div>
    <div class="timesheet-totals">
      <span>Total hours: <strong>32.5</strong></span>
      <div class="actions">
        <button class="btn btn-secondary">Save Draft</button>
        <button class="btn btn-primary">Submit</button>
      </div>
    </div>
  </div>
</section>
```

## Deliverables
- A cohesive set of HTML (or React components) for all **Page Briefs** above
- Responsive layout with **sidebar/main** pattern, mobile menu toggle, and skip link
- Forms & tables using the **defined classes**; error/success states; toasts
- Inline SVG icons in 24×24; consistent stroke weight

## Acceptance Criteria
- Uses **Teamified** classes/tokens exactly as specified  
- Passes keyboard navigation, visible focus, and basic color contrast checks  
- Scales across the defined breakpoints  
- Implements at least one end‑to‑end flow per role (Invite → Accept → Profile; Timesheet submit; Leave request; Publish payslip)

---

> If components must be stubbed, include clear TODO comments in markup to indicate future logic bindings (e.g., `<!-- TODO: bind to Invite API -->`).

