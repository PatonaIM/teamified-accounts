# Database Setup Guide

This guide explains how to properly set up the Teamified Portal database from scratch.

## Quick Setup

### Option 1: Use Complete Init Script (Recommended)

Replace the existing `init-db.sql` with `init-db-complete.sql` in your `docker-compose.yml`:

```yaml
volumes:
  - ./init-db-complete.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
```

Then restart the database:
```bash
docker-compose down -v
docker-compose up -d postgres
```

This will create all tables, constraints, and basic test data automatically.

### Option 2: Use Setup Script for Additional Data

If you want to add more test users and sample data beyond what's in the init script:

```bash
./scripts/setup-database.sh
```

This script will:
- Add additional test users (HR manager, EOR users)
- Add additional user roles
- Create employment records for the additional users
- Add more sample clients

## Manual Setup Steps

If you prefer to set up the database manually, follow these steps:

### 1. Start the Database

```bash
docker-compose up -d postgres
```

### 2. Wait for PostgreSQL to be Ready

```bash
docker-compose exec postgres pg_isready -U postgres -d teamified_portal
```

### 3. Create Missing Tables

The following tables are required but may not exist in a fresh database:

#### Employment Records Table

```sql
CREATE TABLE employment_records (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date,
    role character varying(100) NOT NULL,
    status character varying(20) NOT NULL DEFAULT 'active',
    migrated_from_zoho boolean NOT NULL DEFAULT false,
    zoho_employment_id character varying(100),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_employment_per_client UNIQUE (user_id, client_id, status),
    CONSTRAINT CHK_898282bcae1e0ae6bd69f21dc4 CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT CHK_e437a1064f23726ca4522f35a0 CHECK (status IN ('active', 'inactive', 'terminated', 'completed')),
    CONSTRAINT PK_12524bc9c212bc229148563915c PRIMARY KEY (id)
);
```

#### Salary History Table

```sql
CREATE TABLE salary_history (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    employment_record_id uuid NOT NULL,
    salary_amount numeric(12,2) NOT NULL,
    salary_currency character varying(3) NOT NULL DEFAULT 'USD',
    effective_date date NOT NULL,
    change_reason character varying(100) NOT NULL,
    changed_by uuid,
    migrated_from_zoho boolean NOT NULL DEFAULT false,
    zoho_salary_id character varying(100),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_effective_date_per_employment UNIQUE (employment_record_id, effective_date),
    CONSTRAINT CHK_7217c53ed308ce85044ca23455 CHECK (salary_amount > 0),
    CONSTRAINT PK_796fc91fc02d8e1b35a08c3de32 PRIMARY KEY (id)
);
```

### 4. Add Missing Columns

#### Users Table

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone character varying(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status character varying(20) NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS migrated_from_zoho boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zoho_user_id character varying(100);
```

#### Clients Table

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_info jsonb;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status character varying(20) NOT NULL DEFAULT 'active';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS migrated_from_zoho boolean NOT NULL DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zoho_client_id character varying(100);
```

### 5. Create Indexes

```sql
-- Employment Records Indexes
CREATE INDEX IF NOT EXISTS IDX_a98d305bd9c09a4ee7da7a8eb3 ON employment_records (start_date);
CREATE INDEX IF NOT EXISTS IDX_633369691ec3f202f45cebb5a3 ON employment_records (status);
CREATE INDEX IF NOT EXISTS IDX_44647ac5c8f293e89f11b3dba9 ON employment_records (client_id);
CREATE INDEX IF NOT EXISTS IDX_478ac6932654d54eac2f82a5ab ON employment_records (user_id);

-- Salary History Indexes
CREATE INDEX IF NOT EXISTS IDX_e95a5187bae79f6c823045a337 ON salary_history (effective_date);
CREATE INDEX IF NOT EXISTS IDX_5c56fe595714603a8f31f593ed ON salary_history (employment_record_id);
```

### 6. Add Constraints

```sql
-- User Status Constraint
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS CHK_ac185881bfade295dd02abb641 CHECK (status IN ('active', 'inactive', 'archived'));

-- Client Status Constraint
ALTER TABLE clients ADD CONSTRAINT IF NOT EXISTS CHK_c30a5ccec578c3004aeaa11ba0 CHECK (status IN ('active', 'inactive'));
```

### 7. Add Foreign Key Constraints

```sql
ALTER TABLE employment_records ADD CONSTRAINT IF NOT EXISTS FK_478ac6932654d54eac2f82a5ab9 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE employment_records ADD CONSTRAINT IF NOT EXISTS FK_44647ac5c8f293e89f11b3dba98 FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE salary_history ADD CONSTRAINT IF NOT EXISTS FK_5c56fe595714603a8f31f593edb FOREIGN KEY (employment_record_id) REFERENCES employment_records(id) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE salary_history ADD CONSTRAINT IF NOT EXISTS FK_6fbd146356f8db3ff47212f0fb1 FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
```

## Test User Credentials

After running the setup script, you'll have these test users available:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@teamified.com | Admin123! | admin | Full system access |
| hr@teamified.com | HRManager123! | admin | Full system access |
| john.doe@example.com | EORUser123! | eor | Client-specific access |
| jane.smith@example.com | EORUser123! | eor | Client-specific access |

## Password Generation

If you need to generate new password hashes, use the provided script:

```bash
node generate-password.js "YourPassword123!"
```

This will output an Argon2 hash that can be used in the database.

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

3. Test connection:
   ```bash
   docker-compose exec postgres pg_isready -U postgres -d teamified_portal
   ```

### Missing Tables/Columns

If you encounter errors about missing tables or columns, run the setup script:

```bash
./scripts/setup-database.sh
```

### Reset Database

To completely reset the database:

```bash
docker-compose down -v  # This removes all volumes
docker-compose up -d postgres
./scripts/setup-database.sh
```

## Production Considerations

For production deployments:

1. **Change default passwords** - All test user passwords should be changed
2. **Use environment variables** - Store database credentials securely
3. **Enable SSL** - Configure PostgreSQL with SSL certificates
4. **Backup strategy** - Implement regular database backups
5. **Migration system** - Consider using TypeORM migrations for schema changes

## Schema Overview

The database includes these main entities:

- **users** - System users (admin, HR, EOR, candidates)
- **clients** - Client companies
- **user_roles** - Role-based access control
- **employment_records** - Employment relationships between users and clients
- **salary_history** - Salary tracking for employment records
- **sessions** - User authentication sessions
- **invitations** - User invitation system
- **audit_logs** - System audit trail

## API Endpoints

Once the database is set up, these endpoints will be available:

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/users/*` (admin/HR only)
- **Employment Records**: `/api/employment-records/*` (admin/HR only)
- **Health Check**: `/health`

For full API documentation, visit: http://localhost:3000/api/docs
