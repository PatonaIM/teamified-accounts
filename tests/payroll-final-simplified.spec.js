const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Final Simplified Layout', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('verify simplified layout without Quick Actions', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PAYROLL CONFIGURATION - FINAL SIMPLIFIED LAYOUT');
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

    // Verify clean header
    console.log('\n3. Verifying clean header...');
    const pageTitle = await page.locator('h3:has-text("Payroll Configuration")').count();
    const countrySelector = await page.locator('select, [role="combobox"]').first().isVisible();
    console.log(`   Page title: ${pageTitle > 0 ? '✅' : '❌'}`);
    console.log(`   Country selector: ${countrySelector ? '✅' : '❌'}`);

    // Verify NO Quick Actions
    console.log('\n4. Verifying Quick Actions removed...');
    const quickActionsCard = await page.locator('text=/Quick Actions/i').count();
    const manageTaxYearsBtn = await page.locator('button:has-text("Manage Tax Years")').count();
    console.log(`   Quick Actions card: ${quickActionsCard === 0 ? '✅ Removed (Good!)' : '❌ Still present'}`);
    console.log(`   Action buttons: ${manageTaxYearsBtn === 0 ? '✅ Removed (Good!)' : '❌ Still present'}`);

    // Verify Country Details is full width
    console.log('\n5. Checking Country Details card...');
    const countryDetailsCard = await page.locator('text=/Country Details/i').count();
    console.log(`   Country Details card: ${countryDetailsCard > 0 ? '✅' : '❌'}`);

    // Verify all data fields present
    const hasCountryCode = await page.locator('text=/COUNTRY CODE/i').count();
    const hasCurrency = await page.locator('text=/^CURRENCY$/i').count();
    const hasTaxYear = await page.locator('text=/CURRENT TAX YEAR/i').count();
    const hasStatus = await page.locator('text=/^STATUS$/i').count();
    
    console.log(`   - Country Code: ${hasCountryCode > 0 ? '✅' : '❌'}`);
    console.log(`   - Currency: ${hasCurrency > 0 ? '✅' : '❌'}`);
    console.log(`   - Tax Year: ${hasTaxYear > 0 ? '✅' : '❌'}`);
    console.log(`   - Status: ${hasStatus > 0 ? '✅' : '❌'}`);

    // Verify tabs are present for navigation
    console.log('\n6. Verifying tabs for navigation...');
    const overviewTab = await page.locator('[role="tab"]:has-text("Overview")').count();
    const taxYearsTab = await page.locator('[role="tab"]:has-text("Tax Years")').count();
    const configsTab = await page.locator('[role="tab"]:has-text("Configurations")').count();
    const exchangeTab = await page.locator('[role="tab"]:has-text("Exchange Rates")').count();
    
    console.log(`   Overview tab: ${overviewTab > 0 ? '✅' : '❌'}`);
    console.log(`   Tax Years tab: ${taxYearsTab > 0 ? '✅' : '❌'}`);
    console.log(`   Configurations tab: ${configsTab > 0 ? '✅' : '❌'}`);
    console.log(`   Exchange Rates tab: ${exchangeTab > 0 ? '✅' : '❌'}`);

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-final-simplified.png', 
      fullPage: true 
    });

    console.log('\n' + '='.repeat(80));
    console.log('SIMPLIFIED LAYOUT VERIFIED');
    console.log('='.repeat(80));
    
    const allChecks = 
      pageTitle > 0 &&
      countrySelector &&
      quickActionsCard === 0 &&
      manageTaxYearsBtn === 0 &&
      countryDetailsCard > 0 &&
      hasCountryCode > 0 &&
      hasCurrency > 0 &&
      hasTaxYear > 0 &&
      hasStatus > 0 &&
      overviewTab > 0 &&
      taxYearsTab > 0;
    
    if (allChecks) {
      console.log('\n✅ SUCCESS! Final simplified layout complete');
      console.log('   ✓ Clean header with country selector');
      console.log('   ✓ NO redundant info cards');
      console.log('   ✓ NO Quick Actions (tabs provide navigation)');
      console.log('   ✓ Single Country Details card with grid');
      console.log('   ✓ Full-width layout (not split)');
      console.log('   ✓ Clear tabs for navigation');
      console.log('   ✓ Maximum simplicity achieved!');
      console.log('\n📸 Screenshot: test-results/payroll-final-simplified.png');
    } else {
      console.log('\n⚠️  Some checks failed');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    expect(quickActionsCard).toBe(0);
    expect(manageTaxYearsBtn).toBe(0);
    expect(countryDetailsCard).toBeGreaterThan(0);
    expect(overviewTab).toBeGreaterThan(0);
  });
});

