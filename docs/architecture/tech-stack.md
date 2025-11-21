# Technology Stack

## Overview
This document outlines the complete technology stack used in the Teamified EOR Portal project, including backend, frontend, database, and development tools.

## Backend Stack

### Core Framework
- **NestJS** (v10.0.0) - Progressive Node.js framework for building efficient, reliable, and scalable server-side applications
- **Node.js** - JavaScript runtime environment
- **TypeScript** (v5.1.3) - Typed JavaScript for better development experience

### Database & ORM
- **PostgreSQL** - Primary relational database
- **TypeORM** (v0.3.17) - Object-Relational Mapping (ORM) library
- **Redis** (v4.0.0) - In-memory data structure store for caching and session management

### Authentication & Security
- **Passport.js** (v0.6.0) - Authentication middleware for Node.js
- **JWT** (v10.0.0) - JSON Web Token implementation
- **bcrypt** (v5.1.0) - Password hashing library
- **Argon2** (v0.30.0) - Modern password hashing algorithm
- **@nestjs/throttler** (v5.0.0) - Rate limiting and throttling

### Validation & Transformation
- **class-validator** (v0.14.0) - Decorator-based validation
- **class-transformer** (v0.5.1) - Object transformation and serialization

### API Documentation
- **Swagger/OpenAPI** (v7.0.0) - API documentation and testing
- **@nestjs/swagger** - NestJS integration for Swagger

### Background Jobs & Queues
- **Bull** (v4.10.0) - Redis-based queue for Node.js
- **@nestjs/bull** (v10.0.0) - NestJS integration for Bull queues

### Email Services
- **Nodemailer** (v6.9.0) - Email sending library

### Development Tools
- **ESLint** (v8.42.0) - Code linting and quality enforcement
- **Prettier** (v3.0.0) - Code formatting
- **Jest** (v29.5.0) - Testing framework
- **ts-jest** (v29.1.0) - TypeScript support for Jest

## Frontend Stack

### Core Framework
- **React** (v19.1.1) - JavaScript library for building user interfaces
- **TypeScript** (~5.8.3) - Typed JavaScript
- **Vite** (v7.1.2) - Fast build tool and development server

### Routing
- **React Router DOM** (v7.8.2) - Client-side routing for React

### State Management
- **React Hooks** - Built-in state management
- **Local State** - Component-level state management

### HTTP Client
- **Axios** (v1.11.0) - Promise-based HTTP client

### UI Components & Styling
- **Lucide React** (v0.542.0) - Icon library
- **CSS Modules** - Component-scoped CSS
- **Custom CSS** - Tailored styling system

### Utility Libraries
- **clsx** (v2.1.1) - Conditional CSS class names
- **tailwind-merge** (v3.3.1) - Utility for merging Tailwind CSS classes

### Development Tools
- **ESLint** (v9.33.0) - Code linting
- **TypeScript ESLint** (v8.39.1) - TypeScript-specific linting rules
- **Vitest** (v2.1.8) - Fast unit testing framework
- **React Testing Library** (v16.1.0) - Testing utilities for React
- **Jest DOM** (v6.6.3) - Custom Jest matchers for DOM testing

## Database Architecture

### Primary Database
- **PostgreSQL** - Main relational database
  - UUID primary keys
  - JSONB support for flexible data storage
  - Proper indexing for performance
  - Foreign key constraints for data integrity

### Caching Layer
- **Redis** - In-memory caching
  - Session storage
  - API response caching
  - Rate limiting data
  - Queue management

### Database Migrations
- **TypeORM Migrations** - Database schema versioning
- **Migration CLI** - Command-line migration tools

## Development Environment

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks for code quality

### Testing Strategy
- **Backend**: Jest + NestJS testing utilities
- **Frontend**: Vitest + React Testing Library
- **Coverage**: Minimum 80% test coverage
- **E2E**: Integration testing for critical flows

### Build & Development
- **Backend**: NestJS CLI with TypeScript compilation
- **Frontend**: Vite with React and TypeScript
- **Hot Reload**: Development server with auto-reload
- **Build Optimization**: Production builds with minification

## Deployment & Infrastructure

