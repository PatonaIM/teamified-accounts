# 4) Domain Model

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
