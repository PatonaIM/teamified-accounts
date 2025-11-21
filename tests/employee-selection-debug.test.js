const { chromium } = require('playwright');

/**
 * Debug Test for Employee Selection 400 Error
 */

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const log = (message) => console.log(message);

  // Track all network requests
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
    });
  });

  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    responses.push({
      url,
      status,
      headers: response.headers(),
    });

    if (url.includes('employment-records') && status >= 400) {
      log('\n' + '='.repeat(60));
      log('❌ ERROR DETECTED');
      log('='.repeat(60));
      log(`URL: ${url}`);
      log(`Status: ${status}`);
      log(`Method: ${response.request().method()}`);
      
      try {
        const body = await response.json();
        log(`Response Body:\n${JSON.stringify(body, null, 2)}`);
      } catch (e) {
        const text = await response.text();
        log(`Response Text: ${text}`);
      }
      log('='.repeat(60));
    }
  });

  try {
    log('='.repeat(60));
    log('🔍 Employee Selection 400 Error Debug Test');
    log('='.repeat(60));

    // Login
    log('\n📝 Step 1: Login');
    await page.goto('http://localhost/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'user1@teamified.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    log('✅ Logged in successfully');

    // Navigate to Payroll Administration
    log('\n📝 Step 2: Navigate to Payroll Administration');
    await page.click('text=Payroll Administration');
    await page.waitForURL('**/payroll-administration', { timeout: 10000 });
    log('✅ On Payroll Administration page');

    // Go to Processing Control tab
    log('\n📝 Step 3: Go to Processing Control tab');
    await page.click('button:has-text("Processing Control")');
    await page.waitForTimeout(2000);
    log('✅ Processing Control tab active');

    // Select a period
    log('\n📝 Step 4: Select a payroll period');
    const periodSelect = page.locator('select').first();
    const periodOptions = await periodSelect.locator('option').allTextContents();
    log(`Available periods: ${periodOptions.join(', ')}`);
    
    if (periodOptions.length > 1) {
      await periodSelect.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      
      const selectedPeriod = await periodSelect.inputValue();
      log(`✅ Selected period ID: ${selectedPeriod}`);
      
      // Get the period details from the page to see what country it's for
      const periodText = periodOptions[1];
      log(`Selected period text: ${periodText}`);
    }

    // Click Select Employees button
    log('\n📝 Step 5: Click "Select Employees" button');
    const selectEmployeesBtn = page.locator('button:has-text("Select Employees")');
    const isBtnVisible = await selectEmployeesBtn.isVisible();
    
    if (isBtnVisible) {
      log('Button is visible, clicking...');
      
      // Clear responses array before clicking
      responses.length = 0;
      
      await selectEmployeesBtn.click();
      await page.waitForTimeout(3000);
      
      // Check what requests were made
      log('\n📊 Network Requests Made:');
      const employmentRequests = requests.filter(r => r.url.includes('employment-records'));
      employmentRequests.forEach((req, i) => {
        log(`\nRequest ${i + 1}:`);
        log(`  URL: ${req.url}`);
        log(`  Method: ${req.method}`);
        if (req.postData) {
          log(`  Body: ${req.postData}`);
        }
      });
      
      // Check responses
      log('\n📊 Network Responses Received:');
      const employmentResponses = responses.filter(r => r.url.includes('employment-records'));
      employmentResponses.forEach((res, i) => {
        log(`\nResponse ${i + 1}:`);
        log(`  URL: ${res.url}`);
        log(`  Status: ${res.status}`);
      });
      
      // Check if dialog opened
      const dialogVisible = await page.locator('[role="dialog"]:has-text("Select Employees")').isVisible({ timeout: 3000 }).catch(() => false);
      if (dialogVisible) {
        log('\n✅ Employee selection dialog opened');
        
        // Check for any error messages in the dialog
        const alertText = await page.locator('[role="dialog"] [role="alert"]').textContent().catch(() => null);
        if (alertText) {
          log(`⚠️ Alert in dialog: ${alertText}`);
        }
        
        // Check if employees loaded
        await page.waitForTimeout(2000);
        const employeeRows = await page.locator('[role="dialog"] [role="row"]').count();
        log(`Employee rows in dialog: ${employeeRows}`);
      } else {
        log('\n❌ Employee selection dialog did NOT open');
      }
    } else {
      log('❌ "Select Employees" button not visible');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/employee-selection-debug.png', fullPage: true });
    log('\n📸 Screenshot saved: test-results/employee-selection-debug.png');

  } catch (error) {
    log(`\n❌ Test error: ${error.message}`);
    console.error(error);
  }

  log('\n' + '='.repeat(60));
  log('🏁 Debug Test Complete');
  log('='.repeat(60));

  await browser.close();
})();
