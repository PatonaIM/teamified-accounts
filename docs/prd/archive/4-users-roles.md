# 4. Users & Roles
- **EOR (Team Member):** Own profile, timesheets, leave, documents.
- **Ops Admin:** Invite/manage users, manage client rosters & assignments, view/approve timesheets & leave, export reports.
- **System Admin (internal superuser; optional):** All Ops Admin permissions plus system configuration.

## 4.1 Permission Matrix (MVP)
| Capability | EOR | Ops Admin | System Admin |
|---|---|---|---|
| Accept invite / sign in | ✓ | ✓ | ✓ |
| View/update own profile & CV | ✓ | – | – |
| Submit/edit timesheets (pre‑approval) | ✓ | – | – |
| View own payslips & docs | ✓ | – | – |
| Create/cancel leave requests | ✓ | – | – |
| Approve/reject timesheets & leave | – | ✓ | ✓ |
| Invite users (EOR/Admin) | – | ✓ | ✓ |
| Assign EOR to client / transition | – | ✓ | ✓ |
| Manage roles | – | ✓ | ✓ |
| Run reports / exports | – | ✓ | ✓ |
| Configure countries/holidays (basic) | – | – | ✓ |
| View audit logs | – | ✓ | ✓ |
