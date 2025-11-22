# Source Tree Structure

## Overview
This document outlines the complete source code structure of the Teamified Accounts project, including both backend (NestJS) and frontend (React) codebases.

## Project Root Structure
```
teamified-team-member-portal/
├── .bmad-core/                    # BMAD Core configuration and agents
├── .claude/                       # Claude AI configuration
├── .cursor/                       # Cursor IDE configuration
├── .git/                          # Git repository
├── docs/                          # Project documentation
├── frontend/                      # React frontend application
├── src/                           # NestJS backend application
├── dist/                          # Backend build output
├── test/                          # Backend E2E tests
├── node_modules/                  # Backend dependencies
├── .eslintrc.js                   # Backend ESLint configuration
├── .prettierrc                    # Prettier configuration
├── .gitignore                     # Git ignore rules
├── backend.log                    # Backend runtime logs
├── generate-password.js            # Password generation utility
├── nest-cli.json                  # NestJS CLI configuration
├── package.json                   # Backend package configuration
├── package-lock.json              # Backend dependency lock file
└── tsconfig.json                  # Backend TypeScript configuration
```

## Backend Source Structure (`src/`)

### Core Application Files
```
src/
├── main.ts                        # Application entry point
├── app.module.ts                  # Root application module
└── config/                        # Configuration management
    └── database.config.ts         # Database configuration
```

### Feature Modules
```
src/
├── auth/                          # Authentication module
│   ├── entities/
│   │   └── user.entity.ts         # User entity
│   ├── services/
│   │   └── auth.service.ts        # Authentication service
│   ├── controllers/
│   │   └── auth.controller.ts     # Authentication endpoints
│   ├── guards/
│   │   └── jwt-auth.guard.ts      # JWT authentication guard
│   ├── strategies/
│   │   └── jwt.strategy.ts        # JWT strategy
│   └── auth.module.ts             # Authentication module
│
├── invitations/                    # Invitation management
│   ├── entities/
│   │   └── invitation.entity.ts   # Invitation entity
│   ├── services/
│   │   └── invitation.service.ts  # Invitation service
│   ├── controllers/
│   │   └── invitation.controller.ts # Invitation endpoints
│   ├── dto/
│   │   ├── create-invitation.dto.ts
│   │   └── accept-invitation.dto.ts
│   └── invitations.module.ts      # Invitation module
│
├── profiles/                       # EOR Profile management
│   ├── entities/
│   │   └── eor-profile.entity.ts  # EOR Profile entity
│   ├── services/
│   │   ├── profile.service.ts     # Profile service
│   │   └── profile-completion.service.ts # Completion tracking
│   ├── controllers/
│   │   └── profile.controller.ts  # Profile endpoints
│   ├── dto/
│   │   ├── create-profile.dto.ts
│   │   └── update-profile.dto.ts
│   └── profiles.module.ts         # Profile module
│
├── documents/                      # Document management
│   ├── entities/
│   │   └── document.entity.ts     # Document entity
│   ├── services/
│   │   ├── cv.service.ts          # CV management service
│   │   └── storage.service.ts     # File storage service
│   ├── controllers/
│   │   └── cv.controller.ts       # CV endpoints
│   ├── dto/
│   │   ├── upload-cv-response.dto.ts
│   │   ├── cv-list-response.dto.ts
│   │   └── download-url-response.dto.ts
│   └── documents.module.ts        # Document module
│
├── audit/                         # Audit logging
│   ├── services/
│   │   └── audit.service.ts       # Audit service
│   ├── entities/
│   │   └── audit-log.entity.ts    # Audit log entity
│   └── audit.module.ts            # Audit module
│
├── email/                         # Email services
│   ├── services/
│   │   └── email.service.ts       # Email service
│   ├── templates/
│   │   └── invitation.template.ts # Email templates
│   └── email.module.ts            # Email module
│
├── clients/                        # Client management
│   ├── entities/
│   │   └── client.entity.ts       # Client entity
│   ├── services/
│   │   └── client.service.ts      # Client service
│   └── clients.module.ts          # Client module
│
└── common/                         # Shared utilities
    ├── decorators/
    ├── filters/
    ├── interceptors/
    ├── pipes/
    └── utils/
```

### Database Migrations
```
src/migrations/
├── YYYYMMDDHHMMSS-CreateUsersTable.ts
├── YYYYMMDDHHMMSS-CreateInvitationsTable.ts
├── YYYYMMDDHHMMSS-CreateEORProfilesTable.ts
├── YYYYMMDDHHMMSS-CreateAuditLogsTable.ts
├── YYYYMMDDHHMMSS-CreateDocumentsTable.ts
└── YYYYMMDDHHMMSS-CreateClientsTable.ts
```

## Frontend Source Structure (`frontend/`)

### Core Application Files
```
frontend/
├── index.html                     # Main HTML entry point
├── src/
│   ├── main.tsx                   # React application entry point
│   ├── App.tsx                    # Root application component
│   ├── App.css                    # Global application styles
│   ├── index.css                  # Global CSS imports
│   └── vite-env.d.ts              # Vite environment types
```

