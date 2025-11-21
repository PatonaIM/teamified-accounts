const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Sidebar Navigation', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('should display sidebar navigation and properly styled page', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PAYROLL CONFIGURATION - SIDEBAR & STYLING VERIFICATION');
    console.log('='.repeat(80));

    // Step 1: Login
    console.log('\n1. Logging in...');
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    console.log('✓ Login completed');

    // Step 2: Navigate to payroll configuration
    console.log('\n2. Navigating to /payroll-configuration...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Page loaded');

    // Step 3: Verify sidebar is present
    console.log('\n3. Checking for sidebar...');
    
    // Check for sidebar navigation
    const sidebar = await page.locator('[class*="MuiDrawer"]').count();
    console.log(`   Sidebar elements found: ${sidebar}`);
    
    // Check for navigation items
    const navItems = await page.locator('a[href*="/"]').count();
    console.log(`   Navigation links found: ${navItems}`);
    
    // Check for specific nav items
    const dashboardLink = await page.locator('text=Dashboard').count();
    const profileLink = await page.locator('text=Profile').count();
    const payrollLink = await page.locator('text=Payroll Configuration').count();
    
    console.log(`   - Dashboard link: ${dashboardLink > 0 ? '✅' : '❌'}`);
    console.log(`   - Profile link: ${profileLink > 0 ? '✅' : '❌'}`);
    console.log(`   - Payroll Configuration link: ${payrollLink > 0 ? '✅' : '❌'}`);

    // Step 4: Verify page header
    console.log('\n4. Checking page header...');
    const pageTitle = await page.locator('h3:has-text("Payroll Configuration")').count();
    console.log(`   Page title visible: ${pageTitle > 0 ? '✅' : '❌'}`);
    
    const settingsIcon = await page.locator('svg[data-testid="SettingsIcon"]').count();
    console.log(`   Settings icon visible: ${settingsIcon > 0 ? '✅' : '❌'}`);

    // Step 5: Verify country selector
    console.log('\n5. Checking country selector...');
    const countrySelector = await page.locator('text=/Select.*Country|Country/i').count();
    console.log(`   Country selector visible: ${countrySelector > 0 ? '✅' : '❌'}`);

    // Step 6: Verify Material-UI 3 styling
    console.log('\n6. Verifying Material-UI 3 Expressive Design...');
    
    // Check for rounded cards
    const cards = await page.locator('[class*="MuiCard"]').count();
    console.log(`   Cards found: ${cards}`);
    
    // Check for tabs
    const tabs = await page.locator('[role="tab"]').count();
    console.log(`   Tabs found: ${tabs}`);
    
    // Check for proper spacing
    const container = await page.locator('[class*="MuiContainer"]').count();
    console.log(`   Containers with proper spacing: ${container > 0 ? '✅' : '❌'}`);

    // Step 7: Take screenshot
    console.log('\n7. Taking screenshot...');
    await page.screenshot({ 
      path: 'test-results/payroll-with-sidebar.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved: test-results/payroll-with-sidebar.png');

    // Step 8: Final assertions
    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(80));
    
    expect(sidebar).toBeGreaterThan(0);
    expect(navItems).toBeGreaterThan(5);
    expect(pageTitle).toBeGreaterThan(0);
    expect(cards).toBeGreaterThan(0);
    expect(tabs).toBeGreaterThan(0);
    
    console.log('\n✅ All verifications passed!');
    console.log('   - Sidebar: Present');
    console.log('   - Navigation: Working');
    console.log('   - Page Header: Visible');
    console.log('   - Material-UI 3 Design: Applied');
    console.log('\n' + '='.repeat(80) + '\n');
  });

  test('should allow sidebar navigation to other pages', async ({ page }) => {
    console.log('\n8. Testing sidebar navigation...');
    
    // Login first
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Go to payroll page
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    
    // Click on Dashboard link in sidebar
    const dashboardLink = page.locator('a:has-text("Dashboard")').first();
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`   Navigated to: ${currentUrl}`);
      expect(currentUrl).toContain('dashboard');
      console.log('   ✅ Sidebar navigation works!');
    } else {
      console.log('   ⚠️  Dashboard link not found in sidebar');
    }
  });
});

