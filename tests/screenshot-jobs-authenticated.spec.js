const { test } = require('@playwright/test');

test('Screenshot jobs page grid with authentication', async ({ page }) => {
  test.setTimeout(120000); // 2 minute timeout
  
  // Set viewport to desktop size to see the 4-column layout
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Step 1: Navigating to login...');
  await page.goto('http://localhost/login', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('Step 2: Waiting for login form...');
  await page.waitForSelector('input[type="email"]', { timeout: 30000 });
  
  console.log('Step 3: Filling login form...');
  await page.fill('input[type="email"]', 'candidate@example.com');
  await page.fill('input[type="password"]', 'Password123!');
  
  console.log('Step 4: Submitting login...');
  await page.click('button[type="submit"]');
  
  console.log('Step 5: Waiting for dashboard...');
  await page.waitForURL(/.*dashboard/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  console.log('Step 6: Navigating to jobs page...');
  await page.goto('http://localhost/jobs', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('Step 7: Waiting for jobs header...');
  await page.waitForSelector('text=Open Positions', { timeout: 30000 });
  
  console.log('Step 8: Waiting for job cards...');
  // Wait for at least one job card to load
  await page.waitForSelector('.MuiCard-root', { timeout: 30000 });
  
  // Wait a bit more for all cards to render
  await page.waitForTimeout(3000);
  
  console.log('Step 9: Taking screenshots...');
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'jobs-page-authenticated.png',
    fullPage: true 
  });
  console.log('✓ Saved: jobs-page-authenticated.png');
  
  // Take viewport screenshot (just what's visible)
  await page.screenshot({ 
    path: 'jobs-page-viewport.png',
    fullPage: false 
  });
  console.log('✓ Saved: jobs-page-viewport.png');
  
  // Try to get just the grid
  const gridContainer = page.locator('.MuiGrid-container').first();
  if (await gridContainer.isVisible().catch(() => false)) {
    await gridContainer.screenshot({ 
      path: 'jobs-grid-only.png' 
    });
    console.log('✓ Saved: jobs-grid-only.png');
  }
  
  // Get count of visible cards
  const cardCount = await page.locator('.MuiCard-root').count();
  console.log(`Found ${cardCount} job cards`);
  
  console.log('\n✅ All screenshots completed successfully!');
});

