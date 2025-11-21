# Database Seeding Scripts

This directory contains scripts for seeding the User Management System database with test data for local development and testing.

## Files

- `seed-database-enhanced.js` - Enhanced Node.js script for seeding the database with comprehensive profile data
- `seed-database.js` - Original Node.js script for seeding the database
- `../src/migrations/seed-database.sql` - SQL script for seeding the database

## Prerequisites

1. **Docker Setup**: Ensure Docker is running and the PostgreSQL container is started:
   ```bash
   # Start the PostgreSQL container
   docker-compose up -d postgres
   
   # Or start the full stack
   docker-compose up -d
   ```

2. **Database Connection**: The script connects to the Docker PostgreSQL instance:
   - **Host**: `localhost` (Docker port mapping)
   - **Port**: `5432` (mapped from container)
   - **Database**: `teamified_portal`
   - **User**: `postgres`
   - **Password**: `password`

3. **Dependencies**: Install required Node.js packages:
   ```bash
   npm install pg argon2
   # or
   yarn add pg argon2
   ```

4. **Local PostgreSQL**: Ensure no local PostgreSQL service is running on port 5432 to avoid conflicts with the Docker instance.

## Usage

### Option 1: Enhanced Node.js Script (Recommended)

```bash
# Run the enhanced seeding script with comprehensive profile data
node scripts/seed-database-enhanced.js

# Or run the original script
node scripts/seed-database.js

# Or add to package.json and run
npm run seed:enhanced
npm run seed:db
```

### Option 2: SQL Script

```bash
# Run the SQL script directly (requires psql client)
# Option A: Using Docker exec (recommended)
docker exec -i teamified_postgres_dev psql -U postgres -d teamified_portal < src/migrations/seed-database.sql

# Option B: Using local psql client (if installed)
psql -h localhost -U postgres -d teamified_portal -f src/migrations/seed-database.sql
```

## What Gets Seeded

The enhanced seeding script creates the following comprehensive test data:

### Users (25 records)
- **Admin Users**: `user1@teamified.com`, `user2@teamified.com`
- **Timesheet Approvers**: `user3@teamified.com`, `user4@teamified.com`, `user5@teamified.com`
- **EOR Users**: `user6@teamified.com`, `user7@teamified.com`, `user8@teamified.com`
- **Candidates**: `user9@teamified.com` through `user25@teamified.com`

### Comprehensive Profile Data
Each user includes realistic profile data stored in the `User.profile_data` JSONB field:
- **Personal Information**: Date of birth, gender, marital status, nationality, address, phone numbers
- **Government IDs**: PAN, Aadhaar, Passport, Driving License, Voter ID
- **Banking Information**: Bank name, account number, IFSC code, branch details
- **Employment Details**: Employee ID, department, designation, work location, reporting manager
- **Documents**: Resume, offer letter, contract, ID proofs, address proofs
- **Preferences**: Communication language, timezone, notification settings
- **Onboarding Status**: Completion tracking with pending and completed steps
- **Emergency Contacts**: Name, relationship, phone, address

### Clients (5 records)
- **Acme Corporation** (Active)
- **TechStart Inc** (Active)
- **Global Solutions Ltd** (Active)
- **Innovation Hub** (Active)
- **Future Systems** (Active)

### User Roles (25 records)
- Admin roles with global access
- Timesheet approver roles with approval permissions
- EOR roles with client-specific access
- Candidate roles with user-specific access

### Employment Records & Salary History
- Will be added when those tables are created
- Currently returns empty arrays as expected

## Test User Credentials

After seeding, you can use these test accounts:

| Email | Name | Role | Password | Access Level |
|-------|------|------|----------|--------------|
| `user1@teamified.com` | Anita Reddy | Admin | `Admin123!` | Full system access |
| `user2@teamified.com` | Meera Agarwal | Admin | `Admin123!` | Full system access |
| `user3@teamified.com` | Meera Nair | Timesheet Approver | `Approver123!` | Timesheet approval access |
| `user4@teamified.com` | [Generated Name] | Timesheet Approver | `Approver123!` | Timesheet approval access |
| `user5@teamified.com` | [Generated Name] | Timesheet Approver | `Approver123!` | Timesheet approval access |
| `user6@teamified.com` | [Generated Name] | EOR | `EOR123!` | Client-specific access |
| `user7@teamified.com` | [Generated Name] | EOR | `EOR123!` | Client-specific access |
| `user8@teamified.com` | [Generated Name] | EOR | `EOR123!` | Client-specific access |
| `user9@teamified.com` | [Generated Name] | Candidate | `Candidate123!` | User-specific access |
| `user10@teamified.com` | [Generated Name] | Candidate | `Candidate123!` | User-specific access |
| ... | ... | ... | ... | ... |
| `user25@teamified.com` | [Generated Name] | Candidate | `Candidate123!` | User-specific access |

