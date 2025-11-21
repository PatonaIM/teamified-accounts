# 8. Data Model (High‑Level)
**Entities:** User, Role, EORProfile, Client, Assignment, Timesheet, TimesheetEntry, LeaveRequest, Document, Payslip (specialized Document), CountryConfig, Invitation, AuditLog.
- **Key Relations:**
  - User 1—1 EORProfile (nullable for Admins)
  - EORProfile 1—* Assignment (max 1 active)
  - Timesheet 1—* TimesheetEntry; Timesheet belongs to EORProfile and week
  - LeaveRequest belongs to EORProfile
  - Document/Payslip belongs to EORProfile (and optional tags: client, country)
