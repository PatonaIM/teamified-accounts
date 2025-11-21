const { test, expect } = require('@playwright/test');

test.describe('Simple Swagger UI Test', () => {
  test('should load Swagger UI and show authentication endpoints', async ({ page }) => {
    // Navigate to Swagger UI
    await page.goto('http://localhost/api/docs');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'swagger-ui-screenshot.png' });
    
    // Check if the page contains Swagger UI content
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page contains "swagger":', pageContent.includes('swagger'));
    console.log('Page contains "authentication":', pageContent.includes('authentication'));
    
    // Check for basic Swagger UI elements
    await expect(page.locator('body')).toContainText('Swagger UI');
    
    // Check if authentication endpoints are present
    await expect(page.locator('body')).toContainText('authentication');
    await expect(page.locator('body')).toContainText('Login with email and password');
  });
});
