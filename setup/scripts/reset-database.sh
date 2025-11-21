#!/bin/bash
set -e

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

# Function to reset database
reset_database() {
    print_status "Resetting database with latest schema..."
    
    # Check if containers are running
    if ! docker ps | grep -q teamified_postgres_dev; then
        print_error "PostgreSQL container is not running. Please start the development environment first."
        exit 1
    fi
    
    # Stop backend to avoid connection issues
    print_status "Stopping backend service..."
    docker-compose -f docker-compose.dev.yml stop backend || true
    
    # Drop and recreate database
    print_status "Dropping and recreating database..."
    docker exec teamified_postgres_dev psql -U postgres -c "DROP DATABASE IF EXISTS teamified_portal;"
    docker exec teamified_postgres_dev psql -U postgres -c "CREATE DATABASE teamified_portal;"
    
    # Initialize database with latest schema
    print_status "Initializing database with latest schema..."
    docker exec -i teamified_postgres_dev psql -U postgres -d teamified_portal < init-db.sql
    
    # Seed database with enhanced test data
    if [ -f "./scripts/seed-database-enhanced.js" ]; then
        print_status "Seeding database with enhanced test data..."
        
        # Set environment variables for the seeding script
        export DB_HOST=localhost
        export DB_PORT=5432
        export DB_NAME=teamified_portal
        export DB_USER=postgres
        export DB_PASSWORD=password
        
        # Run the enhanced seeding script
        if node ./scripts/seed-database-enhanced.js; then
            print_success "Database seeded with comprehensive test data"
        else
            print_warning "Enhanced seeding failed, falling back to basic data..."
            
            # Fallback to basic seeding
            docker exec teamified_postgres_dev psql -U postgres -d teamified_portal -c "
            INSERT INTO users (id, email, password_hash, first_name, last_name, status, is_active, email_verified, created_at, updated_at) VALUES
            ('650e8400-e29b-41d4-a716-446655440001', 'user1@teamified.com', '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', 'Admin', 'User', 'active', true, true, NOW(), NOW()),
            ('650e8400-e29b-41d4-a716-446655440002', 'hr@teamified.com', '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', 'HR', 'Manager', 'active', true, true, NOW(), NOW()),
            ('650e8400-e29b-41d4-a716-446655440003', 'john.doe@example.com', '\$argon2id\$v=19\$m=65536,t=3,p=4\$hash', 'John', 'Doe', 'active', true, true, NOW(), NOW())
            ON CONFLICT (email) DO NOTHING;
            
            INSERT INTO clients (id, name, description, contact_info, status, is_active, created_at, updated_at) VALUES
            ('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Inc', 'Leading technology company', '{\"email\": \"contact@techcorp.com\", \"phone\": \"+1-555-0123\"}', 'active', true, NOW(), NOW()),
            ('550e8400-e29b-41d4-a716-446655440002', 'InnovateLabs', 'Innovation and research lab', '{\"email\": \"info@innovatelabs.com\", \"phone\": \"+1-555-0456\"}', 'active', true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            " || print_warning "Failed to seed database with basic data"
        fi
    else
        print_warning "Enhanced seeding script not found, skipping database seeding"
    fi
    
    print_success "Database reset complete"
    
    # Restart backend service
    print_status "Restarting backend service..."
    docker-compose -f docker-compose.dev.yml up -d backend
    
    # Wait for backend to be ready
    print_status "Waiting for backend to restart..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            print_success "Backend restarted successfully"
            break
        fi
        sleep 3
        timeout=$((timeout - 3))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Backend restart health check failed"
    fi
    
    echo ""
    echo "🎉 Database reset complete!"
    echo "📚 API Docs: http://localhost:3000/api/docs"
    echo "🔐 Test Admin: user1@teamified.com / Admin123!"
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    reset_database "$@"
fi
