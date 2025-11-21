/**
 * Salary History Add Functionality Test
 * Tests the ability to add new salary entries
 */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Store console logs and errors
  const logs = [];
  const errors = [];

  page.on('console', msg => {
    logs.push(`CONSOLE ${msg.type()}: ${msg.text()}`);
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    errors.push(`ERROR: ${error.message}`);
    console.error(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('\n=== Salary History Add Test ===\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    await page.goto('http://localhost');
    await page.fill('input[name="email"]', 'user1@teamified.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✅ Login successful');

    // Step 2: Navigate to Salary History
    console.log('\n2. Navigating to Salary History page...');
    await page.click('a[href="/salary-history"]');
    await page.waitForTimeout(2000);
    console.log('✅ Salary History page loaded');

    // Step 3: Take screenshot of initial page
    await page.screenshot({ path: 'test-results/salary-history-initial.png', fullPage: true });
    console.log('✅ Screenshot saved: salary-history-initial.png');

    // Step 4: Check if FAB button exists and is visible
    console.log('\n3. Checking for Add button (FAB)...');
    const fabButton = await page.$('button[aria-label="create salary history"]');
    if (!fabButton) {
      console.log('❌ FAB button not found!');
    } else {
      const isVisible = await fabButton.isVisible();
      console.log(`✅ FAB button found, visible: ${isVisible}`);
      
      // Step 5: Click FAB button to open form
      console.log('\n4. Clicking Add button...');
      await fabButton.click();
      await page.waitForTimeout(1000);
      
      // Step 6: Check if dialog opened
      const dialog = await page.$('div[role="dialog"]');
      if (!dialog) {
        console.log('❌ Dialog not opened!');
      } else {
        console.log('✅ Dialog opened');
        
        // Take screenshot of form
        await page.screenshot({ path: 'test-results/salary-history-form.png', fullPage: true });
        console.log('✅ Screenshot saved: salary-history-form.png');
        
        // Step 7: Try to fill form
        console.log('\n5. Attempting to fill form...');
        
        // Wait for form elements
        await page.waitForTimeout(500);
        
        // Check what fields are visible
        const employmentField = await page.$('label:has-text("Employment Record")');
        const amountField = await page.$('label:has-text("Salary Amount")');
        const currencyField = await page.$('label:has-text("Currency")');
        const dateField = await page.$('label:has-text("Effective Date")');
        const reasonField = await page.$('label:has-text("Change Reason")');
        
        console.log(`Employment Record field: ${employmentField ? '✅' : '❌'}`);
        console.log(`Salary Amount field: ${amountField ? '✅' : '❌'}`);
        console.log(`Currency field: ${currencyField ? '✅' : '❌'}`);
        console.log(`Effective Date field: ${dateField ? '✅' : '❌'}`);
        console.log(`Change Reason field: ${reasonField ? '✅' : '❌'}`);
        
        // Try filling the form
        try {
          // Fill amount
          const amountInput = await page.$('input[name="salaryAmount"]');
          if (amountInput) {
            await amountInput.fill('75000');
            console.log('✅ Filled Salary Amount');
          }
          
          // Select currency
          const currencySelect = await page.$('div[id="salaryCurrency"]');
          if (currencySelect) {
            await currencySelect.click();
            await page.waitForTimeout(300);
            await page.click('li[data-value="USD"]');
            console.log('✅ Selected Currency: USD');
          }
          
          // Fill reason
          const reasonInput = await page.$('input[name="changeReason"]');
          if (reasonInput) {
            await reasonInput.fill('Annual salary review');
            console.log('✅ Filled Change Reason');
          }
          
          // Take screenshot of filled form
          await page.screenshot({ path: 'test-results/salary-history-form-filled.png', fullPage: true });
          console.log('✅ Screenshot saved: salary-history-form-filled.png');
          
          // Step 8: Try to submit
          console.log('\n6. Attempting to submit form...');
          const submitButton = await page.$('button:has-text("Create")');
          if (submitButton) {
            const isDisabled = await submitButton.isDisabled();
            console.log(`Submit button found, disabled: ${isDisabled}`);
            
            if (!isDisabled) {
              await submitButton.click();
              console.log('✅ Clicked submit button');
              await page.waitForTimeout(2000);
              
              // Check for errors
              const errorAlert = await page.$('div[role="alert"]');
              if (errorAlert) {
                const errorText = await errorAlert.textContent();
                console.log(`❌ Error displayed: ${errorText}`);
              } else {
                console.log('✅ No error alert visible');
              }
            }
          }
          
        } catch (fillError) {
          console.error(`❌ Error filling form: ${fillError.message}`);
        }
      }
    }

    // Final summary
    console.log('\n=== Test Summary ===');
    console.log(`Errors captured: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log(`\n✅ Test completed. Check test-results/ for screenshots.`);
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    await page.screenshot({ path: 'test-results/salary-history-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
