const { chromium } = require('playwright');

async function testPayslipAccess() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const warnings = [];
  const apiErrors = [];

  // Monitor console messages
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      errors.push(text);
      console.log('❌ Console Error:', text);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log('⚠️ Console Warning:', text);
    }
  });

  // Monitor API requests
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    
    // Log payslip API responses
    if (url.includes('/payslips')) {
      try {
        const body = await response.text();
        console.log(`\n📡 API Response (${status}): ${url}`);
        if (body) {
          const json = JSON.parse(body);
          console.log(`   Data: ${JSON.stringify(json).substring(0, 500)}...`);
          if (Array.isArray(json)) {
            console.log(`   ✅ Returned ${json.length} payslip(s)`);
          }
        }
      } catch (e) {
        console.log(`   ⚠️ Could not parse response`);
      }
    }
    
    if (status >= 400) {
      try {
        const body = await response.text();
        apiErrors.push({ url, status, body });
        console.log(`❌ API Error ${status}:`, url);
      } catch (e) {
        apiErrors.push({ url, status, body: 'Could not read response' });
      }
    }
  });

  try {
    console.log('📝 STEP 1: Navigate to login page');
    await page.goto('http://localhost');
    await page.waitForTimeout(2000);

    console.log('📝 STEP 2: Login as user1@teamified.com');
    
    // Check what's on the page
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const emailCount = await emailInput.count();
    console.log(`Found ${emailCount} email input(s)`);
    
    if (emailCount === 0) {
      await page.screenshot({ path: 'test-results/payslip-no-email-input.png', fullPage: true });
      throw new Error('Email input not found');
    }
    
    await emailInput.first().fill('user1@teamified.com');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await passwordInput.first().fill('Admin123!');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await submitButton.first().click();
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('❌ Login failed - still on login page');
      await page.screenshot({ path: 'test-results/payslip-login-failed.png', fullPage: true });
      throw new Error('Login failed');
    }

    console.log('✅ Login successful');

    console.log('📝 STEP 3: Navigate to Payslips page');
    // Look for navigation link
    const payslipLink = page.locator('text=/payslip/i');
    const linkCount = await payslipLink.count();
    console.log(`Found ${linkCount} payslip link(s)`);
    
    if (linkCount > 0) {
      await payslipLink.first().click();
    } else {
      // Try direct navigation
      await page.goto('http://localhost/payslips');
    }
    
    await page.waitForTimeout(3000);
    
    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'test-results/payslip-page.png', fullPage: true });

    console.log('📝 STEP 4: Check for payslips visibility');
    
    // Look for payslip content
    const hasPayslipData = await page.locator('[role="grid"], .MuiDataGrid-root, table').count() > 0;
    console.log('Has data grid:', hasPayslipData);
    
    const payslipRows = await page.locator('[role="row"]').count();
    console.log(`Found ${payslipRows} rows`);
    
    if (payslipRows > 1) {
      console.log(`✅ Found ${payslipRows - 1} payslip(s) (excluding header)`);
    } else {
      console.log('⚠️ No payslips visible');
    }

    console.log('📝 STEP 5: Test refresh button');
    
    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Refresh"), button[aria-label*="refresh" i], button:has(svg[data-testid="RefreshIcon"])');
    const refreshCount = await refreshButton.count();
    console.log(`Found ${refreshCount} refresh button(s)`);
    
    if (refreshCount > 0) {
      console.log('Clicking refresh button...');
      const errorCountBefore = errors.length;
      const apiErrorCountBefore = apiErrors.length;
      
      await refreshButton.first().click();
      await page.waitForTimeout(2000);
      
      const newErrors = errors.slice(errorCountBefore);
      const newApiErrors = apiErrors.slice(apiErrorCountBefore);
      
      if (newErrors.length > 0) {
        console.log('❌ Errors after refresh button click:');
        newErrors.forEach(err => console.log('  -', err));
      } else {
        console.log('✅ No console errors after refresh');
      }
      
      if (newApiErrors.length > 0) {
        console.log('❌ API errors after refresh:');
        newApiErrors.forEach(err => console.log(`  - ${err.status} ${err.url}`));
      } else {
        console.log('✅ No API errors after refresh');
      }
    } else {
      console.log('⚠️ Refresh button not found');
    }

    console.log('📝 STEP 6: Check page text content');
    const pageText = await page.textContent('body');
    
    if (pageText.includes('No payslips available')) {
      console.log('⚠️ Page shows "No payslips available"');
    }
    
    if (pageText.includes('Error') || pageText.includes('error')) {
      console.log('⚠️ Page contains error text');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Console Errors: ${errors.length}`);
    console.log(`Console Warnings: ${warnings.length}`);
    console.log(`API Errors: ${apiErrors.length}`);
    console.log(`Payslips Visible: ${payslipRows > 1 ? 'Yes' : 'No'}`);
    
    if (errors.length > 0) {
      console.log('\n🔍 All Console Errors:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    
    if (apiErrors.length > 0) {
      console.log('\n🔍 All API Errors:');
      apiErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err.status} ${err.url}`));
    }
    
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/payslip-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testPayslipAccess();
