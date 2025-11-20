# Teamified Team Member Portal

## Overview

The Teamified Team Member Portal is an Employer of Record (EOR) management system designed to streamline the entire employee lifecycle, from candidate onboarding to employment, payroll, timesheets, and leave management across India, Philippines, and Australia. It aims to consolidate fragmented HR processes into a single platform, offering self-service capabilities, robust audit trails, and compliance tracking, thereby providing significant market potential for EOR operations. The platform supports multi-organization client management and granular role-based access control for Admins, HR Managers, Client Users, EOR employees, and Candidates.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 20, 2025**: Completed comprehensive terminology refactoring from "tenant" to "organization" across the entire codebase. This included:
- Renamed frontend page from `TenantManagementPage.tsx` to `OrganizationManagementPage.tsx`
- Renamed documentation page from `MultitenancyIntegrationPage.tsx` to `MultiOrganizationIntegrationPage.tsx`
- Updated all user-facing strings, API documentation, code comments, and variable names across frontend and backend
- Updated route paths from `/admin/tenants` to `/admin/organizations`
- Updated all documentation files (replit.md, PRD docs, architecture docs) to use "organization" terminology
- System now consistently uses "organization" and "multi-organization" terminology throughout

## System Architecture

### Backend Architecture

The backend utilizes **NestJS (TypeScript)** with a modular design. **PostgreSQL** with **TypeORM** serves as the robust data store, employing JSONB for flexible user profile data. Authentication is **JWT-based** with refresh tokens and comprehensive role-based access control (RBAC). **Vercel Blob Storage** handles production file uploads. API documentation is generated via **Swagger/OpenAPI**. Core features include a centralized audit module for compliance and extensive data validation.

### Frontend Architecture

The frontend is built with **React 19, TypeScript, and Vite**. **Material-UI (MUI v7)**, styled with a **Tailwind CSS**-based design system, provides a consistent and customizable UI through a dynamic theming system with 5 preset themes and a Theme Editor. **React Router v7** manages declarative and protected routing. State management relies on **React hooks**.

#### Centralized API Client

All API communication uses a **single, centralized axios instance** (`frontend/src/services/api.ts`) with:
- **Automatic Token Refresh:** Intercepts 401 errors and refreshes access tokens seamlessly
- **CSRF Protection:** Built-in CSRF token support for mutating requests  
- **Consistent Authentication:** All services share the same auth logic, preventing token reuse issues
- **Request/Response Interceptors:** Automatically adds Authorization headers and handles errors

**Architecture Decision:** After encountering token reuse issues with multiple axios instances, all services were consolidated to use a single client exported from `authService.ts`. This ensures reliable authentication and prevents premature logouts during API requests.

#### Hiring Module

The hiring module integrates Job Request, Interview, and Talent Pool features. It employs a **service-layer pattern** with custom React hooks for data fetching and implements **infinite scroll pagination** with race condition protection. Authentication uses a consistent `useAuth` hook. Dedicated routes are protected with role-based access. A **Calendar View** leveraging `react-big-calendar` is integrated for interviews, supporting various views and theme-aware styling. All styling adheres to `theme.palette` for seamless dark/light mode transitions.

#### Salary History Module

The salary history module provides organization-wide salary tracking for admin/HR roles with comprehensive pagination and filtering capabilities. Implementation features include:

-   **Server-Side Pagination**: Uses shared `PaginatedResponseDto<T>` pattern with TypeORM's `getManyAndCount()` for accurate total counts
-   **Default Page Size**: 50 records per page with options for 10, 25, 50, or 100 records
-   **Always-Visible Controls**: Pagination controls remain visible at table bottom regardless of result count
-   **Filter Reset Protection**: Ref-based guard prevents race conditions by resetting page to 0 when filters change, ensuring exactly one API call at offset=0
-   **Organization Summary**: Aggregated statistics across all active employment records without user filtering
-   **Role-Based Access**: Restricted to admin/hr roles via RoleBasedRoute wrapper; regular EOR employees access salary info via profile page only

#### Client Management Module

The client management module enables admin/HR roles to manage Teamified's customer organizations (clients) with full CRUD operations. Implementation features include:

