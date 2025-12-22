-- ============================================================================
-- Supabase PostgreSQL to Azure PostgreSQL Migration
-- Script 06: Post-Migration Validation
-- ============================================================================
-- Purpose: Verify data integrity after migration to Azure PostgreSQL
-- Run this script against BOTH source (Supabase) and target (Azure) databases
-- Compare the results to ensure successful migration
-- ============================================================================

\echo '=============================================='
\echo 'POST-MIGRATION VALIDATION'
\echo '=============================================='
\echo ''
\echo 'Run this script on both Supabase and Azure PostgreSQL.'
\echo 'Compare the outputs to verify successful migration.'
\echo ''

-- ============================================================================
-- 1. DATABASE OVERVIEW
-- ============================================================================
\echo '1. Database Overview'
\echo '--------------------'

SELECT current_database() AS database_name;
SELECT version() AS postgresql_version;
SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size;

-- ============================================================================
-- 2. TABLE ROW COUNTS
-- ============================================================================
\echo ''
\echo '2. Table Row Counts (Compare Source vs Target)'
\echo '-----------------------------------------------'

SELECT 
    schemaname AS schema,
    tablename AS table_name,
    n_live_tup AS row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- More accurate counts (if statistics are stale):
\echo ''
\echo '2b. Exact Row Counts (May take longer for large tables)'
\echo '--------------------------------------------------------'

SELECT 'api_keys' AS table_name, COUNT(*) AS exact_count FROM api_keys
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'countries', COUNT(*) FROM countries
UNION ALL
SELECT 'currencies', COUNT(*) FROM currencies
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'employment_records', COUNT(*) FROM employment_records
UNION ALL
SELECT 'eor_profiles', COUNT(*) FROM eor_profiles
UNION ALL
SELECT 'exchange_rates', COUNT(*) FROM exchange_rates
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations
UNION ALL
SELECT 'leave_approvals', COUNT(*) FROM leave_approvals
UNION ALL
SELECT 'leave_balances', COUNT(*) FROM leave_balances
UNION ALL
SELECT 'leave_requests', COUNT(*) FROM leave_requests
UNION ALL
SELECT 'migrations', COUNT(*) FROM migrations
UNION ALL
SELECT 'oauth_clients', COUNT(*) FROM oauth_clients
UNION ALL
SELECT 'onboarding_document_requirements', COUNT(*) FROM onboarding_document_requirements
UNION ALL
SELECT 'organization_invitations', COUNT(*) FROM organization_invitations
UNION ALL
SELECT 'organization_members', COUNT(*) FROM organization_members
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'payroll_periods', COUNT(*) FROM payroll_periods
UNION ALL
SELECT 'payroll_processing_logs', COUNT(*) FROM payroll_processing_logs
UNION ALL
SELECT 'payslips', COUNT(*) FROM payslips
UNION ALL
SELECT 'performance_metrics', COUNT(*) FROM performance_metrics
UNION ALL
SELECT 'region_configurations', COUNT(*) FROM region_configurations
UNION ALL
SELECT 'salary_components', COUNT(*) FROM salary_components
UNION ALL
SELECT 'salary_history', COUNT(*) FROM salary_history
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'statutory_components', COUNT(*) FROM statutory_components
UNION ALL
SELECT 'tax_years', COUNT(*) FROM tax_years
UNION ALL
SELECT 'timesheet_approvals', COUNT(*) FROM timesheet_approvals
UNION ALL
SELECT 'timesheets', COUNT(*) FROM timesheets
UNION ALL
SELECT 'user_app_activity', COUNT(*) FROM user_app_activity
UNION ALL
SELECT 'user_app_permissions', COUNT(*) FROM user_app_permissions
UNION ALL
SELECT 'user_emails', COUNT(*) FROM user_emails
UNION ALL
SELECT 'user_oauth_logins', COUNT(*) FROM user_oauth_logins
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'user_themes', COUNT(*) FROM user_themes
UNION ALL
SELECT 'users', COUNT(*) FROM users
ORDER BY table_name;

-- ============================================================================
-- 3. ENUM TYPES VERIFICATION
-- ============================================================================
\echo ''
\echo '3. ENUM Types Verification'
\echo '--------------------------'

SELECT t.typname AS enum_name, 
       string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_namespace n ON n.oid = t.typnamespace 
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================================================
-- 4. SEQUENCE VALUES
-- ============================================================================
\echo ''
\echo '4. Sequence Current Values'
\echo '--------------------------'

SELECT 
    sequencename AS sequence_name,
    last_value
FROM pg_sequences
WHERE schemaname = 'public'
ORDER BY sequencename;

-- ============================================================================
-- 5. FOREIGN KEY CONSTRAINTS
-- ============================================================================
\echo ''
\echo '5. Foreign Key Constraints'
\echo '--------------------------'

