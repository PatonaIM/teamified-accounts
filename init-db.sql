-- Complete Database initialization script for Teamified Portal
-- This script includes all required tables, columns, and constraints
-- Run this script to set up a complete database from scratch

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums (idempotent - safe to run multiple times)
DO $$ BEGIN
    CREATE TYPE invitations_country_enum AS ENUM (
        'US', 'CA', 'UK', 'DE', 'FR', 'IN', 'AU', 'JP', 'BR', 'MX'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invitations_role_enum AS ENUM (
        'EOR', 'EMPLOYEE', 'CONTRACTOR', 'ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invitations_status_enum AS ENUM (
        'pending', 'accepted', 'expired', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE documents_document_type_enum AS ENUM (
        'CV', 'PASSPORT', 'ID_CARD', 'CONTRACT', 'OTHER', 'PAYSLIP', 'HR_DOCUMENT', 'TAX_DOCUMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_request_status_enum AS ENUM (
        'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_type_enum AS ENUM (
        -- India
        'ANNUAL_LEAVE_IN', 'SICK_LEAVE_IN', 'CASUAL_LEAVE_IN',
        'MATERNITY_LEAVE_IN', 'PATERNITY_LEAVE_IN', 'COMPENSATORY_OFF_IN',
        -- Philippines
        'VACATION_LEAVE_PH', 'SICK_LEAVE_PH', 'MATERNITY_LEAVE_PH',
        'PATERNITY_LEAVE_PH', 'SOLO_PARENT_LEAVE_PH', 'SPECIAL_LEAVE_WOMEN_PH',
        -- Australia
        'ANNUAL_LEAVE_AU', 'SICK_CARERS_LEAVE_AU', 'LONG_SERVICE_LEAVE_AU',
        'PARENTAL_LEAVE_AU', 'COMPASSIONATE_LEAVE_AU'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    contact_info JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    migrated_from_zoho BOOLEAN NOT NULL DEFAULT false,
    zoho_client_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    profile_data JSONB,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_token_expiry TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    migrated_from_zoho BOOLEAN NOT NULL DEFAULT false,
    zoho_user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Themes Table for custom theme configurations
CREATE TABLE IF NOT EXISTS user_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    theme_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_themes_user_id ON user_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_themes_active ON user_themes(user_id, is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    token_family UUID NOT NULL,
    device_metadata JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country invitations_country_enum NOT NULL,
    role invitations_role_enum NOT NULL,
    status invitations_status_enum DEFAULT 'pending',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id UUID REFERENCES clients(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor_user_id UUID REFERENCES users(id),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    changes JSONB,
    ip INET,
    user_agent TEXT
);

-- Employment Records Table
CREATE TABLE IF NOT EXISTS employment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    client_id UUID NOT NULL,
    country_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    role VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    migrated_from_zoho BOOLEAN NOT NULL DEFAULT false,
    zoho_employment_id VARCHAR(100),
    onboarding_submitted_at TIMESTAMP WITH TIME ZONE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_active_employment_per_client UNIQUE (user_id, client_id, status),
    CONSTRAINT CHK_employment_date CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT CHK_employment_status CHECK (status IN ('onboarding', 'active', 'inactive', 'offboarding', 'terminated', 'completed'))
);

-- Salary History Table
CREATE TABLE IF NOT EXISTS salary_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employment_record_id UUID NOT NULL,
    salary_amount NUMERIC(12,2) NOT NULL,
    salary_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    effective_date DATE NOT NULL,
    change_reason VARCHAR(100) NOT NULL,
    changed_by UUID,
    migrated_from_zoho BOOLEAN NOT NULL DEFAULT false,
    zoho_salary_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_effective_date_per_employment UNIQUE (employment_record_id, effective_date),
    CONSTRAINT CHK_salary_amount CHECK (salary_amount > 0)
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role_type VARCHAR(50) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    scope_entity_id UUID,
    granted_by UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT CHK_role_scope CHECK (scope IN ('user', 'group', 'client', 'all')),
    CONSTRAINT CHK_role_type CHECK (role_type IN ('candidate', 'eor', 'admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client'))
);

-- Payroll Multi-Region Foundation Tables

-- Create enums for payroll tables (idempotent - safe to run multiple times)
DO $$ BEGIN
    CREATE TYPE payroll_period_status_enum AS ENUM (
        'draft', 'open', 'processing', 'completed', 'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE processing_status_enum AS ENUM (
        'started', 'in_progress', 'completed', 'failed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payslip_status_enum AS ENUM (
        'draft', 'processing', 'available', 'downloaded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Salary Component enums (idempotent - safe to run multiple times)
DO $$ BEGIN
    CREATE TYPE salary_component_type_enum AS ENUM (
        'earnings', 'deductions', 'benefits', 'reimbursements'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE calculation_type_enum AS ENUM (
        'fixed_amount', 'percentage_of_basic', 'percentage_of_gross', 'percentage_of_net', 'formula'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Statutory Component enums (idempotent - safe to run multiple times)
DO $$ BEGIN
    CREATE TYPE statutory_component_type_enum AS ENUM (
        'epf', 'esi', 'pt', 'tds', 'sss', 'philhealth', 'pagibig',
        'superannuation', 'epf_my', 'socso', 'eis', 'cpf'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contribution_type_enum AS ENUM (
        'employee', 'employer', 'both'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE calculation_basis_enum AS ENUM (
        'gross_salary', 'basic_salary', 'capped_amount', 'fixed_amount'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Currencies Table
CREATE TABLE IF NOT EXISTS currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INT NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Countries Table
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    currency_id UUID NOT NULL,
    tax_year_start_month INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT CHK_tax_year_start_month CHECK (tax_year_start_month >= 1 AND tax_year_start_month <= 12),
    FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- Tax Years Table
CREATE TABLE IF NOT EXISTS tax_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CHK_tax_year_dates CHECK (end_date >= start_date)
);

-- Region Configurations Table
CREATE TABLE IF NOT EXISTS region_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Exchange Rates Table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency_id UUID NOT NULL,
    to_currency_id UUID NOT NULL,
    rate DECIMAL(18,6) NOT NULL,
    effective_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (from_currency_id) REFERENCES currencies(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (to_currency_id) REFERENCES currencies(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CHK_exchange_rate_positive CHECK (rate > 0)
);

-- Payroll Periods Table
CREATE TABLE IF NOT EXISTS payroll_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    status payroll_period_status_enum NOT NULL DEFAULT 'draft',
    total_employees INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CHK_payroll_period_dates CHECK (end_date >= start_date)
);

-- Payroll Processing Logs Table
CREATE TABLE IF NOT EXISTS payroll_processing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    payroll_period_id UUID,
    status processing_status_enum NOT NULL DEFAULT 'started',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    employees_processed INT NOT NULL DEFAULT 0,
    employees_failed INT NOT NULL DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    processing_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL DEFAULT 'ms',
    payroll_period_id UUID,
    processing_log_id UUID,
    user_id UUID,
    country_id VARCHAR(2),
    additional_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE SET NULL,
    FOREIGN KEY (processing_log_id) REFERENCES payroll_processing_logs(id) ON DELETE SET NULL
);

-- Salary Components Table
CREATE TABLE IF NOT EXISTS salary_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    component_code VARCHAR(50) NOT NULL,
    component_type salary_component_type_enum NOT NULL,
    calculation_type calculation_type_enum NOT NULL,
    calculation_value DECIMAL(18,4),
    calculation_formula TEXT,
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    is_statutory BOOLEAN NOT NULL DEFAULT false,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CHK_salary_component_calculation CHECK (
        (calculation_type = 'fixed_amount' AND calculation_value IS NOT NULL AND calculation_formula IS NULL) OR
        (calculation_type IN ('percentage_of_basic', 'percentage_of_gross', 'percentage_of_net') AND calculation_value IS NOT NULL AND calculation_formula IS NULL) OR
        (calculation_type = 'formula' AND calculation_formula IS NOT NULL)
    )
);

-- Statutory Components Table
CREATE TABLE IF NOT EXISTS statutory_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    component_code VARCHAR(50) NOT NULL,
    component_type statutory_component_type_enum NOT NULL,
    contribution_type contribution_type_enum NOT NULL,
    calculation_basis calculation_basis_enum NOT NULL,
    employee_percentage DECIMAL(5,2),
    employer_percentage DECIMAL(5,2),
    minimum_amount DECIMAL(18,2),
    maximum_amount DECIMAL(18,2),
    wage_ceiling DECIMAL(18,2),
    wage_floor DECIMAL(18,2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    description TEXT,
    regulatory_reference VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CHK_statutory_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from),
    CONSTRAINT CHK_statutory_percentages CHECK (
        (contribution_type IN ('employee', 'both') AND employee_percentage IS NOT NULL) OR
        (contribution_type = 'employer' AND employee_percentage IS NULL)
    ),
    CONSTRAINT CHK_statutory_employer_percentages CHECK (
        (contribution_type IN ('employer', 'both') AND employer_percentage IS NOT NULL) OR
        (contribution_type = 'employee' AND employer_percentage IS NULL)
    )
);

-- Payslips Table (Story 7.6 - stores payroll calculation results from Story 7.3)
CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    country_id UUID NOT NULL,
    payroll_period_id UUID NOT NULL,
    calculation_id VARCHAR(255) NOT NULL UNIQUE,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Core amounts
    gross_pay DECIMAL(12,2) NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    total_earnings DECIMAL(12,2) NOT NULL,
    overtime_pay DECIMAL(12,2),
    night_shift_pay DECIMAL(12,2),
    total_statutory_deductions DECIMAL(12,2) NOT NULL,
    total_other_deductions DECIMAL(12,2) NOT NULL,
    total_deductions DECIMAL(12,2) NOT NULL,
    net_pay DECIMAL(12,2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    
    -- Detailed breakdowns stored as JSONB
    salary_components JSONB NOT NULL,
    statutory_deductions JSONB NOT NULL,
    other_deductions JSONB NOT NULL,
    metadata JSONB,
    
    -- Payslip status and access
    status payslip_status_enum NOT NULL DEFAULT 'draft',
    pdf_path VARCHAR(500),
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    first_downloaded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CHK_payslip_amounts CHECK (gross_pay >= 0 AND net_pay >= 0),
    CONSTRAINT CHK_payslip_total_earnings CHECK (total_earnings >= basic_salary)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_family ON sessions(token_family);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Employment Records Indexes
CREATE INDEX IF NOT EXISTS idx_employment_records_start_date ON employment_records(start_date);
CREATE INDEX IF NOT EXISTS idx_employment_records_status ON employment_records(status);
CREATE INDEX IF NOT EXISTS idx_employment_records_client_id ON employment_records(client_id);
CREATE INDEX IF NOT EXISTS idx_employment_records_user_id ON employment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_employment_records_country_id ON employment_records(country_id);

-- Salary History Indexes
CREATE INDEX IF NOT EXISTS idx_salary_history_effective_date ON salary_history(effective_date);
CREATE INDEX IF NOT EXISTS idx_salary_history_employment_record_id ON salary_history(employment_record_id);

-- User Roles Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_scope ON user_roles(scope);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at);

-- Multi-Region Payroll Indexes
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_is_active ON currencies(is_active);
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_currency_id ON countries(currency_id);
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON countries(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_years_country_id ON tax_years(country_id);
CREATE INDEX IF NOT EXISTS idx_tax_years_year ON tax_years(year);
CREATE INDEX IF NOT EXISTS idx_tax_years_is_current ON tax_years(is_current);
CREATE INDEX IF NOT EXISTS idx_region_configurations_country_id ON region_configurations(country_id);
CREATE INDEX IF NOT EXISTS idx_region_configurations_config_key ON region_configurations(config_key);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_currency ON exchange_rates(from_currency_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_to_currency ON exchange_rates(to_currency_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_effective_date ON exchange_rates(effective_date);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_country_id ON payroll_periods(country_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_status ON payroll_periods(status);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_start_date ON payroll_periods(start_date);
CREATE INDEX IF NOT EXISTS idx_payroll_processing_logs_country_id ON payroll_processing_logs(country_id);
CREATE INDEX IF NOT EXISTS idx_payroll_processing_logs_period_id ON payroll_processing_logs(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_processing_logs_status ON payroll_processing_logs(status);

-- Performance Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_type_recorded_at ON performance_metrics(metric_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_payroll_period_metric_type ON performance_metrics(payroll_period_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_processing_log_id ON performance_metrics(processing_log_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);

-- Salary Components Indexes
CREATE INDEX IF NOT EXISTS idx_salary_components_country_id ON salary_components(country_id);
CREATE INDEX IF NOT EXISTS idx_salary_components_component_type ON salary_components(component_type);
CREATE INDEX IF NOT EXISTS idx_salary_components_component_code ON salary_components(component_code);
CREATE INDEX IF NOT EXISTS idx_salary_components_is_active ON salary_components(is_active);
CREATE INDEX IF NOT EXISTS idx_salary_components_display_order ON salary_components(display_order);

-- Statutory Components Indexes
CREATE INDEX IF NOT EXISTS idx_statutory_components_country_id ON statutory_components(country_id);
CREATE INDEX IF NOT EXISTS idx_statutory_components_component_type ON statutory_components(component_type);
CREATE INDEX IF NOT EXISTS idx_statutory_components_component_code ON statutory_components(component_code);
CREATE INDEX IF NOT EXISTS idx_statutory_components_is_active ON statutory_components(is_active);
CREATE INDEX IF NOT EXISTS idx_statutory_components_effective_from ON statutory_components(effective_from);
CREATE INDEX IF NOT EXISTS idx_statutory_components_effective_to ON statutory_components(effective_to);
CREATE INDEX IF NOT EXISTS idx_statutory_components_display_order ON statutory_components(display_order);

-- Payslips Indexes
CREATE INDEX IF NOT EXISTS idx_payslips_user_id ON payslips(user_id);
CREATE INDEX IF NOT EXISTS idx_payslips_country_id ON payslips(country_id);
CREATE INDEX IF NOT EXISTS idx_payslips_payroll_period_id ON payslips(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payslips_calculation_id ON payslips(calculation_id);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status);
CREATE INDEX IF NOT EXISTS idx_payslips_calculated_at ON payslips(calculated_at);

-- Timesheets Table
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employment_record_id UUID NOT NULL REFERENCES employment_records(id) ON DELETE CASCADE,
    payroll_period_id UUID REFERENCES payroll_periods(id) ON DELETE SET NULL,
    timesheet_type VARCHAR(20) NOT NULL DEFAULT 'daily',
    work_date DATE NOT NULL,
    week_start_date DATE,
    week_end_date DATE,
    weekly_hours_breakdown JSONB,
    regular_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    double_overtime_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    night_shift_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    total_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    payroll_processed BOOLEAN NOT NULL DEFAULT false,
    payroll_processed_at TIMESTAMP WITH TIME ZONE,
    calculation_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT CHK_timesheet_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    CONSTRAINT CHK_timesheet_type CHECK (timesheet_type IN ('daily', 'weekly')),
    CONSTRAINT CHK_regular_hours CHECK (regular_hours >= 0 AND regular_hours <= 24),
    CONSTRAINT CHK_overtime_hours CHECK (overtime_hours >= 0 AND overtime_hours <= 24),
    CONSTRAINT CHK_double_overtime_hours CHECK (double_overtime_hours >= 0 AND double_overtime_hours <= 24),
    CONSTRAINT CHK_night_shift_hours CHECK (night_shift_hours >= 0 AND night_shift_hours <= 24)
);

-- Timesheet Approvals Table
CREATE TABLE IF NOT EXISTS timesheet_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL,
    action_date TIMESTAMP WITH TIME ZONE NOT NULL,
    comments TEXT,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT CHK_approval_action CHECK (action IN ('submitted', 'approved', 'rejected', 'resubmitted'))
);

-- Timesheet Indexes
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_employment_record_id ON timesheets(employment_record_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_payroll_period_id ON timesheets(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_work_date ON timesheets(work_date);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);

-- Timesheet Approval Indexes
CREATE INDEX IF NOT EXISTS idx_timesheet_approvals_timesheet_id ON timesheet_approvals(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_approvals_reviewer_id ON timesheet_approvals(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_approvals_action ON timesheet_approvals(action);
CREATE INDEX IF NOT EXISTS idx_timesheet_approvals_action_date ON timesheet_approvals(action_date);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country_code VARCHAR(3) NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
    leave_type leave_type_enum NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5, 2) NOT NULL,
    status leave_request_status_enum NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    payroll_period_id UUID REFERENCES payroll_periods(id) ON DELETE SET NULL,
    is_paid BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT CHK_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT CHK_total_days CHECK (total_days > 0)
);

-- Leave Approvals Table
CREATE TABLE IF NOT EXISTS leave_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status leave_request_status_enum NOT NULL,
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country_code VARCHAR(3) NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
    leave_type leave_type_enum NOT NULL,
    total_days DECIMAL(6, 2) NOT NULL DEFAULT 0,
    used_days DECIMAL(6, 2) NOT NULL DEFAULT 0,
    available_days DECIMAL(6, 2) NOT NULL DEFAULT 0,
    accrual_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT CHK_leave_days CHECK (used_days <= total_days AND available_days >= 0),
    UNIQUE(user_id, country_code, leave_type, year)
);

-- Leave Request Indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_country_code ON leave_requests(country_code);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_type ON leave_requests(leave_type);
CREATE INDEX IF NOT EXISTS idx_leave_requests_payroll_period_id ON leave_requests(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_end_date ON leave_requests(end_date);

-- Leave Approval Indexes
CREATE INDEX IF NOT EXISTS idx_leave_approvals_leave_request_id ON leave_approvals(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_approver_id ON leave_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_status ON leave_approvals(status);

-- Leave Balance Indexes
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_country_code ON leave_balances(country_code);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type ON leave_balances(leave_type);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);

-- Add constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_user_status') THEN
        ALTER TABLE users ADD CONSTRAINT CHK_user_status CHECK (status IN ('active', 'inactive', 'archived'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_client_status') THEN
        ALTER TABLE clients ADD CONSTRAINT CHK_client_status CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_employment_records_user_id') THEN
        ALTER TABLE employment_records ADD CONSTRAINT FK_employment_records_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_employment_records_client_id') THEN
        ALTER TABLE employment_records ADD CONSTRAINT FK_employment_records_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_employment_records_country') THEN
        ALTER TABLE employment_records ADD CONSTRAINT FK_employment_records_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_salary_history_employment_record_id') THEN
        ALTER TABLE salary_history ADD CONSTRAINT FK_salary_history_employment_record_id FOREIGN KEY (employment_record_id) REFERENCES employment_records(id) ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_salary_history_changed_by') THEN
        ALTER TABLE salary_history ADD CONSTRAINT FK_salary_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_roles_user_id') THEN
        ALTER TABLE user_roles ADD CONSTRAINT FK_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_roles_granted_by') THEN
        ALTER TABLE user_roles ADD CONSTRAINT FK_user_roles_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (idempotent - safe to run multiple times)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invitations_updated_at ON invitations;
CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employment_records_updated_at ON employment_records;
CREATE TRIGGER update_employment_records_updated_at BEFORE UPDATE ON employment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_currencies_updated_at ON currencies;
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_years_updated_at ON tax_years;
CREATE TRIGGER update_tax_years_updated_at BEFORE UPDATE ON tax_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_region_configurations_updated_at ON region_configurations;
CREATE TRIGGER update_region_configurations_updated_at BEFORE UPDATE ON region_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exchange_rates_updated_at ON exchange_rates;
CREATE TRIGGER update_exchange_rates_updated_at BEFORE UPDATE ON exchange_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payroll_periods_updated_at ON payroll_periods;
CREATE TRIGGER update_payroll_periods_updated_at BEFORE UPDATE ON payroll_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payroll_processing_logs_updated_at ON payroll_processing_logs;
CREATE TRIGGER update_payroll_processing_logs_updated_at BEFORE UPDATE ON payroll_processing_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salary_components_updated_at ON salary_components;
CREATE TRIGGER update_salary_components_updated_at BEFORE UPDATE ON salary_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_statutory_components_updated_at ON statutory_components;
CREATE TRIGGER update_statutory_components_updated_at BEFORE UPDATE ON statutory_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payslips_updated_at ON payslips;
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON payslips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timesheets_updated_at ON timesheets;
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timesheet_approvals_updated_at ON timesheet_approvals;
CREATE TRIGGER update_timesheet_approvals_updated_at BEFORE UPDATE ON timesheet_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial test data
INSERT INTO clients (id, name, description, contact_info, status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 'Initial test client for development',
     '{"email": "contact@acme.com", "phone": "+1-555-0101", "address": {"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001"}}',
     'active'),
    ('550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', 'Technology startup client',
     '{"email": "info@techstart.com", "phone": "+1-555-0102", "address": {"street": "456 Innovation Blvd", "city": "San Francisco", "state": "CA", "zip": "94105"}}',
     'active')
ON CONFLICT DO NOTHING;

-- Insert test user with known password (Admin123!)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, address, profile_data, status, is_active, email_verified) VALUES 
    ('650e8400-e29b-41d4-a716-446655440001', 'admin@teamified.com', 
     '$argon2id$v=19$m=65536,t=3,p=1$/28HIUPl98O/QeSv53lfmg$bCpklaUTVJDOMOiD6Y61YhnuXzR9lZQT7MzepR8W65k', 
     'Admin', 'User', '+1-555-1001',
     '{"street": "100 Admin St", "city": "New York", "state": "NY", "zip": "10001"}',
     '{"department": "Administration", "title": "System Administrator", "skills": ["Management", "System Administration"]}',
     'active', true, true)
ON CONFLICT DO NOTHING;

-- Insert admin role for test user
INSERT INTO user_roles (id, user_id, role_type, scope, granted_by, created_at) VALUES
    ('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'admin', 'all', '650e8400-e29b-41d4-a716-446655440001', NOW())
ON CONFLICT DO NOTHING;

-- Create EOR profiles table
CREATE TABLE IF NOT EXISTS eor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    date_of_birth DATE,
    phone_number VARCHAR(20),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Professional Information
    job_title VARCHAR(200),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    start_date DATE,
    employment_type VARCHAR(50),
    manager_name VARCHAR(200),
    
    -- CV Information
    skills JSONB,
    experience_years INTEGER CHECK (experience_years >= 0 AND experience_years <= 50),
    education JSONB,
    certifications JSONB,
    languages JSONB,
    
    -- Profile Completion
    profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    is_profile_complete BOOLEAN DEFAULT false,
    profile_status VARCHAR(20) DEFAULT 'incomplete' CHECK (profile_status IN ('incomplete', 'pending', 'complete')),
    
    -- Country Configuration
    country_code VARCHAR(2) NOT NULL,
    timezone VARCHAR(50),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for eor_profiles table
CREATE INDEX IF NOT EXISTS idx_eor_profiles_user_id ON eor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_eor_profiles_country_code ON eor_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_eor_profiles_profile_status ON eor_profiles(profile_status);

-- Create documents table for CV and tax document management (enum already created at top)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eor_profile_id UUID REFERENCES eor_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type documents_document_type_enum NOT NULL,
    category VARCHAR(50), -- Document category: 'cv', 'identity', 'employment', 'education'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    version_id VARCHAR(100) NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status VARCHAR(20), -- 'pending', 'approved', 'rejected', or null
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_by_role VARCHAR(50) DEFAULT 'candidate',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_document_status CHECK (status IN ('pending', 'approved', 'rejected') OR status IS NULL),
    CONSTRAINT chk_documents_owner CHECK (
        (eor_profile_id IS NOT NULL AND user_id IS NULL) OR 
        (eor_profile_id IS NULL AND user_id IS NOT NULL)
    )
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_eor_profile_id ON documents(eor_profile_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);

-- Onboarding document requirements configuration table
CREATE TABLE IF NOT EXISTS onboarding_document_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_required INTEGER NOT NULL DEFAULT 1,
    identity_required INTEGER NOT NULL DEFAULT 1,
    employment_required INTEGER NOT NULL DEFAULT 1,
    education_required INTEGER NOT NULL DEFAULT 1,
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO onboarding_document_requirements (cv_required, identity_required, employment_required, education_required)
VALUES (1, 1, 1, 1)
ON CONFLICT DO NOTHING;

