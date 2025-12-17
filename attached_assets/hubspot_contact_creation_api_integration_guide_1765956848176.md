# HubSpot Contact Creation API Integration Guide

This document provides comprehensive instructions for integrating HubSpot Contact Creation into a signup flow. Use this guide to replicate the integration in other applications.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Configuration](#api-configuration)
4. [Field Mappings](#field-mappings)
5. [Data Structures](#data-structures)
6. [API Implementation](#api-implementation)
7. [Integration Flow](#integration-flow)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This integration automatically creates or updates HubSpot CRM contacts when a business user completes a signup form. The integration:

- Creates new contacts with lead lifecycle stage
- Updates existing contacts if email already exists (handles 409 conflict)
- Maps form fields to HubSpot contact properties
- Runs asynchronously without blocking the signup process
- Logs all operations for debugging

---

## Prerequisites

### 1. HubSpot Private App

Create a HubSpot Private App with the following scopes:
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`

### 2. Environment Variable

```bash
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Custom Properties in HubSpot

Before integration, create these custom contact properties in HubSpot:

| Property Internal Name | Label | Field Type | Description |
|------------------------|-------|------------|-------------|
| `what_roles_do_you_need` | What roles do you need? | Single-line text | Roles the client needs to hire |
| `how_can_we_help_you_` | How can we help you? | Multi-line text | How we can assist (note trailing underscore) |
| `company_size__contact` | Company Size | Single-line text | Size of the company (note double underscore) |
| `secondary_phone` | Secondary Phone | Single-line text | Alternative phone number |

**CRITICAL**: Property internal names must match EXACTLY, including trailing underscores.

---

## API Configuration

### Base URL

```
https://api.hubapi.com
```

### Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create Contact | POST | `/crm/v3/objects/contacts` |
| Update Contact | PATCH | `/crm/v3/objects/contacts/{contactId}` |
| Get Contact | GET | `/crm/v3/objects/contacts/{contactId}` |

### Authentication

All requests require a Bearer token in the Authorization header:

```http
Authorization: Bearer {HUBSPOT_ACCESS_TOKEN}
Content-Type: application/json
```

---

## Field Mappings

### Form Fields to HubSpot Properties

| Form Field | HubSpot Property | Type | Notes |
|------------|------------------|------|-------|
| `email` | `email` | Standard | Required, unique identifier |
| `firstName` | `firstname` | Standard | First name (lowercase in HubSpot) |
| `lastName` | `lastname` | Standard | Last name (lowercase in HubSpot) |
| `company` | `company` | Standard | Company name |
| `mobileNumber` | `phone` | Standard | Primary phone (takes precedence) |
| `phoneNumber` | `secondary_phone` | Custom | Secondary phone |
| `website` | `website` | Standard | Company website URL |
| `businessDescription` | `message` | Standard | Prefixed with "Business Description:" |
| `rolesNeeded` | `what_roles_do_you_need` | Custom | Hiring needs |
| `howCanWeHelp` | `how_can_we_help_you_` | Custom | Note trailing underscore |
| `companySize` | `company_size__contact` | Custom | Note double underscore |
| N/A | `lifecyclestage` | Standard | Always set to "lead" |
| N/A | `hs_lead_status` | Standard | Always set to "New Lead" |

### Properties NOT Sent

| Property | Reason |
|----------|--------|
| `ip_country` | Read-only HubSpot property |
| `industry` | No custom property configured |

---

## Data Structures

### Input Interface

```typescript
interface HubSpotContactData {
  email: string              // Required
  firstName: string          // Required
  lastName: string           // Required
  company: string            // Required
  phone?: string             // Optional, fallback for mobileNumber
  mobileNumber?: string      // Optional, primary phone
  phoneNumber?: string       // Optional, secondary phone
  rolesNeeded?: string       // Optional, custom field
  howCanWeHelp?: string      // Optional, custom field
  country?: string           // Optional (not sent - read-only in HubSpot)
  website?: string           // Optional
  businessDescription?: string // Optional, mapped to message
  industry?: string          // Optional (not sent - no property)
  companySize?: string       // Optional, custom field
}
```

### Output Interface

```typescript
interface HubSpotContactResult {
  success: boolean
  contactId?: string         // HubSpot contact ID
  action?: "created" | "updated"
  error?: string
}
```

### HubSpot API Response

```typescript
interface HubSpotContactResponse {
  id: string
  properties: Record<string, string>
  createdAt: string
  updatedAt: string
  archived: boolean
}
```

---

## API Implementation

### Complete Implementation (TypeScript)

```typescript
const HUBSPOT_API_BASE_URL = "https://api.hubapi.com"
const HUBSPOT_CONTACTS_ENDPOINT = `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts`

/**
 * Build the HubSpot contact properties payload
 */
function buildContactProperties(data: HubSpotContactData): Record<string, string> {
  const properties: Record<string, string> = {
    email: data.email,
    firstname: data.firstName,
    lastname: data.lastName,
    company: data.company,
    lifecyclestage: "lead",
    hs_lead_status: "New Lead",
  }

  // Primary phone: mobileNumber takes precedence
  const primaryPhone = data.mobileNumber || data.phone
  if (primaryPhone) {
    properties.phone = primaryPhone
  }

  if (data.website) {
    properties.website = data.website
  }

  // Business Description with prefix
  if (data.businessDescription) {
    properties.message = `Business Description: ${data.businessDescription}`
  }

  // Custom properties - names must match EXACTLY
  if (data.rolesNeeded) {
    properties.what_roles_do_you_need = data.rolesNeeded
  }

  if (data.howCanWeHelp) {
    properties.how_can_we_help_you_ = data.howCanWeHelp  // Note trailing underscore
  }

  if (data.companySize) {
    properties.company_size__contact = data.companySize  // Note double underscore
  }

  if (data.phoneNumber) {
    properties.secondary_phone = data.phoneNumber
  }

  return properties
}

/**
 * Create a new HubSpot contact
 */
async function createContact(
  properties: Record<string, string>,
  accessToken: string
): Promise<HubSpotContactResponse> {
  const response = await fetch(HUBSPOT_CONTACTS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.message || `HubSpot API error: ${response.status}`)
    ;(error as any).status = response.status
    ;(error as any).category = errorData.category || "UNKNOWN"
    throw error
  }

  return response.json()
}

/**
 * Update an existing HubSpot contact
 */
async function updateContact(
  contactId: string,
  properties: Record<string, string>,
  accessToken: string
): Promise<HubSpotContactResponse> {
  const url = `${HUBSPOT_CONTACTS_ENDPOINT}/${contactId}`
  
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HubSpot update error: ${response.status}`)
  }

  return response.json()
}

/**
 * Extract contact ID from 409 conflict error message
 * Format: "Contact already exists. Existing ID: 12345678901"
 */
function extractExistingContactId(errorMessage: string): string | null {
  const match = errorMessage.match(/Existing ID:\s*(\d+)/)
  return match ? match[1] : null
}

/**
 * Main function: Create or update HubSpot contact
 */
async function createOrUpdateHubspotContact(
  data: HubSpotContactData
): Promise<HubSpotContactResult> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN

  if (!accessToken) {
    console.warn("[HubSpot] HUBSPOT_ACCESS_TOKEN not configured")
    return {
      success: false,
      error: "HubSpot integration not configured",
    }
  }

  const properties = buildContactProperties(data)

  try {
    const result = await createContact(properties, accessToken)
    
    return {
      success: true,
      contactId: result.id,
      action: "created",
    }
  } catch (error) {
    const err = error as Error & { status?: number; category?: string }
    
    // Handle duplicate contact (409 Conflict)
    if (err.status === 409 || err.category === "CONFLICT") {
      const existingId = extractExistingContactId(err.message)
      
      if (existingId) {
        try {
          const updateResult = await updateContact(existingId, properties, accessToken)
          
          return {
            success: true,
            contactId: updateResult.id,
            action: "updated",
          }
        } catch (updateError) {
          return {
            success: false,
            contactId: existingId,
            error: `Failed to update: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
          }
        }
      }
    }

    return {
      success: false,
      error: err.message || "Unknown HubSpot error",
    }
  }
}
```

---

## Integration Flow

### Sequence Diagram

```
User Signup Form
       │
       ▼
┌─────────────────────┐
│  1. User completes  │
│     signup form     │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  2. Primary signup  │
│     operations      │
│  (client creation,  │
│   email invite)     │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  3. Call HubSpot    │
│     integration     │
│  createOrUpdate...  │
└─────────────────────┘
       │
       ├──── Success ────► Log contact ID
       │
       └──── Failure ────► Log error (don't fail signup)
       │
       ▼
┌─────────────────────┐
│  4. Return signup   │
│     result to user  │
└─────────────────────┘
```

### Best Practice: Non-Blocking Integration

The HubSpot integration should **never** block or fail the main signup flow:

```typescript
// In your signup handler
let hubspotResult: HubSpotContactResult = { success: false }

try {
  hubspotResult = await createOrUpdateHubspotContact({
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    company: formData.company,
    // ... other fields
  })

  if (hubspotResult.success) {
    console.log("HubSpot contact created:", hubspotResult.contactId)
  } else {
    console.error("HubSpot failed:", hubspotResult.error)
  }
} catch (hubspotError) {
  // Never throw - just log and continue
  console.error("HubSpot exception:", hubspotError)
}

// Always return signup success (if primary operations succeeded)
return {
  success: true,
  hubspotContactCreated: hubspotResult.success,
  hubspotContactId: hubspotResult.contactId,
}
```

---

## Error Handling

### Common Errors

| Status | Category | Description | Solution |
|--------|----------|-------------|----------|
| 400 | VALIDATION_ERROR | Invalid property value | Check field types and values |
| 401 | UNAUTHORIZED | Invalid/expired token | Refresh HUBSPOT_ACCESS_TOKEN |
| 403 | FORBIDDEN | Missing scopes | Add required scopes to Private App |
| 409 | CONFLICT | Contact already exists | Extract ID and update instead |
| 429 | RATE_LIMIT | Too many requests | Implement backoff/retry |

### 409 Conflict Handling

When a contact with the same email already exists, HubSpot returns:

```json
{
  "status": "error",
  "message": "Contact already exists. Existing ID: 12345678901",
  "category": "CONFLICT"
}
```

Parse the ID using regex and update the existing contact:

```typescript
const match = errorMessage.match(/Existing ID:\s*(\d+)/)
if (match) {
  const existingId = match[1]
  await updateContact(existingId, properties, accessToken)
}
```

---

## Testing

### Test Payload

```json
{
  "properties": {
    "email": "test@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "company": "Test Company",
    "phone": "+1234567890",
    "website": "https://example.com",
    "lifecyclestage": "lead",
    "hs_lead_status": "New Lead",
    "message": "Business Description: Test company description",
    "what_roles_do_you_need": "Software Engineer, Product Manager",
    "how_can_we_help_you_": "Need help with hiring",
    "company_size__contact": "50-100"
  }
}
```

### cURL Test

```bash
curl -X POST 'https://api.hubapi.com/crm/v3/objects/contacts' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "properties": {
      "email": "test@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "company": "Test Company",
      "lifecyclestage": "lead",
      "hs_lead_status": "New Lead"
    }
  }'
```

### Expected Response

```json
{
  "id": "123456789",
  "properties": {
    "email": "test@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "company": "Test Company",
    "lifecyclestage": "lead",
    "hs_lead_status": "New Lead",
    "createdate": "2024-01-15T10:30:00.000Z",
    "lastmodifieddate": "2024-01-15T10:30:00.000Z"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "archived": false
}
```

---

## Troubleshooting

### Issue: "Property doesn't exist"

**Cause**: Custom property internal name doesn't match exactly.

**Solution**: 
1. Go to HubSpot Settings > Properties > Contact Properties
2. Find the property and check the "Internal name"
3. Use the exact internal name (case-sensitive, including underscores)

### Issue: "Cannot set read-only property"

**Cause**: Attempting to set a HubSpot-managed property.

**Common read-only properties**:
- `ip_country`
- `hs_analytics_*`
- `hs_calculated_*`

**Solution**: Remove these properties from your payload.

### Issue: Token Expired

**Cause**: Private App access token may have been rotated.

**Solution**: 
1. Go to HubSpot Settings > Integrations > Private Apps
2. Generate a new access token
3. Update `HUBSPOT_ACCESS_TOKEN` environment variable

### Issue: Rate Limiting (429)

**Cause**: Exceeded HubSpot's API rate limits.

**Solution**: Implement exponential backoff:

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if ((error as any).status === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
        continue
      }
      throw error
    }
  }
  throw new Error("Max retries exceeded")
}
```

---

## Quick Reference

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HUBSPOT_ACCESS_TOKEN` | HubSpot Private App access token | Yes |

### API Quick Reference

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create | POST | `/crm/v3/objects/contacts` |
| Update | PATCH | `/crm/v3/objects/contacts/{id}` |
| Get | GET | `/crm/v3/objects/contacts/{id}` |
| Delete | DELETE | `/crm/v3/objects/contacts/{id}` |

### Required Scopes

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`

---

*Last Updated: December 2024*
*Source: Teamified Main Website Integration*
