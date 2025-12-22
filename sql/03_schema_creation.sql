-- ============================================================================
-- Supabase PostgreSQL to Azure PostgreSQL Migration
-- Script 03: Schema Creation
-- ============================================================================
-- Purpose: Create all tables in Azure PostgreSQL
-- Run this script against the TARGET (Azure PostgreSQL) database
-- Prerequisites: Run 02_extensions_and_types.sql first
-- ============================================================================

\echo '=============================================='
\echo 'CREATING DATABASE TABLES'
\echo '=============================================='
\echo ''

-- ============================================================================
-- NOTE: Tables are ordered by dependency (parent tables first)
-- ============================================================================

-- ============================================================================
-- TIER 1: Independent Tables (No Foreign Keys)
-- ============================================================================
\echo '1. Creating Independent Tables (Tier 1)'
\echo '----------------------------------------'

-- currencies
CREATE TABLE IF NOT EXISTS currencies (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT currencies_pkey PRIMARY KEY (id),
    CONSTRAINT currencies_code_key UNIQUE (code)
);
\echo 'Created table: currencies'

-- organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    industry VARCHAR(100) DEFAULT NULL,
    company_size VARCHAR(50) DEFAULT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    website TEXT,
    CONSTRAINT organizations_pkey PRIMARY KEY (id),
    CONSTRAINT organizations_slug_key UNIQUE (slug)
);
\echo 'Created table: organizations'

-- clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    contact_info JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    migrated_from_zoho BOOLEAN NOT NULL DEFAULT FALSE,
    zoho_client_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT clients_pkey PRIMARY KEY (id)
);
\echo 'Created table: clients'

-- migrations (tracking table)
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL NOT NULL,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT migrations_pkey PRIMARY KEY (id),
    CONSTRAINT migrations_name_key UNIQUE (name)
);
\echo 'Created table: migrations'

-- onboarding_document_requirements
CREATE TABLE IF NOT EXISTS onboarding_document_requirements (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    cv_required INTEGER NOT NULL DEFAULT 1,
    identity_required INTEGER NOT NULL DEFAULT 1,
    employment_required INTEGER NOT NULL DEFAULT 1,
    education_required INTEGER NOT NULL DEFAULT 1,
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT onboarding_document_requirements_pkey PRIMARY KEY (id)
);
\echo 'Created table: onboarding_document_requirements'

-- oauth_clients
CREATE TABLE IF NOT EXISTS oauth_clients (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    is_public BOOLEAN DEFAULT FALSE,
    default_intent oauth_client_intent_enum NOT NULL DEFAULT 'both',
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_redirect_uris TEXT,
    redirect_uris JSONB,
    allow_client_credentials BOOLEAN DEFAULT FALSE,
    allowed_scopes TEXT,
    CONSTRAINT oauth_clients_pkey PRIMARY KEY (id),
    CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id)
);
\echo 'Created table: oauth_clients'

-- ============================================================================
-- TIER 2: Tables with Single Dependencies
-- ============================================================================
\echo ''
\echo '2. Creating Tier 2 Tables'
\echo '-------------------------'

-- countries (depends on currencies)
CREATE TABLE IF NOT EXISTS countries (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    currency_id UUID NOT NULL,
    tax_year_start_month INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT countries_pkey PRIMARY KEY (id),
    CONSTRAINT countries_code_key UNIQUE (code)
);
\echo 'Created table: countries'

-- users (depends on clients)
CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    phone_number VARCHAR(50),
    country_code VARCHAR(10),
    timezone VARCHAR(50),
    locale VARCHAR(10),
    metadata JSONB,
    last_login_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_global_admin BOOLEAN DEFAULT FALSE,
    client_id UUID,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    google_id VARCHAR(255),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);
\echo 'Created table: users'

-- exchange_rates (depends on currencies)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    from_currency_id UUID NOT NULL,
    to_currency_id UUID NOT NULL,
    rate NUMERIC NOT NULL,
    effective_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT exchange_rates_pkey PRIMARY KEY (id)
);
\echo 'Created table: exchange_rates'

