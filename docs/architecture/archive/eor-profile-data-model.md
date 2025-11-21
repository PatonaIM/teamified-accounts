# EOR Profile Data Model & Field Mapping

## Overview
This document defines the comprehensive data model for storing EOR (Employer of Record) profile information based on the analysis of the profile page design from `docs/frontend-design/profile-page/profile-page-and-fields.html`.

## Data Model Structure

### 1. Core Employee Information

#### Primary Identifiers
```sql
-- Primary employee identification
employee_id VARCHAR(20) PRIMARY KEY,           -- e.g., "PAT-0001"
first_name VARCHAR(100) NOT NULL,              -- "Simon"
last_name VARCHAR(100) NOT NULL,               -- "Jones"
father_name VARCHAR(100),                      -- "John" (cultural requirement)
nick_name VARCHAR(50),                         -- "Jonesy" (optional)
email_address VARCHAR(255) UNIQUE NOT NULL,    -- "simon.jones@teamified.com"
```

#### Employment Details
```sql
-- EOR-specific employment information
client_id VARCHAR(50) NOT NULL,                -- "Teamified" (EOR client)
client_birthday_leave VARCHAR(50),             -- Specific client for leave
department VARCHAR(100),                       -- Organizational department
location VARCHAR(100),                         -- Work location
title VARCHAR(100),                            -- "Partner" (job designation)
employment_type ENUM('full_time', 'part_time', 'contract', 'temporary'),
employee_status ENUM('active', 'inactive', 'terminated', 'on_leave'),
source_of_hire VARCHAR(100),                   -- Recruitment source
date_of_joining DATE NOT NULL,                 -- "2021-11-01"
date_of_confirmation DATE,                     -- Employment confirmation
current_experience VARCHAR(50),                -- "3 year(s) 9 month(s)" (calculated)
total_experience VARCHAR(50),                  -- Prior experience
reporting_manager_id VARCHAR(20),              -- Direct supervisor
secondary_reporting_manager_id VARCHAR(20),    -- Backup supervisor
zoho_role VARCHAR(50),                         -- "Admin" (system role)
```

### 2. Personal Information

#### Basic Personal Details
```sql
-- Personal identification and demographics
date_of_birth DATE NOT NULL,                   -- "1975-05-06"
age VARCHAR(50),                               -- "50 year(s) 3 month(s)" (calculated)
gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
marital_status ENUM('single', 'married', 'divorced', 'widowed'),
about_me TEXT,                                 -- Personal description
citizenship VARCHAR(100),                      -- Nationality
blood_group VARCHAR(10),                       -- Medical information
expertise TEXT,                                -- "Ask me about/Expertise"
linkedin_url VARCHAR(255),                     -- Professional profile URL
```

#### Contact Information
```sql
-- Communication details
work_phone VARCHAR(20),                        -- "+61417539341"
phone_extension VARCHAR(10),                   -- Phone extension
seating_location VARCHAR(100),                 -- Physical workspace
personal_mobile VARCHAR(20),                   -- "61-417539341"
personal_email VARCHAR(255),                   -- Personal email address
skills TEXT,                                   -- Professional competencies
```

#### Address Information
```sql
-- Residential addresses
present_address TEXT,                          -- Current residence
permanent_address TEXT,                        -- Permanent residence
```

### 3. Government Identification

#### National IDs and Tax Information
```sql
-- Government-issued identification
pan_number VARCHAR(20),                        -- Indian tax ID
aadhaar_number VARCHAR(20),                    -- Indian national ID
pf_number VARCHAR(20),                         -- Provident Fund
uan_number VARCHAR(20),                        -- Universal Account Number
nic_sri_lanka VARCHAR(20),                     -- Sri Lankan national ID
sss_philippines VARCHAR(20),                   -- Philippine social security
philhealth_philippines VARCHAR(20),            -- Philippine health insurance
pagibig_philippines VARCHAR(20),               -- Philippine housing fund
tin_philippines VARCHAR(20),                   -- Philippine tax ID
```

### 4. Emergency Contact Information

#### Emergency Contact Details
```sql
-- Emergency contact table (one-to-many relationship)
CREATE TABLE emergency_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

### 5. Banking Information

#### Payment Details
```sql
-- Banking and payment information
bank_account_number VARCHAR(50),
ifsc_code VARCHAR(20),                         -- Indian bank routing
payment_mode ENUM('bank_transfer', 'check', 'cash', 'digital'),
bank_name VARCHAR(100),
account_type ENUM('savings', 'checking', 'current'),
bank_holder_name VARCHAR(100),
```

### 6. Document Management

#### File Attachments
```sql
-- Document storage table
CREATE TABLE employee_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL,
    document_type ENUM('cv', 'id_proof', 'address_proof', 'bank_statement', 'other'),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

### 7. System Audit Fields

#### Tracking and Audit Information
```sql
-- System tracking fields
created_by VARCHAR(20),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
modified_by VARCHAR(20),
modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
onboarding_status ENUM('pending', 'in_progress', 'completed', 'failed'),
```

