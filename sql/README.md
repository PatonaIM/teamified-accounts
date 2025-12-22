# Supabase PostgreSQL to Azure PostgreSQL Migration Scripts

This folder contains SQL scripts for migrating from Supabase PostgreSQL to Azure PostgreSQL Flexible Server.

## Overview

Since both Supabase and Azure use PostgreSQL, this migration is straightforward with full compatibility for:
- UUID data types
- JSONB columns
- Custom ENUM types
- Indexes and constraints
- All PostgreSQL-specific features

## Prerequisites

1. **Azure PostgreSQL Flexible Server** created and accessible
2. **PostgreSQL client tools** installed (`psql`, `pg_dump`, `pg_restore`)
3. **Network connectivity** between your migration host and both databases
4. **Supabase connection details** (found in Supabase Dashboard → Settings → Database)

## Migration Scripts

Run the scripts in the following order:

| Script | Description | Run On |
|--------|-------------|--------|
| `01_pre_migration_checks.sql` | Verify source database state | Supabase |
| `02_extensions_and_types.sql` | Create extensions and ENUM types | Azure |
| `03_schema_creation.sql` | Create all database tables | Azure |
| `04_indexes_and_constraints.sql` | Add indexes and foreign keys | Azure |
| `05_data_migration.sql` | Data migration commands (guide) | Migration Host |
| `06_post_migration_validation.sql` | Verify migration success | Both |

## Quick Start

### Step 1: Pre-Migration Checks (Supabase)

```bash
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f sql/01_pre_migration_checks.sql
```

### Step 2: Prepare Azure Database

```bash
# Connect to Azure PostgreSQL
psql -h [SERVER].postgres.database.azure.com -U [ADMIN_USER] -d postgres

# Run scripts in order
\i sql/02_extensions_and_types.sql
\i sql/03_schema_creation.sql
\i sql/04_indexes_and_constraints.sql
```

### Step 3: Migrate Data

Choose one of two methods:

#### Method A: Offline Migration (Recommended for < 100GB)

```bash
# Export from Supabase
pg_dump \
  -h db.[PROJECT-REF].supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  --format=custom \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  --file=supabase_export.dump

# Import to Azure
pg_restore \
  -h [SERVER].postgres.database.azure.com \
  -U [ADMIN_USER] \
  -d postgres \
  --data-only \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  --jobs=4 \
  supabase_export.dump
```

#### Method B: Online Migration (Minimal Downtime)

See `05_data_migration.sql` for detailed logical replication setup.

### Step 4: Validate Migration

```bash
# Run on both databases and compare outputs
psql -h [DATABASE_HOST] -U [USER] -d postgres -f sql/06_post_migration_validation.sql
```

## Estimated Migration Time

| Database Size | Method | Estimated Time |
|--------------|--------|----------------|
| < 10 GB | pg_dump/restore | 15-60 minutes |
| 10-50 GB | pg_dump/restore | 1-4 hours |
| 50-200 GB | pg_dump/restore | 4-12 hours |
| > 200 GB | Logical replication | 5-15 minutes downtime |

## Post-Migration Checklist

- [ ] Verify row counts match between source and target
- [ ] Check all sequences are correctly set
- [ ] Validate JSONB data integrity
- [ ] Test sample queries
- [ ] Verify foreign key constraints
- [ ] Update application connection strings
- [ ] Test application functionality
- [ ] Configure Azure backups and monitoring

## Application Changes Required

After migration, update your application:

1. **Connection String**: Update `DATABASE_URL` to Azure format:
   ```
   postgresql://[ADMIN]@[SERVER]:[PASSWORD]@[SERVER].postgres.database.azure.com:5432/postgres?sslmode=require
   ```

2. **Supabase-Specific Features** (if used):
   - **Realtime**: Replace with Azure SignalR Service
   - **Auth**: Consider Azure AD B2C or continue with separate auth
   - **Storage**: Migrate files to Azure Blob Storage
   - **Edge Functions**: Deploy to Azure Functions

## Troubleshooting

### Connection Issues
- Ensure Azure firewall allows your IP
- Use `sslmode=require` in connection string
- Verify credentials are correct

### Data Type Errors
- All PostgreSQL types are supported in Azure PostgreSQL
- No conversion needed for UUID, JSONB, INET, arrays, etc.

### Sequence Reset
If auto-increment columns show wrong values after migration:
```sql
SELECT setval('sequence_name', (SELECT MAX(id) FROM table_name) + 1, false);
```

### Foreign Key Violations During Import
Disable triggers before import:
```sql
SET session_replication_role = 'replica';
-- ... run import ...
SET session_replication_role = 'origin';
```

## Support

For Azure PostgreSQL documentation:
- [Azure Database for PostgreSQL](https://learn.microsoft.com/en-us/azure/postgresql/)
- [Migration Best Practices](https://learn.microsoft.com/en-us/azure/postgresql/migrate/migration-service/best-practices-migration-service-postgresql)
