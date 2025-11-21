-- Database Seeding Script for User Management System
-- This script creates test data for local development and testing
-- Run this after creating the database schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing data (in development only)
-- WARNING: This will delete all existing data
TRUNCATE TABLE audit_log, migration_log, salary_history, user_roles, employment_records, clients, users RESTART IDENTITY CASCADE;

-- Insert test clients
INSERT INTO clients (id, name, contact_info, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 
 '{"email": "contact@acme.com", "phone": "+1-555-0101", "address": {"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001"}}', 
 'active', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', 
 '{"email": "info@techstart.com", "phone": "+1-555-0102", "address": {"street": "456 Innovation Blvd", "city": "San Francisco", "state": "CA", "zip": "94105"}}', 
 'active', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440003', 'Global Solutions Ltd', 
 '{"email": "admin@globalsolutions.com", "phone": "+1-555-0103", "address": {"street": "789 Corporate Dr", "city": "Chicago", "state": "IL", "zip": "60601"}}', 
 'active', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440004', 'Future Dynamics', 
 '{"email": "hr@futuredynamics.com", "phone": "+1-555-0104", "address": {"street": "321 Future St", "city": "Austin", "state": "TX", "zip": "73301"}}', 
 'inactive', NOW(), NOW());

-- Insert test users
INSERT INTO users (id, email, first_name, last_name, phone, password_hash, address, profile_data, status, created_at, updated_at) VALUES
-- Admin users
('650e8400-e29b-41d4-a716-446655440001', 'admin@teamified.com', 'Admin', 'User', '+1-555-1001', 
 '$argon2id$v=19$m=65536,t=3,p=1$cq/zu3Wt1ShN4BNwnZZLFg$AKP78d/8OGjBlr2rW4u6zOVHPi3HXbATyS32DNdvlzs',
 '{"street": "100 Admin St", "city": "New York", "state": "NY", "zip": "10001"}',
 '{"department": "Administration", "title": "System Administrator", "skills": ["Management", "System Administration"]}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440002', 'hr@teamified.com', 'HR', 'Manager', '+1-555-1002', 
 '$argon2id$v=19$m=65536,t=3,p=1$Sp5BIbYhbFR4rfcfa0mpRw$qFGcH823/5O1VlPi41kpvzGwGLeoegf6ok6SPmNf/AM',
 '{"street": "200 HR Ave", "city": "New York", "state": "NY", "zip": "10001"}',
 '{"department": "Human Resources", "title": "HR Manager", "skills": ["Recruitment", "Employee Relations"]}',
 'active', NOW(), NOW()),

-- Team members (EORs)
('650e8400-e29b-41d4-a716-446655440003', 'john.doe@example.com', 'John', 'Doe', '+1-555-2001', 
 '$argon2id$v=19$m=65536,t=3,p=1$bEe/pXWiljW51plddh5xLg$7p5NTLfLjZ6Ol95cXiDpov1RMh7Zo5fNkNXeDc+3K8E',
 '{"street": "300 Main St", "city": "New York", "state": "NY", "zip": "10001"}',
 '{"department": "Engineering", "title": "Senior Software Engineer", "skills": ["JavaScript", "React", "Node.js"], "experience_years": 5}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440004', 'jane.smith@example.com', 'Jane', 'Smith', '+1-555-2002', 
 '$argon2id$v=19$m=65536,t=3,p=1$bEe/pXWiljW51plddh5xLg$7p5NTLfLjZ6Ol95cXiDpov1RMh7Zo5fNkNXeDc+3K8E',
 '{"street": "400 Oak Ave", "city": "San Francisco", "state": "CA", "zip": "94105"}',
 '{"department": "Design", "title": "UX Designer", "skills": ["Figma", "User Research", "Prototyping"], "experience_years": 3}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440005', 'mike.johnson@example.com', 'Mike', 'Johnson', '+1-555-2003', 
 '$argon2id$v=19$m=65536,t=3,p=1$bEe/pXWiljW51plddh5xLg$7p5NTLfLjZ6Ol95cXiDpov1RMh7Zo5fNkNXeDc+3K8E',
 '{"street": "500 Pine St", "city": "Chicago", "state": "IL", "zip": "60601"}',
 '{"department": "Marketing", "title": "Marketing Manager", "skills": ["Digital Marketing", "SEO", "Analytics"], "experience_years": 4}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440006', 'sarah.wilson@example.com', 'Sarah', 'Wilson', '+1-555-2004', 
 '$argon2id$v=19$m=65536,t=3,p=1$bEe/pXWiljW51plddh5xLg$7p5NTLfLjZ6Ol95cXiDpov1RMh7Zo5fNkNXeDc+3K8E',
 '{"street": "600 Elm St", "city": "Austin", "state": "TX", "zip": "73301"}',
 '{"department": "Engineering", "title": "DevOps Engineer", "skills": ["AWS", "Docker", "Kubernetes"], "experience_years": 6}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440007', 'david.brown@example.com', 'David', 'Brown', '+1-555-2005', 
 '$argon2id$v=19$m=65536,t=3,p=1$bEe/pXWiljW51plddh5xLg$7p5NTLfLjZ6Ol95cXiDpov1RMh7Zo5fNkNXeDc+3K8E',
 '{"street": "700 Maple Ave", "city": "Seattle", "state": "WA", "zip": "98101"}',
 '{"department": "Sales", "title": "Sales Director", "skills": ["Sales Management", "CRM", "Negotiation"], "experience_years": 8}',
 'active', NOW(), NOW()),

