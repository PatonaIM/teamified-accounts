-- ============================================================================
-- Supabase PostgreSQL to Azure PostgreSQL Migration
-- Script 05: Data Migration Guide
-- ============================================================================
-- Purpose: Commands and procedures for migrating data from Supabase to Azure
-- This is a GUIDE script - run commands from your local machine or migration host
-- ============================================================================

-- ============================================================================
-- MIGRATION METHOD OVERVIEW
-- ============================================================================
--
-- This script provides TWO migration methods:
--
-- METHOD A: Offline Migration (pg_dump/pg_restore)
--   - Simple, reliable approach
--   - Requires planned downtime
--   - Best for databases <100GB
--
-- METHOD B: Online Migration (Logical Replication)
--   - Minimal downtime (minutes)
--   - More complex setup
--   - Best for large databases or strict uptime requirements
--
-- ============================================================================

-- ============================================================================
-- PREREQUISITES
-- ============================================================================
--
-- 1. Azure PostgreSQL Flexible Server created
-- 2. Scripts 02-04 already executed on Azure PostgreSQL
-- 3. Network connectivity between migration host and both databases
-- 4. PostgreSQL client tools installed (pg_dump, pg_restore, psql)
--
-- Supabase Connection String Format:
--   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
--
-- Azure Connection String Format:
--   postgresql://[admin]@[server]:[password]@[server].postgres.database.azure.com:5432/postgres?sslmode=require
--
-- ============================================================================

-- ============================================================================
-- METHOD A: OFFLINE MIGRATION (pg_dump/pg_restore)
-- ============================================================================

\echo '=============================================='
\echo 'METHOD A: OFFLINE MIGRATION GUIDE'
\echo '=============================================='
\echo ''

-- ----------------------------------------------------------------------------
-- STEP A1: Export from Supabase (Run from migration host)
-- ----------------------------------------------------------------------------
\echo 'STEP A1: Export Data from Supabase'
\echo '-----------------------------------'
\echo ''
\echo 'Run this command from your local machine or migration server:'
\echo ''
\echo '# Set environment variables'
\echo 'export SUPABASE_HOST="db.[YOUR-PROJECT-REF].supabase.co"'
\echo 'export SUPABASE_PASSWORD="[YOUR-PASSWORD]"'
\echo ''
\echo '# Export data only (schema already created via scripts 02-04)'
\echo 'pg_dump \'
\echo '  -h $SUPABASE_HOST \'
\echo '  -p 5432 \'
\echo '  -U postgres \'
\echo '  -d postgres \'
\echo '  --data-only \'
\echo '  --format=custom \'
\echo '  --no-owner \'
\echo '  --no-privileges \'
\echo '  --disable-triggers \'
\echo '  --verbose \'
\echo '  --file=supabase_data_export.dump'
\echo ''
\echo 'Password will be prompted. Enter your Supabase database password.'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP A2: Alternative - Export as SQL for review
-- ----------------------------------------------------------------------------
\echo 'STEP A1b: Alternative - Export as Plain SQL'
\echo '--------------------------------------------'
\echo ''
\echo '# Export as plain SQL (useful for reviewing data before import)'
\echo 'pg_dump \'
\echo '  -h $SUPABASE_HOST \'
\echo '  -p 5432 \'
\echo '  -U postgres \'
\echo '  -d postgres \'
\echo '  --data-only \'
\echo '  --inserts \'
\echo '  --no-owner \'
\echo '  --no-privileges \'
\echo '  --disable-triggers \'
\echo '  --file=supabase_data_export.sql'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP A3: Disable Foreign Keys on Azure (Before Import)
-- ----------------------------------------------------------------------------
\echo 'STEP A2: Disable Triggers on Azure (Before Import)'
\echo '---------------------------------------------------'

-- Run this on Azure PostgreSQL before importing data:
-- This disables trigger-based FK checks during import

/*
-- Connect to Azure PostgreSQL and run:
SET session_replication_role = 'replica';

-- This disables all triggers including FK constraint triggers
-- IMPORTANT: Re-enable after import!
*/

