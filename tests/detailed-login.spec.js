const { test, expect } = require('@playwright/test');

test('Detailed Login Test', async ({ page }) => {
  // Navigate to the login page
  console.log('🔍 Navigating to http://localhost/');
  await page.goto('http://localhost/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot of the initial page
  await page.screenshot({ path: 'initial-page.png' });
  
  // Check the page title
  const title = await page.title();
  console.log('📄 Page title:', title);
  
  // Check if we're redirected to login
  const currentUrl = page.url();
  console.log('🌐 Current URL:', currentUrl);
  
  // Look for any login-related elements
  const loginElements = await page.locator('input, button, form').all();
  console.log('🔍 Found elements:', loginElements.length);
  
  // Check for specific login form elements
  const emailInputs = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]');
  const passwordInputs = page.locator('input[type="password"], input[name="password"]');
  const loginButtons = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), button:has-text("Log In")');
  
  const emailCount = await emailInputs.count();
  const passwordCount = await passwordInputs.count();
  const buttonCount = await loginButtons.count();
  
  console.log('📧 Email inputs found:', emailCount);
  console.log('🔒 Password inputs found:', passwordCount);
  console.log('🔘 Login buttons found:', buttonCount);
  
  // If we found login elements, try to interact with them
  if (emailCount > 0 && passwordCount > 0 && buttonCount > 0) {
    console.log('✅ Login form found, attempting login...');
    
    // Fill in credentials
    await emailInputs.first().fill('user1@teamified.com');
    await passwordInputs.first().fill('Admin123!');
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'before-login.png' });
    
    // Click login button
    await loginButtons.first().click();
    
    // Wait for response
    await page.waitForLoadState('networkidle');
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'after-login.png' });
    
    // Check for success indicators
    const successIndicators = page.locator('text=Dashboard, text=Welcome, [data-testid="dashboard"], button:has-text("Logout"), button:has-text("Profile")');
    const successCount = await successIndicators.count();
    
    if (successCount > 0) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed - checking for error messages...');
      
      // Check for error messages
      const errorMessages = page.locator('text=error, text=failed, text=invalid, .error, .alert-danger, [role="alert"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          console.log('❌ Error message:', errorText);
        }
      }
    }
  } else {
    console.log('❌ Login form not found');
    
    // Check what's actually on the page
    const bodyText = await page.locator('body').textContent();
    console.log('📄 Page content preview:', bodyText.substring(0, 200) + '...');
    
    // Look for any forms or inputs
    const allInputs = await page.locator('input').all();
    console.log('🔍 All inputs found:', allInputs.length);
    
    for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
      const inputType = await allInputs[i].getAttribute('type');
      const inputName = await allInputs[i].getAttribute('name');
      const inputPlaceholder = await allInputs[i].getAttribute('placeholder');
      console.log(`Input ${i}: type="${inputType}", name="${inputName}", placeholder="${inputPlaceholder}"`);
    }
  }
});

test('Check Page Content', async ({ page }) => {
  await page.goto('http://localhost/');
  await page.waitForLoadState('networkidle');
  
  // Get all text content
  const bodyText = await page.locator('body').textContent();
  console.log('📄 Full page content:');
  console.log(bodyText);
  
  // Check for React app loading
  const reactRoot = page.locator('#root, [data-reactroot]');
  const reactCount = await reactRoot.count();
  console.log('⚛️ React root elements found:', reactCount);
  
  // Check for any JavaScript errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🚨 Console error:', msg.text());
    }
  });
  
  // Check for network errors
  page.on('response', response => {
    if (!response.ok()) {
      console.log('🌐 Network error:', response.status(), response.url());
    }
  });
});

