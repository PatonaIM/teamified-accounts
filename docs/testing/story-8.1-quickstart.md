# Story 8.1 Quick Start Guide
## Workable Job Board Integration - Docker Deployment

**Status**: ✅ Implementation Complete  
**Branch**: `feature/story-8.1-workable-job-board-integration`

---

## 🚀 Quick Start (5 Minutes)

### 1. Environment Configuration ✅ (Already Done)

You've already added Workable credentials to your `.env` and `.env.dev` files:
```bash
WORKABLE_SUBDOMAIN=yourcompany
WORKABLE_API_TOKEN=your_spi_v3_token
```

### 2. Deploy with Docker

Since you've added the Workable module (new directory under `src/`), you need to rebuild:

#### Development Deployment (Recommended for Testing)
```bash
# Rebuild Docker image with new Workable module
./deploy-dev.sh build

# Start all services
./deploy-dev.sh start

# Check that services are running
./deploy-dev.sh status
```

#### OR Production Deployment
```bash
./deploy.sh build
./deploy.sh start
./deploy.sh status
```

### 3. Verify Backend is Running
```bash
# Check backend logs for Workable module
./deploy-dev.sh logs backend | grep -i workable

# You should see:
# - "WorkableModule dependencies initialized"
# - "WorkableController {/v1/workable}"
# - "Workable API Service initialized"
```

### 4. Test the Integration

#### Test Backend API
```bash
# Test job listings endpoint
curl http://localhost:3000/api/v1/workable/jobs

# Test specific job (replace SHORTCODE with actual job)
curl http://localhost:3000/api/v1/workable/jobs/SHORTCODE
```

#### Test Frontend
1. Open browser to:
   - **Development**: http://localhost:5173/jobs
   - **Production**: http://localhost/jobs

2. You should see:
   - ✅ Job listings page loads
   - ✅ Jobs from Workable displayed
   - ✅ Search bar functional
   - ✅ Load More button

3. Click on a job:
   - ✅ Job detail page loads
   - ✅ Complete job information displayed
   - ✅ Apply Now button visible

4. Click Apply Now:
   - ✅ Application form loads
   - ✅ Required fields shown (firstname, lastname, email, phone)
   - ✅ Dynamic questions from Workable
   - ✅ Submit application works

---

## 📋 Deployment Commands Reference

### Development Commands
```bash
./deploy-dev.sh build      # Rebuild Docker images (needed for new modules)
./deploy-dev.sh start      # Start all services
./deploy-dev.sh stop       # Stop all services
./deploy-dev.sh restart    # Restart all services
./deploy-dev.sh status     # Check service status
./deploy-dev.sh logs       # View all logs
./deploy-dev.sh logs backend    # View backend logs only
./deploy-dev.sh logs frontend   # View frontend logs only
./deploy-dev.sh cleanup    # Clean up everything
```

### Production Commands
```bash
./deploy.sh build          # Rebuild Docker images
./deploy.sh start          # Start all services
./deploy.sh stop           # Stop all services  
./deploy.sh restart        # Restart all services
./deploy.sh status         # Check service status
./deploy.sh logs           # View all logs
./deploy.sh logs backend   # View backend logs only
./deploy.sh cleanup        # Clean up everything
```

---

## 🔍 Troubleshooting

### Issue: "Workable API configuration is missing"

**Solution:**
```bash
# 1. Verify environment variables exist
cat .env.dev | grep WORKABLE

# 2. Rebuild Docker image (required to pick up new env vars)
./deploy-dev.sh build

# 3. Restart services
./deploy-dev.sh start

# 4. Check logs
./deploy-dev.sh logs backend
```

### Issue: Backend doesn't recognize Workable endpoints

**Cause**: New module not included in Docker image  
**Solution:**
```bash
# Full rebuild required for new modules
./deploy-dev.sh build
./deploy-dev.sh start

# Verify routes are registered
docker logs teamified_backend_dev --tail 100 | grep "WorkableController"
```

### Issue: Frontend can't reach backend API

**Check:**
```bash
# 1. Verify backend is running
./deploy-dev.sh status

# 2. Check backend health
curl http://localhost:3000/health

# 3. Test Workable endpoint directly
curl http://localhost:3000/api/v1/workable/jobs
```

### Issue: CORS errors in browser

**This shouldn't happen** - All API calls go through the NestJS backend, not directly to Workable.

If you see CORS errors:
1. Check that frontend is calling `http://localhost:3000/api/v1/workable/*`
2. Verify backend CORS settings allow `localhost:5173` (dev) or `localhost` (prod)

---

## 📊 Service URLs

### Development (After `./deploy-dev.sh start`)
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Job Board**: http://localhost:5173/jobs

### Production (After `./deploy.sh start`)
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Job Board**: http://localhost/jobs

---

## ✅ Success Indicators

When everything is working correctly, you should see:

### Backend Logs
```
[Nest] INFO [WorkableModule] - WorkableModule dependencies initialized
[Nest] INFO [RoutesResolver] - WorkableController {/v1/workable}
[Nest] INFO [RouterExplorer] - Mapped {/v1/workable/jobs, GET} route
[Nest] INFO [RouterExplorer] - Mapped {/v1/workable/jobs/:shortcode, GET} route
[Nest] INFO [RouterExplorer] - Mapped {/v1/workable/jobs/:shortcode/form, GET} route
[Nest] INFO [RouterExplorer] - Mapped {/v1/workable/jobs/:shortcode/apply, POST} route
[Nest] INFO [WorkableApiService] - Workable API Service initialized
```

### Frontend Browser Console
- No errors
- Successful API calls to `/api/v1/workable/jobs`
- Jobs data loaded and displayed

### Swagger Documentation
Visit http://localhost:3000/api/docs and verify:
- ✅ "Workable Integration" tag exists
- ✅ Four endpoints listed under it
- ✅ Can test endpoints directly from Swagger UI

---

## 🧪 Testing Workflow

1. **Deploy Development Environment**:
   ```bash
   ./deploy-dev.sh build
   ./deploy-dev.sh start
   ```

2. **Verify Backend**:
   ```bash
   # Check Workable module loaded
   ./deploy-dev.sh logs backend | grep -i workable
   
   # Test API endpoint
   curl http://localhost:3000/api/v1/workable/jobs
   ```

3. **Test Frontend**:
   - Open http://localhost:5173/jobs
   - Browse jobs
   - View job details
   - Test application form

4. **Monitor Logs** (in separate terminal):
   ```bash
   ./deploy-dev.sh logs -f
   ```

---

## 📝 Next Steps After Testing

Once you've verified everything works:

1. **Merge to Main**:
   ```bash
   git push origin feature/story-8.1-workable-job-board-integration
   # Create PR and merge
   ```

2. **Deploy to Staging**:
   ```bash
   git checkout main
   git pull
   ./deploy.sh build
   ./deploy.sh start
   ```

3. **Begin Story 8.2**: Candidate Job Discovery Interface
   - Enhanced search and filtering
   - Job recommendations
   - Save favorite jobs

4. **Begin Story 8.3**: Application Submission Workflow
   - CV selection integration
   - Profile pre-population
   - Application tracking

---

## 📞 Support

For issues:
1. Check `WORKABLE_SETUP.md` for detailed configuration
2. Check `STORY_8.1_TEST_PLAN.md` for comprehensive test cases
3. Check `DEPLOYMENT.md` for Docker deployment details
4. Review `DEVELOPMENT_CONTEXT.md` for Docker commands

---

**Happy Testing! 🎉**

