# Modern Integration Guide (Using @teamified/sso)

This demo app shows the **old pattern** of manually copying files. For new integrations, use the **shared package approach** instead!

## ✅ Recommended: Shared Package Approach

### Install Package
```bash
npm install @teamified/sso @supabase/supabase-js axios
```

### Create Auth Client
```typescript
// src/auth.ts
import { createTeamifiedAuth, SessionStorageStrategy } from '@teamified/sso';

export const auth = createTeamifiedAuth({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  portalApiUrl: import.meta.env.VITE_PORTAL_API_URL!,
  tokenStorage: new SessionStorageStrategy(), // Recommended for production
});
```

### Use in Components
```typescript
import { auth } from './auth';

// Login
await auth.signInWithGoogle();

// Handle callback
await auth.handleCallback();

// Get user
const user = await auth.getCurrentUser();

// Sign out
await auth.signOut();
```

## ❌ Legacy: Manual Copy/Paste Approach

The files in `src/config/supabase.ts` and `src/services/authService.ts` show the old pattern. **Don't use this for new apps!**

**Problems with manual approach:**
- Code duplication across apps
- Harder to update all apps when bugs are fixed
- Inconsistent authentication logic
- No security strategy options

## Storage Strategies

| Strategy | Security | UX | Use Case |
|----------|----------|-----|----------|
| **LocalStorage** | ⚠️ Low | ✅ Best | Development only |
| **SessionStorage** | ✅ Medium | ✅ Good | **Production (recommended)** |
| **MemoryStorage** | ✅✅ High | ⚠️ Poor | High-security apps |
| **HTTP-only Cookie** | ✅✅✅ Highest | ✅ Good | Advanced (needs backend) |

**Production Default:** Use `SessionStorageStrategy` for the best balance of security and user experience.

## Complete Integration Steps

See:
- `docs/multi-app-quick-start.md` - 7-step integration guide
- `docs/multi-app-sso-guide.md` - Detailed documentation
- `docs/multi-app-deployment.md` - Production deployment

## Benefits of Shared Package

✅ **No Code Duplication** - Single source of truth  
✅ **Easy Updates** - `npm update @teamified/sso`  
✅ **Type Safety** - Full TypeScript support  
✅ **Security Options** - Multiple storage strategies  
✅ **Tested** - Shared implementation tested across apps  
✅ **Maintainable** - Fix once, update everywhere  

## Migration from Manual to Package

If you used the manual approach, migrate to the package:

1. Install `@teamified/sso`
2. Replace `src/config/supabase.ts` → `src/auth.ts` (use package)
3. Replace `src/services/authService.ts` → use `auth` client
4. Update components to import from `./auth` instead
5. Choose storage strategy (SessionStorage recommended)
6. Delete old config and service files
7. Test SSO flow

**Time to migrate:** ~15 minutes per app
