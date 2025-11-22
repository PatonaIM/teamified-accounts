# Google OAuth Redirect URL Configuration

## Issue
When users sign in with "Continue with Google", they are redirected to `localhost:3000` instead of your Replit Preview or Published App URL.

## Root Cause
The redirect URLs need to be configured in **two places**:
1. **Supabase Project Settings** - Site URL and Redirect URLs
2. **Google Cloud Console** - Authorized redirect URIs

## Solution

### Step 1: Get Your Current Replit URLs

Run this command in the Replit Shell to get your current domain:
```bash
echo "Dev URL: https://$REPLIT_DEV_DOMAIN/auth/callback"
```

For your **published app**, the URL will be:
```
https://<your-app-name>.replit.app/auth/callback
```

### Step 2: Configure Supabase

1. Go to your **Supabase Project Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following:

   **Site URL:**
   ```
   https://fca135f3-3e06-45b7-9e80-71c2e3ce4fa3-00-dp0qq5qhxli0.pike.replit.dev
   ```
   *(Use your actual Replit domain from Step 1)*

   **Redirect URLs** (add all of these):
   ```
   https://fca135f3-3e06-45b7-9e80-71c2e3ce4fa3-00-dp0qq5qhxli0.pike.replit.dev/auth/callback
   https://fca135f3-3e06-45b7-9e80-71c2e3ce4fa3-00-dp0qq5qhxli0.pike.replit.dev/**
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
   *(Add your published domain when you deploy)*

4. Click **Save**

### Step 3: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your **OAuth 2.0 Client ID** (the one used for Supabase)
4. Under **Authorized redirect URIs**, add:

   ```
   https://fca135f3-3e06-45b7-9e80-71c2e3ce4fa3-00-dp0qq5qhxli0.pike.replit.dev/auth/callback
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
   
   **Important:** Replace `<your-supabase-project-id>` with your actual Supabase project ID.

5. Click **Save**

### Step 4: When You Publish Your App

When you publish to production:

1. Add your published domain to **Supabase Redirect URLs**:
   ```
   https://<your-app-name>.replit.app/auth/callback
   ```

2. Add your published domain to **Google Cloud Console Authorized Redirect URIs**:
   ```
   https://<your-app-name>.replit.app/auth/callback
   ```

## Testing

After configuration:
1. Clear your browser cache and cookies
2. Go to your login page
3. Click "Continue with Google"
4. You should be redirected back to your Replit app (not localhost:3000)

## Troubleshooting

**Still redirecting to localhost:3000?**
- Wait 5-10 minutes for Google OAuth changes to propagate
- Make sure you saved changes in both Supabase and Google Cloud Console
- Clear browser cache and try in an incognito window
- Check that the Supabase project ID matches in all URLs

**Error: "redirect_uri_mismatch"?**
- The URL in Google Cloud Console must **exactly match** what Supabase sends
- Include the Supabase callback URL: `https://<project-id>.supabase.co/auth/v1/callback`
- Check for typos in your domain names

## Current Application URLs

Your frontend code is **already configured correctly** to use dynamic URLs:
```typescript
redirectTo: `${window.location.origin}/auth/callback`
```

This automatically uses:
- **Development:** `https://fca135f3-3e06-45b7-9e80-71c2e3ce4fa3-00-dp0qq5qhxli0.pike.replit.dev/auth/callback`
- **Production:** `https://<your-app-name>.replit.app/auth/callback`
- **Local:** `http://localhost:3000/auth/callback` (for testing)

The issue is purely in the external OAuth provider configuration (Supabase + Google Cloud).
