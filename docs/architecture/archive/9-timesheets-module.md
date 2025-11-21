# 9) Timesheets Module

- **Model:** `Timesheet { id, eorId, weekStartDate, status, totalHours }`; `TimesheetEntry { day, hours, note }`.
- **Status machine:** Draft → Submitted → Approved|Rejected.
- **Rules:** Week start by `CountryConfig`; prevent overlapping/duplicate week per EOR.
- **Reminders:** Jobs run weekly to nudge Draft/empty weeks; due‑day reminder job.
- **Exports:** Approved rows exportable to CSV (streaming).

---
