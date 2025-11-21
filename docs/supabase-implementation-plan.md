# Supabase Authentication Implementation Plan

**Project:** Federated Authentication for Teamified Portal Ecosystem
**Solution:** Supabase Auth (Free tier → Pro as needed)
**Deployment:** Portal (Vercel) + 3 Apps (Replit/Vercel)
**Timeline:** 6-8 days (well under 2-week deadline)
**Expected Volume:** 1,000-6,000 candidate applications/day (30k-180k MAU)
**Created:** November 6, 2025
**Updated:** November 6, 2025 (Added Replit integration guide + security improvements)
**Status:** Ready for Implementation

---

## 🔒 Recent Security & Reliability Improvements

**High-Priority Updates Added:**

1. **✅ Email Verification Enforcement** (Security)
   - Added `email_confirmed_at` check in `findOrCreateBySupabase`
   - Prevents account creation before email confirmation
   - Blocks malicious account takeover attempts
   - Location: Lines 699-704

2. **✅ Rate Limiting on Token Exchange** (Security)
   - Implemented `@nestjs/throttler` with 20 requests/60s per IP
   - Prevents brute force token exchange attacks while allowing legitimate page refreshes
   - Returns 429 status when limit exceeded
   - Location: Lines 522, 976-979

3. **✅ CORS Configuration with Regex Patterns** (DevOps)
   - Replaced static URL lists with username-scoped regex patterns
   - Supports dynamic Replit URLs without manual updates
   - Production mode uses explicit domains only
   - Location: Lines 2071-2146

4. **✅ Deletion Queue for Failed Supabase Operations** (Reliability)
   - Implemented Bull queue with exponential backoff (3 retries)
   - Failed Supabase user deletions retry automatically
   - Comprehensive audit logging for all retry attempts
   - Location: Lines 841-1026

**Additional Dependencies Required:**
```bash
npm install @nestjs/throttler @nestjs/bull bull
```

**Additional Infrastructure Required:**
- Redis (for rate limiting + queue processing)
- Configured via `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

---

## Executive Summary

This plan implements Supabase as the authentication provider for the Teamified Portal and 3 customer-facing greenfield applications. Supabase handles authentication flows while the existing Portal's RBAC system remains the source of truth for roles and permissions.

### Why Supabase Won

| Factor | Value |
|--------|-------|
| **Cost @ 180k MAU** | $5,364/year (vs. $7,716 Cognito, $48k Okta) |
| **Implementation Time** | 6-8 days (vs. 9-12 days Cognito, 6+ weeks custom) |
| **Timeline Risk** | Low (buffer time in 2-week window) |
| **Developer Experience** | Excellent (simplest option) |
| **Vendor Lock-in** | Low (open source, can self-host) |

### Key Benefits
- **Fast integration:** Single SDK, minimal configuration
- **Cost-effective:** 50k MAU free, then $0.00325/MAU
- **Production-ready security:** SOC2 Type II, HIPAA-ready
- **Social login built-in:** Google, Facebook, LinkedIn, etc.
- **PostgreSQL-based:** Fits existing tech stack
- **Open source:** Self-hosting option available
- **✅ Replit compatible:** Works perfectly with Replit deployments

### Replit + Supabase Compatibility

**Yes! Supabase works excellently with Replit.** This is a popular combination for rapid development.

**Why Supabase is Perfect for Replit:**
- ✅ **No server-side setup needed** - Just install npm package
- ✅ **Works with Replit Secrets** - Environment variable management built-in
- ✅ **Replit's dynamic URLs supported** - `.repl.co` domains work fine
- ✅ **Fast deployments** - No additional infrastructure to manage
- ✅ **Replit Teams compatible** - Multiple developers can work simultaneously

**Replit-Specific Considerations:**
- Replit apps get dynamic URLs: `https://your-app-name.username.repl.co`
- URLs change if you rename Repl (must update Supabase redirect URLs)
- Use Replit Secrets for environment variables (never commit to `.env`)
- Replit's always-on feature keeps apps running (important for webhooks)

**Replit Deployment Options:**
1. **Development:** Use Replit's dev URL (`*.repl.co`)
2. **Production:** Link custom domain (e.g., `app1.yourdomain.com`)
3. **Reserved VM:** For consistent URLs (Replit Hacker/Pro plan)

---

## Architecture Overview

### Current State (Portal Only)

```
┌─────────────────────────────────────────┐
│  Teamified Portal (NestJS + React)     │
│  ┌──────────────────────────────────┐  │
│  │ Users Table (PostgreSQL)         │  │
│  │ - id, email, password_hash       │  │
│  │ - roles: ['admin', 'hr', 'eor']  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ JWT Token Service                │  │
│  │ - Issues access/refresh tokens   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Target State (Supabase + Portal + 3 Apps)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Auth Service                         │
│  - User authentication (email/password, social login, MFA)      │
│  - Session management (SSO across apps)                         │
│  - JWT token issuance (access + refresh tokens)                 │
│  - PostgreSQL user storage                                       │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   App 1 (React)  │  │   App 2 (React)  │  │   App 3 (React)  │
│                  │  │                  │  │                  │
│ - Supabase SDK   │  │ - Supabase SDK   │  │ - Supabase SDK   │
│ - Auto SSO       │  │ - Auto SSO       │  │ - Auto SSO       │
│ - Token storage  │  │ - Token storage  │  │ - Token storage  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
          │                    │                    │
          └────────────────────┴────────────────────┘
                              │
                              ▼
          ┌────────────────────────────────────────┐
          │    Teamified Portal API (NestJS)       │
          │  ┌──────────────────────────────────┐  │
          │  │ Supabase Token Validator         │  │
          │  │ - Verifies JWT signature         │  │
          │  │ - Extracts supabase_user_id      │  │
          │  └──────────────────────────────────┘  │
          │  ┌──────────────────────────────────┐  │
          │  │ Portal RBAC Service              │  │
          │  │ - Loads user roles from DB       │  │
          │  │ - SOURCE OF TRUTH for roles      │  │
          │  └──────────────────────────────────┘  │
          │  ┌──────────────────────────────────┐  │
          │  │ Users Table (PostgreSQL)         │  │
          │  │ - id, email, supabase_user_id    │  │
          │  │ - roles: ['admin', 'hr', 'eor']  │  │
          │  │ - password_hash REMOVED          │  │
          │  └──────────────────────────────────┘  │
          └────────────────────────────────────────┘
```

---

## Roles & Permissions Strategy

### ✅ Hybrid Approach: Portal Owns Roles, Supabase Handles Auth

**Design Decision:** Portal PostgreSQL database remains the source of truth for roles and permissions.

**Why?**
- ✅ No migration of complex role logic
- ✅ Existing Guards/decorators work unchanged
- ✅ Role assignment stays in Portal admin UI
- ✅ Simpler Supabase configuration
- ✅ Faster implementation (critical for 2-week timeline)

### Token Flow

**1. User Login (First Time)**
```
User clicks "Login"
  → Supabase handles authentication
  → Returns Supabase JWT
  → App sends Supabase JWT to Portal API /auth/supabase/exchange
  → Portal API:
      a) Validates Supabase JWT signature
      b) Extracts email from token
      c) Finds/creates user in Portal DB by email
      d) Issues Portal JWT with full roles
  → App uses Portal JWT for all subsequent API calls
```

**2. Subsequent API Calls**
```
App → Portal API (with Portal JWT)
Portal validates JWT → Loads roles → Enforces permissions
(Identical to current system)
```

**3. Token Structure**

**Supabase JWT (received after login):**
```json
{
  "aud": "authenticated",
  "exp": 1699564800,
  "iat": 1699561200,
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john.doe@example.com",
  "phone": "",
  "app_metadata": {},
  "user_metadata": {
    "name": "John Doe"
  },
  "role": "authenticated",
  "aal": "aal1",
  "amr": [{"method": "password", "timestamp": 1699561200}],
  "session_id": "session-uuid"
}
```

**Portal JWT (issued by Portal after Supabase validation):**
```json
{
  "sub": "portal-user-uuid",
  "email": "john.doe@example.com",
  "roles": ["eor", "candidate"],
  "client_id": "client-uuid",
  "iss": "https://teamified-portal.vercel.app",
  "exp": 1699562100,
  "iat": 1699561200
}
```

### Database Changes

**Migration:**
```sql
-- Add Supabase user ID reference
ALTER TABLE users ADD COLUMN supabase_user_id UUID UNIQUE;
CREATE INDEX idx_users_supabase_id ON users(supabase_user_id);

-- Password hash becomes optional (keep for backward compatibility during migration)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

**No other changes to existing Portal:**
- ✅ Role-based Guards work unchanged
- ✅ User management UI unchanged
- ✅ Permission logic unchanged
- ✅ Audit logging unchanged

---

## Implementation Timeline: 6-8 Days

### Day 1: Supabase Setup (4 hours)

#### Morning: Project Setup (2 hours)

**Tasks:**
- [ ] Go to https://supabase.com/dashboard
- [ ] Create account (GitHub OAuth recommended)
- [ ] Create new project:
  - Name: `teamified-portal-prod`
  - Database password: Generate strong password (save to 1Password)
  - Region: Choose closest to your users (e.g., US East)
  - Pricing: Free tier (upgrade to Pro later if needed)
- [ ] Wait 2 minutes for project provisioning

**Credentials to save:**
```env
SUPABASE_PROJECT_URL=https://abc123xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (public, safe for frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (secret, backend only)
SUPABASE_JWT_SECRET=your-super-secret-jwt-key (for token verification)
```

#### Afternoon: Auth Configuration (2 hours)

**Navigate to: Authentication → Settings**

**1. Email Auth Configuration:**
- [ ] Enable Email provider
- [ ] Enable email confirmations (recommended for production)
- [ ] Customize email templates:
  - Confirmation email
  - Password reset email
  - Magic link email
- [ ] Set Site URL: `https://portal.vercel.app` (or your primary domain)
- [ ] Add Redirect URLs:
  ```
  # Local development
  http://localhost:5173/callback
  http://localhost:5174/callback
  http://localhost:5175/callback
  http://localhost:5176/callback

  # Vercel production (if using)
  https://portal.vercel.app/callback
  https://app1.vercel.app/callback
  https://app2.vercel.app/callback
  https://app3.vercel.app/callback

  # Replit development/production
  https://teamified-portal.username.repl.co/callback
  https://app1-name.username.repl.co/callback
  https://app2-name.username.repl.co/callback
  https://app3-name.username.repl.co/callback

  # Custom domains (if configured)
  https://portal.yourdomain.com/callback
  https://app1.yourdomain.com/callback
  https://app2.yourdomain.com/callback
  https://app3.yourdomain.com/callback
  ```

  **Note for Replit:** Update these URLs if you rename your Repl or move to a custom domain.

