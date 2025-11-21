const { test } = require('@playwright/test');
const path = require('path');

test.describe.configure({ mode: 'serial' });

test('Screenshot jobs page grid - with debug', async ({ page }) => {
  test.setTimeout(60000); // 60 second timeout
  
  // Set viewport to desktop size to see the 4-column layout
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Step 1: Navigating to root...');
  await page.goto('http://localhost/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Take screenshot of what we land on
  await page.screenshot({ path: 'step1-initial-page.png' });
  console.log('Screenshot saved: step1-initial-page.png');
  
  // Try to find login fields
  console.log('Step 2: Looking for login page...');
  const emailField = await page.locator('input[type="email"]').first();
  const passwordField = await page.locator('input[type="password"]').first();
  
  if (await emailField.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Step 3: Login page found, logging in...');
    await emailField.fill('candidate@example.com');
    await passwordField.fill('Password123!');
    
    await page.screenshot({ path: 'step2-filled-login.png' });
    console.log('Screenshot saved: step2-filled-login.png');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'step3-after-login.png' });
    console.log('Screenshot saved: step3-after-login.png');
  }
  
  // Navigate to jobs page
  console.log('Step 4: Navigating to jobs page...');
  await page.goto('http://localhost/jobs', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'jobs-page-full.png',
    fullPage: true 
  });
  console.log('Screenshot saved: jobs-page-full.png');
  
  // Try to get grid screenshot
  const gridContainer = page.locator('.MuiGrid-container').first();
  if (await gridContainer.isVisible().catch(() => false)) {
    await gridContainer.screenshot({ path: 'jobs-grid-container.png' });
    console.log('Screenshot saved: jobs-grid-container.png');
  }
  
  console.log('All screenshots completed!');
});

