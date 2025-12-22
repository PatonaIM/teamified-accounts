-- ============================================================================
-- Supabase PostgreSQL to Azure PostgreSQL Migration
-- Script 04: Indexes and Foreign Key Constraints
-- ============================================================================
-- Purpose: Add all indexes and foreign key constraints to Azure PostgreSQL
-- Run this script against the TARGET (Azure PostgreSQL) database
-- Prerequisites: Run 03_schema_creation.sql first
-- ============================================================================

\echo '=============================================='
\echo 'CREATING INDEXES AND FOREIGN KEY CONSTRAINTS'
\echo '=============================================='
\echo ''

-- ============================================================================
-- 1. FOREIGN KEY CONSTRAINTS
-- ============================================================================
\echo '1. Adding Foreign Key Constraints'
\echo '----------------------------------'

-- countries -> currencies
ALTER TABLE countries
ADD CONSTRAINT countries_currency_id_fkey
FOREIGN KEY (currency_id) REFERENCES currencies(id);
\echo 'Added FK: countries -> currencies'

-- exchange_rates -> currencies
ALTER TABLE exchange_rates
ADD CONSTRAINT exchange_rates_from_currency_id_fkey
FOREIGN KEY (from_currency_id) REFERENCES currencies(id);

ALTER TABLE exchange_rates
ADD CONSTRAINT exchange_rates_to_currency_id_fkey
FOREIGN KEY (to_currency_id) REFERENCES currencies(id);
\echo 'Added FK: exchange_rates -> currencies'

-- users -> clients
ALTER TABLE users
ADD CONSTRAINT users_client_id_fkey
FOREIGN KEY (client_id) REFERENCES clients(id);
\echo 'Added FK: users -> clients'

-- eor_profiles -> users
ALTER TABLE eor_profiles
ADD CONSTRAINT eor_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);
\echo 'Added FK: eor_profiles -> users'

-- employment_records -> users, clients, countries
ALTER TABLE employment_records
ADD CONSTRAINT fk_employment_records_user_id
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE employment_records
ADD CONSTRAINT fk_employment_records_client_id
FOREIGN KEY (client_id) REFERENCES clients(id);

ALTER TABLE employment_records
ADD CONSTRAINT fk_employment_records_country
FOREIGN KEY (country_id) REFERENCES countries(id);
\echo 'Added FK: employment_records -> users, clients, countries'

-- sessions -> users
ALTER TABLE sessions
ADD CONSTRAINT sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);
\echo 'Added FK: sessions -> users'

-- audit_logs -> users
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_actor_user_id_fkey
FOREIGN KEY (actor_user_id) REFERENCES users(id);
\echo 'Added FK: audit_logs -> users'

-- documents -> users, eor_profiles
ALTER TABLE documents
ADD CONSTRAINT documents_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE documents
ADD CONSTRAINT documents_eor_profile_id_fkey
FOREIGN KEY (eor_profile_id) REFERENCES eor_profiles(id);

ALTER TABLE documents
ADD CONSTRAINT documents_reviewed_by_fkey
FOREIGN KEY (reviewed_by) REFERENCES users(id);

ALTER TABLE documents
ADD CONSTRAINT documents_uploaded_by_fkey
FOREIGN KEY (uploaded_by) REFERENCES users(id);
\echo 'Added FK: documents -> users, eor_profiles'

-- invitations -> clients, users, organizations
ALTER TABLE invitations
ADD CONSTRAINT invitations_client_id_fkey
FOREIGN KEY (client_id) REFERENCES clients(id);

ALTER TABLE invitations
ADD CONSTRAINT invitations_created_by_fkey
FOREIGN KEY (created_by) REFERENCES users(id);
\echo 'Added FK: invitations -> clients, users'

-- organization_members -> organizations, users
ALTER TABLE organization_members
ADD CONSTRAINT organization_members_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES organizations(id);

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_invited_by_fkey
FOREIGN KEY (invited_by) REFERENCES users(id);
\echo 'Added FK: organization_members -> organizations, users'

