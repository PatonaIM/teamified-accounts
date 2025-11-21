# Local Storage Directory

This directory is used for local file storage during development. In production, files are stored in Vercel Blob Storage.

## Structure

```
storage/
├── cvs/              # CV/Resume files
├── documents/        # General documents (identity, employment, education)
├── payslips/         # Payslip PDFs
└── tax-documents/    # Tax-related documents
```

## Docker Configuration

The storage directory is mounted as a volume in `docker-compose.yml`:

```yaml
volumes:
  - ./storage:/app/storage
```

## Git Configuration

The storage directory itself is tracked in git (via `.gitkeep`), but uploaded files are ignored via `.gitignore`:

```
# Local storage directory
storage/
!storage/.gitkeep
!storage/README.md
```

## Permissions

The directory should have `755` permissions to allow the NestJS application (running as user `nestjs` in Docker) to read and write files.

```bash
chmod 755 storage
```

## Environment-Specific Behavior

- **Local Development**: Files are stored in this directory
- **Vercel Production**: Files are stored in Vercel Blob Storage
- The `StorageService` automatically detects the environment and uses the appropriate storage backend