-- Candidates
('650e8400-e29b-41d4-a716-446655440008', 'alex.garcia@example.com', 'Alex', 'Garcia', '+1-555-3001', 
 '$argon2id$v=19$m=65536,t=3,p=1$TCA8oqeTNO5HPKpImiBQVA$SGrGGdqNvKj5o0/PsaQlWiaewg1msUIf2uq1wdHOfx0',
 '{"street": "800 Cedar St", "city": "Miami", "state": "FL", "zip": "33101"}',
 '{"department": "Engineering", "title": "Software Developer", "skills": ["Python", "Django", "PostgreSQL"], "experience_years": 2}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440009', 'emma.davis@example.com', 'Emma', 'Davis', '+1-555-3002', 
 '$argon2id$v=19$m=65536,t=3,p=1$TCA8oqeTNO5HPKpImiBQVA$SGrGGdqNvKj5o0/PsaQlWiaewg1msUIf2uq1wdHOfx0',
 '{"street": "900 Birch Ave", "city": "Denver", "state": "CO", "zip": "80201"}',
 '{"department": "Design", "title": "Graphic Designer", "skills": ["Adobe Creative Suite", "Branding", "Print Design"], "experience_years": 1}',
 'active', NOW(), NOW()),

-- Client users
('650e8400-e29b-41d4-a716-446655440010', 'client@acme.com', 'Acme', 'Manager', '+1-555-4001', 
 '$argon2id$v=19$m=65536,t=3,p=1$hoNFgfY4f0U2zv30wcaVDw$MhDhyf1pbX3R9FSRiv6pKVYxvegdGZ5Ue9b5+TT3Hhk',
 '{"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001"}',
 '{"department": "Management", "title": "Client Manager", "skills": ["Project Management", "Client Relations"], "experience_years": 10}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440011', 'client@techstart.com', 'TechStart', 'Admin', '+1-555-4002', 
 '$argon2id$v=19$m=65536,t=3,p=1$hoNFgfY4f0U2zv30wcaVDw$MhDhyf1pbX3R9FSRiv6pKVYxvegdGZ5Ue9b5+TT3Hhk',
 '{"street": "456 Innovation Blvd", "city": "San Francisco", "state": "CA", "zip": "94105"}',
 '{"department": "Administration", "title": "Client Administrator", "skills": ["Administration", "Client Management"], "experience_years": 8}',
 'active', NOW(), NOW()),

-- Inactive user
('650e8400-e29b-41d4-a716-446655440012', 'inactive.user@example.com', 'Inactive', 'User', '+1-555-5001', 
 '$argon2id$v=19$m=65536,t=3,p=1$TCA8oqeTNO5HPKpImiBQVA$SGrGGdqNvKj5o0/PsaQlWiaewg1msUIf2uq1wdHOfx0',
 '{"street": "1000 Spruce St", "city": "Portland", "state": "OR", "zip": "97201"}',
 '{"department": "Engineering", "title": "Software Engineer", "skills": ["Java", "Spring", "MySQL"], "experience_years": 3}',
 'inactive', NOW(), NOW());

