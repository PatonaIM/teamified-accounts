const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Console Error Investigation', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('capture all console errors on payroll page', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PAYROLL CONFIGURATION - CONSOLE ERROR INVESTIGATION');
    console.log('='.repeat(80));

    const consoleMessages = [];
    const errors = [];
    const warnings = [];
    const apiCalls = [];
    const failedRequests = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        errors.push(text);
        console.log(`[ERROR] ${text}`);
      } else if (type === 'warning') {
        warnings.push(text);
        console.log(`[WARNING] ${text}`);
      } else if (text.includes('countries') || text.includes('Countries')) {
        console.log(`[INFO] ${text}`);
      }
    });

    // Capture failed requests
    page.on('requestfailed', request => {
      const failure = {
        url: request.url(),
        method: request.method(),
        failure: request.failure()
      };
      failedRequests.push(failure);
      console.log(`[REQUEST FAILED] ${request.method()} ${request.url()}`);
      console.log(`  Reason: ${request.failure()?.errorText || 'Unknown'}`);
    });

    // Capture API responses
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiCalls.push({
          url,
          status: response.status(),
          statusText: response.statusText()
        });
        
        if (response.status() >= 400) {
          console.log(`[API ERROR] ${response.status()} ${response.request().method()} ${url}`);
        } else if (url.includes('countries') || url.includes('payroll')) {
          console.log(`[API SUCCESS] ${response.status()} ${response.request().method()} ${url}`);
        }
      }
    });

    // Step 1: Login
    console.log('\n1. Logging in...');
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    console.log('✓ Login completed');

    // Step 2: Navigate to payroll configuration
    console.log('\n2. Navigating to /payroll-configuration...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    
    // Wait for page to load and API calls to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Give time for all API calls

    console.log('✓ Page loaded');

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-with-errors.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved: test-results/payroll-with-errors.png');

    // Step 3: Analyze collected data
    console.log('\n' + '='.repeat(80));
    console.log('ANALYSIS RESULTS');
    console.log('='.repeat(80));

    // Console Errors
    console.log(`\n📛 CONSOLE ERRORS (${errors.length}):`);
    if (errors.length === 0) {
      console.log('  ✅ No console errors detected');
    } else {
      errors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. ${error}`);
      });
    }

    // Console Warnings
    console.log(`\n⚠️  CONSOLE WARNINGS (${warnings.length}):`);
    if (warnings.length === 0) {
      console.log('  ✅ No console warnings detected');
    } else {
      warnings.slice(0, 5).forEach((warning, index) => {
        console.log(`\n  ${index + 1}. ${warning.substring(0, 200)}...`);
      });
      if (warnings.length > 5) {
        console.log(`\n  ... and ${warnings.length - 5} more warnings`);
      }
    }

    // Failed Requests
    console.log(`\n🚫 FAILED REQUESTS (${failedRequests.length}):`);
    if (failedRequests.length === 0) {
      console.log('  ✅ No failed requests detected');
    } else {
      failedRequests.forEach((req, index) => {
        console.log(`\n  ${index + 1}. ${req.method} ${req.url}`);
        console.log(`     Error: ${req.failure?.errorText || 'Unknown'}`);
      });
    }

    // API Calls Analysis
    console.log(`\n🌐 API CALLS SUMMARY (${apiCalls.length} total):`);
    
    const countriesCall = apiCalls.find(call => call.url.includes('/countries'));
    if (countriesCall) {
      console.log(`\n  Countries API:`);
      console.log(`    URL: ${countriesCall.url}`);
      console.log(`    Status: ${countriesCall.status} ${countriesCall.statusText}`);
      if (countriesCall.status >= 400) {
        console.log(`    ❌ FAILED - This is likely causing the error!`);
      } else {
        console.log(`    ✅ SUCCESS`);
      }
    } else {
      console.log(`\n  ❌ No countries API call detected - API might not be called`);
    }

    // Categorize API calls
    const successfulCalls = apiCalls.filter(call => call.status >= 200 && call.status < 300);
    const failedCalls = apiCalls.filter(call => call.status >= 400);
    
    console.log(`\n  Successful: ${successfulCalls.length}`);
    console.log(`  Failed: ${failedCalls.length}`);
    
    if (failedCalls.length > 0) {
      console.log(`\n  Failed API Calls:`);
      failedCalls.forEach(call => {
        console.log(`    - ${call.status} ${call.url}`);
      });
    }

    // Step 4: Check page content
    console.log('\n' + '='.repeat(80));
    console.log('PAGE CONTENT CHECK');
    console.log('='.repeat(80));

    const pageText = await page.textContent('body');
    
    const hasCountrySelector = pageText.includes('Country') || pageText.includes('Select');
    const hasCurrencyInfo = pageText.includes('Currency') || pageText.includes('₹') || pageText.includes('₱');
    const hasErrorMessage = pageText.toLowerCase().includes('error') || pageText.toLowerCase().includes('failed');
    const hasLoadingMessage = pageText.toLowerCase().includes('loading');
    
    console.log(`\n  Country Selector visible: ${hasCountrySelector ? '✅' : '❌'}`);
    console.log(`  Currency Info visible: ${hasCurrencyInfo ? '✅' : '❌'}`);
    console.log(`  Error message visible: ${hasErrorMessage ? '⚠️  YES' : '✅ NO'}`);
    console.log(`  Loading message visible: ${hasLoadingMessage ? '⚠️  YES' : '✅ NO'}`);

    // Step 5: Check for specific errors
    console.log('\n' + '='.repeat(80));
    console.log('SPECIFIC ERROR PATTERNS');
    console.log('='.repeat(80));

    const countriesErrors = errors.filter(e => 
      e.toLowerCase().includes('countries') || 
      e.toLowerCase().includes('country')
    );
    
    if (countriesErrors.length > 0) {
      console.log(`\n  ⚠️  Found ${countriesErrors.length} error(s) related to countries:`);
      countriesErrors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. ${error}`);
      });
    } else {
      console.log(`\n  ✅ No specific country-related errors found`);
    }

    const networkErrors = errors.filter(e => 
      e.toLowerCase().includes('network') || 
      e.toLowerCase().includes('fetch') ||
      e.toLowerCase().includes('cors') ||
      e.toLowerCase().includes('401') ||
      e.toLowerCase().includes('403') ||
      e.toLowerCase().includes('404') ||
      e.toLowerCase().includes('500')
    );
    
    if (networkErrors.length > 0) {
      console.log(`\n  ⚠️  Found ${networkErrors.length} network-related error(s):`);
      networkErrors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. ${error}`);
      });
    }

    // Step 6: Get actual error elements from page
    const errorElements = await page.locator('text=/error|failed|unable/i').all();
    if (errorElements.length > 0) {
      console.log(`\n  ⚠️  Found ${errorElements.length} error element(s) on page:`);
      for (let i = 0; i < Math.min(errorElements.length, 3); i++) {
        const text = await errorElements[i].textContent();
        console.log(`    - "${text?.substring(0, 100)}"`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('INVESTIGATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`\nTotal Console Messages: ${consoleMessages.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    console.log(`API Calls: ${apiCalls.length}`);
    console.log(`Failed Requests: ${failedRequests.length}`);
    console.log('\n' + '='.repeat(80) + '\n');

    // Save detailed log to file
    const detailedLog = {
      timestamp: new Date().toISOString(),
      summary: {
        totalMessages: consoleMessages.length,
        errors: errors.length,
        warnings: warnings.length,
        apiCalls: apiCalls.length,
        failedRequests: failedRequests.length
      },
      errors,
      warnings: warnings.slice(0, 10),
      apiCalls,
      failedRequests,
      pageChecks: {
        hasCountrySelector,
        hasCurrencyInfo,
        hasErrorMessage,
        hasLoadingMessage
      }
    };

    console.log('Detailed log saved for analysis');
    console.log(JSON.stringify(detailedLog, null, 2));
  });
});

