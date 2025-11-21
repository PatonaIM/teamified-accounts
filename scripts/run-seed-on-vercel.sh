#!/bin/bash

# Script to run database seeding on Vercel backend
# This script calls the seed API endpoint on your deployed Vercel backend

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

# Default backend URL (update this with your actual Vercel backend URL)
BACKEND_URL="https://teamified-team-member-portal-backend-b5vxw24fp.vercel.app"

# Parse command line arguments
CLEAR_DB=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      BACKEND_URL="$2"
      shift 2
      ;;
    --clear)
      CLEAR_DB=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --url URL     Backend URL (default: $BACKEND_URL)"
      echo "  --clear       Clear database before seeding"
      echo "  --help        Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                                    # Seed database"
      echo "  $0 --clear                           # Clear and seed database"
      echo "  $0 --url https://your-backend.vercel.app  # Use custom backend URL"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

print_status "Running database seeding on Vercel backend..."
print_status "Backend URL: $BACKEND_URL"

# Test backend connectivity
print_status "Testing backend connectivity..."
if ! curl -f -s "$BACKEND_URL/api/health" > /dev/null; then
    print_error "Backend is not accessible at $BACKEND_URL"
    print_error "Please check:"
    print_error "1. Backend is deployed and running"
    print_error "2. Database and environment variables are configured"
    print_error "3. URL is correct"
    exit 1
fi

print_success "Backend is accessible"

# Clear database if requested
if [ "$CLEAR_DB" = true ]; then
    print_status "Clearing database..."
    if curl -X POST "$BACKEND_URL/api/v1/seed/clear" -H "Content-Type: application/json"; then
        print_success "Database cleared successfully"
    else
        print_error "Failed to clear database"
        exit 1
    fi
fi

# Run database seeding
print_status "Starting database seeding..."
print_status "This may take several minutes due to the large amount of test data..."

if curl -X POST "$BACKEND_URL/api/v1/seed/database" -H "Content-Type: application/json"; then
    print_success "Database seeded successfully!"
    echo ""
    print_status "You can now test your application with the seeded data."
    print_status "Check the backend logs for detailed seeding information."
else
    print_error "Failed to seed database"
    print_error "Check the backend logs for error details"
    exit 1
fi

echo ""
print_success "🎉 Database seeding completed!"
echo ""
echo "Next steps:"
echo "1. Test your API endpoints with the seeded data"
echo "2. Check the database in Vercel dashboard"
echo "3. Verify all test data was created successfully"
