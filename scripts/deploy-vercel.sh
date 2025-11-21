#!/bin/bash

# Vercel Deployment Script for Teamified Portal
# This script can deploy frontend, backend, or both to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default deployment options
DEPLOY_FRONTEND=false
DEPLOY_BACKEND=false
DEPLOY_BOTH=false
TEAM_SCOPE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --frontend)
      DEPLOY_FRONTEND=true
      shift
      ;;
    --backend)
      DEPLOY_BACKEND=true
      shift
      ;;
    --both)
      DEPLOY_BOTH=true
      shift
      ;;
    --team)
      TEAM_SCOPE="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --frontend    Deploy only the frontend"
      echo "  --backend     Deploy only the backend"
      echo "  --both        Deploy both frontend and backend"
      echo "  --team TEAM   Deploy to specific team (e.g., simon-4115s-projects)"
      echo "  --help        Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 --frontend    # Deploy only frontend"
      echo "  $0 --backend     # Deploy only backend"
      echo "  $0 --both        # Deploy both"
      echo "  $0 --backend --team simon-4115s-projects  # Deploy backend to team"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# If no options specified, ask user what to deploy
if [ "$DEPLOY_FRONTEND" = false ] && [ "$DEPLOY_BACKEND" = false ] && [ "$DEPLOY_BOTH" = false ]; then
    echo "🎯 Teamified Vercel Deployment"
    echo "================================"
    echo ""
    echo "What would you like to deploy?"
    echo "1) Frontend only"
    echo "2) Backend only" 
    echo "3) Both frontend and backend"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            DEPLOY_FRONTEND=true
            ;;
        2)
            DEPLOY_BACKEND=true
            ;;
        3)
            DEPLOY_BOTH=true
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
fi

# Set deployment flags based on choices
if [ "$DEPLOY_BOTH" = true ]; then
    DEPLOY_FRONTEND=true
    DEPLOY_BACKEND=true
fi

echo "🚀 Starting Vercel Deployment..."
if [ "$DEPLOY_FRONTEND" = true ] && [ "$DEPLOY_BACKEND" = true ]; then
    echo "📦 Deploying: Frontend + Backend"
elif [ "$DEPLOY_FRONTEND" = true ]; then
    echo "🎨 Deploying: Frontend only"
elif [ "$DEPLOY_BACKEND" = true ]; then
    echo "⚙️ Deploying: Backend only"
fi

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

# Check if Vercel CLI is installed
check_vercel_cli() {
    print_status "Checking Vercel CLI installation..."
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Installing now..."
        npm install -g vercel
    else
        print_success "Vercel CLI is installed"
    fi
}

