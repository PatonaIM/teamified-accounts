# 6) API Design (REST v1)

**Principles:**

- Resource‑oriented URIs; nouns; plural collections.
- Pagination = `page` + `pageSize`; sorting via `sort` (e.g., `-createdAt`).
- Filtering via query params (e.g., `?clientId=…&country=IN&status=Submitted`).
- Idempotency for POST of invitations and document publishes via `Idempotency-Key` header.
- Error model: RFC 7807 `application/problem+json`.

**Top‑level routes (samples)**

```
POST   /v1/auth/login
POST   /v1/auth/refresh
POST   /v1/auth/logout

GET    /v1/users/me
PATCH  /v1/users/me           (update profile subset)

POST   /v1/invitations        (Ops)  
GET    /v1/invitations        (Ops)  
POST   /v1/invitations/:id/resend (Ops)
DELETE /v1/invitations/:id    (Ops)

GET    /v1/timesheets         (EOR/Ops)
POST   /v1/timesheets         (EOR)
GET    /v1/timesheets/:id
PATCH  /v1/timesheets/:id     (EOR pre‑approval)
POST   /v1/timesheets/:id/submit (EOR)
POST   /v1/timesheets/:id/approve (Ops)
POST   /v1/timesheets/:id/reject  (Ops)

GET    /v1/leave              (EOR/Ops)
POST   /v1/leave              (EOR)
POST   /v1/leave/:id/approve  (Ops)
POST   /v1/leave/:id/reject   (Ops)

GET    /v1/documents/payslips (EOR self)
GET    /v1/documents/hr       (EOR self)
POST   /v1/documents/publish  (Ops)

GET    /v1/clients/:id/roster (Ops)
POST   /v1/assignments        (Ops)
POST   /v1/assignments/:id/transition (Ops)

GET    /v1/reports/…          (Ops, P1)
GET    /v1/audit              (SystemAdmin)
GET    /v1/settings/countries (SystemAdmin)

GET    /v1/notifications      (EOR/Ops)
PATCH  /v1/notifications/:id/read
PATCH  /v1/notifications/read-all
GET    /v1/users/me/notification-preferences
PATCH  /v1/users/me/notification-preferences

GET    /v1/documents/publishes (Ops)  -- optional; can also be derived via /v1/audit filters
```

**OpenAPI example (excerpt)**

```yaml
openapi: 3.1.0
info: { title: Teamified API, version: 1.0.0 }
paths:
  /v1/invitations:
    post:
      summary: Create an invitation
      headers:
        Idempotency-Key: { schema: { type: string }, required: false }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [firstName, lastName, email, country, role, clientId]
              properties:
                firstName: { type: string, maxLength: 100 }
                lastName:  { type: string, maxLength: 100 }
                email:     { type: string, format: email }
                country:   { type: string, enum: [IN, LK, PH] }
                role:      { type: string, enum: [EOR, Admin] }
                clientId:  { type: string, format: uuid }
      responses:
        '201': { description: Created }
        '400': { $ref: '#/components/responses/BadRequest' }
        '409': { description: Conflict }
```

---