-- ============================================================================
-- TIER 3: Tables with Multiple Dependencies
-- ============================================================================
\echo ''
\echo '3. Creating Tier 3 Tables'
\echo '-------------------------'

-- eor_profiles (depends on users)
CREATE TABLE IF NOT EXISTS eor_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    job_title VARCHAR(100),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    start_date DATE,
    employment_type VARCHAR(50),
    manager_name VARCHAR(100),
    skills JSONB,
    experience_years INTEGER,
    education JSONB,
    certifications JSONB,
    languages JSONB,
    profile_completion_percentage INTEGER DEFAULT 0,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    profile_status VARCHAR(50) DEFAULT 'incomplete',
    country_code VARCHAR(10) NOT NULL,
    timezone VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT eor_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT eor_profiles_user_id_key UNIQUE (user_id)
);
\echo 'Created table: eor_profiles'

-- employment_records (depends on users, clients, countries)
CREATE TABLE IF NOT EXISTS employment_records (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    client_id UUID NOT NULL,
    country_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    migrated_from_zoho BOOLEAN NOT NULL DEFAULT FALSE,
    zoho_employment_id VARCHAR(255),
    onboarding_submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT employment_records_pkey PRIMARY KEY (id)
);
\echo 'Created table: employment_records'

-- sessions (depends on users)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT sessions_pkey PRIMARY KEY (id)
);
\echo 'Created table: sessions'

-- api_keys (depends on users)
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL NOT NULL,
    name VARCHAR(255) NOT NULL,
    "keyPrefix" VARCHAR(20) NOT NULL,
    "keyHash" VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'read-only',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "lastUsedAt" TIMESTAMP WITHOUT TIME ZONE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT api_keys_pkey PRIMARY KEY (id),
    CONSTRAINT "api_keys_keyHash_key" UNIQUE ("keyHash")
);
\echo 'Created table: api_keys'

-- audit_logs (depends on users)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL NOT NULL,
    at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor_user_id UUID,
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    changes JSONB,
    ip INET,
    user_agent TEXT,
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
\echo 'Created table: audit_logs'

-- documents (depends on users, eor_profiles)
CREATE TABLE IF NOT EXISTS documents (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    eor_profile_id UUID,
    user_id UUID,
    document_type documents_document_type_enum NOT NULL,
    category VARCHAR(100),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    version_id VARCHAR(255) NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status VARCHAR(50),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    review_notes TEXT,
    uploaded_by UUID,
    uploaded_by_role VARCHAR(50) DEFAULT 'candidate',
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT documents_pkey PRIMARY KEY (id)
);
\echo 'Created table: documents'

-- invitations (depends on clients, users, organizations)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    country invitations_country_enum,
    role invitations_role_enum,
    status invitations_status_enum DEFAULT 'pending',
    token VARCHAR(500),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id UUID,
    invite_code VARCHAR(50),
    invited_by UUID,
    role_type VARCHAR(50),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    invited_user_id UUID,
    CONSTRAINT invitations_pkey PRIMARY KEY (id),
    CONSTRAINT invitations_token_key UNIQUE (token)
);
\echo 'Created table: invitations'

-- organization_members (depends on organizations, users)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT organization_members_pkey PRIMARY KEY (id),
    CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id)
);
\echo 'Created table: organization_members'

-- organization_invitations (depends on organizations, users)
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    invite_code VARCHAR(50) NOT NULL,
    invited_by UUID NOT NULL,
    role_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT organization_invitations_pkey PRIMARY KEY (id),
    CONSTRAINT organization_invitations_invite_code_key UNIQUE (invite_code)
);
\echo 'Created table: organization_invitations'

-- user_emails (depends on users, organizations)
CREATE TABLE IF NOT EXISTS user_emails (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT user_emails_pkey PRIMARY KEY (id),
    CONSTRAINT user_emails_email_key UNIQUE (email)
);
\echo 'Created table: user_emails'

-- user_roles (depends on users)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_type VARCHAR(50) NOT NULL,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT user_roles_pkey PRIMARY KEY (id)
);
\echo 'Created table: user_roles'

