# TMFNUI Integration - Quick Start Guide

**Approach**: Copy & Adapt with Backend Proxy (PoC)
**Full Documentation**: See `TMFNUI_INTEGRATION_POC.md`

---

## Quick Overview

### What We're Doing
Integrating 3 hiring modules from TMFNUI into the Team Member Portal:
- Job Requests
- Interviews
- Talent Pool

### How We're Doing It
1. **Copy** TMFNUI source code into portal
2. **Adapt** to work with portal's architecture (React 19, MUI v7, React Router v7)
3. **Proxy** API calls to TMFNUI backend (no backend migration needed)

### Timeline
4-5 weeks for complete PoC

---

## Pre-Flight Checklist

Before starting, verify:

- [ ] TMFNUI project exists at `../TMFNUI/tmf-frontend/`
- [ ] TMFNUI backend can be started locally
- [ ] You have Node.js 18+ installed
- [ ] Portal currently runs without errors (`npm run start:dev`)
- [ ] You have admin/HR test credentials

---

## Phase 1: Preparation (Week 1)

### Step 1: Install Dependencies

```bash
cd frontend

npm install \
  moment \
  moment-timezone \
  formik \
  yup \
  yup-password \
  @fullcalendar/react \
  @fullcalendar/core \
  @fullcalendar/daygrid \
  react-alert \
  react-alert-template-basic \
  country-state-city \
  jwt-decode

npm install --save-dev @types/react-alert
```

### Step 2: Analyze TMFNUI Backend

```bash
# Find TMFNUI backend
ls -la ../TMFNUI/

# Start TMFNUI backend (adjust path as needed)
cd ../TMFNUI/[backend-directory]
npm install
npm start

# Note the port (e.g., 4000)
# Note the API prefix (e.g., /api)
```

### Step 3: Create Directory Structure

```bash
cd frontend/src

mkdir -p pages/hiring/{JobRequest,Interview,TalentPool}
mkdir -p services/hiring
mkdir -p types/hiring
mkdir -p hooks/hiring
mkdir -p components/hiring
```

---

## Phase 2: Module Migration (Week 2-3)

### Step 1: Copy Files

```bash
cd frontend/src

# Copy Job Request module
cp -r ../../../TMFNUI/tmf-frontend/src/modules/JobRequest/* \
  pages/hiring/JobRequest/

# Copy Interview module
cp -r ../../../TMFNUI/tmf-frontend/src/modules/Interview/* \
  pages/hiring/Interview/

# Copy Talent Pool module
cp -r ../../../TMFNUI/tmf-frontend/src/modules/TalentPool/* \
  pages/hiring/TalentPool/
```

### Step 2: Copy Shared Components

```bash
# Copy layout components
cp -r ../../../TMFNUI/tmf-frontend/src/shared/components/LayoutV2 \
  components/hiring/HiringLayout

cp -r ../../../TMFNUI/tmf-frontend/src/shared/components/CommonPageHeader \
  components/hiring/HiringHeader

# Copy breadcrumbs
cp ../../../TMFNUI/tmf-frontend/src/modules/JobRequest/JobBreadcrumbs.tsx \
  components/hiring/
```

### Step 3: Convert Redux to Axios

**Create service**: `frontend/src/services/hiring/jobRequestService.ts`

```typescript
import axios from 'axios';

const HIRING_API_BASE = '/hiring-api';

class JobRequestService {
  async getJobRequests(filters: any) {
    const { data } = await axios.get(`${HIRING_API_BASE}/job-requests`, {
      params: filters,
    });
    return data;
  }

  async getJobRequestById(id: string) {
    const { data } = await axios.get(`${HIRING_API_BASE}/job-requests/${id}`);
    return data;
  }

  // Add other methods as needed
}

export default new JobRequestService();
```

**Create hook**: `frontend/src/hooks/hiring/useJobRequests.ts`

```typescript
import { useState, useEffect } from 'react';
import jobRequestService from '../../services/hiring/jobRequestService';

export function useJobRequests(filters: any) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    jobRequestService.getJobRequests(filters)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}
```

**Update components**:

```typescript
// BEFORE (TMFNUI - Redux)
import { useGetFilteredJobRequetsQuery } from '../../redux/Hire/jobRequestApi';
const { data, isLoading } = useGetFilteredJobRequetsQuery(filters);

// AFTER (Portal - Custom hook)
import { useJobRequests } from '../../hooks/hiring/useJobRequests';
const { data, loading: isLoading } = useJobRequests(filters);
```

### Step 4: Update Imports

Replace all TMFNUI imports with portal imports:

```typescript
// BEFORE
import Layout from '../../shared/components/LayoutV2';
import Header from '../../shared/components/CommonPageHeader/Header';

// AFTER
import Layout from '../../components/hiring/HiringLayout';
import Header from '../../components/hiring/HiringHeader';
```

---

## Phase 3: Backend Proxy (Week 3)

### Update `frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Existing portal API
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // NEW: Hiring API
      '/hiring-api': {
        target: 'http://localhost:4000', // TMFNUI backend port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hiring-api/, '/api'),
      },
    },
  },
});
```

### Create Auth Bridge

**Create**: `frontend/src/services/hiring/authBridge.ts`

```typescript
import axios from 'axios';

