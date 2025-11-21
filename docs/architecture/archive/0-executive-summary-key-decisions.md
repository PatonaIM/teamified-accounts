# 0) Executive Summary & Key Decisions

- **Goal:** Replace Zoho People with an in‑house EOR portal for profiles/CV, timesheets, leave, payslips/docs, and admin controls.
- **Architecture approach:** **Modular Monolith** for MVP (keeps deployment simple; clear module boundaries for later extraction).
- **Stack:** TypeScript **Node.js** (NestJS) • **PostgreSQL 15+** • **Redis** (cache/queues) • **S3‑compatible object storage** for documents • **OpenAPI** for REST v1 • **Playwright/Jest** for tests.
- **Security defaults:** Argon2 password hashing • JWT (short‑lived) + Refresh tokens • RBAC • Audit logging • Signed URLs for documents • HTTPS only • OWASP ASVS‑guided controls.
- **Tenancy model:** Single Teamified org; **Clients** act as tenants for scoping EOR assignments and data access.
- **Country scope:** India, Sri Lanka, Philippines at MVP; country‑aware date/week formatting and settings.

---
