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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to wait for a service
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        case $service in
            "postgres")
                if docker exec teamified_postgres_dev pg_isready -U postgres -d teamified_portal >/dev/null 2>&1; then
                    print_success "$service is ready"
                    return 0
                fi
                ;;
            "redis")
                if docker exec teamified_redis_dev redis-cli ping >/dev/null 2>&1; then
                    print_success "$service is ready"
                    return 0
                fi
                ;;
            "backend")
                if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
                    print_success "$service is ready"
                    return 0
                fi
                ;;
            "frontend")
                if curl -f http://localhost:5173 >/dev/null 2>&1; then
                    print_success "$service is ready"
                    return 0
                fi
                ;;
            *)
                # Generic check using docker-compose
                if docker-compose -f docker-compose.dev.yml ps $service | grep -q "Up"; then
                    print_success "$service is ready"
                    return 0
                fi
                ;;
        esac
        
        echo "⏳ Attempt $attempt/$max_attempts - $service not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_error "$service failed to start within expected time"
    return 1
}

# Function to check if services are running
check_services_running() {
    print_status "Checking if services are running..."
    
    if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        print_error "No services are running. Please start them first:"
        print_status "docker-compose -f docker-compose.dev.yml up -d"
        exit 1
    fi
}

# Main execution
main() {
    echo "⏳ Waiting for all services to be ready..."
    echo "=========================================="
    echo ""
    
    check_services_running
    
    # Wait for services in order
    wait_for_service postgres
    wait_for_service redis
    wait_for_service backend
    wait_for_service frontend
    
    echo ""
    print_success "All services are ready!"
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend:    http://localhost:5173"
    echo "   Backend API: http://localhost:3000/api"
    echo "   API Docs:    http://localhost:3000/api/docs"
    echo "   Health:      http://localhost:3000/api/health"
    echo ""
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