### Component Structure
```
frontend/src/
├── components/                     # Reusable UI components
│   ├── LoginForm.tsx              # Login form component
│   ├── ProtectedRoute.tsx         # Route protection component
│   ├── Sidebar.tsx                # Navigation sidebar
│   ├── Dashboard.tsx              # Dashboard layout
│   ├── Card.tsx                   # Card component library
│   └── ui/                        # UI component library
│       └── Card.tsx               # Card component
│
├── pages/                         # Page components
│   ├── LoginPage.tsx              # Login page
│   ├── DashboardPage.tsx          # Main dashboard
│   ├── ProfilePage.tsx            # User profile page
│   ├── TimesheetsPage.tsx         # Timesheet management
│   ├── LeavePage.tsx              # Leave management
│   ├── DocumentsPage.tsx          # Document access
│   └── CVPage.tsx                 # CV management
│
├── services/                       # API service layer
│   ├── authService.ts             # Authentication service
│   ├── profileService.ts          # Profile management
│   ├── timesheetService.ts        # Timesheet operations
│   ├── leaveService.ts            # Leave management
│   ├── documentService.ts         # Document operations
│   └── cvService.ts               # CV management
│
├── types/                          # TypeScript type definitions
│   ├── auth.types.ts              # Authentication types
│   ├── profile.types.ts           # Profile types
│   ├── timesheet.types.ts         # Timesheet types
│   ├── leave.types.ts             # Leave types
│   └── document.types.ts          # Document types
│
├── utils/                          # Utility functions
│   ├── utils.ts                   # General utilities
│   ├── validation.ts              # Form validation
│   └── constants.ts               # Application constants
│
├── assets/                         # Static assets
│   ├── teamified-design-system.css # Design system styles
│   ├── images/                     # Image assets
│   └── icons/                      # Icon assets
│
├── hooks/                          # Custom React hooks
│   ├── useAuth.ts                 # Authentication hook
│   ├── useProfile.ts              # Profile management hook
│   └── useForm.ts                 # Form handling hook
│
├── context/                        # React context providers
│   ├── AuthContext.tsx            # Authentication context
│   └── ProfileContext.tsx         # Profile context
│
└── test/                           # Test configuration
    └── setup.ts                    # Test setup and configuration
```

### Test Structure
```
frontend/src/
├── components/__tests__/           # Component tests
│   ├── LoginForm.test.tsx         # Login form tests
│   ├── LoginForm.simple.test.tsx  # Simplified login tests
│   ├── ProtectedRoute.test.tsx    # Route protection tests
│   └── Sidebar.test.tsx           # Sidebar tests
│
├── pages/__tests__/                # Page tests
│   ├── LoginPage.test.tsx         # Login page tests
│   ├── LoginPage.simple.test.tsx  # Simplified login page tests
│   └── DashboardPage.test.tsx     # Dashboard tests
│
└── services/__tests__/             # Service tests
    └── authService.test.ts         # Authentication service tests
```

### Configuration Files
```
frontend/
├── package.json                    # Frontend dependencies
├── package-lock.json              # Dependency lock file
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json              # App-specific TS config
├── tsconfig.node.json             # Node-specific TS config
├── vite.config.ts                 # Vite build configuration
├── vitest.config.ts               # Vitest test configuration
├── eslint.config.js               # ESLint configuration
├── .gitignore                     # Frontend git ignore
└── README.md                      # Frontend documentation
```

## Build and Output Directories

### Backend Build
```
dist/                              # Backend build output
├── main.js                        # Compiled main application
├── app.module.js                  # Compiled app module
├── auth/                          # Compiled auth module
├── profiles/                      # Compiled profiles module
├── documents/                     # Compiled documents module
└── migrations/                    # Compiled migrations
```

### Frontend Build
```
frontend/dist/                     # Frontend build output
├── index.html                     # Built HTML file
├── assets/                        # Built assets
│   ├── index-[hash].js            # Main JavaScript bundle
│   ├── index-[hash].css           # Main CSS bundle
│   └── [hash].js                  # Additional chunks
└── vite.svg                       # Vite logo
```

## Development Tools

### Backend Development
- **NestJS CLI** - Application scaffolding and management
- **TypeORM CLI** - Database migration and management
- **Jest** - Testing framework
- **ESLint + Prettier** - Code quality and formatting

### Frontend Development
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting

### Database Tools
- **TypeORM CLI** - Database operations
- **PostgreSQL** - Database management
- **Redis CLI** - Cache management

## File Naming Conventions

### Backend Files
- **Entities**: `{feature}.entity.ts`
- **Services**: `{feature}.service.ts`
- **Controllers**: `{feature}.controller.ts`
- **DTOs**: `{feature}.dto.ts`
- **Modules**: `{feature}.module.ts`
- **Tests**: `{feature}.spec.ts`
- **Migrations**: `YYYYMMDDHHMMSS-{description}.ts`

### Frontend Files
- **Components**: `{ComponentName}.tsx`
- **Pages**: `{PageName}.tsx`
- **Services**: `{serviceName}.ts`
- **Types**: `{feature}.types.ts`
- **Tests**: `{ComponentName}.test.tsx`
- **Styles**: `{ComponentName}.css` (if using CSS modules)

## Import/Export Patterns

### Backend Imports
```typescript
// Feature module imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entity imports
import { EntityName } from './entities/entity-name.entity';

// Service imports
import { FeatureService } from './services/feature.service';

// DTO imports
import { CreateFeatureDto } from './dto/create-feature.dto';
```

### Frontend Imports
```typescript
// React imports
import React, { useState, useEffect } from 'react';

// Component imports
import LoginForm from '../components/LoginForm';

// Service imports
import { login } from '../services/authService';

// Type imports
import type { LoginCredentials } from '../types/auth.types';

// Utility imports
import { validateEmail } from '../utils/validation';
```

## Module Organization

### Backend Module Pattern
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([EntityName]),
    // Other feature imports
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

### Frontend Module Pattern
```typescript
// Component index file
export { default as ComponentName } from './ComponentName';
export type { ComponentProps } from './ComponentName';

// Service index file
export * from './authService';
export * from './profileService';
```

---

**Last Updated**: 2025-08-29  
**Version**: 1.0  
**Author**: James (Full Stack Developer)
