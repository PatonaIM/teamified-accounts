-- ============================================================================
-- Supabase PostgreSQL to Azure PostgreSQL Migration
-- Script 01: Pre-Migration Checks
-- ============================================================================
-- Purpose: Verify source database state before migration
-- Run this script against the SOURCE (Supabase) database
-- ============================================================================

-- Set output format for better readability
\echo '=============================================='
\echo 'PRE-MIGRATION CHECKS - Supabase PostgreSQL'
\echo '=============================================='
\echo ''

-- ============================================================================
-- 1. DATABASE VERSION AND CONNECTION INFO
-- ============================================================================
\echo '1. Database Version and Connection Info'
\echo '----------------------------------------'

SELECT version() AS postgresql_version;
SELECT current_database() AS database_name;
SELECT current_user AS connected_user;
SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size;

-- ============================================================================
-- 2. INSTALLED EXTENSIONS
-- ============================================================================
\echo ''
\echo '2. Installed Extensions (Required for Azure PostgreSQL)'
\echo '--------------------------------------------------------'

SELECT extname AS extension_name, 
       extversion AS version,
       CASE 
           WHEN extname IN ('plpgsql', 'uuid-ossp', 'pgcrypto') THEN 'Supported in Azure'
           WHEN extname IN ('pg_stat_statements', 'pg_trgm', 'btree_gin', 'btree_gist') THEN 'Supported in Azure'
           WHEN extname IN ('pgjwt', 'pg_graphql', 'supabase_functions') THEN 'Supabase-specific (may need alternative)'
           ELSE 'Verify Azure support'
       END AS azure_compatibility
FROM pg_extension 
ORDER BY extname;

-- ============================================================================
-- 3. CUSTOM ENUM TYPES
-- ============================================================================
\echo ''
\echo '3. Custom ENUM Types'
\echo '--------------------'

SELECT t.typname AS enum_name, 
       string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_namespace n ON n.oid = t.typnamespace 
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================================================
-- 4. TABLE INVENTORY WITH ROW COUNTS
-- ============================================================================
\echo ''
\echo '4. Table Inventory with Row Counts'
\echo '-----------------------------------'

SELECT 
    schemaname AS schema,
    tablename AS table_name,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
    n_live_tup AS estimated_row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ============================================================================
-- 5. TABLES WITHOUT PRIMARY KEYS (Critical for Logical Replication)
-- ============================================================================
\echo ''
\echo '5. Tables Without Primary Keys (Critical for Online Migration)'
\echo '---------------------------------------------------------------'

SELECT t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc 
    ON t.table_name = tc.table_name 
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND tc.constraint_name IS NULL
ORDER BY t.table_name;

-- If empty, all tables have primary keys (good for logical replication)

-- ============================================================================
-- 6. FOREIGN KEY RELATIONSHIPS
-- ============================================================================
\echo ''
\echo '6. Foreign Key Relationships Count'
\echo '-----------------------------------'

SELECT COUNT(*) AS total_foreign_keys
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';

-- ============================================================================
-- 7. SEQUENCES (For Identity/Serial Columns)
-- ============================================================================
\echo ''
\echo '7. Sequences'
\echo '------------'

SELECT 
    sequencename AS sequence_name,
    last_value,
    start_value,
    increment_by
FROM pg_sequences
WHERE schemaname = 'public'
ORDER BY sequencename;

-- ============================================================================
-- 8. INDEX COUNT BY TABLE
-- ============================================================================
\echo ''
\echo '8. Index Count by Table'
\echo '-----------------------'

SELECT 
    tablename AS table_name,
    COUNT(*) AS index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY index_count DESC;

-- ============================================================================
-- 9. SPECIAL DATA TYPES CHECK
-- ============================================================================
\echo ''
\echo '9. Special Data Types in Use'
\echo '----------------------------'

SELECT DISTINCT 
    data_type,
    COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY data_type
ORDER BY column_count DESC;

-- ============================================================================
-- 10. JSONB COLUMNS (Verify data integrity)
-- ============================================================================
\echo ''
\echo '10. JSONB Columns in Database'
\echo '-----------------------------'

SELECT 
    table_name,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public'
    AND data_type = 'jsonb'
ORDER BY table_name, column_name;

-- ============================================================================
-- 11. CHECK WAL LEVEL (Required for Online Migration)
-- ============================================================================
\echo ''
\echo '11. WAL Level (Required for Logical Replication)'
\echo '-------------------------------------------------'

SHOW wal_level;
-- Should be 'logical' for online migration

-- ============================================================================
-- 12. ACTIVE CONNECTIONS
-- ============================================================================
\echo ''
\echo '12. Current Active Connections'
\echo '------------------------------'

SELECT 
    COUNT(*) AS total_connections,
    COUNT(*) FILTER (WHERE state = 'active') AS active_queries
FROM pg_stat_activity
WHERE datname = current_database();

-- ============================================================================
-- SUMMARY
-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'PRE-MIGRATION CHECKS COMPLETE'
\echo '=============================================='
\echo ''
\echo 'Next Steps:'
\echo '1. Verify all extensions are supported in Azure PostgreSQL'
\echo '2. Ensure all tables have primary keys for logical replication'
\echo '3. Note the database size for migration time estimation'
\echo '4. Review ENUM types for proper recreation in Azure'
\echo ''