-- organization_invitations -> organizations, users
ALTER TABLE organization_invitations
ADD CONSTRAINT organization_invitations_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES organizations(id);

ALTER TABLE organization_invitations
ADD CONSTRAINT organization_invitations_invited_by_fkey
FOREIGN KEY (invited_by) REFERENCES users(id);
\echo 'Added FK: organization_invitations -> organizations, users'

-- user_emails -> users, organizations
ALTER TABLE user_emails
ADD CONSTRAINT user_emails_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_emails
ADD CONSTRAINT user_emails_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES organizations(id);
\echo 'Added FK: user_emails -> users, organizations'

-- user_roles -> users
ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_user_id
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_granted_by
FOREIGN KEY (granted_by) REFERENCES users(id);
\echo 'Added FK: user_roles -> users'

-- user_themes -> users
ALTER TABLE user_themes
ADD CONSTRAINT user_themes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);
\echo 'Added FK: user_themes -> users'

-- user_oauth_logins -> users, oauth_clients
ALTER TABLE user_oauth_logins
ADD CONSTRAINT "FK_user_oauth_logins_user"
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_oauth_logins
ADD CONSTRAINT "FK_user_oauth_logins_oauth_client"
FOREIGN KEY (oauth_client_id) REFERENCES oauth_clients(id);
\echo 'Added FK: user_oauth_logins -> users, oauth_clients'

-- user_app_activity -> users, oauth_clients
ALTER TABLE user_app_activity
ADD CONSTRAINT "FK_user_app_activity_user"
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_app_activity
ADD CONSTRAINT "FK_user_app_activity_oauth_client"
FOREIGN KEY (oauth_client_id) REFERENCES oauth_clients(id);
\echo 'Added FK: user_app_activity -> users, oauth_clients'

-- user_app_permissions -> users, oauth_clients
ALTER TABLE user_app_permissions
ADD CONSTRAINT fk_user_app_permissions_user
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_app_permissions
ADD CONSTRAINT fk_user_app_permissions_oauth_client
FOREIGN KEY (oauth_client_id) REFERENCES oauth_clients(id);

ALTER TABLE user_app_permissions
ADD CONSTRAINT fk_user_app_permissions_granted_by
FOREIGN KEY (granted_by) REFERENCES users(id);
\echo 'Added FK: user_app_permissions -> users, oauth_clients'

-- region_configurations -> countries
ALTER TABLE region_configurations
ADD CONSTRAINT region_configurations_country_id_fkey
FOREIGN KEY (country_id) REFERENCES countries(id);
\echo 'Added FK: region_configurations -> countries'

-- salary_components -> countries
ALTER TABLE salary_components
ADD CONSTRAINT salary_components_country_id_fkey
FOREIGN KEY (country_id) REFERENCES countries(id);
\echo 'Added FK: salary_components -> countries'

-- statutory_components -> countries
ALTER TABLE statutory_components
ADD CONSTRAINT statutory_components_country_id_fkey
FOREIGN KEY (country_id) REFERENCES countries(id);
\echo 'Added FK: statutory_components -> countries'

-- tax_years -> countries
ALTER TABLE tax_years
ADD CONSTRAINT tax_years_country_id_fkey
FOREIGN KEY (country_id) REFERENCES countries(id);
\echo 'Added FK: tax_years -> countries'

-- payroll_periods -> countries
ALTER TABLE payroll_periods
ADD CONSTRAINT payroll_periods_country_id_fkey
FOREIGN KEY (country_id) REFERENCES countries(id);
\echo 'Added FK: payroll_periods -> countries'

-- leave_balances -> users, countries
ALTER TABLE leave_balances
ADD CONSTRAINT leave_balances_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE leave_balances
ADD CONSTRAINT leave_balances_country_code_fkey
FOREIGN KEY (country_code) REFERENCES countries(code);
\echo 'Added FK: leave_balances -> users, countries'

-- leave_requests -> users, countries, payroll_periods
ALTER TABLE leave_requests
ADD CONSTRAINT leave_requests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE leave_requests
ADD CONSTRAINT leave_requests_country_code_fkey
FOREIGN KEY (country_code) REFERENCES countries(code);