-- Insert employment records
INSERT INTO employment_records (id, user_id, client_id, start_date, end_date, role, status, created_at, updated_at) VALUES
-- Active employments
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', NULL, 'Senior Software Engineer', 'active', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2024-02-01', NULL, 'UX Designer', 'active', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-01', NULL, 'Marketing Manager', 'active', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '2024-03-01', NULL, 'DevOps Engineer', 'active', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '2024-02-15', NULL, 'Sales Director', 'active', NOW(), NOW()),

-- Historical employments
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '2023-06-01', '2023-12-31', 'Software Engineer', 'completed', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '2023-08-01', '2024-01-31', 'UI Designer', 'completed', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', '2023-01-01', '2023-12-31', 'Software Engineer', 'completed', NOW(), NOW());

-- Insert salary history
INSERT INTO salary_history (id, employment_record_id, salary_amount, salary_currency, effective_date, change_reason, changed_by, created_at) VALUES
-- Current salaries
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 95000.00, 'USD', '2024-01-15', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 85000.00, 'USD', '2024-02-01', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', 90000.00, 'USD', '2024-01-01', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440004', 110000.00, 'USD', '2024-03-01', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440005', 120000.00, 'USD', '2024-02-15', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW()),

-- Salary increases
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440001', 100000.00, 'USD', '2024-06-01', 'promotion', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440002', 90000.00, 'USD', '2024-08-01', 'performance_review', '650e8400-e29b-41d4-a716-446655440001', NOW()),

-- Historical salaries
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440006', 80000.00, 'USD', '2023-06-01', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440006', 85000.00, 'USD', '2023-09-01', 'performance_review', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440007', 75000.00, 'USD', '2023-08-01', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440008', 70000.00, 'USD', '2023-01-01', 'initial_salary', '650e8400-e29b-41d4-a716-446655440001', NOW());

