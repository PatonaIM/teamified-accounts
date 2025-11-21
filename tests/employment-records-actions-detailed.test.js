const { test, expect } = require('@playwright/test');

test('Employment Records - Detailed actions test', async ({ page }) => {
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(`ERROR: ${msg.text()}`);
    }
  });

  // Login
  await page.goto('http://localhost:80');
  await page.fill('input[name="email"]', 'user1@teamified.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navigate to Employment Records
  await page.click('text=Employment Records');
  await page.waitForURL('**/employment-records', { timeout: 10000 });
  
  // Wait for page to fully load
  await page.waitForTimeout(3000);
  
  console.log('✓ Page loaded');
  
  // Find the three-dot menu button in the Actions column
  // The Actions column is the last cell in each row
  const firstRowActionButton = page.locator('tbody tr:first-child td:last-child button').first();
  
  const buttonExists = await firstRowActionButton.count() > 0;
  console.log(`Three-dot button exists: ${buttonExists}`);
  
  if (buttonExists) {
    // Check button properties
    const isVisible = await firstRowActionButton.isVisible();
    const isEnabled = await firstRowActionButton.isEnabled();
    
    console.log(`Button visible: ${isVisible}`);
    console.log(`Button enabled: ${isEnabled}`);
    
    // Get button HTML for debugging
    const buttonHtml = await firstRowActionButton.evaluate(el => el.outerHTML);
    console.log(`Button HTML: ${buttonHtml.substring(0, 200)}`);
    
    // Scroll button into view
    await firstRowActionButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Highlight the button (for debugging)
    await firstRowActionButton.evaluate(el => {
      el.style.border = '3px solid red';
    });
    
    await page.waitForTimeout(500);
    
    // Click the button
    console.log('Clicking three-dot button...');
    await firstRowActionButton.click({ force: false });
    
    // Wait for menu to appear
    await page.waitForTimeout(1500);
    
    // Check for menu
    const menu = page.locator('[role="menu"]');
    const menuCount = await menu.count();
    console.log(`Menus in DOM: ${menuCount}`);
    
    if (menuCount > 0) {
      const menuVisible = await menu.first().isVisible();
      console.log(`Menu visible: ${menuVisible}`);
      
      if (menuVisible) {
        console.log('✓✓✓ Menu opened successfully! ✓✓✓');
        
        // Check for menu items
        const menuItems = await page.locator('[role="menuitem"]').allTextContents();
        console.log(`Menu items: ${menuItems.join(', ')}`);
        
        // Close menu by clicking elsewhere
        await page.click('body');
        await page.waitForTimeout(500);
        
      } else {
        console.log('✗ Menu exists in DOM but is NOT visible');
        
        // Get menu CSS
        const menuStyle = await menu.first().evaluate(el => ({
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility,
          opacity: window.getComputedStyle(el).opacity,
          zIndex: window.getComputedStyle(el).zIndex,
          position: window.getComputedStyle(el).position,
          top: window.getComputedStyle(el).top,
          left: window.getComputedStyle(el).left,
        }));
        console.log('Menu CSS:', JSON.stringify(menuStyle, null, 2));
      }
    } else {
      console.log('✗ No menu found in DOM after click');
      
      // Check if anchorEl state is set
      const stateDebug = await page.evaluate(() => {
        // Try to find React state
        return 'State inspection not available';
      });
      console.log(stateDebug);
    }
  } else {
    console.log('✗ Three-dot button not found');
  }
  
  // Report console errors
  if (consoleMessages.length > 0) {
    console.log('\n❌ Console Errors:');
    consoleMessages.forEach(msg => console.log(`  ${msg}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/employment-actions-debug.png', 
    fullPage: true 
  });
  
  console.log('\nScreenshot: test-results/employment-actions-debug.png');
});