-- user_themes (depends on users)
CREATE TABLE IF NOT EXISTS user_themes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    theme_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_themes_pkey PRIMARY KEY (id),
    CONSTRAINT user_themes_user_id_key UNIQUE (user_id)
);
\echo 'Created table: user_themes'

-- user_oauth_logins (depends on users, oauth_clients)
CREATE TABLE IF NOT EXISTS user_oauth_logins (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    oauth_client_id UUID NOT NULL,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    login_count INTEGER DEFAULT 1,
    CONSTRAINT user_oauth_logins_pkey PRIMARY KEY (id),
    CONSTRAINT user_oauth_logins_user_id_oauth_client_id_key UNIQUE (user_id, oauth_client_id)
);
\echo 'Created table: user_oauth_logins'

-- user_app_activity (depends on users, oauth_clients)
CREATE TABLE IF NOT EXISTS user_app_activity (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    oauth_client_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_app_activity_pkey PRIMARY KEY (id)
);
\echo 'Created table: user_app_activity'

-- user_app_permissions (depends on users, oauth_clients)
CREATE TABLE IF NOT EXISTS user_app_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    oauth_client_id UUID NOT NULL,
    scopes TEXT[],
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT user_app_permissions_pkey PRIMARY KEY (id)
);
\echo 'Created table: user_app_permissions'

-- ============================================================================
-- TIER 4: Country-Dependent Tables
-- ============================================================================
\echo ''
\echo '4. Creating Tier 4 Tables (Country-Dependent)'
\echo '----------------------------------------------'

-- region_configurations (depends on countries)
CREATE TABLE IF NOT EXISTS region_configurations (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT region_configurations_pkey PRIMARY KEY (id)
);
\echo 'Created table: region_configurations'

-- salary_components (depends on countries)
CREATE TABLE IF NOT EXISTS salary_components (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type salary_component_type_enum NOT NULL,
    description TEXT,
    is_taxable BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    calculation_type calculation_type_enum,
    calculation_value NUMERIC,
    calculation_formula TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT salary_components_pkey PRIMARY KEY (id)
);
\echo 'Created table: salary_components'

-- statutory_components (depends on countries)
CREATE TABLE IF NOT EXISTS statutory_components (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type statutory_component_type_enum NOT NULL,
    contribution_type contribution_type_enum NOT NULL,
    calculation_basis calculation_basis_enum NOT NULL,
    employee_rate NUMERIC,
    employer_rate NUMERIC,
    cap_amount NUMERIC,
    min_salary NUMERIC,
    max_salary NUMERIC,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT statutory_components_pkey PRIMARY KEY (id)
);
\echo 'Created table: statutory_components'

-- tax_years (depends on countries)
CREATE TABLE IF NOT EXISTS tax_years (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT tax_years_pkey PRIMARY KEY (id)
);
\echo 'Created table: tax_years'

-- payroll_periods (depends on countries)
CREATE TABLE IF NOT EXISTS payroll_periods (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    status payroll_period_status_enum NOT NULL DEFAULT 'draft',
    total_employees INTEGER NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payroll_periods_pkey PRIMARY KEY (id)
);
\echo 'Created table: payroll_periods'

-- leave_balances (depends on users, countries)
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    leave_type leave_type_enum NOT NULL,
    total_days NUMERIC NOT NULL DEFAULT 0,
    used_days NUMERIC NOT NULL DEFAULT 0,
    available_days NUMERIC NOT NULL DEFAULT 0,
    accrual_rate NUMERIC NOT NULL DEFAULT 0,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT leave_balances_pkey PRIMARY KEY (id),
    CONSTRAINT leave_balances_user_id_country_code_leave_type_year_key UNIQUE (user_id, country_code, leave_type, year)
);
\echo 'Created table: leave_balances'

-- leave_requests (depends on users, countries, payroll_periods)
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    leave_type leave_type_enum NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC NOT NULL,
    status leave_request_status_enum NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    payroll_period_id UUID,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT leave_requests_pkey PRIMARY KEY (id)
);
\echo 'Created table: leave_requests'

