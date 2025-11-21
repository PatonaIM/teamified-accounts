# Teamified Portal Deployment Guide

This guide provides comprehensive instructions for deploying the Teamified Portal using Docker containers. The setup includes both production and development configurations with hot-reloading capabilities.

## 🚀 Quick Start

### Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher (or Docker Compose V2)
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd teamified-team-member-portal
   ```

2. **Make deployment scripts executable**:
   ```bash
   chmod +x deploy.sh deploy-dev.sh
   ```

3. **Deploy the application**:
   ```bash
   # For production
   ./deploy.sh
   
   # For development
   ./deploy-dev.sh
   ```

## 🐳 Docker Architecture

The application is containerized using the following services:

### Core Services

- **Frontend**: React application served by Nginx
- **Backend**: NestJS API server
- **Database**: PostgreSQL 15 with persistent storage
- **Cache**: Redis 7 for rate limiting and caching

### Network Configuration

- **Production**: Frontend on port 80, Backend on port 3000
- **Development**: Frontend on port 5173, Backend on port 3000
- **Database**: PostgreSQL on port 5432
- **Redis**: Redis on port 6379

## 📋 Deployment Options

### 1. Production Deployment

The production deployment uses optimized Docker images with:
- Multi-stage builds for smaller image sizes
- Production-optimized configurations
- Health checks and monitoring
- Security best practices (non-root users, minimal packages)

**Deploy production**:
```bash
./deploy.sh
```

**Production URLs**:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

### 2. Development Deployment

The development deployment includes:
- Hot reloading for both frontend and backend
- Source code mounting for live editing
- Development-specific environment variables
- Separate containers and volumes from production

**Deploy development**:
```bash
./deploy-dev.sh
```

**Development URLs**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## 🛠️ Deployment Scripts

### Production Script (`deploy.sh`)

**Commands**:
- `./deploy.sh` - Deploy everything (build + start)
- `./deploy.sh build` - Build Docker images only
- `./deploy.sh start` - Start services only
- `./deploy.sh stop` - Stop all services
- `./deploy.sh restart` - Restart all services
- `./deploy.sh status` - Show service status
- `./deploy.sh logs` - Show all service logs
- `./deploy.sh logs [SERVICE]` - Show specific service logs
- `./deploy.sh cleanup` - Remove all containers, images, and volumes
- `./deploy.sh help` - Show help information

### Development Script (`deploy-dev.sh`)

**Commands**:
- `./deploy-dev.sh` - Deploy development environment
- `./deploy-dev.sh build` - Build development images
- `./deploy-dev.sh start` - Start development services
- `./deploy-dev.sh stop` - Stop development services
- `./deploy-dev.sh restart` - Restart development services
- `./deploy-dev.sh status` - Show development service status
- `./deploy-dev.sh logs` - Show all development logs
- `./deploy-dev.sh logs [SERVICE]` - Show specific service logs
- `./deploy-dev.sh cleanup` - Clean up development environment
- `./deploy-dev.sh help` - Show help information

## 🔧 Configuration

### Environment Variables

The deployment scripts automatically create environment files:

#### Production (`.env`)
```bash
# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=teamified_portal

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Application Configuration
PORT=3000
FRONTEND_URL=http://localhost
NODE_ENV=production
```

#### Development (`.env.dev`)
```bash
# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=teamified_portal

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key

# Application Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Database Initialization

The `init-db.sql` script automatically:
- Creates all necessary database tables and enums
- Sets up indexes for optimal performance
- Inserts initial test data
- Creates a test user with credentials:
  - Email: `test@teamified.com`
  - Password: `Test123!`

## 📊 Monitoring and Health Checks

### Health Check Endpoints

- **Frontend**: `http://localhost/health` (production) or `http://localhost:5173/health` (development)
- **Backend**: `http://localhost:3000/health`

### Service Monitoring

All services include health checks that:
- Monitor service availability
- Check database connectivity
- Verify Redis connectivity
- Ensure proper startup sequence

## 🔒 Security Features

### Production Security

- Non-root user execution
- Minimal base images (Alpine Linux)
- Security headers in Nginx
- Rate limiting on API endpoints
- JWT-based authentication
- Environment variable isolation

### Development Security

- Separate development containers
- Development-specific secrets
- Source code mounting for debugging
- Hot reloading capabilities

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :5173
   lsof -i :80
   
   # Stop conflicting services
   ./deploy.sh stop
   ./deploy-dev.sh stop
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database container status
   docker-compose ps postgres
   
   # View database logs
   ./deploy.sh logs postgres
   ```

3. **Build Failures**:
   ```bash
   # Clean up and rebuild
   ./deploy.sh cleanup
   ./deploy.sh build
   ```

4. **Service Health Issues**:
   ```bash
   # Check service status
   ./deploy.sh status
   
   # View service logs
   ./deploy.sh logs
   ```

### Logs and Debugging

**View all logs**:
```bash
./deploy.sh logs
```

**View specific service logs**:
```bash
./deploy.sh logs backend
./deploy.sh logs frontend
./deploy.sh logs postgres
./deploy.sh logs redis
```

**Follow logs in real-time**:
```bash
./deploy.sh logs -f
```

## 🔄 Updates and Maintenance

### Updating the Application

1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart**:
   ```bash
   ./deploy.sh restart
   ```

### Database Migrations

Database schema changes are handled automatically through the `init-db.sql` script. For production deployments, consider:

1. **Backup existing data**:
   ```bash
   docker exec teamified_postgres pg_dump -U postgres teamified_portal > backup.sql
   ```

2. **Update and restart**:
   ```bash
   ./deploy.sh restart
   ```

### Scaling Considerations

The current setup is designed for single-instance deployment. For production scaling, consider:

- Load balancer for multiple backend instances
- Database clustering
- Redis clustering
- Container orchestration (Kubernetes)

## 📚 Additional Resources

### Docker Commands

**Manual container management**:
```bash
# List containers
docker ps

# Execute commands in containers
docker exec -it teamified_backend sh
docker exec -it teamified_frontend sh

# View container resources
docker stats
```

**Volume management**:
```bash
# List volumes
docker volume ls

# Backup volumes
docker run --rm -v teamified-team-member-portal_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Development Workflow

1. **Start development environment**:
   ```bash
   ./deploy-dev.sh
   ```

2. **Edit code** - Changes are automatically reflected due to hot reloading

3. **View logs**:
   ```bash
   ./deploy-dev.sh logs
   ```

4. **Stop development**:
   ```bash
   ./deploy-dev.sh stop
   ```

## 🤝 Support

For deployment issues or questions:

1. Check the troubleshooting section above
2. Review service logs using the deployment scripts
3. Ensure Docker and Docker Compose are properly installed
4. Verify all required ports are available

The deployment setup provides a robust, scalable foundation for both development and production use of the Teamified Portal application.
