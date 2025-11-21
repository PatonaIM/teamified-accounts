# 6. Functional Requirements
## 6.1 Navigation & IA
- Two primary spaces: **My Portal** (EOR) and **Admin Console** (Ops/System Admin).
- Global banner notifications; profile completeness indicator; language = English (MVP).

## 6.2 Validation & Rules
- Unique email per user; password policy (TBD: length ≥ 10, complexity); rate‑limited auth.
- Single active client per EOR enforced at DB and application layers.
- Timesheet period is weekly; week start configurable per country (default Monday).

## 6.3 Notifications (MVP)
- Invite email; invite reminder (day 3) and expiry (day 7).
- Timesheet reminders: day‑before due and due‑day.
- Leave status change notifications to EOR.
