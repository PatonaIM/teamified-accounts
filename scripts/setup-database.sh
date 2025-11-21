#!/bin/bash

# Database Setup Script for Teamified Portal
# This script adds additional test data beyond what's in init-db-complete.sql
# The init-db-complete.sql handles all table creation, constraints, and basic data

set -e

echo "🚀 Setting up additional test data for Teamified Portal..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if containers are running
if ! docker-compose ps | grep -q "teamified_postgres.*Up"; then
    print_warning "PostgreSQL container is not running. Starting containers..."
    docker-compose up -d postgres
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
fi

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U postgres -d teamified_portal > /dev/null 2>&1; do
    print_status "PostgreSQL is not ready yet. Waiting..."
    sleep 2
done

print_success "PostgreSQL is ready!"

# Function to run SQL commands
run_sql() {
    docker-compose exec postgres psql -U postgres -d teamified_portal -c "$1"
}

# Check if we should clear existing data
if [ "$1" = "--reset" ]; then
    print_warning "Resetting database (clearing all data)..."
    run_sql "TRUNCATE TABLE user_roles, employment_records, salary_history, users, clients RESTART IDENTITY CASCADE;"
    print_success "Database cleared!"
fi

# Step 1: Add additional test clients (beyond the 2 in init-db-complete.sql)
print_status "Adding additional test clients..."
run_sql "
INSERT INTO clients (id, name, description, contact_info, status) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Global Solutions Ltd', 
 'Global consulting and solutions provider',
 '{\"email\": \"admin@globalsolutions.com\", \"phone\": \"+1-555-0103\", \"address\": {\"street\": \"789 Corporate Dr\", \"city\": \"Chicago\", \"state\": \"IL\", \"zip\": \"60601\"}}', 
 'active')
ON CONFLICT (id) DO NOTHING;
"

# Step 2: Add additional test users (beyond the 1 admin in init-db-complete.sql)
print_status "Adding additional test users..."
run_sql "INSERT INTO users (id, email, password_hash, first_name, last_name, phone, address, profile_data, status, is_active, email_verified) VALUES ('650e8400-e29b-41d4-a716-446655440002', 'hr@teamified.com', '\$argon2id\$v=19\$m=65536,t=3,p=1\$3RHN3pRbXqlkSS4BcQUMSQ\$sEvjl2yJV+Tj0cmuGUxkBJNyoyXJJFEjFEuQhJ4kWD0', 'HR', 'Manager', '555-1002', '{\"street\": \"200 HR Ave\", \"city\": \"New York\", \"state\": \"NY\", \"zip\": \"10001\"}', '{\"department\": \"Human Resources\", \"title\": \"HR Manager\", \"skills\": [\"Recruitment\", \"Employee Relations\"]}', 'active', true, true), ('650e8400-e29b-41d4-a716-446655440003', 'john.doe@example.com', '\$argon2id\$v=19\$m=65536,t=3,p=1\$ZwSk299ILzDTvV1kOQLpfQ\$WGV6Gd5GqAg/KoV5U+8QHyKZZMXiZxNtNdd3BAizgJU', 'John', 'Doe', '555-2001', '{\"street\": \"300 Main St\", \"city\": \"New York\", \"state\": \"NY\", \"zip\": \"10001\"}', '{\"department\": \"Engineering\", \"title\": \"Senior Software Engineer\", \"skills\": [\"JavaScript\", \"React\", \"Node.js\"], \"experience_years\": 5}', 'active', true, true), ('650e8400-e29b-41d4-a716-446655440004', 'jane.smith@example.com', '\$argon2id\$v=19\$m=65536,t=3,p=1\$ZwSk299ILzDTvV1kOQLpfQ\$WGV6Gd5GqAg/KoV5U+8QHyKZZMXiZxNtNdd3BAizgJU', 'Jane', 'Smith', '555-2002', '{\"street\": \"400 Oak Ave\", \"city\": \"San Francisco\", \"state\": \"CA\", \"zip\": \"94105\"}', '{\"department\": \"Design\", \"title\": \"UX Designer\", \"skills\": [\"Figma\", \"User Research\", \"Prototyping\"], \"experience_years\": 3}', 'active', true, true) ON CONFLICT (id) DO NOTHING;"

# Step 3: Add additional user roles (beyond the 1 admin role in init-db-complete.sql)
print_status "Adding additional user roles..."
run_sql "INSERT INTO user_roles (id, user_id, role_type, scope, scope_entity_id, granted_by, created_at, expires_at) VALUES ('950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'admin', 'all', NULL, '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL), ('950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'eor', 'client', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL), ('950e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'eor', 'client', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', NOW(), NULL) ON CONFLICT (id) DO NOTHING;"

# Step 4: Add employment records for the additional users
print_status "Adding employment records..."
run_sql "INSERT INTO employment_records (id, user_id, client_id, start_date, end_date, role, status, created_at, updated_at) VALUES ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', NULL, 'Senior Software Engineer', 'active', NOW(), NOW()), ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2024-02-01', NULL, 'UX Designer', 'active', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"

# Step 5: Add sample salary history for employment records
print_status "Adding sample salary history..."
run_sql "
INSERT INTO salary_history (id, employment_record_id, salary_amount, salary_currency, effective_date, change_reason, changed_by, created_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 95000.00, 'USD', '2024-01-15', 'Starting salary', '650e8400-e29b-41d4-a716-446655440002', NOW()),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 105000.00, 'USD', '2024-07-15', 'Annual performance review', '650e8400-e29b-41d4-a716-446655440002', NOW()),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 75000.00, 'USD', '2024-02-01', 'Starting salary', '650e8400-e29b-41d4-a716-446655440002', NOW()),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 82000.00, 'USD', '2024-08-01', 'Promotion', '650e8400-e29b-41d4-a716-446655440002', NOW())
ON CONFLICT (id) DO NOTHING;
"

print_success "Additional test data added successfully!"

# Step 6: Display summary
print_status "Database setup complete! Here are all available test user credentials:"
echo ""
echo -e "${GREEN}Test User Credentials:${NC}"
echo "┌─────────────────────────┬─────────────────┬─────────────────┬─────────────────┐"
echo "│ Email                   │ Password        │ Role            │ Access Level    │"
echo "├─────────────────────────┼─────────────────┼─────────────────┼─────────────────┤"
echo "│ admin@teamified.com     │ Admin123!       │ admin           │ Full system     │"
echo "│ hr@teamified.com        │ HRManager123!   │ admin           │ Full system     │"
echo "│ john.doe@example.com    │ EORUser123!     │ eor             │ Client-specific │"
echo "│ jane.smith@example.com  │ EORUser123!     │ eor             │ Client-specific │"
echo "└─────────────────────────┴─────────────────┴─────────────────┴─────────────────┘"
echo ""
echo -e "${BLUE}Application URLs:${NC}"
echo "• Frontend: http://localhost:80"
echo "• Backend API: http://localhost:3000/api"
echo "• API Documentation: http://localhost:3000/api/docs"
echo ""
echo -e "${YELLOW}Usage:${NC}"
echo "• Normal setup: ./scripts/setup-database.sh"
echo "• Reset database: ./scripts/setup-database.sh --reset"
echo ""

print_success "Database setup completed successfully! 🎉"