## Field Priority Classification

### Critical Fields (Must Store)
- `employee_id` - Primary identifier
- `first_name`, `last_name` - Legal identity
- `email_address` - Primary communication
- `date_of_birth` - Legal compliance
- `date_of_joining` - Employment tracking
- `client_id` - EOR relationship
- `employment_type`, `employee_status` - Contract management
- Emergency contact details - Safety compliance
- Banking information - Payment processing
- Government IDs - Legal compliance

### Important Fields (Should Store)
- `work_phone` - Business communication
- `present_address`, `permanent_address` - Legal/tax requirements
- `reporting_manager_id` - Organizational hierarchy
- `skills`, `expertise` - Resource allocation
- `cv` - Professional documentation

### Optional Fields (Nice to Have)
- `nick_name` - Personal preference
- `about_me` - Cultural fit
- `linkedin_url` - Professional networking
- `father_name` - Cultural requirement

## Data Security Requirements

### Encryption Requirements
```sql
-- Sensitive data encryption
ALTER TABLE employees 
ADD COLUMN pan_number_encrypted VARBINARY(255),
ADD COLUMN aadhaar_number_encrypted VARBINARY(255),
ADD COLUMN bank_account_number_encrypted VARBINARY(255);

-- Government IDs and banking info require encryption
-- Personal addresses require privacy protection
-- Emergency contacts need secure access
```

### Compliance Considerations
- **GDPR Compliance**: Personal data handling
- **PCI Compliance**: Banking information
- **Local Labor Laws**: Employment data retention
- **Tax Compliance**: Government ID storage
- **Workplace Safety**: Emergency contact accessibility

## API Endpoints Structure

### Profile Management Endpoints
```typescript
// Core profile operations
GET    /api/v1/employees/{employee_id}/profile
PUT    /api/v1/employees/{employee_id}/profile
PATCH  /api/v1/employees/{employee_id}/profile

// Document management
GET    /api/v1/employees/{employee_id}/documents
POST   /api/v1/employees/{employee_id}/documents
DELETE /api/v1/employees/{employee_id}/documents/{document_id}

// Emergency contacts
GET    /api/v1/employees/{employee_id}/emergency-contacts
POST   /api/v1/employees/{employee_id}/emergency-contacts
PUT    /api/v1/employees/{employee_id}/emergency-contacts/{contact_id}
DELETE /api/v1/employees/{employee_id}/emergency-contacts/{contact_id}

// Profile completion status
GET    /api/v1/employees/{employee_id}/profile-completion
```

## Validation Rules

### Required Field Validation
```typescript
interface ProfileValidation {
  employee_id: { required: true, pattern: /^[A-Z]{3}-\d{4}$/ };
  first_name: { required: true, minLength: 1, maxLength: 100 };
  last_name: { required: true, minLength: 1, maxLength: 100 };
  email_address: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
  date_of_birth: { required: true, type: 'date', maxDate: 'today-18years' };
  date_of_joining: { required: true, type: 'date' };
  client_id: { required: true };
  employment_type: { required: true, enum: ['full_time', 'part_time', 'contract', 'temporary'] };
  employee_status: { required: true, enum: ['active', 'inactive', 'terminated', 'on_leave'] };
}
```

### Conditional Validation
```typescript
// Government ID validation based on citizenship
if (citizenship === 'India') {
  pan_number: { required: true, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ };
  aadhaar_number: { required: true, pattern: /^[0-9]{12}$/ };
}

if (citizenship === 'Sri Lanka') {
  nic_sri_lanka: { required: true, pattern: /^[0-9]{9}[VX]$/ };
}

if (citizenship === 'Philippines') {
  sss_philippines: { required: true, pattern: /^[0-9]{10}$/ };
  philhealth_philippines: { required: true, pattern: /^[0-9]{12}$/ };
}
```

## Migration Strategy

### Phase 1: Core Fields
1. Employee identification
2. Basic employment details
3. Essential contact information

### Phase 2: Extended Profile
1. Personal details
2. Government IDs
3. Emergency contacts

### Phase 3: Advanced Features
1. Document management
2. Banking information
3. Skills and expertise

### Phase 4: Compliance & Security
1. Data encryption
2. Audit logging
3. Compliance reporting

## Implementation Notes

### Database Considerations
- Use appropriate indexes for frequently queried fields
- Implement soft deletes for audit trail
- Consider partitioning for large datasets
- Implement data archival strategy

### Performance Optimization
- Cache frequently accessed profile data
- Implement lazy loading for document attachments
- Use pagination for large result sets
- Optimize queries with proper indexing

### Monitoring & Maintenance
- Track profile completion rates
- Monitor data quality metrics
- Implement automated data validation
- Regular compliance audits

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-29  
**Author**: Sarah (Product Owner)  
**Review Status**: Ready for Development Team Review