**2. Social Providers (Optional but Recommended for Candidates):**

**Google OAuth:**
- [ ] Go to Google Cloud Console → APIs & Services → Credentials
- [ ] Create OAuth 2.0 Client ID
- [ ] Authorized redirect URI: `https://abc123xyz.supabase.co/auth/v1/callback`
- [ ] Copy Client ID + Secret
- [ ] In Supabase: Auth → Providers → Google → Enable → Paste credentials

**LinkedIn OAuth (for professional candidates):**
- [ ] Similar process via LinkedIn Developer Portal
- [ ] Recommended for B2B candidate flow

**3. JWT Configuration:**
- [ ] JWT expiry: 3600 (1 hour)
- [ ] Refresh token expiry: 2592000 (30 days)
- [ ] Enable refresh token rotation: Yes

**4. Security Settings:**
- [ ] Enable CAPTCHA for signups (Cloudflare Turnstile - free)
- [ ] Rate limits: Default (30 requests/hour per IP for auth endpoints)
- [ ] Password requirements: Minimum 8 characters (or stronger)

**Deliverable:** Supabase project fully configured, credentials saved.

---

### Day 2-3: Portal Backend Integration (1.5 days)

#### Day 2 Morning: Dependencies & Configuration (2 hours)

**Install packages:**
```bash
cd /Users/simonjones/Projects/teamified-team-member-portal
npm install @supabase/supabase-js @nestjs/throttler @nestjs/bull bull
```

**Note:** We're installing rate limiting (`@nestjs/throttler`) and queue processing (`@nestjs/bull`, `bull`) packages for production-ready security and reliability.

**Setup Redis (required for rate limiting and queue):**

```bash
# Option 1: Docker (recommended for local development)
docker run -d -p 6379:6379 --name redis redis:alpine

# Option 2: Install locally (macOS)
brew install redis
brew services start redis

# Option 3: Use existing Vercel KV (production)
# No local setup needed - use connection string from Vercel dashboard
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

**Environment variables (.env):**
```env
# Supabase Configuration
SUPABASE_URL=https://abc123xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your-super-secret-jwt-key

# Redis (for rate limiting and queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional for local dev
```

**Environment variables (.env.production):**
```env
SUPABASE_URL=https://abc123xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your-super-secret-jwt-key

# Redis (Vercel KV or external Redis)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

#### Day 2 Afternoon: Database Migration (2 hours)

**Generate migration:**
```bash
npm run migration:generate -- -n AddSupabaseUserIdToUsers
```

**Verify migration file:** `src/migrations/{timestamp}-AddSupabaseUserIdToUsers.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupabaseUserIdToUsers1699561200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN supabase_user_id UUID UNIQUE;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_users_supabase_id
      ON users(supabase_user_id);
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN password_hash DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_users_supabase_id;`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN supabase_user_id;`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;`);
  }
}
```

**Run migration:**
```bash
npm run migration:run
```

**Update User entity:** `src/users/entities/user.entity.ts`

```typescript
@Entity('users')
export class User {
  // ... existing fields ...

  @Column({ type: 'uuid', nullable: true, unique: true })
  supabase_user_id?: string;

  @Column({ nullable: true }) // Changed from NOT NULL
  password_hash?: string;

  // ... rest of entity ...
}
```

#### Day 3 Morning: Supabase Service (3 hours)

**Create:** `src/auth/services/supabase.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseTokenPayload {
  sub: string; // Supabase user ID
  email: string;
  email_confirmed_at?: string; // Email confirmation timestamp
  phone?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  aud: string;
  exp: number;
  iat: number;
  role: string;
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private jwtSecret: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');

    if (!supabaseUrl || !serviceRoleKey || !this.jwtSecret) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey);
  }

  /**
   * Verify Supabase JWT token signature and expiry
   */
  async verifyToken(token: string): Promise<SupabaseTokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'], // Supabase uses HS256 by default
      }) as SupabaseTokenPayload;

      // Validate audience
      if (decoded.aud !== 'authenticated') {
        throw new UnauthorizedException('Invalid token audience');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token signature');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * Get user details from Supabase (optional, for admin operations)
   */
  async getSupabaseUser(supabaseUserId: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(
      supabaseUserId,
    );

    if (error || !data) {
      throw new UnauthorizedException('Supabase user not found');
    }

    return data.user;
  }

  /**
   * Delete user from Supabase (for account deletion)
   */
  async deleteSupabaseUser(supabaseUserId: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUser(supabaseUserId);

    if (error) {
      throw new Error(`Failed to delete Supabase user: ${error.message}`);
    }
  }
}
```

#### Day 3 Afternoon: Auth Controller & User Service Updates (3 hours)

**Create:** `src/auth/controllers/supabase-auth.controller.ts`

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { ExchangeTokenDto, LinkAccountDto } from '../dto/supabase-auth.dto';

@ApiTags('Authentication')
@Controller('v1/auth/supabase')
export class SupabaseAuthController {
  constructor(private readonly supabaseAuthService: SupabaseAuthService) {}

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle(20, 60) // 20 requests per 60 seconds per IP (allows page refreshes)
  @ApiOperation({
    summary: 'Exchange Supabase token for Portal JWT',
    description: 'Called by client apps after Supabase authentication to get Portal access token with roles'
  })
  @ApiResponse({ status: 200, description: 'Portal tokens issued successfully' })
  @ApiResponse({ status: 401, description: 'Invalid Supabase token' })
  @ApiResponse({ status: 429, description: 'Too many requests - rate limit exceeded' })
  async exchangeToken(@Body() dto: ExchangeTokenDto) {
    return this.supabaseAuthService.exchangeToken(dto.supabaseAccessToken);
  }

  @Post('link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Link existing Portal user to Supabase account',
    description: 'Used during migration to connect existing users to Supabase'
  })
  @ApiResponse({ status: 200, description: 'Accounts linked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async linkAccount(@Body() dto: LinkAccountDto) {
    return this.supabaseAuthService.linkAccount(
      dto.portalUserId,
      dto.supabaseAccessToken,
    );
  }
}
```

**Create:** `src/auth/dto/supabase-auth.dto.ts`

```typescript
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeTokenDto {
  @ApiProperty({
    description: 'Supabase access token received after authentication',
    example: 'eyJhbGc...',
  })
  @IsString()
  supabaseAccessToken: string;
}

export class LinkAccountDto {
  @ApiProperty({
    description: 'Portal user ID to link',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  portalUserId: string;

  @ApiProperty({
    description: 'Supabase access token',
    example: 'eyJhbGc...',
  })
  @IsString()
  supabaseAccessToken: string;
}
```

**Create:** `src/auth/services/supabase-auth.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { SupabaseService } from './supabase.service';
import { JwtTokenService } from './jwt-token.service';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class SupabaseAuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly auditService: AuditService,
  ) {}

  async exchangeToken(supabaseAccessToken: string) {
    // 1. Verify Supabase token
    const supabasePayload = await this.supabaseService.verifyToken(
      supabaseAccessToken,
    );

    // 2. Find or create Portal user
    const user = await this.usersService.findOrCreateBySupabase(
      supabasePayload.sub,
      supabasePayload.email,
      supabasePayload.email_confirmed_at,
      supabasePayload.user_metadata?.name,
    );

    // 3. Generate Portal JWT with user's roles
    const portalAccessToken = this.jwtTokenService.generateAccessToken(user);
    const portalRefreshToken = await this.jwtTokenService.generateRefreshToken(
      user,
    );

    // 4. Audit log
    await this.auditService.log({
      entityType: 'USER',
      entityId: user.id,
      action: 'SUPABASE_LOGIN',
      performedBy: user.id,
      metadata: {
        supabaseUserId: supabasePayload.sub,
        email: supabasePayload.email,
      },
    });

    // 5. Return Portal tokens + user info
    return {
      accessToken: portalAccessToken,
      refreshToken: portalRefreshToken,
      expiresIn: 900, // 15 minutes (matches current Portal config)
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        profile: user.profile,
      },
    };
  }

  async linkAccount(portalUserId: string, supabaseAccessToken: string) {
    // 1. Verify Supabase token
    const supabasePayload = await this.supabaseService.verifyToken(
      supabaseAccessToken,
    );

    // 2. Find Portal user
    const user = await this.usersService.findById(portalUserId);
    if (!user) {
      throw new NotFoundException('Portal user not found');
    }

    // 3. Check if email matches
    if (user.email !== supabasePayload.email) {
      throw new ConflictException('Email mismatch between Portal and Supabase');
    }

    // 4. Check if already linked
    if (user.supabase_user_id) {
      throw new ConflictException('User already linked to Supabase account');
    }

    // 5. Link accounts
    user.supabase_user_id = supabasePayload.sub;
    await this.usersService.save(user);

    // 6. Audit log
    await this.auditService.log({
      entityType: 'USER',
      entityId: user.id,
      action: 'SUPABASE_ACCOUNT_LINKED',
      performedBy: user.id,
      metadata: {
        supabaseUserId: supabasePayload.sub,
      },
    });

    return { success: true, message: 'Accounts linked successfully' };
  }
}
```

**Update:** `src/users/services/users.service.ts`