\echo ''
\echo 'Run on Azure PostgreSQL:'
\echo '  SET session_replication_role = ''replica'';'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP A4: Import to Azure PostgreSQL
-- ----------------------------------------------------------------------------
\echo 'STEP A3: Import Data to Azure PostgreSQL'
\echo '-----------------------------------------'
\echo ''
\echo '# Set Azure environment variables'
\echo 'export AZURE_HOST="[YOUR-SERVER].postgres.database.azure.com"'
\echo 'export AZURE_USER="[YOUR-ADMIN-USER]"'
\echo 'export AZURE_PASSWORD="[YOUR-PASSWORD]"'
\echo ''
\echo '# Import using pg_restore (for .dump format)'
\echo 'pg_restore \'
\echo '  -h $AZURE_HOST \'
\echo '  -p 5432 \'
\echo '  -U $AZURE_USER \'
\echo '  -d postgres \'
\echo '  --data-only \'
\echo '  --no-owner \'
\echo '  --no-privileges \'
\echo '  --disable-triggers \'
\echo '  --verbose \'
\echo '  --jobs=4 \'
\echo '  supabase_data_export.dump'
\echo ''
\echo '# OR import plain SQL file'
\echo 'psql \'
\echo '  -h $AZURE_HOST \'
\echo '  -p 5432 \'
\echo '  -U $AZURE_USER \'
\echo '  -d postgres \'
\echo '  -f supabase_data_export.sql'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP A5: Re-enable Foreign Keys
-- ----------------------------------------------------------------------------
\echo 'STEP A4: Re-enable Triggers on Azure (After Import)'
\echo '----------------------------------------------------'

/*
-- Connect to Azure PostgreSQL and run:
SET session_replication_role = 'origin';

-- Re-enables all triggers
*/

\echo ''
\echo 'Run on Azure PostgreSQL:'
\echo '  SET session_replication_role = ''origin'';'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP A6: Reset Sequences
-- ----------------------------------------------------------------------------
\echo 'STEP A5: Reset Sequences'
\echo '------------------------'
\echo ''
\echo 'After importing data, reset sequences to the max ID + 1:'
\echo ''

-- Run these on Azure PostgreSQL after data import:
/*
-- Reset api_keys sequence
SELECT setval('api_keys_id_seq', COALESCE((SELECT MAX(id) FROM api_keys), 0) + 1, false);

-- Reset audit_logs sequence
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 0) + 1, false);

-- Reset migrations sequence
SELECT setval('migrations_id_seq', COALESCE((SELECT MAX(id) FROM migrations), 0) + 1, false);
*/

\echo 'Run on Azure PostgreSQL:'
\echo ''
\echo 'SELECT setval(''api_keys_id_seq'', COALESCE((SELECT MAX(id) FROM api_keys), 0) + 1, false);'
\echo 'SELECT setval(''audit_logs_id_seq'', COALESCE((SELECT MAX(id) FROM audit_logs), 0) + 1, false);'
\echo 'SELECT setval(''migrations_id_seq'', COALESCE((SELECT MAX(id) FROM migrations), 0) + 1, false);'
\echo ''

-- ============================================================================
-- METHOD B: ONLINE MIGRATION (Logical Replication)
-- ============================================================================

\echo ''
\echo '=============================================='
\echo 'METHOD B: ONLINE MIGRATION GUIDE'
\echo '=============================================='
\echo ''
\echo 'For minimal downtime migrations (large databases):'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP B1: Configure Source (Supabase)
-- ----------------------------------------------------------------------------
\echo 'STEP B1: Configure Source Database (Supabase)'
\echo '----------------------------------------------'
\echo ''
\echo 'Supabase already has logical replication enabled by default.'
\echo 'Verify with:'
\echo ''
\echo '  SHOW wal_level;  -- Should return "logical"'
\echo ''
\echo 'Create publication for migration:'
\echo ''
\echo '  CREATE PUBLICATION azure_migration FOR ALL TABLES;'
\echo ''
\echo 'Or for specific schemas:'
\echo ''
\echo '  CREATE PUBLICATION azure_migration FOR TABLES IN SCHEMA public;'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP B2: Configure Target (Azure)
-- ----------------------------------------------------------------------------
\echo 'STEP B2: Configure Target Database (Azure)'
\echo '-------------------------------------------'
\echo ''
\echo 'Enable logical replication on Azure PostgreSQL:'
\echo ''
\echo '  az postgres flexible-server parameter set \'
\echo '    --resource-group [RESOURCE_GROUP] \'
\echo '    --server-name [SERVER_NAME] \'
\echo '    --name wal_level \'
\echo '    --value logical'
\echo ''
\echo 'Restart the server after parameter change.'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP B3: Create Subscription on Azure
-- ----------------------------------------------------------------------------
\echo 'STEP B3: Create Subscription (Run on Azure)'
\echo '--------------------------------------------'
\echo ''
\echo 'Connect to Azure PostgreSQL and create subscription:'
\echo ''
\echo '  CREATE SUBSCRIPTION supabase_sync'
\echo '  CONNECTION ''host=db.[PROJECT].supabase.co port=5432 dbname=postgres user=postgres password=[PASSWORD] sslmode=require'''
\echo '  PUBLICATION azure_migration'
\echo '  WITH (copy_data = true);'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP B4: Monitor Replication
-- ----------------------------------------------------------------------------
\echo 'STEP B4: Monitor Replication Progress'
\echo '--------------------------------------'
\echo ''
\echo 'On Azure PostgreSQL:'
\echo ''
\echo '  -- Check subscription status'
\echo '  SELECT * FROM pg_subscription;'
\echo ''
\echo '  -- Check replication progress per table'
\echo '  SELECT * FROM pg_subscription_rel;'
\echo '  -- (srsubstate = ''r'' means ready/synced)'
\echo ''
\echo '  -- Check replication lag'
\echo '  SELECT * FROM pg_stat_subscription;'
\echo ''

