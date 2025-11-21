# 5) Tenancy, RBAC & Authorization

- **Tenancy:** Global org (Teamified). Data is partitioned by **Client** for roster/assignment; EOR self‑service is scoped to their own record; Admins are scoped to all clients or selected clients (future enhancement: client‑scoped admin).
- **Roles (MVP):** `EOR`, `OpsAdmin`, `SystemAdmin`.
- **Terminology:** UI copy uses **“Ops Admin”**; code/roles use `OpsAdmin`.
- **Policy examples:**
  - EOR may **only** read/update own profile, CV, timesheets, leave, documents.
  - OpsAdmin may invite users, manage assignments, view/approve timesheets/leave, publish documents, run exports.
  - SystemAdmin can configure countries/roles/templates and view audit logs.
- **Enforcement:** Route guards in API; field‑level checks; query filters by `client_id` and `user_id`.
- **Data filtering pattern:** Use repository helpers to auto‑inject `WHERE` scopes based on role/context.

---
