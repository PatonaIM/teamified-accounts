# Teamified Accounts & SSO Platform

## Overview

The Teamified Accounts & SSO Platform is a centralized authentication and user management system providing secure Single Sign-On (SSO), multi-organization support, and comprehensive user management. It enables seamless OAuth 2.0 + PKCE authentication across applications, supports organization-based multitenancy, and offers granular role-based access control for various user types. The platform aims to streamline user access and management for internal and external stakeholders.

## User Preferences

Preferred communication style: Simple, everyday language.

## Developer Documentation

- [Documentation Index](./docs/README.md) - Main documentation entry point
- [Deep Linking Guide](./docs/deep_linking_using_teamified_accounts_guide.md) - Session persistence and deep linking implementation for client apps

## System Architecture

### Backend Architecture

The backend is built with **NestJS (TypeScript)**, featuring a modular design. **PostgreSQL** with **TypeORM** handles data storage, utilizing JSONB for flexible user profile data. Authentication is **JWT-based** with refresh tokens and comprehensive role-based access control (RBAC). **Vercel Blob Storage** manages file uploads, and API documentation is generated via **Swagger/OpenAPI**. Core features include a centralized audit module and extensive data validation.

### Frontend Architecture

The frontend uses **React 19, TypeScript, and Vite**. **Material-UI (MUI v7)**, styled with a **Tailwind CSS**-based design system, provides a consistent UI with dynamic theming. **React Router v7** manages declarative and protected routing, and state management relies on **React hooks**.

#### Centralized API Client

All API communication utilizes a **single, centralized axios instance** (`frontend/src/services/api.ts`) for automatic token refresh, CSRF protection, and consistent authentication, preventing token reuse issues.

#### Modules

-   **Hiring Module**: Integrates Job Request, Interview, and Talent Pool features using a service-layer pattern with custom React hooks, infinite scroll pagination, and a Calendar View (`react-big-calendar`).
-   **Salary History Module**: Provides organization-wide salary tracking for admin/HR with server-side pagination, filtering, and role-based access.
-   **Client Management Module**: Enables CRUD operations for customer organizations (clients) for admin/HR roles, using native MUI Tables, Drawer Forms, and JSONB for contact information.
-   **Profile Management**: Offers a user profile page with Material-UI 3 Expressive Design, icon-based editing, secondary email support, and profile picture display from Vercel Blob Storage.
-   **SSO Integration Test Page**: A `/test` route demonstrating the OAuth 2.0 + PKCE authentication flow for developers with intent testing capabilities.

### Data Model Architecture

The data model includes a flexible JSONB field for user profile data within the User entity. Employment and salary histories are normalized. Role management uses a `UserRole` entity with scope-based permissions. Multi-country payroll is supported via `Country`, `Currency`, `TaxYear`, and `PayrollPeriod` entities. Document management is categorized for HR and onboarding.

### Security Architecture

Security features include **Argon2** for password hashing, multi-tier **NestJS Throttler** for rate limiting, and **Redis-backed session storage** for refresh token management. Client scoping is implemented via `clientId` in JWTs.

#### CORS Configuration

CORS restrictions are **disabled** to support cross-origin OAuth 2.0 integrations, allowing requests from any origin with credentials enabled. Public OAuth endpoints (`/api/v1/sso/authorize`, `/api/v1/sso/token`) are accessible without JWT, while other endpoints require valid JWTs.

#### Dual Token Approach (Bearer + Cookie)

The platform uses a dual-token strategy: Bearer tokens in Authorization headers for API calls and httpOnly cookies for seamless browser-based SSO redirects to the OAuth authorize endpoint. This secures SSO flows while maintaining explicit control for API authentication.

#### Session Management & Inactivity Timeout

Sessions have a **48-hour inactivity timeout** with activity tracked via `last_activity_at` on token refresh, extending across connected SSO applications. There is also a **30-day absolute expiry** regardless of activity.

#### API Key Management

The platform supports programmatic access via API keys, alternative to JWTs. Keys are **Bcrypt-hashed**, use 10-character prefixes for lookup, and offer `read_only` or `full_access`. Each user can create up to 10 keys, with audit logging for all key actions and a dedicated MUI settings UI.

#### Intent-Aware SSO (November 24, 2025)

The SSO system now supports **audience-based access control** via an intent parameter to route users based on their type (client vs candidate):

**Intent Types:**
- `'client'`: Restricts access to users with client organization roles (client_*, internal_*)
- `'candidate'`: Restricts access to candidate users without client roles
- `'both'`: Allows access to all authenticated users (default)

**Security Model:**
- OAuth clients have a `default_intent` field (stored in database) that is **authoritative**
- Runtime `intent` query parameter can only **narrow** access, never widen it
- Prevents privilege escalation attacks by enforcing intersection-based resolution
- Example: If client's `default_intent='client'`, runtime `intent='both'` is ignored
- **Internal User Bypass**: Users with `super_admin` or `internal_*` roles bypass all intent restrictions

**User Type Classification:**
- Users with roles starting with `client_` or `internal_`, or with `super_admin` role → classified as 'client'
- Users without such roles → classified as 'candidate'
- Classification uses optimized sync method `classifyUserType()` to avoid redundant DB lookups

**Error Handling:**
- Intent mismatches return OAuth-compliant error redirects preserving state
- Error: `access_denied` with descriptive `error_description` parameter
- Candidate trying client-only app → redirected with suggestion to create/join client org
- Client trying candidate-only app → redirected with error message

**Intent-Aware Signup Flow (November 25, 2025):**
- When SSO flow includes an `intent` parameter, the signup page skips the user type selection
- `intent=candidate` → automatically redirects to candidate signup form
- `intent=client` → automatically redirects to employer signup form
- `intent=both` or not specified → shows the selection page with both options
- Login page extracts intent from the SSO authorize URL's returnUrl parameter

