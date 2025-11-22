# Teamified Accounts & SSO Platform

## Overview

The Teamified Accounts & SSO Platform is a centralized authentication and user management system providing secure Single Sign-On (SSO), multi-organization support, and comprehensive user management. It enables seamless OAuth 2.0 + PKCE authentication across applications, supports organization-based multitenancy, and offers granular role-based access control for various user types. The platform aims to streamline user access and management for internal and external stakeholders.

## User Preferences

Preferred communication style: Simple, everyday language.

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
-   **SSO Integration Test Page**: A `/test` route demonstrating the OAuth 2.0 + PKCE authentication flow for developers, hardcoded to use a `test-client`.

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
1. **Backend Production Listening Issue** - Fixed backend not calling `app.listen()` in Replit Reserved VM production
   - Previous logic incorrectly treated Replit production as Vercel serverless environment
   - Now properly detects Vercel vs. Replit using environment-specific variables
   - Backend now properly listens on port 5000 in both development and production Replit environments

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