SELECT COUNT(*) AS total_foreign_keys
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';

-- List of FK constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- 6. INDEX COUNT
-- ============================================================================
\echo ''
\echo '6. Index Count by Table'
\echo '-----------------------'

SELECT 
    tablename AS table_name,
    COUNT(*) AS index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 7. DATA INTEGRITY CHECKS
-- ============================================================================
\echo ''
\echo '7. Data Integrity Checks'
\echo '------------------------'

-- Check for orphaned records (users without clients where client_id is NOT NULL)
\echo '7a. Users with invalid client_id references:'
SELECT COUNT(*) AS orphaned_users
FROM users u
WHERE u.client_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = u.client_id);

-- Check for orphaned employment records
\echo '7b. Employment records with invalid references:'
SELECT COUNT(*) AS orphaned_employment_records
FROM employment_records er
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = er.user_id)
   OR NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = er.client_id)
   OR NOT EXISTS (SELECT 1 FROM countries co WHERE co.id = er.country_id);

-- Check for orphaned documents
\echo '7c. Documents with invalid user references:'
SELECT COUNT(*) AS orphaned_documents
FROM documents d
WHERE d.user_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = d.user_id);

-- ============================================================================
-- 8. SAMPLE DATA VERIFICATION
-- ============================================================================
\echo ''
\echo '8. Sample Data Verification'
\echo '---------------------------'

-- First user (verify data migrated correctly)
\echo '8a. First 3 users (sample):'
SELECT id, email, first_name, last_name, is_active, created_at
FROM users
ORDER BY created_at
LIMIT 3;

-- First client
\echo '8b. First 3 clients (sample):'
SELECT id, name, status, created_at
FROM clients
ORDER BY created_at
LIMIT 3;

-- Currency data
\echo '8c. All currencies:'
SELECT id, code, name, symbol
FROM currencies
ORDER BY code;

-- Country data
\echo '8d. All countries:'
SELECT id, code, name
FROM countries
ORDER BY code;

-- ============================================================================
-- 9. JSONB DATA VERIFICATION
-- ============================================================================
\echo ''
\echo '9. JSONB Data Verification'
\echo '--------------------------'

-- Verify JSONB data is intact
\echo '9a. Sample JSONB data from eor_profiles.skills:'
SELECT id, skills
FROM eor_profiles
WHERE skills IS NOT NULL
LIMIT 3;

\echo '9b. Sample JSONB data from payslips.salary_components:'
SELECT id, salary_components
FROM payslips
WHERE salary_components IS NOT NULL
LIMIT 3;

-- ============================================================================
-- 10. EXTENSION VERIFICATION
-- ============================================================================
\echo ''
\echo '10. Extension Verification'
\echo '--------------------------'

SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'plpgsql')
ORDER BY extname;

-- Test UUID generation functions
\echo '10b. UUID Function Tests:'
SELECT uuid_generate_v4() AS uuid_v4_test;
SELECT gen_random_uuid() AS random_uuid_test;

-- ============================================================================
-- 11. DATE/TIMESTAMP VERIFICATION
-- ============================================================================
\echo ''
\echo '11. Date Range Verification'
\echo '---------------------------'

-- Check date ranges to ensure timezone handling is correct
SELECT 
    'users' AS table_name,
    MIN(created_at) AS earliest_record,
    MAX(created_at) AS latest_record
FROM users
WHERE created_at IS NOT NULL
UNION ALL
SELECT 
    'employment_records',
    MIN(created_at),
    MAX(created_at)
FROM employment_records
WHERE created_at IS NOT NULL
UNION ALL
SELECT 
    'payslips',
    MIN(created_at),
    MAX(created_at)
FROM payslips
WHERE created_at IS NOT NULL
ORDER BY table_name;

-- ============================================================================
-- 12. SUMMARY REPORT
-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'VALIDATION SUMMARY'
\echo '=============================================='
\echo ''

SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS total_tables,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') AS total_indexes,
    (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') AS total_foreign_keys,
    (SELECT COUNT(*) FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') AS total_enum_types;

-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'POST-MIGRATION VALIDATION COMPLETE'
\echo '=============================================='
\echo ''
\echo 'Compare the outputs from both Supabase and Azure PostgreSQL.'
\echo 'Key items to verify:'
\echo '  - Row counts match for all tables'
\echo '  - Sequence values are correct'
\echo '  - All ENUM types are present with correct values'
\echo '  - Foreign key constraints are in place'
\echo '  - Sample data looks correct'
\echo '  - JSONB data is intact'
\echo '  - No orphaned records'
\echo ''
\echo 'If all checks pass, the migration was successful!'
\echo ''
