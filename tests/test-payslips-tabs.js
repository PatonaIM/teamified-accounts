const { chromium } = require('playwright');

async function testPayslipsTabs() {
  console.log('🧪 Testing Payslips Page Tabs Interaction...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`❌ [CONSOLE ERROR] ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️  [WARNING] ${text}`);
    }
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      const error = `[${status}] ${url}`;
      networkErrors.push(error);
      console.log(`❌ [NETWORK ${status}] ${url}`);
    }
  });

  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto('http://localhost', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Check if we're on login page
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await page.fill('input[type="email"], input[name="email"]', 'user2@teamified.com');
      await page.waitForTimeout(500);
      await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
      await page.waitForTimeout(500);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      console.log('✅ Login complete');
    }

    // Navigate to Payslips
    console.log('\n📍 Navigating to Payslips page...');
    await page.goto('http://localhost/payslips', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('✅ Payslips page loaded\n');

    // Get all tabs
    const tabs = await page.$$('button[role="tab"]');
    console.log(`Found ${tabs.length} tabs\n`);

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const tabText = await tab.textContent();
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 Testing Tab ${i + 1}: "${tabText}"`);
      console.log('='.repeat(60));
      
      const errorsBefore = networkErrors.length;
      const consoleErrorsBefore = consoleErrors.length;

      // Click the tab
      await tab.click();
      console.log(`Clicked tab: ${tabText}`);
      
      // Wait for any API calls
      await page.waitForTimeout(3000);

      // Check for new errors
      const newNetworkErrors = networkErrors.length - errorsBefore;
      const newConsoleErrors = consoleErrors.length - consoleErrorsBefore;

      if (newNetworkErrors > 0) {
        console.log(`❌ ${newNetworkErrors} new network error(s)`);
        networkErrors.slice(errorsBefore).forEach(err => console.log(`   ${err}`));
      } else {
        console.log(`✅ No network errors`);
      }

      if (newConsoleErrors > 0) {
        console.log(`❌ ${newConsoleErrors} new console error(s)`);
        consoleErrors.slice(consoleErrorsBefore).forEach(err => console.log(`   ${err}`));
      } else {
        console.log(`✅ No console errors`);
      }

      // Check for error alerts in UI
      const alerts = await page.$$('[role="alert"]');
      if (alerts.length > 0) {
        console.log(`⚠️  ${alerts.length} alert(s) in UI:`);
        for (const alert of alerts) {
          const text = await alert.textContent();
          console.log(`   - ${text}`);
        }
      }
    }

    // Final Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Network Errors: ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      console.log('\nNetwork Errors:');
      networkErrors.forEach(err => console.log(`  ${err}`));
    }

    console.log(`\nTotal Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors:');
      consoleErrors.forEach(err => console.log(`  ${err}`));
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/payslips-tabs-test.png', fullPage: true });
    console.log('\n📸 Screenshot: test-results/payslips-tabs-test.png');

    console.log('\n⏸️  Keeping browser open for 20 seconds...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/payslips-tabs-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Test completed\n');
  }
}

testPayslipsTabs();

