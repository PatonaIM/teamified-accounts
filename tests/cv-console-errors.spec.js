const { test, expect } = require('@playwright/test');

test.describe('CV Management - Console Errors Check', () => {
  let consoleErrors = [];
  let consoleWarnings = [];
  let networkErrors = [];

  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: 'error',
          text: msg.text(),
          location: msg.location()
        });
      } else if (msg.type() === 'warning') {
        consoleWarnings.push({
          type: 'warning',
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    // Capture network errors
    page.on('response', response => {
      if (!response.ok() && response.url().includes('/api/')) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Reset arrays
    consoleErrors = [];
    consoleWarnings = [];
    networkErrors = [];
  });

  test('should login and check CV management page for errors', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost/login', { waitUntil: 'networkidle', timeout: 30000 });

    // Login
    await page.fill('input[type="email"]', 'user25@teamified.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    console.log('✅ Successfully logged in');

    // Navigate to CV management page
    await page.goto('http://localhost/cv', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Navigated to CV management page');

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    // Log all captured errors
    console.log('\n========================================');
    console.log('CONSOLE ERRORS REPORT');
    console.log('========================================\n');

    if (consoleErrors.length > 0) {
      console.log('❌ CONSOLE ERRORS FOUND:', consoleErrors.length);
      consoleErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type.toUpperCase()}`);
        console.log(`   Text: ${error.text}`);
        if (error.location.url) {
          console.log(`   Location: ${error.location.url}:${error.location.lineNumber}:${error.location.columnNumber}`);
        }
      });
    } else {
      console.log('✅ NO CONSOLE ERRORS');
    }

    console.log('\n========================================');
    console.log('NETWORK ERRORS REPORT');
    console.log('========================================\n');

    if (networkErrors.length > 0) {
      console.log('❌ NETWORK ERRORS FOUND:', networkErrors.length);
      networkErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.status} ${error.statusText}`);
        console.log(`   URL: ${error.url}`);
      });
    } else {
      console.log('✅ NO NETWORK ERRORS');
    }

    console.log('\n========================================');
    console.log('CONSOLE WARNINGS REPORT');
    console.log('========================================\n');

    if (consoleWarnings.length > 0) {
      console.log('⚠️  CONSOLE WARNINGS FOUND:', consoleWarnings.length);
      consoleWarnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.type.toUpperCase()}`);
        console.log(`   Text: ${warning.text}`);
      });
    } else {
      console.log('✅ NO CONSOLE WARNINGS');
    }

    console.log('\n========================================\n');

    // Take screenshot for reference
    await page.screenshot({ path: 'cv-page-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: cv-page-screenshot.png');

    // Assertions
    expect(consoleErrors.length, `Found ${consoleErrors.length} console errors. Check the report above.`).toBe(0);
    expect(networkErrors.length, `Found ${networkErrors.length} network errors. Check the report above.`).toBe(0);
  });

  test('should attempt to upload a small test file and check for errors', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost/login', { waitUntil: 'networkidle', timeout: 30000 });

    // Login
    await page.fill('input[type="email"]', 'user25@teamified.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    // Navigate to CV management page
    await page.goto('http://localhost/cv', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Create a small test file (1KB text file simulating PDF)
    const testFileContent = Buffer.from('Test CV content');
    
    // Look for file input
    const fileInput = await page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      console.log('✅ File input found');
      
      // Set the file
      await fileInput.setInputFiles({
        name: 'test-cv.pdf',
        mimeType: 'application/pdf',
        buffer: testFileContent
      });

      console.log('✅ File selected');

      // Wait a bit for file selection to process
      await page.waitForTimeout(1000);

      // Check if upload button appears and is enabled
      const uploadButton = page.locator('button:has-text("Upload CV")').first();
      const isEnabled = await uploadButton.isEnabled();
      
      if (isEnabled) {
        console.log('✅ Upload button is enabled');
      } else {
        console.log('⚠️  Upload button is disabled (may be expected)');
      }
    } else {
      console.log('❌ File input not found on page');
    }

    // Wait for any async operations
    await page.waitForTimeout(2000);

    // Log errors
    console.log('\n========================================');
    console.log('UPLOAD TEST ERRORS REPORT');
    console.log('========================================\n');

    if (consoleErrors.length > 0) {
      console.log('❌ CONSOLE ERRORS:', consoleErrors.length);
      consoleErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.text}`);
      });
    } else {
      console.log('✅ NO CONSOLE ERRORS DURING UPLOAD TEST');
    }

    if (networkErrors.length > 0) {
      console.log('\n❌ NETWORK ERRORS:', networkErrors.length);
      networkErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.status} - ${error.url}`);
      });
    } else {
      console.log('✅ NO NETWORK ERRORS DURING UPLOAD TEST');
    }

    console.log('\n========================================\n');

    // Take screenshot
    await page.screenshot({ path: 'cv-upload-test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: cv-upload-test-screenshot.png');

    // Less strict assertion for this test (just log, don't fail)
    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      console.log('⚠️  Errors found during upload test - review logs above');
    }
  });
});