-- ----------------------------------------------------------------------------
-- STEP B5: Cutover
-- ----------------------------------------------------------------------------
\echo 'STEP B5: Cutover Procedure'
\echo '--------------------------'
\echo ''
\echo '1. Stop application writes to Supabase'
\echo '2. Wait for replication lag to reach zero'
\echo '3. On Azure: DROP SUBSCRIPTION supabase_sync;'
\echo '4. Update application connection strings to Azure'
\echo '5. Resume application'
\echo ''

-- ============================================================================
-- TABLE-BY-TABLE MIGRATION ORDER (For Manual Migration)
-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'RECOMMENDED TABLE MIGRATION ORDER'
\echo '=============================================='
\echo ''
\echo 'If migrating tables individually, follow this order:'
\echo ''
\echo 'Tier 1 (Independent - No FK dependencies):'
\echo '  1. currencies'
\echo '  2. organizations'
\echo '  3. clients'
\echo '  4. oauth_clients'
\echo '  5. migrations'
\echo '  6. onboarding_document_requirements'
\echo ''
\echo 'Tier 2 (Depends on Tier 1):'
\echo '  7. countries (-> currencies)'
\echo '  8. users (-> clients)'
\echo '  9. exchange_rates (-> currencies)'
\echo ''
\echo 'Tier 3 (Depends on Tier 2):'
\echo '  10. eor_profiles (-> users)'
\echo '  11. employment_records (-> users, clients, countries)'
\echo '  12. sessions (-> users)'
\echo '  13. api_keys (-> users)'
\echo '  14. audit_logs (-> users)'
\echo '  15. documents (-> users, eor_profiles)'
\echo '  16. invitations (-> clients, users)'
\echo '  17. organization_members (-> organizations, users)'
\echo '  18. organization_invitations (-> organizations, users)'
\echo '  19. user_emails (-> users, organizations)'
\echo '  20. user_roles (-> users)'
\echo '  21. user_themes (-> users)'
\echo '  22. user_oauth_logins (-> users, oauth_clients)'
\echo '  23. user_app_activity (-> users, oauth_clients)'
\echo '  24. user_app_permissions (-> users, oauth_clients)'
\echo ''
\echo 'Tier 4 (Country-dependent):'
\echo '  25. region_configurations (-> countries)'
\echo '  26. salary_components (-> countries)'
\echo '  27. statutory_components (-> countries)'
\echo '  28. tax_years (-> countries)'
\echo '  29. payroll_periods (-> countries)'
\echo '  30. leave_balances (-> users, countries)'
\echo '  31. leave_requests (-> users, countries, payroll_periods)'
\echo ''
\echo 'Tier 5 (Payroll/Timesheet):'
\echo '  32. payroll_processing_logs (-> countries, payroll_periods)'
\echo '  33. payslips (-> users, countries, payroll_periods)'
\echo '  34. timesheets (-> users, employment_records, payroll_periods)'
\echo '  35. timesheet_approvals (-> timesheets, users)'
\echo '  36. leave_approvals (-> leave_requests, users)'
\echo '  37. salary_history (-> employment_records, users)'
\echo '  38. performance_metrics (-> payroll_periods, payroll_processing_logs)'
\echo ''

-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'DATA MIGRATION GUIDE COMPLETE'
\echo '=============================================='
\echo ''
\echo 'Next: Run 06_post_migration_validation.sql to verify data integrity'
\echo ''
