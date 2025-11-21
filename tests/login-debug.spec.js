const { test, expect } = require('@playwright/test');

test('Login Debug Test', async ({ page }) => {
  // Listen for network requests
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      });
    }
  });
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`🚨 Console ${msg.type()}:`, msg.text());
  });
  
  // Navigate to login page
  await page.goto('http://localhost/');
  await page.waitForLoadState('networkidle');
  
  // Fill in login form
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'user1@teamified.com');
  await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
  
  // Click login button
  await page.click('button[type="submit"], button:has-text("Sign In")');
  
  // Wait for network activity
  await page.waitForLoadState('networkidle');
  
  // Wait a bit more for any error messages to appear
  await page.waitForTimeout(2000);
  
  // Check for error messages
  const errorSelectors = [
    'text=error',
    'text=failed', 
    'text=invalid',
    'text=incorrect',
    '.error',
    '.alert-danger',
    '[role="alert"]',
    '.text-red-500',
    '.text-red-600'
  ];
  
  for (const selector of errorSelectors) {
    const elements = page.locator(selector);
    const count = await elements.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await elements.nth(i).textContent();
        console.log(`❌ Error found (${selector}):`, text);
      }
    }
  }
  
  // Log network requests
  console.log('🌐 API Requests made:');
  requests.forEach(req => {
    console.log(`  ${req.method} ${req.url}`);
    if (req.postData) {
      console.log(`    Body: ${req.postData}`);
    }
  });
  
  // Log network responses
  console.log('🌐 API Responses received:');
  responses.forEach(resp => {
    console.log(`  ${resp.status} ${resp.statusText} ${resp.url}`);
  });
  
  // Check current URL
  const currentUrl = page.url();
  console.log('🌐 Current URL after login attempt:', currentUrl);
  
  // Check if we're still on login page
  if (currentUrl.includes('/login')) {
    console.log('❌ Still on login page - login failed');
    
    // Check if form fields are still filled
    const emailValue = await page.inputValue('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordValue = await page.inputValue('input[type="password"], input[name="password"]');
    console.log('📧 Email field value:', emailValue);
    console.log('🔒 Password field value:', passwordValue ? '[FILLED]' : '[EMPTY]');
  } else {
    console.log('✅ Redirected away from login page - login may have succeeded');
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'login-debug-final.png' });
});

