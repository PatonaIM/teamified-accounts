#!/bin/bash

# Teamified Portal Development Deployment Script
# This script provides a consistent way to deploy the frontend and backend in development mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="teamified-portal-dev"
COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env.dev"

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to create .env.dev file if it doesn't exist
create_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "No .env.dev file found. Creating one with development values..."
        cat > "$ENV_FILE" << EOF
# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=teamified_portal

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key

# Application Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email Configuration (configure as needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF
        print_success "Created .env.dev file with development values"
        print_warning "Please review and update the .env.dev file with your actual configuration"
    fi
}

# Function to build development images
build_images() {
    print_status "Building development Docker images..."
    
    # Build backend development image
    print_status "Building backend development image..."
    docker build -f Dockerfile.backend.dev -t teamified-backend:dev .
    
    # Build frontend development image
    print_status "Building frontend development image..."
    docker build -f frontend/Dockerfile.dev -t teamified-frontend:dev ./frontend
    
    print_success "All development images built successfully"
}

# Function to start development services
start_services() {
    print_status "Starting development services..."
    
    # Stop any existing development containers
    docker-compose -f $COMPOSE_FILE down --remove-orphans 2>/dev/null || docker compose -f $COMPOSE_FILE down --remove-orphans 2>/dev/null
    
    # Start services
    if command -v docker-compose &> /dev/null; then
        docker-compose -f $COMPOSE_FILE up -d
    else
        docker compose -f $COMPOSE_FILE up -d
    fi
    
    print_success "Development services started successfully"
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status "Waiting for development services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Checking service health (attempt $attempt/$max_attempts)..."
        
        # Check if all services are healthy
        if docker-compose -f $COMPOSE_FILE ps | grep -q "unhealthy" || docker compose -f $COMPOSE_FILE ps | grep -q "unhealthy"; then
            print_warning "Some services are still starting up..."
            sleep 10
            attempt=$((attempt + 1))
        else
            print_success "All development services are healthy!"
            return 0
        fi
    done
    
    print_error "Services failed to become healthy within the expected time"
    return 1
}

# Function to show service status
show_status() {
    print_status "Development service status:"
    if command -v docker-compose &> /dev/null; then
        docker-compose -f $COMPOSE_FILE ps
    else
        docker compose -f $COMPOSE_FILE ps
    fi
    
    echo ""
    print_status "Development Service URLs:"
    echo "Frontend: http://localhost:5173"
    echo "Backend API: http://localhost:3000"
    echo "API Docs: http://localhost:3000/api/docs"
    echo "Database: localhost:5432"
    echo "Redis: localhost:6379"
    echo ""
    print_status "Development Features:"
    echo "✅ Hot reloading enabled for both frontend and backend"
    echo "✅ Source code mounted for live editing"
    echo "✅ Development environment variables"
    echo "✅ Separate development containers and volumes"
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_status "Showing logs for all development services (Ctrl+C to exit)..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f $COMPOSE_FILE logs -f
        else
            docker compose -f $COMPOSE_FILE logs -f
        fi
    else
        print_status "Showing logs for $service development service (Ctrl+C to exit)..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f $COMPOSE_FILE logs -f "$service"
        else
            docker compose -f $COMPOSE_FILE logs -f "$service"
        fi
    fi
}

# Function to stop development services
stop_services() {
    print_status "Stopping development services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose -f $COMPOSE_FILE down
    else
        docker compose -f $COMPOSE_FILE down
    fi
    print_success "Development services stopped successfully"
}

# Function to restart development services
restart_services() {
    print_status "Restarting development services..."
    stop_services
    start_services
    wait_for_services
}

# Function to clean up development environment
cleanup() {
    print_status "Cleaning up development environment..."
    
    # Stop and remove containers
    if command -v docker-compose &> /dev/null; then
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
    else
        docker compose -f $COMPOSE_FILE down -v --remove-orphans
    fi
    
    # Remove development images
    docker rmi teamified-backend:dev teamified-frontend:dev 2>/dev/null || true
    
    # Remove development volumes
    docker volume rm teamified-team-member-portal_postgres_data_dev teamified-team-member-portal_redis_data_dev 2>/dev/null || true
    
    print_success "Development cleanup completed"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build development Docker images"
    echo "  start       Start all development services"
    echo "  stop        Stop all development services"
    echo "  restart     Restart all development services"
    echo "  status      Show development service status"
    echo "  logs        Show logs for all development services"
    echo "  logs [SVC]  Show logs for specific service (backend, frontend, postgres, redis)"
    echo "  cleanup     Stop services and remove all development containers, images, and volumes"
    echo "  deploy      Build images and start development services (default)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy development environment (build + start)"
    echo "  $0 start             # Start development services only"
    echo "  $0 logs backend      # Show backend development logs"
    echo "  $0 cleanup           # Clean up development environment"
    echo ""
    echo "Development Features:"
    echo "  - Hot reloading for both frontend and backend"
    echo "  - Source code mounted for live editing"
    echo "  - Separate development containers and volumes"
    echo "  - Development-specific environment variables"
}

# Main script logic
main() {
    local command=${1:-"deploy"}
    
    case $command in
        "build")
            check_docker
            check_docker_compose
            create_env_file
            build_images
            ;;
        "start")
            check_docker
            check_docker_compose
            create_env_file
            start_services
            wait_for_services
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "deploy")
            check_docker
            check_docker_compose
            create_env_file
            build_images
            start_services
            wait_for_services
            show_status
            print_success "Development deployment completed successfully!"
            print_status "You can now access the development application at http://localhost:5173"
            print_status "Backend API is available at http://localhost:3000"
            print_status "Hot reloading is enabled - edit your code and see changes immediately!"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