### Docker Containerization
- **Multi-stage Builds** - Optimized production images with separate build and runtime stages
- **Alpine Linux Base** - Lightweight container images for security and performance
- **Non-root Users** - Security best practices with dedicated application users
- **Health Checks** - Built-in container health monitoring and restart policies

### Container Orchestration
- **Docker Compose** - Multi-service development and production environments
- **Service Dependencies** - Proper startup order with health check conditions
- **Network Isolation** - Custom bridge networks for service communication
- **Volume Management** - Persistent data storage for databases and caches

### Environment Management
- **Environment Variables** - Configuration management
- **Config Service** - NestJS configuration handling
- **Environment Files** - .env.local, .env for different environments

### API Design
- **RESTful APIs** - Standard HTTP methods and status codes
- **API Versioning** - Global prefix `/api`
- **CORS Configuration** - Cross-origin resource sharing
- **Rate Limiting** - API throttling and protection

### Security Features
- **JWT Authentication** - Stateless authentication
- **Role-Based Access Control** - Permission management
- **Input Validation** - Request data validation
- **SQL Injection Prevention** - TypeORM parameterized queries
- **XSS Protection** - Input sanitization

## Docker Deployment Architecture

### Container Services

#### Backend Service
- **Base Image**: Node.js 18 Alpine Linux
- **Multi-stage Build**: Separate build and production stages
- **Security**: Non-root user (nestjs:1001) with dumb-init signal handling
- **Port**: 3000 (internal/external)
- **Health Check**: HTTP endpoint monitoring with 30s intervals
- **Dependencies**: PostgreSQL and Redis health checks
- **Environment**: Production-optimized with NODE_ENV=production

#### Frontend Service
- **Base Image**: Node.js 18 Alpine Linux → Nginx Alpine
- **Build Process**: Vite-based build with optimized production assets
- **Web Server**: Nginx with custom configuration
- **Port**: 80 (internal), 80 (external)
- **Security**: Non-root user (nginx:1001) with proper file permissions
- **Health Check**: HTTP endpoint monitoring with wget

#### Database Services
- **PostgreSQL**: Version 15 Alpine with persistent volumes
- **Redis**: Version 7 Alpine with AOF persistence and password protection
- **Data Persistence**: Named volumes for data durability
- **Health Checks**: Database readiness monitoring
- **Ports**: 5432 (PostgreSQL), 6379 (Redis)

### Development vs Production

#### Development Environment (`docker-compose.dev.yml`)
- **Hot Reload**: Volume mounts for live code changes
- **Development Mode**: NODE_ENV=development with debugging
- **Port Mapping**: Direct access to development servers
- **Source Mounts**: Real-time code synchronization
- **Command Override**: npm run start:dev for backend, npm run dev for frontend

#### Production Environment (`docker-compose.yml`)
- **Optimized Builds**: Production-ready compiled applications
- **Health Monitoring**: Comprehensive health checks for all services
- **Restart Policies**: unless-stopped for service reliability
- **Network Security**: Isolated bridge networks
- **Optional Nginx**: Reverse proxy with SSL support

### Deployment Scripts

#### Production Deployment (`deploy.sh`)
- **Environment Setup**: Automatic .env file creation with defaults
- **Docker Validation**: Checks for Docker and Docker Compose availability
- **Image Building**: Multi-stage builds for backend and frontend
- **Service Management**: Start, stop, restart, and status commands
- **Health Monitoring**: Service health status checking
- **Log Management**: Centralized logging and troubleshooting

#### Development Deployment (`deploy-dev.sh`)
- **Development Setup**: Quick development environment initialization
- **Hot Reload**: Volume mounts for live development
- **Port Configuration**: Development-specific port mappings
- **Dependency Management**: Automatic service dependency resolution

### Container Security Features

#### Runtime Security
- **Non-root Execution**: Dedicated users for each service
- **Signal Handling**: Proper process termination with dumb-init
- **Resource Limits**: Configurable memory and CPU constraints
- **Network Isolation**: Custom bridge networks for service communication

#### Image Security
- **Alpine Base**: Minimal attack surface with lightweight images
- **Multi-stage Builds**: No build tools in production images
- **Dependency Scanning**: Production-only dependency installation
- **Layer Optimization**: Efficient Docker layer caching