# Check if user is logged in to Vercel
check_vercel_auth() {
    print_status "Checking Vercel authentication..."
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Please log in:"
        vercel login
    else
        print_success "Authenticated with Vercel"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Build the project
build_project() {
    print_status "Building project..."
    npm run build
    print_success "Project built successfully"
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Change to frontend directory
    cd frontend
    
    # Check if this is a new project or existing
    if [ ! -f ".vercel/project.json" ]; then
        print_status "First time frontend deployment - linking project..."
        if [ -n "$TEAM_SCOPE" ]; then
            vercel --yes --name "teamified_team_member_portal_frontend" --scope "$TEAM_SCOPE"
        else
            vercel --yes --name "teamified_team_member_portal_frontend"
        fi
    else
        print_status "Deploying to existing frontend project..."
        if [ -n "$TEAM_SCOPE" ]; then
            vercel --prod --scope "$TEAM_SCOPE"
        else
            vercel --prod
        fi
    fi
    
    # Return to root directory
    cd ..
    
    print_success "Frontend deployment completed"
}

# Deploy backend to Vercel
deploy_backend() {
    print_status "Deploying backend to Vercel..."
    
    # Use backend-specific configuration
    cp vercel-backend.json vercel.json
    
    # Check if this is a new project or existing
    if [ ! -f ".vercel/project.json" ]; then
        print_status "First time backend deployment - linking project..."
        if [ -n "$TEAM_SCOPE" ]; then
            vercel --yes --name "teamified_team_member_portal_backend" --scope "$TEAM_SCOPE"
        else
            vercel --yes --name "teamified_team_member_portal_backend"
        fi
    else
        print_status "Deploying to existing backend project..."
        if [ -n "$TEAM_SCOPE" ]; then
            vercel --prod --scope "$TEAM_SCOPE"
        else
            vercel --prod
        fi
    fi
    
    print_success "Backend deployment completed"
}

# Set up environment variables
setup_env_vars() {
    print_status "Setting up environment variables..."
    
    echo "Please set the following environment variables in your Vercel dashboard:"
    echo ""
    echo "Required Variables:"
    echo "==================="
    echo "POSTGRES_URL=postgresql://..."
    echo "POSTGRES_PRISMA_URL=postgresql://..."
    echo "POSTGRES_URL_NON_POOLING=postgresql://..."
    echo "KV_URL=redis://..."
    echo "KV_REST_API_TOKEN=..."
    echo "BLOB_READ_WRITE_TOKEN=..."
    echo "JWT_SECRET=your-super-secret-jwt-key"
    echo "JWT_REFRESH_SECRET=your-super-secret-refresh-key"
    echo "WORKABLE_SUBDOMAIN=yourcompany"
    echo "WORKABLE_API_TOKEN=your-workable-token"
    echo "FRONTEND_URL=https://your-frontend.vercel.app"
    echo ""
    echo "Optional Variables:"
    echo "==================="
    echo "SMTP_HOST=smtp.gmail.com"
    echo "SMTP_PORT=587"
    echo "SMTP_USER=your-email@gmail.com"
    echo "SMTP_PASS=your-app-password"
    echo ""
    
    read -p "Press Enter when you have set up the environment variables..."
}

# Set up database schema
setup_database() {
    print_status "Setting up database schema..."
    
    # Pull environment variables
    vercel env pull .env.production
    
    # Note: For Vercel Postgres, you'll need to run the SQL manually
    # or use a database management tool to execute init-db.sql
    print_warning "Database setup required:"
    echo "1. Go to Vercel Dashboard → Your Project → Storage → Postgres"
    echo "2. Open the database in a SQL editor"
    echo "3. Run the contents of init-db.sql to create tables and schema"
    echo "4. Optionally run setup-database.sh for test data"
    echo ""
    echo "Alternatively, you can use a tool like pgAdmin or DBeaver to connect"
    echo "to your Vercel Postgres database and run the SQL scripts."
    
    read -p "Press Enter when you have set up the database schema..."
    
    print_success "Database setup completed"
}

# Seed the database
seed_database() {
    print_status "Seeding database..."
    
    if [ -f "scripts/seed-database.js" ]; then
        node scripts/seed-database.js
        print_success "Database seeded"
    else
        print_warning "Seed script not found, skipping database seeding"
    fi
}

# Test the deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        print_error "Could not get deployment URL"
        return 1
    fi
    
    print_status "Testing health endpoint: $DEPLOYMENT_URL/api/health"
    
    # Test health endpoint
    if curl -f -s "$DEPLOYMENT_URL/api/health" > /dev/null; then
        print_success "Health endpoint is working"
    else
        print_error "Health endpoint is not responding"
        return 1
    fi
    
    print_success "Deployment test completed"
}

# Main deployment function
main() {
    # Check prerequisites
    check_vercel_cli
    check_vercel_auth
    
    # Deploy frontend if requested
    if [ "$DEPLOY_FRONTEND" = true ]; then
        echo ""
        echo "🎨 Frontend Deployment"
        echo "====================="
        install_dependencies
        deploy_frontend
        echo ""
        print_success "Frontend deployed successfully!"
        echo "Frontend URL: Check Vercel dashboard for your frontend URL"
    fi
    
    # Deploy backend if requested
    if [ "$DEPLOY_BACKEND" = true ]; then
        echo ""
        echo "⚙️ Backend Deployment"
        echo "===================="
        install_dependencies
        build_project
        deploy_backend
        
        # Post-deployment setup for backend
        setup_env_vars
        setup_database
        seed_database
        test_deployment
        
        echo ""
        print_success "Backend deployed successfully!"
        echo "Backend URL: Check Vercel dashboard for your backend URL"
    fi
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    if [ "$DEPLOY_BACKEND" = true ]; then
        echo "1. Set up your database in Vercel dashboard"
        echo "2. Configure environment variables for backend"
        echo "3. Test your API endpoints"
        echo "4. Update frontend to point to backend URL"
    fi
    if [ "$DEPLOY_FRONTEND" = true ]; then
        echo "1. Configure frontend environment variables"
        echo "2. Update API URLs to point to backend"
        echo "3. Test frontend functionality"
    fi
    echo ""
    echo "For detailed instructions, see: VERCEL_BACKEND_DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"
