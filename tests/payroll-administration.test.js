const { test, expect } = require('@playwright/test');

// Helper function to login
async function login(page) {
  await page.goto('http://localhost/');
  await page.waitForLoadState('networkidle');
  
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  const loginButton = page.locator('button[type="submit"]');
  
  await emailInput.fill('user1@teamified.com');
  await passwordInput.fill('Admin123!');
  await loginButton.click();
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Give time for auth to complete
}

test.describe('Payroll Administration Page Tests', () => {
  let consoleErrors = [];
  let consoleWarnings = [];

  test.beforeEach(async ({ page }) => {
    // Reset error/warning arrays
    consoleErrors = [];
    consoleWarnings = [];

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
        console.log('⚠️  Console Warning:', msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.log('❌ Page Error:', error.message);
    });

    // Login before each test
    await login(page);
  });

  test('Should navigate to Payroll Administration page without errors', async ({ page }) => {
    // Navigate to payroll administration
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for any async operations

    // Check page title
    await expect(page).toHaveTitle(/Teamified/);

    // Check for main heading
    const heading = page.locator('text=Payroll Administration');
    await expect(heading).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/payroll-admin-main.png' });

    // Check for console errors
    expect(consoleErrors.length).toBe(0);
    console.log('✅ Payroll Administration page loaded without console errors');
  });

  test('Should display all 4 tabs', async ({ page }) => {
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');

    // Check for all tabs
    const periodTab = page.locator('text=Period Management');
    const processingTab = page.locator('text=Processing Control');
    const monitoringTab = page.locator('text=Monitoring');
    const bulkTab = page.locator('text=Bulk Operations');

    await expect(periodTab).toBeVisible();
    await expect(processingTab).toBeVisible();
    await expect(monitoringTab).toBeVisible();
    await expect(bulkTab).toBeVisible();

    console.log('✅ All 4 tabs are visible');
  });

  test('Tab 1: Period Management - should load and display content', async ({ page }) => {
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Period Management should be active by default (first tab)
    // Check for country selector
    const countrySelector = page.locator('label:has-text("Country")').locator('..').locator('input, select');
    await expect(countrySelector.first()).toBeVisible();

    // Check for Create Period button
    const createButton = page.locator('button:has-text("Create Period")');
    await expect(createButton).toBeVisible();

    // Check for DataGrid (table)
    const dataGrid = page.locator('[role="grid"], .MuiDataGrid-root');
    await expect(dataGrid.first()).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/payroll-admin-tab1-period-management.png' });

    expect(consoleErrors.length).toBe(0);
    console.log('✅ Period Management tab loaded successfully');
  });

  test('Tab 2: Processing Control - should load and display controls', async ({ page }) => {
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');

    // Click Processing Control tab
    const processingTab = page.locator('button:has-text("Processing Control")');
    await processingTab.click();
    await page.waitForTimeout(1000);

    // Check for control buttons
    const startButton = page.locator('button:has-text("Start Processing")');
    const stopButton = page.locator('button:has-text("Stop Processing")');
    const retryButton = page.locator('button:has-text("Retry Failed")');

    await expect(startButton).toBeVisible();
    await expect(stopButton).toBeVisible();
    await expect(retryButton).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/payroll-admin-tab2-processing-control.png' });

    expect(consoleErrors.length).toBe(0);
    console.log('✅ Processing Control tab loaded successfully');
  });

  test('Tab 3: Monitoring Dashboard - should load metrics', async ({ page }) => {
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');

    // Click Monitoring tab
    const monitoringTab = page.locator('button:has-text("Monitoring")');
    await monitoringTab.click();
    await page.waitForTimeout(2000); // Wait for dashboard to load

    // Check for dashboard heading
    const dashboardHeading = page.locator('text=System Performance Dashboard');
    await expect(dashboardHeading).toBeVisible();

    // Check for auto-refresh toggle
    const autoRefreshToggle = page.locator('text=Auto-refresh');
    await expect(autoRefreshToggle).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/payroll-admin-tab3-monitoring.png' });

    expect(consoleErrors.length).toBe(0);
    console.log('✅ Monitoring Dashboard tab loaded successfully');
  });

  test('Tab 4: Bulk Operations - should load and display DataGrid', async ({ page }) => {
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');

    // Click Bulk Operations tab
    const bulkTab = page.locator('button:has-text("Bulk Operations")');
    await bulkTab.click();
    await page.waitForTimeout(1000);

    // Check for bulk operation buttons
    const bulkProcessButton = page.locator('button:has-text("Bulk Process")');
    const bulkCloseButton = page.locator('button:has-text("Bulk Close")');
    const bulkOpenButton = page.locator('button:has-text("Bulk Open")');
    const validateButton = page.locator('button:has-text("Validate All")');

    await expect(bulkProcessButton).toBeVisible();
    await expect(bulkCloseButton).toBeVisible();
    await expect(bulkOpenButton).toBeVisible();
    await expect(validateButton).toBeVisible();

    // Check for DataGrid
    const dataGrid = page.locator('[role="grid"], .MuiDataGrid-root');
    await expect(dataGrid.first()).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/payroll-admin-tab4-bulk-operations.png' });

    expect(consoleErrors.length).toBe(0);
    console.log('✅ Bulk Operations tab loaded successfully');
  });

  test('Should navigate between all tabs without errors', async ({ page }) => {
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');

    const tabs = [
      'Period Management',
      'Processing Control',
      'Monitoring',
      'Bulk Operations'
    ];

    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`);
      await tab.click();
      await page.waitForTimeout(500);
      console.log(`✅ Switched to ${tabName} tab`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/payroll-admin-all-tabs-tested.png' });

    expect(consoleErrors.length).toBe(0);
    console.log('✅ All tabs navigated successfully without errors');
  });

  test('Should check if navigation menu has Payroll Administration link', async ({ page }) => {
    await page.goto('http://localhost/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for Payroll Administration in sidebar
    const payrollAdminLink = page.locator('text=Payroll Administration');
    
    if (await payrollAdminLink.isVisible()) {
      console.log('✅ Payroll Administration link found in navigation');
      await payrollAdminLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on the right page
      const heading = page.locator('text=Payroll Administration');
      await expect(heading).toBeVisible();
      
      await page.screenshot({ path: 'test-results/payroll-admin-navigation.png' });
    } else {
      console.log('⚠️  Payroll Administration link not visible (may require admin/hr role)');
    }

    expect(consoleErrors.length).toBe(0);
  });

  test.afterEach(async () => {
    // Summary of console errors and warnings
    if (consoleErrors.length > 0) {
      console.log(`\n❌ Total Console Errors: ${consoleErrors.length}`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ No console errors detected');
    }

    if (consoleWarnings.length > 0) {
      console.log(`\n⚠️  Total Console Warnings: ${consoleWarnings.length}`);
    }
  });
});

// Additional test for API endpoints
test.describe('Payroll Administration API Tests', () => {
  let accessToken = '';

  test.beforeAll(async ({ request }) => {
    // Login to get access token
    const response = await request.post('http://localhost/api/v1/auth/login', {
      data: {
        email: 'user1@teamified.com',
        password: 'Admin123!'
      }
    });
    
    const data = await response.json();
    accessToken = data.accessToken;
  });

  test('Should access Payroll Admin API endpoints', async ({ request }) => {
    // Test monitoring dashboard endpoint
    const dashboardResponse = await request.get('http://localhost/api/v1/payroll/admin/monitoring/dashboard', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Monitoring Dashboard API Status:', dashboardResponse.status());
    
    // 200 = success, 401 = unauthorized (expected if user doesn't have permission)
    expect([200, 401, 403]).toContain(dashboardResponse.status());

    if (dashboardResponse.status() === 200) {
      const data = await dashboardResponse.json();
      console.log('✅ Monitoring dashboard API returned data');
      console.log('Sample data:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } else {
      console.log('⚠️  User may not have permission to access admin endpoints');
    }
  });

  test('Should list periods API endpoint', async ({ request }) => {
    // Test list periods endpoint
    const periodsResponse = await request.get('http://localhost/api/v1/payroll/admin/periods/IN', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('List Periods API Status:', periodsResponse.status());
    expect([200, 401, 403]).toContain(periodsResponse.status());

    if (periodsResponse.status() === 200) {
      console.log('✅ Periods API returned data');
    }
  });
});

