# TMFNUI Integration - Implementation Tracker

**Status**: Not Started
**Start Date**: TBD
**Target Completion**: TBD (4-5 weeks from start)
**Last Updated**: 2025-10-30

---

## Phase Completion

| Phase | Status | Start Date | End Date | Notes |
|-------|--------|------------|----------|-------|
| Phase 1: Preparation | ⬜ Not Started | - | - | |
| Phase 2: Module Migration | ⬜ Not Started | - | - | |
| Phase 3: Backend Proxy | ⬜ Not Started | - | - | |
| Phase 4: Integration | ⬜ Not Started | - | - | |
| Phase 5: Testing | ⬜ Not Started | - | - | |

**Legend**: ⬜ Not Started | 🔄 In Progress | ✅ Complete | ⚠️ Blocked

---

## Phase 1: Preparation (3-4 days)

### 1.1 Environment Setup

- [ ] Verify TMFNUI project location (`../TMFNUI/tmf-frontend/`)
- [ ] Verify Node.js version (18+)
- [ ] Install portal dependencies (`cd frontend && npm install`)
- [ ] Portal runs without errors (`npm run start:dev`)

### 1.2 Install New Dependencies

- [ ] Install date/time libraries
  ```bash
  npm install moment moment-timezone
  ```
- [ ] Install form libraries
  ```bash
  npm install formik yup yup-password
  ```
- [ ] Install calendar library
  ```bash
  npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid
  ```
- [ ] Install alert library
  ```bash
  npm install react-alert react-alert-template-basic
  ```
- [ ] Install utilities
  ```bash
  npm install country-state-city jwt-decode
  ```
- [ ] Install TypeScript types
  ```bash
  npm install --save-dev @types/react-alert
  ```

### 1.3 TMFNUI Backend Analysis

- [ ] Locate TMFNUI backend directory
  - Location: `_________________________`
  - Tech Stack: `_________________________`

- [ ] Start TMFNUI backend locally
  - Port: `_________________________`
  - API Prefix: `_________________________`
  - Base URL: `_________________________`

- [ ] Document API endpoints
  - [ ] Job Requests endpoints: `_________________________`
  - [ ] Interviews endpoints: `_________________________`
  - [ ] Talent Pool endpoints: `_________________________`

- [ ] Document authentication
  - Token type: `_________________________`
  - Token storage: `_________________________`
  - Token header: `_________________________`

### 1.4 Create Directory Structure

- [ ] Create hiring pages directories
  ```bash
  mkdir -p frontend/src/pages/hiring/{JobRequest,Interview,TalentPool}
  ```
- [ ] Create hiring services directory
  ```bash
  mkdir -p frontend/src/services/hiring
  ```
- [ ] Create hiring types directory
  ```bash
  mkdir -p frontend/src/types/hiring
  ```
- [ ] Create hiring hooks directory
  ```bash
  mkdir -p frontend/src/hooks/hiring
  ```
- [ ] Create hiring components directory
  ```bash
  mkdir -p frontend/src/components/hiring
  ```

### 1.5 File Inventory

- [ ] Create inventory script (`scripts/tmfnui-inventory.sh`)
- [ ] Run inventory to list all files to copy
- [ ] Document shared components needed
- [ ] Document Redux API files needed

**Phase 1 Complete**: [ ] Yes / [ ] No

---

## Phase 2: Module Migration (1-2 weeks)

### 2.1 Copy Source Files

**Job Request Module**:
- [ ] Copy module files
  ```bash
  cp -r ../../../TMFNUI/tmf-frontend/src/modules/JobRequest/* \
    frontend/src/pages/hiring/JobRequest/
  ```
