# Epic 6: EOR Onboarding Workflow

## Epic Overview
**As a** HR manager and candidate,
**I want** a guided onboarding workflow that transitions a successful candidate into an EOR (Employer of Record) with structured data collection and document verification,
**so that** we can securely capture profile details, identity documents, references, education proofs, and previous employment proofs, and grant the EOR role only after HR review.

## Business Value
- Streamlines candidate-to-EOR conversion and reduces manual coordination
- Ensures regulatory compliance with verified identity and employment history
- Improves candidate experience with a single, guided multi‑step flow
- Maintains auditability and role‑based permissioning across the process
- Reuses existing profile, documents, and RBAC foundations to minimize risk

## Epic Goals
1. Candidate onboarding wizard with profile, ID, and verification steps
2. Secure document capture with validation and storage using existing services
3. HR review workspace with checklists, status changes, and audit trail
4. Automated authorization upgrade to EOR role upon approval
5. Notifications and reminders for pending steps and review outcomes
6. Unified candidate "My Documents" page with tabs: CVs, Identity, Employment, Education
7. Conversational guidance using OpenAI AgentKit/ChatKit with persistent vector memory

## Dependencies
- Existing Authentication and RBAC (Stories 1.x)
- User Profile, Employment Records, and Documents services
- CV/Documents infrastructure and audit logging

## Roles & Permissions Alignment
- Use the existing `user_roles` infrastructure; no new role types.
- Assign the existing role_type `eor` on approval (Story 6.7).
- Scope: `client` using the employment record’s `client_id` as `scope_entity_id`.
- Invitations already support `EOR` in `invitations_role_enum`; this epic promotes candidates to `eor` via review/approval rather than direct EOR invitation.
- RBAC enforcement continues via existing guards/decorators (e.g., `Roles('eor')`).

## Lifecycle & Status Model
- **onboarding**: Employment intent established; candidate is completing profile and document steps. Default status when initiating this epic’s flow.
- **active**: HR has approved; EOR role assigned; standard access granted.
- **offboarding**: Separation initiated; access reduction and exit tasks in progress.
- **terminated**: Employment ended early or for cause; finalization complete.
- **inactive**: Temporarily inactive relationship or administrative hold.
- **completed**: Past employment concluded; retained for history and reporting.

**State Transitions (high level):**
- Create Employment Record → `onboarding` → HR approval → `active`
- `active` → initiate offboarding → `offboarding` → finalize → `terminated` or `completed`
- Remediation loops (request changes) keep record in `onboarding` until approval

### Initiation Hook
- The onboarding process is anchored to creation of an `EmploymentRecord` for the user and client.
- Default status at initiation: `onboarding` (pending HR approval after document verification).
- Eventing: emit an onboarding-start audit/event with `(userId, employmentRecordId, clientId, countryId)` for traceability.

## Conversational Agent Integration
- Use OpenAI AgentKit and ChatKit to provide an assistant that guides candidates through onboarding.
- Persist chat history and derived summaries/notes in a vector database supported by AgentKit/ChatKit.
- Retrieval‑augmented assistance: the agent should reference prior chats and relevant docs to reduce re‑asking and improve guidance.
- Respect RBAC and privacy: candidate/EOR chats are private to the user; HR sees only explicitly shared summaries during review.

### Document Verification States (applies to Identity/Employment/Education)
- **Pending**: Uploaded by candidate/EOR and awaiting HR review
- **Verified**: Marked by HR as accepted — becomes non‑deletable by candidate/EOR
- **Needs changes**: HR requests updates — candidate/EOR may upload additional documents

## Success Criteria
- Candidates complete all required steps with clear progress indicators
- All uploaded documents are stored, versioned, and verifiable
- HR can review, request changes, or approve with full auditability
- On approval, candidate receives the existing `eor` role and gains appropriate access
- End‑to‑end flow is testable via UI and API, with docs updated
- Status model includes `onboarding` and `offboarding` with clear UX copy and audit coverage

## Stories in this Epic

### Phase 1: Candidate Data & Document Capture
- **Story 6.1:** Onboarding Wizard — Profile & Contact
  - Capture legal name, DOB, contact details, address, emergency contact
  - AC: Validates required fields, persists to profile API, shows progress state

- **Story 6.2:** My Documents — Tabbed Document Hub (CVs, Identity, Employment, Education)
  - Provide a dedicated "My Documents" page surfacing four tabs: CVs, Identity, Employment, Education
  - AC: Tabs render with counts; list existing files per category; upload uses existing document management endpoints; no duplicate storage; shows versioning and statuses; HR‑verified documents are non‑deletable by candidate/EOR; candidate/EOR can upload additional documents post‑verification

- **Story 6.3:** Identity Verification — ID Documents
  - Upload government ID (passport/driver’s license), live photo/selfie placeholder
  - AC: File type/size validation; stored via documents service; status "Submitted"

- **Story 6.4:** Employment & Education Proofs
  - Collect previous employment letters, references, and education certificates
  - AC: Multiple documents per category, metadata capture, versioning shown

### Phase 2: HR Review & Compliance
- **Story 6.5:** HR Review Dashboard
  - Centralized view of candidate submissions with per‑category checklist
  - AC: Approve/Reject/Request‑Changes with comments; mark documents as Verified or Needs changes; verified documents locked from candidate/EOR deletion; full audit log entries including verification actions and revocations (admin‑only)

- **Story 6.6:** Remediation & Resubmission Flow
  - Candidate receives requests for missing/invalid documents and resubmits
  - AC: Notifications triggered; change requests tracked; status transitions

