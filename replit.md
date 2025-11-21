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

-   **Replit**: Used for development and production hosting, with Autoscale deployment.