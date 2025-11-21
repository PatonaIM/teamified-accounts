import { test, expect } from '@playwright/test';

test('Check console errors on dashboard', async ({ page }) => {
  const consoleMessages = [];
  const networkRequests = [];

  // Capture all console messages
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  // Capture all network requests
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    networkRequests.push({
      url,
      status,
      statusText: response.statusText(),
    });
  });

  // Set a longer timeout and try to navigate
  test.setTimeout(60000);

  try {
    console.log('Navigating to http://localhost...');
    await page.goto('http://localhost', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded!');
    
    // Wait a bit
    await page.waitForTimeout(5000);
    
    // Print all console messages
    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    
    // Print network requests
    console.log('\n=== NETWORK REQUESTS ===');
    networkRequests.forEach(req => {
      if (req.status >= 400 || req.url.includes('payroll') || req.url.includes('countries')) {
        console.log(`[${req.status}] ${req.url}`);
      }
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/simple-check.png', fullPage: true });
    console.log('\nScreenshot saved to test-results/simple-check.png');
    
  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'test-results/error-screenshot.png' });
    throw error;
  }
});

