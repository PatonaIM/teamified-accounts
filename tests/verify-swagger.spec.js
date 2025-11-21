const { test, expect } = require('@playwright/test');

test.describe('Swagger UI Verification', () => {
  test('should load Swagger UI and display authentication endpoints', async ({ page }) => {
    // Navigate to Swagger UI
    await page.goto('http://localhost/api/docs');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle('Teamified EOR Portal API Documentation');
    
    // Wait for Swagger UI to load
    await page.waitForSelector('#swagger-ui', { timeout: 15000 });
    
    // Check if authentication section is visible
    await expect(page.locator('text=authentication')).toBeVisible({ timeout: 10000 });
    
    // Check if users section is visible
    await expect(page.locator('text=users')).toBeVisible({ timeout: 10000 });
    
    // Check for specific endpoint names
    await expect(page.locator('text=Login with email and password')).toBeVisible();
    await expect(page.locator('text=Get current user profile')).toBeVisible();
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'swagger-ui-verification.png' });
  });
});