ALTER TABLE leave_requests
ADD CONSTRAINT leave_requests_payroll_period_id_fkey
FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id);
\echo 'Added FK: leave_requests -> users, countries, payroll_periods'

-- payroll_processing_logs -> countries, payroll_periods
ALTER TABLE payroll_processing_logs
ADD CONSTRAINT payroll_processing_logs_country_id_fkey
FOREIGN KEY (country_id) REFERENCES countries(id);

ALTER TABLE payroll_processing_logs
ADD CONSTRAINT payroll_processing_logs_payroll_period_id_fkey
FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id);
\echo 'Added FK: payroll_processing_logs -> countries, payroll_periods'

-- payslips -> users, countries, payroll_periods
ALTER TABLE payslips
ADD CONSTRAINT payslips_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE payslips
ADD CONSTRAINT payslips_country_id_fkey
FOREIGN KEY (country_id) REFERENCES countries(id);

ALTER TABLE payslips
ADD CONSTRAINT payslips_payroll_period_id_fkey
FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id);
\echo 'Added FK: payslips -> users, countries, payroll_periods'

-- timesheets -> users, employment_records, payroll_periods
ALTER TABLE timesheets
ADD CONSTRAINT timesheets_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE timesheets
ADD CONSTRAINT timesheets_employment_record_id_fkey
FOREIGN KEY (employment_record_id) REFERENCES employment_records(id);

ALTER TABLE timesheets
ADD CONSTRAINT timesheets_payroll_period_id_fkey
FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id);

ALTER TABLE timesheets
ADD CONSTRAINT timesheets_approved_by_id_fkey
FOREIGN KEY (approved_by_id) REFERENCES users(id);

ALTER TABLE timesheets
ADD CONSTRAINT timesheets_rejected_by_id_fkey
FOREIGN KEY (rejected_by_id) REFERENCES users(id);
\echo 'Added FK: timesheets -> users, employment_records, payroll_periods'

-- timesheet_approvals -> timesheets, users
ALTER TABLE timesheet_approvals
ADD CONSTRAINT timesheet_approvals_timesheet_id_fkey
FOREIGN KEY (timesheet_id) REFERENCES timesheets(id);

ALTER TABLE timesheet_approvals
ADD CONSTRAINT timesheet_approvals_reviewer_id_fkey
FOREIGN KEY (reviewer_id) REFERENCES users(id);
\echo 'Added FK: timesheet_approvals -> timesheets, users'

-- leave_approvals -> leave_requests, users
ALTER TABLE leave_approvals
ADD CONSTRAINT leave_approvals_leave_request_id_fkey
FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id);

ALTER TABLE leave_approvals
ADD CONSTRAINT leave_approvals_approver_id_fkey
FOREIGN KEY (approver_id) REFERENCES users(id);
\echo 'Added FK: leave_approvals -> leave_requests, users'

-- salary_history -> employment_records, users
ALTER TABLE salary_history
ADD CONSTRAINT fk_salary_history_employment_record_id
FOREIGN KEY (employment_record_id) REFERENCES employment_records(id);

ALTER TABLE salary_history
ADD CONSTRAINT fk_salary_history_changed_by
FOREIGN KEY (changed_by) REFERENCES users(id);
\echo 'Added FK: salary_history -> employment_records, users'

-- performance_metrics -> payroll_periods, payroll_processing_logs
ALTER TABLE performance_metrics
ADD CONSTRAINT performance_metrics_payroll_period_id_fkey
FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id);

ALTER TABLE performance_metrics
ADD CONSTRAINT performance_metrics_processing_log_id_fkey
FOREIGN KEY (processing_log_id) REFERENCES payroll_processing_logs(id);
\echo 'Added FK: performance_metrics -> payroll_periods, payroll_processing_logs'

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
\echo ''
\echo '2. Creating Indexes'
\echo '-------------------'

