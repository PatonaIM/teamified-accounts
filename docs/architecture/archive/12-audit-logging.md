# 12) Audit Logging

- **Event schema:** `{ id, at, actorUserId, actorRole, action, entityType, entityId, changes?, ip, userAgent }`.
- **Coverage:** Invites, logins, profile updates, assignments, approvals, document publish/download, settings changes.
- **Delivery log:** The Admin UI reads from **AuditLog** (filter by `entityType=Document` and actions `publish`/`notify`) to display document delivery status. Optionally expose a thin read API `GET /v1/documents/publishes` as a convenience over audit queries.
- **Access:** SystemAdmin (read) + OpsAdmin (read subset).
- **Retention:** 13 months (TBD); export to cold storage periodically.

---
