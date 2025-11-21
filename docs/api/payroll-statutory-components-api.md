# Payroll Statutory Components API Documentation

## Overview

The Statutory Components API provides comprehensive management of statutory components (EPF, ESI, PT, TDS, SSS, PhilHealth, Pag-IBIG, etc.) for different countries in the payroll system. This API handles country-specific statutory requirements and compliance rules.

## Base URL

```
/api/v1/payroll/configuration/countries/{countryId}/statutory-components
```

## Authentication

All endpoints require JWT authentication with appropriate role-based access:

- **Admin**: Full access to all operations
- **HR**: Full access to all operations
- **EOR**: Read-only access

## Endpoints

### 1. Create Statutory Component

**POST** `/api/v1/payroll/configuration/countries/{countryId}/statutory-components`

Creates a new statutory component for a specific country.

#### Request Body

```json
{
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Employee Provident Fund",
  "componentCode": "EPF",
  "componentType": "epf",
  "contributionType": "both",
  "calculationBasis": "basic_salary",
  "employeePercentage": 12.0,
  "employerPercentage": 12.0,
  "minimumAmount": 100.0,
  "maximumAmount": 1800.0,
  "wageCeiling": 15000.0,
  "wageFloor": 1000.0,
  "effectiveFrom": "2024-01-01",
  "effectiveTo": null,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Employee Provident Fund contribution",
  "regulatoryReference": "EPF Act 1952",
  "isActive": true
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `countryId` | UUID | Yes | ID of the country |
| `componentName` | String | Yes | Name of the statutory component (max 100 chars) |
| `componentCode` | String | Yes | Unique code for the component (max 50 chars) |
| `componentType` | Enum | Yes | Type: `epf`, `esi`, `pt`, `tds`, `sss`, `philhealth`, `pagibig`, `superannuation`, `epf_my`, `socso`, `eis`, `cpf` |
| `contributionType` | Enum | Yes | Type: `employee`, `employer`, `both` |
| `calculationBasis` | Enum | Yes | Basis: `gross_salary`, `basic_salary`, `capped_amount`, `fixed_amount` |
| `employeePercentage` | Decimal | Conditional | Employee contribution % (required for employee/both types) |
| `employerPercentage` | Decimal | Conditional | Employer contribution % (required for employer/both types) |
| `minimumAmount` | Decimal | No | Minimum contribution amount |
| `maximumAmount` | Decimal | No | Maximum contribution amount |
| `wageCeiling` | Decimal | No | Wage ceiling for calculation |
| `wageFloor` | Decimal | No | Wage floor for calculation |
| `effectiveFrom` | Date | Yes | Effective start date (YYYY-MM-DD) |
| `effectiveTo` | Date | No | Effective end date (YYYY-MM-DD) |
| `isMandatory` | Boolean | Yes | Whether the component is mandatory |
| `displayOrder` | Integer | Yes | Display order (≥ 0) |
| `description` | String | No | Description of the component |
| `regulatoryReference` | String | No | Regulatory reference (max 200 chars) |
| `isActive` | Boolean | Yes | Whether the component is active |

#### Response

**201 Created**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Employee Provident Fund",
  "componentCode": "EPF",
  "componentType": "epf",
  "contributionType": "both",
  "calculationBasis": "basic_salary",
  "employeePercentage": 12.0,
  "employerPercentage": 12.0,
  "minimumAmount": 100.0,
  "maximumAmount": 1800.0,
  "wageCeiling": 15000.0,
  "wageFloor": 1000.0,
  "effectiveFrom": "2024-01-01T00:00:00.000Z",
  "effectiveTo": null,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Employee Provident Fund contribution",
  "regulatoryReference": "EPF Act 1952",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Country not found

### 2. Get Statutory Components

**GET** `/api/v1/payroll/configuration/countries/{countryId}/statutory-components`

Retrieves paginated list of statutory components for a country.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 10 | Items per page |
| `componentType` | String | - | Filter by component type |
| `isActive` | Boolean | - | Filter by active status |

#### Example Request

```
GET /api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/statutory-components?page=1&limit=10&componentType=epf&isActive=true
```

#### Response

**200 OK**

```json
{
  "components": [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "countryId": "550e8400-e29b-41d4-a716-446655440000",
      "componentName": "Employee Provident Fund",
      "componentCode": "EPF",
      "componentType": "epf",
      "contributionType": "both",
      "calculationBasis": "basic_salary",
      "employeePercentage": 12.0,
      "employerPercentage": 12.0,
      "minimumAmount": 100.0,
      "maximumAmount": 1800.0,
      "wageCeiling": 15000.0,
      "wageFloor": 1000.0,
      "effectiveFrom": "2024-01-01T00:00:00.000Z",
      "effectiveTo": null,
      "isMandatory": true,
      "displayOrder": 1,
      "description": "Employee Provident Fund contribution",
      "regulatoryReference": "EPF Act 1952",
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 3. Get Statutory Component by ID

**GET** `/api/v1/payroll/configuration/countries/{countryId}/statutory-components/{id}`

Retrieves a specific statutory component by ID.

#### Response

**200 OK**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Employee Provident Fund",
  "componentCode": "EPF",
  "componentType": "epf",
  "contributionType": "both",
  "calculationBasis": "basic_salary",
  "employeePercentage": 12.0,
  "employerPercentage": 12.0,
  "minimumAmount": 100.0,
  "maximumAmount": 1800.0,
  "wageCeiling": 15000.0,
  "wageFloor": 1000.0,
  "effectiveFrom": "2024-01-01T00:00:00.000Z",
  "effectiveTo": null,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Employee Provident Fund contribution",
  "regulatoryReference": "EPF Act 1952",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 4. Get Statutory Components by Type

**GET** `/api/v1/payroll/configuration/countries/{countryId}/statutory-components/by-type/{componentType}`

Retrieves all active statutory components of a specific type for a country.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `componentType` | String | Component type: `epf`, `esi`, `pt`, `tds`, `sss`, `philhealth`, `pagibig`, etc. |

#### Response

**200 OK**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Employee Provident Fund",
    "componentCode": "EPF",
    "componentType": "epf",
    "contributionType": "both",
    "calculationBasis": "basic_salary",
    "employeePercentage": 12.0,
    "employerPercentage": 12.0,
    "minimumAmount": 100.0,
    "maximumAmount": 1800.0,
    "wageCeiling": 15000.0,
    "wageFloor": 1000.0,
    "effectiveFrom": "2024-01-01T00:00:00.000Z",
    "effectiveTo": null,
    "isMandatory": true,
    "displayOrder": 1,
    "description": "Employee Provident Fund contribution",
    "regulatoryReference": "EPF Act 1952",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### 5. Get Active Components by Date

**GET** `/api/v1/payroll/configuration/countries/{countryId}/statutory-components/active-by-date`

Retrieves all statutory components that are active on a specific date.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | Date | Yes | Target date (YYYY-MM-DD) |

#### Example Request

```
GET /api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/statutory-components/active-by-date?date=2024-06-01
```

#### Response

**200 OK**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Employee Provident Fund",
    "componentCode": "EPF",
    "componentType": "epf",
    "contributionType": "both",
    "calculationBasis": "basic_salary",
    "employeePercentage": 12.0,
    "employerPercentage": 12.0,
    "minimumAmount": 100.0,
    "maximumAmount": 1800.0,
    "wageCeiling": 15000.0,
    "wageFloor": 1000.0,
    "effectiveFrom": "2024-01-01T00:00:00.000Z",
    "effectiveTo": null,
    "isMandatory": true,
    "displayOrder": 1,
    "description": "Employee Provident Fund contribution",
    "regulatoryReference": "EPF Act 1952",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### 6. Update Statutory Component

**PUT** `/api/v1/payroll/configuration/countries/{countryId}/statutory-components/{id}`

Updates an existing statutory component.

#### Request Body

```json
{
  "componentName": "Updated EPF",
  "employeePercentage": 13.0,
  "employerPercentage": 13.0,
  "description": "Updated EPF contribution"
}
```

#### Response

**200 OK**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Updated EPF",
  "componentCode": "EPF",
  "componentType": "epf",
  "contributionType": "both",
  "calculationBasis": "basic_salary",
  "employeePercentage": 13.0,
  "employerPercentage": 13.0,
  "minimumAmount": 100.0,
  "maximumAmount": 1800.0,
  "wageCeiling": 15000.0,
  "wageFloor": 1000.0,
  "effectiveFrom": "2024-01-01T00:00:00.000Z",
  "effectiveTo": null,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Updated EPF contribution",
  "regulatoryReference": "EPF Act 1952",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:30:00.000Z"
}
```

### 7. Delete Statutory Component

**DELETE** `/api/v1/payroll/configuration/countries/{countryId}/statutory-components/{id}`

Deletes a statutory component.

#### Response

**200 OK**

```json
{
  "message": "Statutory component deleted successfully"
}
```

#### Error Responses

- **400 Bad Request**: Cannot delete mandatory component
- **404 Not Found**: Component not found
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Insufficient permissions

## Validation Rules

### Component Code Uniqueness
- Component codes must be unique within the same country and effective period
- Case-sensitive validation

### Contribution Type Validation
- **Employee**: Requires `employeePercentage`, no `employerPercentage`
- **Employer**: Requires `employerPercentage`, no `employeePercentage`
- **Both**: Requires both `employeePercentage` and `employerPercentage`

### Date Validation
- `effectiveFrom` must be a valid date
- `effectiveTo` must be after `effectiveFrom` if provided
- Date format: YYYY-MM-DD

### Amount Validation
- All percentage values must be between 0 and 100
- `wageCeiling` must be greater than `wageFloor` if both provided
- `maximumAmount` must be greater than `minimumAmount` if both provided

### Business Rules
- Display order must be non-negative
- Component names and codes cannot be empty
- Country must exist and be active

## Country-Specific Rules

### India
- **EPF**: 12% employee, 12% employer on basic salary (capped at ₹15,000)
- **ESI**: 0.75% employee, 3.25% employer on gross salary (capped at ₹21,000)
- **PT**: Variable based on salary slabs
- **TDS**: As per income tax rules

### Philippines
- **SSS**: Variable based on salary brackets
- **PhilHealth**: 3% of gross salary (capped at ₱80,000)
- **Pag-IBIG**: 2% employee, 2% employer (capped at ₱5,000)

### Australia
- **Superannuation**: 11% employer contribution (as of 2024)
- Different rules for different income levels

### Malaysia
- **EPF**: 11% employee, 12% employer (capped at RM6,000)
- **SOCSO**: Variable based on salary brackets
- **EIS**: 0.2% employee, 0.2% employer

### Singapore
- **CPF**: Variable rates based on age and salary

## Error Handling

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "employeePercentage",
      "message": "Employee percentage is required for contribution type 'both'"
    }
  ]
}
```

## Rate Limiting

- **Create/Update/Delete**: 100 requests per minute per user
- **Read Operations**: 1000 requests per minute per user

## Examples

### Creating an EPF Component (India)

```bash
curl -X POST \
  'https://api.teamified.com/api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/statutory-components' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Employee Provident Fund",
    "componentCode": "EPF",
    "componentType": "epf",
    "contributionType": "both",
    "calculationBasis": "basic_salary",
    "employeePercentage": 12.0,
    "employerPercentage": 12.0,
    "minimumAmount": 100.0,
    "maximumAmount": 1800.0,
    "wageCeiling": 15000.0,
    "wageFloor": 1000.0,
    "effectiveFrom": "2024-01-01",
    "isMandatory": true,
    "displayOrder": 1,
    "description": "Employee Provident Fund contribution",
    "regulatoryReference": "EPF Act 1952",
    "isActive": true
  }'
```

### Creating an SSS Component (Philippines)

```bash
curl -X POST \
  'https://api.teamified.com/api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/statutory-components' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Social Security System",
    "componentCode": "SSS",
    "componentType": "sss",
    "contributionType": "both",
    "calculationBasis": "gross_salary",
    "employeePercentage": 4.5,
    "employerPercentage": 8.5,
    "minimumAmount": 100.0,
    "maximumAmount": 2000.0,
    "wageCeiling": 25000.0,
    "wageFloor": 1000.0,
    "effectiveFrom": "2024-01-01",
    "isMandatory": true,
    "displayOrder": 1,
    "description": "Social Security System contribution",
    "regulatoryReference": "SSS Act of 2018",
    "isActive": true
  }'
```

### Creating a Superannuation Component (Australia)

```bash
curl -X POST \
  'https://api.teamified.com/api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/statutory-components' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Superannuation Guarantee",
    "componentCode": "SUPER",
    "componentType": "superannuation",
    "contributionType": "employer",
    "calculationBasis": "gross_salary",
    "employerPercentage": 11.0,
    "minimumAmount": 0.0,
    "wageFloor": 450.0,
    "effectiveFrom": "2024-01-01",
    "isMandatory": true,
    "displayOrder": 1,
    "description": "Superannuation Guarantee contribution",
    "regulatoryReference": "Superannuation Guarantee (Administration) Act 1992",
    "isActive": true
  }'
```
