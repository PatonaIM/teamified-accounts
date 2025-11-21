const { test, expect } = require('@playwright/test');

test.describe('Salary History Console Debug', () => {
  test('debug salary history page console logs', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(120000);
    
    // Capture all console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const message = `[${msg.type()}] ${msg.text()}`;
      console.log(message);
      consoleMessages.push(message);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
      consoleMessages.push(`[PAGE ERROR] ${error.message}`);
    });
    
    // Capture network requests
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        const requestInfo = `${request.method()} ${request.url()}`;
        console.log('REQUEST:', requestInfo);
        networkRequests.push(requestInfo);
      }
    });
    
    // Capture network responses
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const responseInfo = `${response.status()} ${response.url()}`;
        console.log('RESPONSE:', responseInfo);
        networkRequests.push(responseInfo);
      }
    });

    try {
      // Navigate to login page
      console.log('=== NAVIGATING TO LOGIN PAGE ===');
      await page.goto('http://localhost:5173/login');
      await page.waitForTimeout(2000);

      // Login as admin user
      console.log('=== LOGGING IN ===');
      await page.fill('input[name="email"]', 'user1@teamified.com');
      await page.fill('input[name="password"]', 'Admin123!');
      await page.click('button[type="submit"]');

      // Wait for dashboard redirect
      console.log('=== WAITING FOR DASHBOARD REDIRECT ===');
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      console.log('Successfully redirected to dashboard');

      // Navigate to salary history page
      console.log('=== NAVIGATING TO SALARY HISTORY PAGE ===');
      await page.goto('http://localhost:5173/salary-history');
      
      // Wait for initial page load
      await page.waitForTimeout(3000);
      console.log('Page loaded, waiting for content...');

      // Wait for either success or timeout
      let pageLoaded = false;
      try {
        // Wait for either the main title or bulk operations button
        await Promise.race([
          page.waitForSelector('h3:has-text("Salary History Management")', { timeout: 10000 }),
          page.waitForSelector('button:has-text("Bulk Operations")', { timeout: 10000 }),
          page.waitForSelector('table', { timeout: 10000 })
        ]);
        pageLoaded = true;
        console.log('=== PAGE CONTENT LOADED ===');
      } catch (e) {
        console.log('=== TIMEOUT WAITING FOR CONTENT ===');
      }

      // Wait for admin dashboard loading to complete
      console.log('=== WAITING FOR ADMIN DASHBOARD LOADING ===');
      await page.waitForTimeout(15000); // Wait 15 seconds to see loading progress

      // Check current page state
      console.log('=== CHECKING CURRENT PAGE STATE ===');
      const pageTitle = await page.textContent('body');
      console.log('Page contains "Salary History Management":', pageTitle.includes('Salary History Management'));
      console.log('Page contains "Bulk Operations":', pageTitle.includes('Bulk Operations'));
      console.log('Page contains "Loading":', pageTitle.includes('Loading'));
      console.log('Page contains spinner/loader:', await page.locator('.MuiCircularProgress-root').count() > 0);

      // Check for any visible tables
      const tableCount = await page.locator('table').count();
      console.log('Number of tables found:', tableCount);

      if (tableCount > 0) {
        const tableRows = await page.locator('tbody tr').count();
        console.log('Number of table rows:', tableRows);
      }

      // Take final screenshot
      await page.screenshot({ path: 'salary-debug-final.png', fullPage: true });
      console.log('Final screenshot saved');

    } catch (error) {
      console.log('TEST ERROR:', error.message);
    }

    // Print summary of what we captured
    console.log('\n=== CONSOLE MESSAGES SUMMARY ===');
    const adminDashboardMessages = consoleMessages.filter(msg => 
      msg.includes('AdminSalaryDashboard') || 
      msg.includes('Loading user summaries') ||
      msg.includes('Loaded users') ||
      msg.includes('Processing users')
    );
    console.log('Admin Dashboard related messages:', adminDashboardMessages.length);
    adminDashboardMessages.forEach(msg => console.log('  ', msg));

    console.log('\n=== NETWORK REQUESTS SUMMARY ===');
    const apiRequests = networkRequests.filter(req => req.includes('GET /api/'));
    console.log('API GET requests made:', apiRequests.length);
    apiRequests.slice(0, 10).forEach(req => console.log('  ', req)); // Show first 10

    console.log('\n=== ERROR MESSAGES ===');
    const errorMessages = consoleMessages.filter(msg => 
      msg.includes('[error]') || msg.includes('ERROR') || msg.includes('Failed')
    );
    errorMessages.forEach(msg => console.log('  ', msg));
  });
});