### Password Pattern
All passwords follow the pattern: `[Role]123!`
- **Admin**: `Admin123!`
- **Timesheet Approver**: `Approver123!`
- **EOR**: `EOR123!`
- **Candidate**: `Candidate123!`

### Primary Admin Access
For immediate testing, use:
- **Email**: `user1@teamified.com`
- **Password**: `Admin123!`
- **Name**: Anita Reddy

## Features Tested

The seeded data allows you to test:

### User Management
- ✅ User CRUD operations
- ✅ User search and filtering
- ✅ User status management
- ✅ Comprehensive profile data management (JSONB)
- ✅ Profile completion tracking
- ✅ Onboarding status management

### Client Management
- ✅ Client CRUD operations
- ✅ Client status management
- ✅ Contact information management

### Employment Management
- ✅ Employment record creation and updates
- ✅ Employment status tracking
- ✅ Historical employment data

### Salary Management
- ✅ Salary history tracking
- ✅ Salary change reasons
- ✅ Historical salary data

### Role Management
- ✅ Role assignment and removal
- ✅ Scope-based permissions
- ✅ Role expiration handling
- ✅ Timesheet approver roles
- ✅ Admin, EOR, and Candidate role types

### Multi-tenancy
- ✅ Client data isolation
- ✅ User access based on employment records
- ✅ Admin access to all data

## API Testing

You can test the following API endpoints with the seeded data:

### Users API
```bash
# Get all users
GET /api/v1/users

# Get specific user
GET /api/v1/users/650e8400-e29b-41d4-a716-446655440001

# Search users
GET /api/v1/users?search=anita&status=active

# Get user profile data
GET /api/v1/users/me/profile

# Update user profile data
PUT /api/v1/users/me/profile

# Get user employment records
GET /api/v1/users/me/employment
```

### Clients API
```bash
# Get all clients
GET /api/v1/clients

# Get specific client
GET /api/v1/clients/550e8400-e29b-41d4-a716-446655440001
```

### Employment Records API
```bash
# Get employment records
GET /api/v1/employment-records

# Get records for specific user
GET /api/v1/employment-records?user_id=650e8400-e29b-41d4-a716-446655440001

# Get user's employment records (authenticated)
GET /api/v1/users/me/employment
```

### Salary History API
```bash
# Get salary history
GET /api/v1/salary-history?employment_record_id=750e8400-e29b-41d4-a716-446655440001
```

## Resetting Data

To reset the database and reseed:

```bash
# Option 1: Run the enhanced script again (it clears existing data first)
node scripts/seed-database-enhanced.js

# Option 2: Run the original script
node scripts/seed-database.js

# Option 3: Clear and reseed manually
docker exec teamified_postgres_dev psql -U postgres -d teamified_portal -c "TRUNCATE TABLE audit_logs, user_roles, clients, users RESTART IDENTITY CASCADE;"
node scripts/seed-database-enhanced.js
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if Docker is running: `docker ps`
   - Verify PostgreSQL container is healthy: `docker ps | grep postgres`
   - Check container logs: `docker logs teamified_postgres_dev`
   - Ensure no local PostgreSQL is running on port 5432

2. **Permission Denied**
   - Check database user permissions
   - Ensure user can create tables and insert data
   - Verify Docker container has proper permissions

3. **Data Already Exists**
   - The script automatically clears existing data
   - If issues persist, manually truncate tables or restart container

4. **Port Conflict (5432)**
   - Stop any local PostgreSQL service: `brew services stop postgresql@15`
   - Ensure only Docker PostgreSQL is using port 5432
   - Check port usage: `lsof -i :5432`

### Debug Mode

To run with debug output:

```bash
DEBUG=* node scripts/seed-database-enhanced.js
```

## Customization

You can customize the seeded data by modifying:

1. **Enhanced Node.js Script**: Edit `scripts/seed-database-enhanced.js` and modify the `generateSeedData()` method
2. **Original Node.js Script**: Edit `scripts/seed-database.js` and modify the `generateSeedData()` method
3. **SQL Script**: Edit `src/migrations/seed-database.sql` and modify the INSERT statements

### Profile Data Customization

The enhanced script generates comprehensive profile data including:
- Personal information (name, DOB, gender, marital status, etc.)
- Government IDs (PAN, Aadhaar, Passport, etc.)
- Banking information (account details, IFSC codes, etc.)
- Employment details (department, designation, work location, etc.)
- Document references (resume, contracts, proofs, etc.)
- Preferences (language, timezone, notifications, etc.)
- Onboarding status and completion tracking

You can modify the `generateProfileData()` method to customize the generated data structure and values.

## Production Warning

⚠️ **Never run these seeding scripts in production!** They are designed for development and testing only. Production data should be migrated using proper migration scripts.

---

*For more information about the User Management System, see the main documentation.*
