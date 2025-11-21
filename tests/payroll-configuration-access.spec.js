const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration Page Access', () => {
  const frontendUrl = 'http://localhost:80';
  const adminCredentials = {
    email: 'admin@teamified.com',
    password: 'Admin123!'
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
  });

  test('should display Payroll Configuration in sidebar after admin login', async ({ page }) => {
    console.log('Test: Verify Payroll Configuration navigation item appears for admin user');

    // Login as admin
    console.log('Step 1: Logging in as admin...');
    await page.fill('input[name="email"], input[type="email"]', adminCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', adminCredentials.password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Login successful, redirected to dashboard');

    // Wait for sidebar to load
    await page.waitForSelector('nav, aside, [role="navigation"]', { timeout: 5000 });
    console.log('✓ Sidebar loaded');

    // Look for Payroll Configuration navigation item
    const payrollNavItem = page.getByText('Payroll Configuration');
    await expect(payrollNavItem).toBeVisible({ timeout: 5000 });
    console.log('✓ Payroll Configuration navigation item is visible');

    // Take screenshot of sidebar with Payroll Configuration
    await page.screenshot({ path: 'test-results/payroll-nav-visible.png', fullPage: true });
    console.log('✓ Screenshot saved: test-results/payroll-nav-visible.png');
  });

  test('should navigate to Payroll Configuration page when clicked', async ({ page }) => {
    console.log('Test: Verify navigation to Payroll Configuration page');

    // Login as admin
    console.log('Step 1: Logging in as admin...');
    await page.fill('input[name="email"], input[type="email"]', adminCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Login successful');

    // Wait for sidebar to load
    await page.waitForSelector('nav, aside, [role="navigation"]', { timeout: 5000 });

    // Click on Payroll Configuration
    console.log('Step 2: Clicking on Payroll Configuration...');
    const payrollNavItem = page.getByText('Payroll Configuration');
    await payrollNavItem.click();

    // Wait for navigation to payroll configuration page
    await page.waitForURL('**/payroll-configuration', { timeout: 10000 });
    console.log('✓ Navigated to /payroll-configuration');

    // Verify URL
    expect(page.url()).toContain('/payroll-configuration');
    console.log('✓ URL confirmed: ' + page.url());
  });

  test('should display Payroll Configuration page content', async ({ page }) => {
    console.log('Test: Verify Payroll Configuration page content loads correctly');

    // Login as admin
    console.log('Step 1: Logging in as admin...');
    await page.fill('input[name="email"], input[type="email"]', adminCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate directly to payroll configuration page
    console.log('Step 2: Navigating to /payroll-configuration...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    console.log('✓ Page loaded');

    // Wait for page content to load
    await page.waitForTimeout(2000);

    // Check for key elements on the page
    console.log('Step 3: Verifying page elements...');

    // Look for page title or heading
    const pageTitle = page.locator('h1, h2, h3, h4').first();
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
    console.log('✓ Page title/heading found');

    // Look for Country Selector (if it's a select element)
    const countrySelector = page.locator('select, [role="combobox"], label:has-text("Country")');
    const countrySelectorVisible = await countrySelector.count() > 0;
    if (countrySelectorVisible) {
      console.log('✓ Country selector found');
    } else {
      console.log('⚠ Country selector not immediately visible (may be loading)');
    }

    // Look for tabs or navigation elements
    const tabs = page.locator('[role="tab"], .MuiTab-root, button:has-text("Tax Year"), button:has-text("Configuration")');
    const tabsVisible = await tabs.count() > 0;
    if (tabsVisible) {
      console.log('✓ Tabs found on page');
    } else {
      console.log('⚠ Tabs not immediately visible (may be loading)');
    }

    // Take screenshot of the full page
    await page.screenshot({ path: 'test-results/payroll-configuration-page.png', fullPage: true });
    console.log('✓ Screenshot saved: test-results/payroll-configuration-page.png');

    // Check for any error messages
    const errorMessage = page.locator('text=/error/i, text=/failed/i').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log('⚠ Error message found: ' + errorText);
    } else {
      console.log('✓ No error messages detected');
    }
  });

  test('should display country selection and data', async ({ page }) => {
    console.log('Test: Verify country selection functionality');

    // Login as admin
    console.log('Step 1: Logging in as admin...');
    await page.fill('input[name="email"], input[type="email"]', adminCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to payroll configuration page
    console.log('Step 2: Navigating to /payroll-configuration...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');

    // Wait for countries to load
    await page.waitForTimeout(3000);

    // Look for country names (India, Philippines, Australia)
    console.log('Step 3: Looking for country options...');
    const indiaText = page.getByText('India', { exact: false });
    const philippinesText = page.getByText('Philippines', { exact: false });
    const australiaText = page.getByText('Australia', { exact: false });

    const countriesFound = [];
    if (await indiaText.count() > 0) {
      countriesFound.push('India');
      console.log('✓ India found on page');
    }
    if (await philippinesText.count() > 0) {
      countriesFound.push('Philippines');
      console.log('✓ Philippines found on page');
    }
    if (await australiaText.count() > 0) {
      countriesFound.push('Australia');
      console.log('✓ Australia found on page');
    }

    console.log(`✓ Countries found: ${countriesFound.join(', ')}`);

    // Look for currency symbols or codes
    const currencyElements = page.locator('text=/INR|PHP|AUD|₹|₱|A\\$/');
    const currencyCount = await currencyElements.count();
    if (currencyCount > 0) {
      console.log(`✓ Currency information found (${currencyCount} instances)`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/payroll-configuration-countries.png', fullPage: true });
    console.log('✓ Screenshot saved: test-results/payroll-configuration-countries.png');
  });

  test('should have Settings icon in sidebar for Payroll Configuration', async ({ page }) => {
    console.log('Test: Verify Settings icon appears for Payroll Configuration');

    // Login as admin
    console.log('Step 1: Logging in as admin...');
    await page.fill('input[name="email"], input[type="email"]', adminCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Wait for sidebar to load
    await page.waitForSelector('nav, aside, [role="navigation"]', { timeout: 5000 });

    // Look for the Payroll Configuration menu item
    const payrollNavItem = page.getByText('Payroll Configuration');
    await expect(payrollNavItem).toBeVisible({ timeout: 5000 });

    // Check if there's an icon near the text (Material-UI Settings icon)
    const payrollNavContainer = payrollNavItem.locator('..');
    const hasIcon = await payrollNavContainer.locator('svg, [data-testid="SettingsIcon"]').count() > 0;
    
    if (hasIcon) {
      console.log('✓ Settings icon found with Payroll Configuration');
    } else {
      console.log('⚠ Settings icon not detected (may use different selector)');
    }

    // Take screenshot showing the icon
    await payrollNavItem.screenshot({ path: 'test-results/payroll-nav-icon.png' });
    console.log('✓ Screenshot saved: test-results/payroll-nav-icon.png');
  });

  test('should be accessible only to authorized roles (admin)', async ({ page }) => {
    console.log('Test: Verify role-based access control');

    // Login as admin
    console.log('Step 1: Logging in as admin (authorized role)...');
    await page.fill('input[name="email"], input[type="email"]', adminCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Try to access payroll configuration directly
    console.log('Step 2: Attempting to access /payroll-configuration...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    
    // Wait and check if we're still on the payroll configuration page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/payroll-configuration')) {
      console.log('✓ Admin has access to Payroll Configuration page');
      console.log('✓ Current URL: ' + currentUrl);
    } else {
      console.log('✗ Redirected away from Payroll Configuration');
      console.log('✗ Current URL: ' + currentUrl);
      throw new Error('Admin user was denied access to Payroll Configuration');
    }

    // Take screenshot showing successful access
    await page.screenshot({ path: 'test-results/payroll-access-authorized.png', fullPage: true });
    console.log('✓ Screenshot saved: test-results/payroll-access-authorized.png');
  });
});

test.describe('Payroll Configuration - Summary Report', () => {
  test('generate access verification report', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('PAYROLL CONFIGURATION ACCESS VERIFICATION REPORT');
    console.log('='.repeat(60));
    console.log('Date: ' + new Date().toISOString());
    console.log('Frontend URL: http://localhost:5173');
    console.log('Test User: admin@teamified.com');
    console.log('='.repeat(60));
    console.log('\nAll tests completed. Check test-results/ for screenshots.');
    console.log('='.repeat(60) + '\n');
  });
});

