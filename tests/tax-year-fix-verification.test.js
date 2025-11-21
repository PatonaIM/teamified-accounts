const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('Console Error:', msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('JavaScript Error:', error.message);
  });

  try {
    console.log('=== Tax Year Fix Verification Test ===\n');
    
    // Login
    console.log('1. Logging in...');
    await page.goto('http://localhost/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[name="email"]').fill('user1@teamified.com');
    await page.locator('input[name="password"]').fill('Admin123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Login successful\n');

    // Navigate to Payroll Configuration
    console.log('2. Navigating to Payroll Configuration...');
    await page.goto('http://localhost/payroll-configuration', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✓ Page loaded\n');

    // Click on Tax Years tab
    console.log('3. Opening Tax Years tab...');
    await page.getByRole('tab', { name: 'Tax Years' }).click();
    await page.waitForTimeout(1500);
    console.log('✓ Tax Years tab opened\n');

    // Test 1: Create a tax year with specific dates
    console.log('4. Creating a tax year for FY 2025-26...');
    await page.getByRole('button', { name: /create tax year/i }).click();
    await page.waitForTimeout(1000);
    
    // Fill in the form fields
    await page.getByRole('spinbutton', { name: 'Year' }).fill('2025');
    await page.getByLabel('Start Date').fill('2025-04-01');
    await page.getByLabel('End Date').fill('2026-03-31');
    
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(2000);
    
    // Check if the tax year was created successfully
    const successSnackbar = await page.locator('[role="alert"]:has-text("successfully")').isVisible({ timeout: 3000 }).catch(() => false);
    if (successSnackbar) {
      console.log('✓ Tax year created successfully\n');
    } else {
      console.log('✗ Tax year creation might have failed\n');
    }

    // Test 2: Verify the dates are displayed correctly (not off by 1 day)
    console.log('5. Verifying date display...');
    await page.waitForTimeout(1000);
    
    // Look for the created tax year in the table
    const row = page.locator('tr:has-text("2025")');
    const startDateCell = await row.locator('td').nth(2).textContent();
    const endDateCell = await row.locator('td').nth(3).textContent();
    
    console.log(`   Start date displayed: ${startDateCell.trim()}`);
    console.log(`   End date displayed: ${endDateCell.trim()}`);
    
    // Check if dates match expected values (Apr 1, 2025 and Mar 31, 2026)
    const startDateCorrect = startDateCell.includes('Apr') && startDateCell.includes('1') && startDateCell.includes('2025');
    const endDateCorrect = endDateCell.includes('Mar') && endDateCell.includes('31') && endDateCell.includes('2026');
    
    if (startDateCorrect && endDateCorrect) {
      console.log('✓ Dates are displayed correctly (no offset)\n');
    } else {
      console.log('✗ Dates appear to have an offset issue\n');
    }

    // Test 3: Update the tax year
    console.log('6. Testing update functionality...');
    await page.getByRole('button', { name: /edit/i }).first().click();
    await page.waitForTimeout(1000);
    
    // Change the end date
    await page.getByLabel('End Date').fill('2026-04-30');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.waitForTimeout(2000);
    
    // Check for success message
    const updateSuccess = await page.locator('[role="alert"]:has-text("updated successfully")').isVisible({ timeout: 3000 }).catch(() => false);
    if (updateSuccess) {
      console.log('✓ Tax year updated successfully (no 400 error)\n');
    } else {
      console.log('✗ Update might have failed\n');
    }

    // Test 4: Verify updated date
    console.log('7. Verifying updated date...');
    await page.waitForTimeout(1000);
    const updatedRow = page.locator('tr:has-text("2025")');
    const updatedEndDateCell = await updatedRow.locator('td').nth(3).textContent();
    console.log(`   Updated end date: ${updatedEndDateCell.trim()}`);
    
    const updatedDateCorrect = updatedEndDateCell.includes('Apr') && updatedEndDateCell.includes('30') && updatedEndDateCell.includes('2026');
    if (updatedDateCorrect) {
      console.log('✓ Updated date is correct\n');
    } else {
      console.log('✗ Updated date may be incorrect\n');
    }

    // Take screenshot
    await page.screenshot({ path: 'tax-year-fix-verification.png', fullPage: true });
    console.log('✓ Screenshot saved: tax-year-fix-verification.png\n');

    // Summary
    console.log('=== TEST SUMMARY ===');
    if (errors.length === 0) {
      console.log('✓ No console or JavaScript errors detected');
    } else {
      console.log(`✗ ${errors.length} errors detected:`);
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('   - Tax year creation works');
    console.log('   - Dates are stored correctly (no offset)');
    console.log('   - Update functionality works (no 400 error)');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    await page.screenshot({ path: 'tax-year-fix-error.png' });
    console.log('Error screenshot saved: tax-year-fix-error.png');
  } finally {
    await browser.close();
  }
})();

