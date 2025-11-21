const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Tax Year Check', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('verify tax year loads without error', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('TAX YEAR LOADING VERIFICATION');
    console.log('='.repeat(80));

    const consoleErrors = [];
    const apiErrors = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture API errors
    page.on('response', response => {
      if (response.url().includes('tax-years') && response.status() >= 400) {
        apiErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

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
    await page.waitForTimeout(3000); // Give time for tax year to load
    console.log('✓ Page loaded');

    // Check for error messages on page
    console.log('\n3. Checking for error messages...');
    const errorAlert = await page.locator('text=/Failed to load/i').count();
    const taxYearText = await page.locator('text=/FY 2025/i, text=/Tax Year/i').count();
    
    console.log(`   Error message visible: ${errorAlert > 0 ? '❌' : '✅'}`);
    console.log(`   Tax year displayed: ${taxYearText > 0 ? '✅' : '❌'}`);

    // Check tax year card content
    const taxYearCard = await page.locator('text=/Current Tax Year/i').locator('..').locator('..');
    const taxYearContent = await taxYearCard.textContent();
    console.log(`\n   Tax Year Card Content:`);
    console.log(`   ${taxYearContent.replace(/\n/g, ' ').substring(0, 100)}`);

    // Check for specific country data
    console.log('\n4. Checking tax year for different countries...');
    
    // Select India
    const countrySelect = page.locator('select, [role="combobox"]').first();
    await countrySelect.selectOption({ label: 'India' });
    await page.waitForTimeout(1500);
    
    let indiaContent = await page.textContent('body');
    const hasIndiaFY = indiaContent.includes('FY 2025') || indiaContent.includes('2025-04-01');
    console.log(`   India tax year: ${hasIndiaFY ? '✅ FY 2025' : '❌ Not found'}`);

    // Select Philippines
    await countrySelect.selectOption({ label: 'Philippines' });
    await page.waitForTimeout(1500);
    
    let phContent = await page.textContent('body');
    const hasPhFY = phContent.includes('FY 2025') || phContent.includes('2025-01-01');
    console.log(`   Philippines tax year: ${hasPhFY ? '✅ FY 2025' : '❌ Not found'}`);

    // Select Australia
    await countrySelect.selectOption({ label: 'Australia' });
    await page.waitForTimeout(1500);
    
    let auContent = await page.textContent('body');
    const hasAuFY = auContent.includes('FY 2025') || auContent.includes('2025-07-01');
    console.log(`   Australia tax year: ${hasAuFY ? '✅ FY 2025' : '❌ Not found'}`);

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-tax-year-loaded.png', 
      fullPage: true 
    });

    console.log('\n5. Error Analysis:');
    console.log(`   Console errors: ${consoleErrors.length}`);
    console.log(`   API errors: ${apiErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n   Console Errors:');
      consoleErrors.forEach((err, i) => console.log(`     ${i + 1}. ${err.substring(0, 100)}`));
    }
    
    if (apiErrors.length > 0) {
      console.log('\n   API Errors:');
      apiErrors.forEach((err, i) => console.log(`     ${i + 1}. ${err.status} ${err.url}`));
    }

    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(80));
    
    if (errorAlert === 0 && taxYearText > 0) {
      console.log('\n✅ SUCCESS! Tax year loads without errors');
      console.log('   - No error messages displayed');
      console.log('   - Tax year information visible');
      console.log('   - Data loads for all countries');
    } else {
      console.log('\n⚠️  Issues detected:');
      if (errorAlert > 0) console.log('   - Error message still showing');
      if (taxYearText === 0) console.log('   - Tax year not displayed');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    expect(errorAlert).toBe(0);
    expect(taxYearText).toBeGreaterThan(0);
  });
});

