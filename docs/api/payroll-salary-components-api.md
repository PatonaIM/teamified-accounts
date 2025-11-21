# Payroll Salary Components API Documentation

## Overview

The Salary Components API provides comprehensive management of salary components (earnings, deductions, benefits, reimbursements) for different countries in the payroll system. This API is part of the multi-region payroll configuration system and integrates with existing country and currency management.

## Base URL

```
/api/v1/payroll/configuration/countries/{countryId}/salary-components
```

## Authentication

All endpoints require JWT authentication with appropriate role-based access:

- **Admin**: Full access to all operations
- **HR**: Full access to all operations
- **EOR**: Read-only access

## Endpoints

### 1. Create Salary Component

**POST** `/api/v1/payroll/configuration/countries/{countryId}/salary-components`

Creates a new salary component for a specific country.

#### Request Body

```json
{
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Basic Salary",
  "componentCode": "BASIC",
  "componentType": "earnings",
  "calculationType": "fixed_amount",
  "calculationValue": 50000.0,
  "calculationFormula": null,
  "isTaxable": true,
  "isStatutory": false,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Basic salary component",
  "isActive": true
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `countryId` | UUID | Yes | ID of the country |
| `componentName` | String | Yes | Name of the salary component (max 100 chars) |
| `componentCode` | String | Yes | Unique code for the component (max 50 chars) |
| `componentType` | Enum | Yes | Type: `earnings`, `deductions`, `benefits`, `reimbursements` |
| `calculationType` | Enum | Yes | Calculation method: `fixed_amount`, `percentage_of_basic`, `percentage_of_gross`, `percentage_of_net`, `formula` |
| `calculationValue` | Decimal | Conditional | Value for calculation (required for fixed_amount, percentage types) |
| `calculationFormula` | String | Conditional | Formula string (required for formula type) |
| `isTaxable` | Boolean | Yes | Whether the component is taxable |
| `isStatutory` | Boolean | Yes | Whether the component is statutory |
| `isMandatory` | Boolean | Yes | Whether the component is mandatory |
| `displayOrder` | Integer | Yes | Display order (≥ 0) |
| `description` | String | No | Description of the component |
| `isActive` | Boolean | Yes | Whether the component is active |

#### Response

**201 Created**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Basic Salary",
  "componentCode": "BASIC",
  "componentType": "earnings",
  "calculationType": "fixed_amount",
  "calculationValue": 50000.0,
  "calculationFormula": null,
  "isTaxable": true,
  "isStatutory": false,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Basic salary component",
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

### 2. Get Salary Components

**GET** `/api/v1/payroll/configuration/countries/{countryId}/salary-components`

Retrieves paginated list of salary components for a country.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 10 | Items per page |
| `componentType` | String | - | Filter by component type |
| `isActive` | Boolean | - | Filter by active status |

#### Example Request

```
GET /api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/salary-components?page=1&limit=10&componentType=earnings&isActive=true
```

#### Response

**200 OK**

```json
{
  "components": [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "countryId": "550e8400-e29b-41d4-a716-446655440000",
      "componentName": "Basic Salary",
      "componentCode": "BASIC",
      "componentType": "earnings",
      "calculationType": "fixed_amount",
      "calculationValue": 50000.0,
      "isTaxable": true,
      "isStatutory": false,
      "isMandatory": true,
      "displayOrder": 1,
      "description": "Basic salary component",
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

### 3. Get Salary Component by ID

**GET** `/api/v1/payroll/configuration/countries/{countryId}/salary-components/{id}`

Retrieves a specific salary component by ID.

#### Response

**200 OK**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Basic Salary",
  "componentCode": "BASIC",
  "componentType": "earnings",
  "calculationType": "fixed_amount",
  "calculationValue": 50000.0,
  "calculationFormula": null,
  "isTaxable": true,
  "isStatutory": false,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Basic salary component",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### Error Responses

- **404 Not Found**: Component not found
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Insufficient permissions

### 4. Get Salary Components by Type

**GET** `/api/v1/payroll/configuration/countries/{countryId}/salary-components/by-type/{componentType}`

Retrieves all active salary components of a specific type for a country.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `componentType` | String | Component type: `earnings`, `deductions`, `benefits`, `reimbursements` |

#### Response

**200 OK**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Basic Salary",
    "componentCode": "BASIC",
    "componentType": "earnings",
    "calculationType": "fixed_amount",
    "calculationValue": 50000.0,
    "isTaxable": true,
    "isStatutory": false,
    "isMandatory": true,
    "displayOrder": 1,
    "description": "Basic salary component",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### 5. Update Salary Component

**PUT** `/api/v1/payroll/configuration/countries/{countryId}/salary-components/{id}`

Updates an existing salary component.

#### Request Body

```json
{
  "componentName": "Updated Basic Salary",
  "calculationValue": 60000.0,
  "description": "Updated description"
}
```

#### Response

**200 OK**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "countryId": "550e8400-e29b-41d4-a716-446655440000",
  "componentName": "Updated Basic Salary",
  "componentCode": "BASIC",
  "componentType": "earnings",
  "calculationType": "fixed_amount",
  "calculationValue": 60000.0,
  "calculationFormula": null,
  "isTaxable": true,
  "isStatutory": false,
  "isMandatory": true,
  "displayOrder": 1,
  "description": "Updated description",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:30:00.000Z"
}
```

### 6. Delete Salary Component

**DELETE** `/api/v1/payroll/configuration/countries/{countryId}/salary-components/{id}`

Deletes a salary component.

#### Response

**200 OK**

```json
{
  "message": "Salary component deleted successfully"
}
```

#### Error Responses

- **400 Bad Request**: Cannot delete mandatory component
- **404 Not Found**: Component not found
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Insufficient permissions

## Validation Rules

### Component Code Uniqueness
- Component codes must be unique within the same country
- Case-sensitive validation

### Calculation Type Validation
- **Fixed Amount**: Requires `calculationValue`, no `calculationFormula`
- **Percentage Types**: Requires `calculationValue` (0-100), no `calculationFormula`
- **Formula**: Requires `calculationFormula`, no `calculationValue`

### Business Rules
- Percentage values must be between 0 and 100
- Display order must be non-negative
- Component names and codes cannot be empty
- Country must exist and be active

## Country-Specific Rules

### India
- Maximum percentage for percentage-based components: 100%
- Special validation for statutory components

### Philippines
- Different maximum percentages based on component type
- Special handling for SSS-related components

### Australia
- Superannuation-specific validation rules
- Different tax treatment for certain components

## Error Handling

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "calculationValue",
      "message": "Calculation value is required for fixed_amount type"
    }
  ]
}
```

## Rate Limiting

- **Create/Update/Delete**: 100 requests per minute per user
- **Read Operations**: 1000 requests per minute per user

## Examples

### Creating a Basic Salary Component

```bash
curl -X POST \
  'https://api.teamified.com/api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/salary-components' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Basic Salary",
    "componentCode": "BASIC",
    "componentType": "earnings",
    "calculationType": "fixed_amount",
    "calculationValue": 50000.0,
    "isTaxable": true,
    "isStatutory": false,
    "isMandatory": true,
    "displayOrder": 1,
    "description": "Basic salary component",
    "isActive": true
  }'
```

### Creating a Percentage-Based Component

```bash
curl -X POST \
  'https://api.teamified.com/api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/salary-components' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Housing Allowance",
    "componentCode": "HRA",
    "componentType": "benefits",
    "calculationType": "percentage_of_basic",
    "calculationValue": 40.0,
    "isTaxable": true,
    "isStatutory": false,
    "isMandatory": false,
    "displayOrder": 2,
    "description": "Housing rent allowance at 40% of basic salary",
    "isActive": true
  }'
```

### Creating a Formula-Based Component

```bash
curl -X POST \
  'https://api.teamified.com/api/v1/payroll/configuration/countries/550e8400-e29b-41d4-a716-446655440000/salary-components' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "countryId": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "Transport Allowance",
    "componentCode": "TA",
    "componentType": "benefits",
    "calculationType": "formula",
    "calculationFormula": "BASIC * 0.1 + 2000",
    "isTaxable": true,
    "isStatutory": false,
    "isMandatory": false,
    "displayOrder": 3,
    "description": "Transport allowance with complex calculation",
    "isActive": true
  }'
```
