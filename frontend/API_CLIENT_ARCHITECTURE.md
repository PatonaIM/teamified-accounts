# API Client Architecture

## Overview

All API requests in the frontend now use a **single, centralized axios instance** with consistent authentication and token refresh logic. This prevents token reuse issues and ensures reliable authentication across the entire application.

## Architecture

### Centralized API Client

**Location:** `frontend/src/services/authService.ts`

The main axios instance is configured with:
- **Request Interceptor:** Automatically adds `Authorization` header with access token
- **Response Interceptor:** Handles 401 errors by refreshing the access token
- **CSRF Token Support:** Adds `X-CSRF-Token` header for mutating requests
- **Token Refresh Logic:** Automatically refreshes expired tokens without logging users out

### Import Pattern

All services import from `frontend/src/services/api.ts`, which re-exports the centralized instance:

```typescript
import api from './api';  // or '../api' depending on location

// Use the centralized client
const response = await api.get('/v1/endpoint');
```

## Updated Services

The following services have been consolidated to use the centralized API client:

✅ **Core Services:**
- `internalInvitationService.ts`
- `apiKeysService.ts`
- `oauthClientsService.ts`
- `employmentService.ts`
- `invitationService.ts`
- `salaryHistoryService.ts`
- `organizationsService.ts`

✅ **Payroll Services:**
- `payroll/payrollService.ts`
- `payroll-admin/payrollAdminService.ts`

✅ **Timesheet Services:**
- `timesheets/timesheetService.ts`

✅ **Hooks:**
- `hooks/useCountry.ts`

## Benefits

1. **Prevents Token Reuse Issues:** Single token refresh mechanism prevents multiple refresh attempts
2. **Consistent Authentication:** All requests use the same authentication logic
3. **Automatic Token Refresh:** Users stay logged in seamlessly when access tokens expire
4. **CSRF Protection:** Built-in CSRF token support for enhanced security
5. **Easier Maintenance:** Changes to auth logic only need to be made in one place

## ⚠️ Important Rules

### DO NOT Create New Axios Instances

**❌ WRONG:**
```typescript
import axios from 'axios';

const myApi = axios.create({
  baseURL: API_BASE_URL,
});

// This bypasses centralized auth!
```

**✅ CORRECT:**
```typescript
import api from './api';  // or '../api'

// Uses centralized auth and token refresh
const response = await api.get('/endpoint');
```

### Always Use the Centralized Client

- Import from `./api` or `../api` (not from `./authService` directly)
- Never create new axios instances with `axios.create()`
- Let the interceptors handle authentication automatically

## Token Refresh Flow

1. User makes API request with expired access token
2. Server returns `401 Unauthorized`
3. Response interceptor catches the error
4. Interceptor calls `/v1/auth/refresh` with refresh token
5. New access token is stored in localStorage
6. Original request is retried with new token
7. User stays logged in seamlessly

## Troubleshooting

### Getting Logged Out Unexpectedly?

- **Cause:** Multiple axios instances causing token reuse detection
- **Solution:** Ensure all services use `import api from './api'`

### 401 Errors Not Being Handled?

- **Cause:** Custom axios instance bypassing the centralized interceptors
- **Solution:** Replace custom instance with centralized client

### Token Refresh Failing?

- **Cause:** Refresh token expired or invalid
- **Solution:** User needs to log out and log in again to get fresh tokens

## Maintenance

When adding new services or API integrations:

1. ✅ Import the centralized client: `import api from './api'`
2. ✅ Use it for all requests: `await api.get('/endpoint')`
3. ❌ DO NOT create new axios instances
4. ❌ DO NOT add custom interceptors

---

**Last Updated:** November 20, 2025  
**Architecture Decision:** Centralized API client to prevent token reuse issues
