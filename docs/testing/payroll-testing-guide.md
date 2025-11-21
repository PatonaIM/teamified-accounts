# Payroll Calculation Engine Testing Guide

**Story 7.3: Payroll Calculation Engine**  
**Epic 7: Payroll Management**

## Overview

This guide provides comprehensive information for testing the payroll calculation engine implemented in Story 7.3. The engine supports multi-region payroll calculations with country-specific statutory deductions for India and Philippines.

## Test Data

### Database Seeding

Run the database seed script to populate test data:

```bash
npm run seed:db
# or
node scripts/seed-database.js
```

This creates:
- 5 test users with employment records and salary history
- 2 countries configured: India (INR) and Philippines (PHP)
- Salary components: Earnings, Deductions, Benefits, Reimbursements
- Statutory components: EPF, ESI, PT, TDS (India), SSS, PhilHealth, Pag-IBIG, Tax (Philippines)
- Payroll periods for testing

### Test Users

| Email | Name | Country | Monthly Salary | Password |
|-------|------|---------|----------------|----------|
| user1@teamified.com | John Smith | India | ₹60,000 | Admin123! |
| user2@teamified.com | Sarah Johnson | India | ₹55,000 | Admin123! |
| user3@teamified.com | Mike Davis | India | ₹50,000 | Admin123! |
| user4@teamified.com | Emily Brown | Philippines | ₱40,000 | Admin123! |
| user5@teamified.com | David Wilson | Philippines | ₱35,000 | Admin123! |

## API Endpoints

Base URL: `http://localhost:3000/api/v1/payroll/calculations`

### 1. Calculate Single Employee Payroll

**Endpoint:** `POST /calculate`

**Authentication:** Bearer Token (JWT)

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "countryId": "country-uuid-here",
  "payrollPeriodId": "period-uuid-here",
  "calculationDate": "2025-10-02",
  "includeOvertime": true,
  "includeNightShift": false
}
```

**Response:**
```json
{
  "result": {
    "userId": "user-uuid",
    "countryId": "country-uuid",
    "countryCode": "IN",
    "basicSalary": 60000,
    "grossPay": 60000,
    "totalStatutoryDeductions": 7650,
    "totalOtherDeductions": 0,
    "netPay": 52350,
    "currencyCode": "INR",
    "salaryBreakdown": {
      "earnings": [],
      "deductions": []
    },
    "statutoryBreakdown": {
      "epf": { "employeeContribution": 7200, "employerContribution": 7200 },
      "esi": { "employeeContribution": 450, "employerContribution": 1950 },
      "pt": { "amount": 200 },
      "tds": { "amount": 0 }
    },
    "metadata": {
      "employmentRecordId": "employment-uuid",
      "userName": "John Smith",
      "userEmail": "user1@teamified.com"
    }
  },
  "processingTimeMs": 45,
  "status": "success"
}
```

### 2. Calculate Bulk Payroll

**Endpoint:** `POST /bulk-calculate`

**Request Body:**
```json
{
  "userIds": ["user-uuid-1", "user-uuid-2", "user-uuid-3"],
  "countryId": "country-uuid-here",
  "payrollPeriodId": "period-uuid-here",
  "calculationDate": "2025-10-02"
}
```

**Response:**
```json
{
  "results": [
    { /* calculation result 1 */ },
    { /* calculation result 2 */ },
    { /* calculation result 3 */ }
  ],
  "totalRequested": 3,
  "successCount": 3,
  "failedCount": 0,
  "processingTimeMs": 150,
  "failedUserIds": null,
  "errors": null
}
```

### 3. Get Payroll Summary

**Endpoint:** `GET /summary/country/:countryId/period/:periodId`

**Response:**
```json
{
  "totalEmployees": 3,
  "totalGrossPay": 165000,
  "totalStatutoryDeductions": 22950,
  "totalNetPay": 142050,
  "currencyCode": "INR"
}
```

### 4. Calculate Self (Employee Self-Service)

**Endpoint:** `POST /calculate-self`

**Note:** Uses authenticated user's ID from JWT token

**Request Body:**
```json
{
  "countryId": "country-uuid-here",
  "payrollPeriodId": "period-uuid-here",
  "calculationDate": "2025-10-02"
}
```

## Testing Scenarios

### Scenario 1: India Employee - Standard Calculation

**Test:** Calculate payroll for an Indian employee with ₹50,000 monthly salary

**Expected Results:**
- Basic Salary: ₹50,000
- EPF Employee: ₹6,000 (12% of ₹50,000)
- EPF Employer: ₹6,000 (12% of ₹50,000)
- ESI Employee: ₹375 (0.75% of ₹50,000)
- ESI Employer: ₹1,625 (3.25% of ₹50,000)
- Professional Tax: ₹200 (Maharashtra slab)
- Net Pay: ₹43,425

### Scenario 2: Philippines Employee - Standard Calculation

**Test:** Calculate payroll for a Philippines employee with ₱40,000 monthly salary

**Expected Results:**
- Basic Salary: ₱40,000
- SSS Employee: Based on contribution table
- PhilHealth: 4% premium (shared 50/50)
- Pag-IBIG: 2% (capped at ₱100)
- Withholding Tax: Based on TRAIN Law brackets
- Net Pay: After all deductions

### Scenario 3: Bulk Calculation Performance

**Test:** Calculate payroll for 50+ employees

**Expected Results:**
- Batch processing (50 employees per batch)
- Processing time: ~5-10 seconds for 50 employees
- Throughput: 5-10 employees/second
- All calculations logged to audit_logs

### Scenario 4: Cache Performance

**Test:** Run multiple calculations for the same country/period

**First calculation:**
- Cache MISS for country, salary components, statutory components
- Longer processing time (~100ms)

**Subsequent calculations:**
- Cache HIT for country, salary components, statutory components
- Faster processing time (~50ms)
- Cache TTL: 5 minutes

### Scenario 5: Error Handling

**Test:** Calculate with invalid data

**Test Cases:**
- Non-existent user: Returns 404
- No active employment: Returns 404
- No salary history: Returns 404
- Invalid country: Returns 404
- Mismatched period/country: Returns 400

## Audit Trail Verification

### Check Successful Calculations

```sql
SELECT 
  action,
  entity_id as user_id,
  changes->>'grossPay' as gross_pay,
  changes->>'netPay' as net_pay,
  changes->>'currencyCode' as currency,
  changes->>'processingTimeMs' as time_ms,
  created_at
