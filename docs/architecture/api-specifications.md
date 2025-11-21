# API Specifications: User Management System

**Document Version:** 1.0  
**Date:** December 19, 2024  
**Author:** Business Analyst Mary 📊  
**Status:** Draft - Ready for Technical Review

## Executive Summary

This document defines the REST API specifications for the User Management System. The APIs provide comprehensive CRUD operations for all entities, with proper authentication, authorization, validation, and error handling.

## API Overview

### Base URL
```
Production: https://api.teamified.com/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All API endpoints require authentication using JWT tokens:
```
Authorization: Bearer <jwt_token>
```

### Response Format
All responses follow a consistent format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

## User Management APIs

### 1. Users API

#### GET /users
Get list of users with filtering and pagination.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search by name or email
- `status` (string, optional): Filter by status (active, inactive, archived)
- `role` (string, optional): Filter by role type
- `client_id` (UUID, optional): Filter by client

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip": "10001"
        },
        "profile_data": {
          "department": "Engineering",
          "skills": ["JavaScript", "React"]
        },
        "status": "active",
        "created_at": "2024-12-19T10:30:00Z",
        "updated_at": "2024-12-19T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### GET /users/{id}
Get specific user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": { ... },
    "profile_data": { ... },
    "status": "active",
    "employment_records": [
      {
        "id": "uuid",
        "client_id": "uuid",
        "client_name": "Acme Corp",
        "role": "Software Engineer",
        "start_date": "2024-01-01",
        "end_date": null,
        "status": "active",
        "current_salary": 75000
      }
    ],
    "roles": [
      {
        "role_type": "eor",
        "scope": "client",
        "scope_entity_id": "uuid",
        "expires_at": null
      }
    ],
    "created_at": "2024-12-19T10:30:00Z",
    "updated_at": "2024-12-19T10:30:00Z"
  }
}
```

#### POST /users
Create new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "profile_data": {
    "department": "Engineering",
    "skills": ["JavaScript", "React"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "created_at": "2024-12-19T10:30:00Z"
  }
}
```

#### PUT /users/{id}
Update user.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890",
  "address": { ... },
  "profile_data": { ... },
  "status": "active"
}
```

#### DELETE /users/{id}
Delete user (soft delete - sets status to archived).

### 2. Clients API

#### GET /clients
Get list of clients.

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `search` (string, optional): Search by name
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "uuid",
        "name": "Acme Corporation",
        "contact_info": {
          "email": "contact@acme.com",
          "phone": "+1234567890",
          "address": {
            "street": "456 Business Ave",
            "city": "New York",
            "state": "NY",
            "zip": "10001"
          }
        },
        "status": "active",
        "created_at": "2024-12-19T10:30:00Z",
        "updated_at": "2024-12-19T10:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### GET /clients/{id}
Get specific client by ID.

#### POST /clients
Create new client.

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "contact_info": {
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "address": {
      "street": "456 Business Ave",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    }
  }
}
```

#### PUT /clients/{id}
Update client.

#### DELETE /clients/{id}
Delete client (soft delete).

### 3. Employment Records API

#### GET /employment-records
Get list of employment records.

**Query Parameters:**
- `user_id` (UUID, optional): Filter by user
- `client_id` (UUID, optional): Filter by client
- `status` (string, optional): Filter by status
- `start_date` (date, optional): Filter by start date
- `end_date` (date, optional): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "employment_records": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "user_name": "John Doe",
        "client_id": "uuid",
        "client_name": "Acme Corp",
        "start_date": "2024-01-01",
        "end_date": null,
        "role": "Software Engineer",
        "status": "active",
        "current_salary": 75000,
        "created_at": "2024-12-19T10:30:00Z",
        "updated_at": "2024-12-19T10:30:00Z"
      }
    ]
  }
}
```

#### GET /employment-records/{id}
Get specific employment record.

#### POST /employment-records
Create new employment record.

**Request Body:**
```json
{
  "user_id": "uuid",
  "client_id": "uuid",
  "start_date": "2024-01-01",
  "role": "Software Engineer",
  "initial_salary": 75000
}
```

#### PUT /employment-records/{id}
Update employment record.

#### DELETE /employment-records/{id}
Delete employment record.

### 4. Salary History API

#### GET /salary-history
Get salary history for employment record.

