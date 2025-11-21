# 8) Documents & Storage

- **Buckets/Prefixes:**
  - `payslips/{eorId}/{yyyy-mm}.pdf` (immutable)
  - `hr-docs/{docId}.pdf` (versioned)
  - `cv/{eorId}/{versionId}.pdf|docx`
- **Access:** Server‑generated, short‑lived **signed URLs**; enforce ownership/role checks.
- **Virus scanning:** Async scan on upload; quarantine on fail.
- **Metadata:** Content type, size, SHA‑256 checksum, tags (clientId, country, period).
- **Retention:** Payslips immutable; HR docs versioned; CVs retain N latest versions (configurable).

---
