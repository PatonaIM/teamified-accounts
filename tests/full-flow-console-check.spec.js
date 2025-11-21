import { test, expect } from '@playwright/test';

test('Full flow console check - Login to Dashboard to CV', async ({ page, context }) => {
  // Clear all browser storage and cache
  await context.clearCookies();
  await context.clearPermissions();
  
  // Clear localStorage and sessionStorage
  await context.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  const consoleMessages = [];
  const networkRequests = [];
  const pageErrors = [];

  // Capture ALL console messages
  page.on('console', msg => {
    const msgText = msg.text();
    const msgType = msg.type();
    consoleMessages.push({ type: msgType, text: msgText, timestamp: Date.now() });
    console.log(`[CONSOLE ${msgType.toUpperCase()}] ${msgText}`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  // Capture all network responses
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    networkRequests.push({ url, status, timestamp: Date.now() });
    
    // Log API requests
    if (url.includes('/api/')) {
      console.log(`[NETWORK ${status}] ${url}`);
    }
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  test.setTimeout(90000);

  console.log('\n========================================');
  console.log('FULL FLOW CONSOLE ERROR CHECK');
  console.log('========================================\n');

  // Step 1: Navigate to login
  console.log('Step 1: Navigating to login page...');
  // Add cache-busting parameter to force fresh load
  await page.goto(`http://localhost/login?_=${Date.now()}`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`✓ On login page: ${page.url()}`);
  await page.waitForTimeout(1000);

  // Step 2: Fill login form
  console.log('\nStep 2: Filling login form...');
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  await page.fill('input[name="email"]', 'user25@teamified.com');
  await page.fill('input[name="password"]', 'Admin123!');
  console.log('✓ Form filled');

  // Step 3: Submit login
  console.log('\nStep 3: Submitting login...');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log(`✓ Redirected to: ${page.url()}`);

  // Step 4: Wait for dashboard to load
  console.log('\nStep 4: Waiting for dashboard to load...');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(3000);
  console.log('✓ Dashboard loaded');

  // Take screenshot of dashboard
  await page.screenshot({ path: 'test-results/dashboard-console-check.png', fullPage: true });
  console.log('✓ Dashboard screenshot saved');

  // Step 5: Navigate to CV page
  console.log('\nStep 5: Navigating to CV page...');
  await page.goto('http://localhost/cv', { waitUntil: 'networkidle', timeout: 10000 });
  console.log(`✓ On CV page: ${page.url()}`);
  await page.waitForTimeout(3000);
  console.log('✓ CV page loaded');

  // Take screenshot of CV page
  await page.screenshot({ path: 'test-results/cv-console-check.png', fullPage: true });
  console.log('✓ CV page screenshot saved');

  // Summary
  console.log('\n========================================');
  console.log('FINAL SUMMARY');
  console.log('========================================');
  console.log(`Total console messages: ${consoleMessages.length}`);
  console.log(`Total page errors: ${pageErrors.length}`);
  console.log(`Total network requests: ${networkRequests.length}`);

  const errors = consoleMessages.filter(m => m.type === 'error');
  const warnings = consoleMessages.filter(m => m.type === 'warning');
  
  console.log(`\n--- Console Errors: ${errors.length} ---`);
  if (errors.length > 0) {
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.text}`);
    });
  } else {
    console.log('  ✅ No console errors!');
  }

  console.log(`\n--- Console Warnings: ${warnings.length} ---`);
  if (warnings.length > 0) {
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.text}`);
    });
  } else {
    console.log('  ✅ No console warnings!');
  }

  const badRequests = networkRequests.filter(r => r.status >= 400);
  console.log(`\n--- Failed Network Requests (4xx/5xx): ${badRequests.length} ---`);
  if (badRequests.length > 0) {
    badRequests.forEach((req, i) => {
      console.log(`  ${i + 1}. [${req.status}] ${req.url}`);
    });
  } else {
    console.log('  ✅ No failed network requests!');
  }

  // Check for specific errors mentioned by user
  const payroll403 = networkRequests.filter(r => 
    r.url.includes('/payroll/configuration/countries') && r.status === 403
  );
  
  const payroll404 = networkRequests.filter(r => 
    r.url.includes('/payroll') && r.status === 404
  );

  const mapErrors = consoleMessages.filter(m => 
    m.text.toLowerCase().includes('map is not a function') || 
    m.text.toLowerCase().includes('error loading countries')
  );

  const typeErrors = consoleMessages.filter(m =>
    m.text.toLowerCase().includes('typeerror')
  );

  console.log(`\n========================================`);
  console.log('SPECIFIC ERROR CHECK (User Reported)');
  console.log(`========================================`);
  
  console.log(`\n1. 403 Forbidden on payroll/configuration/countries: ${payroll403.length}`);
  if (payroll403.length > 0) {
    console.log('   ❌ FOUND:');
    payroll403.forEach(err => console.log(`      ${err.url}`));
  } else {
    console.log('   ✅ FIXED: No 403 errors on payroll config');
  }

  console.log(`\n2. 404 Not Found on payroll endpoints: ${payroll404.length}`);
  if (payroll404.length > 0) {
    console.log('   ❌ FOUND:');
    payroll404.forEach(err => console.log(`      ${err.url}`));
  } else {
    console.log('   ✅ FIXED: No 404 errors on payroll endpoints');
  }

  console.log(`\n3. "Error loading countries" messages: ${mapErrors.length}`);
  if (mapErrors.length > 0) {
    console.log('   ❌ FOUND:');
    mapErrors.forEach(err => console.log(`      ${err.text}`));
  } else {
    console.log('   ✅ FIXED: No "Error loading countries" messages');
  }

  console.log(`\n4. "e.map is not a function" TypeError: ${typeErrors.length}`);
  if (typeErrors.length > 0) {
    console.log('   ❌ FOUND:');
    typeErrors.forEach(err => console.log(`      ${err.text}`));
  } else {
    console.log('   ✅ FIXED: No TypeError about map function');
  }

  console.log(`\n========================================`);
  console.log('TEST RESULT');
  console.log(`========================================`);
  
  const allFixed = errors.length === 0 && 
                   payroll403.length === 0 && 
                   payroll404.length === 0 && 
                   mapErrors.length === 0 && 
                   typeErrors.length === 0;

  if (allFixed) {
    console.log('✅ ✅ ✅ ALL ERRORS FIXED! ✅ ✅ ✅');
  } else {
    console.log('❌ ERRORS STILL PRESENT');
  }
  console.log(`========================================\n`);

  // Assertions
  expect(errors, 'Should have no console errors').toEqual([]);
  expect(payroll403, 'Should have no 403 on payroll config').toEqual([]);
  expect(payroll404, 'Should have no 404 on payroll endpoints').toEqual([]);
  expect(mapErrors, 'Should have no "Error loading countries"').toEqual([]);
  expect(typeErrors, 'Should have no TypeError about map').toEqual([]);
});

