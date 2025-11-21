# Multi-App SSO Deployment Guide

## Production Architecture

```
┌──────────────────────────────────────────────┐
│           Supabase Production Project         │
│                                               │
│  - Google OAuth configured                    │
│  - Production redirect URLs                   │
│  - Rate limiting enabled                      │
│  - Email verification enforced                │
└──────────────────────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ App 1  │      │ App 2  │      │ App 3  │
    │ (Prod) │      │ (Prod) │      │ (Prod) │
    └────────┘      └────────┘      └────────┘
         │                │                │
         └────────────────┴────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   Portal Production    │
            │   (RBAC Source)        │
            └────────────────────────┘
```

## Environment Separation

### Recommended: 2-Environment Setup

| Environment | Purpose | Supabase Project | Apps |
|------------|---------|------------------|------|
| **Development** | Testing, dev work | `teamified-dev` | `*.username.repl.co` |
| **Production** | Live users | `teamified-prod` | Custom domains |

### Option: 3-Environment Setup (Enterprise)

| Environment | Purpose | Supabase Project | Apps |
|------------|---------|------------------|------|
| **Development** | Local dev | `teamified-dev` | `localhost:*` |
| **Staging** | Pre-production testing | `teamified-staging` | `staging-*.repl.co` |
| **Production** | Live users | `teamified-prod` | Custom domains |

## Supabase Project Setup

### Development Project

**Create:** `teamified-dev`

**Redirect URLs:**
```
# Localhost (local dev)
http://localhost:5000/auth/callback
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
http://localhost:5175/auth/callback

# Replit dev URLs
https://teamified-portal.username.repl.co/auth/callback
https://app1-name.username.repl.co/auth/callback
https://app2-name.username.repl.co/auth/callback
https://app3-name.username.repl.co/auth/callback
```

**Settings:**
- Email confirmation: Optional (faster dev)
- Rate limiting: Relaxed
- Test users allowed

### Production Project

**Create:** `teamified-prod`

**Redirect URLs:**
```
# Production custom domains
https://portal.teamified.com/auth/callback
https://app1.teamified.com/auth/callback
https://app2.teamified.com/auth/callback
https://app3.teamified.com/auth/callback

# Fallback Replit URLs (if no custom domain)
https://teamified-portal-prod.username.repl.co/auth/callback
https://app1-prod.username.repl.co/auth/callback
https://app2-prod.username.repl.co/auth/callback
https://app3-prod.username.repl.co/auth/callback
```

**Settings:**
- ✅ Email confirmation: REQUIRED
- ✅ Rate limiting: Strict (30 req/hour)
- ✅ CAPTCHA enabled (Cloudflare Turnstile)
- ❌ Test users: Disabled

## Custom Domain Setup (Recommended for Production)

### Step 1: Configure Replit Custom Domain

For each app (Portal, App1, App2, App3):

1. Open Repl → "Domains" tab
2. Click "Link custom domain"
3. Enter domain (e.g., `portal.teamified.com`)
4. Add DNS records:
   ```
   Type: CNAME
   Name: portal
   Value: your-repl-id.repl.co
   ```

### Step 2: Update Supabase Redirect URLs

Add custom domains to Supabase production project:
```
https://portal.teamified.com/auth/callback
https://app1.teamified.com/auth/callback
https://app2.teamified.com/auth/callback
https://app3.teamified.com/auth/callback
```

### Step 3: Update App Environment Variables

```env
# Production .env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_PORTAL_API_URL=https://portal.teamified.com/api
```

## Environment Variable Management

### Development (.env.development)

```env
# Supabase Development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key

# Portal Development
VITE_PORTAL_API_URL=https://teamified-portal.username.repl.co/api
```

### Production (Replit Secrets)

**Portal:**
```env
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
SUPABASE_JWT_SECRET=prod-jwt-secret
REDIS_URL=redis://production-redis.url
```

**Apps (App1, App2, App3):**
```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_PORTAL_API_URL=https://portal.teamified.com/api
```

## Deployment Checklist

### Portal Deployment

- [ ] Environment variables set in Replit Secrets
- [ ] Custom domain configured (if applicable)
- [ ] Redis/Vercel KV configured for production
- [ ] Rate limiting configured (20 req/60s)
- [ ] Supabase redirect URLs updated
- [ ] Test OAuth login flow
- [ ] Test token exchange endpoint
- [ ] Monitor `/v1/auth/supabase/exchange` endpoint

### App Deployment (Each App)

- [ ] Install `@teamified/sso` package
- [ ] Environment variables set in Replit Secrets
- [ ] Custom domain configured (if applicable)
- [ ] Supabase redirect URLs updated
- [ ] OAuth callback route configured
- [ ] Test SSO from Portal → App
- [ ] Test SSO from App → Portal
- [ ] Test logout propagation

## Security Hardening for Production

### 1. Token Storage Strategy

**Development:**
```typescript
import { createTeamifiedAuth, LocalStorageStrategy } from '@teamified/sso';

const auth = createTeamifiedAuth({
  ...config,
  tokenStorage: new LocalStorageStrategy(), // OK for dev
});
```

