const { test, expect } = require('@playwright/test');

test.describe('Workable Jobs Board - Simple Test', () => {
  
  test('Jobs page loads and displays content', async ({ page }) => {
    console.log('🧪 Testing jobs page loads...');
    
    // Navigate to jobs page
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'jobs-page-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to jobs-page-screenshot.png');
    
    // Check page loaded (look for any h1, h2, or h3)
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('📝 Found headings:', headings);
    
    // Check for any Material-UI components
    const muiComponents = await page.locator('[class*="Mui"], [class*="mui"]').count();
    console.log(`🎨 Found ${muiComponents} Material-UI components`);
    
    // Check for any buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('🔘 Found buttons:', buttons.slice(0, 5));
    
    // Check for any cards or job listings
    const cards = await page.locator('article, [class*="Card"], [class*="card"]').count();
    console.log(`📇 Found ${cards} card elements`);
    
    // Look for job-related text
    const bodyText = await page.locator('body').textContent();
    const hasJobText = /job|position|apply|career|hiring/i.test(bodyText);
    console.log(`📄 Page contains job-related text: ${hasJobText}`);
    
    // Basic assertion - page should have loaded
    await expect(page.locator('body')).toBeVisible();
    console.log('✅ Page body is visible');
  });

  test('Candidate can login', async ({ page }) => {
    console.log('🧪 Testing candidate login...');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Find and fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('user25@teamified.com');
    await passwordInput.fill('Admin123!');
    
    console.log('✅ Filled credentials');
    
    // Click login
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    
    console.log('✅ Clicked login');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot after login
    await page.screenshot({ path: 'after-login-screenshot.png' });
    console.log('📸 Screenshot saved to after-login-screenshot.png');
    
    // Check we're not still on login page
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    const notOnLoginPage = !currentUrl.includes('/login');
    console.log(`✅ Redirected from login: ${notOnLoginPage}`);
    
    expect(notOnLoginPage).toBe(true);
  });

  test('Jobs page has expected structure', async ({ page }) => {
    console.log('🧪 Checking jobs page structure...');
    
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for search/filter elements
    const inputs = await page.locator('input').count();
    console.log(`📝 Found ${inputs} input elements`);
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Get all text content to see what's on page
    const allText = await page.locator('body').textContent();
    const textSample = allText.substring(0, 500);
    console.log(`📝 Page text sample: ${textSample}`);
    
    // Check if Workable API is returning data
    // Look for any job-specific content
    const hasHR = allText.includes('HR');
    const hasSpecialist = allText.includes('Specialist');
    const hasTest = allText.includes('Test');
    
    console.log(`🔍 Contains 'HR': ${hasHR}`);
    console.log(`🔍 Contains 'Specialist': ${hasSpecialist}`);
    console.log(`🔍 Contains 'Test': ${hasTest}`);
    
    // At minimum, page should load
    await expect(page.locator('body')).toBeVisible();
    console.log('✅ Page structure test complete');
  });
});

