# @teamified/sso

Shared SSO authentication package for Teamified internal applications.

## Installation

```bash
npm install @teamified/sso @supabase/supabase-js axios
```

## Quick Start

```typescript
import { createTeamifiedAuth } from '@teamified/sso';

const auth = createTeamifiedAuth({
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY!,
  portalApiUrl: process.env.VITE_PORTAL_API_URL!,
});

// Login with Google
await auth.signInWithGoogle();

// Handle OAuth callback
await auth.handleCallback();

// Get current user with roles
const user = await auth.getCurrentUser();

// Sign out
await auth.signOut();
```

## Security Options

### LocalStorage (Default - Simple)
```typescript
import { createTeamifiedAuth } from '@teamified/sso';

const auth = createTeamifiedAuth(config); // Uses localStorage
```

**Pros:** Tokens persist across page refreshes  
**Cons:** Vulnerable to XSS attacks  
**Use for:** Development, low-security apps

### SessionStorage (Recommended - Balanced)
```typescript
import { createTeamifiedAuth, SessionStorageStrategy } from '@teamified/sso';

const auth = createTeamifiedAuth({
  ...config,
  tokenStorage: new SessionStorageStrategy(),
});
```

**Pros:** More secure than localStorage, cleared on tab close  
**Cons:** Lost on page refresh (re-auth via Supabase session)  
**Use for:** Most production apps

### Memory-Only (Highest Security)
```typescript
import { createTeamifiedAuth, MemoryStorageStrategy } from '@teamified/sso';

const auth = createTeamifiedAuth({
  ...config,
  tokenStorage: new MemoryStorageStrategy(),
});
```

**Pros:** Most secure, no XSS vulnerability  
**Cons:** Lost on page refresh  
**Use for:** High-security apps, admin panels

## Custom Storage Strategy

Implement `TokenStorageStrategy` interface:

```typescript
import { TokenStorageStrategy } from '@teamified/sso';

class HttpOnlyCookieStrategy implements TokenStorageStrategy {
  setAccessToken(token: string): void {
    // Send to server to set HTTP-only cookie
  }

  getAccessToken(): string | null {
    // Retrieved server-side
    return null;
  }

  // ... other methods
}

const auth = createTeamifiedAuth({
  ...config,
  tokenStorage: new HttpOnlyCookieStrategy(),
});
```

## API Reference

### `createTeamifiedAuth(config)`

Creates an authentication client.

**Parameters:**
- `config.supabaseUrl` - Your Supabase project URL
- `config.supabaseAnonKey` - Your Supabase anonymous key
- `config.portalApiUrl` - Teamified Portal API URL
- `config.tokenStorage` (optional) - Custom token storage strategy

**Returns:** `TeamifiedAuthClient`

### Methods

#### `signInWithGoogle(): Promise<void>`
Initiates Google OAuth sign-in flow via Supabase.

#### `handleCallback(): Promise<PortalTokenResponse>`
Handles OAuth callback and exchanges Supabase token for Portal JWT.

#### `isAuthenticated(): Promise<boolean>`
Checks if user has valid Supabase session.

#### `getCurrentUser(): Promise<User | null>`
Fetches current user from Portal API with roles.

#### `signOut(): Promise<void>`
Signs out from Supabase and clears tokens.

#### `getSession(): Promise<Session | null>`
Gets current Supabase session.

## License

MIT
