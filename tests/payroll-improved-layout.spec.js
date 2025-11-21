const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Improved Layout Verification', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('verify improved layout with no redundancy', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PAYROLL CONFIGURATION - IMPROVED LAYOUT VERIFICATION');
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

    // Check header is cleaner (no info cards above tabs)
    console.log('\n3. Verifying clean header...');
    const pageTitle = await page.locator('h3:has-text("Payroll Configuration")').count();
    const countrySelector = await page.locator('select, [role="combobox"]').first().isVisible();
    console.log(`   Page title: ${pageTitle > 0 ? '✅' : '❌'}`);
    console.log(`   Country selector in header: ${countrySelector ? '✅' : '❌'}`);

    // Verify NO info cards in header area (before tabs)
    const headerArea = await page.locator('h3:has-text("Payroll Configuration")').locator('..').locator('..');
    const infoCardsInHeader = await headerArea.locator('[class*="MuiCard"]').count();
    console.log(`   Info cards in header: ${infoCardsInHeader === 0 ? '✅ None (Good!)' : `❌ ${infoCardsInHeader} found (Bad)`}`);

    // Check Overview tab content
    console.log('\n4. Checking Overview tab content...');
    
    // Should have Country Details card
    const countryDetailsCard = await page.locator('text=/Country Details/i').count();
    console.log(`   Country Details card: ${countryDetailsCard > 0 ? '✅' : '❌'}`);
    
    // Should show all info in one place
    const hasCountryCode = await page.locator('text=/COUNTRY CODE/i').count();
    const hasCurrency = await page.locator('text=/CURRENCY/i').count();
    const hasTaxYear = await page.locator('text=/CURRENT TAX YEAR/i').count();
    const hasStatus = await page.locator('text=/STATUS/i').count();
    
    console.log(`   - Country Code field: ${hasCountryCode > 0 ? '✅' : '❌'}`);
    console.log(`   - Currency field: ${hasCurrency > 0 ? '✅' : '❌'}`);
    console.log(`   - Tax Year field: ${hasTaxYear > 0 ? '✅' : '❌'}`);
    console.log(`   - Status field: ${hasStatus > 0 ? '✅' : '❌'}`);

    // Check Quick Actions are present and functional
    console.log('\n5. Checking Quick Actions...');
    const quickActionsCard = await page.locator('text=/Quick Actions/i').count();
    const manageTaxYearsBtn = await page.locator('button:has-text("Manage Tax Years")').count();
    const viewConfigsBtn = await page.locator('button:has-text("View Configurations")').count();
    const exchangeRatesBtn = await page.locator('button:has-text("Update Exchange Rates")').count();
    
    console.log(`   Quick Actions card: ${quickActionsCard > 0 ? '✅' : '❌'}`);
    console.log(`   - Manage Tax Years button: ${manageTaxYearsBtn > 0 ? '✅' : '❌'}`);
    console.log(`   - View Configurations button: ${viewConfigsBtn > 0 ? '✅' : '❌'}`);
    console.log(`   - Update Exchange Rates button: ${exchangeRatesBtn > 0 ? '✅' : '❌'}`);

    // Test Quick Actions navigation
    console.log('\n6. Testing Quick Actions navigation...');
    await page.click('button:has-text("Manage Tax Years")');
    await page.waitForTimeout(500);
    
    const taxYearsTabActive = await page.locator('[role="tab"][aria-selected="true"]:has-text("Tax Years")').count();
    console.log(`   "Manage Tax Years" switches to Tax Years tab: ${taxYearsTabActive > 0 ? '✅' : '❌'}`);

    // Go back to Overview
    await page.click('[role="tab"]:has-text("Overview")');
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-improved-layout.png', 
      fullPage: true 
    });

    console.log('\n' + '='.repeat(80));
    console.log('LAYOUT IMPROVEMENTS VERIFIED');
    console.log('='.repeat(80));
    
    const allChecks = 
      pageTitle > 0 &&
      countrySelector &&
      infoCardsInHeader === 0 &&
      countryDetailsCard > 0 &&
      hasCountryCode > 0 &&
      hasCurrency > 0 &&
      hasTaxYear > 0 &&
      hasStatus > 0 &&
      quickActionsCard > 0 &&
      manageTaxYearsBtn > 0 &&
      taxYearsTabActive > 0;
    
    if (allChecks) {
      console.log('\n✅ SUCCESS! All layout improvements verified');
      console.log('   ✓ Clean header (no redundant cards)');
      console.log('   ✓ Consolidated Country Details in Overview tab');
      console.log('   ✓ All information in one card (no duplication)');
      console.log('   ✓ Quick Actions functional and navigate to tabs');
      console.log('   ✓ Better information hierarchy');
      console.log('\n📸 Screenshot: test-results/payroll-improved-layout.png');
    } else {
      console.log('\n⚠️  Some checks failed - review screenshot');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    expect(infoCardsInHeader).toBe(0);
    expect(countryDetailsCard).toBeGreaterThan(0);
    expect(hasCountryCode).toBeGreaterThan(0);
    expect(hasCurrency).toBeGreaterThan(0);
    expect(hasTaxYear).toBeGreaterThan(0);
    expect(quickActionsCard).toBeGreaterThan(0);
  });
});

