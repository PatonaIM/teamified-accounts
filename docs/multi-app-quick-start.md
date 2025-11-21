# Multi-App SSO Quick Start

## What You've Built

✅ **Portal** - Fully integrated with Supabase Google OAuth  
✅ **SSO Infrastructure** - Ready for 3 additional apps  
✅ **Demo App** - Complete working example  

## For Your 3 Internal Replit Apps

### Step 1: Install Shared SSO Package (1 minute)

```bash
npm install @teamified/sso @supabase/supabase-js axios
```

**Why a shared package?**
- ✅ No code duplication across apps
- ✅ Consistent authentication logic
- ✅ Built-in secure storage strategies
- ✅ Easy updates via `npm update`

### Step 2: Initialize Auth Client (2 minutes)

Create `src/auth.ts`:

```typescript
import { createTeamifiedAuth, SessionStorageStrategy } from '@teamified/sso';

export const auth = createTeamifiedAuth({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  portalApiUrl: import.meta.env.VITE_PORTAL_API_URL!,
  tokenStorage: new SessionStorageStrategy(), // Recommended for production
});
```

### Step 3: Add Environment Variables (2 minutes)

In Replit Secrets (🔒 icon):

**Development:**
```
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key-here
VITE_PORTAL_API_URL=https://teamified-portal.username.repl.co/api
```

**Production:**
```
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key-here
VITE_PORTAL_API_URL=https://portal.teamified.com/api
```

⚠️ **Important:** Use separate Supabase projects for dev and prod!

### Step 4: Add Login Button (3 minutes)

```typescript
import { auth } from './auth';

// In your login page component
<button onClick={() => auth.signInWithGoogle()}>
  Continue with Google
</button>
```

### Step 5: Add OAuth Callback Handler (5 minutes)

Create `src/pages/AuthCallback.tsx`:

```typescript
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../auth';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    auth.handleCallback()
      .then(() => navigate('/dashboard'))
      .catch(() => navigate('/login'));
  }, [navigate]);

  return <div>Completing sign-in...</div>;
};
```

Add route to `App.tsx`:
```typescript
<Route path="/auth/callback" element={<AuthCallback />} />
```

### Step 6: Update Supabase Redirect URLs (2 minutes)

Go to Supabase Dashboard → Authentication → URL Configuration

Add for each app:
```
https://app1-name.username.repl.co/auth/callback
https://app2-name.username.repl.co/auth/callback
https://app3-name.username.repl.co/auth/callback
```

### Step 7: Test! (5 minutes)

1. Login to Portal → Open your app → **Should be auto-logged in!**
2. Login to your app → Open Portal → **Should be auto-logged in!**
3. Logout from any app → **Logged out everywhere!**

**Total Time: ~25 minutes per app**

## What Happens Behind the Scenes

```
User clicks "Login with Google"
    ↓
Supabase handles OAuth
    ↓
Redirects to /auth/callback
    ↓
App exchanges Supabase token for Portal JWT
    ↓
Portal JWT includes roles from Portal DB
    ↓
User logged in with full RBAC!
```

## SSO Magic ✨

Once logged in to ANY app:
- **Portal** remembers you
- **App 1** remembers you
- **App 2** remembers you  
- **App 3** remembers you

All share the same Supabase session automatically!

## Accessing User Data with Roles

```typescript
import { auth } from './auth';

const user = await auth.getCurrentUser();
console.log(user.userRoles); // [{ roleType: 'candidate', scope: 'all' }, ...]

// Check permissions
if (user.userRoles.some(r => r.roleType === 'admin')) {
  // Show admin features
}
```

## Making API Calls to Portal

```typescript
import axios from 'axios';

const token = localStorage.getItem('teamified_access_token');

const response = await axios.get('https://portal-api.vercel.app/api/v1/users/me', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Troubleshooting

### "Supabase is not configured" Error
**Fix:** Add environment variables to Replit Secrets

### SSO not working across apps
**Fix:** Make sure all apps use the same Supabase project

### User has no roles
**Fix:** Roles are managed in Portal admin panel, not Supabase

### Redirect URL mismatch
**Fix:** Update Supabase redirect URLs when you rename Repls

## Production Checklist

- [ ] All 3 apps have Supabase SDK installed
- [ ] Environment variables set in Replit Secrets
- [ ] Redirect URLs configured for all apps
- [ ] Test SSO flow between all apps
- [ ] Test logout propagation
- [ ] Monitor Portal `/v1/auth/supabase/exchange` endpoint

## Need More Details?

See: `docs/multi-app-sso-guide.md` for complete integration guide

## Demo App

Check `demo-sso-app/` folder for a complete working example!