### Phase 3: Role Assignment & Completion
- **Story 6.7:** Approval & EOR Role Assignment
  - On final approval, system grants `EOR` role and notifies the user
  - AC:
    - Create (or ensure) `user_roles` record with `role_type='eor'`, `scope='client'`, `scope_entity_id=<employment.clientId>`
    - Role visible in user profile and enforced by `Roles` guard
    - Full audit log of role grant (actor, scope, target, timestamp)

- **Story 6.8:** Completion Summary & Welcome
  - Provide final confirmation with next‑steps links (timesheets, profile, docs)
  - AC: Success state recorded; email confirmation sent; links verified

### Phase 4: Offboarding & Separation
- **Story 6.9:** Offboarding Initiation & Checklist
  - Initiate offboarding from HR dashboard; track exit tasks (final timesheet, device/doc return, references policy)
  - AC: Status transitions to `offboarding`; notifications sent; audit entries for each task; finalization sets status `terminated` or `completed`

### Phase 5: Agent Guidance & Memory
- **Story 6.10:** Agent‑Assisted Onboarding Chat (ChatKit)
  - Candidate can chat with an embedded assistant during each step (profile, documents, remediation)
  - AC: Chats persist across sessions; agent can summarize next steps; UI shows “Ask the agent” entry points on relevant pages

- **Story 6.11:** Vector Memory & Context Retrieval (AgentKit)
  - Store embeddings of prior chats and key onboarding artifacts; retrieve context to personalize guidance
  - AC: Per‑user and per‑employment‑record namespaces; p95 retrieval latency < 300ms; graceful fallback if store unavailable

- **Story 6.12:** Privacy, Consent & Governance for Chat Data
  - Define consent prompts; allow user to view/delete their chat history; restrict HR access to explicit summaries
  - AC: Audit all accesses; retention policy documented; PII redaction for agent logs; configuration flags for export/disable

## Integration Flow
```
Candidate → Onboarding Wizard (6.1, 6.2, 6.3, 6.4)
    ↓ submissions + metadata (documents/profile services)
HR Review (6.5) ↔ Remediation (6.6)
    ↓ approve
Role Assignment (6.7) → EOR role granted (status: active)
    ↓
Completion Summary (6.8)
    ↘ (when needed) Offboarding (6.9) → status: offboarding → finalize → terminated/completed
```

Agent overlay (6.10–6.12): ChatKit UI and AgentKit vector memory assist across 6.1–6.6 with context retrieval.

## Technical Constraints
- Leverage existing NestJS v1 API patterns, DTO validation, and guards
- Use existing documents service (checksums, versioning, secure storage)
- Enforce RBAC using existing roles decorator and guards; add `EOR` role where missing
- Maintain full audit logging on submissions, reviews, and role changes
- Follow existing Material‑UI design system and layout components
 - Strictly reuse the existing document management system and endpoints for CVs/Identity/Employment/Education; no duplicate storage paths or services
 - HR‑verified documents must be immutable for candidate/EOR deletion; only HR/Admin may revoke verification or archive per policy; all actions audited
 - Role assignment must reuse existing `user_roles` with `role_type='eor'`; no schema or enum changes required
 - Agent integration must use OpenAI AgentKit/ChatKit; chat history persisted in a supported vector store with per‑organization/record namespaces
 - Do not store secrets or access tokens in chat history; mask/blacklist sensitive fields; document retention and export controls
 - Provide opt‑out/disable flags; ensure graceful degradation if vector store is unavailable

## Acceptance Criteria
1. Candidates can complete a multi‑step onboarding wizard saving progress
2. Identity, employment, and education documents are uploaded with validation
3. HR managers can review, request changes, and approve with audit trail
4. On approval, candidate is assigned `EOR` role automatically and notified
5. All endpoints documented; E2E happy‑path test covers candidate→EOR
6. Offboarding can be initiated and tracked to closure with status updates and audit logs
7. Candidate has a "My Documents" page with tabs: CVs, Identity, Employment, Education, listing and upload powered by existing document management
8. HR can mark documents Verified/Needs changes; Verified documents cannot be deleted by candidate/EOR; candidate/EOR may upload additional documents for verification
9. Agent chat persists and is retrievable; vectorized memory improves guidance without re‑asking for previously provided context
10. Privacy controls available: user can view/delete chat history; HR only sees shared summaries; all access/actions audited

## Risks & Mitigations
- Risk: Sensitive documents handling and PII exposure
  - Mitigation: Reuse hardened document service; restrict access via RBAC; redact logs
- Risk: Review backlog causing delays
  - Mitigation: Add notifications and simple SLA indicators on dashboard
- Risk: Ambiguity in acceptable proofs across countries
  - Mitigation: Make categories configurable and document policy per country

## Definition of Done
- All 6.x stories meet ACs and pass E2E happy‑path and key error paths
- RBAC verified for candidate vs HR vs EOR across key routes
- Documentation and API reference updated; audit events visible for all actions
- Performance and accessibility checks pass per project standards

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-20 | 1.0 | Initial epic creation for EOR onboarding workflow | Product Owner Sarah |
| 2025-10-20 | 1.1 | Added lifecycle/status model (onboarding, offboarding) and Story 6.8 | Product Owner Sarah |
| 2025-10-20 | 1.2 | Added "My Documents" tabbed page and updated stories/flow to use existing document management | Product Owner Sarah |
| 2025-10-20 | 1.4 | Aligned role assignment to existing `user_roles` (`eor`, client‑scoped) and documented initiation hook | Product Owner Sarah |
| 2025-10-20 | 1.3 | Defined document verification states and non‑deletable rule for Verified docs; updated ACs | Product Owner Sarah |
| 2025-10-20 | 1.5 | Added OpenAI AgentKit/ChatKit conversational guidance, vector memory, and governance | Product Owner Sarah |