**Query Parameters:**
- `employment_record_id` (UUID, required): Employment record ID
- `start_date` (date, optional): Filter by start date
- `end_date` (date, optional): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "salary_history": [
      {
        "id": "uuid",
        "employment_record_id": "uuid",
        "salary_amount": 75000,
        "salary_currency": "USD",
        "effective_date": "2024-01-01",
        "change_reason": "initial_salary",
        "changed_by": "uuid",
        "changed_by_name": "Admin User",
        "created_at": "2024-12-19T10:30:00Z"
      }
    ]
  }
}
```

#### POST /salary-history
Create new salary record.

**Request Body:**
```json
{
  "employment_record_id": "uuid",
  "salary_amount": 80000,
  "salary_currency": "USD",
  "effective_date": "2024-06-01",
  "change_reason": "promotion"
}
```

### 5. User Roles API

#### GET /user-roles
Get user roles.

**Query Parameters:**
- `user_id` (UUID, optional): Filter by user
- `role_type` (string, optional): Filter by role type
- `scope` (string, optional): Filter by scope

**Response:**
```json
{
  "success": true,
  "data": {
    "user_roles": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "user_name": "John Doe",
        "role_type": "eor",
        "scope": "client",
        "scope_entity_id": "uuid",
        "scope_entity_name": "Acme Corp",
        "granted_by": "uuid",
        "granted_by_name": "Admin User",
        "created_at": "2024-12-19T10:30:00Z",
        "expires_at": null
      }
    ]
  }
}
```

#### POST /user-roles
Assign role to user.

**Request Body:**
```json
{
  "user_id": "uuid",
  "role_type": "eor",
  "scope": "client",
  "scope_entity_id": "uuid",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

#### DELETE /user-roles/{id}
Remove role from user.

### 6. Bulk Operations API

#### POST /users/bulk
Bulk operations on users.

**Request Body:**
```json
{
  "operation": "update_status",
  "user_ids": ["uuid1", "uuid2", "uuid3"],
  "data": {
    "status": "inactive"
  }
}
```

**Supported Operations:**
- `update_status`: Update user status
- `assign_roles`: Assign roles to users
- `remove_roles`: Remove roles from users
- `update_profile`: Update profile data

#### POST /users/import
Import users from CSV.

**Request Body:**
```json
{
  "csv_data": "base64_encoded_csv_content",
  "mapping": {
    "email": "Email",
    "first_name": "First Name",
    "last_name": "Last Name",
    "phone": "Phone"
  }
}
```

### 7. Search and Filter API

#### GET /search/users
Advanced search for users.

**Query Parameters:**
- `q` (string, required): Search query
- `filters` (JSON, optional): Advanced filters
- `sort` (string, optional): Sort field
- `order` (string, optional): Sort order (asc, desc)

**Example:**
```
GET /search/users?q=john&filters={"status":"active","role":"eor"}&sort=created_at&order=desc
```

## Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Application Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Duplicate resource
- `PERMISSION_DENIED` - Insufficient permissions
- `BUSINESS_RULE_VIOLATION` - Business rule violation
- `MIGRATION_ERROR` - Migration operation failed

## Rate Limiting

### Limits
- **Authenticated users**: 1000 requests per hour
- **Admin users**: 5000 requests per hour
- **Bulk operations**: 100 requests per hour

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Events
- `user.created` - User created
- `user.updated` - User updated
- `user.deleted` - User deleted
- `employment.created` - Employment record created
- `employment.updated` - Employment record updated
- `salary.changed` - Salary changed
- `role.assigned` - Role assigned
- `role.removed` - Role removed

### Webhook Payload
```json
{
  "event": "user.created",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

## Testing

### Test Data
Use the provided seed scripts to populate test data.

### Test Scenarios
1. **CRUD Operations**: Test all create, read, update, delete operations
2. **Authentication**: Test JWT token validation
3. **Authorization**: Test role-based access control
4. **Validation**: Test input validation and error handling
5. **Pagination**: Test pagination and filtering
6. **Bulk Operations**: Test bulk operations and CSV import
7. **Webhooks**: Test webhook delivery and retry logic

## Security Considerations

### Authentication
- JWT tokens with expiration
- Refresh token mechanism
- Secure token storage

### Authorization
- Role-based access control
- Scope-based permissions
- Resource-level permissions

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting

### Audit Logging
- All API calls logged
- Sensitive operations tracked
- Compliance reporting

## Performance Considerations

### Caching
- Redis caching for frequently accessed data
- Cache invalidation strategies
- CDN for static assets

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling

### Monitoring
- API response times
- Error rates
- Resource utilization
- User activity metrics

---

*Document prepared by Business Analyst Mary 📊 using BMAD-METHOD™ framework*
