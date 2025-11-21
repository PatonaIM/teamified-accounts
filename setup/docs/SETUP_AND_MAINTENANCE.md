# Setup and Maintenance Guide

## Overview

This guide provides comprehensive instructions for setting up and maintaining the Teamified EOR Portal development environment. It covers initial setup, ongoing maintenance, and best practices for keeping the development context up to date.

## Quick Start

### One-Command Setup
```bash
# Complete development environment setup
./setup/scripts/setup-dev-environment.sh
```

This single command will:
- Check prerequisites (Docker, Docker Compose)
- Generate secure environment variables
- Start all Docker services
- Wait for services to be healthy
- Setup the database with test data
- Run basic tests
- Display access URLs and credentials

## Prerequisites

### Required Software
- **Docker Desktop** (v20.10+) - [Download](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - Usually included with Docker Desktop
- **Git** - [Download](https://git-scm.com/downloads)
- **Node.js** (v18+) - [Download](https://nodejs.org/) (for local development)

### System Requirements
- **RAM**: 4GB+ available
- **Disk Space**: 10GB+ free space
- **OS**: macOS, Windows, or Linux

### Port Requirements
Ensure these ports are available:
- `3000` - Backend API
- `5173` - Frontend development server
- `5432` - PostgreSQL database
- `6379` - Redis cache

## Detailed Setup Instructions

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd teamified-team-member-portal
```

### 2. Environment Configuration
```bash
# Generate environment file with secure secrets
./setup/scripts/generate-secrets.sh --development

# Or manually create .env file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
./setup/scripts/wait-for-services.sh
```

### 4. Database Setup
```bash
# Setup database with test data
./scripts/setup-database.sh
```

### 5. Verify Installation
```bash
# Check service health
curl http://localhost:3000/api/health

# Access the application
open http://localhost:5173
```

## Development Workflow

### Daily Development Commands

#### Starting Development
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Access backend shell
docker-compose -f docker-compose.dev.yml exec backend sh
```

#### Code Quality
```bash
# Run linting
npm run lint

# Run tests
npm run test

# Format code
npm run format
```

#### Database Operations
```bash
# Reset database
./scripts/setup-database.sh --reset

# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- src/migrations/AddNewFeature
```

### VS Code/Cursor Integration

#### Recommended Extensions
Install the recommended extensions from `.vscode/extensions.json`:
- TypeScript and JavaScript Language Features
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Docker
- GitLens

#### Debugging
Use the pre-configured debug configurations:
- **Debug Backend (Docker)** - Debug backend running in Docker
- **Debug Backend (Local)** - Debug backend running locally
- **Debug Frontend (Local)** - Debug frontend in Chrome
- **Debug Tests** - Debug test suites

#### Tasks
Use the pre-configured tasks:
- **docker-start-services** - Start all Docker services
- **docker-stop-services** - Stop all Docker services
- **docker-logs** - View service logs
- **setup-dev-environment** - Complete environment setup

## Maintenance and Updates

### Keeping Context Files Updated

#### 1. DEVELOPMENT_CONTEXT.md Maintenance
**When to Update**:
- New environment variables added
- New API endpoints created
- New test credentials added
- Docker configuration changes
- New troubleshooting scenarios

**How to Update**:
```bash
# Update environment variables section
# Add new API endpoints
# Update test credentials
# Add new troubleshooting steps
```

#### 2. Architecture Documentation Updates
**When to Update**:
- New technologies added to stack
- Coding standards changed
- Project structure modified
- New patterns introduced

**Files to Update**:
- `setup/context/coding-standards.md`
- `setup/context/tech-stack.md`
- `setup/context/source-tree.md`

#### 3. Configuration Updates
**When to Update**:
- Docker Compose changes
- Package.json dependencies
- VS Code settings
- Script modifications

**Files to Update**:
- `setup/config/docker-compose.dev.yml`
- `setup/config/docker-compose.yml`
- `setup/config/.vscode/settings.json`
- `setup/scripts/*.sh`

### Automated Context Updates

#### Update Script
Create a script to automatically update context files:

```bash
#!/bin/bash
# scripts/update-context.sh

echo "🔄 Updating development context..."

# Get current container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" > .dev-context/container-status.txt

# Get current environment variables
docker-compose -f docker-compose.dev.yml config > .dev-context/compose-config.yml

# Update test credentials
node scripts/export-test-credentials.js > .dev-context/test-credentials.json

# Update API endpoints
curl -s http://localhost:3000/api/docs-json > .dev-context/api-spec.json

echo "✅ Development context updated"
```

#### Scheduled Updates
Set up automated context updates:

```bash
# Add to crontab for daily updates
0 9 * * * cd /path/to/project && ./scripts/update-context.sh
```

### Regular Maintenance Tasks

#### Weekly Tasks
- [ ] Update dependencies (`npm update`)
- [ ] Check for security vulnerabilities (`npm audit`)
- [ ] Review and update documentation
- [ ] Clean up old Docker images (`docker system prune`)

#### Monthly Tasks
- [ ] Update Docker base images
- [ ] Review and update test data
- [ ] Update development scripts
- [ ] Review performance metrics

#### Quarterly Tasks
- [ ] Major dependency updates
- [ ] Architecture review
- [ ] Security audit
- [ ] Performance optimization

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
**Problem**: Services won't start due to port conflicts
**Solution**:
```bash
# Check what's using the port
lsof -i :5432

# Stop conflicting services
brew services stop postgresql@15

# Kill process using port
sudo lsof -ti:5432 | xargs kill -9
```

#### 2. Docker Issues
**Problem**: Docker containers won't start
**Solution**:
```bash
# Check Docker status
docker info

# Restart Docker Desktop
# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose -f docker-compose.dev.yml up -d --build
```

#### 3. Database Issues
**Problem**: Database connection failed
**Solution**:
```bash
# Check PostgreSQL container
docker logs teamified_postgres_dev

# Reset database
./scripts/setup-database.sh --reset

# Check database connection
docker exec teamified_postgres_dev pg_isready -U postgres -d teamified_portal
```

#### 4. Environment Issues
**Problem**: Environment variables not loaded
**Solution**:
```bash
# Regenerate .env file
./setup/scripts/generate-secrets.sh --development

# Check environment variables
docker-compose -f docker-compose.dev.yml config
```

### Debugging Commands

#### Service Health Checks
```bash
# Check all services
docker-compose -f docker-compose.dev.yml ps

# Check specific service
docker logs teamified_backend_dev

# Health check endpoints
curl http://localhost:3000/api/health
curl http://localhost:5173
```

#### Database Debugging
```bash
# Connect to database
docker exec -it teamified_postgres_dev psql -U postgres -d teamified_portal

# Check database status
docker exec teamified_postgres_dev pg_isready -U postgres -d teamified_portal

# View database logs
docker logs teamified_postgres_dev
```

#### Redis Debugging
```bash
# Connect to Redis
docker exec -it teamified_redis_dev redis-cli

# Check Redis status
docker exec teamified_redis_dev redis-cli ping

# View Redis logs
docker logs teamified_redis_dev
```

## Best Practices

### Development Environment

#### 1. Environment Isolation
- Use separate Docker networks for different environments
- Never commit `.env` files to version control
- Use different secrets for dev/staging/production

#### 2. Code Quality
- Run linting before committing
- Write tests for new features
- Use consistent code formatting
- Follow established patterns

#### 3. Database Management
- Use migrations for schema changes
- Never modify production database directly
- Backup data before major changes
- Use transactions for complex operations

### Documentation Maintenance

#### 1. Keep Documentation Current
- Update docs when making changes
- Include examples in documentation
- Document troubleshooting steps
- Keep API documentation current

#### 2. Version Control
- Commit documentation changes with code changes
- Use meaningful commit messages
- Tag releases with documentation updates
- Maintain changelog

#### 3. Team Collaboration
- Share knowledge through documentation
- Review documentation in code reviews
- Update onboarding documentation
- Maintain team standards

## Security Considerations

### Development Security

#### 1. Secret Management
- Never commit secrets to version control
- Use different secrets for each environment
- Rotate secrets regularly
- Use secure secret generation

#### 2. Access Control
- Limit database access
- Use strong passwords
- Enable authentication
- Monitor access logs

#### 3. Network Security
- Use Docker networks for isolation
- Limit exposed ports
- Use HTTPS in production
- Enable CORS properly

### Production Security

#### 1. Environment Security
- Use managed database services
- Enable SSL/TLS certificates
- Use strong authentication
- Monitor security logs

#### 2. Application Security
- Keep dependencies updated
- Use security headers
- Enable rate limiting
- Implement proper error handling

## Performance Optimization

### Development Performance

#### 1. Docker Optimization
- Use multi-stage builds
- Optimize layer caching
- Use Alpine Linux base images
- Limit container resources

#### 2. Database Performance
- Use proper indexing
- Optimize queries
- Use connection pooling
- Monitor query performance

#### 3. Frontend Performance
- Use code splitting
- Optimize bundle size
- Use lazy loading
- Monitor Core Web Vitals

## Monitoring and Logging

### Development Monitoring

#### 1. Health Checks
- Monitor service health
- Check resource usage
- Monitor error rates
- Track performance metrics

#### 2. Logging
- Use structured logging
- Include correlation IDs
- Log important events
- Monitor log levels

#### 3. Alerting
- Set up health check alerts
- Monitor error rates
- Track performance degradation
- Alert on security issues

## Backup and Recovery

### Data Backup

#### 1. Database Backup
```bash
# Create database backup
docker exec teamified_postgres_dev pg_dump -U postgres teamified_portal > backup.sql

# Restore database backup
docker exec -i teamified_postgres_dev psql -U postgres teamified_portal < backup.sql
```

#### 2. Configuration Backup
```bash
# Backup configuration files
tar -czf config-backup.tar.gz setup/config/

# Backup environment files
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### Recovery Procedures

#### 1. Complete Reset
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down -v

# Remove all containers and volumes
docker system prune -a

# Restart from scratch
./setup/scripts/setup-dev-environment.sh
```

#### 2. Partial Recovery
```bash
# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend

# Reset specific component
./scripts/setup-database.sh --reset
```

## Support and Resources

### Documentation
- **Setup Guide**: This document
- **Development Context**: `setup/context/DEVELOPMENT_CONTEXT.md`
- **Architecture Docs**: `setup/context/architecture/`
- **API Documentation**: http://localhost:3000/api/docs

### Scripts
- **Setup Script**: `setup/scripts/setup-dev-environment.sh`
- **Wait Script**: `setup/scripts/wait-for-services.sh`
- **Secrets Script**: `setup/scripts/generate-secrets.sh`

### Configuration
- **Docker Compose**: `setup/config/docker-compose.dev.yml`
- **VS Code Settings**: `setup/config/.vscode/`
- **Package Configs**: `setup/context/package.json`

### Getting Help
1. Check this documentation first
2. Review the troubleshooting section
3. Check service logs
4. Consult the development team
5. Create an issue in the repository

---

**Last Updated**: 2025-01-27  
**Version**: 1.0  
**Maintained By**: Development Team

