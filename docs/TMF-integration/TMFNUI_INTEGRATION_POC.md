# TMFNUI Integration - Proof of Concept (Copy & Adapt)

**Status**: Planning Phase
**Approach**: Copy & Adapt with Backend Proxy
**Target Modules**: Job Requests, Interviews, Talent Pool
**Timeline**: 4-5 weeks
**Last Updated**: 2025-10-30

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Phase 1: Preparation](#phase-1-preparation)
4. [Phase 2: Module Migration](#phase-2-module-migration)
5. [Phase 3: Backend Proxy](#phase-3-backend-proxy)
6. [Phase 4: Integration](#phase-4-integration)
7. [Phase 5: Testing](#phase-5-testing)
8. [Success Criteria](#success-criteria)
9. [Migration to Module Federation](#migration-to-module-federation)
10. [Rollback Plan](#rollback-plan)

---

## Overview

### Objective

Integrate 3 hiring modules from TMFNUI (Job Requests, Interviews, Talent Pool) into the Team Member Portal as a proof-of-concept using the Copy & Adapt approach with backend proxying.

### Strategy

**Copy & Adapt**: Copy source code from TMFNUI directly into the portal codebase and adapt it to work within the portal's architecture.

**Backend Proxy**: Use Vite's proxy feature to route hiring API calls to TMFNUI's backend without migrating backend code.

### Why This Approach?

- **Fastest time to value**: 4-5 weeks vs. 5-7 weeks for Module Federation
- **Simplest debugging**: Single codebase, familiar development workflow
- **Lower risk**: Easy to rollback, no complex federation setup
- **Proof of concept**: Validate integration before committing to Module Federation
- **Migration path**: Can migrate to Module Federation later if needed

---

## Architecture

### Current State

```
Portal (Frontend)          TMFNUI (Separate Project)
├── React 19               ├── React 18
├── MUI v7                 ├── MUI v5
├── Vite                   ├── CRA + CRACO
├── React Router v7        ├── React Router v6
└── Portal Backend         └── TMFNUI Backend (separate)
    (NestJS)                   (unknown stack)
```

### Target State (PoC)

```
Portal (Frontend - Unified)
├── React 19
├── MUI v7
├── Vite
├── React Router v7
├── Existing Portal Pages
└── NEW: Hiring Pages (copied from TMFNUI)
    ├── JobRequestPage (adapted)
    ├── InterviewPage (adapted)
    └── TalentPoolPage (adapted)
        ↓ API Calls
        ↓ (proxied via Vite)
        ↓
TMFNUI Backend (unchanged)
    ├── Hiring endpoints
    ├── Candidate data
    └── Interview scheduling
```

### File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── hiring/                    # NEW: Copied TMFNUI modules
│   │   │   ├── JobRequest/
│   │   │   │   ├── Container.tsx
│   │   │   │   ├── JobsContainer.tsx
│   │   │   │   ├── JobCard/
│   │   │   │   └── JobRequestFormContainer.tsx
│   │   │   ├── Interview/
│   │   │   │   ├── Interview.tsx
│   │   │   │   ├── InterviewBody.tsx
│   │   │   │   ├── InterviewCalendar.tsx
│   │   │   │   └── InterviewHeader.tsx
│   │   │   └── TalentPool/
│   │   │       ├── Container.tsx
│   │   │       ├── TalentPoolBody.tsx
│   │   │       ├── TalentPoolCandidatesList.tsx
│   │   │       └── CandidateCard/
│   │   └── ... (existing portal pages)
│   │
│   ├── services/
│   │   └── hiring/                    # NEW: Hiring API clients
│   │       ├── jobRequestApi.ts
│   │       ├── candidateMeetingApi.ts
│   │       ├── crmCandidateApi.ts
│   │       └── hireApi.ts
│   │
│   ├── types/
│   │   └── hiring/                    # NEW: Hiring type definitions
│   │       ├── jobRequest.types.ts
│   │       ├── interview.types.ts
│   │       └── candidate.types.ts
│   │
│   ├── hooks/
│   │   └── hiring/                    # NEW: Hiring-specific hooks
│   │       ├── useJobRequests.ts
│   │       ├── useInterviews.ts
│   │       └── useTalentPool.ts
│   │
│   └── components/
│       └── hiring/                    # NEW: Shared hiring components
│           ├── HiringLayout.tsx       # Adapted from TMFNUI LayoutV2
│           ├── HiringHeader.tsx       # Adapted from CommonPageHeader
│           └── JobBreadcrumbs.tsx     # Copied from TMFNUI
│
├── vite.config.ts                     # UPDATED: Add proxy config
└── package.json                        # UPDATED: Add dependencies
```

---

## Phase 1: Preparation

**Duration**: 3-4 days
**Goal**: Set up environment and identify all dependencies

### 1.1 Dependency Analysis

#### Required TMFNUI Dependencies

**Install in Portal**:

```bash
cd frontend

# Date/Time libraries
npm install moment moment-timezone

# Form libraries
npm install formik yup yup-password

# Calendar library
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid

# Alert/Notification
npm install react-alert react-alert-template-basic

# Utilities
npm install country-state-city jwt-decode

# TypeScript types
npm install --save-dev @types/react-alert
```

**Dependencies Already in Portal** (verify versions match):
- `react`, `react-dom` (Portal: 19.x, TMFNUI: 18.x - ✅ Compatible)
- `react-router-dom` (Portal: v7, TMFNUI: v6 - ⚠️ Minor changes needed)
- `@mui/material`, `@mui/icons-material` (Portal: v7, TMFNUI: v5 - ⚠️ Migration needed)
- `axios` (Both use, compatible)

#### Version Compatibility Matrix

| Dependency | Portal | TMFNUI | Action |
|------------|--------|--------|--------|
| React | 19.x | 18.3.1 | ✅ Use 19.x (backward compatible) |
| MUI | v7 | v5 | ⚠️ Migrate components to v7 |
| React Router | v7 | v6 | ⚠️ Update route syntax |
| Axios | 1.x | 1.12.0 | ✅ Compatible |
| Formik | - | 2.2.6 | ➕ Add to portal |
| Moment | - | 2.29.4 | ➕ Add to portal |
| FullCalendar | - | 6.1.15 | ➕ Add to portal |

### 1.2 TMFNUI Backend Analysis

**Tasks**:

1. **Locate TMFNUI backend**:
   ```bash
   # Check if backend exists in TMFNUI project
   ls -la ../TMFNUI/
   # Look for: backend/, server/, api/, src/server, etc.
   ```

2. **Document API endpoints** used by 3 modules:
   - Job Requests: `/api/job-requests`, `/api/jobs`, etc.
   - Interviews: `/api/meetings`, `/api/interviews`, `/api/slots`, etc.
   - Talent Pool: `/api/candidates`, `/api/crm-candidates`, etc.

3. **Document authentication**:
   - Token format (JWT?)
   - Token storage (localStorage? cookies?)
   - Token refresh mechanism
   - API base URL

4. **Run TMFNUI backend locally**:
   ```bash
   # Document how to start TMFNUI backend
   cd ../TMFNUI/[backend-directory]
   # Install dependencies
   # Start server
   # Note the port (e.g., 4000)
   ```

### 1.3 Create Module Inventory

**Document all files to copy**:

```bash
# Create inventory script
cat > scripts/tmfnui-inventory.sh << 'EOF'
#!/bin/bash

TMFNUI_PATH="../TMFNUI/tmf-frontend/src"
OUTPUT="docs/tmfnui-file-inventory.txt"

echo "TMFNUI Module Inventory - $(date)" > $OUTPUT
echo "========================================" >> $OUTPUT

echo "\n### Job Request Module" >> $OUTPUT
find $TMFNUI_PATH/modules/JobRequest -type f >> $OUTPUT

echo "\n### Interview Module" >> $OUTPUT
find $TMFNUI_PATH/modules/Interview -type f >> $OUTPUT

echo "\n### Talent Pool Module" >> $OUTPUT
find $TMFNUI_PATH/modules/TalentPool -type f >> $OUTPUT

echo "\n### Shared Components (used by above)" >> $OUTPUT
# Analyze imports and list shared components

echo "\nInventory saved to $OUTPUT"
EOF

chmod +x scripts/tmfnui-inventory.sh
./scripts/tmfnui-inventory.sh
```

---

## Phase 2: Module Migration

**Duration**: 1-2 weeks
**Goal**: Copy and adapt TMFNUI modules to work in portal

### 2.1 Copy Source Files

**Step 1: Create directory structure**

```bash
cd frontend/src

# Create hiring pages directory
mkdir -p pages/hiring/{JobRequest,Interview,TalentPool}

# Create hiring services directory
mkdir -p services/hiring

# Create hiring types directory
mkdir -p types/hiring

# Create hiring hooks directory
mkdir -p hooks/hiring

# Create hiring components directory
mkdir -p components/hiring
```

**Step 2: Copy module files**

```bash
# Job Request module
cp -r ../../../TMFNUI/tmf-frontend/src/modules/JobRequest/* \
  pages/hiring/JobRequest/

# Interview module
cp -r ../../../TMFNUI/tmf-frontend/src/modules/Interview/* \
  pages/hiring/Interview/

# Talent Pool module
cp -r ../../../TMFNUI/tmf-frontend/src/modules/TalentPool/* \
  pages/hiring/TalentPool/
```

**Step 3: Copy Redux/API files**

```bash
# Copy Redux API slices (will be converted to React Query/Axios)
mkdir -p services/hiring/legacy-redux

cp ../../../TMFNUI/tmf-frontend/src/redux/Hire/jobRequestApi.ts \
  services/hiring/legacy-redux/

cp ../../../TMFNUI/tmf-frontend/src/redux/Hire/candidateMeetingApi.ts \
  services/hiring/legacy-redux/

cp ../../../TMFNUI/tmf-frontend/src/redux/Hire/crmCandidateApi.ts \
  services/hiring/legacy-redux/

cp ../../../TMFNUI/tmf-frontend/src/redux/Hire/hireApi.ts \
  services/hiring/legacy-redux/
```

**Step 4: Copy shared components**

```bash
# Identify shared components used by 3 modules
# Example:
cp -r ../../../TMFNUI/tmf-frontend/src/shared/components/LayoutV2 \
  components/hiring/HiringLayout

cp -r ../../../TMFNUI/tmf-frontend/src/shared/components/CommonPageHeader \
  components/hiring/HiringHeader

# Copy breadcrumbs from JobRequest module
cp ../../../TMFNUI/tmf-frontend/src/modules/JobRequest/JobBreadcrumbs.tsx \
  components/hiring/
```

### 2.2 Convert Redux to React Query/Axios

**Strategy**: TMFNUI uses Redux Toolkit Query (RTK Query). Portal uses Axios with React Context. We'll convert RTK Query to Axios calls.

**Step 1: Create Axios service layer**

Create `frontend/src/services/hiring/jobRequestService.ts`:

```typescript
import axios from 'axios';
import { JobRequest, JobRequestFilters } from '../../types/hiring/jobRequest.types';

const HIRING_API_BASE = '/hiring-api'; // Will be proxied to TMFNUI backend

class JobRequestService {
  async getJobRequests(filters: JobRequestFilters): Promise<JobRequest[]> {
    const response = await axios.get(`${HIRING_API_BASE}/job-requests`, {
      params: filters,
    });
    return response.data;
  }

  async getJobRequestById(id: string): Promise<JobRequest> {
    const response = await axios.get(`${HIRING_API_BASE}/job-requests/${id}`);
    return response.data;
  }

  async createJobRequest(data: Partial<JobRequest>): Promise<JobRequest> {
    const response = await axios.post(`${HIRING_API_BASE}/job-requests`, data);
    return response.data;
  }

  async updateJobRequest(id: string, data: Partial<JobRequest>): Promise<JobRequest> {
    const response = await axios.put(`${HIRING_API_BASE}/job-requests/${id}`, data);
    return response.data;
  }

  async deleteJobRequest(id: string): Promise<void> {
    await axios.delete(`${HIRING_API_BASE}/job-requests/${id}`);
  }
}

export default new JobRequestService();
```

Create similar services for:
- `candidateService.ts`
- `interviewService.ts`
- `talentPoolService.ts`

**Step 2: Create React hooks**

Create `frontend/src/hooks/hiring/useJobRequests.ts`:

```typescript
import { useState, useEffect } from 'react';
import jobRequestService from '../../services/hiring/jobRequestService';
import { JobRequest, JobRequestFilters } from '../../types/hiring/jobRequest.types';

export function useJobRequests(filters: JobRequestFilters) {
  const [data, setData] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getJobRequests(filters);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobRequests();
  }, [JSON.stringify(filters)]); // Refetch when filters change

  return { data, loading, error };
}

export function useJobRequest(id: string) {
  const [data, setData] = useState<JobRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchJobRequest = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getJobRequestById(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobRequest();
    }
  }, [id]);

  return { data, loading, error };
}
```

**Step 3: Update component imports**

In copied components, replace RTK Query hooks with new custom hooks:

```typescript
// BEFORE (TMFNUI - RTK Query)
import { useGetFilteredJobRequetsInfiniteQuery } from '../../redux/Hire/jobRequestApi';

const { data: jobRequests, isLoading, error } = useGetFilteredJobRequetsInfiniteQuery({
  filters: {...}
});

// AFTER (Portal - Custom hooks)
import { useJobRequests } from '../../hooks/hiring/useJobRequests';

const { data: jobRequests, loading: isLoading, error } = useJobRequests({
  filters: {...}
});
```

### 2.3 Migrate MUI v5 to v7

**Breaking Changes**: MUI v5 → v7 has significant changes.

**Common Migration Patterns**:

```typescript
// BEFORE (MUI v5)
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
}));

function MyComponent() {
  const classes = useStyles();
  return <div className={classes.container}>Content</div>;
}

// AFTER (MUI v7 - use sx prop)
function MyComponent() {
  return (
    <Box sx={{ padding: 2 }}>
      Content
    </Box>
  );
}
```

**Migration Checklist**:
- [ ] Replace `makeStyles` with `sx` prop or styled components
- [ ] Update `theme` imports if using custom theme
- [ ] Replace deprecated `@mui/styles` with `@mui/system`
- [ ] Update `DataGrid` props (if using `@mui/x-data-grid`)
- [ ] Update `DatePicker` imports and props

**Reference**: https://mui.com/material-ui/migration/migration-v6/

### 2.4 Update React Router v6 to v7

**Breaking Changes**: Minor syntax changes.

```typescript
// BEFORE (React Router v6)
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/hiring/jobs');

// AFTER (React Router v7 - same)
// No changes needed for basic navigation

// BEFORE (v6 - Route element)
<Route path="/jobs" element={<JobsPage />} />

// AFTER (v7 - same)
// No changes needed for basic routes
```

Most React Router v6 code works in v7 without changes.

### 2.5 Extract Type Definitions

Create `frontend/src/types/hiring/jobRequest.types.ts`:

```typescript
// Extract types from TMFNUI Redux slices
export interface JobRequest {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in_progress';
  clientId: string;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
  stages: Stage[];
  candidates: CandidateDetails[];
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  candidates: CandidateDetails[];
}

export interface CandidateDetails {
  id: string;
  name: string;
  email: string;
  status: string;
  resumeUrl?: string;
}

export interface JobRequestFilters {
  status?: 'open' | 'closed';
  recruiterId?: string;
  clientId?: string;
  searchTerm?: string;
  dateRange?: string;
}
```

Create similar type files for interviews and talent pool.

---

## Phase 3: Backend Proxy

**Duration**: 2-3 days
**Goal**: Configure Vite to proxy hiring API calls to TMFNUI backend

### 3.1 Configure Vite Proxy

**Update `frontend/vite.config.ts`**:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Portal API (existing) - NestJS backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // NEW: Hiring API - TMFNUI backend
      '/hiring-api': {
        target: 'http://localhost:4000', // TMFNUI backend port (adjust as needed)
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/hiring-api/, '/api'), // Remove /hiring-api prefix
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward auth token from portal to hiring API
            const token = req.headers.authorization;
            if (token) {
              proxyReq.setHeader('Authorization', token);
            }
            console.log(`[Proxy] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[Proxy] ${proxyRes.statusCode} ${req.url}`);
          });

          proxy.on('error', (err, req, res) => {
            console.error(`[Proxy Error] ${req.url}:`, err);
          });
        },
      },
    },
  },
  build: {
    // ... existing build config
  },
});
```

**How the proxy works**:

```
Frontend Request                  Vite Proxy              Backend
─────────────────                ──────────              ───────

/api/users          ──────────>  [No rewrite]  ────────> Portal Backend (NestJS)
                                                          http://localhost:3000/api/users

/hiring-api/jobs    ──────────>  [Rewrite]     ────────> TMFNUI Backend
                                 /api/jobs               http://localhost:4000/api/jobs
```

### 3.2 Environment Variables

Create `.env.development`:

```bash
# Portal API (existing)
VITE_API_URL=http://localhost:3000/api

# NEW: Hiring API (TMFNUI backend)
VITE_HIRING_API_URL=/hiring-api
VITE_HIRING_BACKEND_URL=http://localhost:4000
```

Create `.env.production`:

```bash
# Portal API
VITE_API_URL=https://api.teamified.com/api

# Hiring API (will need to deploy TMFNUI backend separately)
VITE_HIRING_API_URL=https://hiring-api.teamified.com/api
VITE_HIRING_BACKEND_URL=https://hiring-api.teamified.com
```

### 3.3 Authentication Bridge

**Challenge**: Portal and TMFNUI backends may use different auth systems.

**Solution**: Create authentication bridge to sync tokens.

Create `frontend/src/services/hiring/authBridge.ts`:

```typescript
import axios from 'axios';

class HiringAuthBridge {
  /**
   * Sync portal auth token to hiring API calls
   */
  setupInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        // Only add token to hiring API calls
        if (config.url?.startsWith('/hiring-api')) {
          const token = localStorage.getItem('auth_token'); // Portal token
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized from hiring API
        if (error.config?.url?.startsWith('/hiring-api') && error.response?.status === 401) {
          console.error('Hiring API authentication failed');
          // Optionally trigger re-authentication
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * If TMFNUI backend requires separate login,
   * authenticate using portal credentials
   */
  async authenticateWithHiringBackend(portalToken: string) {
    try {
      // Option 1: If TMFNUI backend accepts portal tokens, no action needed

      // Option 2: If separate auth needed, exchange tokens
      const response = await axios.post('/hiring-api/auth/exchange-token', {
        portalToken,
      });

      const hiringToken = response.data.token;
      localStorage.setItem('hiring_auth_token', hiringToken);

      return hiringToken;
    } catch (error) {
      console.error('Failed to authenticate with hiring backend:', error);
      throw error;
    }
  }
}

export default new HiringAuthBridge();
```

**Initialize in `App.tsx`**:

```typescript
import hiringAuthBridge from './services/hiring/authBridge';

function App() {
  useEffect(() => {
    hiringAuthBridge.setupInterceptors();
  }, []);

  return (
    // ... rest of app
  );
}
```

---

## Phase 4: Integration

**Duration**: 1 week
**Goal**: Integrate hiring pages into portal navigation and routing

### 4.1 Add Routes

**Update `frontend/src/App.tsx`** (or your routing file):

```typescript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Existing portal pages
import DashboardPage from './pages/DashboardPage';
// ... other imports

// NEW: Hiring pages
import JobRequestContainer from './pages/hiring/JobRequest/Container';
import Interview from './pages/hiring/Interview/Interview';
import TalentPoolContainer from './pages/hiring/TalentPool/Container';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing portal routes */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employment-records" element={<EmploymentRecordsPage />} />
        {/* ... other routes */}

        {/* NEW: Hiring routes */}
        <Route
          path="/hiring/jobs/*"
          element={
            <ProtectedRoute allowedRoles={['admin', 'hr']}>
              <Suspense fallback={<LoadingSpinner />}>
                <JobRequestContainer />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hiring/interviews/*"
          element={
            <ProtectedRoute allowedRoles={['admin', 'hr']}>
              <Suspense fallback={<LoadingSpinner />}>
                <Interview />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hiring/talent-pool/*"
          element={
            <ProtectedRoute allowedRoles={['admin', 'hr']}>
              <Suspense fallback={<LoadingSpinner />}>
                <TalentPoolContainer />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 4.2 Add Navigation Items

**Update sidebar navigation** (e.g., `frontend/src/components/Navigation.tsx`):

```typescript
import {
  WorkOutline as JobsIcon,
  Event as InterviewIcon,
  People as TalentIcon,
} from '@mui/icons-material';

const navigationItems = [
  // ... existing items

  // NEW: Hiring section
  {
    id: 'hiring',
    label: 'Hiring',
    icon: <WorkOutline />,
    roles: ['admin', 'hr'],
    children: [
      {
        id: 'job-requests',
        label: 'Job Requests',
        path: '/hiring/jobs',
        icon: <JobsIcon />,
      },
      {
        id: 'interviews',
        label: 'Interviews',
        path: '/hiring/interviews',
        icon: <InterviewIcon />,
      },
      {
        id: 'talent-pool',
        label: 'Talent Pool',
        path: '/hiring/talent-pool',
        icon: <TalentIcon />,
      },
    ],
  },
];
```

### 4.3 Role-Based Access Control

**Ensure RBAC is enforced**:

```typescript
// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles = []
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

### 4.4 Theme Integration

**Ensure TMFNUI components use portal theme**:

Create `frontend/src/components/hiring/HiringThemeProvider.tsx`:

```typescript
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '../../hooks/useTheme';

interface HiringThemeProviderProps {
  children: React.ReactNode;
}

export default function HiringThemeProvider({ children }: HiringThemeProviderProps) {
  const portalTheme = useTheme(); // Get portal's theme

  // Optionally extend portal theme with hiring-specific overrides
  const hiringTheme = {
    ...portalTheme,
    components: {
      ...portalTheme.components,
      // Add hiring-specific component overrides if needed
    },
  };

  return <ThemeProvider theme={hiringTheme}>{children}</ThemeProvider>;
}
```

Wrap hiring pages:

```typescript
<Route
  path="/hiring/jobs/*"
  element={
    <ProtectedRoute allowedRoles={['admin', 'hr']}>
      <HiringThemeProvider>
        <JobRequestContainer />
      </HiringThemeProvider>
    </ProtectedRoute>
  }
/>
```

---

## Phase 5: Testing

**Duration**: 3-4 days
**Goal**: Comprehensive testing of integrated hiring modules

### 5.1 Unit Testing

**Test hiring services**:

```typescript
// frontend/src/services/hiring/__tests__/jobRequestService.test.ts
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import jobRequestService from '../jobRequestService';

vi.mock('axios');

describe('JobRequestService', () => {
  it('should fetch job requests with filters', async () => {
    const mockData = [{ id: '1', title: 'Software Engineer' }];
    vi.mocked(axios.get).mockResolvedValue({ data: mockData });

    const result = await jobRequestService.getJobRequests({ status: 'open' });

    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith('/hiring-api/job-requests', {
      params: { status: 'open' },
    });
  });
});
```

**Test hooks**:

```typescript
// frontend/src/hooks/hiring/__tests__/useJobRequests.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useJobRequests } from '../useJobRequests';
import jobRequestService from '../../../services/hiring/jobRequestService';

vi.mock('../../../services/hiring/jobRequestService');

describe('useJobRequests', () => {
  it('should fetch and return job requests', async () => {
    const mockData = [{ id: '1', title: 'Test Job' }];
    vi.mocked(jobRequestService.getJobRequests).mockResolvedValue(mockData);

    const { result } = renderHook(() => useJobRequests({ status: 'open' }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
    });
  });
});
```

### 5.2 Integration Testing

**Test end-to-end flows**:

```typescript
// e2e/hiring/job-requests.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Job Requests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR user
    await page.goto('/login');
    await page.fill('[name="email"]', 'hr@teamified.com');
    await page.fill('[name="password"]', 'HRManager123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display job requests page', async ({ page }) => {
    await page.goto('/hiring/jobs');
    await expect(page.locator('h1')).toContainText('Job Requests');
  });

  test('should create new job request', async ({ page }) => {
    await page.goto('/hiring/jobs');
    await page.click('button:has-text("New Job Request")');

    await page.fill('[name="title"]', 'Senior React Developer');
    await page.fill('[name="description"]', 'Looking for experienced React dev');
    await page.click('button:has-text("Submit")');

    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should filter job requests by status', async ({ page }) => {
    await page.goto('/hiring/jobs');
    await page.click('[data-testid="status-filter"]');
    await page.click('text=Open');

    await page.waitForSelector('[data-testid="job-card"]');
    const jobs = await page.locator('[data-testid="job-card"]').all();

    expect(jobs.length).toBeGreaterThan(0);
  });
});
```

### 5.3 Manual Testing Checklist

**Hiring Modules Testing**:

- [ ] **Job Requests**
  - [ ] View job requests list
  - [ ] Filter by status (open/closed)
  - [ ] Filter by recruiter
  - [ ] Search by job title
  - [ ] Create new job request
  - [ ] Edit existing job request
  - [ ] Delete job request
  - [ ] View job timeline
  - [ ] Navigate through job stages

- [ ] **Interviews**
  - [ ] View interviews calendar
  - [ ] Switch between calendar and list view
  - [ ] Navigate by week (prev/next)
  - [ ] Book timeslot for interview
  - [ ] Reschedule interview
  - [ ] View interview details
  - [ ] Filter by interviewer
  - [ ] Create new interview

- [ ] **Talent Pool**
  - [ ] View candidate cards
  - [ ] Search candidates
  - [ ] Filter candidates by skills
  - [ ] Filter by experience range
  - [ ] View candidate details
  - [ ] Assign candidate to job
  - [ ] View application history
  - [ ] View candidate resume
  - [ ] Add comments to candidate

**Integration Testing**:

- [ ] **Authentication**
  - [ ] Login with portal credentials works for hiring pages
  - [ ] Token is passed to TMFNUI backend
  - [ ] Logout clears hiring session
  - [ ] Session timeout handled gracefully

- [ ] **Navigation**
  - [ ] Hiring menu items visible for admin/hr roles
  - [ ] Hiring menu hidden for non-hr roles
  - [ ] Navigation between portal and hiring pages smooth
  - [ ] Breadcrumbs work correctly
  - [ ] Back button works as expected

- [ ] **Styling**
  - [ ] Hiring pages match portal theme
  - [ ] No style conflicts between portal and hiring CSS
  - [ ] Responsive design works on mobile/tablet
  - [ ] MUI components render correctly

- [ ] **Error Handling**
  - [ ] API errors display user-friendly messages
  - [ ] Network errors handled gracefully
  - [ ] 404 errors redirect appropriately
  - [ ] Validation errors show inline

### 5.4 Performance Testing

**Metrics to measure**:

- [ ] Initial page load time < 3s
- [ ] API response time < 1s
- [ ] Calendar rendering < 500ms
- [ ] Search results < 500ms
- [ ] No memory leaks on navigation

**Tools**:
- Chrome DevTools Performance tab
- Lighthouse audit
- React DevTools Profiler

---

## Success Criteria

### Functional Requirements

- ✅ All 3 hiring modules (Job Requests, Interviews, Talent Pool) accessible from portal
- ✅ CRUD operations work for all modules
- ✅ Filtering, searching, sorting work correctly
- ✅ Authentication seamless between portal and hiring backend
- ✅ Role-based access control enforced
- ✅ No broken functionality from TMFNUI source

### Technical Requirements

- ✅ No console errors in browser
- ✅ All TypeScript errors resolved
- ✅ All unit tests passing
- ✅ All E2E tests passing
- ✅ Code linted and formatted
- ✅ No accessibility violations (WCAG AA)

### Performance Requirements

- ✅ Initial load < 3s on 3G
- ✅ Page transitions < 500ms
- ✅ API calls < 1s response time
- ✅ Lighthouse score > 90 (performance)
- ✅ No memory leaks

### User Experience Requirements

- ✅ Hiring pages match portal design language
- ✅ Navigation intuitive and consistent
- ✅ Error messages clear and actionable
- ✅ Loading states indicate progress
- ✅ Mobile responsive

---

## Migration to Module Federation

**When to Migrate**: After PoC is successful and stable for 2-4 weeks.

**Why Migrate**:
- Independent deployments of hiring modules
- Reduced bundle size (lazy loading)
- Easier to maintain separate codebases
- Better scalability

**Migration Steps**:

1. **Extract hiring modules to separate project**:
   ```
   apps/
   ├── portal/              # Main portal
   └── hiring-modules/      # TMFNUI hiring modules
   ```

2. **Set up Module Federation** (see full plan in original document)

3. **Migrate incrementally**:
   - Week 1: Talent Pool module
   - Week 2: Job Requests module
   - Week 3: Interviews module

4. **Parallel run**:
   - Run both Copy & Adapt and Module Federation versions
   - A/B test with users
   - Monitor performance metrics

5. **Cutover**:
   - Switch all users to Module Federation
   - Remove copied code from portal
   - Archive Copy & Adapt implementation

**Estimated Timeline**: 3-4 weeks for full migration

---

## Rollback Plan

### If PoC Fails

**Immediate Rollback** (< 1 hour):

```bash
# 1. Remove hiring routes from App.tsx
git checkout HEAD -- frontend/src/App.tsx

# 2. Remove hiring navigation items
git checkout HEAD -- frontend/src/components/Navigation.tsx

# 3. Restart dev server
cd frontend && npm run dev
```

**Complete Rollback** (< 4 hours):

```bash
# 1. Remove all hiring code
rm -rf frontend/src/pages/hiring
rm -rf frontend/src/services/hiring
rm -rf frontend/src/types/hiring
rm -rf frontend/src/hooks/hiring
rm -rf frontend/src/components/hiring

# 2. Remove hiring dependencies
npm uninstall moment moment-timezone formik yup @fullcalendar/react

# 3. Revert vite.config.ts proxy changes
git checkout HEAD -- frontend/vite.config.ts

# 4. Commit rollback
git commit -am "Rollback TMFNUI integration PoC"
git push
```

### Alternative: Keep as Separate App

If integration proves too complex, keep TMFNUI as separate application:

1. Deploy TMFNUI standalone at `https://hiring.teamified.com`
2. Implement SSO between portal and TMFNUI
3. Add navigation link from portal to TMFNUI
4. Share authentication via OAuth/OIDC

---

## Development Workflow

### Running Locally

**Terminal 1: Portal Frontend**
```bash
cd frontend
npm run dev  # Port 5173
```

**Terminal 2: Portal Backend**
```bash
npm run start:dev  # Port 3000
```

**Terminal 3: TMFNUI Backend**
```bash
cd ../TMFNUI/[backend-directory]
npm run start  # Port 4000 (or whatever TMFNUI uses)
```

### Common Commands

```bash
# Install dependencies
cd frontend && npm install

# Run tests
npm run test

# Run E2E tests
npx playwright test

# Lint code
npm run lint

# Type check
npm run type-check

# Build for production
npm run build
```

### Git Workflow

**Branch Strategy**:
```bash
# Create feature branch
git checkout -b feature/tmfnui-integration-poc

# Work in small commits
git commit -m "feat(hiring): copy Job Request module"
git commit -m "feat(hiring): convert Redux to Axios"
git commit -m "feat(hiring): add proxy config"

# Push regularly
git push origin feature/tmfnui-integration-poc

# Create PR when phase complete
```

---

## Documentation Checklist

Before marking PoC complete, document:

- [ ] All TMFNUI backend endpoints used
- [ ] API authentication requirements
- [ ] Environment variables needed
- [ ] Database schema requirements (if any)
- [ ] Deployment instructions
- [ ] Troubleshooting guide
- [ ] Known issues and limitations
- [ ] Future enhancement ideas

---

## Next Steps

1. **Review this plan** with team
2. **Identify TMFNUI backend** (location, tech stack, endpoints)
3. **Start Phase 1** (Preparation)
4. **Weekly check-ins** to review progress
5. **Adjust timeline** based on discoveries

---

## Appendix

### A. File Mapping Reference

| TMFNUI File | Portal Destination |
|-------------|-------------------|
| `src/modules/JobRequest/Container.tsx` | `frontend/src/pages/hiring/JobRequest/Container.tsx` |
| `src/modules/Interview/Interview.tsx` | `frontend/src/pages/hiring/Interview/Interview.tsx` |
| `src/modules/TalentPool/Container.tsx` | `frontend/src/pages/hiring/TalentPool/Container.tsx` |
| `src/redux/Hire/jobRequestApi.ts` | `frontend/src/services/hiring/jobRequestService.ts` |
| `src/shared/components/LayoutV2` | `frontend/src/components/hiring/HiringLayout` |

### B. Dependency Reference

**Required NPM Packages**:
```json
{
  "dependencies": {
    "moment": "^2.29.4",
    "moment-timezone": "^0.5.46",
    "formik": "^2.2.6",
    "yup": "^0.32.8",
    "yup-password": "^0.2.2",
    "@fullcalendar/react": "^6.1.15",
    "@fullcalendar/core": "^6.1.15",
    "@fullcalendar/daygrid": "^6.1.15",
    "react-alert": "^7.0.2",
    "react-alert-template-basic": "^1.0.2",
    "country-state-city": "^3.1.2",
    "jwt-decode": "^3.1.2"
  }
}
```

### C. Estimated Effort Breakdown

| Task | Hours | Days |
|------|-------|------|
| Phase 1: Preparation | 20-25 | 3-4 |
| Phase 2: Module Migration | 40-60 | 6-8 |
| Phase 3: Backend Proxy | 12-16 | 2-3 |
| Phase 4: Integration | 20-30 | 3-4 |
| Phase 5: Testing | 16-24 | 2-3 |
| Documentation | 8-12 | 1-2 |
| **Total** | **116-167** | **17-24** |

**Timeline**: 4-5 weeks with 1 developer working full-time.

---

**Document Version**: 1.0
**Created**: 2025-10-30
**Next Review**: After Phase 1 completion
