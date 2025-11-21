import { test, expect } from '@playwright/test';

test.describe('Console Error Verification', () => {
  let consoleErrors = [];
  let consoleWarnings = [];
  let networkErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    consoleWarnings = [];
    networkErrors = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: 'error',
          text: msg.text(),
          location: msg.location(),
        });
      } else if (msg.type() === 'warning') {
        consoleWarnings.push({
          type: 'warning',
          text: msg.text(),
        });
      }
    });

    // Capture network errors
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      
      // Log 4xx and 5xx errors
      if (status >= 400) {
        networkErrors.push({
          status,
          url,
          statusText: response.statusText(),
        });
      }
    });

    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText || 'Unknown error',
      });
    });
  });

  test('should have no console errors after login and navigation', async ({ page }) => {
    console.log('\n=== Starting Console Error Check ===\n');

    // Navigate to login
    await page.goto('http://localhost/login', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Navigated to login page');

    // Login
    await page.fill('input[type="email"]', 'user25@teamified.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    console.log('✓ Submitted login form');

    // Wait for redirect to dashboard
    await page.waitForURL('http://localhost/dashboard', { timeout: 10000 });
    console.log('✓ Redirected to dashboard');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('✓ Dashboard loaded');

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    // Navigate to CV page
    await page.goto('http://localhost/cv', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✓ Navigated to CV page');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✓ CV page loaded');

    // Print all captured errors
    console.log('\n=== Console Errors Captured ===');
    if (consoleErrors.length > 0) {
      console.log(`Found ${consoleErrors.length} console errors:`);
      consoleErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.text}`);
        if (err.location) {
          console.log(`   Location: ${err.location.url}:${err.location.lineNumber}`);
        }
      });
    } else {
      console.log('✅ No console errors found!');
    }

    console.log('\n=== Console Warnings Captured ===');
    if (consoleWarnings.length > 0) {
      console.log(`Found ${consoleWarnings.length} console warnings:`);
      consoleWarnings.forEach((warn, i) => {
        console.log(`\n${i + 1}. ${warn.text}`);
      });
    } else {
      console.log('✅ No console warnings found!');
    }

    console.log('\n=== Network Errors (4xx/5xx) ===');
    if (networkErrors.length > 0) {
      console.log(`Found ${networkErrors.length} network errors:`);
      networkErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.status || 'FAILED'} ${err.url}`);
        if (err.statusText) console.log(`   Status: ${err.statusText}`);
        if (err.failure) console.log(`   Failure: ${err.failure}`);
      });
    } else {
      console.log('✅ No network errors found!');
    }

    // Filter out expected errors (403 on payroll config is expected for candidates)
    const unexpectedErrors = networkErrors.filter(err => {
      // 403 on payroll config is expected for candidate users
      if (err.status === 403 && err.url.includes('/payroll/configuration')) {
        return false;
      }
      return true;
    });

    // Check for the specific errors mentioned by user
    const payrollConfigErrors = networkErrors.filter(err => 
      err.url.includes('/payroll/configuration/countries')
    );

    const mapErrors = consoleErrors.filter(err => 
      err.text.includes('map is not a function') || 
      err.text.includes('Error loading countries')
    );

    console.log('\n=== Specific Error Check ===');
    console.log(`Payroll config errors: ${payrollConfigErrors.length}`);
    payrollConfigErrors.forEach(err => {
      console.log(`  - ${err.status} ${err.url}`);
    });
    
    console.log(`Map function errors: ${mapErrors.length}`);
    mapErrors.forEach(err => {
      console.log(`  - ${err.text}`);
    });

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/console-error-check.png', fullPage: true });
    console.log('\n✓ Screenshot saved to test-results/console-error-check.png');

    console.log('\n=== Test Assertions ===');

    // Assert no console errors
    if (consoleErrors.length > 0) {
      console.log(`❌ FAIL: Found ${consoleErrors.length} console errors`);
    }
    expect(consoleErrors, 'Should have no console errors').toEqual([]);

    // Assert no map errors
    if (mapErrors.length > 0) {
      console.log(`❌ FAIL: Found ${mapErrors.length} map function errors`);
    }
    expect(mapErrors, 'Should have no "map is not a function" errors').toEqual([]);

    // Assert no unexpected network errors
    if (unexpectedErrors.length > 0) {
      console.log(`❌ FAIL: Found ${unexpectedErrors.length} unexpected network errors`);
    }
    expect(unexpectedErrors, 'Should have no unexpected network errors (403 on payroll config is OK)').toEqual([]);

    console.log('✅ All assertions passed!\n');
  });
});

