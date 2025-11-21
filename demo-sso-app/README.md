# Demo SSO App

This is a minimal example showing how to integrate Supabase SSO with the Teamified Portal **using the shared `@teamified/sso` package**.

## Features

- ✅ Google OAuth sign-in via Supabase
- ✅ Automatic SSO across all apps
- ✅ Token exchange with Portal for RBAC
- ✅ Role-based access control from Portal
- ✅ Automatic session management
- ✅ **Uses `@teamified/sso` package** (no code duplication!)

## Setup

### 1. Install Dependencies

```bash
npm install @teamified/sso @supabase/supabase-js axios react react-dom react-router-dom
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_PORTAL_API_URL=https://your-portal-backend.vercel.app/api
```

### 3. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:

```
http://localhost:5173/auth/callback
https://your-app.repl.co/auth/callback
```

### 4. Run Development Server

```bash
npm run dev
```

## How It Works

1. **User clicks "Continue with Google"**
   - Redirects to Supabase Google OAuth
   
2. **After Google authentication**
   - Redirected to `/auth/callback`
   - Supabase token exchanged for Portal JWT
   - Portal JWT includes user roles from Portal database
   
3. **User redirected to dashboard**
   - Shows user info with roles
   - Portal JWT stored in localStorage

4. **SSO Magic** ✨
   - Open another app with SSO
   - User automatically logged in
   - No re-authentication needed!

## Testing SSO

### Test 1: Login Here, Open Portal

1. Login to this demo app
2. Open Teamified Portal in new tab
3. **Expected:** Automatically logged in

### Test 2: Login to Portal, Open Here

1. Login to Teamified Portal
2. Open this demo app in new tab
3. **Expected:** Automatically logged in

### Test 3: Logout Propagation

1. Logout from this app
2. Refresh Portal tab
3. **Expected:** Logged out everywhere

## File Structure

```
demo-sso-app/
├── src/
│   ├── auth.ts                  # Auth client using @teamified/sso
│   ├── components/
│   │   └── LoginButton.tsx      # Login component
│   ├── pages/
│   │   ├── AuthCallback.tsx     # OAuth callback handler
│   │   └── Dashboard.tsx        # Protected dashboard
│   └── App.tsx                  # Routes
├── .env.example                 # Environment template
├── package.json
└── README.md
```

**Note:** The `src/config/` and `src/services/` folders shown in code are **legacy examples**. 
Modern integration uses the `@teamified/sso` package instead!

## Integration Checklist (Using Shared Package)

To integrate SSO into your own Replit app:

- [ ] Install `@teamified/sso` package
- [ ] Create `src/auth.ts` with `createTeamifiedAuth()`
- [ ] Add login button using `auth.signInWithGoogle()`
- [ ] Add `/auth/callback` route with `auth.handleCallback()`
- [ ] Update Supabase redirect URLs (dev + prod)
- [ ] Set environment variables (separate for dev/prod)
- [ ] Choose storage strategy (SessionStorage recommended)
- [ ] Test SSO flow
- [ ] Review security: `docs/multi-app-deployment.md`

## Need Help?

See the full integration guide: `docs/multi-app-sso-guide.md`

## Next Steps

1. Deploy this demo to Replit
2. Test SSO with Portal
3. Integrate SSO into your 3 internal apps using this as a template
4. Verify SSO works across all 4 applications
