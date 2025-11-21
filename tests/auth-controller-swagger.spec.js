const { test, expect } = require('@playwright/test');

test.describe('Authentication Controller Swagger Documentation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Swagger UI
    await page.goto('http://localhost/api/docs');
    
    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
  });

  test('should display authentication endpoints in Swagger UI', async ({ page }) => {
    // Check if authentication tag is present
    await expect(page.locator('text=authentication')).toBeVisible();
    
    // Check if authentication endpoints are listed
    await expect(page.locator('text=Accept invitation and set up account')).toBeVisible();
    await expect(page.locator('text=Verify email address with token')).toBeVisible();
    await expect(page.locator('text=Login with email and password')).toBeVisible();
    await expect(page.locator('text=Refresh access token')).toBeVisible();
    await expect(page.locator('text=Logout and revoke refresh token')).toBeVisible();
  });

  test('should display users endpoints in Swagger UI', async ({ page }) => {
    // Check if users tag is present
    await expect(page.locator('text=users')).toBeVisible();
    
    // Check if user endpoints are listed
    await expect(page.locator('text=Get current user profile')).toBeVisible();
    await expect(page.locator('text=Get profile completion status')).toBeVisible();
    await expect(page.locator('text=Get user profile data')).toBeVisible();
    await expect(page.locator('text=Update user profile data')).toBeVisible();
    await expect(page.locator('text=Get user employment records')).toBeVisible();
  });

  test('should show detailed descriptions for login endpoint', async ({ page }) => {
    // Click on the login endpoint to expand it
    await page.click('text=Login with email and password');
    
    // Wait for the endpoint details to load
    await page.waitForSelector('.opblock-body', { timeout: 5000 });
    
    // Check for detailed description
    await expect(page.locator('text=Authentication Flow:')).toBeVisible();
    await expect(page.locator('text=Security Features:')).toBeVisible();
    await expect(page.locator('text=Token Information:')).toBeVisible();
    
    // Check for request body example
    await expect(page.locator('text=Valid login credentials')).toBeVisible();
    await expect(page.locator('text=Invalid credentials example')).toBeVisible();
  });

  test('should show comprehensive error responses', async ({ page }) => {
    // Click on the login endpoint
    await page.click('text=Login with email and password');
    
    // Wait for the endpoint details to load
    await page.waitForSelector('.opblock-body', { timeout: 5000 });
    
    // Check for error response codes
    await expect(page.locator('text=400')).toBeVisible();
    await expect(page.locator('text=401')).toBeVisible();
    await expect(page.locator('text=403')).toBeVisible();
    await expect(page.locator('text=429')).toBeVisible();
    await expect(page.locator('text=500')).toBeVisible();
    
    // Check for error descriptions
    await expect(page.locator('text=Bad Request - Invalid input format')).toBeVisible();
    await expect(page.locator('text=Unauthorized - Invalid email or password')).toBeVisible();
    await expect(page.locator('text=Forbidden - Account locked or disabled')).toBeVisible();
    await expect(page.locator('text=Too Many Requests - Rate limit exceeded')).toBeVisible();
  });

  test('should show rate limiting information', async ({ page }) => {
    // Click on the login endpoint
    await page.click('text=Login with email and password');
    
    // Wait for the endpoint details to load
    await page.waitForSelector('.opblock-body', { timeout: 5000 });
    
    // Check for rate limiting information
    await expect(page.locator('text=Rate limited to 5 attempts per minute per IP')).toBeVisible();
  });

  test('should show security information for protected endpoints', async ({ page }) => {
    // Click on a protected endpoint (users)
    await page.click('text=Get current user profile');
    
    // Wait for the endpoint details to load
    await page.waitForSelector('.opblock-body', { timeout: 5000 });
    
    // Check for security information
    await expect(page.locator('text=Requires valid JWT access token')).toBeVisible();
    await expect(page.locator('text=Returns only user\'s own profile data')).toBeVisible();
  });

  test('should allow testing login endpoint', async ({ page }) => {
    // Click on the login endpoint
    await page.click('text=Login with email and password');
    
    // Wait for the endpoint details to load
    await page.waitForSelector('.opblock-body', { timeout: 5000 });
    
    // Click "Try it out" button
    await page.click('button:has-text("Try it out")');
    
    // Check if request body is editable
    await expect(page.locator('textarea[placeholder*="Request body"]')).toBeVisible();
    
    // Check if Execute button is present
    await expect(page.locator('button:has-text("Execute")')).toBeVisible();
  });

  test('should show proper HTTP methods and status codes', async ({ page }) => {
    // Check that all endpoints show proper HTTP methods
    await expect(page.locator('span:has-text("POST")').first()).toBeVisible();
    await expect(page.locator('span:has-text("GET")').first()).toBeVisible();
    await expect(page.locator('span:has-text("PUT")').first()).toBeVisible();
    
    // Check that status codes are properly displayed
    await expect(page.locator('text=200')).toBeVisible();
    await expect(page.locator('text=201')).toBeVisible();
  });

  test('should display API tags correctly', async ({ page }) => {
    // Check that tags are displayed in the sidebar
    await expect(page.locator('.opblock-tag:has-text("authentication")')).toBeVisible();
    await expect(page.locator('.opblock-tag:has-text("users")')).toBeVisible();
  });

  test('should show request/response examples', async ({ page }) => {
    // Click on the login endpoint
    await page.click('text=Login with email and password');
    
    // Wait for the endpoint details to load
    await page.waitForSelector('.opblock-body', { timeout: 5000 });
    
    // Check for example values
    await expect(page.locator('text=user@teamified.com')).toBeVisible();
    await expect(page.locator('text=SecurePass123!')).toBeVisible();
  });
});