### Monitoring & Observability

#### Health Checks
- **Backend**: HTTP health endpoint monitoring
- **Frontend**: Nginx health check with wget
- **Database**: PostgreSQL connection readiness
- **Cache**: Redis ping command validation

#### Logging Strategy
- **Structured Logging**: JSON format for log aggregation
- **Container Logs**: Docker-native logging drivers
- **Health Monitoring**: Service status and restart tracking
- **Error Reporting**: Centralized error collection and reporting

### Scaling & Performance

#### Horizontal Scaling
- **Service Replication**: Docker Compose scale commands
- **Load Balancing**: Nginx reverse proxy for multiple instances
- **Database Scaling**: Read replicas and connection pooling
- **Cache Distribution**: Redis cluster for high availability

#### Resource Optimization
- **Image Size**: Alpine-based minimal images
- **Layer Caching**: Efficient Docker build optimization
- **Memory Management**: Configurable container memory limits
- **CPU Allocation**: Fair CPU scheduling across services

## Monitoring & Logging

### Logging
- **NestJS Logger** - Built-in logging system
- **Structured Logging** - JSON format logs
- **Log Levels** - Error, Warn, Info, Debug

### Error Handling
- **Global Exception Filter** - Centralized error handling
- **Validation Pipes** - Request validation
- **HTTP Status Codes** - Proper REST status codes
- **Error Response Format** - Consistent error structure

## Performance & Scalability

### Backend Optimization
- **Database Indexing** - Optimized query performance
- **Connection Pooling** - Database connection management
- **Caching Strategies** - Redis-based caching
- **Async Operations** - Non-blocking I/O operations

### Frontend Optimization
- **Code Splitting** - Lazy loading of components
- **Bundle Optimization** - Vite build optimization
- **Image Optimization** - Efficient asset handling
- **Performance Monitoring** - Core Web Vitals tracking

## Development Workflow

### Version Control
- **Git** - Source code version control
- **Branch Strategy** - Feature branch workflow
- **Commit Standards** - Conventional commit messages

### Code Review
- **Pull Request Process** - Code review workflow
- **Quality Gates** - Automated quality checks
- **Testing Requirements** - Test coverage requirements

### Continuous Integration
- **Automated Testing** - Run tests on every commit
- **Code Quality Checks** - Linting and formatting
- **Build Verification** - Ensure successful builds

## Browser Support

### Target Browsers
- **Modern Browsers** - Chrome, Firefox, Safari, Edge
- **Mobile Support** - Responsive design for mobile devices
- **Progressive Enhancement** - Graceful degradation for older browsers

### Accessibility
- **WCAG 2.1 AA** - Web Content Accessibility Guidelines
- **Semantic HTML** - Proper HTML structure
- **ARIA Labels** - Screen reader support
- **Keyboard Navigation** - Full keyboard accessibility

## Third-Party Integrations

### External Services
- **Email Service** - Nodemailer for email delivery
- **File Storage** - S3-compatible object storage
- **Payment Processing** - Integration ready for payment gateways
- **Analytics** - Ready for analytics integration

### API Integrations
- **REST APIs** - Standard HTTP-based APIs
- **Webhook Support** - Event-driven integrations
- **Rate Limiting** - API protection and throttling
- **Authentication** - JWT-based API security

## Quick Deployment Guide

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### Development Environment
```bash
# Start development environment
./deploy-dev.sh start

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
./deploy-dev.sh stop
```

### Production Environment
```bash
# Deploy production environment
./deploy.sh deploy

# Check service status
./deploy.sh status

# View production logs
docker-compose logs -f

# Stop production environment
./deploy.sh stop
```

### Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit configuration
nano .env

# Key variables to configure:
# - JWT_SECRET (generate strong random string)
# - JWT_REFRESH_SECRET (generate strong random string)
# - DATABASE_PASSWORD (strong database password)
# - REDIS_PASSWORD (strong Redis password)
# - SMTP credentials for email functionality
```

### Troubleshooting
```bash
# Check service health
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild and restart
docker-compose up --build -d
```

---

**Last Updated**: 2025-08-29  
**Version**: 1.0  
**Author**: James (Full Stack Developer)