**Implementation Files:**
- Migration: `src/migrations/1732436400000-AddDefaultIntentToOAuthClients.ts`
- Backend service: `src/sso/sso.service.ts` (resolveEffectiveIntent, validateUserIntent, isInternalUser)
- User classification: `src/users/services/user.service.ts` (getUserType, classifyUserType)
- OAuth entity: `src/oauth-clients/entities/oauth-client.entity.ts` (default_intent field)
- Frontend test page: `frontend/src/pages/test/IntegratedTestSuite.tsx` (intent dropdown)
- Admin UI: `frontend/src/components/settings/OAuthClientDialog.tsx` (default_intent configuration)
- Login page: `frontend/src/pages/LoginPageMUI.tsx` (intent extraction and passing)
- Signup selection: `frontend/src/pages/SignupPathSelectionPage.tsx` (auto-redirect based on intent)

## External Dependencies

### Third-Party Services

-   **Vercel Blob Storage**: Cloud storage for production file uploads.
-   **Redis/Vercel KV**: For session management and caching.
-   **Workable API**: Integrates for syncing candidates and job postings.
-   **Email Service (Nodemailer)**: For transactional email functionalities.
-   **Supabase**: Provides authentication services including Google OAuth.

### Database

-   **PostgreSQL**: The primary relational database, configured with TypeORM and SSL.

### Build & Deployment

-   **Replit**: Used for development and production hosting, with Reserved VM deployment.

#### Production Deployment Configuration

The platform uses **Replit Reserved VM** for production deployments with the following configuration:

**Port Configuration:**
-   **Development (Preview)**: Backend runs on port 3000, Frontend runs on port 5000 (Vite dev server)
-   **Production (Published App)**: NestJS listens on port 5000, serves both static frontend AND backend API from a single process
-   **Environment Variables**: `PORT=5000` and `NODE_ENV=production` are set in the production environment

**Build & Deployment Process:**
1. `npm run build:all` - Builds both frontend (`frontend/dist`) and backend (`dist/`) for production, then copies frontend files to `dist/public/` (runs automatically on publish)
2. `npm run start:prod` - Starts NestJS which:
   - Serves static frontend files from `dist/public/` at root routes
   - Serves backend API at `/api/*` routes
   - Listens on port 5000
   - SPA fallback route serves `index.html` for all non-API routes

**Environment Detection Logic (src/main.ts):**
- The backend detects Vercel serverless environment via `VERCEL` or `VERCEL_ENV` environment variables
- In Vercel: Returns Express instance without calling `app.listen()` (serverless function handler)
- In Replit (dev/production): Always calls `app.listen()` on configured port

**Critical Fixes (November 22, 2025):**
1. **Production Port Detection Issue** - Fixed backend listening on wrong port in production deployment
   - **Root cause**: Port detection logic checked `REPLIT_DEV_DOMAIN` which exists even in production, causing app to use port 3000 instead of 5000
   - **Impact**: .replit expects port 5000, but app opened port 3000, causing "port never opened" deployment failures
   - **Fix**: Port logic now prioritizes explicit `PORT` environment variable (production sets PORT=5000 in .replit)
   - **Logic**: If PORT env var is set → use it; if not set → default to 3000 for development
   - Development correctly uses port 3000 (PORT not set), production uses port 5000 (PORT=5000 from .replit)
   
2. **Automatic Port Configuration** - Replit automatically adds port mappings to .replit when detecting open ports
   - Reserved VM deployments support only **one external port**; multiple port entries cause deployment failure
   - Solution: Disable automatic port forwarding in User Settings → "Automatic port forwarding" → "Never"
   - Production requires only: `[[ports]] localPort = 5000, externalPort = 80`

2. **API Client Timeout Configuration** - Added 30-second timeout to centralized API client
   - API requests: 30-second timeout (prevents indefinite hangs)
   - Refresh token calls: 15-second timeout
   - Migrated `profileService.ts` and `MyProfilePage.tsx` from raw axios to centralized API client
   - Ensures consistent timeout behavior across all API calls in Preview and Published App

3. **Theme Preference Persistence** - Implemented theme preference caching across login/logout sessions
   - Backend login response includes user's theme preference from `profileData.themePreference.themeMode`
   - Supports theme modes: `'light' | 'dark' | 'teamified' | 'custom'`
   - Frontend caches theme to localStorage immediately after login
   - Prevents flash of incorrect theme on page load

4. **Production Static File Serving** - Fixed frontend not being served in Published App (November 22, 2025)
   - Build process now copies frontend build (`frontend/dist/*`) to `dist/public/` during deployment
   - Backend serves static files from `dist/public/` with proper cache headers in production mode
   - SPA fallback route registered after all API routes to ensure API endpoints work correctly
   - Frontend assets and API requests now both work correctly in production deployment

5. **SPA Fallback Route Fix** - Fixed API endpoints returning HTML in Published App (November 22, 2025)
   - **Root cause**: SPA fallback used catch-all route `expressApp.get('*')` which intercepted ALL requests including /api/* endpoints
   - **Impact**: API calls in Published App returned `index.html` instead of JSON, breaking authentication and all API features
   - **Fix**: Changed SPA fallback route pattern from `'*'` to regex `/^(?!\/api).*$/` (negative lookahead excludes /api paths)
   - **Scope**: Production-only fix (inside `if (isProduction && frontendPath)` conditional in src/main.ts)
   - **Pattern Explanation**: `/^(?!\/api).*$/` matches any path that does NOT start with `/api`, allowing frontend SPA routes while preserving API endpoints
   - **Result**: API endpoints now correctly return JSON, frontend routes still receive index.html for client-side routing