const { test, expect } = require('@playwright/test');

test('Navigation Debug Test - Check Console Logs and Navigation', async ({ page }) => {
  // Listen for all console messages
  page.on('console', msg => {
    console.log(`🚨 Console ${msg.type()}:`, msg.text());
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`❌ Page Error:`, error.message);
  });
  
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
  
  console.log('🚀 Starting navigation debug test...');
  
  // Navigate to login page
  console.log('📍 Navigating to login page...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: 'navigation-debug-login.png' });
  
  // Fill in login form with admin user
  console.log('🔐 Filling login form...');
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'user1@teamified.com');
  await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
  
  // Click login button
  console.log('👆 Clicking login button...');
  await page.click('button[type="submit"], button:has-text("Sign In")');
  
  // Wait for navigation/response
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Give extra time for all components to load
  
  // Take post-login screenshot
  await page.screenshot({ path: 'navigation-debug-post-login.png' });
  
  // Check current URL
  const currentUrl = page.url();
  console.log('🌐 Current URL after login:', currentUrl);
  
  // Check if we're logged in (not on login page)
  if (currentUrl.includes('/login')) {
    console.log('❌ Still on login page - login failed');
    
    // Log any visible error messages
    const errorElements = await page.locator('.error, .alert, [role="alert"]').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log('❌ Error message:', text);
    }
  } else {
    console.log('✅ Successfully redirected after login');
    
    // Wait a bit more for navigation to fully load
    await page.waitForTimeout(2000);
    
    // Look for navigation elements
    console.log('🔍 Looking for navigation elements...');
    
    // Check for sidebar or navigation container
    const sidebarSelectors = [
      '[data-testid="sidebar"]',
      '.sidebar',
      'nav',
      '.MuiDrawer-root',
      '.MuiList-root'
    ];
    
    for (const selector of sidebarSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`📋 Found navigation container: ${selector} (${elements.length} elements)`);
        
        // Look for navigation items within this container
        const navItems = await page.locator(`${selector} a, ${selector} button, ${selector} [role="menuitem"]`).all();
        console.log(`📋 Navigation items found: ${navItems.length}`);
        
        for (let i = 0; i < navItems.length; i++) {
          const item = navItems[i];
          const text = await item.textContent();
          const href = await item.getAttribute('href');
          console.log(`  📌 Nav item ${i + 1}: "${text}" -> ${href}`);
        }
      }
    }
    
    // Also check for any text that might be navigation items
    const possibleNavTexts = ['Dashboard', 'Profile', 'Users', 'Documents', 'Timesheets', 'Leave'];
    for (const text of possibleNavTexts) {
      const elements = await page.locator(`text=${text}`).all();
      if (elements.length > 0) {
        console.log(`📍 Found navigation text "${text}": ${elements.length} instances`);
      }
    }
    
    // Check localStorage for user data
    const localStorage = await page.evaluate(() => {
      return {
        accessToken: localStorage.getItem('teamified_access_token'),
        refreshToken: localStorage.getItem('teamified_refresh_token')
      };
    });
    
    console.log('💾 localStorage tokens:', {
      hasAccessToken: !!localStorage.accessToken,
      hasRefreshToken: !!localStorage.refreshToken,
      accessTokenLength: localStorage.accessToken?.length || 0
    });
    
    // Try to decode JWT token if available
    if (localStorage.accessToken) {
      try {
        const payload = await page.evaluate((token) => {
          return JSON.parse(atob(token.split('.')[1]));
        }, localStorage.accessToken);
        console.log('🎫 JWT payload:', payload);
      } catch (error) {
        console.log('❌ Failed to decode JWT:', error.message);
      }
    }
  }
  
  // Log all network activity
  console.log('🌐 API Requests made:');
  requests.forEach(req => {
    console.log(`  ${req.method} ${req.url}`);
    if (req.postData) {
      console.log(`    Body: ${req.postData}`);
    }
  });
  
  console.log('🌐 API Responses received:');
  responses.forEach(resp => {
    console.log(`  ${resp.status} ${resp.statusText} ${resp.url}`);
  });
  
  // Take final screenshot
  await page.screenshot({ path: 'navigation-debug-final.png' });
  
  console.log('✅ Navigation debug test completed');
});