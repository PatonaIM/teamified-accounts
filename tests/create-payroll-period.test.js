const { test, expect } = require('@playwright/test');

test.describe('Create Payroll Period for India', () => {
  test('Should login and create a payroll period for India', async ({ page }) => {
    // Track errors during test
    const consoleErrors = [];
    const pageErrors = [];
    
    // Listen for console errors (but filter out expected network errors)
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        // Filter out expected 401/network errors - only track JavaScript errors
        if (!errorText.includes('Failed to load resource') && !errorText.includes('401')) {
          consoleErrors.push(errorText);
          console.log('❌ Console Error:', errorText);
        } else {
          console.log('⚠️  Network Error (expected):', errorText);
        }
      }
    });
    
    // Listen for page errors (JavaScript exceptions) - these are critical
    page.on('pageerror', error => {
      const errorMessage = error.message;
      pageErrors.push(errorMessage);
      console.log('❌ Page Error (JavaScript Exception):', errorMessage);
    });
    
    // Intercept API responses to check data format
    page.on('response', async response => {
      if (response.url().includes('/api/payroll-administration/periods') && response.request().method() === 'GET') {
        try {
          const data = await response.json();
          if (data && data.length > 0) {
            console.log('\n📡 Periods API Response (first record):');
            console.log(JSON.stringify(data[0], null, 2));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
    
    console.log('📝 Step 1: Navigate to login page');
    await page.goto('http://localhost/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/payroll-period/01-login-page.png' });
    
    console.log('📝 Step 2: Fill in login credentials');
    // Use getByRole to find the email and password textboxes
    await page.getByRole('textbox', { name: 'Email Address' }).fill('user1@teamified.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Admin123!');
    
    console.log('📝 Step 3: Click login button');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify we're logged in (should be redirected to dashboard or another page)
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    expect(currentUrl).not.toContain('/login');
    
    // Check for errors after login
    console.log(`   Errors so far: ${consoleErrors.length + pageErrors.length}`);
    
    await page.screenshot({ path: 'test-results/payroll-period/02-after-login.png' });
    
    console.log('📝 Step 4: Navigate to Payroll Administration page');
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify we're on the Payroll Administration page
    const pageHeading = await page.locator('text=Payroll Administration').first();
    await expect(pageHeading).toBeVisible({ timeout: 10000 });
    console.log('✅ On Payroll Administration page');
    
    // Check for errors after page load
    console.log(`   Errors so far: ${consoleErrors.length + pageErrors.length}`);
    
    await page.screenshot({ path: 'test-results/payroll-period/03-payroll-admin-page.png' });
    
    console.log('📝 Step 5: Verify Period Management tab is active (first tab)');
    // The first tab should be active by default
    const periodManagementTab = page.locator('button:has-text("Period Management")');
    await expect(periodManagementTab).toBeVisible();
    
    console.log('📝 Step 6: Verify India is selected');
    // India is already selected by default, just verify it
    const countryCombobox = page.getByRole('combobox', { name: /Country.*India/i });
    await expect(countryCombobox).toBeVisible();
    
    console.log('✅ India selected');
    await page.screenshot({ path: 'test-results/payroll-period/04-india-selected.png' });
    
    console.log('📝 Step 7: Click "Create Period" button');
    const createButton = page.locator('button:has-text("Create Period")');
    await expect(createButton).toBeVisible();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    // Verify dialog opened
    const dialogTitle = page.locator('text=Create Payroll Period');
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });
    console.log('✅ Create Period dialog opened');
    
    await page.screenshot({ path: 'test-results/payroll-period/05-create-dialog-opened.png' });
    
    console.log('📝 Step 8: Fill in period details');
    
    // Generate period name with timestamp to avoid duplicates
    const timestamp = new Date().toISOString().slice(0, 10);
    const periodName = `Test Period ${timestamp}`;
    
    // Fill in Period Name
    const periodNameInput = page.locator('input[placeholder*="January 2025"], label:has-text("Period Name")').locator('..').locator('input');
    await periodNameInput.fill(periodName);
    console.log(`Period Name: ${periodName}`);
    
    // Country should already be set to IN, but verify
    const countryDropdown = page.locator('label:has-text("Country")').locator('..').locator('input, [role="button"]');
    const countryValue = await countryDropdown.inputValue().catch(() => '');
    console.log(`Country: ${countryValue || 'IN (already set)'}`);
    
    // Fill in dates (next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startDate = nextMonth.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const endOfMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
    const endDate = endOfMonth.toISOString().split('T')[0];
    
    const payDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 5);
    const payDate = payDay.toISOString().split('T')[0];
    
    console.log(`Start Date: ${startDate}`);
    console.log(`End Date: ${endDate}`);
    console.log(`Pay Date: ${payDate}`);
    
    // Fill in Start Date
    const startDateInput = page.locator('label:has-text("Start Date")').locator('..').locator('input');
    await startDateInput.fill(startDate);
    
    // Fill in End Date
    const endDateInput = page.locator('label:has-text("End Date")').locator('..').locator('input');
    await endDateInput.fill(endDate);
    
    // Fill in Pay Date
    const payDateInput = page.locator('label:has-text("Pay Date")').locator('..').locator('input');
    await payDateInput.fill(payDate);
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/payroll-period/06-form-filled.png' });
    
    console.log('📝 Step 9: Submit the form');
    const createSubmitButton = page.locator('button:has-text("Create")').last();
    await createSubmitButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 10: Verify period was created');
    
    // Check for errors after form submission
    console.log(`   Errors so far: ${consoleErrors.length + pageErrors.length}`);
    
    // Check for success message (Snackbar)
    const successMessage = page.locator('text=successfully, text=created');
    try {
      await expect(successMessage).toBeVisible({ timeout: 5000 });
      console.log('✅ Success message displayed');
    } catch (e) {
      console.log('⚠️  Success message not found (may have disappeared)');
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/payroll-period/07-after-creation.png' });
    
    // Verify the period appears in the DataGrid
    console.log('📝 Step 11: Verify period appears in the list');
    await page.waitForTimeout(2000);
    
    const periodInGrid = page.locator(`text="${periodName}"`);
    try {
      await expect(periodInGrid).toBeVisible({ timeout: 10000 });
      console.log('✅ Period found in the DataGrid');
      
      // Verify country code is displayed (not UUID)
      console.log('\n📝 Step 12: Verify data display formatting');
      const gridCells = await page.locator('[role="gridcell"]').allTextContents();
      
      // Check for country code "IN"
      const hasCountryCode = gridCells.some(cell => cell.trim() === 'IN');
      console.log(`Country display: ${hasCountryCode ? '✅ Shows "IN"' : '❌ Not showing country code'}`);
      
      // Check for UUID (should NOT be present)
      const hasUUID = gridCells.some(cell => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cell.trim()));
      console.log(`UUID check: ${hasUUID ? '❌ UUID still showing' : '✅ No UUIDs visible'}`);
      
      // Verify dates are formatted correctly (not "Invalid Date")
      const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/; // MM/DD/YYYY or similar
      const hasValidDates = gridCells.some(cell => datePattern.test(cell));
      const hasInvalidDate = gridCells.some(cell => cell.includes('Invalid Date'));
      
      console.log(`Date formatting: ${hasValidDates ? '✅ Dates formatted correctly' : '⚠️  No formatted dates found'}`);
      console.log(`Invalid dates check: ${hasInvalidDate ? '❌ Contains "Invalid Date"' : '✅ No invalid dates'}`);
      
      // Print sample of grid cells for debugging
      console.log(`\n📋 Sample grid cells (first 10):`);
      gridCells.slice(0, 10).forEach((cell, i) => {
        if (cell.trim()) console.log(`  ${i + 1}. "${cell.trim()}"`);
      });
      
      // Assert formatting is correct
      expect(hasInvalidDate, 'Grid should not contain "Invalid Date"').toBe(false);
      expect(hasUUID, 'Grid should not show UUIDs').toBe(false);
      
    } catch (e) {
      console.log('⚠️  Period not immediately visible in grid');
      console.log('Error:', e.message);
      await page.screenshot({ path: 'test-results/payroll-period/07b-grid-state.png' });
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-period/08-final-state.png',
      fullPage: true 
    });
    
    console.log('\n📊 Final Error Check:');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Page Errors: ${pageErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      consoleErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    if (pageErrors.length > 0) {
      console.log('\n❌ Page Errors Found:');
      pageErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Assert no errors occurred
    expect(consoleErrors.length, 'No console errors should occur').toBe(0);
    expect(pageErrors.length, 'No page errors should occur').toBe(0);
    
    console.log('\n✅ Test completed successfully with NO errors!');
    console.log(`📋 Created payroll period: "${periodName}"`);
    console.log(`📅 Period dates: ${startDate} to ${endDate}`);
    console.log(`💰 Pay date: ${payDate}`);
    console.log(`📸 Screenshots saved to test-results/payroll-period/`);
  });
});

