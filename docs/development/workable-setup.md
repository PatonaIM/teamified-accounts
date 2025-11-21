# Workable Integration Setup Guide

This guide will help you set up the Workable ATS integration for Story 8.1.

## Prerequisites

1. A Workable account with API access
2. Workable SPI v3 API token with the following scopes:
   - `r_jobs` - Read job postings
   - `w_candidates` - Write candidate applications

## Environment Configuration

Add the following environment variables to your `.env` and `.env.dev` files:

### Production (`.env`)
```bash
# Workable API Configuration
WORKABLE_SUBDOMAIN=yourcompany
WORKABLE_API_TOKEN=your_spi_v3_token_here
```

### Development (`.env.dev`)
```bash
# Workable API Configuration
WORKABLE_SUBDOMAIN=yourcompany
WORKABLE_API_TOKEN=your_spi_v3_token_here
```

### How to Get Your Workable Credentials

1. **Subdomain**: This is your Workable account subdomain
   - If your Workable URL is `https://mycompany.workable.com`, your subdomain is `mycompany`

2. **API Token**: 
   - Log in to your Workable account
   - Go to Settings → Integrations → API Access Tokens
   - Create a new token with `r_jobs` and `w_candidates` scopes
   - Copy the token and add it to your `.env` file

## Deployment

This application uses Docker containers for deployment. After adding Workable credentials to your environment files:

### Development Deployment
```bash
# Deploy development environment with hot-reloading
./deploy-dev.sh

# Or rebuild if you've made structural changes
./deploy-dev.sh build
./deploy-dev.sh start
```

### Production Deployment
```bash
# Deploy production environment
./deploy.sh

# Or specific commands
./deploy.sh build
./deploy.sh start
```

### Check Service Status
```bash
# Development
./deploy-dev.sh status
./deploy-dev.sh logs backend

# Production  
./deploy.sh status
./deploy.sh logs backend
```

## Testing Without Real Workable Account

If you don't have a Workable account yet, you can:

1. **Use Mock Data**: Create a mock service that returns sample job data
2. **Request Demo Account**: Contact Workable for a demo/trial account
3. **Test with Postman**: Use Workable's API documentation to test endpoints

## API Endpoints

Once configured, the following endpoints will be available:

- `GET /api/v1/workable/jobs` - List all published jobs
- `GET /api/v1/workable/jobs/:shortcode` - Get job details
- `GET /api/v1/workable/jobs/:shortcode/form` - Get application form
- `POST /api/v1/workable/jobs/:shortcode/apply` - Submit application

## Frontend Routes

- `/jobs` - Job board with all listings (Public)
- `/jobs/:shortcode` - Job detail page (Public)
- `/jobs/:shortcode/apply` - Application form (Public)

### Access URLs

**Development:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

**Production:**
- Frontend: http://localhost
- Backend API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

## Troubleshooting

### "Workable API configuration is missing"
- Ensure `WORKABLE_SUBDOMAIN` and `WORKABLE_API_TOKEN` are set in `.env` and `.env.dev`
- Rebuild and restart Docker containers:
  ```bash
  ./deploy-dev.sh build
  ./deploy-dev.sh start
  ```

### "Failed to communicate with Workable API"
- Verify your API token is valid
- Check that your token has the required scopes (`r_jobs`, `w_candidates`)
- Ensure your Workable subdomain is correct

### CORS Issues
- All API calls go through the NestJS backend, so CORS should not be an issue
- If you see CORS errors, ensure you're calling the backend API, not Workable directly

## Next Steps

After setting up Workable integration:

1. Test the job listings page at `/jobs`
2. Click on a job to view details
3. Try submitting a test application
4. Verify applications appear in your Workable dashboard

## Related Stories

- **Story 8.1**: Workable Job Board Integration (Current)
- **Story 8.2**: Candidate Job Discovery Interface
- **Story 8.3**: Application Submission Workflow (includes CV integration)