-- api_keys indexes
CREATE INDEX IF NOT EXISTS "IDX_API_KEY_HASH" ON api_keys("keyHash");
CREATE INDEX IF NOT EXISTS "IDX_API_KEY_PREFIX" ON api_keys("keyPrefix");
CREATE INDEX IF NOT EXISTS "IDX_API_KEY_USER" ON api_keys("userId");
\echo 'Created indexes: api_keys'

-- audit_logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
\echo 'Created indexes: audit_logs'

-- countries indexes
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_currency_id ON countries(currency_id);
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON countries(is_active);
\echo 'Created indexes: countries'

-- currencies indexes
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_is_active ON currencies(is_active);
\echo 'Created indexes: currencies'

-- documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_eor_profile_id ON documents(eor_profile_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
\echo 'Created indexes: documents'

-- employment_records indexes
CREATE INDEX IF NOT EXISTS idx_employment_records_client_id ON employment_records(client_id);
CREATE INDEX IF NOT EXISTS idx_employment_records_country_id ON employment_records(country_id);
CREATE INDEX IF NOT EXISTS idx_employment_records_start_date ON employment_records(start_date);
CREATE INDEX IF NOT EXISTS idx_employment_records_status ON employment_records(status);
CREATE INDEX IF NOT EXISTS idx_employment_records_user_id ON employment_records(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_employment_per_client ON employment_records(user_id, client_id, status);
\echo 'Created indexes: employment_records'

-- eor_profiles indexes
CREATE INDEX IF NOT EXISTS idx_eor_profiles_country_code ON eor_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_eor_profiles_profile_status ON eor_profiles(profile_status);
CREATE INDEX IF NOT EXISTS idx_eor_profiles_user_id ON eor_profiles(user_id);
\echo 'Created indexes: eor_profiles'

-- exchange_rates indexes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_effective_date ON exchange_rates(effective_date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_currency ON exchange_rates(from_currency_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_to_currency ON exchange_rates(to_currency_id);
\echo 'Created indexes: exchange_rates'

-- invitations indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_invite_code ON invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
\echo 'Created indexes: invitations'

-- leave_approvals indexes
CREATE INDEX IF NOT EXISTS idx_leave_approvals_approver_id ON leave_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_leave_request_id ON leave_approvals(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_status ON leave_approvals(status);
\echo 'Created indexes: leave_approvals'

-- leave_balances indexes
CREATE INDEX IF NOT EXISTS idx_leave_balances_country_code ON leave_balances(country_code);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type ON leave_balances(leave_type);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);
\echo 'Created indexes: leave_balances'

-- leave_requests indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_country_code ON leave_requests(country_code);
CREATE INDEX IF NOT EXISTS idx_leave_requests_end_date ON leave_requests(end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_type ON leave_requests(leave_type);
CREATE INDEX IF NOT EXISTS idx_leave_requests_payroll_period_id ON leave_requests(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
\echo 'Created indexes: leave_requests'

-- oauth_clients indexes
CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_default_intent ON oauth_clients(default_intent);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_is_active ON oauth_clients(is_active);
\echo 'Created indexes: oauth_clients'

-- organization_invitations indexes
CREATE INDEX IF NOT EXISTS idx_org_invitations_expires_at ON organization_invitations(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_invitations_invite_code ON organization_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_org_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_status ON organization_invitations(status);
\echo 'Created indexes: organization_invitations'

-- organization_members indexes
CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON organization_members(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_unique ON organization_members(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
\echo 'Created indexes: organization_members'

-- organizations indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
\echo 'Created indexes: organizations'

-- payroll_periods indexes
CREATE INDEX IF NOT EXISTS idx_payroll_periods_country_id ON payroll_periods(country_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_start_date ON payroll_periods(start_date);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_status ON payroll_periods(status);
\echo 'Created indexes: payroll_periods'

-- payroll_processing_logs indexes
CREATE INDEX IF NOT EXISTS idx_payroll_processing_logs_country_id ON payroll_processing_logs(country_id);
CREATE INDEX IF NOT EXISTS idx_payroll_processing_logs_period_id ON payroll_processing_logs(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_processing_logs_status ON payroll_processing_logs(status);
\echo 'Created indexes: payroll_processing_logs'

-- payslips indexes
CREATE INDEX IF NOT EXISTS idx_payslips_calculated_at ON payslips(calculated_at);
CREATE INDEX IF NOT EXISTS idx_payslips_calculation_id ON payslips(calculation_id);
CREATE INDEX IF NOT EXISTS idx_payslips_country_id ON payslips(country_id);
CREATE INDEX IF NOT EXISTS idx_payslips_payroll_period_id ON payslips(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status);
CREATE INDEX IF NOT EXISTS idx_payslips_user_id ON payslips(user_id);
\echo 'Created indexes: payslips'

-- performance_metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_processing_log_id ON performance_metrics(processing_log_id);
\echo 'Created indexes: performance_metrics'

-- region_configurations indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_region_configurations_country_config ON region_configurations(country_id, config_key);
\echo 'Created indexes: region_configurations'

-- salary_components indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_salary_components_country_code ON salary_components(country_id, code);
\echo 'Created indexes: salary_components'

-- sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
\echo 'Created indexes: sessions'

-- statutory_components indexes
CREATE INDEX IF NOT EXISTS idx_statutory_components_country ON statutory_components(country_id);
CREATE INDEX IF NOT EXISTS idx_statutory_components_type ON statutory_components(type);
\echo 'Created indexes: statutory_components'

-- tax_years indexes
CREATE INDEX IF NOT EXISTS idx_tax_years_country_id ON tax_years(country_id);
CREATE INDEX IF NOT EXISTS idx_tax_years_is_current ON tax_years(is_current);
CREATE INDEX IF NOT EXISTS idx_tax_years_year ON tax_years(year);
\echo 'Created indexes: tax_years'

-- timesheets indexes
CREATE INDEX IF NOT EXISTS idx_timesheets_employment_record_id ON timesheets(employment_record_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_payroll_period_id ON timesheets(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_week_start ON timesheets(week_start);
\echo 'Created indexes: timesheets'

-- timesheet_approvals indexes
CREATE INDEX IF NOT EXISTS idx_timesheet_approvals_reviewer ON timesheet_approvals(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_approvals_timesheet ON timesheet_approvals(timesheet_id);
\echo 'Created indexes: timesheet_approvals'

-- users indexes
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_country_code ON users(country_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
\echo 'Created indexes: users'

-- user_emails indexes
CREATE INDEX IF NOT EXISTS idx_user_emails_organization_id ON user_emails(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_emails_user_id ON user_emails(user_id);
\echo 'Created indexes: user_emails'

-- user_roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
\echo 'Created indexes: user_roles'

-- user_themes indexes
CREATE INDEX IF NOT EXISTS idx_user_themes_user_id ON user_themes(user_id);
\echo 'Created indexes: user_themes'

-- user_oauth_logins indexes
CREATE INDEX IF NOT EXISTS idx_user_oauth_logins_oauth_client_id ON user_oauth_logins(oauth_client_id);
CREATE INDEX IF NOT EXISTS idx_user_oauth_logins_user_id ON user_oauth_logins(user_id);
\echo 'Created indexes: user_oauth_logins'

-- user_app_activity indexes
CREATE INDEX IF NOT EXISTS idx_user_app_activity_oauth_client_id ON user_app_activity(oauth_client_id);
CREATE INDEX IF NOT EXISTS idx_user_app_activity_user_id ON user_app_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_activity_created_at ON user_app_activity(created_at);
\echo 'Created indexes: user_app_activity'

-- user_app_permissions indexes
CREATE INDEX IF NOT EXISTS idx_user_app_permissions_oauth_client_id ON user_app_permissions(oauth_client_id);
CREATE INDEX IF NOT EXISTS idx_user_app_permissions_user_id ON user_app_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_permissions_is_active ON user_app_permissions(is_active);
\echo 'Created indexes: user_app_permissions'

-- ============================================================================
\echo ''
\echo '=============================================='
\echo 'INDEXES AND CONSTRAINTS CREATION COMPLETE'
\echo '=============================================='
\echo ''
\echo 'Next: Run 05_data_migration.sql for data migration commands'
\echo ''
