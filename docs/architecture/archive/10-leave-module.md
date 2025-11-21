# 10) Leave Module

- **Model:** `LeaveRequest { id, eorId, type, startDate, endDate, note, status }`.
- **Status:** Draft → Submitted → Approved|Rejected; cancellation allowed pre‑start.
- **Conflicts:** Prevent overlap with existing approved leave; warn on timesheet impacts.
- **Balances:** MVP optional; show policy text if balances unavailable.

---
