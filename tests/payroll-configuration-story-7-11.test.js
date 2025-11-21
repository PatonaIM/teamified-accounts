const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track console errors
  const consoleErrors = [];
  const jsErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('Console Error:', msg.text());
    }
  });

  page.on('pageerror', error => {
    jsErrors.push(error.message);
    console.error('JavaScript Error:', error.message);
  });

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('Logging in...');
    await page.getByRole('textbox', { name: /email/i }).fill('user1@teamified.com');
    await page.locator('input[name="password"]').fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✓ Login successful');
    } catch (e) {
      console.log('Login might have failed, checking current URL...');
      console.log('Current URL:', page.url());
      
      // Wait a bit longer and check for any error messages
      await page.waitForTimeout(2000);
      const errorMessage = await page.locator('.form-error, [role="alert"]').textContent().catch(() => null);
      if (errorMessage) {
        console.log('Error message on page:', errorMessage);
      }
      
      // Continue anyway to check the configuration page
      console.log('Continuing test despite login issue...');
    }

    console.log('\nNavigating to Payroll Configuration...');
    await page.goto('http://localhost/payroll-configuration', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('✓ Payroll Configuration page loaded');

    // Check for the page heading
    const pageHeading = await page.locator('h3:has-text("Payroll Configuration")').isVisible();
    console.log(pageHeading ? '✓ Page heading found' : '✗ Page heading NOT found');

    // Check for tabs - Story 7.11 should have these tabs:
    // 0: Overview, 1: Tax Years, 2: Region Configurations, 3: Exchange Rates, 4: Salary Components, 5: Statutory Components
    console.log('\nChecking for tabs...');
    
    const tabs = [
      'Overview',
      'Tax Years',
      'Region Configurations', 
      'Exchange Rates',
      'Salary Components',
      'Statutory Components'
    ];

    for (const tabName of tabs) {
      try {
        const tab = await page.getByRole('tab', { name: tabName });
        const isVisible = await tab.isVisible({ timeout: 2000 });
        console.log(isVisible ? `✓ "${tabName}" tab found` : `✗ "${tabName}" tab NOT found`);
      } catch (e) {
        console.log(`✗ "${tabName}" tab NOT found`);
      }
    }

    // Verify Payroll Periods tab is REMOVED (Story 7.11 requirement)
    console.log('\nVerifying Payroll Periods tab is removed...');
    try {
      const payrollPeriodsTab = await page.getByRole('tab', { name: 'Payroll Periods' }).isVisible({ timeout: 2000 });
      console.log(payrollPeriodsTab ? '✗ Payroll Periods tab still exists (should be removed!)' : '✓ Payroll Periods tab removed');
    } catch (e) {
      console.log('✓ Payroll Periods tab removed (not found)');
    }

    // Click on Tax Years tab and check if component loads
    console.log('\nTesting Tax Years tab...');
    try {
      await page.getByRole('tab', { name: 'Tax Years' }).click();
      await page.waitForTimeout(1000);
      
      // Check for Tax Years component content
      const taxYearsHeading = await page.locator('h5:has-text("Tax Years")').isVisible({ timeout: 2000 });
      const createButton = await page.getByRole('button', { name: /create tax year/i }).isVisible({ timeout: 2000 });
      
      console.log(taxYearsHeading ? '✓ Tax Years component heading found' : '✗ Tax Years component heading NOT found');
      console.log(createButton ? '✓ Create Tax Year button found' : '✗ Create Tax Year button NOT found');
    } catch (e) {
      console.log('✗ Error testing Tax Years tab:', e.message);
    }

    // Click on Exchange Rates tab and check if component loads
    console.log('\nTesting Exchange Rates tab...');
    try {
      await page.getByRole('tab', { name: 'Exchange Rates' }).click();
      await page.waitForTimeout(1000);
      
      // Check for Exchange Rates component content
      const exchangeRatesHeading = await page.locator('h5:has-text("Exchange Rates")').isVisible({ timeout: 2000 });
      const createButton = await page.getByRole('button', { name: /create exchange rate/i }).isVisible({ timeout: 2000 });
      
      console.log(exchangeRatesHeading ? '✓ Exchange Rates component heading found' : '✗ Exchange Rates component heading NOT found');
      console.log(createButton ? '✓ Create Exchange Rate button found' : '✗ Create Exchange Rate button NOT found');
    } catch (e) {
      console.log('✗ Error testing Exchange Rates tab:', e.message);
    }

    // Click on Region Configurations tab and check if component loads
    console.log('\nTesting Region Configurations tab...');
    try {
      await page.getByRole('tab', { name: 'Region Configurations' }).click();
      await page.waitForTimeout(1000);
      
      // Check for Region Configurations component content
      const configHeading = await page.locator('h5:has-text("Region Configurations")').isVisible({ timeout: 2000 });
      const createButton = await page.getByRole('button', { name: /create configuration/i }).isVisible({ timeout: 2000 });
      
      console.log(configHeading ? '✓ Region Configurations component heading found' : '✗ Region Configurations component heading NOT found');
      console.log(createButton ? '✓ Create Configuration button found' : '✗ Create Configuration button NOT found');
    } catch (e) {
      console.log('✗ Error testing Region Configurations tab:', e.message);
    }

    // Take screenshot
    await page.screenshot({ path: 'payroll-configuration-story-7-11.png', fullPage: true });
    console.log('\n✓ Screenshot saved: payroll-configuration-story-7-11.png');

    // Report console and JS errors
    console.log('\n=== ERROR SUMMARY ===');
    if (consoleErrors.length === 0 && jsErrors.length === 0) {
      console.log('✓ No console or JavaScript errors detected!');
    } else {
      if (consoleErrors.length > 0) {
        console.log(`\n✗ ${consoleErrors.length} Console Errors:`);
        consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      }
      if (jsErrors.length > 0) {
        console.log(`\n✗ ${jsErrors.length} JavaScript Errors:`);
        jsErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      }
    }

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    await page.screenshot({ path: 'payroll-configuration-error.png' });
    console.log('Error screenshot saved: payroll-configuration-error.png');
  } finally {
    await browser.close();
  }
})();

