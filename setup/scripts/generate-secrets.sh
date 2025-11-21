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

# Function to generate secure random string
generate_secret() {
    local length=${1:-32}
    
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 $length
    elif command -v head >/dev/null 2>&1 && [ -r /dev/urandom ]; then
        head -c $length /dev/urandom | base64 | tr -d '\n'
    else
        # Fallback to date-based generation
        echo "secret-$(date +%s)-$(shuf -i 1000-9999 -n 1)"
    fi
}

# Function to generate production secrets
generate_production_secrets() {
    print_status "Generating production secrets..."
    
    # Generate JWT secrets
    JWT_SECRET=$(generate_secret 64)
    JWT_REFRESH_SECRET=$(generate_secret 64)
    
    # Generate database password
    DB_PASSWORD=$(generate_secret 32)
    
    # Generate Redis password
    REDIS_PASSWORD=$(generate_secret 32)
    
    echo ""
    echo "🔐 Generated Production Secrets:"
    echo "================================"
    echo ""
    echo "JWT_SECRET=$JWT_SECRET"
    echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
    echo "DATABASE_PASSWORD=$DB_PASSWORD"
    echo "REDIS_PASSWORD=$REDIS_PASSWORD"
    echo ""
    print_warning "⚠️  Store these securely and update your production .env file"
    print_warning "⚠️  Never commit these secrets to version control"
    echo ""
}

# Function to generate development secrets
generate_development_secrets() {
    print_status "Generating development secrets..."
    
    # Generate JWT secrets
    JWT_SECRET=$(generate_secret 32)
    JWT_REFRESH_SECRET=$(generate_secret 32)
    
    # Generate database password
    DB_PASSWORD=$(generate_secret 16)
    
    # Generate Redis password
    REDIS_PASSWORD=$(generate_secret 16)
    
    # Create .env file
    if [ -f .env ]; then
        print_warning ".env file already exists. Creating backup..."
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    cat > .env << EOF
# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=$DB_PASSWORD
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
    
    print_success "Generated .env file with development secrets"
    print_warning "⚠️  Never commit .env files to version control"
    echo ""
}

# Function to validate secrets
validate_secrets() {
    print_status "Validating generated secrets..."
    
    if [ -f .env ]; then
        # Check if required variables are present
        required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "DATABASE_PASSWORD" "REDIS_PASSWORD")
        
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" .env; then
                print_error "Missing required variable: $var"
                exit 1
            fi
        done
        
        print_success "All required secrets are present in .env file"
    else
        print_error ".env file not found"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --production    Generate production secrets (display only)"
    echo "  -d, --development   Generate development secrets (create .env file)"
    echo "  -v, --validate      Validate existing .env file"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --development    # Generate .env file for development"
    echo "  $0 --production     # Generate production secrets (display only)"
    echo "  $0 --validate       # Validate existing .env file"
    echo ""
}

# Main execution
main() {
    case "${1:-}" in
        -p|--production)
            generate_production_secrets
            ;;
        -d|--development)
            generate_development_secrets
            validate_secrets
            ;;
        -v|--validate)
            validate_secrets
            ;;
        -h|--help)
            show_usage
            ;;
        "")
            # Default to development
            generate_development_secrets
            validate_secrets
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

