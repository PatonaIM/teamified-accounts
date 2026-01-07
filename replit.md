# Teamified Accounts & SSO Platform

## Overview

The Teamified Accounts & SSO Platform is a centralized, secure authentication and user management system providing Single Sign-On (SSO), multi-organization support, and granular role-based access control. Its core purpose is to offer seamless OAuth 2.0 + PKCE authentication across applications, support organization-based multitenancy, and streamline user access for all users. The platform aims to consolidate user management and authentication for all Teamified applications, enhancing security and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend uses React 19, TypeScript, and Vite, styled with Material-UI (MUI v7) and a Tailwind CSS-based design system for a consistent UI, dynamic theming, and expressive user profiles.

### Technical Implementations

The backend is built with NestJS (TypeScript), featuring a modular design, JWT-based authentication with refresh tokens, comprehensive role-based access control (RBAC), a centralized audit module, and extensive data validation. The frontend uses React Router v7 for declarative and protected routing, with state management via React hooks and a centralized Axios instance for API communication.

**Core Features:**

*   **Authentication & Authorization:** OAuth 2.0 + PKCE, JWT-based authentication with refresh tokens, RBAC, and S2S authentication using OAuth 2.0 Client Credentials Grant.
*   **User Management:** Unified profile management, universal email verification, multi-identity SSO (linking personal and work emails), and employer-driven work email provisioning.
*   **SSO & Session Management:** Cross-app SSO with shared httpOnly cookies, global SSO logout, session persistence, and role-based login redirects.
*   **Integrations:** Direct Google OAuth integration with intent-aware role selection, API Key Management, and environment-tagged redirect URIs for OAuth clients.
*   **Modules:** Hiring Module (Job Request, Interview, Talent Pool), Salary History Module, Client Management Module, and a redesigned Analytics Dashboard with card-based report selection.
*   **Documentation:** Sidebar-based documentation portal with Product Guide, Developer Guide, and Release Notes sections.
*   **My Apps Dropdown:** Google Workspace-style app launcher for role-based accessible applications with seamless single sign-on.

### System Design Choices

The data model uses PostgreSQL with TypeORM, including a flexible JSONB field for user profiles and a `UserRole` entity for scope-based permissions. Security features include Argon2 for password hashing, NestJS Throttler for rate limiting, Redis-backed session storage, and a dual-token strategy (Bearer + httpOnly cookie) for SSO flows. Session management includes inactivity and absolute expiry timeouts. The platform is designed for production deployment on Replit Reserved VMs, serving both static frontend and backend API from a single process.

## External Dependencies

### Third-Party Services

*   **Vercel Blob Storage**: For file uploads.
*   **Redis/Vercel KV**: For session management and caching.
*   **Workable API**: For syncing candidates and job postings.
*   **Nodemailer**: For transactional email.
*   **Google OAuth**: For "Continue with Google" sign-in.
*   **HubSpot CRM**: For automatic contact creation during business signup.
*   **OpenAI (via Replit AI Integrations)**: For AI-powered website analysis during signup.

### Database

*   **PostgreSQL**: Primary relational database, managed with TypeORM.

### Build & Deployment

*   **Replit**: Development and production hosting platform.

### Frontend Environment Variables

*   `VITE_PORTAL_URL_JOBSEEKER`: Jobseeker Portal URL.
*   `VITE_PORTAL_URL_ATS`: ATS Portal URL.
*   `VITE_ENABLE_PORTAL_REDIRECTS`: Enables/disables portal redirects.