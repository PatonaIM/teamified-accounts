# Teamified Accounts & SSO Platform

## Overview

The Teamified Accounts & SSO Platform is a centralized, secure authentication and user management system offering Single Sign-On (SSO), multi-organization support, and granular role-based access control. Its primary purpose is to provide seamless OAuth 2.0 + PKCE authentication across applications, support organization-based multitenancy, and streamline user access for internal and external stakeholders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend utilizes React 19, TypeScript, and Vite, styled with Material-UI (MUI v7) and a Tailwind CSS-based design system for a consistent UI with dynamic theming. It includes an expressive design for user profiles and consistent component usage across modules.

### Technical Implementations

The backend is built with NestJS (TypeScript), featuring a modular design, JWT-based authentication with refresh tokens, and comprehensive role-based access control (RBAC). A centralized audit module and extensive data validation are integrated. The frontend uses React Router v7 for declarative and protected routing, with state management via React hooks. A single, centralized Axios instance handles all API communication, ensuring automatic token refresh and CSRF protection.

Core features include:
- **Hiring Module**: Integrates Job Request, Interview, and Talent Pool functionalities.
- **Salary History Module**: Provides organization-wide salary tracking with server-side pagination.
- **Client Management Module**: Enables CRUD operations for customer organizations.
- **Profile Management**: Unified profile page at `/account/profile` with view/edit mode toggle (pencil icon). View mode displays read-only account information including linked emails, password last updated timestamp, organizational access, and account status. Edit mode reveals LinkedEmails and ChangePassword components for managing linked emails and self-service password changes. The User entity tracks `passwordUpdatedAt` timestamp for all password change flows.
- **SSO Integration Test Page**: A `/test` route to demonstrate OAuth 2.0 + PKCE flow.
- **Session Persistence & Deep Linking**: Ensures users remain logged in and are redirected to their last visited page after refresh or re-access.
- **API Key Management**: Supports programmatic access via configurable API keys with audit logging.
- **Intent-Aware SSO**: Routes users based on predefined 'client' or 'candidate' intents, preventing privilege escalation and guiding signup flows.
- **Documentation Portal**: Sidebar-based documentation system with nested routes under `/docs`, featuring Product Guide, Developer Guide, and Release Notes sections as individual pages.
- **My Apps Dropdown**: Google Workspace-style app launcher in the header showing role-based accessible applications. Clicking an app opens it in a new tab via OAuth authorize flow for seamless single sign-on. Apps include: Jobseeker Portal, ATS Portal, HRIS Portal, Team Connect, and Alexia AI.
- **Direct Google OAuth Integration**: Users can sign in with "Continue with Google" alongside traditional email-password login. Features:
  - Direct OAuth 2.0 flow without third-party vendor dependency (replaces Supabase)
  - Secure temporary code exchange pattern (tokens never exposed in URLs)
  - Automatic user creation or account linking for Google sign-ins
  - httpOnly cookie-based token storage for enhanced security
  - Google user ID stored in `google_user_id` column for identity linking
  - Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets from Google Cloud Console
  - Redirect URI must be configured in Google Cloud Console as: `{BASE_URL}/api/v1/auth/google/callback`
  - **Intent-Aware Role Selection**: New Google users are prompted to choose Candidate or Employer roles (matching email signup UX):
    - Candidates: One-click signup with no additional form required
    - Employers: Minimal form with just organization name to get started
    - API endpoint: `POST /api/v1/auth/google/assign-role` for role assignment after selection
    - Frontend page: `/signup/google-path` for role selection flow
  - **Unified Welcome Emails**: All new users receive personalized welcome emails with role-specific CTAs:
    - Candidates: "Browse Jobs" button linking to Jobseeker Portal
    - Employers: "Post Your First Job" (ATS) and "Set Up Your Organization" (HRIS) buttons
    - Sent after email verification for email signup users, after role selection for Google users

- **Multi-Identity SSO (Candidate + Employee Model)**: Users can link multiple email addresses (personal and work emails for different organizations) that all resolve to a single user identity. Login works with any linked email using a single password. Key features:
  - UserEmail entity for storing multiple emails per user with types (personal/work) and organization linking
  - Smart identity resolution via `findUserByAnyEmail` helper method in AuthService
  - Self-service password change endpoint requiring old password verification (no email flow)
  - **Employer-Driven Work Email Provisioning**: Work emails are added exclusively through employer invitations during onboarding - users cannot self-add work emails. This ensures proper organizational control and identity verification.
  - **Account Linking During Onboarding**: When accepting a work email invitation, employees can optionally link to an existing personal account by providing their personal email and verifying with their existing password.
  - API endpoints at `/api/user-emails` for email CRUD operations (personal emails only for self-service)
  - Frontend Account Profile page at `/account/profile` with:
    - LinkedEmails component: View all linked emails, add personal emails only, set primary, remove non-primary emails
    - ChangePassword component: Self-service password change with old password verification
    - Work emails section is display-only (no self-service add button)
  - Invitation acceptance page at `/invitations/accept/:code` includes optional account linking flow

### Documentation Architecture

The documentation system uses a sidebar navigation layout:
- **Location**: `frontend/src/pages/docs/` for pages, `frontend/src/components/docs/` for layout components
- **Navigation Config**: `navConfig.ts` drives the sidebar structure for all documentation sections
- **Layout**: `DocsLayout.tsx` provides the shell with sidebar + content area using React Router Outlet
- **Sidebar**: `DocsSidebar.tsx` handles navigation with collapsible sections and active state highlighting
- **Pages**: Individual pages organized under `product/`, `developer/`, and `release-notes/` subdirectories

### System Design Choices

The data model uses PostgreSQL with TypeORM, featuring a flexible JSONB field for user profiles, normalized employment/salary histories, and a `UserRole` entity for scope-based permissions. Security is enforced with Argon2 for password hashing, NestJS Throttler for rate limiting, and Redis-backed session storage. CORS restrictions are disabled for OAuth 2.0 integrations, and a dual-token strategy (Bearer + httpOnly cookie) secures SSO flows. Session management includes a 72-hour inactivity timeout and a 30-day absolute expiry. The platform is designed for production deployment on Replit Reserved VMs, serving both static frontend and backend API from a single process.

## External Dependencies

### Third-Party Services

-   **Vercel Blob Storage**: For file uploads (e.g., profile pictures).
-   **Redis/Vercel KV**: For session management and caching.
-   **Workable API**: For syncing candidates and job postings.
-   **Nodemailer**: For transactional email functionalities.
-   **Supabase**: Provides authentication services (legacy, being replaced).
-   **Google OAuth**: Direct Google OAuth integration for "Continue with Google" sign-in (requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets).

### Database

-   **PostgreSQL**: Primary relational database, managed with TypeORM.

### Build & Deployment

-   **Replit**: Development and production hosting platform, utilizing Reserved VM deployment.