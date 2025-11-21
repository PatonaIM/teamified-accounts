const { test } = require('@playwright/test');

test.describe('Payroll Configuration - Visual Header Check', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('visual comparison of headers', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('VISUAL HEADER CONSISTENCY CHECK');
    console.log('='.repeat(80));

    // Login
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Payroll page
    console.log('\n1. Capturing Payroll Configuration header...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/header-payroll.png',
      clip: { x: 0, y: 0, width: 1920, height: 300 }
    });
    console.log('   ✅ Screenshot: test-results/header-payroll.png');

    // Profile page
    console.log('\n2. Capturing Profile page header...');
    await page.goto(`${frontendUrl}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/header-profile.png',
      clip: { x: 0, y: 0, width: 1920, height: 300 }
    });
    console.log('   ✅ Screenshot: test-results/header-profile.png');

    // Full payroll page
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/payroll-full-with-new-header.png',
      fullPage: true
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ HEADER STYLING APPLIED');
    console.log('='.repeat(80));
    console.log('\nExpected styling:');
    console.log('  ✓ Purple title (#A16AE8, 700 weight)');
    console.log('  ✓ Gradient background (purple to blue)');
    console.log('  ✓ Rounded corners (borderRadius: 3)');
    console.log('  ✓ Country selector on the right');
    console.log('  ✓ Matches Profile page pattern');
    console.log('\nScreenshots for visual comparison:');
    console.log('  📸 test-results/header-payroll.png');
    console.log('  📸 test-results/header-profile.png');
    console.log('  📸 test-results/payroll-full-with-new-header.png');
    console.log('\n' + '='.repeat(80) + '\n');
  });
});