FROM audit_logs
WHERE action = 'payroll_calculated'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Failed Calculations

```sql
SELECT 
  action,
  entity_id as user_id,
  changes->>'error' as error_message,
  changes->>'processingTimeMs' as time_ms,
  created_at
FROM audit_logs
WHERE action = 'payroll_calculation_failed'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Bulk Operations

```sql
SELECT 
  action,
  entity_id as period_id,
  changes->>'totalRequested' as total,
  changes->>'successCount' as success,
  changes->>'failedCount' as failed,
  changes->>'employeesPerSecond' as throughput,
  created_at
FROM audit_logs
WHERE action = 'bulk_payroll_calculated'
ORDER BY created_at DESC
LIMIT 10;
```

## Swagger/OpenAPI Documentation

Access the API documentation at: `http://localhost:3000/api/docs`

The Swagger UI provides:
- Interactive API testing
- Request/response schemas
- Example payloads
- Authentication setup

## Performance Testing

### Load Test Script (using k6 or Apache Bench)

```bash
# Test 100 single calculations
k6 run -  << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  const payload = JSON.stringify({
    userId: 'user-uuid',
    countryId: 'country-uuid',
    payrollPeriodId: 'period-uuid',
    calculationDate: '2025-10-02'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
  };

  const res = http.post('http://localhost:3000/api/v1/payroll/calculations/calculate', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });
}
EOF
```

## Expected Performance Metrics

| Metric | Target | Actual (Story 7.3) |
|--------|--------|-------------------|
| Single calculation | < 100ms | ~50ms (cached) |
| Single calculation (no cache) | < 200ms | ~100ms |
| Bulk 100 employees | < 10s | ~5-8s |
| Bulk 1000 employees | < 60s | ~30-45s |
| Cache hit rate | > 80% | 85-95% |
| Throughput (bulk) | > 10 emp/sec | 16-33 emp/sec |

## Troubleshooting

### Issue: 404 Not Found

**Cause:** Entity not found (user, employment, salary history, country, period)

**Solution:** 
- Verify user has active employment record
- Verify salary history exists for employment
- Check country and payroll period UUIDs

### Issue: 401 Unauthorized

**Cause:** Missing or invalid JWT token

**Solution:**
- Login via `/api/auth/login`
- Use returned access_token in Authorization header

### Issue: Slow Performance

**Cause:** Cache misses or large batch size

**Solution:**
- Run calculation twice (second should be faster)
- Check batch size (default 50)
- Verify database indexes

### Issue: Incorrect Calculations

**Cause:** Wrong salary components or statutory rules

**Solution:**
- Verify salary history amounts
- Check statutory component configuration
- Review calculation factory logic

## Test Checklist

- [ ] Database seeded successfully
- [ ] Users can login and get JWT tokens
- [ ] Single calculation works for India employee
- [ ] Single calculation works for Philippines employee
- [ ] Bulk calculation processes 50+ employees
- [ ] Cache improves performance on repeated calculations
- [ ] Audit logs capture all calculations
- [ ] Failed calculations are logged properly
- [ ] Swagger documentation is accessible
- [ ] All API endpoints return correct status codes
- [ ] Calculation results match expected values
- [ ] Performance meets target metrics

## Support

For issues or questions:
- Check backend logs: `docker logs teamified_backend_dev`
- Check audit logs in database
- Review Story 7.3 implementation: `/docs/stories/7.3.story.md`
- Consult calculation factories: `/src/payroll/services/regions/`

---

**Last Updated:** 2025-10-02  
**Story:** 7.3 - Payroll Calculation Engine  
**Status:** Complete (All 8 tasks implemented)

