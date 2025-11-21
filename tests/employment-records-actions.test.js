const { test, expect } = require('@playwright/test');

test('Employment Records - Test all actions', async ({ page }) => {
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
  await page.waitForTimeout(2000);
  
  console.log('✓ Page loaded');
  
  // Check if "Add Record" button exists and is clickable
  const addButton = page.locator('button:has-text("Add Record")');
  await expect(addButton).toBeVisible({ timeout: 5000 });
  console.log('✓ "Add Record" button is visible');
  
  // Click "Add Record" button
  await addButton.click();
  await page.waitForTimeout(1000);
  
  // Check if form/dialog opens
  const dialogTitle = page.locator('h2:has-text("Add Employment Record"), h2:has-text("Create Employment Record"), h6:has-text("Add Employment Record"), h6:has-text("Create Employment Record")');
  const isDialogVisible = await dialogTitle.isVisible().catch(() => false);
  
  if (isDialogVisible) {
    console.log('✓ Add Record dialog opened');
    // Close dialog
    const cancelButton = page.locator('button:has-text("Cancel")');
    if (await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log('✗ Add Record dialog did NOT open - checking console for errors');
  }
  
  // Check for employment records table
  await page.waitForTimeout(1000);
  
  // Look for actions column/buttons in the table
  const actionButtons = page.locator('button[aria-label*="Actions"], button:has-text("Actions"), [role="button"]:has-text("Actions"), .MuiDataGrid-row button, .MuiIconButton-root');
  const actionCount = await actionButtons.count();
  
  console.log(`Found ${actionCount} potential action buttons`);
  
  if (actionCount > 0) {
    // Try clicking the first action button
    try {
      const firstActionButton = actionButtons.first();
      await firstActionButton.scrollIntoViewIfNeeded();
      await firstActionButton.click();
      await page.waitForTimeout(1000);
      
      // Check if menu/dialog opened
      const menuOpened = await page.locator('[role="menu"], [role="dialog"]').isVisible().catch(() => false);
      
      if (menuOpened) {
        console.log('✓ Action menu opened');
        
        // Look for edit/view/delete options
        const editOption = page.locator('text=Edit, text=View, text=Delete').first();
        if (await editOption.isVisible().catch(() => false)) {
          console.log('✓ Action options found');
        }
      } else {
        console.log('✗ Action menu did NOT open after clicking action button');
      }
    } catch (error) {
      console.log('✗ Error clicking action button:', error.message);
    }
  } else {
    console.log('✗ No action buttons found in the table');
  }
  
  // Check console for errors
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });
  
  await page.waitForTimeout(1000);
  
  if (logs.length > 0) {
    console.log('\n❌ Console Errors:');
    logs.forEach(log => console.log('  -', log));
  } else {
    console.log('\n✓ No console errors detected');
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/employment-records-actions-test.png', 
    fullPage: true 
  });
  
  console.log('\nScreenshot saved to test-results/employment-records-actions-test.png');
});
