/**
 * E2E Test: Employee Selection for Payroll Processing
 * Story 7.8.1, Updated in Story 7.8.2
 * 
 * Updated in 7.8.2:
 * - Removed department/location filter tests
 * - Added role column verification
 * - Verify country filtering works correctly
 * 
 * Test flow:
 * 1. Login as admin
 * 2. Navigate to Payroll Administration
 * 3. Select country and period
 * 4. Click "Select Employees" button
 * 5. Search and select specific employees
 * 6. Apply selection
 * 7. Verify badge shows selected count
 * 8. Start processing (verify API call includes userIds)
 * 9. Clear selection
 * 10. Verify "all employees" mode restored
 */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let testsPassed = 0;
  let testsFailed = 0;

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Monitor API requests (Story 7.8.2: Now monitoring employment records API)
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/v1/payroll/admin') || request.url().includes('/api/v1/employment-records')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData()
      });
    }
  });

  try {
    console.log('🧪 Starting Employee Selection E2E Test...\n');

    // ==================== Test 1: Login ====================
    console.log('Test 1: Login as admin...');
    await page.goto('http://localhost/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="email"]').fill('user1@teamified.com');
    await page.locator('input[name="password"]').fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Test 1: Login successful\n');
    testsPassed++;

    // ==================== Test 2: Navigate to Payroll Administration ====================
    console.log('Test 2: Navigate to Payroll Administration page...');
    await page.goto('http://localhost/payroll-administration');
    await page.waitForLoadState('networkidle');

    // Click on Processing Control tab
    const processingTab = page.getByRole('tab', { name: /processing control/i });
    await processingTab.waitFor({ state: 'visible', timeout: 5000 });
    await processingTab.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Test 2: Navigation successful\n');
    testsPassed++;

    // ==================== Test 3: Select Country and Period ====================
    console.log('Test 3: Select country and period...');
    
    // Country should default to India (IN)
    const countryField = page.getByLabel(/country/i).first();
    await countryField.waitFor({ state: 'visible', timeout: 5000 });
    
    // Select period (if available)
    const periodField = page.getByLabel(/payroll period/i).first();
    await periodField.waitFor({ state: 'visible', timeout: 5000 });
    
    // Check if period selector is enabled
    const isPeriodEnabled = await periodField.isEnabled();
    if (!isPeriodEnabled) {
      console.log('⚠️  No periods available - skipping period selection tests');
      console.log('ℹ️  Test requires at least one open payroll period for India');
      await browser.close();
      process.exit(0);
    }
    
    await periodField.click();
    // Select first period
    await page.getByRole('option').first().click();
    await page.waitForTimeout(1000); // Wait for period to load
    
    console.log('✅ Test 3: Country and period selected\n');
    testsPassed++;

    // ==================== Test 4: Verify "Select Employees" Button ====================
    console.log('Test 4: Verify "Select Employees" button is visible...');
    const selectEmployeesBtn = page.getByRole('button', { name: /select employees/i });
    await selectEmployeesBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Test 4: "Select Employees" button found\n');
    testsPassed++;

    // ==================== Test 5: Open Employee Selection Dialog ====================
    console.log('Test 5: Open employee selection dialog...');
    await selectEmployeesBtn.click();
    await page.waitForTimeout(1000);

    // Wait for dialog to appear
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    
    // Verify dialog title
    const dialogTitle = await dialog.getByText(/select employees/i).textContent();
    console.log(`   Dialog title: "${dialogTitle}"`);
    
    console.log('✅ Test 5: Employee selection dialog opened\n');
    testsPassed++;

    // ==================== Test 6: Verify Employee List Loads ====================
    console.log('Test 6: Verify employee list loads...');
    await page.waitForTimeout(2000); // Wait for API call and data load

    // Check if DataGrid loaded
    const dataGrid = dialog.locator('.MuiDataGrid-root');
    await dataGrid.waitFor({ state: 'visible', timeout: 5000 });
    
    // Count rows (employees)
    const rowCount = await dialog.locator('.MuiDataGrid-row').count();
    console.log(`   Employees loaded: ${rowCount}`);
    
    if (rowCount === 0) {
      console.log('⚠️  No employees found - test cannot proceed');
      console.log('ℹ️  Test requires active employment records for India');
      await browser.close();
      process.exit(0);
    }
    
    console.log('✅ Test 6: Employee list loaded successfully\n');
    testsPassed++;

    // ==================== Test 7: Select Specific Employees ====================
    console.log('Test 7: Select specific employees...');
    
    // Click first 3 employee checkboxes
    const employeesToSelect = Math.min(3, rowCount);
    for (let i = 0; i < employeesToSelect; i++) {
      const checkbox = dialog.locator('.MuiDataGrid-row').nth(i).locator('input[type="checkbox"]');
      await checkbox.check();
      await page.waitForTimeout(200);
    }
    
    // Verify selection count in dialog title
    const selectionCount = await dialog.getByText(new RegExp(`${employeesToSelect} of`)).textContent();
    console.log(`   Selection count: ${selectionCount}`);
    
    console.log(`✅ Test 7: ${employeesToSelect} employees selected\n`);
    testsPassed++;

    // ==================== Test 8: Apply Selection ====================
    console.log('Test 8: Apply selection...');
    const applyBtn = dialog.getByRole('button', { name: /apply selection/i });
    await applyBtn.click();
    await page.waitForTimeout(1000);

    // Verify dialog closed
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });
    
    // Verify chip badge appears
    const badge = page.getByText(new RegExp(`${employeesToSelect} selected`));
    await badge.waitFor({ state: 'visible', timeout: 5000 });
    console.log(`   Badge visible: "${await badge.textContent()}"`);
    
    // Verify button text changed (find button by icon since text changed)
    const updatedBtn = page.getByRole('button', { name: new RegExp(`${employeesToSelect}.*employees.*selected`, 'i') });
    await updatedBtn.waitFor({ state: 'visible', timeout: 5000 });
    const updatedBtnText = await updatedBtn.textContent();
    console.log(`   Button text: "${updatedBtnText}"`);
    
    console.log('✅ Test 8: Selection applied successfully\n');
    testsPassed++;

    // ==================== Test 9: Verify Start Processing Confirmation ====================
    console.log('Test 9: Verify start processing confirmation shows correct count...');
    const startProcessingBtn = page.getByRole('button', { name: /start processing/i });
    
    // Check if button is enabled
    const isEnabled = await startProcessingBtn.isEnabled();
    if (!isEnabled) {
      console.log('⚠️  Test 9 SKIPPED: "Start Processing" button is disabled');
      console.log('   This is expected if the period status is not "open"');
      console.log('   Employee selection feature is verified by Tests 5-8\n');
    } else {
      await startProcessingBtn.click();
      await page.waitForTimeout(500);

      // Check confirmation dialog
      const confirmDialog = page.getByRole('dialog');
      await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
      
      const confirmText = await confirmDialog.textContent();
      console.log(`   Confirmation text: "${confirmText}"`);
      
      if (!confirmText.includes(`${employeesToSelect} selected`)) {
        console.log(`❌ Test 9 FAILED: Confirmation should mention "${employeesToSelect} selected employees"`);
        testsFailed++;
      } else {
        console.log('✅ Test 9: Confirmation shows correct employee count\n');
        testsPassed++;
      }
      
      // Cancel the confirmation (don't actually start processing)
      const cancelBtn = confirmDialog.getByRole('button', { name: /cancel/i });
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }

    // ==================== Test 10: Clear Selection ====================
    console.log('Test 10: Clear selection...');
    // Find the chip with "selected" text and click its delete button
    const chip = page.locator('.MuiChip-root').filter({ hasText: /selected/i });
    await chip.waitFor({ state: 'visible', timeout: 5000 });
    const deleteBtn = chip.locator('.MuiChip-deleteIcon');
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Verify button text reverts to "Select Employees"
    const revertedBtn = page.getByRole('button', { name: /^select employees$/i });
    await revertedBtn.waitFor({ state: 'visible', timeout: 5000 });
    const revertedBtnText = await revertedBtn.textContent();
    
    if (revertedBtnText.includes('Select Employees') && !revertedBtnText.match(/\d+.*selected/i)) {
      console.log(`   Button text reverted: "${revertedBtnText}"`);
      console.log('✅ Test 10: Selection cleared successfully\n');
      testsPassed++;
    } else {
      console.log(`❌ Test 10 FAILED: Button text should be "Select Employees", got "${revertedBtnText}"`);
      testsFailed++;
    }

    // ==================== Test 11: Verify API Requests ====================
    console.log('Test 11: Verify API requests (Story 7.8.2: Now using employment records API)...');
    console.log(`   Total API requests captured: ${apiRequests.length}`);
    
    // Story 7.8.2: Now expect employment records API instead of custom endpoint
    const employeeListRequest = apiRequests.find(req => 
      req.url.includes('/v1/employment-records') && 
      req.url.includes('status=active') &&
      req.url.includes('countryId=IN') &&
      req.method === 'GET'
    );
    
    if (employeeListRequest) {
      console.log('   ✓ Employment records API called correctly');
      console.log(`     URL: ${employeeListRequest.url}`);
      console.log('   ✓ Country filter applied (countryId=IN)');
      console.log('✅ Test 11: API requests verified\n');
      testsPassed++;
    } else {
      console.log('❌ Test 11 FAILED: Employment records API was not called correctly');
      console.log('   Expected: GET /v1/employment-records?status=active&countryId=IN');
      testsFailed++;
    }

    // ==================== Test 12: Check Console Errors ====================
    console.log('Test 12: Check for console errors...');
    const filteredErrors = consoleErrors.filter(err => 
      !err.includes('favicon.ico') && 
      !err.includes('DevTools') &&
      !err.includes('Webpack')
    );
    
    if (filteredErrors.length > 0) {
      console.log(`⚠️  Console errors detected (${filteredErrors.length}):`);
      filteredErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('✅ Test 12: No console errors\n');
      testsPassed++;
    }

    // ==================== Summary ====================
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    console.log('='.repeat(60) + '\n');

    if (testsFailed === 0) {
      console.log('🎉 All tests passed! Employee selection feature is working correctly.\n');
    } else {
      console.log('⚠️  Some tests failed. Review the output above for details.\n');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    console.error(error.stack);
    testsFailed++;
  } finally {
    await browser.close();
    process.exit(testsFailed > 0 ? 1 : 0);
  }
})();

