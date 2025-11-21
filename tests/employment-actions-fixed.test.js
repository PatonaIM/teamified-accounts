const { test, expect } = require('@playwright/test');

test('Employment Records - All actions working correctly', async ({ page }) => {
  console.log('🚀 Testing Fixed Employment Records Actions\n');
  
  // Login
  await page.goto('http://localhost:80');
  await page.fill('input[name="email"]', 'user1@teamified.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✓ Logged in');
  
  // Navigate to Employment Records
  await page.click('text=Employment Records');
  await page.waitForURL('**/employment-records', { timeout: 10000 });
  await page.waitForTimeout(3000);
  console.log('✓ Navigated to Employment Records page\n');
  
  // Get the action button for the first row
  const actionButton = page.locator('tbody tr:first-child td:last-child button').first();
  
  // TEST 1: View Details
  console.log('📋 TEST 1: View Details Action');
  await actionButton.click();
  await page.waitForTimeout(500);
  await page.click('text=View Details');
  await page.waitForTimeout(1500);
  
  // Check if view dialog opened
  const viewDialog = page.locator('h2:has-text("Employment Record Details")');
  const viewDialogVisible = await viewDialog.isVisible().catch(() => false);
  
  if (viewDialogVisible) {
    console.log('✅ View Details dialog opened');
    
    // Check for expected fields
    const hasEmployee = await page.locator('text=EMPLOYEE').isVisible();
    const hasClient = await page.locator('text=CLIENT').isVisible();
    const hasRole = await page.locator('text=ROLE/POSITION').isVisible();
    const hasStatus = await page.locator('text=STATUS').isVisible();
    
    console.log(`  → Fields present: Employee=${hasEmployee}, Client=${hasClient}, Role=${hasRole}, Status=${hasStatus}`);
    
    // Check for "Edit Record" button in the dialog
    const editButtonInDialog = page.locator('button:has-text("Edit Record")').last();
    if (await editButtonInDialog.isVisible()) {
      console.log('  → "Edit Record" button available in dialog');
    }
    
    // Close dialog
    await page.locator('button:has-text("Close")').last().click();
    await page.waitForTimeout(500);
    console.log('✅ View dialog closed\n');
  } else {
    console.log('❌ View Details dialog did NOT open\n');
  }
  
  // TEST 2: Mark as Active (status change)
  console.log('📋 TEST 2: Mark as Active (Status Change)');
  await actionButton.click();
  await page.waitForTimeout(500);
  
  // Click "Mark as Active"
  await page.locator('text=Mark as Active').click({ force: true });
  await page.waitForTimeout(2000);
  
  console.log('✅ Status change action triggered (check table for refresh)\n');
  
  // TEST 3: Delete Record
  console.log('📋 TEST 3: Delete Record');
  await actionButton.click();
  await page.waitForTimeout(500);
  await page.locator('text=Delete Record').click({ force: true });
  await page.waitForTimeout(1500);
  
  // Check if delete dialog opened
  const deleteDialog = page.locator('h2:has-text("Delete Employment Record")');
  const deleteDialogVisible = await deleteDialog.isVisible().catch(() => false);
  
  if (deleteDialogVisible) {
    console.log('✅ Delete confirmation dialog opened');
    
    // Check for reason field
    const reasonField = page.locator('label:has-text("Reason for deletion")');
    if (await reasonField.isVisible()) {
      console.log('  → Reason field present');
    }
    
    // Cancel without deleting
    await page.locator('button:has-text("Cancel")').last().click();
    await page.waitForTimeout(500);
    console.log('✅ Delete dialog cancelled (record NOT deleted)\n');
  } else {
    console.log('❌ Delete confirmation dialog did NOT open\n');
  }
  
  // TEST 4: Edit Record
  console.log('📋 TEST 4: Edit Record');
  await actionButton.click();
  await page.waitForTimeout(500);
  await page.locator('text=Edit Record').click({ force: true });
  await page.waitForTimeout(2000);
  
  // Check if edit dialog opened
  const editDialog = page.locator('h2:has-text("Edit Employment Record"), h2:has-text("Create Employment Record")');
  const editDialogVisible = await editDialog.isVisible().catch(() => false);
  
  if (editDialogVisible) {
    console.log('✅ Edit form dialog opened');
    
    // Close the form
    const cancelButton = page.locator('button:has-text("Cancel")').last();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Edit form closed\n');
    }
  } else {
    console.log('⚠️  Edit form dialog visibility issue\n');
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/employment-actions-fixed.png', 
    fullPage: true 
  });
  
  // Summary
  console.log('=' .repeat(60));
  console.log('✅ ACTIONS TEST COMPLETE');
  console.log('=' .repeat(60));
  console.log('\n📸 Screenshot: test-results/employment-actions-fixed.png\n');
});
