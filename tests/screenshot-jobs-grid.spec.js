const { test, expect } = require('@playwright/test');

test('Take screenshot of jobs page grid layout', async ({ page }) => {
  // Set viewport to desktop size to see the 4-column layout
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to login page
  await page.goto('http://localhost/login', { waitUntil: 'networkidle' });
  
  // Wait for login page to load
  await page.waitForSelector('input[type="email"]', { timeout: 30000 });
  
  // Login as candidate user
  await page.fill('input[type="email"]', 'candidate@example.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  
  // Navigate to jobs page
  await page.goto('http://localhost/jobs');
  
  // Wait for jobs to load
  await page.waitForSelector('text=Open Positions', { timeout: 10000 });
  
  // Wait for job cards to appear
  await page.waitForSelector('.MuiCard-root', { timeout: 15000 });
  
  // Wait a bit more for all cards to render
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'jobs-page-grid-layout.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved as: jobs-page-grid-layout.png');
  
  // Also take a screenshot of just the grid area
  const gridContainer = page.locator('.MuiGrid-container').first();
  await gridContainer.screenshot({
    path: 'jobs-grid-only.png'
  });
  
  console.log('Grid screenshot saved as: jobs-grid-only.png');
});

