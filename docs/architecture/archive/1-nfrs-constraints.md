# 1) NFRs & Constraints

- **Availability:** 99.9% monthly uptime.
- **Performance:** P95 < 300ms for read APIs; P95 < 600ms for write APIs (excluding file uploads).
- **Scale assumption (MVP):** \~1–2k EORs, \~50–200 Admins, weekly peaks on timesheet submission.
- **Security/Privacy:** PII encryption in transit/at rest; least‑privilege access; immutable payslip files; audit of sensitive actions.
- **Cost:** Prefer managed Postgres/object storage; single region to start (data residency TBD).

---