**Production (Recommended):**
```typescript
import { createTeamifiedAuth, SessionStorageStrategy } from '@teamified/sso';

const auth = createTeamifiedAuth({
  ...config,
  tokenStorage: new SessionStorageStrategy(), // Better security
});
```

**High Security Apps:**
```typescript
import { createTeamifiedAuth, MemoryStorageStrategy } from '@teamified/sso';

const auth = createTeamifiedAuth({
  ...config,
  tokenStorage: new MemoryStorageStrategy(), // Most secure
});
```

### 2. HTTP-Only Cookie Pattern (Advanced)

For maximum security, implement server-side token exchange:

**Backend Route:**
```typescript
// app-backend/routes/auth.ts
app.post('/auth/exchange', async (req, res) => {
  const { supabaseToken } = req.body;
  
  // Exchange with Portal
  const response = await axios.post('https://portal.teamified.com/api/v1/auth/supabase/exchange', {
    supabaseAccessToken: supabaseToken
  });
  
  // Set HTTP-only cookies
  res.cookie('access_token', response.data.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 900000 // 15 minutes
  });
  
  res.cookie('refresh_token', response.data.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 2592000000 // 30 days
  });
  
  res.json({ success: true });
});
```

**Frontend:**
```typescript
// No tokens in localStorage!
await fetch('/auth/exchange', {
  method: 'POST',
  body: JSON.stringify({ supabaseToken }),
  credentials: 'include' // Send cookies
});
```

### 3. CORS Configuration

**Portal Backend:**
```typescript
// src/main.ts
app.enableCors({
  origin: [
    'https://portal.teamified.com',
    'https://app1.teamified.com',
    'https://app2.teamified.com',
    'https://app3.teamified.com',
  ],
  credentials: true,
});
```

### 4. Rate Limiting

Already implemented in Portal:
- `/v1/auth/supabase/exchange`: 20 req/60s per IP
- Prevents token exchange abuse

## Monitoring & Observability

### Key Metrics to Track

1. **Token Exchange Success Rate**
   - Monitor `/v1/auth/supabase/exchange` endpoint
   - Alert on success rate < 95%

2. **SSO Session Duration**
   - Track how long users stay logged in
   - Identify refresh token issues

3. **Failed Login Attempts**
   - Monitor Supabase authentication failures
   - Alert on unusual patterns

4. **Rate Limit Hits**
   - Track 429 responses on token exchange
   - Adjust limits if needed

### Logging

**Portal Backend:**
```typescript
// Log token exchanges
logger.info('Token exchange', {
  userId: user.id,
  email: user.email,
  roles: user.roles,
  timestamp: new Date(),
});
```

**Apps:**
```typescript
// Log SSO events
console.log('[SSO] User authenticated', {
  userId: user.id,
  from: 'app1',
  timestamp: new Date(),
});
```

## Troubleshooting Production Issues

### Issue: SSO not working after deployment

**Check:**
1. Environment variables correct?
2. Redirect URLs match exactly?
3. Supabase project using production credentials?
4. Custom domains configured correctly?

### Issue: Users getting 401 errors

**Check:**
1. Portal API URL correct in apps?
2. Token exchange endpoint responding?
3. Rate limiting not exceeded?
4. Redis/session store working?

### Issue: Logout not propagating

**Check:**
1. All apps using same Supabase project?
2. Same domain/subdomain for cookie sharing?
3. Token storage strategy consistent?

## Rollback Plan

If production deployment fails:

1. **Immediate:**
   - Revert to previous Repl deployment
   - Point custom domains back to old version

2. **Auth Fallback:**
   - Keep traditional email/password login active
   - Users can still log in while fixing SSO

3. **Database:**
   - Supabase user data is separate from Portal DB
   - No data loss from SSO issues

## Post-Deployment Validation

- [ ] Login to Portal via Google OAuth
- [ ] Verify session appears in Supabase dashboard
- [ ] Open App 1 - should auto-login
- [ ] Open App 2 - should auto-login
- [ ] Open App 3 - should auto-login
- [ ] Logout from Portal - verify all apps logout
- [ ] Monitor logs for 24 hours
- [ ] Check rate limiting metrics
- [ ] Verify no security alerts

## Maintenance

### Weekly
- Review Supabase authentication metrics
- Check token exchange success rates
- Monitor rate limiting patterns

### Monthly
- Rotate Supabase service role key (if compromised)
- Review and update redirect URLs
- Audit user sessions

### Quarterly
- Security audit of token storage
- Review CORS configuration
- Update dependencies (@teamified/sso)

## Support Contacts

**Supabase Issues:**
- Dashboard: https://app.supabase.com
- Support: support@supabase.com

**Portal Issues:**
- Backend logs: Check Replit logs
- Redis: Check Vercel KV dashboard

**SSO Package Issues:**
- Update: `npm update @teamified/sso`
- Source: `packages/teamified-sso/`
