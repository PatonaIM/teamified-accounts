# Data Model Changes: User Management System

**Document Version:** 1.0  
**Date:** December 19, 2024  
**Author:** Business Analyst Mary 📊  
**Status:** Draft - Ready for Technical Review

## Executive Summary

This document outlines the complete data model changes required to implement the new User Management System for the Teamified Team Member Portal. The new data model addresses user lifecycle management, multi-organization requirements, salary history tracking, and migration from existing systems (Zoho People and Client Portal).

## Current State Analysis

### Existing Data Sources

**Zoho People:**
- User profile data (source of truth)
- Employment records (manually maintained)
- Salary information
- Timesheet and leave data

**Client Portal:**
- Employment records (synced from Zoho)
- Candidate tracking
- Client information
- User role assignments

### Current Limitations

1. **Data Fragmentation**: User data split across multiple systems
2. **Manual Sync**: Employment records manually maintained in both systems
3. **Limited History**: No comprehensive salary change tracking
4. **Rigid Permissions**: Limited role-based access control
5. **Migration Complexity**: No clear migration path from existing systems

## Proposed Data Model

### Core Entities

#### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL, -- Argon2 hashed password
    address JSONB,
    profile_data JSONB, -- Flexible fields for additional profile information
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_zoho BOOLEAN DEFAULT FALSE,
    zoho_user_id VARCHAR(100) -- For migration tracking
);
```

**Key Changes:**
- Added `password_hash` field for Argon2 hashed passwords
- Added `profile_data` JSONB field for flexible profile information
- Added `migrated_from_zoho` flag for migration tracking
- Added `zoho_user_id` for data reconciliation
- Standardized status values with check constraints

#### 2. Clients Table
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_info JSONB, -- Flexible contact information
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_zoho BOOLEAN DEFAULT FALSE,
    zoho_client_id VARCHAR(100) -- For migration tracking
);
```

**Key Changes:**
- Added `contact_info` JSONB field for flexible contact data
- Added migration tracking fields
- Standardized status values

#### 3. Employment Records Table
```sql
CREATE TABLE employment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for active employment
    role VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_zoho BOOLEAN DEFAULT FALSE,
    zoho_employment_id VARCHAR(100), -- For migration tracking
    
    -- Business rules
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT unique_active_employment_per_client UNIQUE (user_id, client_id, status) 
        DEFERRABLE INITIALLY DEFERRED
);
```

**Key Changes:**
- **NEW TABLE**: Central organizing principle for user-client relationships
- Supports multiple active employment records per user (different clients)
- Comprehensive status tracking with business rules
- Migration tracking for data reconciliation

#### 4. Salary History Table
```sql
CREATE TABLE salary_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employment_record_id UUID NOT NULL REFERENCES employment_records(id) ON DELETE CASCADE,
    salary_amount DECIMAL(12,2) NOT NULL CHECK (salary_amount > 0),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    effective_date DATE NOT NULL,
    change_reason VARCHAR(100) NOT NULL, -- promotion, adjustment, cost_of_living, etc.
    changed_by UUID REFERENCES users(id), -- Who made the change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_zoho BOOLEAN DEFAULT FALSE,
    zoho_salary_id VARCHAR(100), -- For migration tracking
    
    -- Business rules
    CONSTRAINT unique_effective_date_per_employment UNIQUE (employment_record_id, effective_date)
);
```

**Key Changes:**
- **NEW TABLE**: Complete salary change tracking with audit trail
- Immutable records for compliance and historical reporting
- Change reason tracking for audit purposes
- Migration tracking for data reconciliation

