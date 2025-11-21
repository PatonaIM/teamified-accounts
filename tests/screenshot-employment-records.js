const { test } = require('@playwright/test');

test('Take screenshot of employment records page', async ({ page }) => {
  // Login
  await page.goto('http://localhost:80');
  await page.fill('input[name="email"]', 'user1@teamified.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navigate to employment records
  await page.click('text=Employment Records');
  await page.waitForURL('**/employment-records', { timeout: 10000 });
  
  // Wait for page to fully load
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'test-results/employment-records-layout.png', 
    fullPage: true 
  });
  
  console.log('Screenshot saved to test-results/employment-records-layout.png');
});
