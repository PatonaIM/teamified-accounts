import { test, expect } from '@playwright/test';

test('Check console errors on CV page', async ({ page, context }) => {
  // Clear all storage
  await context.clearCookies();
  await context.clearPermissions();
  await context.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const consoleMessages = [];
  const networkRequests = [];

  // Capture ALL console messages
  page.on('console', msg => {
    const msgType = msg.type();
    const msgText = msg.text();
    consoleMessages.push({ type: msgType, text: msgText });
    
    // Log to test output
    if (msgType === 'error') {
      console.log(`❌ [CONSOLE ERROR] ${msgText}`);
    } else if (msgType === 'warning') {
      console.log(`⚠️  [CONSOLE WARNING] ${msgText}`);
    }
  });

  // Capture network requests
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    networkRequests.push({ status, url });
    
    if (status >= 400) {
      console.log(`❌ [NETWORK ${status}] ${url}`);
    }
  });

  console.log('\n========================================');
  console.log('CV PAGE CONSOLE ERROR CHECK');
  console.log('========================================\n');

  // Step 1: Login
  console.log('Step 1: Logging in as candidate user...');
  await page.goto(`http://localhost/login?_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  await page.fill('input[name="email"]', 'user25@teamified.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Logged in successfully\n');

  // Step 2: Navigate to CV page
  console.log('Step 2: Navigating to CV page...');
  await page.goto(`http://localhost/cv?_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log('✅ Navigated to /cv\n');

  // Wait for any async operations
  console.log('Step 3: Waiting for page to load and API calls to complete...');
  await page.waitForTimeout(5000);
  console.log('✅ Wait complete\n');

  // Analyze results
  console.log('========================================');
  console.log('RESULTS');
  console.log('========================================\n');

  const errors = consoleMessages.filter(m => m.type === 'error');
  const warnings = consoleMessages.filter(m => m.type === 'warning');
  const networkErrors = networkRequests.filter(r => r.status >= 400);

  console.log(`Total console messages: ${consoleMessages.length}`);
  console.log(`Console errors: ${errors.length}`);
  console.log(`Console warnings: ${warnings.length}`);
  console.log(`Network requests: ${networkRequests.length}`);
  console.log(`Network errors (4xx/5xx): ${networkErrors.length}\n`);

  if (errors.length > 0) {
    console.log('❌ CONSOLE ERRORS FOUND:');
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.text}`);
    });
    console.log('');
  } else {
    console.log('✅ NO CONSOLE ERRORS!\n');
  }

  if (warnings.length > 0) {
    console.log('⚠️  CONSOLE WARNINGS FOUND:');
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.text}`);
    });
    console.log('');
  } else {
    console.log('✅ NO CONSOLE WARNINGS!\n');
  }

  if (networkErrors.length > 0) {
    console.log('❌ NETWORK ERRORS FOUND:');
    networkErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.status}] ${err.url}`);
    });
    console.log('');
  } else {
    console.log('✅ NO NETWORK ERRORS!\n');
  }

  // Check for specific errors user reported
  const payrollErrors = networkRequests.filter(r => 
    r.url.includes('/payroll/configuration/countries') && (r.status === 403 || r.status === 404)
  );
  
  const mapErrors = consoleMessages.filter(m => 
    m.text.toLowerCase().includes('map is not a function') ||
    m.text.toLowerCase().includes('error loading countries')
  );

  console.log('========================================');
  console.log('SPECIFIC ERROR CHECK (User Reported)');
  console.log('========================================\n');

  console.log(`1. Payroll config errors (403/404): ${payrollErrors.length}`);
  if (payrollErrors.length > 0) {
    console.log('   ❌ FOUND:');
    payrollErrors.forEach(err => console.log(`      [${err.status}] ${err.url}`));
  } else {
    console.log('   ✅ FIXED: No payroll config errors');
  }

  console.log(`\n2. "Error loading countries" or "map is not a function": ${mapErrors.length}`);
  if (mapErrors.length > 0) {
    console.log('   ❌ FOUND:');
    mapErrors.forEach(err => console.log(`      ${err.text}`));
  } else {
    console.log('   ✅ FIXED: No map/countries errors');
  }

  console.log('\n========================================');
  if (errors.length === 0 && networkErrors.length === 0 && mapErrors.length === 0 && payrollErrors.length === 0) {
    console.log('✅ ✅ ✅ ALL ERRORS FIXED! ✅ ✅ ✅');
  } else {
    console.log('❌ ERRORS STILL PRESENT');
  }
  console.log('========================================\n');

  // Assertions
  expect(errors, 'Should have no console errors').toEqual([]);
  expect(payrollErrors, 'Should have no payroll config errors').toEqual([]);
  expect(mapErrors, 'Should have no map/countries errors').toEqual([]);
});