class HiringAuthBridge {
  setupInterceptors() {
    axios.interceptors.request.use((config) => {
      if (config.url?.startsWith('/hiring-api')) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }
}

export default new HiringAuthBridge();
```

**Initialize**: `frontend/src/App.tsx`

```typescript
import { useEffect } from 'react';
import hiringAuthBridge from './services/hiring/authBridge';

function App() {
  useEffect(() => {
    hiringAuthBridge.setupInterceptors();
  }, []);

  // ... rest of app
}
```

---

## Phase 4: Integration (Week 4)

### Add Routes

**Update**: `frontend/src/App.tsx`

```typescript
import JobRequestContainer from './pages/hiring/JobRequest/Container';
import Interview from './pages/hiring/Interview/Interview';
import TalentPoolContainer from './pages/hiring/TalentPool/Container';

// Add routes
<Routes>
  {/* Existing routes */}

  {/* NEW: Hiring routes */}
  <Route
    path="/hiring/jobs/*"
    element={
      <ProtectedRoute allowedRoles={['admin', 'hr']}>
        <JobRequestContainer />
      </ProtectedRoute>
    }
  />
  <Route
    path="/hiring/interviews/*"
    element={
      <ProtectedRoute allowedRoles={['admin', 'hr']}>
        <Interview />
      </ProtectedRoute>
    }
  />
  <Route
    path="/hiring/talent-pool/*"
    element={
      <ProtectedRoute allowedRoles={['admin', 'hr']}>
        <TalentPoolContainer />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Add Navigation

**Update**: `frontend/src/components/Navigation.tsx` (or sidebar component)

```typescript
const hiringNavItems = {
  label: 'Hiring',
  icon: <WorkOutline />,
  roles: ['admin', 'hr'],
  children: [
    { label: 'Job Requests', path: '/hiring/jobs', icon: <Assignment /> },
    { label: 'Interviews', path: '/hiring/interviews', icon: <Event /> },
    { label: 'Talent Pool', path: '/hiring/talent-pool', icon: <People /> },
  ],
};
```

---

## Phase 5: Testing (Week 5)

### Manual Testing Checklist

**Job Requests**:
- [ ] Can view list of jobs
- [ ] Can create new job
- [ ] Can edit job
- [ ] Can delete job
- [ ] Can filter by status
- [ ] Can search jobs

**Interviews**:
- [ ] Can view calendar
- [ ] Can switch to list view
- [ ] Can book interview
- [ ] Can reschedule
- [ ] Can view details

**Talent Pool**:
- [ ] Can view candidates
- [ ] Can search candidates
- [ ] Can filter candidates
- [ ] Can view candidate details
- [ ] Can assign to job

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npx playwright test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Development Workflow

### Running All Services

**Terminal 1: Portal Frontend**
```bash
cd frontend
npm run dev  # http://localhost:5173
```

**Terminal 2: Portal Backend**
```bash
npm run start:dev  # http://localhost:3000
```

**Terminal 3: TMFNUI Backend**
```bash
cd ../TMFNUI/[backend-directory]
npm start  # http://localhost:4000
```

### Access the App

1. Open http://localhost:5173
2. Login with `hr@teamified.com` / `HRManager123!`
3. Navigate to "Hiring" menu
4. Test each module

---

## Troubleshooting

### "Module not found" errors
- Check import paths are correct
- Ensure files were copied successfully
- Verify dependencies installed

### API calls failing
- Check TMFNUI backend is running
- Verify proxy config in `vite.config.ts`
- Check browser network tab for actual URLs
- Verify auth token is being sent

### Styling issues
- Check MUI theme provider wraps components
- Verify no CSS conflicts
- Use browser DevTools to inspect styles

### TypeScript errors
- Create missing type definitions
- Add `// @ts-ignore` temporarily if needed
- Gradually fix type issues

---

## Success Criteria

PoC is successful when:

- ✅ All 3 hiring modules accessible from portal
- ✅ Can perform CRUD operations on each module
- ✅ Authentication works seamlessly
- ✅ No console errors
- ✅ Styling matches portal theme
- ✅ All tests passing

---

## Next Steps After PoC

1. **Stabilize**: Use PoC for 2-4 weeks
2. **Collect Feedback**: Get user feedback
3. **Decide**: Migrate to Module Federation or keep Copy & Adapt?
4. **Document**: Update README and docs
5. **Deploy**: Deploy to staging/production

---

## Quick Commands Reference

```bash
# Install dependencies
cd frontend && npm install

# Copy modules from TMFNUI
./scripts/copy-tmfnui-modules.sh  # Create this script

# Start all services
./scripts/start-all.sh  # Create this script

# Run tests
npm run test

# Build
npm run build

# Deploy
./scripts/deploy-vercel.sh --both
```

---

## File Location Reference

| What | Where |
|------|-------|
| Full documentation | `docs/TMFNUI_INTEGRATION_POC.md` |
| Quick start | `docs/TMFNUI_INTEGRATION_QUICK_START.md` (this file) |
| Hiring pages | `frontend/src/pages/hiring/` |
| Hiring services | `frontend/src/services/hiring/` |
| Hiring hooks | `frontend/src/hooks/hiring/` |
| Hiring components | `frontend/src/components/hiring/` |
| Hiring types | `frontend/src/types/hiring/` |
| Proxy config | `frontend/vite.config.ts` |

---

## Need Help?

- **Full docs**: `docs/TMFNUI_INTEGRATION_POC.md`
- **Portal guide**: `CLAUDE.md`
- **Deployment**: `docs/deployment/vercel-*.md`
- **BMad guide**: `.bmad-core/user-guide.md`

---

**Ready to start?** Begin with Phase 1: Preparation! 🚀
