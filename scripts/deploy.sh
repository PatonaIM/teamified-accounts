#!/bin/bash

# Teamified Portal Deployment Script
# This script provides a consistent way to deploy the frontend and backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="teamified-portal"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

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

# Function to create .env file if it doesn't exist
create_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "No .env file found. Creating one with default values..."
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
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Application Configuration
PORT=3000
FRONTEND_URL=http://localhost
NODE_ENV=production

# Email Configuration (configure as needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF
        print_success "Created .env file with default values"
        print_warning "Please review and update the .env file with your actual configuration"
    fi
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend
    print_status "Building backend image..."
    docker build -f Dockerfile.backend -t teamified-backend:latest .
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -f frontend/Dockerfile -t teamified-frontend:latest ./frontend
    
    print_success "All images built successfully"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Stop any existing containers
    docker-compose down --remove-orphans 2>/dev/null || docker compose down --remove-orphans 2>/dev/null
    
    # Start services
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    print_success "Services started successfully"
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Checking service health (attempt $attempt/$max_attempts)..."
        
        # Check if all services are healthy
        if docker-compose ps | grep -q "unhealthy" || docker compose ps | grep -q "unhealthy"; then
            print_warning "Some services are still starting up..."
            sleep 10
            attempt=$((attempt + 1))
        else
            print_success "All services are healthy!"
            return 0
        fi
    done
    
    print_error "Services failed to become healthy within the expected time"
    return 1
}

# Function to show service status
show_status() {
    print_status "Service status:"
    if command -v docker-compose &> /dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
    
    echo ""
    print_status "Service URLs:"
    echo "Frontend: http://localhost"
    echo "Backend API: http://localhost:3000"
    echo "API Docs: http://localhost:3000/api/docs"
    echo "Database: localhost:5432"
    echo "Redis: localhost:6379"
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_status "Showing logs for all services (Ctrl+C to exit)..."
        if command -v docker-compose &> /dev/null; then
            docker-compose logs -f
        else
            docker compose logs -f
        fi
    else
        print_status "Showing logs for $service service (Ctrl+C to exit)..."
        if command -v docker-compose &> /dev/null; then
            docker-compose logs -f "$service"
        else
            docker compose logs -f "$service"
        fi
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        docker compose down
    fi
    print_success "Services stopped successfully"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    stop_services
    start_services
    wait_for_services
}

# Function to clean up everything
cleanup() {
    print_status "Cleaning up everything..."
    
    # Stop and remove containers
    if command -v docker-compose &> /dev/null; then
        docker-compose down -v --remove-orphans
    else
        docker compose down -v --remove-orphans
    fi
    
    # Remove images
    docker rmi teamified-backend:latest teamified-frontend:latest 2>/dev/null || true
    
    # Remove volumes
    docker volume rm teamified-team-member-portal_postgres_data teamified-team-member-portal_redis_data 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build Docker images"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs        Show logs for all services"
    echo "  logs [SVC]  Show logs for specific service (backend, frontend, postgres, redis)"
    echo "  cleanup     Stop services and remove all containers, images, and volumes"
    echo "  deploy      Build images and start services (default)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy everything (build + start)"
    echo "  $0 start             # Start services only"
    echo "  $0 logs backend      # Show backend logs"
    echo "  $0 cleanup           # Clean up everything"
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
            print_success "Deployment completed successfully!"
            print_status "You can now access the application at http://localhost"
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