-   **Native MUI Tables**: Uses MUI Table components (not DataGrid) for design consistency with UserList, Employment Records, and Salary History
-   **Centered Typography**: All table cells use centered alignment with `body2` variant (0.875rem font size)
-   **Theme-Aware Status Chips**: Status indicators use semantic colors from theme palette for dark/light mode compatibility
-   **Standard Pagination**: TablePagination with 10, 25, 50, 100 rows per page options
-   **Drawer Form UI**: Create/edit clients via slide-in drawer with Stack-based form layout (MUI v7 compatible)
-   **International Address Fields**: Contact info uses `postalCode` (not "zip") for better recognition in India, Philippines, and Australia markets
-   **JSONB Contact Storage**: Client contact information stored in flexible JSONB field, migrated to use standardized `postalCode` field naming

#### Profile Management

The user profile page (`/account/profile`) provides Material-UI 3 Expressive Design with icon-based editing interface. Implementation features include:

-   **Icon-Based Editing**: Pencil icon to enter edit mode, X icon to cancel, check icon to save
-   **Smooth UX**: Profile saves update local state only without triggering AuthContext refresh, preventing page reload feeling
-   **Secondary Email**: Users can add a secondary email address stored in `profileData.secondaryEmail` JSONB field
-   **Profile Picture**: Displays user avatar from Vercel Blob Storage
-   **Role Display**: Shows user roles (e.g., "super_admin") fetched from backend `/v1/users/me` endpoint
-   **Design System**: Uses 16px rounded corners (borderRadius: 2) for buttons, 6 for cards, and purple gradient primary buttons

#### SSO Integration Test Page

The SSO test page (`/test`) provides a browser-based demonstration of the OAuth 2.0 + PKCE authentication flow. Implementation features include:

-   **Developer Sandbox Client**: Hardcoded to use `test-client` OAuth client ID, pre-configured in the database as a public client
-   **PKCE Flow**: Implements SHA-256 code challenge method for secure browser-based authentication without client secrets
-   **Complete OAuth Cycle**: 
    1. Generates code verifier and challenge
    2. Redirects to `/api/v1/sso/authorize` endpoint
    3. Handles login redirect for unauthenticated users
    4. Exchanges authorization code for access token
    5. Fetches and displays user information
-   **User Info Display**: After successful authentication shows User ID, Email, Name, Roles, and truncated Access Token
-   **Session Management**: "Clear Session & Test Again" button resets the test flow
-   **Public Route**: Always uses light mode theme per public page routing rules

### Data Model Architecture

The data model features flexible user profile data in a **JSONB field** within the User entity. Employment and salary histories are managed by normalized entities. Role management is facilitated by a `UserRole` entity supporting scope-based permissions. Multi-country payroll is supported via dedicated entities for `Country`, `Currency`, `TaxYear`, and `PayrollPeriod`. Document management is categorized for HR and onboarding processes.

### Security Architecture

Security measures include **Argon2** for password hashing, multi-tier **NestJS Throttler** for rate limiting, environment-aware **CORS configuration**, and **Redis-backed session storage** for refresh token management. Client scoping is implemented by embedding `clientId` in JWTs to enable efficient data filtering.

#### API Key Management

The platform supports programmatic access through API keys as an alternative to JWT-based authentication. API keys enable automation, CLI tools, and third-party integrations to securely access the portal. Key features include:

-   **Dual Authentication Methods**: JWT tokens for browser sessions and API keys for programmatic access
-   **Bcrypt-Hashed Keys**: Full API keys are hashed using bcrypt before storage, ensuring security
-   **Prefix Indexing**: Keys use indexed 10-character prefixes (format: `tmf_<random_hex>`) for fast lookup and validation
-   **Access Types**: 
    -   `read_only`: View-only access to data
    -   `full_access`: Read and write permissions
-   **10-Key Limit**: Each user can create up to 10 active API keys
-   **Audit Logging**: All API key creation, deletion, and usage events are logged in the centralized audit trail
-   **MUI Settings UI**: Theme-aware management interface in Settings → API Keys tab with full CRUD operations
-   **TypeORM Entity**: Database table with indexed prefix column for performance optimization

## External Dependencies

### Third-Party Services

-   **Vercel Blob Storage**: Cloud storage for production file uploads.
-   **Redis/Vercel KV**: Used for session management and caching.
-   **Workable API**: Integrates for syncing candidates and job postings.
-   **Email Service (Nodemailer)**: For transactional email functionalities.
-   **Supabase**: Provides authentication services including Google OAuth.

### Database

-   **PostgreSQL**: The primary relational database, configured with TypeORM and SSL for production.

### Build & Deployment

-   **Replit**: Utilized for both development and production hosting, with Autoscale deployment serving both frontend and backend from a single instance.