#### 5. User Roles Table
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN (
        'candidate', 'eor', 'admin', 'timesheet_approver', 'leave_approver'
    )),
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('user', 'group', 'client', 'all')),
    scope_entity_id UUID, -- References client_id, group_id, or user_id based on scope
    granted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent roles
    
    -- Business rules
    CONSTRAINT valid_scope_entity CHECK (
        (scope = 'user' AND scope_entity_id = user_id) OR
        (scope = 'client' AND scope_entity_id IN (SELECT id FROM clients)) OR
        (scope = 'all' AND scope_entity_id IS NULL) OR
        (scope = 'group' AND scope_entity_id IS NOT NULL)
    )
);
```

**Key Changes:**
- **NEW TABLE**: Flexible role-based access control
- Scope-based permissions (user, group, client, all)
- Time-based role assignments with expiration
- Comprehensive role types for different user functions

### Supporting Tables

#### 6. Audit Log Table
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

**Key Changes:**
- **NEW TABLE**: Complete audit trail for compliance
- Tracks all changes to critical data
- Includes context information (IP, user agent)
- JSONB fields for flexible data storage

#### 7. Migration Log Table
```sql
CREATE TABLE migration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_batch VARCHAR(100) NOT NULL,
    source_system VARCHAR(50) NOT NULL, -- 'zoho_people', 'client_portal'
    source_id VARCHAR(100) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    migration_status VARCHAR(20) DEFAULT 'success' CHECK (migration_status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_by UUID REFERENCES users(id)
);
```

**Key Changes:**
- **NEW TABLE**: Migration tracking and validation
- Batch tracking for migration management
- Error logging for failed migrations
- Source system tracking for data reconciliation

## Database Views

### 1. Current Employment View
```sql
CREATE VIEW current_employment AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    c.id as client_id,
    c.name as client_name,
    er.id as employment_record_id,
    er.role,
    er.start_date,
    er.status,
    sh.salary_amount as current_salary,
    sh.effective_date as salary_effective_date
FROM users u
JOIN employment_records er ON u.id = er.user_id
JOIN clients c ON er.client_id = c.id
LEFT JOIN LATERAL (
    SELECT salary_amount, effective_date
    FROM salary_history
    WHERE employment_record_id = er.id
    AND effective_date <= CURRENT_DATE
    ORDER BY effective_date DESC
    LIMIT 1
) sh ON true
WHERE er.status = 'active'
AND (er.end_date IS NULL OR er.end_date >= CURRENT_DATE);
```

### 2. User Status View
```sql
CREATE VIEW user_status AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.status as user_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM employment_records er WHERE er.user_id = u.id AND er.status = 'active') 
        THEN 'active_team_member'
        WHEN EXISTS (SELECT 1 FROM employment_records er WHERE er.user_id = u.id) 
        THEN 'inactive_team_member'
        ELSE 'candidate'
    END as employment_status,
    COUNT(er.id) as total_employments,
    COUNT(CASE WHEN er.status = 'active' THEN 1 END) as active_employments
FROM users u
LEFT JOIN employment_records er ON u.id = er.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email, u.status;
```

## Indexing Strategy

### Performance Indexes
```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_zoho_id ON users(zoho_user_id);

-- Clients table indexes
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_zoho_id ON clients(zoho_client_id);

-- Employment records indexes
CREATE INDEX idx_employment_user_id ON employment_records(user_id);
CREATE INDEX idx_employment_client_id ON employment_records(client_id);
CREATE INDEX idx_employment_status ON employment_records(status);
CREATE INDEX idx_employment_dates ON employment_records(start_date, end_date);
CREATE INDEX idx_employment_zoho_id ON employment_records(zoho_employment_id);

-- Salary history indexes
CREATE INDEX idx_salary_employment_id ON salary_history(employment_record_id);
CREATE INDEX idx_salary_effective_date ON salary_history(effective_date);
CREATE INDEX idx_salary_changed_by ON salary_history(changed_by);
CREATE INDEX idx_salary_zoho_id ON salary_history(zoho_salary_id);

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX idx_user_roles_scope ON user_roles(scope, scope_entity_id);
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at);

-- Audit log indexes
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at);

