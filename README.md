# Teamified Accounts - SSO
A comprehensive SSO, user management, and multi-organization platform built with NestJS backend and React frontend.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd teamified-team-member-portal
```

### 2. Database Setup

**Important**: The database requires additional setup beyond the basic Docker initialization.

Run the database setup script to create all required tables and seed data:

```bash
./scripts/setup-database.sh
```

This script will:
- Create missing tables (`employment_records`, `salary_history`)
- Add missing columns to existing tables
- Set up proper constraints and indexes
- Seed the database with test users and sample data

### 3. Start the Application

```bash
docker-compose up -d
```

### 4. Access the Application

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs

## Test User Credentials

After running the database setup script, you can use these test accounts:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@teamified.com | Admin123! | admin | Full system access |
| hr@teamified.com | HRManager123! | admin | Full system access |
| john.doe@example.com | EORUser123! | eor | Client-specific access |
| jane.smith@example.com | EORUser123! | eor | Client-specific access |

## Features

### ✅ Completed Features

- **Authentication System**
  - JWT-based authentication
  - Role-based access control (admin, HR, EOR, candidate)
  - Password hashing with Argon2
  - Session management

- **User Management**
  - User CRUD operations
  - Bulk operations (status updates, role assignments)
  - User search and filtering
  - Profile management

- **Employment Records Management** (Story 1.4)
  - Employment record CRUD operations
  - Employment history tracking
  - Client assignments
  - Status management (active, inactive, terminated, completed)
  - Search and filtering capabilities
  - Audit logging

- **Client Management**
  - Client CRUD operations
  - Contact information management
  - Status tracking

- **Audit System**
  - Comprehensive audit logging
  - Change tracking
  - User activity monitoring

### 🚧 In Progress

- Document management
- Timesheet management
- Leave management
- Salary history tracking

## Architecture

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: Class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### Frontend (React)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI v7
- **State Management**: React Context
- **HTTP Client**: Axios

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Web Server**: Nginx (production)

## Development

### Local Development

1. **Backend Development**:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Management

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup instructions.

### Running Tests

```bash
# Backend tests
npm run test

# Frontend tests
cd frontend
npm run test
```

## API Documentation

The API is fully documented with Swagger/OpenAPI. Access the interactive documentation at:

http://localhost:3000/api/docs

### Key Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/users/*` (admin/HR only)
- **Employment Records**: `/api/employment-records/*` (admin/HR only)
- **Health Check**: `/health`

## Deployment

### Production Deployment

1. **Environment Variables**: Set production environment variables
2. **SSL Certificates**: Configure SSL for HTTPS
3. **Database**: Use managed PostgreSQL service
4. **Security**: Change default passwords and secrets
5. **Monitoring**: Set up application monitoring

### Docker Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Ensure PostgreSQL container is running
   - Check database setup script was executed
   - Verify environment variables

2. **Authentication Issues**:
   - Verify test user credentials
   - Check JWT secrets are set
   - Ensure user roles are properly assigned

3. **Frontend Build Issues**:
   - Check Node.js version compatibility
   - Clear node_modules and reinstall
   - Verify environment variables

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# Setup database
./scripts/setup-database.sh
```

## Common Issues & Solutions

### Development Issues

#### Route 404 Errors
**Problem**: API endpoints return 404 errors
**Solution**: Ensure controllers use `@Controller('v1/feature-name')` not `@Controller('api/v1/feature-name')`

#### Authentication Errors
**Problem**: "JwtTokenService not available" or "Cannot resolve dependencies"
**Solution**: 
- Import auth components from `../../common/guards/` not `../../auth/guards/`
- Import `AuthModule` in feature modules using authentication

#### DTO Validation Failures
**Problem**: Valid data rejected by validation
**Solution**: Use `@IsNumber()` instead of `@IsDecimal({ decimal_digits: '0,2' })` for numeric validation

#### Date Handling Errors
**Problem**: TypeScript errors when comparing dates
**Solution**: Convert string dates to Date objects: `const date = new Date(dto.dateString)`

### Validation Tools

```bash
# Run implementation validation
npm run validate:implementation

# Run all validations
npm run validate:all
```

### Quick Reference

For detailed solutions and patterns, see:
- [`docs/development/quick-reference.md`](docs/development/quick-reference.md) - Common patterns and code examples
- [`docs/development/feature-development-checklist.md`](docs/development/feature-development-checklist.md) - Step-by-step checklist
- [`docs/architecture/coding-standards.md`](docs/architecture/coding-standards.md) - Detailed coding standards

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation: `npm run validate:all`
5. Add tests
6. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.
>>>>>>> c463c14 (Initial commit)
