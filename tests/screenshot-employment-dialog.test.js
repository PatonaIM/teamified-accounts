const { test } = require('@playwright/test');

test('Screenshot Employment Record Dialog', async ({ page }) => {
  // Login
  await page.goto('http://localhost');
  await page.fill('input[type="email"]', 'user1@teamified.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button:has-text("Sign In")');
  
  // Wait for navigation
  await page.waitForTimeout(2000);
  
  // Navigate to employment records
  await page.goto('http://localhost/employment-records');
  await page.waitForTimeout(2000);
  
  // Click Add Record button
  await page.click('button:has-text("Add Record")');
  
  // Wait for dialog to open
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/employment-dialog-transparency.png', fullPage: true });
  
  console.log('Screenshot saved to test-results/employment-dialog-transparency.png');
});