-- Insert user roles
INSERT INTO user_roles (id, user_id, role_type, scope, scope_entity_id, granted_by, created_at, expires_at) VALUES
-- Admin roles
('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'admin', 'all', NULL, '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'admin', 'all', NULL, '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),

-- EOR roles (team members)
('950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'eor', 'client', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'eor', 'client', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'eor', 'client', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440006', 'eor', 'client', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440007', 'eor', 'client', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),

-- Timesheet approvers
('950e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001', 'timesheet_approver', 'client', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440002', 'timesheet_approver', 'client', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),

-- Leave approvers
('950e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001', 'leave_approver', 'client', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440002', 'leave_approver', 'client', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),

-- Candidate roles
('950e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440008', 'candidate', 'user', '650e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440009', 'candidate', 'user', '650e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),

-- Client roles
('950e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440010', 'client', 'client', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440011', 'client', 'client', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL);

-- Insert sample audit log entries
INSERT INTO audit_log (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'users', '650e8400-e29b-41d4-a716-446655440003', 'INSERT', NULL, '{"email": "john.doe@example.com", "first_name": "John", "last_name": "Doe"}', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('a50e8400-e29b-41d4-a716-446655440002', 'employment_records', '750e8400-e29b-41d4-a716-446655440001', 'INSERT', NULL, '{"user_id": "650e8400-e29b-41d4-a716-446655440003", "client_id": "550e8400-e29b-41d4-a716-446655440001", "role": "Senior Software Engineer"}', '650e8400-e29b-41d4-a716-446655440001', NOW()),
('a50e8400-e29b-41d4-a716-446655440003', 'salary_history', '850e8400-e29b-41d4-a716-446655440006', 'INSERT', NULL, '{"salary_amount": 100000.00, "change_reason": "promotion"}', '650e8400-e29b-41d4-a716-446655440001', NOW());

-- Insert sample migration log entries
INSERT INTO migration_log (id, migration_batch, source_system, source_id, target_table, target_id, migration_status, migrated_at, migrated_by) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'initial_migration_2024_12_19', 'zoho_people', 'zoho_user_123', 'users', '650e8400-e29b-41d4-a716-446655440003', 'success', NOW(), '650e8400-e29b-41d4-a716-446655440001'),
('b50e8400-e29b-41d4-a716-446655440002', 'initial_migration_2024_12_19', 'zoho_people', 'zoho_client_456', 'clients', '550e8400-e29b-41d4-a716-446655440001', 'success', NOW(), '650e8400-e29b-41d4-a716-446655440001'),
('b50e8400-e29b-41d4-a716-446655440003', 'initial_migration_2024_12_19', 'zoho_people', 'zoho_employment_789', 'employment_records', '750e8400-e29b-41d4-a716-446655440001', 'success', NOW(), '650e8400-e29b-41d4-a716-446655440001');

-- Create some test data for bulk operations
-- Add more users for testing bulk operations
INSERT INTO users (id, email, first_name, last_name, phone, address, profile_data, status, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440011', 'test1@example.com', 'Test', 'User1', '+1-555-5001', 
 '{"street": "1100 Test St", "city": "Test City", "state": "TS", "zip": "12345"}',
 '{"department": "Testing", "title": "Test Engineer", "skills": ["Testing", "QA"]}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440012', 'test2@example.com', 'Test', 'User2', '+1-555-5002', 
 '{"street": "1200 Test Ave", "city": "Test City", "state": "TS", "zip": "12345"}',
 '{"department": "Testing", "title": "Test Engineer", "skills": ["Testing", "QA"]}',
 'active', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440013', 'test3@example.com', 'Test', 'User3', '+1-555-5003', 
 '{"street": "1300 Test Blvd", "city": "Test City", "state": "TS", "zip": "12345"}',
 '{"department": "Testing", "title": "Test Engineer", "skills": ["Testing", "QA"]}',
 'active', NOW(), NOW());

-- Add candidate roles for test users
INSERT INTO user_roles (id, user_id, role_type, scope, scope_entity_id, granted_by, created_at, expires_at) VALUES
('950e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440011', 'candidate', 'user', '650e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440012', 'candidate', 'user', '650e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL),
('950e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440013', 'candidate', 'user', '650e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL);

-- Display summary of seeded data
SELECT 
    'Users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'Clients' as table_name, 
    COUNT(*) as record_count 
FROM clients
UNION ALL
SELECT 
    'Employment Records' as table_name, 
    COUNT(*) as record_count 
FROM employment_records
UNION ALL
SELECT 
    'Salary History' as table_name, 
    COUNT(*) as record_count 
FROM salary_history
UNION ALL
SELECT 
    'User Roles' as table_name, 
    COUNT(*) as record_count 
FROM user_roles
UNION ALL
SELECT 
    'Audit Log' as table_name, 
    COUNT(*) as record_count 
FROM audit_log
UNION ALL
SELECT 
    'Migration Log' as table_name, 
    COUNT(*) as record_count 
FROM migration_log
ORDER BY table_name;

-- Display test user credentials for easy reference
SELECT 
    'Test User Credentials' as info,
    email,
    first_name || ' ' || last_name as full_name,
    CASE 
        WHEN email LIKE '%admin%' THEN 'Admin User (Password: Admin123!)'
        WHEN email LIKE '%hr%' THEN 'HR Manager (Password: HR123!)'
        WHEN email LIKE '%client%' THEN 'Client User (Password: Client123!)'
        WHEN email LIKE '%john%' OR email LIKE '%jane%' OR email LIKE '%mike%' OR email LIKE '%sarah%' OR email LIKE '%david%' THEN 'EOR User (Password: EOR123!)'
        WHEN email LIKE '%alex%' OR email LIKE '%emma%' THEN 'Candidate (Password: Candidate123!)'
        ELSE 'Other User'
    END as user_type
FROM users 
WHERE email IN (
    'admin@teamified.com',
    'hr@teamified.com',
    'john.doe@example.com',
    'jane.smith@example.com',
    'alex.garcia@example.com',
    'emma.davis@example.com',
    'client@acme.com',
    'client@techstart.com'
)
ORDER BY user_type, email;
