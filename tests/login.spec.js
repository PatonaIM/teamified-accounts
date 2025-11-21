const { test, expect } = require('@playwright/test');

test('Teamified Portal Login Test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check if we're on the login page
  await expect(page).toHaveTitle(/Teamified/);
  
  // Look for login form elements
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
  
  // Check if login form elements are present
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(loginButton).toBeVisible();
  
  // Fill in login credentials
  await emailInput.fill('user1@teamified.com');
  await passwordInput.fill('Admin123!');
  
  // Click login button
  await loginButton.click();
  
  // Wait for navigation or response
  await page.waitForLoadState('networkidle');
  
  // Check for successful login (look for dashboard or user menu)
  const dashboard = page.locator('text=Dashboard, text=Welcome, [data-testid="dashboard"]');
  const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Logout"), button:has-text("Profile")');
  
  // Check if we successfully logged in
  const isLoggedIn = await dashboard.isVisible().catch(() => false) || 
                    await userMenu.isVisible().catch(() => false);
  
  if (isLoggedIn) {
    console.log('✅ Login successful!');
  } else {
    console.log('❌ Login failed or redirected to login page');
    
    // Check for error messages
    const errorMessage = page.locator('text=error, text=failed, text=invalid, .error, .alert-danger');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('Error message:', errorText);
    }
  }
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'login-test-result.png' });
});

test('API Health Check', async ({ page }) => {
  // Test the API health endpoint
  const response = await page.request.get('/api/health');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.status).toBe('ok');
  console.log('✅ API health check passed');
});

test('Login API Test', async ({ page }) => {
  // Test the login API directly
  const response = await page.request.post('/api/v1/auth/login', {
    data: {
      email: 'user1@teamified.com',
      password: 'Admin123!'
    }
  });
  
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.accessToken).toBeDefined();
  expect(data.user).toBeDefined();
  console.log('✅ Login API test passed');
});

