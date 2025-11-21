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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is required but not installed."
        print_status "Please install Docker from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is required but not installed."
        print_status "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Check Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to generate secure secrets
generate_secrets() {
    print_status "Generating secure secrets..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file with secure secrets..."
        
        # Generate secure secrets
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-jwt-secret-$(date +%s)")
        JWT_REFRESH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-refresh-secret-$(date +%s)")
        DATABASE_PASSWORD=$(openssl rand -base64 16 2>/dev/null || echo "dev-db-password-$(date +%s)")
        REDIS_PASSWORD=$(openssl rand -base64 16 2>/dev/null || echo "dev-redis-password-$(date +%s)")
        
        cat > .env << EOF
# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=$DATABASE_PASSWORD
DATABASE_NAME=teamified_portal

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional for development)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
EOF
        
        print_success "Generated .env file with secure secrets"
    else
        print_warning ".env file already exists, skipping generation"
    fi
}

# Function to check for port conflicts
check_port_conflicts() {
    print_status "Checking for port conflicts..."
    
    # Check if ports are in use
    if lsof -i :5432 >/dev/null 2>&1; then
        print_warning "Port 5432 is in use. This might conflict with PostgreSQL."
        print_status "If you have a local PostgreSQL running, please stop it:"
        print_status "  brew services stop postgresql@15"
        print_status "  or"
        print_status "  sudo lsof -ti:5432 | xargs kill -9"
    fi
    
    if lsof -i :3000 >/dev/null 2>&1; then
        print_warning "Port 3000 is in use. This might conflict with the backend."
    fi
    
    if lsof -i :5173 >/dev/null 2>&1; then
        print_warning "Port 5173 is in use. This might conflict with the frontend."
    fi
    
    print_success "Port conflict check completed"
}

# Function to start Docker services
start_services() {
    print_status "Starting Docker services..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.dev.yml down >/dev/null 2>&1 || true
    
    # Start services
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Docker services started"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker exec teamified_postgres_dev pg_isready -U postgres -d teamified_portal >/dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "PostgreSQL failed to start within expected time"
        exit 1
    fi
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker exec teamified_redis_dev redis-cli ping >/dev/null 2>&1; then
            print_success "Redis is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Redis failed to start within expected time"
        exit 1
    fi
    
    # Wait for Backend
    print_status "Waiting for Backend..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            print_success "Backend is ready"
            break
        fi
        sleep 3
        timeout=$((timeout - 3))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Backend health check failed, but continuing..."
    fi
    
    # Wait for Frontend
    print_status "Waiting for Frontend..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:5173 >/dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Frontend health check failed, but continuing..."
    fi
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if database needs to be recreated
    print_status "Checking database schema..."
    
    # Check if employment_records table exists
    if ! docker exec teamified_postgres_dev psql -U postgres -d teamified_portal -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'employment_records';" | grep -q "1 row"; then
        print_warning "Database schema is outdated. Recreating database..."
        recreate_database
    else
        # Check if clients table has contact_info column
        if ! docker exec teamified_postgres_dev psql -U postgres -d teamified_portal -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_info';" | grep -q "contact_info"; then
            print_warning "Database schema is missing required columns. Recreating database..."
            recreate_database
        else
            print_success "Database schema is up to date"
        fi
    fi
    
    # Run any additional setup scripts
    if [ -f "./scripts/setup-database.sh" ]; then
        chmod +x ./scripts/setup-database.sh
        ./scripts/setup-database.sh
        print_success "Database setup complete"
    else
        print_status "No additional database setup script found"
    fi
}

# Function to recreate database with latest schema
recreate_database() {
    print_status "Recreating database with latest schema..."
    
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
    
    print_success "Database recreated with latest schema"
    
    # Restart backend service
    print_status "Restarting backend service..."
    docker-compose -f docker-compose.dev.yml up -d backend
    
    # Wait for backend to be ready again
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
        print_warning "Backend restart health check failed, but continuing..."
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    if docker-compose -f docker-compose.dev.yml exec -T backend npm test >/dev/null 2>&1; then
        print_success "Backend tests passed"
    else
        print_warning "Backend tests failed, but continuing..."
    fi
    
    # Run frontend tests
    if docker-compose -f docker-compose.dev.yml exec -T frontend npm test -- --run >/dev/null 2>&1; then
        print_success "Frontend tests passed"
    else
        print_warning "Frontend tests failed, but continuing..."
    fi
}

# Function to display final information
display_final_info() {
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend:    http://localhost:5173"
    echo "   Backend API: http://localhost:3000/api"
    echo "   API Docs:    http://localhost:3000/api/docs"
    echo "   Health:      http://localhost:3000/api/health"
    echo ""
    echo "🔐 Test Credentials:"
    echo "   Admin:       user1@teamified.com / Admin123!"
    echo "   HR Manager:  hr@teamified.com / HR123!"
    echo "   EOR User:    john.doe@example.com / EOR123!"
    echo ""
    echo "🛠️  Useful Commands:"
    echo "   View logs:   docker-compose -f docker-compose.dev.yml logs -f"
    echo "   Stop:        docker-compose -f docker-compose.dev.yml down"
    echo "   Restart:     docker-compose -f docker-compose.dev.yml restart"
    echo "   Reset DB:    ./scripts/setup-database.sh --reset"
    echo ""
    echo "📚 Documentation:"
    echo "   Setup Guide: ./setup/docs/SETUP_AND_MAINTENANCE.md"
    echo "   Dev Context: ./setup/context/DEVELOPMENT_CONTEXT.md"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Setup failed. Cleaning up..."
        docker-compose -f docker-compose.dev.yml down >/dev/null 2>&1 || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    echo "🚀 Setting up Teamified EOR Portal Development Environment"
    echo "=========================================================="
    echo ""
    
    check_prerequisites
    generate_secrets
    check_port_conflicts
    start_services
    wait_for_services
    setup_database
    run_tests
    display_final_info
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

