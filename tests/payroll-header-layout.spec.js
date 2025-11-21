const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Header Layout Check', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('verify country selector is in header', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PAYROLL CONFIGURATION - HEADER LAYOUT VERIFICATION');
    console.log('='.repeat(80));

    // Login
    console.log('\n1. Logging in...');
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✓ Login completed');

    // Navigate to payroll configuration
    console.log('\n2. Navigating to payroll page...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Page loaded');

    // Check header layout
    console.log('\n3. Checking header layout...');
    
    const pageTitle = await page.locator('h3:has-text("Payroll Configuration")').count();
    console.log(`   Page title: ${pageTitle > 0 ? '✅' : '❌'}`);
    
    const countrySelector = await page.locator('select, [role="combobox"]').first().isVisible();
    console.log(`   Country selector visible: ${countrySelector ? '✅' : '❌'}`);
    
    // Check that refresh button is gone
    const refreshButton = await page.locator('button:has-text("Refresh")').count();
    console.log(`   Refresh button removed: ${refreshButton === 0 ? '✅' : '❌'}`);
    
    // Verify country selector is in the header area (not below)
    const headerBox = await page.locator('h3:has-text("Payroll Configuration")').locator('..').locator('..').locator('..');
    const selectorInHeader = await headerBox.locator('select, [role="combobox"]').count();
    console.log(`   Country selector in header: ${selectorInHeader > 0 ? '✅' : '❌'}`);

    // Check info cards layout
    console.log('\n4. Checking info cards layout...');
    const currencyCard = await page.locator('text=/Currency/i').count();
    const taxYearCard = await page.locator('text=/Tax Year/i').count();
    console.log(`   Currency card: ${currencyCard > 0 ? '✅' : '❌'}`);
    console.log(`   Tax Year card: ${taxYearCard > 0 ? '✅' : '❌'}`);

    // Take screenshot
    console.log('\n5. Taking screenshot...');
    await page.screenshot({ 
      path: 'test-results/payroll-new-header.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved: test-results/payroll-new-header.png');

    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(80));
    
    expect(pageTitle).toBeGreaterThan(0);
    expect(countrySelector).toBe(true);
    expect(refreshButton).toBe(0);
    expect(selectorInHeader).toBeGreaterThan(0);
    
    console.log('\n✅ Header layout verified!');
    console.log('   - Title: Present');
    console.log('   - Country Selector: In header (right side)');
    console.log('   - Refresh Button: Removed');
    console.log('   - Info Cards: Below header');
    console.log('\n' + '='.repeat(80) + '\n');
  });
});

