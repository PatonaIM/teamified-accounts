import { test, expect } from '@playwright/test';

test('Detailed console and network check', async ({ page }) => {
  const consoleMessages = [];
  const networkRequests = [];
  const pageErrors = [];

  // Capture ALL console messages (including logs, warnings, errors)
  page.on('console', msg => {
    const msgText = msg.text();
    const msgType = msg.type();
    consoleMessages.push({ type: msgType, text: msgText });
    console.log(`[CONSOLE ${msgType.toUpperCase()}] ${msgText}`);
  });

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  // Capture all network responses
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    networkRequests.push({ url, status });
    
    // Log interesting requests
    if (status >= 400 || url.includes('payroll') || url.includes('countries') || url.includes('/api/')) {
      console.log(`[NETWORK ${status}] ${url}`);
    }
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  test.setTimeout(60000);

  console.log('\n========================================');
  console.log('Starting detailed console check...');
  console.log('========================================\n');

  // Navigate to root
  console.log('Step 1: Navigating to http://localhost/');
  await page.goto('http://localhost/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`Current URL: ${page.url()}`);
  
  await page.waitForTimeout(3000);
  console.log('\nStep 2: Waiting 3 seconds for app to initialize...');

  // Check if we're on login page
  const currentUrl = page.url();
  console.log(`Final URL: ${currentUrl}`);

  // Try to get page title
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Check if React root is present
  const rootElement = await page.$('#root');
  console.log(`React root element found: ${rootElement !== null}`);

  if (rootElement) {
    const rootContent = await page.$eval('#root', el => el.innerHTML.substring(0, 200));
    console.log(`Root content (first 200 chars): ${rootContent}`);
  }

  // Take screenshot
  await page.screenshot({ path: 'test-results/detailed-check.png', fullPage: true });
  console.log('\nScreenshot saved to test-results/detailed-check.png');

  // Summary
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Total console messages: ${consoleMessages.length}`);
  console.log(`Total page errors: ${pageErrors.length}`);
  console.log(`Total network requests: ${networkRequests.length}`);

  const errors = consoleMessages.filter(m => m.type === 'error');
  const warnings = consoleMessages.filter(m => m.type === 'warning');
  
  console.log(`\nConsole errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.text}`);
    });
  }

  console.log(`\nConsole warnings: ${warnings.length}`);
  if (warnings.length > 0) {
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.text}`);
    });
  }

  const badRequests = networkRequests.filter(r => r.status >= 400);
  console.log(`\nFailed network requests (4xx/5xx): ${badRequests.length}`);
  if (badRequests.length > 0) {
    badRequests.forEach((req, i) => {
      console.log(`  ${i + 1}. [${req.status}] ${req.url}`);
    });
  }

  // Check for specific errors mentioned by user
  const payrollErrors = networkRequests.filter(r => 
    r.url.includes('/payroll/configuration/countries') && r.status === 403
  );
  
  const mapErrors = consoleMessages.filter(m => 
    m.text.includes('map is not a function') || 
    m.text.includes('Error loading countries')
  );

  console.log(`\n--- Specific Error Check ---`);
  console.log(`403 on payroll/configuration/countries: ${payrollErrors.length}`);
  console.log(`"map is not a function" errors: ${mapErrors.length}`);

  if (payrollErrors.length > 0) {
    console.log('\n❌ FOUND: 403 errors on payroll config');
    payrollErrors.forEach(err => console.log(`   ${err.url}`));
  } else {
    console.log('\n✅ PASS: No 403 errors on payroll config');
  }

  if (mapErrors.length > 0) {
    console.log('\n❌ FOUND: map function errors');
    mapErrors.forEach(err => console.log(`   ${err.text}`));
  } else {
    console.log('\n✅ PASS: No map function errors');
  }

  console.log('\n========================================\n');
});