-- ============================================================================
-- TIER 5: Payroll and Timesheet Tables
-- ============================================================================
\echo ''
\echo '5. Creating Tier 5 Tables (Payroll/Timesheet)'
\echo '----------------------------------------------'

-- payroll_processing_logs (depends on countries, payroll_periods)
CREATE TABLE IF NOT EXISTS payroll_processing_logs (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    payroll_period_id UUID,
    status processing_status_enum NOT NULL DEFAULT 'started',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    employees_processed INTEGER NOT NULL DEFAULT 0,
    employees_failed INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    processing_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payroll_processing_logs_pkey PRIMARY KEY (id)
);
\echo 'Created table: payroll_processing_logs'

-- payslips (depends on users, countries, payroll_periods)
CREATE TABLE IF NOT EXISTS payslips (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    country_id UUID NOT NULL,
    payroll_period_id UUID NOT NULL,
    calculation_id VARCHAR(100) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    gross_pay NUMERIC NOT NULL,
    basic_salary NUMERIC NOT NULL,
    total_earnings NUMERIC NOT NULL,
    overtime_pay NUMERIC,
    night_shift_pay NUMERIC,
    total_statutory_deductions NUMERIC NOT NULL,
    total_other_deductions NUMERIC NOT NULL,
    total_deductions NUMERIC NOT NULL,
    net_pay NUMERIC NOT NULL,
    currency_code VARCHAR(10) NOT NULL,
    salary_components JSONB NOT NULL,
    statutory_deductions JSONB NOT NULL,
    other_deductions JSONB NOT NULL,
    metadata JSONB,
    status payslip_status_enum NOT NULL DEFAULT 'draft',
    pdf_path VARCHAR(500),
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    first_downloaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payslips_pkey PRIMARY KEY (id),
    CONSTRAINT payslips_calculation_id_key UNIQUE (calculation_id)
);
\echo 'Created table: payslips'

-- timesheets (depends on users, employment_records, payroll_periods)
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    employment_record_id UUID NOT NULL,
    payroll_period_id UUID,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_hours NUMERIC NOT NULL DEFAULT 0,
    regular_hours NUMERIC NOT NULL DEFAULT 0,
    overtime_hours NUMERIC NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_id UUID,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by_id UUID,
    rejection_reason TEXT,
    entries JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT timesheets_pkey PRIMARY KEY (id)
);
\echo 'Created table: timesheets'

-- timesheet_approvals (depends on timesheets, users)
CREATE TABLE IF NOT EXISTS timesheet_approvals (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT timesheet_approvals_pkey PRIMARY KEY (id)
);
\echo 'Created table: timesheet_approvals'

-- leave_approvals (depends on leave_requests, users)
CREATE TABLE IF NOT EXISTS leave_approvals (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    leave_request_id UUID NOT NULL,
    approver_id UUID NOT NULL,
    status leave_request_status_enum NOT NULL,
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT leave_approvals_pkey PRIMARY KEY (id)
);
\echo 'Created table: leave_approvals'

-- salary_history (depends on employment_records, users)
CREATE TABLE IF NOT EXISTS salary_history (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    employment_record_id UUID NOT NULL,
    basic_salary NUMERIC NOT NULL,
    currency_code VARCHAR(10) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    change_reason VARCHAR(100),
    changed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT salary_history_pkey PRIMARY KEY (id)
);
\echo 'Created table: salary_history'

-- performance_metrics (depends on payroll_periods, payroll_processing_logs, users)
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20) NOT NULL DEFAULT 'ms',
    payroll_period_id UUID,
    processing_log_id UUID,
    user_id UUID,
    country_id VARCHAR(10),
    additional_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT performance_metrics_pkey PRIMARY KEY (id)
);
\echo 'Created table: performance_metrics'

-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'SCHEMA CREATION COMPLETE'
\echo '=============================================='
\echo ''
\echo 'Tables created successfully.'
\echo 'Next: Run 04_indexes_and_constraints.sql to add indexes and foreign keys'
\echo ''
