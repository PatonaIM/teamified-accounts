const { test, expect } = require('@playwright/test');

test.describe('Dashboard - Simple Check', () => {
  const baseURL = 'http://localhost';
  
  const candidateUser = {
    email: 'user25@teamified.com',
    password: 'Admin123!',
  };

  test('should login and take dashboard screenshot', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);
    
    // Login as candidate
    await page.fill('input[name="email"]', candidateUser.email);
    await page.fill('input[name="password"]', candidateUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard)?$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async content to load
    await page.waitForTimeout(5000);
    
    // Check if we're on the dashboard
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'dashboard-with-jobs-screenshot.png',
      fullPage: true
    });
    
    console.log('✓ Screenshot saved as dashboard-with-jobs-screenshot.png');
    
    // Check for basic dashboard elements
    const dashboardTitle = page.locator('h1:has-text("My Dashboard")');
    if (await dashboardTitle.isVisible()) {
      console.log('✓ Dashboard title found');
    }
    
    // Check for job recommendations
    const jobRecommendations = page.locator('text=Recommended Jobs');
    if (await jobRecommendations.isVisible()) {
      console.log('✓ Job recommendations card found!');
    } else {
      console.log('✗ Job recommendations card NOT found');
      
      // Let's see what's on the page
      const content = await page.content();
      const hasRecommended = content.includes('Recommended');
      const hasJobs = content.includes('Jobs');
      console.log(`Page contains "Recommended": ${hasRecommended}`);
      console.log(`Page contains "Jobs": ${hasJobs}`);
    }
    
    // Check console for any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });
  });
});

