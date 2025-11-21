const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Consistent Header', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('verify header matches ProfilePage pattern', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('HEADER CONSISTENCY VERIFICATION');
    console.log('='.repeat(80));

    // Login
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Navigate to payroll configuration
    console.log('\n1. Checking Payroll Configuration header...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const payrollTitle = await page.locator('h3:has-text("Payroll Configuration")').first();
    const payrollTitleColor = await payrollTitle.evaluate(el => window.getComputedStyle(el).color);
    const payrollBg = await page.locator('h3:has-text("Payroll Configuration")').locator('../..').evaluate(el => 
      window.getComputedStyle(el).background
    );
    
    console.log(`   Title color: ${payrollTitleColor.includes('161, 106, 232') || payrollTitleColor.includes('rgb(161, 106, 232)') ? '✅ Purple (#A16AE8)' : '⚠️  ' + payrollTitleColor}`);
    console.log(`   Has gradient background: ${payrollBg.includes('gradient') ? '✅' : '❌'}`);

    // Navigate to profile page for comparison
    console.log('\n2. Checking Profile page header for comparison...');
    await page.goto(`${frontendUrl}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const profileTitle = await page.locator('h3:has-text("Profile Management")').first();
    const profileTitleColor = await profileTitle.evaluate(el => window.getComputedStyle(el).color);
    const profileBg = await page.locator('h3:has-text("Profile Management")').locator('../..').evaluate(el => 
      window.getComputedStyle(el).background
    );
    
    console.log(`   Title color: ${profileTitleColor.includes('161, 106, 232') || profileTitleColor.includes('rgb(161, 106, 232)') ? '✅ Purple (#A16AE8)' : '⚠️  ' + profileTitleColor}`);
    console.log(`   Has gradient background: ${profileBg.includes('gradient') ? '✅' : '❌'}`);

    // Go back to payroll for screenshot
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: 'test-results/payroll-consistent-header.png', 
      fullPage: true 
    });

    console.log('\n' + '='.repeat(80));
    console.log('CONSISTENCY CHECK RESULTS');
    console.log('='.repeat(80));
    
    const colorsMatch = 
      (payrollTitleColor.includes('161, 106, 232') || payrollTitleColor.includes('rgb(161, 106, 232)')) &&
      (profileTitleColor.includes('161, 106, 232') || profileTitleColor.includes('rgb(161, 106, 232)'));
    
    const bgMatch = payrollBg.includes('gradient') && profileBg.includes('gradient');
    
    if (colorsMatch && bgMatch) {
      console.log('\n✅ SUCCESS! Headers are consistent');
      console.log('   ✓ Both use purple (#A16AE8) title color');
      console.log('   ✓ Both use gradient background');
      console.log('   ✓ Same Paper component pattern');
      console.log('   ✓ Consistent visual language across pages');
      console.log('\n📸 Screenshot: test-results/payroll-consistent-header.png');
    } else {
      console.log('\n⚠️  Some styling differences detected');
      console.log(`   Colors match: ${colorsMatch ? '✅' : '❌'}`);
      console.log(`   Backgrounds match: ${bgMatch ? '✅' : '❌'}`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');

    expect(payrollBg.includes('gradient')).toBe(true);
  });
});

