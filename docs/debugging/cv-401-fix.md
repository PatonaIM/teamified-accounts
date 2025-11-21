# CV Upload 401 Error - Fixed ✅

## 🎉 **Authentication Issue Resolved**

**Date**: October 17, 2025  
**Issue**: CV management page showing 401 Unauthorized error  
**Status**: ✅ **FIXED AND DEPLOYED**

---

## ❌ The Problem

### Error Seen
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
GET /api/v1/users/me/profile/cv
```

### Root Cause
The `CVPage.tsx` component was using `axios` directly with `withCredentials: true`:

```typescript
// WRONG - No authentication token
import axios from 'axios';

const response = await axios.get(`${API_BASE_URL}/v1/users/me/profile/cv`, {
  withCredentials: true  // ❌ Doesn't include JWT token
});
```

**Why This Failed:**
- The application uses **JWT Bearer token authentication** stored in `localStorage`
- The `axios` calls with `withCredentials: true` are for **cookie-based authentication**
- No `Authorization: Bearer <token>` header was being sent
- Backend received request without authentication → returned 401

---

## ✅ The Solution

### Use Authenticated API Instance
The application already has an authenticated API instance in `authService.ts` that:
- Automatically includes JWT tokens via request interceptors
- Handles token refresh on 401 errors
- Manages CSRF tokens for mutations
- Provides centralized error handling

### Implementation
```typescript
// CORRECT - Uses authenticated API
import api from '../services/authService';

const response = await api.get('/v1/users/me/profile/cv');
// ✅ Automatically includes: Authorization: Bearer <token>
```

---

## 🔧 Changes Made

### File: `frontend/src/pages/CVPage.tsx`

**Before:**
```typescript
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

await axios.get(`${API_BASE_URL}/v1/users/me/profile/cv`, {
  withCredentials: true
});
```

**After:**
```typescript
import api from '../services/authService';

await api.get('/v1/users/me/profile/cv');
```

### All Updated Methods

1. **loadCVs()** - Load CV list
   - Before: `axios.get(..., { withCredentials: true })`
   - After: `api.get('/v1/users/me/profile/cv')`

2. **handleUploadCV()** - Upload new CV
   - Before: `axios.post(..., formData, { withCredentials: true, headers: {...} })`
   - After: `api.post('/v1/users/me/profile/cv', formData, { headers: {...} })`

3. **handleDownloadCV()** - Download CV file
   - Before: `axios.get(..., { withCredentials: true, responseType: 'blob' })`
   - After: `api.get('...', { responseType: 'blob' })`

4. **handleDeleteCV()** - Delete CV
   - Before: `axios.delete(..., { withCredentials: true })`
   - After: `api.delete('/v1/users/me/profile/cv/:id')`

5. **handleSetActive()** - Set current CV
   - Before: `axios.put(..., {}, { withCredentials: true })`
   - After: `api.put('/v1/users/me/profile/cv/:id/set-current', {})`

---

## 🎯 How It Works Now

### Request Flow
```
1. User logs in → JWT tokens stored in localStorage
2. CVPage loads → calls api.get('/v1/users/me/profile/cv')
3. authService interceptor adds: Authorization: Bearer <token>
4. Backend validates JWT → returns CVs
5. CVPage displays CVs ✅
```

### Automatic Token Management
The `api` instance from `authService` provides:

```typescript
// Request Interceptor (adds auth automatically)
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (handles token refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Automatically refresh token and retry request
      const refreshToken = getRefreshToken();
      const response = await refreshAccessToken(refreshToken);
      setAccessToken(response.data.accessToken);
      return api(originalRequest); // Retry with new token
    }
    return Promise.reject(error);
  }
);
```

---

## ✅ Benefits

### Consistency
- ✅ All API calls use the same authenticated instance
- ✅ Consistent auth handling across the application
- ✅ Same pattern as other pages (JobsPage, ProfilePage, etc.)

### Automatic Features
- ✅ JWT token automatically included in every request
- ✅ Token refresh on expiration (no manual logout)
- ✅ CSRF protection for mutations
- ✅ Centralized error handling
- ✅ Request/response logging

### Maintenance
- ✅ Single source of truth for API configuration
- ✅ Easy to update auth logic in one place
- ✅ Consistent error messages
- ✅ Type-safe with TypeScript

---

## 🧪 Testing

### Verification Steps
1. ✅ Login as any user (candidate, EOR, admin)
2. ✅ Navigate to CV Management page
3. ✅ Page loads without 401 error
4. ✅ Existing CVs display correctly
5. ✅ Upload a new CV → Success
6. ✅ Download CV → Works
7. ✅ Delete CV → Works
8. ✅ Set current CV → Works

### Console Output (Before)
```
❌ Failed to load resource: 401 (Unauthorized)
❌ Failed to load CVs: Request failed with status code 401
```

### Console Output (After)
```
✅ GET /api/v1/users/me/profile/cv 200 OK
✅ CVs loaded successfully
```

---

## 📊 Technical Details

### Authentication Method
- **Type**: JWT Bearer Token
- **Storage**: localStorage (not cookies)
- **Header**: `Authorization: Bearer <token>`
- **Token Location**: `teamified_access_token` key
- **Refresh**: Automatic via interceptors

### Key Differences

| Aspect | `axios` + `withCredentials` | `api` from `authService` |
|--------|----------------------------|--------------------------|
| **Auth Type** | Cookie-based | JWT Bearer token |
| **Token Storage** | HttpOnly cookies | localStorage |
| **Header** | None (uses cookies) | `Authorization: Bearer <token>` |
| **Token Refresh** | Manual | Automatic |
| **CSRF Protection** | Via cookies | Via `X-CSRF-Token` header |
| **Usage** | ❌ Wrong for this app | ✅ Correct |

---

## 🔍 Related Files

### Files Modified
- `frontend/src/pages/CVPage.tsx` - Fixed API calls

### Files Using Correct Pattern
- `frontend/src/services/authService.ts` - Defines `api` instance
- `frontend/src/pages/JobsPage.tsx` - Uses `api` correctly
- `frontend/src/pages/JobApplicationPage.tsx` - Uses `api` correctly
- `frontend/src/components/jobs/CVSelection.tsx` - Uses `api` correctly

---

## 📝 Lessons Learned

### 1. Use the Right Auth Method
- **Cookie Auth**: `withCredentials: true` with `axios`
- **JWT Auth**: `Authorization: Bearer` header with `api`
- ❌ Don't mix them!

### 2. Reuse Existing Patterns
- Check how other pages make authenticated API calls
- Use the same pattern for consistency
- Don't reinvent the wheel

### 3. Leverage Interceptors
- Request interceptors add auth automatically
- Response interceptors handle errors globally
- No need to add auth headers manually

---

## 🎉 Summary

**The 401 Unauthorized error is now fixed!**

The CV management page now:
- ✅ Uses the authenticated `api` instance
- ✅ Automatically includes JWT tokens
- ✅ Handles token refresh seamlessly
- ✅ Works consistently with the rest of the app
- ✅ Provides a smooth user experience

All CRUD operations (Create, Read, Update, Delete) for CVs are working correctly with proper authentication.

---

**Fixed By**: Switching from `axios` to authenticated `api` instance  
**Impact**: CV management fully functional with authentication  
**Status**: ✅ **DEPLOYED AND READY FOR USE**  
**Next**: Continue with job application workflow testing

