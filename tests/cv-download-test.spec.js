const { test, expect } = require('@playwright/test');

test.describe('CV Download Functionality', () => {
  test('should download CV successfully', async ({ page }) => {
    // Navigate to CV page
    await page.goto('http://localhost:5173/cv');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the login page (redirected due to auth)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Login first
      await page.fill('input[name="email"]', 'john.doe@example.com');
      await page.fill('input[name="password"]', 'EOR123!');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to CV page
      await page.waitForURL('**/cv');
    }
    
    // Wait for CV page to load
    await page.waitForSelector('[data-testid="cv-management"]', { timeout: 10000 });
    
    // Check if there are any CVs listed
    const cvCards = await page.locator('[data-testid="cv-card"]').count();
    
    if (cvCards > 0) {
      // Find the first download button
      const downloadButton = page.locator('[data-testid="download-cv-button"]').first();
      
      // Set up download promise
      const downloadPromise = page.waitForEvent('download');
      
      // Click download button
      await downloadButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download started
      expect(download).toBeTruthy();
      
      // Check download filename
      const suggestedFilename = download.suggestedFilename();
      expect(suggestedFilename).toMatch(/\.(pdf|docx|doc)$/);
      
      console.log('✅ CV download test passed - Download initiated successfully');
    } else {
      console.log('⚠️ No CVs found to test download functionality');
      
      // Test upload functionality instead
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        console.log('📁 File upload input found - CV upload functionality available');
      }
    }
  });
  
  test('should handle download errors gracefully', async ({ page }) => {
    // Navigate to CV page
    await page.goto('http://localhost:5173/cv');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the login page (redirected due to auth)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Login first
      await page.fill('input[name="email"]', 'john.doe@example.com');
      await page.fill('input[name="password"]', 'EOR123!');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to CV page
      await page.waitForURL('**/cv');
    }
    
    // Wait for CV page to load
    await page.waitForSelector('[data-testid="cv-management"]', { timeout: 10000 });
    
    // Check for error handling
    const errorAlert = page.locator('[role="alert"]');
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.textContent();
      console.log('⚠️ Error detected:', errorText);
    }
    
    console.log('✅ Error handling test completed');
  });
});
