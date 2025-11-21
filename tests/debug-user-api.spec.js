const { test, expect } = require('@playwright/test');

test('Debug User Management API Calls', async ({ page }) => {
  // Track network requests
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('/users')) {
      console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
      console.log(`   Headers:`, request.headers());
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      });
    }
  });

  // Track network responses
  page.on('response', response => {
    if (response.url().includes('/users')) {
      console.log(`📡 API Response: ${response.status()} ${response.url()}`);
    }
  });

  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  console.log('🚀 Starting User Management API debug test...');

  // Login first
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'user1@teamified.com');
  await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"], button:has-text("Sign In")');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('✅ Logged in successfully');

  // Navigate to User Management page
  console.log('🔍 Navigating to User Management page...');
  await page.goto('/users');
  
  // Wait for page to load and any API calls to complete
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  console.log('📊 Request Summary:');
  console.log(`   Total /users requests: ${requests.length}`);
  
  requests.forEach((req, index) => {
    console.log(`   ${index + 1}. ${req.method} ${req.url}`);
    console.log(`      Authorization: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  });

  // Check if user list is visible
  const userTableExists = await page.locator('table').count() > 0;
  const noUsersMessage = await page.locator('text=No users found').count() > 0;
  const loadingState = await page.locator('text=Loading').count() > 0;
  
  console.log('📄 Page State:');
  console.log(`   User table exists: ${userTableExists}`);
  console.log(`   "No users found" message: ${noUsersMessage}`);
  console.log(`   Loading state: ${loadingState}`);

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'debug-user-management-api.png' });

  console.log('✅ API debug test completed');
});