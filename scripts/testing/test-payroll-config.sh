#!/bin/bash

# Test script to verify payroll configuration data and API
# Usage: ./test-payroll-config.sh

BACKEND_URL="https://teamified-team-member-portal-backend.vercel.app"

echo "🔍 Testing Payroll Configuration Setup"
echo "========================================"
echo ""

# First, login to get a token
echo "1. Logging in as admin@teamified.com..."
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teamified.com","password":"Admin123!"}')

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get access token. Check if admin user exists and password is correct."
  exit 1
fi

echo "✅ Got access token: ${TOKEN:0:20}..."
echo ""

# Test countries endpoint
echo "2. Testing GET /api/v1/payroll/configuration/countries..."
COUNTRIES_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/v1/payroll/configuration/countries" \
  -H "Authorization: Bearer $TOKEN")

echo "Countries response:"
echo "$COUNTRIES_RESPONSE" | jq '.' 2>/dev/null || echo "$COUNTRIES_RESPONSE"
echo ""

# Count countries
COUNTRY_COUNT=$(echo "$COUNTRIES_RESPONSE" | jq 'length' 2>/dev/null)
if [ "$COUNTRY_COUNT" == "null" ] || [ -z "$COUNTRY_COUNT" ]; then
  echo "❌ Failed to get countries or invalid response format"
  exit 1
fi

echo "✅ Found $COUNTRY_COUNT countries"
echo ""

# Test health endpoint
echo "3. Testing backend health..."
HEALTH_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/health")
echo "Health response:"
echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

echo "========================================"
echo "✅ Test complete!"
echo ""
echo "Summary:"
echo "- Backend URL: $BACKEND_URL"
echo "- Admin login: $([ -n "$TOKEN" ] && echo "✅ Success" || echo "❌ Failed")"
echo "- Countries API: $([ "$COUNTRY_COUNT" -gt 0 ] && echo "✅ $COUNTRY_COUNT countries found" || echo "❌ No countries found")"
echo ""

if [ "$COUNTRY_COUNT" -eq 0 ]; then
  echo "⚠️  WARNING: No countries found in database!"
  echo "   Run the production seed script:"
  echo "   POSTGRES_URL=\"your-db-url\" npm run seed:prod"
fi

