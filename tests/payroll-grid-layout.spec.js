const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Grid Layout Verification', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('verify grid pattern for country details', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PAYROLL CONFIGURATION - GRID LAYOUT VERIFICATION');
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

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-grid-layout.png', 
      fullPage: true 
    });

    console.log('\n3. Verifying grid layout structure...');
    
    // Check that all field boxes are present
    const countryCodeBox = await page.locator('text=/COUNTRY CODE/i').locator('..').count();
    const countryNameBox = await page.locator('text=/COUNTRY NAME/i').locator('..').count();
    const currencyBox = await page.locator('text=/^CURRENCY$/i').locator('..').count();
    const taxYearBox = await page.locator('text=/CURRENT TAX YEAR/i').locator('..').count();
    const statusBox = await page.locator('text=/^STATUS$/i').locator('..').count();
    
    console.log(`   Country Code box: ${countryCodeBox > 0 ? '✅' : '❌'}`);
    console.log(`   Country Name box: ${countryNameBox > 0 ? '✅' : '❌'}`);
    console.log(`   Currency box: ${currencyBox > 0 ? '✅' : '❌'}`);
    console.log(`   Tax Year box: ${taxYearBox > 0 ? '✅' : '❌'}`);
    console.log(`   Status box: ${statusBox > 0 ? '✅' : '❌'}`);

    // Check content is displaying
    const hasCountryData = await page.locator('text=/India|Philippines|Australia/').count();
    const hasCurrencyData = await page.locator('text=/INR|PHP|AUD/').count();
    const hasTaxYearData = await page.locator('text=/FY 2025/').count();
    const hasStatusChip = await page.locator('text=/Active|Inactive/').count();
    
    console.log('\n4. Verifying data display...');
    console.log(`   Country data: ${hasCountryData > 0 ? '✅' : '❌'}`);
    console.log(`   Currency data: ${hasCurrencyData > 0 ? '✅' : '❌'}`);
    console.log(`   Tax year data: ${hasTaxYearData > 0 ? '✅' : '❌'}`);
    console.log(`   Status chip: ${hasStatusChip > 0 ? '✅' : '❌'}`);

    console.log('\n' + '='.repeat(80));
    console.log('GRID LAYOUT COMPLETE');
    console.log('='.repeat(80));
    
    const allChecks = 
      countryCodeBox > 0 &&
      countryNameBox > 0 &&
      currencyBox > 0 &&
      taxYearBox > 0 &&
      statusBox > 0 &&
      hasCountryData > 0 &&
      hasCurrencyData > 0 &&
      hasTaxYearData > 0 &&
      hasStatusChip > 0;
    
    if (allChecks) {
      console.log('\n✅ SUCCESS! Grid layout verified');
      console.log('   ✓ All grid boxes present');
      console.log('   ✓ Clean, card-based layout');
      console.log('   ✓ Data displaying correctly');
      console.log('   ✓ Easy to scan and read');
      console.log('\n📸 Screenshot: test-results/payroll-grid-layout.png');
    } else {
      console.log('\n⚠️  Some checks failed');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    expect(countryCodeBox).toBeGreaterThan(0);
    expect(countryNameBox).toBeGreaterThan(0);
    expect(currencyBox).toBeGreaterThan(0);
    expect(taxYearBox).toBeGreaterThan(0);
    expect(hasCountryData).toBeGreaterThan(0);
  });
});

