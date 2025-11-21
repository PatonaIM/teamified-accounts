const { test, expect } = require('@playwright/test');

test('Debug Specific Page Error', async ({ page }) => {
  // Listen for console errors with more details
  page.on('console', msg => {
    console.log(`🚨 Console ${msg.type()}:`, msg.text());
  });
  
  // Listen for page errors with full stack trace
  page.on('pageerror', error => {
    console.log(`❌ Page Error:`, error.message);
    console.log(`   Stack:`, error.stack);
  });
  
  console.log('🚀 Starting debug test...');
  
  // Login first
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'user1@teamified.com');
  await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"], button:has-text("Sign In")');
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('✅ Logged in successfully');
  
  // Test the User Management page specifically
  console.log('🔍 Testing User Management page...');
  await page.goto('/users');
  
  // Wait longer to see if error occurs during loading
  await page.waitForTimeout(5000);
  
  console.log('✅ Debug test completed');
});