- [ ] Verify all files copied (count: _____ files)
- [ ] Test module loads (may have errors, that's OK)

**Interview Module**:
- [ ] Copy module files
  ```bash
  cp -r ../../../TMFNUI/tmf-frontend/src/modules/Interview/* \
    frontend/src/pages/hiring/Interview/
  ```
- [ ] Verify all files copied (count: _____ files)
- [ ] Test module loads

**Talent Pool Module**:
- [ ] Copy module files
  ```bash
  cp -r ../../../TMFNUI/tmf-frontend/src/modules/TalentPool/* \
    frontend/src/pages/hiring/TalentPool/
  ```
- [ ] Verify all files copied (count: _____ files)
- [ ] Test module loads

### 2.2 Copy Shared Components

- [ ] Copy Layout component
  ```bash
  cp -r ../../../TMFNUI/tmf-frontend/src/shared/components/LayoutV2 \
    frontend/src/components/hiring/HiringLayout
  ```
- [ ] Copy Header component
  ```bash
  cp -r ../../../TMFNUI/tmf-frontend/src/shared/components/CommonPageHeader \
    frontend/src/components/hiring/HiringHeader
  ```
- [ ] Copy Breadcrumbs
  ```bash
  cp ../../../TMFNUI/tmf-frontend/src/modules/JobRequest/JobBreadcrumbs.tsx \
    frontend/src/components/hiring/
  ```
- [ ] Copy other shared components as needed
  - [ ] `_________________________`
  - [ ] `_________________________`

### 2.3 Create Service Layer (Convert Redux to Axios)

**Job Request Service**:
- [ ] Create `services/hiring/jobRequestService.ts`
- [ ] Implement `getJobRequests()`
- [ ] Implement `getJobRequestById()`
- [ ] Implement `createJobRequest()`
- [ ] Implement `updateJobRequest()`
- [ ] Implement `deleteJobRequest()`
- [ ] Test service methods

**Interview Service**:
- [ ] Create `services/hiring/interviewService.ts`
- [ ] Implement interview methods
- [ ] Test service methods

**Talent Pool Service**:
- [ ] Create `services/hiring/talentPoolService.ts`
- [ ] Implement talent pool methods
- [ ] Test service methods

### 2.4 Create React Hooks

**Job Request Hooks**:
- [ ] Create `hooks/hiring/useJobRequests.ts`
- [ ] Implement `useJobRequests()` hook
- [ ] Implement `useJobRequest()` hook
- [ ] Implement `useCreateJobRequest()` hook
- [ ] Implement `useUpdateJobRequest()` hook
- [ ] Test hooks

**Interview Hooks**:
- [ ] Create `hooks/hiring/useInterviews.ts`
- [ ] Implement interview hooks
- [ ] Test hooks

**Talent Pool Hooks**:
- [ ] Create `hooks/hiring/useTalentPool.ts`
- [ ] Implement talent pool hooks
- [ ] Test hooks

### 2.5 Update Component Imports

**Job Request Components**:
- [ ] Update Redux imports to use new hooks
- [ ] Update shared component imports
- [ ] Update utility imports
- [ ] Fix TypeScript errors
- [ ] Test components render

**Interview Components**:
- [ ] Update imports
- [ ] Fix TypeScript errors
- [ ] Test components render

**Talent Pool Components**:
- [ ] Update imports
- [ ] Fix TypeScript errors
- [ ] Test components render

### 2.6 Create Type Definitions

- [ ] Create `types/hiring/jobRequest.types.ts`
- [ ] Create `types/hiring/interview.types.ts`
- [ ] Create `types/hiring/candidate.types.ts`
- [ ] Export all types from `types/hiring/index.ts`

### 2.7 MUI v5 to v7 Migration

- [ ] Identify all `makeStyles` usage
- [ ] Convert to `sx` prop or styled components
- [ ] Update deprecated `@mui/styles` imports
- [ ] Update DataGrid props (if used)
- [ ] Update DatePicker imports
- [ ] Test styling matches original

**Phase 2 Complete**: [ ] Yes / [ ] No

---

## Phase 3: Backend Proxy (2-3 days)

### 3.1 Configure Vite Proxy

- [ ] Update `frontend/vite.config.ts`
- [ ] Add `/hiring-api` proxy configuration
- [ ] Configure proxy rewrite rules
- [ ] Add request/response logging
- [ ] Test proxy works (check browser network tab)

### 3.2 Environment Variables

- [ ] Create/update `.env.development`
  - [ ] Add `VITE_HIRING_API_URL=/hiring-api`
  - [ ] Add `VITE_HIRING_BACKEND_URL=http://localhost:4000`

- [ ] Create/update `.env.production`
  - [ ] Add production hiring API URL
  - [ ] Add production backend URL

### 3.3 Authentication Bridge

- [ ] Create `services/hiring/authBridge.ts`
- [ ] Implement `setupInterceptors()` method
- [ ] Add request interceptor (attach token)
- [ ] Add response interceptor (handle 401)
- [ ] Initialize in `App.tsx`
- [ ] Test token is sent to hiring backend

### 3.4 Test Backend Integration

- [ ] Start all services (portal frontend, portal backend, TMFNUI backend)
- [ ] Test API call from portal to hiring backend
- [ ] Verify authentication works
- [ ] Check browser console for errors
- [ ] Check network tab for correct URLs

**Phase 3 Complete**: [ ] Yes / [ ] No

---

## Phase 4: Integration (1 week)

### 4.1 Add Routes

- [ ] Update `frontend/src/App.tsx`
- [ ] Add Job Requests route (`/hiring/jobs/*`)
- [ ] Add Interviews route (`/hiring/interviews/*`)
- [ ] Add Talent Pool route (`/hiring/talent-pool/*`)
- [ ] Wrap routes with `ProtectedRoute` (admin, hr roles)
- [ ] Add Suspense with loading spinner
- [ ] Test routes navigate correctly

### 4.2 Add Navigation Items

- [ ] Update navigation component (e.g., `Navigation.tsx`)
- [ ] Add "Hiring" menu section
- [ ] Add "Job Requests" menu item
- [ ] Add "Interviews" menu item
- [ ] Add "Talent Pool" menu item
- [ ] Configure role-based visibility (admin, hr)
- [ ] Test navigation items appear for correct roles

### 4.3 Theme Integration

- [ ] Create `components/hiring/HiringThemeProvider.tsx`
- [ ] Wrap hiring routes with theme provider
- [ ] Test styling matches portal theme
- [ ] Fix any style conflicts

### 4.4 Role-Based Access Control

- [ ] Verify RBAC enforced on routes
- [ ] Test admin can access all hiring features
- [ ] Test HR can access all hiring features
- [ ] Test EOR user cannot access hiring features
- [ ] Test unauthorized redirect works

### 4.5 Integration Testing

- [ ] Login as admin user
- [ ] Navigate to Job Requests
- [ ] Navigate to Interviews
- [ ] Navigate to Talent Pool
- [ ] Test back button works
- [ ] Test breadcrumbs work
- [ ] Test logout clears hiring session

**Phase 4 Complete**: [ ] Yes / [ ] No

---

## Phase 5: Testing (3-4 days)

### 5.1 Unit Testing

**Service Tests**:
- [ ] Test `jobRequestService.ts`
- [ ] Test `interviewService.ts`
- [ ] Test `talentPoolService.ts`

**Hook Tests**:
- [ ] Test `useJobRequests.ts`
- [ ] Test `useInterviews.ts`
- [ ] Test `useTalentPool.ts`

**Component Tests** (optional):
- [ ] Test key Job Request components
- [ ] Test key Interview components
- [ ] Test key Talent Pool components

### 5.2 Manual Testing - Job Requests

- [ ] View job requests list
- [ ] Filter by status (open/closed)
- [ ] Filter by recruiter
- [ ] Search by job title
- [ ] Create new job request
- [ ] Edit existing job request
- [ ] Delete job request
- [ ] View job timeline
- [ ] Navigate through job stages

### 5.3 Manual Testing - Interviews

- [ ] View interviews calendar
- [ ] Switch between calendar and list view
- [ ] Navigate by week (prev/next)
- [ ] Book timeslot for interview
- [ ] Reschedule interview
- [ ] View interview details
- [ ] Filter by interviewer
- [ ] Create new interview

### 5.4 Manual Testing - Talent Pool

- [ ] View candidate cards
- [ ] Search candidates
- [ ] Filter candidates by skills
- [ ] Filter by experience range
- [ ] View candidate details
- [ ] Assign candidate to job
- [ ] View application history
- [ ] View candidate resume
- [ ] Add comments to candidate

### 5.5 Integration Testing

**Authentication**:
- [ ] Login with portal credentials works
- [ ] Token passed to TMFNUI backend
- [ ] Logout clears hiring session
- [ ] Session timeout handled

**Navigation**:
- [ ] Hiring menu visible for admin/hr
- [ ] Hiring menu hidden for EOR users
- [ ] Navigation between portal and hiring smooth
- [ ] Breadcrumbs work correctly
- [ ] Back button works

**Styling**:
- [ ] Hiring pages match portal theme
- [ ] No style conflicts
- [ ] Responsive on mobile/tablet
- [ ] MUI components render correctly

**Error Handling**:
- [ ] API errors show user-friendly messages
- [ ] Network errors handled gracefully
- [ ] 404 errors redirect appropriately
- [ ] Validation errors show inline

### 5.6 E2E Testing (Playwright)

- [ ] Write E2E test for Job Requests flow
- [ ] Write E2E test for Interviews flow
- [ ] Write E2E test for Talent Pool flow
- [ ] Run all E2E tests
- [ ] Fix any failing tests

### 5.7 Performance Testing

- [ ] Measure initial page load time (target: < 3s)
- [ ] Measure API response time (target: < 1s)
- [ ] Measure calendar rendering (target: < 500ms)
- [ ] Measure search results (target: < 500ms)
- [ ] Check for memory leaks
- [ ] Run Lighthouse audit (target: > 90)

### 5.8 Code Quality

- [ ] Run TypeScript type check (`npm run type-check`)
- [ ] Run linter (`npm run lint`)
- [ ] Fix all linting errors
- [ ] Format code (`npm run format`)
- [ ] Run accessibility audit
- [ ] Fix accessibility violations

**Phase 5 Complete**: [ ] Yes / [ ] No

---

## Success Criteria

### Functional Requirements
- [ ] All 3 hiring modules accessible from portal
- [ ] CRUD operations work for all modules
- [ ] Filtering, searching, sorting work
- [ ] Authentication seamless
- [ ] Role-based access control enforced
- [ ] No broken functionality from TMFNUI

### Technical Requirements
- [ ] No console errors in browser
- [ ] All TypeScript errors resolved
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Code linted and formatted
- [ ] No accessibility violations

### Performance Requirements
- [ ] Initial load < 3s on 3G
- [ ] Page transitions < 500ms
- [ ] API calls < 1s response time
- [ ] Lighthouse score > 90
- [ ] No memory leaks

### User Experience Requirements
- [ ] Hiring pages match portal design
- [ ] Navigation intuitive
- [ ] Error messages clear
- [ ] Loading states indicate progress
- [ ] Mobile responsive

---

## Known Issues

| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
| | | | |
| | | | |

**Severity**: 🔴 Blocker | 🟡 Major | 🟢 Minor

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] TMFNUI backend deployed (if needed)

### Deployment
- [ ] Deploy to staging
- [ ] Test in staging environment
- [ ] Get stakeholder approval
- [ ] Deploy to production
- [ ] Verify production deployment

### Post-Deployment
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Document any issues

---

## Post-PoC Next Steps

- [ ] Stabilize PoC (2-4 weeks of usage)
- [ ] Collect user feedback
- [ ] Decide: Continue with Copy & Adapt or migrate to Module Federation?
- [ ] Document lessons learned
- [ ] Update integration plan based on learnings

---

## Notes & Observations

**Challenges Encountered**:
-
-
-

**Unexpected Findings**:
-
-
-

**Performance Observations**:
-
-
-

**User Feedback**:
-
-
-

---

## Team

| Role | Name | Responsibilities |
|------|------|-----------------|
| Developer | | Implementation |
| QA | | Testing |
| DevOps | | Deployment |
| Product Owner | | Approval |

---

**Last Updated**: 2025-10-30
**Next Review**: End of each phase
