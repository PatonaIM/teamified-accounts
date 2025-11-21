# 3) High‑Level Architecture

```
[Web App (SPA)] ──REST/JSON──> [API Gateway / NestJS App]
                               |-- Module: Auth & Users
                               |-- Module: Profiles & CV
                               |-- Module: Invitations
                               |-- Module: Timesheets
                               |-- Module: Leave
                               |-- Module: Documents (Payslips/HR)
                               |-- Module: Clients & Assignments
                               |-- Module: Approvals
                               |-- Module: Reporting/Exports (P1)
                               |-- Module: Settings (Countries/Roles/Email Templates)
                               |-- Module: Audit & Admin
                               |
                               |-- PostgreSQL (primary)
                               |-- Redis (cache + BullMQ queues)
                               |-- Object Storage (S3)
                               |-- Email Provider
```

**Communication:** REST/JSON over HTTPS. Internal jobs and notifications via **BullMQ** (Redis).\
**Docs:** OpenAPI spec auto‑generated; Postman collection published; JSON Schema for payloads.

---
