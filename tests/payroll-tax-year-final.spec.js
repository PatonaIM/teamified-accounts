const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Tax Year Final Verification', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('verify tax year loads successfully', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('TAX YEAR - FINAL VERIFICATION');
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
    await page.waitForTimeout(3000);
    console.log('✓ Page loaded');

    // Check for error messages
    console.log('\n3. Checking for error messages...');
    const failedToLoadError = await page.locator('text=/Failed to load.*tax year/i').count();
    console.log(`   "Failed to load" error: ${failedToLoadError === 0 ? '✅ Not present' : '❌ ERROR PRESENT'}`);

    // Check for tax year display
    console.log('\n4. Checking tax year display...');
    const taxYearLabel = await page.locator('text=/Current Tax Year/i').count();
    const fyText = await page.locator('text=/FY 2025/i').count();
    const dateText = await page.locator('text=/2025/').count();
    
    console.log(`   Tax Year label: ${taxYearLabel > 0 ? '✅' : '❌'}`);
    console.log(`   FY 2025 text: ${fyText > 0 ? '✅' : '❌'}`);
    console.log(`   Date displayed: ${dateText > 0 ? '✅' : '❌'}`);

    // Get full page text to check content
    const pageContent = await page.textContent('body');
    const hasNoTaxYear = pageContent.includes('No tax year configured');
    
    console.log(`   "No tax year configured": ${hasNoTaxYear ? '❌ PRESENT (Bad)' : '✅ Not present (Good)'}`);

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-tax-year-final.png', 
      fullPage: true 
    });

    console.log('\n' + '='.repeat(80));
    console.log('FINAL RESULTS');
    console.log('='.repeat(80));
    
    if (failedToLoadError === 0 && taxYearLabel > 0 && fyText > 0 && !hasNoTaxYear) {
      console.log('\n✅ SUCCESS! Tax year loads without errors');
      console.log('   ✓ No "Failed to load" error message');
      console.log('   ✓ "Current Tax Year" label present');
      console.log('   ✓ "FY 2025" displayed');
      console.log('   ✓ Tax year data showing');
      console.log('\n📸 Screenshot saved: test-results/payroll-tax-year-final.png');
    } else {
      console.log('\n❌ ISSUES DETECTED:');
      if (failedToLoadError > 0) console.log('   - "Failed to load" error is still showing');
      if (taxYearLabel === 0) console.log('   - Tax Year label not found');
      if (fyText === 0) console.log('   - FY 2025 text not found');
      if (hasNoTaxYear) console.log('   - "No tax year configured" message present');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    expect(failedToLoadError).toBe(0);
    expect(taxYearLabel).toBeGreaterThan(0);
    expect(fyText).toBeGreaterThan(0);
    expect(hasNoTaxYear).toBe(false);
  });
});