-- Migration log indexes
CREATE INDEX idx_migration_batch ON migration_log(migration_batch);
CREATE INDEX idx_migration_source ON migration_log(source_system, source_id);
CREATE INDEX idx_migration_status ON migration_log(migration_status);
```

## Business Rules and Constraints

### 1. Employment Record Rules
- A user can have multiple active employment records (different clients)
- Employment records cannot have overlapping date ranges for the same client
- End date must be after start date
- Only one active employment record per user per client

### 2. Salary History Rules
- Each employment record must have at least one salary record
- Salary records cannot have overlapping effective dates for the same employment
- Salary amounts must be positive
- Complete audit trail of all salary changes

### 3. Role Assignment Rules
- Users can have multiple roles simultaneously
- Role scope determines data access permissions
- Time-based roles with expiration dates
- Admin roles can grant other roles

### 4. Data Integrity Rules
- All foreign key relationships properly defined
- Cascade deletes for dependent records
- Unique constraints prevent duplicate data
- Check constraints enforce business rules

## Migration Strategy

### Phase 1: Data Import
1. **Users Import**
   - Import from Zoho People (source of truth)
   - Map profile data to new structure
   - Preserve Zoho user IDs for reconciliation

2. **Clients Import**
   - Import from Zoho People
   - Map contact information to JSONB structure
   - Preserve Zoho client IDs

3. **Employment Records Import**
   - Import from Zoho People (primary source)
   - Supplement with Client Portal data if needed
   - Validate date ranges and relationships

4. **Salary History Import**
   - Import current salary as initial record
   - Import historical salary changes if available
   - Set effective dates appropriately

### Phase 2: Role Assignment
1. **Role Mapping**
   - Map existing roles to new role system
   - Set appropriate scopes based on employment records
   - Validate role assignments

2. **Permission Validation**
   - Test data access patterns
   - Validate client isolation
   - Ensure admin access works correctly

### Phase 3: API Integration
1. **API Development**
   - Create REST APIs for all entities
   - Implement authentication and authorization
   - Add rate limiting and validation

2. **Webhook Implementation**
   - Real-time updates for critical changes
   - Event-driven architecture for integrations
   - Error handling and retry logic

## Data Validation and Quality

### Migration Validation
- **Data Completeness**: Ensure all required fields are populated
- **Referential Integrity**: Validate all foreign key relationships
- **Business Rules**: Check constraints and business logic
- **Data Consistency**: Compare source and target data

### Ongoing Data Quality
- **Audit Logging**: Track all changes for compliance
- **Data Validation**: Enforce business rules at application level
- **Regular Backups**: Automated backup and recovery procedures
- **Monitoring**: Track data quality metrics and anomalies

## Performance Considerations

### Query Optimization
- **Indexing Strategy**: Comprehensive indexing for common queries
- **View Usage**: Pre-computed views for complex queries
- **Query Patterns**: Optimize for common access patterns
- **Caching**: Application-level caching for frequently accessed data

### Scalability Planning
- **Partitioning**: Consider table partitioning for large datasets
- **Archiving**: Archive old data to maintain performance
- **Load Balancing**: Distribute read operations across replicas
- **Monitoring**: Track performance metrics and bottlenecks

## Security Considerations

### Data Protection
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Access Control**: Role-based access control with proper scoping
- **Audit Trails**: Complete audit logging for compliance
- **Data Masking**: Mask sensitive data in non-production environments

### Compliance
- **GDPR Compliance**: Data retention and deletion policies
- **Audit Requirements**: Complete audit trails for financial data
- **Data Privacy**: Protect personal information appropriately
- **Access Logging**: Log all data access for security monitoring

## Implementation Timeline

### Week 1-2: Database Schema
- Create all tables and constraints
- Implement indexes and views
- Set up development and testing environments

### Week 3-4: Migration Scripts
- Develop data import scripts
- Implement validation and error handling
- Test with sample data

### Week 5-6: API Development
- Create REST APIs for all entities
- Implement authentication and authorization
- Add comprehensive testing

### Week 7-8: Integration and Testing
- Integrate with existing systems
- Comprehensive testing and validation
- Performance optimization

## Risk Mitigation

### Technical Risks
- **Data Loss**: Comprehensive backup and recovery procedures
- **Performance Issues**: Load testing and optimization
- **Integration Failures**: Fallback mechanisms and error handling
- **Migration Errors**: Validation and rollback procedures

### Business Risks
- **User Disruption**: Gradual migration and user training
- **Data Inconsistency**: Validation and reconciliation procedures
- **Compliance Issues**: Audit trails and data protection measures
- **Timeline Delays**: Phased approach and contingency planning

## Success Metrics

### Technical Metrics
- **Data Migration Success Rate**: >99% successful record migration
- **API Performance**: <200ms response time for common operations
- **System Uptime**: >99.9% availability
- **Data Quality**: <0.1% data quality issues

### Business Metrics
- **User Adoption**: >95% user adoption within 30 days
- **Process Efficiency**: 50% reduction in manual data management
- **Compliance**: 100% audit trail coverage
- **User Satisfaction**: >4.5/5 user satisfaction rating

## Conclusion

This data model provides a comprehensive foundation for the User Management System that addresses all current requirements while providing flexibility for future growth. The employment records approach elegantly solves multi-organization and user lifecycle challenges, while the salary history tracking ensures compliance and audit requirements are met.

The migration strategy provides a clear path from existing systems with minimal risk, and the comprehensive indexing and performance considerations ensure the system will scale effectively.

**Next Steps:**
1. Technical review and approval of data model
2. Development environment setup
3. Migration script development
4. API implementation
5. Integration testing and validation

---

*Document prepared by Business Analyst Mary 📊 using BMAD-METHOD™ framework*
