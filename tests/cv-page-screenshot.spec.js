import { test, expect } from '@playwright/test';

test('CV page screenshot with console check', async ({ page, context }) => {
  // Clear all storage
  await context.clearCookies();
  await context.clearPermissions();
  await context.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const consoleErrors = [];
  const networkErrors = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  // Capture network errors
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      networkErrors.push({ status, url: response.url() });
      console.log(`[NETWORK ${status}] ${response.url()}`);
    }
  });

  console.log('\n=== CV Page Console Error Check ===\n');

  // Step 1: Login
  console.log('Step 1: Logging in...');
  await page.goto(`http://localhost/login?_=${Date.now()}`, { waitUntil: 'networkidle', timeout: 30000 });
  
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  await page.fill('input[name="email"]', 'user25@teamified.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✓ Logged in successfully');

  // Step 2: Navigate to CV page
  console.log('\nStep 2: Navigating to CV page...');
  await page.goto(`http://localhost/cv?_=${Date.now()}`, { waitUntil: 'networkidle', timeout: 10000 });
  
  // Wait for the page to fully load
  await page.waitForSelector('text=CV Management', { timeout: 10000 });
  console.log('✓ CV page loaded');

  // Wait a bit for any async operations
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/cv-page-actual.png', 
    fullPage: true 
  });
  console.log('✓ Screenshot saved to test-results/cv-page-actual.png');

  // Report results
  console.log('\n=== Results ===');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors found:');
    consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  } else {
    console.log('✅ No console errors!');
  }

  console.log(`\nNetwork Errors (4xx/5xx): ${networkErrors.length}`);
  if (networkErrors.length > 0) {
    console.log('Errors found:');
    networkErrors.forEach((err, i) => console.log(`  ${i + 1}. [${err.status}] ${err.url}`));
  } else {
    console.log('✅ No network errors!');
  }

  // Assertions
  expect(consoleErrors, 'Should have no console errors').toEqual([]);
  expect(networkErrors, 'Should have no network errors').toEqual([]);

  console.log('\n✅ ✅ ✅ CV PAGE LOADS WITHOUT ERRORS! ✅ ✅ ✅\n');
});

