-- ============================================================================
-- Supabase PostgreSQL to Azure PostgreSQL Migration
-- Script 02: Extensions and Custom Types
-- ============================================================================
-- Purpose: Create required extensions and ENUM types in Azure PostgreSQL
-- Run this script against the TARGET (Azure PostgreSQL) database FIRST
-- ============================================================================

\echo '=============================================='
\echo 'CREATING EXTENSIONS AND CUSTOM TYPES'
\echo '=============================================='
\echo ''

-- ============================================================================
-- 1. REQUIRED EXTENSIONS
-- ============================================================================
\echo '1. Creating Required Extensions'
\echo '--------------------------------'

-- UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\echo 'Created extension: uuid-ossp'

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
\echo 'Created extension: pgcrypto'

-- Note: plpgsql is installed by default in Azure PostgreSQL

-- ============================================================================
-- 2. CUSTOM ENUM TYPES
-- ============================================================================
\echo ''
\echo '2. Creating Custom ENUM Types'
\echo '------------------------------'

-- Drop existing types if they exist (for re-running the script)
-- Note: These will fail silently if types don't exist or are in use

-- calculation_basis_enum
DO $$ BEGIN
    CREATE TYPE calculation_basis_enum AS ENUM (
        'gross_salary',
        'basic_salary',
        'capped_amount',
        'fixed_amount'
    );
    RAISE NOTICE 'Created type: calculation_basis_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type calculation_basis_enum already exists, skipping';
END $$;

-- calculation_type_enum
DO $$ BEGIN
    CREATE TYPE calculation_type_enum AS ENUM (
        'fixed_amount',
        'percentage_of_basic',
        'percentage_of_gross',
        'percentage_of_net',
        'formula'
    );
    RAISE NOTICE 'Created type: calculation_type_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type calculation_type_enum already exists, skipping';
END $$;

-- contribution_type_enum
DO $$ BEGIN
    CREATE TYPE contribution_type_enum AS ENUM (
        'employee',
        'employer',
        'both'
    );
    RAISE NOTICE 'Created type: contribution_type_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type contribution_type_enum already exists, skipping';
END $$;

-- documents_document_type_enum
DO $$ BEGIN
    CREATE TYPE documents_document_type_enum AS ENUM (
        'CV',
        'PASSPORT',
        'ID_CARD',
        'CONTRACT',
        'OTHER',
        'PAYSLIP',
        'HR_DOCUMENT',
        'TAX_DOCUMENT'
    );
    RAISE NOTICE 'Created type: documents_document_type_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type documents_document_type_enum already exists, skipping';
END $$;

-- invitations_country_enum
DO $$ BEGIN
    CREATE TYPE invitations_country_enum AS ENUM (
        'US',
        'CA',
        'UK',
        'DE',
        'FR',
        'IN',
        'AU',
        'JP',
        'BR',
        'MX'
    );
    RAISE NOTICE 'Created type: invitations_country_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type invitations_country_enum already exists, skipping';
END $$;

-- invitations_role_enum
DO $$ BEGIN
    CREATE TYPE invitations_role_enum AS ENUM (
        'EOR',
        'EMPLOYEE',
        'CONTRACTOR',
        'ADMIN'
    );
    RAISE NOTICE 'Created type: invitations_role_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type invitations_role_enum already exists, skipping';
END $$;

-- invitations_status_enum
DO $$ BEGIN
    CREATE TYPE invitations_status_enum AS ENUM (
        'pending',
        'accepted',
        'expired',
        'cancelled'
    );
    RAISE NOTICE 'Created type: invitations_status_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type invitations_status_enum already exists, skipping';
END $$;

-- leave_request_status_enum
DO $$ BEGIN
    CREATE TYPE leave_request_status_enum AS ENUM (
        'DRAFT',
        'SUBMITTED',
        'APPROVED',
        'REJECTED',
        'CANCELLED'
    );
    RAISE NOTICE 'Created type: leave_request_status_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type leave_request_status_enum already exists, skipping';
END $$;

-- leave_type_enum
DO $$ BEGIN
    CREATE TYPE leave_type_enum AS ENUM (
        'ANNUAL_LEAVE_IN',
        'SICK_LEAVE_IN',
        'CASUAL_LEAVE_IN',
        'MATERNITY_LEAVE_IN',
        'PATERNITY_LEAVE_IN',
        'COMPENSATORY_OFF_IN',
        'VACATION_LEAVE_PH',
        'SICK_LEAVE_PH',
        'MATERNITY_LEAVE_PH',
        'PATERNITY_LEAVE_PH',
        'SOLO_PARENT_LEAVE_PH',
        'SPECIAL_LEAVE_WOMEN_PH',
        'ANNUAL_LEAVE_AU',
        'SICK_CARERS_LEAVE_AU',
        'LONG_SERVICE_LEAVE_AU',
        'PARENTAL_LEAVE_AU',
        'COMPASSIONATE_LEAVE_AU'
    );
    RAISE NOTICE 'Created type: leave_type_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type leave_type_enum already exists, skipping';
END $$;

-- oauth_client_intent_enum
DO $$ BEGIN
    CREATE TYPE oauth_client_intent_enum AS ENUM (
        'client',
        'candidate',
        'both'
    );
    RAISE NOTICE 'Created type: oauth_client_intent_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type oauth_client_intent_enum already exists, skipping';
END $$;

-- payroll_period_status_enum
DO $$ BEGIN
    CREATE TYPE payroll_period_status_enum AS ENUM (
        'draft',
        'open',
        'processing',
        'completed',
        'closed'
    );
    RAISE NOTICE 'Created type: payroll_period_status_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type payroll_period_status_enum already exists, skipping';
END $$;

-- payslip_status_enum
DO $$ BEGIN
    CREATE TYPE payslip_status_enum AS ENUM (
        'draft',
        'processing',
        'available',
        'downloaded'
    );
    RAISE NOTICE 'Created type: payslip_status_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type payslip_status_enum already exists, skipping';
END $$;

-- processing_status_enum
DO $$ BEGIN
    CREATE TYPE processing_status_enum AS ENUM (
        'started',
        'in_progress',
        'completed',
        'failed',
        'cancelled'
    );
    RAISE NOTICE 'Created type: processing_status_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type processing_status_enum already exists, skipping';
END $$;

-- salary_component_type_enum
DO $$ BEGIN
    CREATE TYPE salary_component_type_enum AS ENUM (
        'earnings',
        'deductions',
        'benefits',
        'reimbursements'
    );
    RAISE NOTICE 'Created type: salary_component_type_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type salary_component_type_enum already exists, skipping';
END $$;

-- statutory_component_type_enum
DO $$ BEGIN
    CREATE TYPE statutory_component_type_enum AS ENUM (
        'epf',
        'esi',
        'pt',
        'tds',
        'sss',
        'philhealth',
        'pagibig',
        'superannuation',
        'epf_my',
        'socso',
        'eis',
        'cpf'
    );
    RAISE NOTICE 'Created type: statutory_component_type_enum';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Type statutory_component_type_enum already exists, skipping';
END $$;

-- ============================================================================
-- 3. VERIFY CREATED TYPES
-- ============================================================================
\echo ''
\echo '3. Verifying Created Types'
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
-- 4. VERIFY EXTENSIONS
-- ============================================================================
\echo ''
\echo '4. Verifying Extensions'
\echo '-----------------------'

SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'plpgsql')
ORDER BY extname;

-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'EXTENSIONS AND TYPES CREATION COMPLETE'
\echo '=============================================='
\echo ''
\echo 'Next: Run 03_schema_creation.sql to create tables'
\echo ''