```typescript
// Add to constructor:
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

constructor(
  @InjectRepository(User)
  private usersRepository: Repository<User>,
  private auditService: AuditService,
  private supabaseService: SupabaseService,
  @InjectQueue('supabase-user-deletion') private queueService: Queue,
) {}

// Add this method to UsersService class

async findOrCreateBySupabase(
  supabaseUserId: string,
  email: string,
  emailConfirmedAt: string | undefined,
  name?: string,
): Promise<User> {
  // Security: Verify email is confirmed before proceeding
  if (!emailConfirmedAt) {
    throw new UnauthorizedException({
      message: 'Email address not verified',
      error: 'EMAIL_NOT_VERIFIED',
      details: {
        reason: 'You must verify your email address before accessing the Portal.',
        action: 'Please check your inbox for a verification email from Supabase.',
        resendInstructions: 'If you did not receive the email, you can request a new one by logging in again at the Supabase sign-in page.',
        checkSpam: 'Remember to check your spam/junk folder.',
      },
    });
  }

  // Try to find by Supabase ID first
  let user = await this.usersRepository.findOne({
    where: { supabase_user_id: supabaseUserId },
    relations: ['profile', 'roles'],
  });

  if (user) {
    return user;
  }

  // Try to find by email (existing Portal user)
  user = await this.usersRepository.findOne({
    where: { email },
    relations: ['profile', 'roles'],
  });

  if (user) {
    // Link existing user to Supabase
    user.supabase_user_id = supabaseUserId;
    await this.usersRepository.save(user);

    await this.auditService.log({
      entityType: 'USER',
      entityId: user.id,
      action: 'SUPABASE_AUTO_LINKED',
      performedBy: user.id,
      metadata: { supabaseUserId, email, emailConfirmedAt },
    });

    return user;
  }

  // Create new user (first-time signup via Supabase)
  const newUser = this.usersRepository.create({
    email,
    supabase_user_id: supabaseUserId,
    // Default role for new signups (candidates)
    roles: ['candidate'],
  });

  // Create profile if name provided
  if (name) {
    const nameParts = name.split(' ');
    newUser.profile = {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || '',
    } as any;
  }

  await this.usersRepository.save(newUser);

  await this.auditService.log({
    entityType: 'USER',
    entityId: newUser.id,
    action: 'USER_CREATED_VIA_SUPABASE',
    performedBy: newUser.id,
    metadata: { supabaseUserId, email, emailConfirmedAt },
  });

  return newUser;
}

// Add this method for syncing user deletion with Supabase
async deleteUser(userId: string, deletedBy: string): Promise<void> {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Delete from Supabase first (if linked)
  if (user.supabase_user_id) {
    try {
      await this.supabaseService.deleteSupabaseUser(user.supabase_user_id);

      await this.auditService.log({
        entityType: 'USER',
        entityId: userId,
        action: 'SUPABASE_USER_DELETED',
        performedBy: deletedBy,
        metadata: {
          supabaseUserId: user.supabase_user_id,
          email: user.email,
        },
      });
    } catch (error) {
      // Add to deletion queue for retry instead of just logging
      await this.queueService.add('supabase-user-deletion', {
        supabaseUserId: user.supabase_user_id,
        email: user.email,
        portalUserId: userId,
        deletedBy: deletedBy,
        attempt: 1,
        maxAttempts: 3,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // Start with 5 second delay
        },
      });

      await this.auditService.log({
        entityType: 'USER',
        entityId: userId,
        action: 'SUPABASE_USER_DELETE_QUEUED',
        performedBy: deletedBy,
        metadata: {
          supabaseUserId: user.supabase_user_id,
          error: error.message,
          status: 'queued_for_retry',
        },
      });
    }
  }

  // Soft delete from Portal
  await this.usersRepository.softDelete(userId);

  await this.auditService.log({
    entityType: 'USER',
    entityId: userId,
    action: 'USER_DELETED',
    performedBy: deletedBy,
    metadata: {
      email: user.email,
      hadSupabaseAccount: !!user.supabase_user_id,
    },
  });
}
```

**Update:** `src/users/users.module.ts`

```typescript
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuditModule,
    // Add BullModule for queue injection
    BullModule.registerQueue({
      name: 'supabase-user-deletion',
    }),
  ],
  // ... rest of module config
})
export class UsersModule {}
```

**Create:** `src/queue/processors/supabase-deletion.processor.ts`

```typescript
import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseService } from '../../auth/services/supabase.service';
import { AuditService } from '../../audit/services/audit.service';
import { SupabaseDeletionFailure } from '../entities/supabase-deletion-failure.entity';

interface SupabaseDeletionJob {
  supabaseUserId: string;
  email: string;
  portalUserId: string;
  deletedBy: string;
  attempt: number;
  maxAttempts: number;
}

@Processor('supabase-user-deletion')
@Injectable()
export class SupabaseDeletionProcessor {
  private readonly logger = new Logger(SupabaseDeletionProcessor.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    @InjectRepository(SupabaseDeletionFailure)
    private readonly deletionFailureRepository: Repository<SupabaseDeletionFailure>,
  ) {}

  @Process()
  async handleDeletion(job: Job<SupabaseDeletionJob>) {
    const { supabaseUserId, email, portalUserId, deletedBy, attempt, maxAttempts } = job.data;

    this.logger.log(
      `Processing Supabase user deletion (attempt ${attempt}/${maxAttempts}): ${email}`
    );

    try {
      await this.supabaseService.deleteSupabaseUser(supabaseUserId);

      // Success - log audit entry
      await this.auditService.log({
        entityType: 'USER',
        entityId: portalUserId,
        action: 'SUPABASE_USER_DELETED_RETRY_SUCCESS',
        performedBy: deletedBy,
        metadata: {
          supabaseUserId,
          email,
          attempt,
        },
      });

      this.logger.log(`Successfully deleted Supabase user: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete Supabase user ${email} (attempt ${attempt}/${maxAttempts}): ${error.message}`
      );

      // Log failure
      await this.auditService.log({
        entityType: 'USER',
        entityId: portalUserId,
        action: 'SUPABASE_USER_DELETE_RETRY_FAILED',
        performedBy: deletedBy,
        metadata: {
          supabaseUserId,
          email,
          attempt,
          error: error.message,
        },
      });

      // Throw error to trigger Bull retry mechanism
      throw error;
    }
  }

  /**
   * Handle jobs that failed after all retry attempts
   * This is the dead-letter queue handler
   */
  @OnQueueFailed()
  async handleFailedJob(job: Job<SupabaseDeletionJob>, error: Error) {
    const { supabaseUserId, email, portalUserId, deletedBy, maxAttempts } = job.data;

    this.logger.error(
      `CRITICAL: Supabase user deletion permanently failed after ${maxAttempts} attempts: ${email}`,
      error.stack
    );

    // Store in dead-letter table for manual intervention
    const failure = this.deletionFailureRepository.create({
      supabaseUserId,
      email,
      portalUserId,
      deletedBy,
      attempts: maxAttempts,
      lastError: error.message,
      errorStack: error.stack,
      failedAt: new Date(),
      status: 'requires_manual_intervention',
    });

    await this.deletionFailureRepository.save(failure);

    // Log critical audit entry
    await this.auditService.log({
      entityType: 'USER',
      entityId: portalUserId,
      action: 'SUPABASE_USER_DELETE_PERMANENTLY_FAILED',
      performedBy: deletedBy,
      metadata: {
        supabaseUserId,
        email,
        attempts: maxAttempts,
        error: error.message,
        deadLetterRecordId: failure.id,
        requiresManualIntervention: true,
      },
    });

    // Send admin alert (optional - requires notification service)
    try {
      await this.sendAdminAlert({
        subject: '🚨 CRITICAL: Supabase User Deletion Failed',
        message: `
User deletion failed after ${maxAttempts} retry attempts and requires manual intervention.

**Details:**
- Email: ${email}
- Portal User ID: ${portalUserId}
- Supabase User ID: ${supabaseUserId}
- Deleted By: ${deletedBy}
- Error: ${error.message}

**Action Required:**
1. Manually delete user from Supabase Admin Panel
2. Update dead-letter record status in database: 
   UPDATE supabase_deletion_failures SET status = 'manually_resolved' WHERE id = '${failure.id}'
3. Investigate root cause to prevent future occurrences

**Dead Letter Record ID:** ${failure.id}
        `,
        supabaseUserId,
        portalUserId,
      });
    } catch (alertError) {
      // Don't fail if alert fails - we've already logged to DB
      this.logger.error(`Failed to send admin alert: ${alertError.message}`);
    }
  }

  /**
   * Send alert to admin (implement based on your notification system)
   * Options: Email (Nodemailer), Slack webhook, SMS (Twilio), etc.
   */
  private async sendAdminAlert(alert: {
    subject: string;
    message: string;
    supabaseUserId: string;
    portalUserId: string;
  }): Promise<void> {
    // TODO: Implement based on your notification preference
    // Example with email (requires Nodemailer setup):
    // await this.emailService.send({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: alert.subject,
    //   text: alert.message,
    // });

    // Example with Slack webhook:
    // await fetch(process.env.SLACK_WEBHOOK_URL, {
    //   method: 'POST',
    //   body: JSON.stringify({ text: alert.message }),
    // });

    // For now, just log (you can implement actual notification later)
    this.logger.warn(`ADMIN ALERT: ${alert.subject}\n${alert.message}`);
  }
}
```

**Create:** `src/queue/entities/supabase-deletion-failure.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('supabase_deletion_failures')
export class SupabaseDeletionFailure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  supabaseUserId: string;

  @Column()
  email: string;

  @Column('uuid')
  portalUserId: string;

  @Column()
  deletedBy: string;

  @Column('int')
  attempts: number;

  @Column('text')
  lastError: string;

  @Column('text', { nullable: true })
  errorStack: string;

  @CreateDateColumn()
  failedAt: Date;

  @Column({
    type: 'enum',
    enum: ['requires_manual_intervention', 'manually_resolved', 'retrying'],
    default: 'requires_manual_intervention',
  })
  status: string;

  @Column('timestamp', { nullable: true })
  resolvedAt: Date;

  @Column('text', { nullable: true })
  resolutionNotes: string;
}
```

**Create:** `src/queue/queue.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseDeletionProcessor } from './processors/supabase-deletion.processor';
import { SupabaseDeletionFailure } from './entities/supabase-deletion-failure.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupabaseDeletionFailure]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          // Use REDIS_URL (Vercel KV, Upstash, etc.)
          return { redis: redisUrl };
        } else {
          // Fallback to individual variables (local development)
          return {
            redis: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
              password: configService.get('REDIS_PASSWORD'),
            },
          };
        }
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'supabase-user-deletion',
    }),
    AuthModule,
    AuditModule,
  ],
  providers: [SupabaseDeletionProcessor],
  exports: [BullModule],
})
export class QueueModule {}
```

