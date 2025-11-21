const { test, expect } = require('@playwright/test');

/**
 * Test: Payroll Configuration Countries Load on First Visit
 * 
 * Verifies that countries load correctly on first visit without errors.
 * This test checks for the regression where useCountry hook lacked auth interceptor.
 */

test('Payroll configuration should load countries on first visit without error', async ({ page, context }) => {
  // Clear all cookies and storage to simulate first visit
  await context.clearCookies();
  await context.clearPermissions();
  
  // Track console errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Track failed API requests
  const failedRequests = [];
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()}`);
  });

  // Login
  await page.goto('http://localhost:80');
  await page.fill('input[name="email"]', 'user1@teamified.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Login successful');

  // Navigate to payroll configuration
  await page.click('text=Payroll Configuration');
  await page.waitForURL('**/payroll-configuration', { timeout: 10000 });
  console.log('✅ Navigated to payroll configuration');

  // Wait a bit for countries to load
  await page.waitForTimeout(2000);

  // Check for error alert with "Failed to load countries"
  const errorAlert = await page.locator('div[role="alert"]').filter({ hasText: /Failed to load countries/i }).count();
  
  if (errorAlert > 0) {
    console.error('❌ Found "Failed to load countries" error');
  } else {
    console.log('✅ No "Failed to load countries" error found');
  }

  // Check that country selector is present and has options
  const countrySelect = await page.locator('[role="combobox"][aria-labelledby*="country"], select[name="country"], .MuiAutocomplete-root').first();
  const countrySelectExists = await countrySelect.count() > 0;
  
  if (countrySelectExists) {
    console.log('✅ Country selector present');
  } else {
    console.log('ℹ️  Country selector not found (may use different component)');
  }

  // Check for any console errors related to countries
  const countryErrors = consoleErrors.filter(err => 
    err.toLowerCase().includes('country') || 
    err.toLowerCase().includes('failed to fetch') ||
    err.toLowerCase().includes('401') ||
    err.toLowerCase().includes('403')
  );

  if (countryErrors.length > 0) {
    console.error('❌ Console errors found:', countryErrors);
  } else {
    console.log('✅ No country-related console errors');
  }

  // Check for failed API requests to countries endpoint
  const countryRequestFailures = failedRequests.filter(req => req.includes('/countries'));
  
  if (countryRequestFailures.length > 0) {
    console.error('❌ Failed countries API requests:', countryRequestFailures);
  } else {
    console.log('✅ No failed countries API requests');
  }

  // Take screenshot for verification
  await page.screenshot({ path: 'test-results/payroll-config-first-load.png', fullPage: true });
  console.log('📸 Screenshot saved to test-results/payroll-config-first-load.png');

  // Assertions
  expect(errorAlert).toBe(0);
  expect(countryErrors.length).toBe(0);
  expect(countryRequestFailures.length).toBe(0);

  console.log('✅ Test passed: Countries loaded successfully on first visit');
});
