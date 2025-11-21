const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Login and Access Test', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('login and verify payroll access', async ({ page }) => {
    console.log('\n' + '='.repeat(70));
    console.log('PAYROLL CONFIGURATION - COMPLETE ACCESS TEST');
    console.log('='.repeat(70));

    // Collect console logs
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('useAuth') || text.includes('authService') || text.includes('useRoleBasedNavigation') || text.includes('roles')) {
        console.log(`[BROWSER] ${text}`);
      }
    });

    // Step 1: Go to login page
    console.log('\n1. Navigating to login page...');
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    console.log('✓ Login page loaded');

    // Step 2: Fill in credentials
    console.log('\n2. Entering credentials...');
    console.log(`   Email: ${credentials.email}`);
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    console.log('✓ Credentials entered');

    // Take screenshot before login
    await page.screenshot({ path: 'test-results/payroll-before-login.png', fullPage: true });
    console.log('✓ Screenshot saved: test-results/payroll-before-login.png');

    // Step 3: Click login button
    console.log('\n3. Clicking login button...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation with longer timeout
    console.log('   Waiting for redirect...');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`✓ Current URL after login: ${currentUrl}`);

    // Take screenshot after login
    await page.screenshot({ path: 'test-results/payroll-after-login.png', fullPage: true });
    console.log('✓ Screenshot saved: test-results/payroll-after-login.png');

    // Step 4: Check if we're logged in (not on login page)
    if (currentUrl.includes('/login')) {
      console.log('⚠ Still on login page - checking for errors...');
      
      // Check for error messages
      const errorMsg = await page.locator('text=/error|invalid|incorrect/i').first().textContent().catch(() => 'No error message found');
      console.log(`   Error message: ${errorMsg}`);
      
      // Check localStorage for token
      const hasToken = await page.evaluate(() => {
        return localStorage.getItem('token') || localStorage.getItem('accessToken');
      });
      console.log(`   Has token in localStorage: ${!!hasToken}`);
      
      throw new Error('Login failed - still on login page');
    }

    console.log('✓ Login successful - redirected away from login page');

    // Step 5: Wait for navigation to settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 6: Check for sidebar/navigation
    console.log('\n4. Checking for navigation sidebar...');
    const hasSidebar = await page.locator('nav, aside, [role="navigation"]').count() > 0;
    console.log(`✓ Sidebar present: ${hasSidebar}`);

    if (hasSidebar) {
      // Get all navigation items
      const navItems = await page.locator('nav a, aside a, [role="navigation"] a, nav button, aside button').allTextContents();
      console.log('\n5. Navigation items found:');
      navItems.forEach((item, index) => {
        if (item.trim()) {
          console.log(`   ${index + 1}. ${item.trim()}`);
        }
      });

      // Check specifically for "Payroll Configuration"
      const hasPayrollNav = navItems.some(item => item.toLowerCase().includes('payroll'));
      console.log(`\n✓ Payroll Configuration in navigation: ${hasPayrollNav ? 'YES ✅' : 'NO ❌'}`);
      
      if (!hasPayrollNav) {
        console.log('\n⚠ WARNING: Payroll Configuration NOT found in navigation!');
        console.log('   This could mean:');
        console.log('   1. User roles not loaded correctly');
        console.log('   2. Navigation filtering issue');
        console.log('   3. User does not have admin/hr/account_manager role');
      }
    }

    // Step 7: Check user data in browser
    console.log('\n6. Checking user data in browser...');
    const userData = await page.evaluate(() => {
      // Try to get user data from various possible locations
      const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            hasToken: true,
            tokenKey: 'teamified_access_token',
            email: payload.email,
            roles: payload.roles,
            sub: payload.sub
          };
        } catch (e) {
          return { hasToken: true, parseError: e.message };
        }
      }
      
      return { hasToken: false, checked: ['teamified_access_token', 'token', 'accessToken'] };
    });
    
    console.log('   User data from token:');
    console.log(JSON.stringify(userData, null, 2));

    // Step 8: Try to navigate to payroll configuration
    console.log('\n7. Attempting to navigate to /payroll-configuration...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    console.log(`✓ Final URL: ${finalUrl}`);

    // Take screenshot of payroll page attempt
    await page.screenshot({ path: 'test-results/payroll-page-attempt.png', fullPage: true });
    console.log('✓ Screenshot saved: test-results/payroll-page-attempt.png');

    // Check if we're on the payroll configuration page
    if (finalUrl.includes('/payroll-configuration')) {
      console.log('\n✅ SUCCESS: Payroll Configuration page accessible!');
      
      // Look for page content
      const pageContent = await page.textContent('body');
      if (pageContent.includes('Country') || pageContent.includes('Currency') || pageContent.includes('Payroll')) {
        console.log('✅ Page content appears to be loading');
      }
    } else {
      console.log(`\n❌ FAILURE: Redirected to ${finalUrl}`);
      console.log('   User may not have proper role access');
    }

    console.log('\n' + '='.repeat(70));
    console.log('TEST COMPLETE - Check screenshots in test-results/');
    console.log('='.repeat(70) + '\n');
  });
});