**Update:** `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { AuthController } from './controllers/auth.controller';
import { SupabaseAuthController } from './controllers/supabase-auth.controller';
import { AuthService } from './services/auth.service';
import { SupabaseService } from './services/supabase.service';
import { SupabaseAuthService } from './services/supabase-auth.service';
import { JwtTokenService } from './services/jwt-token.service';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    UsersModule,
    AuditModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'supabase-user-deletion',
    }),
  ],
  controllers: [AuthController, SupabaseAuthController],
  providers: [
    AuthService,
    SupabaseService,
    SupabaseAuthService,
    JwtTokenService,
  ],
  exports: [SupabaseService, JwtTokenService],
})
export class AuthModule {}
```

**Update:** `src/app.module.ts`

```typescript
// Add QueueModule to imports array
import { QueueModule } from './queue/queue.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ... existing imports
    QueueModule,
    // ... rest of imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Test the backend:**
```bash
npm run start:dev

# Should see in logs:
# [Nest] Mapped {/api/v1/auth/supabase/exchange, POST} route
# [Nest] Mapped {/api/v1/auth/supabase/link, POST} route
```

**Deliverable:** Backend can exchange Supabase tokens for Portal JWTs.

---

### Day 4: Portal Frontend Integration (4-6 hours)

#### Morning: Setup (2 hours)

**Install dependencies:**
```bash
cd frontend
npm install @supabase/supabase-js
```

**Environment variables:** `frontend/.env`

```env
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:3000/api
```

**Environment variables:** `frontend/.env.production`

```env
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://portal-api.vercel.app/api
```

**Create Supabase client:** `frontend/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Get callback URL for OAuth redirects
 * Handles Replit dynamic URLs automatically
 */
export const getCallbackUrl = () => {
  // In production, prefer explicit URL if set
  const explicitUrl = import.meta.env.VITE_CALLBACK_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  // In development or when no explicit URL, use current origin
  // This handles Replit URL changes automatically
  return `${window.location.origin}/callback`;
};

/**
 * Helper: Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getCallbackUrl(),
    },
  });

  if (error) throw error;
};

/**
 * Helper: Sign up with email/password
 */
export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || '',
      },
      emailRedirectTo: getCallbackUrl(),
    },
  });

  if (error) throw error;
};
```

**Important for Replit:** In Supabase Dashboard → Authentication → URL Configuration:
- Add wildcard redirect URL: `https://*.repl.co/callback`
- This allows any Replit URL to work without manual updates
- For production, add explicit custom domain: `https://portal.yourdomain.com/callback`

#### Afternoon: Auth Integration (2-4 hours)

**Update:** `frontend/src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        exchangeSupabaseToken(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await exchangeSupabaseToken(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('portalAccessToken');
          localStorage.removeItem('portalRefreshToken');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          await exchangeSupabaseToken(session.access_token);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const exchangeSupabaseToken = async (supabaseAccessToken: string, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await authService.exchangeSupabaseToken(supabaseAccessToken);

        // Store Portal tokens
        localStorage.setItem('portalAccessToken', response.accessToken);
        localStorage.setItem('portalRefreshToken', response.refreshToken);

        setUser(response.user);
        setError(null);
        setLoading(false);
        return; // Success, exit retry loop
      } catch (err) {
        const isLastAttempt = attempt === retries - 1;
        
        if (isLastAttempt) {
          // All retries exhausted
          console.error('Failed to exchange Supabase token after', retries, 'attempts:', err);
          setError('Portal API unavailable. Please try again in a few minutes.');
          await supabase.auth.signOut();
          setLoading(false);
        } else {
          // Wait with exponential backoff before retry
          const backoffMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
          console.warn(`Token exchange attempt ${attempt + 1} failed. Retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      throw signInError;
    }

    // Token exchange happens in onAuthStateChange listener
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      throw signInError;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      throw signUpError;
    }

    // If email confirmation is enabled, user will get confirmation email
    // Otherwise, token exchange happens in onAuthStateChange listener
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('portalAccessToken');
    localStorage.removeItem('portalRefreshToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Create:** `frontend/src/services/authService.ts` (update existing)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const authService = {
  // Existing methods...

  async exchangeSupabaseToken(supabaseAccessToken: string) {
    const response = await axios.post(
      `${API_URL}/v1/auth/supabase/exchange`,
      { supabaseAccessToken },
    );
    return response.data;
  },

  async linkSupabaseAccount(portalUserId: string, supabaseAccessToken: string) {
    const response = await axios.post(
      `${API_URL}/v1/auth/supabase/link`,
      { portalUserId, supabaseAccessToken },
    );
    return response.data;
  },
};
```

**Update:** `frontend/src/pages/LoginPageMUI.tsx`

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPageMUI() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signInWithGoogle, signUp, error } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('Check your email for confirmation link!');
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      // Redirect handled by Supabase
    } catch (err) {
      console.error('Google auth error:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Teamified Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mb={3}>
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleAuth}
          sx={{ mb: 2 }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <form onSubmit={handleEmailAuth}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <Button
          fullWidth
          onClick={() => setIsSignUp(!isSignUp)}
          sx={{ mt: 2 }}
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </Button>
      </Paper>
    </Box>
  );
}
```

**Create callback page:** `frontend/src/pages/CallbackPage.tsx`

```tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../lib/supabase';

export default function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically handles the OAuth callback
    // Just wait for auth state change, then redirect
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">Completing sign in...</Typography>
    </Box>
  );
}
```

**Update routes:** `frontend/src/App.tsx`

```tsx
import CallbackPage from './pages/CallbackPage';

// Add route:
<Route path="/callback" element={<CallbackPage />} />
```

**Test the frontend:**
```bash
cd frontend
npm run dev

# Open http://localhost:5173
# Try signing up with email/password
# Try signing in with Google
# Verify redirect to dashboard after login
```

**Deliverable:** Portal frontend fully integrated with Supabase auth.

---

### Day 5-7: Integrate Greenfield Apps (3 days = 1 day per app)

#### Day 5 Morning: Create Shared Auth Library (2-3 hours)

**Goal:** Build a reusable NPM package to avoid duplicating auth code across 3 apps.

**Savings:** ~40% less development time on Apps 2-3, easier maintenance.

##### Option A: NPM Package (Recommended for Production)

**Create:** `packages/teamified-auth/` (monorepo) or separate repo

**Structure:**
```
teamified-auth/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Main exports
│   ├── lib/
│   │   └── supabase.ts       # Supabase client
│   ├── contexts/
│   │   └── AuthContext.tsx   # React context
│   ├── hooks/
│   │   └── useAuth.ts        # React hook
│   ├── services/
│   │   └── api.ts            # Axios instance
│   └── types/
│       └── index.ts          # TypeScript types
└── README.md
```

**`package.json`:**
```json
{
  "name": "@teamified/auth",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0"
  }
}
```

**`src/index.ts`:**
```typescript
// Export everything for consumers
export { supabase, getCallbackUrl, signInWithGoogle, signUpWithEmail } from './lib/supabase';
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { createApiClient } from './services/api';
export type { User, AuthContextType } from './types';
```

**`src/lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';

// Consumer apps must provide these via env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const getCallbackUrl = () => {
  const explicitUrl = import.meta.env.VITE_CALLBACK_URL || process.env.VITE_CALLBACK_URL;
  if (explicitUrl) return explicitUrl;
  return `${window.location.origin}/callback`;
};

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getCallbackUrl() },
  });
  if (error) throw error;
};

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || '' },
      emailRedirectTo: getCallbackUrl(),
    },
  });
  if (error) throw error;
};
```

**`src/contexts/AuthContext.tsx`:**
```typescript
// Copy from Portal's AuthContext but make PORTAL_API_URL configurable
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { createApiClient } from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  portalApiUrl: string; // Allow consumers to configure API URL
}> = ({ children, portalApiUrl }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = createApiClient(portalApiUrl);

  // ... rest of AuthContext logic (same as Portal)
  
  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signInWithGoogle, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**`src/services/api.ts`:**
```typescript
import axios from 'axios';

