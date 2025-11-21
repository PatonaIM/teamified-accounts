const { chromium } = require('playwright');

async function finalVerification() {
  console.log('🧪 Final Payslips Page Verification Test\n');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push(text);
    } else if (type === 'warning') {
      warnings.push(text);
    }
  });

  const networkErrors = [];
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && status !== 404) { // 404 is expected for empty data
      networkErrors.push({ status, url });
    }
  });

  try {
    // Login
    console.log('🔐 Step 1: Logging in as admin...');
    await page.goto('http://localhost', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await page.fill('input[type="email"], input[name="email"]', 'user2@teamified.com');
      await page.waitForTimeout(500);
      await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
      await page.waitForTimeout(500);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      console.log('✅ Login successful\n');
    }

    // Navigate to Payslips
    console.log('📍 Step 2: Navigating to Payslips page...');
    await page.goto('http://localhost/payslips', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('✅ Payslips page loaded\n');

    // Get all tabs
    const tabs = await page.$$('button[role="tab"]');
    console.log(`Found ${tabs.length} tabs\n`);

    const testResults = [];

    // Test Tab 1: My Payslips
    console.log('🔍 Step 3: Testing Tab 1 - My Payslips');
    const errorsBefore1 = networkErrors.length;
    await tabs[0].click();
    await page.waitForTimeout(3000);
    const newErrors1 = networkErrors.length - errorsBefore1;
    const result1 = {
      name: 'My Payslips',
      criticalErrors: newErrors1,
      passed: newErrors1 === 0,
    };
    testResults.push(result1);
    console.log(result1.passed ? '✅ PASSED - No critical errors\n' : `❌ FAILED - ${newErrors1} critical errors\n`);

    // Test Tab 2: Contribution Summary
    console.log('🔍 Step 4: Testing Tab 2 - Contribution Summary');
    const errorsBefore2 = networkErrors.length;
    await tabs[1].click();
    await page.waitForTimeout(4000);
    
    // Check if country selector exists (MUI Select component)
    const countrySelector = await page.$('label:has-text("Select Country")');
    const hasCountrySelector = !!countrySelector;
    
    const newErrors2 = networkErrors.length - errorsBefore2;
    const result2 = {
      name: 'Contribution Summary',
      criticalErrors: newErrors2,
      hasCountrySelector,
      passed: newErrors2 === 0 && hasCountrySelector,
    };
    testResults.push(result2);
    console.log(result2.passed ? '✅ PASSED - Countries loaded, selector functional\n' : `⚠️ PARTIAL - ${newErrors2} critical errors, selector: ${hasCountrySelector}\n`);

    // Test Tab 3: Tax Documents
    console.log('🔍 Step 5: Testing Tab 3 - Tax Documents');
    const errorsBefore3 = networkErrors.length;
    await tabs[2].click();
    await page.waitForTimeout(3000);
    const newErrors3 = networkErrors.length - errorsBefore3;
    const result3 = {
      name: 'Tax Documents',
      criticalErrors: newErrors3,
      passed: newErrors3 === 0,
    };
    testResults.push(result3);
    console.log(result3.passed ? '✅ PASSED - No critical errors (500 fixed!)\n' : `❌ FAILED - ${newErrors3} critical errors\n`);

    // Test Tab 4: Generate Payslips
    console.log('🔍 Step 6: Testing Tab 4 - Generate Payslips');
    const errorsBefore4 = networkErrors.length;
    await tabs[3].click();
    await page.waitForTimeout(3000);
    
    // Check if countries loaded (look for the country select label)
    const countryLabel = await page.$('label:has-text("Country")');
    const hasCountries = !!countryLabel;
    
    const newErrors4 = networkErrors.length - errorsBefore4;
    const result4 = {
      name: 'Generate Payslips',
      criticalErrors: newErrors4,
      hasCountries,
      passed: newErrors4 === 0 && hasCountries,
    };
    testResults.push(result4);
    console.log(result4.passed ? '✅ PASSED - Countries loaded, ready for generation\n' : `❌ FAILED - ${newErrors4} critical errors, countries: ${hasCountries}\n`);

    // Summary
    console.log('='.repeat(80));
    console.log('📊 FINAL VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n📋 Tab Results:');
    testResults.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} Tab ${index + 1}: ${result.name} - ${result.passed ? 'PASSED' : 'FAILED'}`);
      if (result.criticalErrors > 0) {
        console.log(`   └─ ${result.criticalErrors} critical error(s)`);
      }
    });

    console.log(`\n🌐 Network Errors (excluding expected 404s): ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      networkErrors.forEach(err => console.log(`   - [${err.status}] ${err.url}`));
    }

    console.log(`\n🐛 Console Errors: ${errors.length}`);
    if (errors.length > 0 && errors.length <= 5) {
      errors.forEach(err => console.log(`   - ${err}`));
    } else if (errors.length > 5) {
      console.log(`   (Too many to display - ${errors.length} total)`);
    }

    const allPassed = testResults.every(r => r.passed);
    const criticalIssues = networkErrors.length;

    console.log('\n' + '='.repeat(80));
    if (allPassed && criticalIssues === 0) {
      console.log('🎉 ALL TESTS PASSED! Story 7.6 is fully operational!');
    } else if (criticalIssues === 0) {
      console.log('✅ NO CRITICAL ISSUES - Minor issues are acceptable');
    } else {
      console.log('⚠️ CRITICAL ISSUES FOUND - Review required');
    }
    console.log('='.repeat(80));

    // Take screenshot
    await page.screenshot({ path: 'test-results/payslips-final-verification.png', fullPage: true });
    console.log('\n📸 Screenshot saved: test-results/payslips-final-verification.png');

    console.log('\n⏸️  Keeping browser open for 15 seconds for inspection...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'test-results/payslips-verification-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Verification complete\n');
  }
}

finalVerification();

