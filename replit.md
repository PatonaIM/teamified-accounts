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
- **Profile Management**: Offers a user profile page with editable fields and profile picture display.
- **SSO Integration Test Page**: A `/test` route to demonstrate OAuth 2.0 + PKCE flow.
- **Session Persistence & Deep Linking**: Ensures users remain logged in and are redirected to their last visited page after refresh or re-access.
- **API Key Management**: Supports programmatic access via configurable API keys with audit logging.
- **Intent-Aware SSO**: Routes users based on predefined 'client' or 'candidate' intents, preventing privilege escalation and guiding signup flows.

### System Design Choices

The data model uses PostgreSQL with TypeORM, featuring a flexible JSONB field for user profiles, normalized employment/salary histories, and a `UserRole` entity for scope-based permissions. Security is enforced with Argon2 for password hashing, NestJS Throttler for rate limiting, and Redis-backed session storage. CORS restrictions are disabled for OAuth 2.0 integrations, and a dual-token strategy (Bearer + httpOnly cookie) secures SSO flows. Session management includes a 72-hour inactivity timeout and a 30-day absolute expiry. The platform is designed for production deployment on Replit Reserved VMs, serving both static frontend and backend API from a single process.

## External Dependencies

### Third-Party Services

-   **Vercel Blob Storage**: For file uploads (e.g., profile pictures).
-   **Redis/Vercel KV**: For session management and caching.
-   **Workable API**: For syncing candidates and job postings.
-   **Nodemailer**: For transactional email functionalities.
-   **Supabase**: Provides authentication services, including Google OAuth.

### Database

-   **PostgreSQL**: Primary relational database, managed with TypeORM.

### Build & Deployment

-   **Replit**: Development and production hosting platform, utilizing Reserved VM deployment.