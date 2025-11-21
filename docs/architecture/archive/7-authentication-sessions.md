# 7) Authentication & Sessions

- **Flow:** Email + password (MVP) with email verification on invite acceptance.
- **Tokens:** JWT access (15 min) + refresh (30 days, rotation, revocation on use).
- **Password hashing:** Argon2id with memory‑hard params.
- **Brute‑force protection:** Rate limiting by IP + account; incremental backoff.
- **CORS/CSRF:** For SPA with cookies, enable SameSite=Lax and anti‑CSRF token; or use Authorization header with local storage (recommended: cookies + CSRF).
- **Sessions table** stores refresh token family with device metadata.

---
