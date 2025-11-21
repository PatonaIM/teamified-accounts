# Vercel Database Setup Guide

## 📋 Overview

This guide explains how to set up the Teamified database on Vercel Postgres using the project's SQL-based approach (not TypeORM migrations).

## 🗄️ Database Setup Process

### Step 1: Create Vercel Postgres Database

1. Go to Vercel Dashboard → Your Project
2. Navigate to "Storage" tab
3. Click "Create Database" → "Postgres"
4. Name: `teamified-db`
5. Select region closest to your users
6. Copy the connection strings

### Step 2: Set Up Database Schema

The project uses SQL scripts instead of TypeORM migrations:

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to Vercel Dashboard → Your Project → Storage → Postgres
2. Click "Connect" to open the database
3. Copy the contents of `init-db.sql` from the project
4. Paste and execute the SQL in the database editor
5. This creates all tables, enums, and constraints

#### Option B: Using External Database Tool

1. Install a PostgreSQL client (pgAdmin, DBeaver, or psql)
2. Connect using the `POSTGRES_URL` from your environment variables
3. Run the `init-db.sql` script
4. Optionally run `setup-database.sh` for test data

### Step 3: Verify Database Setup

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if test data exists
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
```

## 📁 SQL Files in Project

### `init-db.sql` - Main Database Schema
- Creates all tables and relationships
- Sets up enums and constraints
- Includes basic admin user and client data
- **Must be run first**

### `setup-database.sh` - Additional Test Data
- Adds more test users and clients
- Creates employment records and salary history
- Sets up user roles and permissions
- **Optional - for development/testing**

## 🔧 Database Configuration

The project uses this database configuration:

```typescript
// src/config/database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: [Document, User, EORProfile, AuditLog],
  synchronize: false, // Use SQL scripts instead of migrations
  logging: process.env.NODE_ENV === 'development',
  extra: {
    connectionLimit: 10,
    acquireTimeoutMillis: 30000,
    timeout: 20000,
  },
};
```

## 🚀 Automated Setup (Alternative)

If you want to automate the database setup, you can create a script:

```bash
#!/bin/bash
# setup-vercel-db.sh

# Get database URL from environment
DB_URL=$POSTGRES_URL

# Run init-db.sql
psql $DB_URL -f init-db.sql

# Run additional setup if needed
psql $DB_URL -c "INSERT INTO users (id, email, password_hash, first_name, last_name, status, is_active, email_verified) VALUES ('650e8400-e29b-41d4-a716-446655440001', 'admin@teamified.com', '\$argon2id\$v=19\$m=65536,t=3,p=1\$3RHN3pRbXqlkSS4BcQUMSQ\$sEvjl2yJV+Tj0cmuGUxkBJNyoyXJJFEjFEuQhJ4kWD0', 'Admin', 'User', 'active', true, true) ON CONFLICT (id) DO NOTHING;"
```

## 🧪 Test Data

After running `init-db.sql`, you'll have:

### Basic Data
- 1 admin user: `admin@teamified.com` / `Admin123!`
- 2 test clients
- Basic role assignments

### Additional Test Data (Optional)
Run `setup-database.sh` for more test data:
- HR manager: `hr@teamified.com` / `HRManager123!`
- EOR users: `john.doe@example.com` / `EORUser123!`
- Employment records and salary history

## 🔍 Verification

### Check Database Connection
```bash
# Test connection
curl https://your-backend.vercel.app/api/health/detailed
```

### Check Tables
```sql
-- List all tables
\dt

-- Check user count
SELECT COUNT(*) FROM users;

-- Check if admin user exists
SELECT email, first_name, last_name FROM users WHERE email = 'admin@teamified.com';
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check `POSTGRES_URL` environment variable
   - Verify SSL configuration
   - Ensure database is created in Vercel

2. **Table Not Found**
   - Run `init-db.sql` script
   - Check if schema was created properly
   - Verify table names match the SQL script

3. **Permission Denied**
   - Check database user permissions
   - Verify connection string format
   - Ensure SSL is configured correctly

### Debug Commands

```bash
# Check environment variables
vercel env ls

# Test database connection
psql $POSTGRES_URL -c "SELECT version();"

# List tables
psql $POSTGRES_URL -c "\dt"
```

## 📊 Database Schema Overview

The database includes these main tables:

- **users** - User accounts and profiles
- **clients** - Client companies
- **user_roles** - Role-based access control
- **employment_records** - Employment history
- **salary_history** - Salary tracking
- **documents** - File storage metadata
- **audit_logs** - System audit trail
- **invitations** - User invitations
- **leave_requests** - Leave management
- **timesheets** - Time tracking

## 🎯 Next Steps

1. **Run `init-db.sql`** to create the schema
2. **Set up environment variables** in Vercel
3. **Test database connection** from your backend
4. **Verify API endpoints** are working
5. **Add test data** if needed for development

---

**Important:** This project uses SQL-based database setup, not TypeORM migrations. Always use the provided SQL scripts for database initialization.