export const createApiClient = (portalApiUrl: string) => {
  const api = axios.create({ baseURL: portalApiUrl });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('portalAccessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('portalAccessToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
};
```

**Build and publish:**
```bash
cd packages/teamified-auth
npm run build

# For local development (link to apps)
npm link

# For production (publish to npm or private registry)
npm publish --access private
```

##### Option B: Copy-Paste Template (Faster for Replit)

**Create:** `docs/auth-template/` folder with all auth files

**Structure:**
```
docs/auth-template/
├── lib/
│   └── supabase.ts
├── contexts/
│   └── AuthContext.tsx
├── services/
│   └── api.ts
├── pages/
│   ├── LoginPage.tsx
│   └── CallbackPage.tsx
└── README.md  # Instructions for each app
```

**Usage (for each app):**
```bash
# Copy template to app
cp -r docs/auth-template/* /path/to/app1/src/

# Install dependencies
cd /path/to/app1
npm install @supabase/supabase-js axios

# Configure env vars
echo "VITE_SUPABASE_URL=..." >> .env
echo "VITE_SUPABASE_ANON_KEY=..." >> .env
echo "VITE_API_URL=https://portal-api.vercel.app/api" >> .env
```

**Recommendation:**
- Use **Option B (Copy-Paste)** for Replit projects (faster, no build step)
- Use **Option A (NPM Package)** for production long-term (better maintainability)

**Time saved:**
- Option A: 2 hours setup, saves ~6 hours total (3 apps × 2 hours/app)
- Option B: 30 mins setup, saves ~4 hours total

---

#### Day 5 Afternoon: App 1 Integration (4-5 hours)

**Assumptions:**
- App 1 is a React/Vite app
- Located in separate repo or Replit
- Needs to call Portal API

**Setup:**
```bash
cd /path/to/app1
npm install @supabase/supabase-js axios
```

**If using shared library (Option A):**
```bash
npm install @teamified/auth
# OR (for local development)
npm link @teamified/auth
```

**If using template (Option B):**
```bash
cp -r docs/auth-template/* src/
```

**Configure environment:**
```env
# .env.local (for Replit Secrets)
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://portal-api.vercel.app/api
VITE_CALLBACK_URL=https://app1-name.username.repl.co/callback
```

**Update:** `src/App.tsx`

```typescript
import { AuthProvider } from '@teamified/auth'; // Option A
// OR
import { AuthProvider } from './contexts/AuthContext'; // Option B
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';

function App() {
  return (
    <AuthProvider portalApiUrl={import.meta.env.VITE_API_URL}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={<ProtectedDashboard />} />
      </Routes>
    </AuthProvider>
  );
}
```

**Create:** `src/services/api.ts`

```typescript
import axios from 'axios';

const PORTAL_API_URL = 'https://portal-api.vercel.app/api';

export const api = axios.create({
  baseURL: PORTAL_API_URL,
});

// Add Portal JWT to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portalAccessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, trigger re-login
      localStorage.removeItem('portalAccessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Create:** `src/pages/LoginPage.tsx` (copy from Portal)

**Test:**
- Login via Supabase
- Call Portal API endpoint
- Verify roles enforced

**Time estimate:** 1 day (4-6 hours active work)

#### Day 6: App 2 Integration

Repeat Day 5 process for App 2.

#### Day 7: App 3 Integration

Repeat Day 5 process for App 3.

**Optimization:** If apps are similar, create a shared auth library:

```bash
# Create shared package
mkdir packages/teamified-auth
cd packages/teamified-auth
npm init -y
npm install @supabase/supabase-js axios

# Export AuthProvider, useAuth, api client
# Apps just install this package and use it
```

---

#### Replit-Specific Integration Guide

**For Apps Hosted on Replit:**

**Step 1: Environment Variables (Use Replit Secrets)**

In your Repl, click the lock icon (🔒) in the sidebar to add Secrets:

```
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://portal-api.vercel.app/api
```

**Important:** Never use `.env` files in Replit (they're visible in repo). Always use Secrets.

**Step 2: Access Secrets in Code**

Vite automatically exposes Replit Secrets as environment variables:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check Replit Secrets.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 3: Configure Redirect URLs**

Your Repl URL format: `https://your-repl-name.username.repl.co`

1. Find your Repl URL (appears in webview when you run the app)
2. Add to Supabase Dashboard → Auth → URL Configuration:
   ```
   https://your-repl-name.username.repl.co/callback
   ```

3. Update AuthContext to use dynamic redirect:
   ```typescript
   const { error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${window.location.origin}/callback`,
     },
   });
   ```

**Step 4: Handle Replit URL Changes**

If you rename your Repl, URL changes. To avoid breaking auth:

**Option A: Use Custom Domain (Recommended for Production)**
1. Go to Repl Settings → Domains
2. Link custom domain (e.g., `app1.yourdomain.com`)
3. Update Supabase redirect URLs to use custom domain
4. URL never changes again

**Option B: Update URLs After Rename**
1. Rename Repl
2. Note new URL
3. Update Supabase redirect URLs
4. Update Replit Secrets (VITE_API_URL if needed)

**Step 5: Replit-Specific `package.json` Configuration**

```json
{
  "name": "app1",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0"
  }
}
```

**Note:** `--host 0.0.0.0` is required for Replit to expose the app externally.

**Step 6: `.replit` Configuration File**

Create `.replit` in your project root:

```toml
run = "npm run dev"

[nix]
channel = "stable-22_11"

[deployment]
run = ["npm", "run", "build"]
deploymentTarget = "static"
publicDir = "dist"
```

**Step 7: Test on Replit**

```bash
# In Replit shell
npm install
npm run dev

# Click the webview URL
# Should see your app
# Try login → Should redirect to Supabase → Back to /callback
```

**Common Replit Issues & Fixes:**

**Issue: "Cannot GET /callback" on redirect**

**Cause:** React Router not handling client-side routing

**Fix:** Create `public/_redirects` file (for SPA):
```
/*    /index.html   200
```

Or use HashRouter instead of BrowserRouter:
```tsx
import { HashRouter } from 'react-router-dom';

root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
```

---

**Issue: Environment variables undefined**

**Cause:** Secrets not loading or wrong naming

**Fix:**
1. Verify Secrets exist in Replit (🔒 icon)
2. Restart Repl (Stop → Run)
3. Check console: `console.log(import.meta.env)`

---

**Issue: CORS error calling Portal API**

**Cause:** Replit URL not in Portal's CORS whitelist

**Fix:** Update Portal backend `src/main.ts` with regex patterns for flexible Replit URLs:
```typescript
// Define allowed origins (strings and regex patterns)
const allowedOrigins: (string | RegExp)[] = [
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',

  // Production custom domains
  'https://portal.teamified.com',
  'https://app1.teamified.com',
  'https://app2.teamified.com',
  'https://app3.teamified.com',

  // Vercel deployments
  'https://portal.vercel.app',
  /^https:\/\/.*\.vercel\.app$/,

  // Replit development (regex for your username)
  // Replace 'yourusername' with your actual Replit username
  /^https:\/\/.*\.yourusername\.repl\.co$/,

  // For production: Uncomment and use specific app names instead of wildcard
  // 'https://teamified-portal.yourusername.repl.co',
  // 'https://app1-name.yourusername.repl.co',
  // 'https://app2-name.yourusername.repl.co',
  // 'https://app3-name.yourusername.repl.co',
];

app.enableCors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin matches any allowed origin (string or regex)
    const isAllowed = allowedOrigins.some(allowed =>
      typeof allowed === 'string'
        ? allowed === origin
        : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
});
```

**Security Recommendations:**
1. **Development:** Use username-scoped regex: `/^https:\/\/.*\.yourusername\.repl\.co$/`
2. **Production:** Use explicit URLs for specific apps (commented section above)
3. **Best Practice:** Link custom domains and remove Replit URLs entirely for production
4. **Warning:** Never use `/^https:\/\/.*\.repl\.co$/` (without username) - allows ANY Replit user to call your API

**Updating for Different Environments:**
```typescript
// Use environment variable to control CORS strategy
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins: (string | RegExp)[] = isProduction
  ? [
      // Production: Explicit domains only
      'https://portal.teamified.com',
      'https://app1.teamified.com',
      'https://app2.teamified.com',
      'https://app3.teamified.com',
    ]
  : [
      // Development: Allow local + Replit
      'http://localhost:5173',
      /^https:\/\/.*\.yourusername\.repl\.co$/,
    ];
```

---

**Replit Production Checklist:**

- [ ] Use Replit Always-On (Hacker/Pro plan) for production apps
- [ ] Configure custom domain (don't rely on `.repl.co` URLs)
- [ ] All secrets configured (never commit `.env`)
- [ ] HTTPS enforced (Replit does this automatically)
- [ ] Test SSO across all Replit apps
- [ ] Monitor Repl resource usage (CPU/memory)
- [ ] Set up Replit backups (automatic with Teams)

---

### Day 8: Testing & Documentation (1 day)

#### Morning: Comprehensive Testing (4 hours)

**Test Checklist:**

**Authentication Flow:**
- [ ] Sign up with email/password → Receive confirmation email
- [ ] Confirm email → Redirect to login
- [ ] Sign in with email/password → Redirect to dashboard
- [ ] Sign in with Google → OAuth flow → Redirect to dashboard
- [ ] Invalid credentials → Show error message
- [ ] Sign out → Redirect to login

**SSO Testing:**
- [ ] Login to Portal → Navigate to App 1 URL
- [ ] Should auto-login (Supabase session shared)
- [ ] Navigate to App 2 → Auto-login
- [ ] Navigate to App 3 → Auto-login
- [ ] Logout from App 1 → All apps logged out

**Token Exchange:**
- [ ] After Supabase login, verify Portal JWT issued
- [ ] Portal JWT contains correct user ID, email, roles
- [ ] API calls use Portal JWT, not Supabase token

**Role Enforcement:**
- [ ] User with 'eor' role can access EOR endpoints
- [ ] User without 'admin' role denied admin endpoints
- [ ] 403 Forbidden returned (not 401)

**Token Refresh:**
- [ ] Wait 1 hour → Supabase auto-refreshes token
- [ ] New Portal JWT issued automatically
- [ ] No forced logout

**New User Signup:**
- [ ] Sign up via Supabase → User created in Portal DB
- [ ] Default role 'candidate' assigned
- [ ] Profile created (if name provided)
- [ ] Audit log created

**Existing User Migration:**
- [ ] Existing Portal user signs in with Supabase
- [ ] Accounts auto-linked by email
- [ ] Existing roles preserved
- [ ] Old password_hash no longer used

**Error Scenarios:**
- [ ] Invalid Supabase token → 401 Unauthorized
- [ ] Expired Portal token → Refresh flow triggers
- [ ] Network error → User-friendly error message
- [ ] Supabase service down → Graceful degradation

#### Afternoon: Documentation (4 hours)

**Update:** `docs/authentication.md`

```markdown
# Authentication System

## Overview

The Teamified Portal uses Supabase for authentication with a hybrid approach:
- **Supabase** handles user authentication (login, signup, MFA, social login)
- **Portal API** manages roles and permissions (source of truth)

## Architecture

[Include architecture diagram from this plan]

## For End Users

### Sign Up
1. Go to portal URL
2. Click "Sign Up"
3. Choose email/password or Google login
4. Confirm email (if email/password)
5. Redirected to dashboard

### Sign In
1. Go to portal URL or any app
2. Click "Sign In"
3. Authenticate via Supabase
4. Automatically signed in to all apps (SSO)

## For Developers

### Adding Supabase Auth to New App

[Include code examples from Day 5]

### Environment Variables

[List all required env vars]

### API Integration

[Show how to use Portal JWT for API calls]

## Troubleshooting

**"Email address not verified" error (EMAIL_NOT_VERIFIED):**

When a user tries to log in without confirming their email, they'll receive a detailed error message:

```json
{
  "statusCode": 401,
  "message": "Email address not verified",
  "error": "EMAIL_NOT_VERIFIED",
  "details": {
    "reason": "You must verify your email address before accessing the Portal.",
    "action": "Please check your inbox for a verification email from Supabase.",
    "resendInstructions": "If you did not receive the email, you can request a new one by logging in again at the Supabase sign-in page.",
    "checkSpam": "Remember to check your spam/junk folder."
  }
}
```

**Frontend Handling:**
1. Display error details to user in a user-friendly format
2. Show "Resend Verification Email" button
3. Implement resend logic using Supabase client:

```typescript
// In your frontend login error handler
if (error.error === 'EMAIL_NOT_VERIFIED') {
  // Show resend button
  setShowResendButton(true);
  setErrorMessage(error.details.reason + ' ' + error.details.action);
}

// Resend verification email function
async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
  
  if (error) {
    alert('Failed to resend verification email: ' + error.message);
  } else {
    alert('Verification email sent! Please check your inbox.');
  }
}
```

**User Steps:**
1. Check spam/junk folder for original verification email
2. Click "Resend Verification Email" button if not found
3. Check inbox again (may take 1-2 minutes)
4. Click verification link in email
5. Return to Portal and log in again

**Admin Steps (if user still can't verify):**
1. Go to Supabase Dashboard → Authentication → Users
2. Find user by email
3. Manually confirm email using "Confirm email" button
4. Ask user to try logging in again

**Stuck on callback page:**
- Check browser console for errors
- Verify redirect URLs in Supabase dashboard match your deployment URLs
- Clear browser cache and cookies
- Try incognito/private browsing mode

**API returns 401 Unauthorized:**
- Check localStorage for `portalAccessToken`
- Verify token hasn't expired (15 minutes)
- Check Network tab for failed requests
- Try logging out completely and back in
- Verify Supabase session is still valid
```

**Create:** `docs/supabase-setup-guide.md`

[Include Day 1 setup instructions]

**Update:** `README.md`

Add Supabase setup to prerequisites.

**Deliverable:** All tests passing, documentation complete.

---

## Security Considerations

### ✅ Built-in Security Features (Supabase)

1. **Rate Limiting**
   - 30 auth requests/hour per IP (configurable)
   - Protection against brute force attacks

2. **Email Verification**
   - Confirm email before account activation (recommended)
   - Prevents fake signups

3. **MFA Support**
   - TOTP (authenticator apps)
   - SMS (via Twilio integration)
   - Enable in Supabase dashboard

4. **CAPTCHA**
   - Cloudflare Turnstile integration (free)
   - Blocks automated signups

5. **JWT Security**
   - HS256 signed tokens
   - Automatic rotation of signing keys
   - Configurable expiry

6. **Row Level Security (RLS)**
   - PostgreSQL RLS policies
   - Users can only access their own data
   - Enforced at database level

### 🔒 Portal Security Enhancements

**Add to Portal backend:**

**1. Rate Limit Token Exchange:**
```typescript
// src/auth/controllers/supabase-auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Throttle(20, 60) // 20 requests per 60 seconds per IP (allows page refreshes)
@Post('exchange')
async exchangeToken(@Body() dto: ExchangeTokenDto) {
  // ...
}
```

**2. Audit All Supabase Logins:**
Already included in SupabaseAuthService.

**3. Validate Email Domain (Optional):**
```typescript
// Reject signups from disposable email services
const disposableDomains = ['tempmail.com', 'guerrillamail.com'];
if (disposableDomains.some(domain => email.endsWith(domain))) {
  throw new BadRequestException('Disposable email addresses not allowed');
}
```

**4. Add IP Address Logging:**
```typescript
// Track login IPs for fraud detection
await this.auditService.log({
  // ...
  metadata: {
    supabaseUserId,
    email,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
});
```

### Security Checklist

**Before Production:**
- [ ] Enable email confirmation in Supabase
- [ ] Enable CAPTCHA for signups
- [ ] Set strong password requirements (12+ chars)
- [ ] Configure rate limits
- [ ] Enable MFA for admin users
- [ ] Review Supabase audit logs weekly
- [ ] Set up Supabase webhook to Portal for suspicious activity
- [ ] Add Content Security Policy headers to frontend
- [ ] Enable HTTPS only (no HTTP)
- [ ] Rotate JWT secrets quarterly

---

## Cost Breakdown

### Supabase Pricing

**Free Tier:**
- 50,000 MAU
- 500 MB database storage
- 2 GB file storage
- 50 GB bandwidth
- Unlimited API requests
- Community support

**Pro Tier ($25/month):**
- Includes:
  - 100,000 MAU (first 50k free)
  - 8 GB database storage
  - 100 GB file storage
  - 250 GB bandwidth
  - Daily backups
  - Email support

**Additional MAU Pricing (beyond included):**
- $0.00325 per MAU

### Cost Projections

| Monthly Volume | MAU | Tier | Monthly Cost | Annual Cost |
|----------------|-----|------|--------------|-------------|
| **Low (1k/day)** | 30,000 | Free | $0 | $0 |
| **Medium (3k/day)** | 90,000 | Pro | $25 + (40k × $0.00325) = $155 | $1,860 |
| **High (6k/day)** | 180,000 | Pro | $25 + (130k × $0.00325) = $447 | $5,364 |

### 3-Year Cost Projection (180k MAU)

**Supabase:** $5,364 × 3 = **$16,092**

**Compare to:**
- AWS Cognito: $23,148
- Okta: $144,000
- Custom build: $55,000

**Savings vs. next cheapest (Cognito):** $7,056 over 3 years

### Additional Costs

**Email Delivery (if not using Supabase SMTP):**
- Supabase includes email sending (limited)
- For high volume, integrate SendGrid/Mailgun
- ~$0.001 per email (negligible)

**SMS for MFA (optional):**
- Twilio integration
- ~$0.0075 per SMS
- Only if MFA enforced

**Total Expected Cost (Medium scenario):**
- Supabase: $155/month
- Email: $10/month (10k emails)
- SMS: $30/month (if 4k MFA users)
- **Total: ~$195/month** = $2,340/year

---

## Migration Strategy

### Scenario 1: New Users (Greenfield Apps)

**Flow:**
1. User goes to any app
2. Clicks "Sign Up"
3. Redirects to Supabase registration
4. Supabase creates auth user
5. User confirms email
6. On first login, Portal creates user record
7. Default role: 'candidate'

**No migration needed** - clean slate.

### Scenario 2: Existing Portal Users (if applicable)

**Option A: Forced Migration (Recommended)**

1. Deploy new auth system
2. Disable legacy login endpoints
3. Show message: "We've upgraded! Please sign in with Supabase"
4. User clicks "Sign In" → Supabase flow
5. User creates Supabase account (same email)
6. Portal auto-links by email
7. Existing roles preserved

**Timeline:** All users migrated within 1 week of usage.

**Option B: Gradual Migration**

1. Support both legacy and Supabase login for 30 days
2. Show banner: "Upgrade to new login system"
3. After 30 days, disable legacy login
4. Force remaining users to migrate

**Option C: Admin-Initiated Bulk Import**

1. Export all Portal user emails
2. Use Supabase Management API to create accounts:
   ```typescript
   // Script: scripts/migrate-users-to-supabase.ts
   import { createClient } from '@supabase/supabase-js';

   const supabase = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_SERVICE_ROLE_KEY,
   );

   async function migrateUsers() {
     const portalUsers = await getPortalUsers(); // From Portal DB

     for (const user of portalUsers) {
       const { data, error } = await supabase.auth.admin.createUser({
         email: user.email,
         email_confirm: true, // Skip email confirmation
         user_metadata: {
           name: user.profile.first_name + ' ' + user.profile.last_name,
         },
       });

       if (!error) {
         // Update Portal user with Supabase ID
         await updatePortalUser(user.id, { supabase_user_id: data.user.id });

         // Send password reset email
         await supabase.auth.resetPasswordForEmail(user.email, {
           redirectTo: 'https://portal.vercel.app/reset-password',
         });
       }
     }
   }
   ```

3. Send password reset emails to all users
4. Users set new passwords in Supabase

**Recommendation:** Option A (forced migration) for simplicity and speed.

---

## Rollback Plan

### If Issues Arise During Implementation

**Week 1 (Days 1-4): Backend Development**
- **Risk:** Low (additive changes only)
- **Rollback:** Simply don't deploy new endpoints
- **Impact:** None (legacy auth still works)

**Day 5 (Frontend Integration):**
- **Risk:** Medium (changes to AuthContext)
- **Rollback:** Git revert frontend changes, redeploy
- **Impact:** Users see old login page (working)
- **Time:** 10 minutes

**Days 6-8 (Greenfield Apps):**
- **Risk:** Low (new apps not in production yet)
- **Rollback:** Don't launch new apps
- **Impact:** None

### Post-Launch Rollback (Critical Issues in Production)

**Trigger Conditions:**
- Token exchange failure rate > 5% for more than 15 minutes
- Supabase outage lasting > 30 minutes
- Critical security vulnerability discovered
- Users unable to access core functionality

#### Phase 1: Immediate Response (0-15 minutes)

**Step 1: Show Maintenance Page**
```typescript
// Frontend: Set environment variable via Replit Secrets
VITE_MAINTENANCE_MODE=true

// In App.tsx
if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
  return <MaintenancePage message="Experiencing technical issues. We'll be back shortly." />;
}
```

**Step 2: Alert Team**
- Post to internal Slack/Teams channel
- Identify root cause (check logs, Supabase status)
- Assess severity (partial vs. complete outage)

**Step 3: Monitor Critical Metrics**
```bash
# Check Portal API health
curl https://portal.vercel.app/health

# Check token exchange errors
grep "Failed to exchange Supabase token" /var/log/portal.log | wc -l

# Check Supabase status
curl https://status.supabase.com/api/v2/status.json
```

#### Phase 2: Restore Service (15-60 minutes)

**Option A: If Supabase is recovering (ETA < 1 hour)**
1. Keep maintenance page up
2. Monitor Supabase status page
3. Test auth flow once Supabase is back
4. Remove maintenance mode
5. Post user communication: "Service restored"

**Option B: If Supabase down for extended period**

**Step 1: Rollback Frontend (15 minutes)**
```bash
# On Vercel
cd portal-frontend
git log --oneline -10  # Find commit before Supabase integration
git checkout <commit-hash-before-supabase>
vercel --prod

# On Replit (for greenfield apps)
# Simply stop the Replit or revert git commits
git reset --hard <commit-before-supabase>
```

**Step 2: Rollback Backend API (20 minutes)**
```bash
# Revert backend changes
cd portal-backend
git checkout <commit-before-supabase>

# Redeploy (Vercel auto-deploys on push)
git push origin main --force

# Verify legacy auth endpoints work
curl -X POST https://portal.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Step 3: Restore Database (if schema changed - 30 minutes)**
```bash
# Only if you ran migrations adding supabase_user_id column

# Option A: Rollback migration (if using Drizzle migrations)
npm run db:rollback

# Option B: Manual fix (if using db:push)
# PostgreSQL automatically snapshots before schema changes on Replit
# Use Replit Database pane to restore to previous snapshot

# Or manually remove column
psql $DATABASE_URL -c "ALTER TABLE users DROP COLUMN IF EXISTS supabase_user_id;"
```

**Step 4: Clear Cached Tokens (5 minutes)**
```bash
# Clear Redis/Vercel KV (if refresh tokens linked to Supabase)
redis-cli FLUSHDB

# Or selective deletion
redis-cli KEYS "refresh_token:*" | xargs redis-cli DEL
```

#### Phase 3: Verify Rollback (60-120 minutes)

**Test Checklist:**
- [ ] Legacy login page loads correctly
- [ ] Email/password login works
- [ ] Users can access dashboard
- [ ] User roles load correctly
- [ ] No Supabase errors in browser console
- [ ] No token exchange errors in backend logs
- [ ] Test on 3+ different browsers
- [ ] Test with existing user accounts

**Database Integrity Check:**
```sql
-- Verify no orphaned Supabase references
SELECT COUNT(*) FROM users WHERE supabase_user_id IS NOT NULL;
-- Should be 0 after rollback

-- Verify legacy password_hash exists
SELECT COUNT(*) FROM users WHERE password_hash IS NULL;
-- Should be 0 (or only invited users)
```

#### Phase 4: User Communication

**Email Template:**
```
Subject: Service Restored - Portal Authentication

Hi [User],

We experienced a temporary issue with our authentication system 
between [TIME_START] and [TIME_END]. The issue has been resolved, 
and all services are fully operational.

You may need to log in again. If you have any issues, please reply 
to this email.

We apologize for any inconvenience.

- Teamified Team
```

**In-App Banner:**
```typescript
// Show for 24 hours after rollback
<Alert severity="info">
  We recently resolved a technical issue. If you experience any 
  problems, please contact support@teamified.com
</Alert>
```

#### Phase 5: Post-Mortem (Within 48 hours)

**Document:**
1. Root cause of failure
2. Timeline of events
3. User impact (number affected, duration)
4. Rollback steps taken
5. Lessons learned
6. Prevention measures

**Action Items:**
- [ ] Update rollback documentation
- [ ] Add automated alerts for token exchange failures
- [ ] Improve feature flag implementation
- [ ] Set up staging environment for better testing

### Rollback Prevention Strategies

**Before Launch:**
1. **Create Backup Branch:**
   ```bash
   git checkout -b legacy-auth-backup
   git push origin legacy-auth-backup
   ```

2. **Feature Flag Implementation:**
   ```typescript
   // .env
   USE_SUPABASE_AUTH=true  // Set to false for instant rollback
   
   // AuthContext.tsx
   const useSupabaseAuth = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true';
   
   if (useSupabaseAuth) {
     return <SupabaseAuthProvider />;
   } else {
     return <LegacyAuthProvider />;
   }
   ```

3. **Staged Rollout:**
   - Day 1: Enable for 10% of users (A/B test)
   - Day 3: Enable for 50% of users
   - Day 7: Enable for 100% of users
   - Requires feature flag + user segmentation

4. **Database Snapshot:**
   ```bash
   # Before launching, take manual snapshot
   # On Replit: Use Database pane → "Create Checkpoint"
   # On Vercel Postgres: Auto-snapshots every 24 hours
   
   # Manual backup
   pg_dump $DATABASE_URL > backup-before-supabase-$(date +%Y%m%d).sql
   ```

**During Launch:**
- Monitor error rates in real-time (every 5 minutes for first hour)
- Have team member on standby for rollback
- Test with internal accounts first, then 10 external users

**After Launch:**
- Keep legacy auth code for 30 days
- Monitor Supabase status page: https://status.supabase.com
- Set up alert: If token exchange failure > 5%, notify team

---

## Monitoring & Observability

### Key Metrics to Track

**1. Authentication Metrics:**
- Successful logins/day
- Failed login attempts/day
- Signup conversion rate
- Social login vs. email/password ratio
- Average login time (Supabase → Portal token exchange)

**2. Token Metrics:**
- Portal JWT issuance rate
- Token refresh rate
- Token validation errors

**3. User Metrics:**
- New users/day (via Supabase)
- Active users/day (MAU calculation)
- User retention rate

**4. Error Metrics:**
- Supabase API errors
- Token exchange failures
- Role lookup failures

### Monitoring Tools

**Supabase Dashboard:**
- Built-in analytics
- Auth logs (last 7 days free, 90 days Pro)
- Real-time metrics

**Portal Backend:**
- Existing audit logs (PostgreSQL)
- Add Sentry for error tracking:
  ```bash
  npm install @sentry/node
  ```

**Alerts to Set Up:**
- Supabase API error rate > 5%
- Token exchange endpoint latency > 2s
- Failed login spike (>10x normal)
- Supabase service downtime

### Health Check Endpoint

```typescript
// src/health/health.controller.ts
@Get('health')
async checkHealth() {
  const supabaseOk = await this.checkSupabase();
  const dbOk = await this.checkDatabase();

  return {
    status: supabaseOk && dbOk ? 'healthy' : 'degraded',
    services: {
      supabase: supabaseOk ? 'up' : 'down',
      database: dbOk ? 'up' : 'down',
    },
    timestamp: new Date().toISOString(),
  };
}

private async checkSupabase(): Promise<boolean> {
  try {
    // Ping Supabase health endpoint
    await axios.get(`${process.env.SUPABASE_URL}/health`);
    return true;
  } catch {
    return false;
  }
}
```

---

## Success Metrics

### Week 1 (Days 1-4): Backend Complete
- [ ] Supabase project configured
- [ ] Backend endpoints deployed
- [ ] Token exchange tested (Postman/curl)
- [ ] Database migration successful
- [ ] Unit tests passing (80%+ coverage)

### Week 2 (Days 5-8): Full Integration
- [ ] Portal frontend uses Supabase auth
- [ ] All 3 greenfield apps integrated
- [ ] SSO works across all apps
- [ ] Role enforcement verified (10+ test scenarios)
- [ ] Documentation complete

### 30 Days Post-Launch
- [ ] 95%+ successful login rate
- [ ] Average login time < 3 seconds
- [ ] Zero security incidents
- [ ] < 5 support tickets about login issues
- [ ] SSO works 100% of time

### 90 Days Post-Launch
- [ ] 100% user migration (if applicable)
- [ ] Zero legacy login usage
- [ ] Social login adoption: 30%+ (if promoted)
- [ ] Still under free tier (if < 50k MAU) or Pro tier as expected
- [ ] Average token exchange time < 500ms

---

## Troubleshooting Guide

### Common Issues

**Issue: "Invalid JWT" error in Portal API**

**Cause:** Supabase JWT secret mismatch

**Fix:**
```bash
# Verify JWT secret matches Supabase dashboard
# Settings → API → JWT Settings → JWT Secret
echo $SUPABASE_JWT_SECRET

# Update .env if mismatch
```

---

**Issue: Redirect loop on login**

**Cause:** Callback URL not configured correctly

**Fix:**
1. Check Supabase dashboard → Authentication → URL Configuration
2. Add callback URL: `https://yourapp.com/callback`
3. Clear browser cookies
4. Try again

---

**Issue: "User not found" after Supabase login**

**Cause:** Token exchange failed, user not created in Portal DB

**Debug:**
```bash
# Check Portal API logs
tail -f /var/log/portal-api.log | grep "SUPABASE"

# Check database
psql -d teamified -c "SELECT * FROM users WHERE email='user@example.com';"
```

**Fix:**
- Verify `/auth/supabase/exchange` endpoint returns 200
- Check database connection
- Manually create user if needed

---

**Issue: SSO not working across apps**

**Cause:** Different domains (cookies not shared)

**Solution:**
- Supabase sessions are stored in localStorage (not cookies)
- Each app must call `supabase.auth.getSession()` on load
- Verify all apps use same Supabase project

---

**Issue: Social login fails (Google)**

**Cause:** OAuth app not configured correctly

**Fix:**
1. Check Google Cloud Console → Credentials
2. Verify redirect URI: `https://abc123.supabase.co/auth/v1/callback`
3. Verify client ID/secret in Supabase dashboard
4. Check error message in browser console

---

## Implementation Checklist for Security & Reliability Updates

**Before starting implementation, verify these 4 updates are included:**

### 1. Email Verification Check ✅
- [ ] Updated `SupabaseTokenPayload` interface with `email_confirmed_at` field (line 421)
- [ ] Modified `findOrCreateBySupabase` method to accept `emailConfirmedAt` parameter (line 696)
- [ ] Added email verification check throwing `UnauthorizedException` if not confirmed (lines 699-704)
- [ ] Updated `exchangeToken` in `SupabaseAuthService` to pass `email_confirmed_at` (line 611)
- [ ] Enabled email confirmation in Supabase dashboard (Day 1 setup)

### 2. Rate Limiting ✅
- [ ] Installed `@nestjs/throttler` package (line 355)
- [ ] Added `@Throttle(20, 60)` decorator to `exchangeToken` endpoint (line 522)
- [ ] Imported `ThrottlerModule.forRoot()` in `AuthModule` (lines 976-979)
- [ ] Added `ThrottlerGuard` to global guards in `AppModule` (lines 1018-1023)
- [ ] Updated API response documentation to include 429 status (line 529)
- [ ] Redis running and configured (required for distributed rate limiting)

### 3. CORS Regex Patterns ✅
- [ ] Updated `src/main.ts` CORS configuration with regex patterns (lines 2071-2146)
- [ ] Replaced your-username placeholder with actual Replit username
- [ ] Tested CORS with Replit development URLs
- [ ] Verified production mode uses explicit domains only
- [ ] Added console.warn for blocked origins (line 2114)

### 4. Deletion Queue ✅
- [ ] Installed `@nestjs/bull` and `bull` packages (line 355)
- [ ] Redis running locally or Vercel KV configured (lines 360-378)
- [ ] Created `src/queue/processors/supabase-deletion.processor.ts` (lines 911-987)
- [ ] Created `src/queue/queue.module.ts` (lines 989-1022)
- [ ] Updated `UsersModule` to import `BullModule` (lines 892-909)
- [ ] Updated `UsersService` constructor to inject queue (lines 696-702)
- [ ] Modified `deleteUser` method to use queue on failure (lines 795-821)
- [ ] Added `QueueModule` to `AppModule` imports (line 1015)
- [ ] Verified audit logging includes queue status (lines 811-821, 881-911)

**Testing the Updates:**

```bash
# Test rate limiting
for i in {1..25}; do curl -X POST http://localhost:3000/api/v1/auth/supabase/exchange -H "Content-Type: application/json" -d '{"supabaseAccessToken": "test"}'; done
# Should see 429 errors after 20 requests

# Test email verification
# 1. Create Supabase user without confirming email
# 2. Try to exchange token - should receive "Email not confirmed" error

# Test CORS
curl -H "Origin: https://random-app.someone-else.repl.co" http://localhost:3000/api/health
# Should see CORS error in server logs

# Test deletion queue
# 1. Temporarily break Supabase connection
# 2. Delete a user
# 3. Check Redis for queued job: redis-cli KEYS "bull:supabase-user-deletion:*"
# 4. Restore connection and verify retry succeeds
```

---

## Next Steps

### Pre-Implementation Checklist

**Before starting Day 1:**
- [✅] Create Supabase account
- [✅] Decide on social providers (Google, LinkedIn, etc.)
- [✅] Get Google OAuth credentials (if using)
- [✅] Assign developer(s) to project (you!)
- [✅] **Set up Redis infrastructure (REQUIRED)** ← You already have `REDIS_URL` configured!
- [ ] Set up Sentry for error tracking (optional) ← Skip if not needed
- [ ] Notify users of upcoming auth changes (if existing users) ← Do this when ready to deploy

#### Redis Infrastructure Setup (REQUIRED)

**Why Redis is Required:**
Redis is mandatory for two critical features:
1. **Rate Limiting** - `@nestjs/throttler` requires Redis for distributed rate limiting across multiple instances
2. **Queue Processing** - Bull requires Redis for the deletion retry queue and dead-letter queue

**❓ Why Not Use Replit's Built-in ReplDB?**

Replit **does** provide a built-in Key-Value Store (ReplDB) with 50 MiB storage and 5,000 keys, which is excellent for application data. However, there's a critical incompatibility:

- **ReplDB** uses a proprietary API (similar to Python dictionaries/JavaScript objects)
- **Redis Protocol** is what `@nestjs/throttler` and `Bull` expect (Redis commands like `INCR`, `EXPIRE`, `RPUSH`, `ZADD`, etc.)

**Technical Incompatibility:**
```typescript
// @nestjs/throttler expects Redis protocol
ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redisClient), // Needs actual Redis
});

// Bull queue expects Redis commands
Queue('my-queue', {
  redis: { host, port }, // Expects Redis-compatible server
});
```

These libraries cannot connect to ReplDB because they issue Redis-specific commands that ReplDB doesn't understand.

**Alternatives:**
1. ✅ **Use external Redis** (Vercel KV/Upstash) - Recommended, fully compatible
2. ⚠️ **Build custom rate limiting** using ReplDB - Requires rewriting `@nestjs/throttler` logic
3. ⚠️ **Build custom queue** using ReplDB - Requires rewriting Bull queue logic

For this implementation, **we use external Redis** (Vercel KV or Upstash) because it's production-ready and requires zero custom code.

---

**Setup Options:**

**Option 1: Local Development (Docker)**
```bash
# Pull and run Redis Docker container
docker run --name portal-redis -p 6379:6379 -d redis:7-alpine

# Verify it's running
docker ps | grep portal-redis

# Test connection
docker exec -it portal-redis redis-cli ping
# Expected output: PONG
```

**Option 2: Local Development (Native)**
```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# Verify connection
redis-cli ping
# Expected output: PONG
```

**Option 3: Replit/Production (Vercel KV/Upstash)**
```bash
# For Replit deployment:
# 1. Go to Vercel dashboard → Storage → Create KV Database
# 2. Copy connection details:
#    - REDIS_HOST (e.g., abc123.kv.vercel-storage.com)
#    - REDIS_PORT (usually 6379)
#    - REDIS_PASSWORD (from Vercel dashboard)

# 3. Add to Replit Secrets:
REDIS_HOST=your-redis-host.vercel-storage.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password-here

# Alternative: Upstash Redis
# 1. Go to https://upstash.com → Create Redis Database
# 2. Copy connection string
# 3. Add to Replit Secrets (same format as above)
```

**Environment Variables:**

Add these to your `.env` file (local) or Replit Secrets (production):

```bash
# Option 1: Single connection URL (RECOMMENDED for Vercel KV/Upstash)
REDIS_URL=redis://default:your-password@your-instance.kv.vercel-storage.com:6379

# Option 2: Separate variables (fallback for local development)
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD= (leave empty for local)
```

**Your Current Setup:** ✅ You already have `REDIS_URL` configured, so you're all set!

**Connection Testing:**

Run these commands to verify Redis is properly configured:

```bash
# Test 1: Direct connection with redis-cli
redis-cli -h localhost -p 6379 ping
# Expected: PONG

# Test 2: Set and get a test value
redis-cli SET test_key "Hello Redis"
redis-cli GET test_key
# Expected: "Hello Redis"

# Test 3: Check Redis info
redis-cli INFO server
# Should show Redis version and uptime

# Test 4: For remote Redis (Vercel KV/Upstash)
redis-cli -h your-instance.kv.vercel-storage.com -p 6379 -a your-password ping
# Expected: PONG
```

**Verify Backend Connection:**

After starting your NestJS backend with Redis configured:

```bash
# Start backend
npm run start:dev

# Check logs for successful Redis connection
# You should see:
# [BullModule] Successfully connected to Redis at localhost:6379
# [ThrottlerModule] Redis storage initialized

# Test rate limiting endpoint
for i in {1..25}; do curl -X POST http://localhost:3000/api/v1/auth/supabase/exchange -H "Content-Type: application/json" -d '{"supabaseAccessToken": "test"}' && echo "Request $i"; done
# You should see 429 errors after 20 requests (confirms Redis rate limiting works)

# Check Bull queue status
redis-cli KEYS "bull:*"
# Should show queue-related keys when jobs are running
```

**Troubleshooting Redis Connection:**

```bash
# Issue: "ECONNREFUSED 127.0.0.1:6379"
# Solution: Redis is not running
docker ps | grep redis  # Check if container is running
docker start portal-redis  # Start it if stopped

# Issue: "NOAUTH Authentication required"
# Solution: Add REDIS_PASSWORD to environment variables

# Issue: "Connection timeout"
# Solution: Check firewall, verify host/port, test with redis-cli first

# Issue: Bull queue not processing jobs
# Solution: Verify Redis connection, check for errors in logs
redis-cli MONITOR  # Watch real-time Redis commands
```

**Production Checklist:**
- [ ] Redis instance is running and accessible
- [ ] REDIS_HOST, REDIS_PORT, REDIS_PASSWORD configured in Replit Secrets
- [ ] Connection test succeeds: `redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping`
- [ ] Backend logs show successful Redis connection
- [ ] Rate limiting test shows 429 errors after 20 requests
- [ ] Bull queue keys visible in Redis: `redis-cli KEYS "bull:*"`
- [ ] Redis has sufficient memory (at least 256MB recommended)
- [ ] Redis persistence enabled (AOF or RDB) for queue durability

### Post-Implementation

**After Day 8:**
- [ ] Deploy to staging environment
- [ ] Beta test with 10-20 users
- [ ] Fix any issues found
- [ ] Deploy to production
- [ ] Monitor metrics for 48 hours
- [ ] Gradually migrate existing users (if applicable)

### Future Enhancements (Post-MVP)

1. **MFA Enforcement** (Week 3-4)
   - Require MFA for admin roles
   - Optional MFA for regular users

2. **Social Login Expansion** (Week 4)
   - Add LinkedIn (for candidates)
   - Add Microsoft (for enterprise clients)

3. **Magic Links** (Week 5)
   - Passwordless login via email
   - Faster for candidates

4. **Session Management UI** (Week 6)
   - Show active sessions
   - Ability to revoke sessions
   - "Log out all devices"

5. **Advanced Audit Logging** (Week 7)
   - Login location tracking (IP → city)
   - Device fingerprinting
   - Suspicious activity alerts

---

## Resources

### Official Documentation
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase React Quickstart](https://supabase.com/docs/guides/auth/quickstart/react)
- [Supabase Management API](https://supabase.com/docs/reference/javascript/admin-api)

### Code Examples
- [Supabase Auth Helpers](https://github.com/supabase/auth-helpers)
- [Next.js + Supabase Example](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

### Status & Support
- [Supabase Status Page](https://status.supabase.com)
- [Supabase Support](https://supabase.com/support)

---

## Appendix: Comparison to Original Custom OAuth Plan

| Aspect | Custom OAuth (Original Plan) | Supabase (This Plan) |
|--------|------------------------------|----------------------|
| **Implementation Time** | 9 weeks | 6-8 days |
| **Code to Write** | ~5,000 lines | ~500 lines |
| **Security Responsibility** | Full (you own it) | Shared (Supabase handles auth) |
| **Social Login** | Must build (2+ weeks) | Built-in (2 hours) |
| **MFA** | Must build (1 week) | Built-in (15 mins) |
| **Maintenance** | Ongoing (security patches) | None (Supabase handles) |
| **Cost @ 180k MAU** | $10k/year maintenance | $5,364/year |
| **Compliance** | DIY | SOC2 Type II included |
| **Vendor Lock-in** | None | Low (open source, can self-host) |
| **Replit Compatible** | Yes (but complex setup) | ✅ Yes (seamless integration) |

**Key Insights:**
- Supabase delivers 90% of custom OAuth functionality in 10% of the time at lower cost
- Better security posture for your high-volume candidate use case (1k-6k signups/day)
- **Perfect for Replit deployments** - no infrastructure setup, works with Replit Secrets, handles dynamic URLs

---

**Document Version:** 1.0
**Last Updated:** November 6, 2025
**Author:** Sarah (Product Owner)
**Status:** Ready for Implementation
**Approval Required:** Yes

---

## Approval Sign-Off

**Approved by:** ___________________
**Date:** ___________________
**Start Date:** ___________________
**Expected Completion:** ___________________ (Start Date + 8 days)
