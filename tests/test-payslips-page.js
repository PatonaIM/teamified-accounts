const { chromium } = require('playwright');

async function testPayslipsPage() {
  console.log('🧪 Starting Payslips Page Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    
    if (type === 'error' || type === 'warning') {
      console.log(`[${type.toUpperCase()}] ${text}`);
    }
  });

  // Capture network errors
  const networkErrors = [];
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      const error = `${status} ${response.statusText()} - ${url}`;
      networkErrors.push(error);
      console.log(`❌ [NETWORK ERROR] ${error}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`❌ [PAGE ERROR] ${error.message}`);
  });

  try {
    // Navigate to the application
    console.log('📍 Navigating to http://localhost...');
    await page.goto('http://localhost', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check if we're on login page
    const loginButton = await page.$('button:has-text("Login")');
    if (loginButton) {
      console.log('🔐 Login page detected, logging in...');
      
      // Fill in credentials
      await page.fill('input[type="email"]', 'user2@teamified.com');
      await page.fill('input[type="password"]', 'Admin123!');
      await page.click('button:has-text("Login")');
      
      // Wait for navigation after login
      await page.waitForTimeout(3000);
      console.log('✅ Login successful');
    }

    // Navigate to Payslips page
    console.log('📍 Navigating to Payslips page...');
    await page.goto('http://localhost/payslips', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);

    // Check if page loaded
    const pageTitle = await page.textContent('h4, h5, h6').catch(() => null);
    console.log(`📄 Page title: ${pageTitle || 'Not found'}`);

    // Check for main tabs
    console.log('\n📑 Checking for tabs...');
    const tabs = await page.$$('button[role="tab"]');
    console.log(`Found ${tabs.length} tabs`);
    
    for (let i = 0; i < tabs.length; i++) {
      const tabText = await tabs[i].textContent();
      console.log(`  Tab ${i + 1}: ${tabText}`);
    }

    // Check for errors in the UI
    console.log('\n🔍 Checking for error messages in UI...');
    const alerts = await page.$$('[role="alert"]');
    if (alerts.length > 0) {
      console.log(`⚠️ Found ${alerts.length} alert(s):`);
      for (const alert of alerts) {
        const text = await alert.textContent();
        console.log(`  - ${text}`);
      }
    } else {
      console.log('✅ No error alerts in UI');
    }

    // Wait a bit more to catch any delayed network requests
    console.log('\n⏳ Waiting for additional network requests...');
    await page.waitForTimeout(5000);

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n🌐 Network Errors: ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      networkErrors.forEach(err => console.log(`  - ${err}`));
    }

    console.log(`\n📝 Console Messages:`);
    const errorMessages = consoleMessages.filter(m => m.type === 'error');
    const warningMessages = consoleMessages.filter(m => m.type === 'warning');
    const logMessages = consoleMessages.filter(m => m.type === 'log');
    
    console.log(`  Errors: ${errorMessages.length}`);
    if (errorMessages.length > 0) {
      errorMessages.slice(0, 10).forEach(m => console.log(`    - ${m.text}`));
      if (errorMessages.length > 10) {
        console.log(`    ... and ${errorMessages.length - 10} more`);
      }
    }
    
    console.log(`  Warnings: ${warningMessages.length}`);
    if (warningMessages.length > 0) {
      warningMessages.slice(0, 5).forEach(m => console.log(`    - ${m.text}`));
      if (warningMessages.length > 5) {
        console.log(`    ... and ${warningMessages.length - 5} more`);
      }
    }
    
    console.log(`  Logs: ${logMessages.length}`);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/payslips-page-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved to test-results/payslips-page-test.png');

    // Keep browser open for inspection
    console.log('\n⏸️  Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'test-results/payslips-page-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Test completed\n');
  }
}

testPayslipsPage();

