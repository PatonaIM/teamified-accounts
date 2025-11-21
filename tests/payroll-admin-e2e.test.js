const { chromium } = require('playwright');

/**
 * Comprehensive End-to-End Test for Payroll Administration
 * Tests: Period Management, Employee Selection, Payroll Processing
 * Also verifies country display (UUID vs Code issue)
 */

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    passed: 0,
    failed: 0,
    errors: [],
  };

  // Track console errors and network errors
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      const url = response.url();
      const status = response.status();
      networkErrors.push({ url, status });
      console.log(`❌ Network Error: ${status} ${url}`);
    }
  });

  const log = (message) => console.log(message);
  const logSuccess = (message) => {
    console.log(`✅ ${message}`);
    results.passed++;
  };
  const logError = (message) => {
    console.log(`❌ ${message}`);
    results.failed++;
    results.errors.push(message);
  };

  try {
    log('='.repeat(60));
    log('🧪 Payroll Administration E2E Test');
    log('='.repeat(60));

    // ========================================
    // STEP 1: Login
    // ========================================
    log('\n📝 Step 1: Login as admin');
    await page.goto('http://localhost/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'user1@teamified.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    logSuccess('Login successful');

    // ========================================
    // STEP 2: Navigate to Payroll Administration
    // ========================================
    log('\n📝 Step 2: Navigate to Payroll Administration');
    await page.click('text=Payroll Administration');
    await page.waitForURL('**/payroll-administration', { timeout: 10000 });
    logSuccess('Navigated to Payroll Administration page');

    // ========================================
    // STEP 3: Check Period Management Tab - Country Display
    // ========================================
    log('\n📝 Step 3: Check Period Management Tab - Country Display');
    
    // Wait for periods to load
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for data to populate
    
    // Get all rows
    const periodRows = await page.locator('[role="row"]').count();
    log(`Found ${periodRows} rows in Period Management tab`);
    
    if (periodRows > 1) { // More than just header
      // Get the first data row
      const firstDataRow = page.locator('[role="row"]').nth(1);
      const cells = await firstDataRow.locator('[role="gridcell"]').allTextContents();
      log(`First row cells: ${JSON.stringify(cells)}`);
      
      // Find country column (should be index 1 based on the column def)
      const countryCell = cells[1]; // Country is second column
      
      // Check if it's a UUID pattern
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(countryCell);
      
      if (isUUID) {
        logError(`Country column shows UUID: ${countryCell} (should show code like 'IN', 'PH', 'AU')`);
      } else if (['IN', 'PH', 'AU'].includes(countryCell)) {
        logSuccess(`Country column shows correct code: ${countryCell}`);
      } else {
        logError(`Country column shows unexpected value: ${countryCell}`);
      }
    } else {
      log('⚠️ No period data to check country display');
    }

    // ========================================
    // STEP 4: Create a New Payroll Period
    // ========================================
    log('\n📝 Step 4: Create a New Payroll Period');
    
    // Click "Add Period" button
    await page.click('button:has-text("Add Period")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    logSuccess('Opened Add Period dialog');
    
    // Fill in period details
    const periodName = `Test Period ${Date.now()}`;
    await page.fill('input[name="periodName"]', periodName);
    
    // Select country (should be pre-filled with 'IN')
    log('Country field value:', await page.inputValue('input[name="countryId"]') || 'empty');
    
    // Set dates
    const startDate = '2025-01-01';
    const endDate = '2025-01-31';
    const payDate = '2025-02-05';
    
    await page.fill('input[name="startDate"]', startDate);
    await page.fill('input[name="endDate"]', endDate);
    await page.fill('input[name="payDate"]', payDate);
    
    log(`Period details: ${periodName}, ${startDate} to ${endDate}, pay date: ${payDate}`);
    
    // Submit form
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(2000);
    
    // Check if period was created
    const hasSuccessSnackbar = await page.locator('text=/created successfully/i').isVisible().catch(() => false);
    if (hasSuccessSnackbar) {
      logSuccess(`Payroll period created: ${periodName}`);
    } else {
      logError('Failed to create payroll period (no success message)');
    }

    // ========================================
    // STEP 5: Check Processing Control Tab
    // ========================================
    log('\n📝 Step 5: Check Processing Control Tab');
    await page.click('button:has-text("Processing Control")');
    await page.waitForTimeout(2000);
    
    // Check if period selector exists
    const hasPeriodSelector = await page.locator('label:has-text("Payroll Period")').isVisible();
    if (hasPeriodSelector) {
      logSuccess('Processing Control tab loaded with period selector');
    } else {
      logError('Processing Control tab missing period selector');
    }

    // ========================================
    // STEP 6: Test Employee Selection Button
    // ========================================
    log('\n📝 Step 6: Test Employee Selection Button');
    
    // Select the newly created period or any available period
    const periodSelect = page.locator('select').first();
    const periodOptions = await periodSelect.locator('option').allTextContents();
    log(`Available periods: ${periodOptions.join(', ')}`);
    
    if (periodOptions.length > 1) { // More than just placeholder
      await periodSelect.selectOption({ index: 1 }); // Select first real option
      await page.waitForTimeout(1000);
      logSuccess('Selected a payroll period');
      
      // Clear previous network errors
      networkErrors.length = 0;
      
      // Click "Select Employees" button
      const selectEmployeesBtn = page.locator('button:has-text("Select Employees")');
      const isBtnVisible = await selectEmployeesBtn.isVisible();
      
      if (isBtnVisible) {
        log('Clicking "Select Employees" button...');
        await selectEmployeesBtn.click();
        await page.waitForTimeout(2000);
        
        // Check for 400 errors
        const has400Error = networkErrors.some(err => err.status === 400);
        if (has400Error) {
          const error400 = networkErrors.find(err => err.status === 400);
          logError(`400 Error when selecting employees: ${error400.url}`);
          
          // Try to get response body
          try {
            const response = await page.waitForResponse(
              res => res.url().includes('employment-records') && res.status() === 400,
              { timeout: 1000 }
            ).catch(() => null);
            
            if (response) {
              const body = await response.json().catch(() => null);
              log(`400 Error body: ${JSON.stringify(body, null, 2)}`);
            }
          } catch (e) {
            log('Could not capture 400 error body');
          }
        } else {
          logSuccess('No 400 errors when clicking Select Employees');
        }
        
        // Check if employee selection dialog opened
        const dialogVisible = await page.locator('[role="dialog"]:has-text("Select Employees")').isVisible().catch(() => false);
        if (dialogVisible) {
          logSuccess('Employee selection dialog opened');
          
          // Check if employees are loaded
          await page.waitForTimeout(2000);
          const employeeRows = await page.locator('[role="dialog"] [role="row"]').count();
          log(`Found ${employeeRows} rows in employee selection (including header)`);
          
          if (employeeRows > 1) {
            logSuccess(`Employee list loaded with ${employeeRows - 1} employees`);
            
            // Select first employee
            const firstCheckbox = page.locator('[role="dialog"] [role="row"]').nth(1).locator('input[type="checkbox"]');
            await firstCheckbox.click();
            await page.waitForTimeout(500);
            logSuccess('Selected first employee');
            
            // Click "Apply Selection"
            await page.click('button:has-text("Apply Selection")');
            await page.waitForTimeout(1000);
            logSuccess('Applied employee selection');
            
            // Check if selection count is shown
            const selectionText = await page.locator('text=/\\d+ employee.*selected/i').textContent().catch(() => null);
            if (selectionText) {
              logSuccess(`Selection confirmed: ${selectionText}`);
            }
          } else {
            logError('No employees loaded in selection dialog');
          }
        } else {
          logError('Employee selection dialog did not open');
        }
      } else {
        logError('"Select Employees" button not visible');
      }
    } else {
      log('⚠️ No payroll periods available to test employee selection');
    }

    // ========================================
    // STEP 7: Check Bulk Operations Tab - Country Display
    // ========================================
    log('\n📝 Step 7: Check Bulk Operations Tab - Country Display');
    await page.click('button:has-text("Bulk Operations")');
    await page.waitForTimeout(2000);
    
    // Wait for grid to load
    await page.waitForSelector('[role="grid"]', { timeout: 5000 }).catch(() => null);
    
    const bulkRows = await page.locator('[role="row"]').count();
    log(`Found ${bulkRows} rows in Bulk Operations tab`);
    
    if (bulkRows > 1) {
      const firstDataRow = page.locator('[role="row"]').nth(1);
      const cells = await firstDataRow.locator('[role="gridcell"]').allTextContents();
      log(`First row cells: ${JSON.stringify(cells)}`);
      
      // Country should be second column
      const countryCell = cells[1];
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(countryCell);
      
      if (isUUID) {
        logError(`Bulk Ops: Country column shows UUID: ${countryCell}`);
      } else if (['IN', 'PH', 'AU'].includes(countryCell)) {
        logSuccess(`Bulk Ops: Country column shows correct code: ${countryCell}`);
      } else {
        logError(`Bulk Ops: Country column shows unexpected value: ${countryCell}`);
      }
    }

    // ========================================
    // STEP 8: Try to Start Payroll Processing
    // ========================================
    log('\n📝 Step 8: Try to Start Payroll Processing');
    await page.click('button:has-text("Processing Control")');
    await page.waitForTimeout(1000);
    
    // Check if "Start Processing" button is enabled
    const startBtn = page.locator('button:has-text("Start Processing")');
    const isStartBtnEnabled = await startBtn.isEnabled().catch(() => false);
    const isStartBtnVisible = await startBtn.isVisible().catch(() => false);
    
    if (isStartBtnVisible) {
      if (isStartBtnEnabled) {
        log('Attempting to start payroll processing...');
        networkErrors.length = 0;
        
        await startBtn.click();
        await page.waitForTimeout(3000);
        
        // Check for errors
        const hasErrors = networkErrors.some(err => err.status >= 400);
        if (hasErrors) {
          logError('Errors occurred during payroll processing start');
          networkErrors.forEach(err => log(`  - ${err.status} ${err.url}`));
        } else {
          logSuccess('Payroll processing started without errors');
        }
        
        // Check for success message
        const hasProcessingMsg = await page.locator('text=/processing.*started/i').isVisible({ timeout: 5000 }).catch(() => false);
        if (hasProcessingMsg) {
          logSuccess('Payroll processing started successfully');
        }
      } else {
        log('⚠️ "Start Processing" button is disabled (this may be expected based on period status)');
      }
    } else {
      logError('"Start Processing" button not visible');
    }

  } catch (error) {
    logError(`Test execution error: ${error.message}`);
    console.error(error);
  }

  // ========================================
  // SUMMARY
  // ========================================
  log('\n' + '='.repeat(60));
  log('📊 TEST SUMMARY');
  log('='.repeat(60));
  log(`✅ Passed: ${results.passed}`);
  log(`❌ Failed: ${results.failed}`);
  log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (consoleErrors.length > 0) {
    log(`\n⚠️ Console Errors (${consoleErrors.length}):`);
    consoleErrors.forEach((err, i) => log(`  ${i + 1}. ${err}`));
  }
  
  if (networkErrors.length > 0) {
    log(`\n⚠️ Network Errors (${networkErrors.length}):`);
    networkErrors.forEach((err, i) => log(`  ${i + 1}. ${err.status} ${err.url}`));
  }
  
  if (results.errors.length > 0) {
    log('\n❌ Failed Tests:');
    results.errors.forEach((err, i) => log(`  ${i + 1}. ${err}`));
  }
  
  log('\n' + '='.repeat(60));
  
  if (results.failed === 0) {
    log('🎉 All tests passed!');
  } else {
    log('⚠️ Some tests failed. Review the errors above.');
  }

  await page.screenshot({ path: 'test-results/payroll-admin-e2e.png', fullPage: true });
  log('\n📸 Screenshot saved: test-results/payroll-admin-e2e.png');

  await browser.close();
  process.exit(results.failed > 0 ? 1 : 0);
})();
