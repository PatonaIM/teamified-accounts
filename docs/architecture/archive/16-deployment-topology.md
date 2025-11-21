# 16) Deployment Topology

```
[Client SPA]
   |
[API App (NestJS)]  <—>  [PostgreSQL]
   |  \__ BullMQ Jobs <—> [Redis]
   |  \__ Object Storage (S3)
   \__ Email Provider (ESP)
```

- **Environments:** Dev, Staging, Prod.
- **Images:** Docker; run 2–3 replicas behind LB; sticky sessions **not** required (JWT).
- **Migrations:** Run via CI before app rollout; use zero‑downtime patterns.

---
