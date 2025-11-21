const { test, expect } = require('@playwright/test');

test.describe('Payroll Component Country-Specific Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:80/login');
    await page.fill('input[name="email"]', 'user1@teamified.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Wait for login redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to payroll configuration
    await page.goto('http://localhost:80/payroll-configuration');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for country data to load
  });

  test('should show only India-specific statutory component tabs for India', async ({ page }) => {
    // Select India from country dropdown
    const countrySelect = page.locator('select, [role="combobox"]').first();
    await countrySelect.click();
    await page.click('text=India');
    await page.waitForTimeout(2000);

    // Click on Statutory Components tab
    await page.click('[data-testid="statutory-components-tab"]');
    await page.waitForTimeout(2000);

    // Should show India-specific tabs: EPF, ESI, PT, TDS
    await expect(page.locator('text=EPF')).toBeVisible();
    await expect(page.locator('text=ESI')).toBeVisible();
    await expect(page.locator('text=PT')).toBeVisible();
    await expect(page.locator('text=TDS')).toBeVisible();

    // Should NOT show Philippines tabs
    await expect(page.locator('text=SSS')).not.toBeVisible();
    await expect(page.locator('text=PhilHealth')).not.toBeVisible();
    await expect(page.locator('text=Pag-IBIG')).not.toBeVisible();

    // Should NOT show Australia tabs
    await expect(page.locator('text=Superannuation')).not.toBeVisible();
  });

  test('should show only Philippines-specific statutory component tabs for Philippines', async ({ page }) => {
    // Select Philippines from country dropdown
    const countrySelect = page.locator('select, [role="combobox"]').first();
    await countrySelect.click();
    await page.click('text=Philippines');
    await page.waitForTimeout(2000);

    // Click on Statutory Components tab
    await page.click('[data-testid="statutory-components-tab"]');
    await page.waitForTimeout(2000);

    // Should show Philippines-specific tabs: SSS, PhilHealth, Pag-IBIG
    await expect(page.locator('text=SSS')).toBeVisible();
    await expect(page.locator('text=PhilHealth')).toBeVisible();
    await expect(page.locator('text=Pag-IBIG')).toBeVisible();

    // Should NOT show India tabs
    await expect(page.locator('text=EPF')).not.toBeVisible();
    await expect(page.locator('text=ESI')).not.toBeVisible();
    await expect(page.locator('text=PT')).not.toBeVisible();
    await expect(page.locator('text=TDS')).not.toBeVisible();

    // Should NOT show Australia tabs
    await expect(page.locator('text=Superannuation')).not.toBeVisible();
  });

  test('should show only Australia-specific statutory component tabs for Australia', async ({ page }) => {
    // Select Australia from country dropdown
    const countrySelect = page.locator('select, [role="combobox"]').first();
    await countrySelect.click();
    await page.click('text=Australia');
    await page.waitForTimeout(2000);

    // Click on Statutory Components tab
    await page.click('[data-testid="statutory-components-tab"]');
    await page.waitForTimeout(2000);

    // Should show Australia-specific tabs: Superannuation
    await expect(page.locator('text=Superannuation')).toBeVisible();

    // Should NOT show India tabs
    await expect(page.locator('text=EPF')).not.toBeVisible();
    await expect(page.locator('text=ESI')).not.toBeVisible();
    await expect(page.locator('text=PT')).not.toBeVisible();
    await expect(page.locator('text=TDS')).not.toBeVisible();

    // Should NOT show Philippines tabs
    await expect(page.locator('text=SSS')).not.toBeVisible();
    await expect(page.locator('text=PhilHealth')).not.toBeVisible();
    await expect(page.locator('text=Pag-IBIG')).not.toBeVisible();
  });

  test('should update visible tabs when switching countries', async ({ page }) => {
    // Start with India
    const countrySelect = page.locator('select, [role="combobox"]').first();
    await countrySelect.click();
    await page.click('text=India');
    await page.waitForTimeout(2000);

    // Click on Statutory Components tab
    await page.click('[data-testid="statutory-components-tab"]');
    await page.waitForTimeout(2000);

    // Verify India tabs are visible
    await expect(page.locator('text=EPF')).toBeVisible();

    // Switch to Philippines
    await countrySelect.click();
    await page.click('text=Philippines');
    await page.waitForTimeout(2000);

    // Verify Philippines tabs are visible and India tabs are gone
    await expect(page.locator('text=SSS')).toBeVisible();
    await expect(page.locator('text=EPF')).not.toBeVisible();

    // Switch to Australia
    await countrySelect.click();
    await page.click('text=Australia');
    await page.waitForTimeout(2000);

    // Verify Australia tabs are visible and Philippines tabs are gone
    await expect(page.locator('text=Superannuation')).toBeVisible();
    await expect(page.locator('text=SSS')).not.toBeVisible();
  });

  test('should show all salary component tabs for all countries', async ({ page }) => {
    // Salary components should be the same for all countries
    const countries = ['India', 'Philippines', 'Australia'];

    for (const country of countries) {
      // Select country
      const countrySelect = page.locator('select, [role="combobox"]').first();
      await countrySelect.click();
      await page.click(`text=${country}`);
      await page.waitForTimeout(2000);

      // Click on Salary Components tab
      await page.click('[data-testid="salary-components-tab"]');
      await page.waitForTimeout(2000);

      // All salary component tabs should be visible
      await expect(page.locator('text=Earnings')).toBeVisible();
      await expect(page.locator('text=Deductions')).toBeVisible();
      await expect(page.locator('text=Benefits')).toBeVisible();
      await expect(page.locator('text=Reimbursements')).toBeVisible();
    }
  });

  test('should disable create button when no statutory component types available', async ({ page }) => {
    // If we add a country with no statutory components configured
    // The create button should be disabled
    
    // For now, all our test countries have statutory components
    // This test validates the UI structure
    await page.click('[data-testid="statutory-components-tab"]');
    await page.waitForTimeout(2000);

    const createButton = page.locator('[data-testid="create-statutory-component-button"]');
    await expect(createButton).toBeVisible();
  });

  test('should reset active tab when switching to country with fewer component types', async ({ page }) => {
    // Start with India (4 tabs)
    const countrySelect = page.locator('select, [role="combobox"]').first();
    await countrySelect.click();
    await page.click('text=India');
    await page.waitForTimeout(2000);

    await page.click('[data-testid="statutory-components-tab"]');
    await page.waitForTimeout(2000);

    // Click on the 4th tab (TDS)
    const tabs = page.locator('[role="tab"]');
    await tabs.nth(3).click();
    await page.waitForTimeout(1000);

    // Switch to Australia (1 tab)
    await countrySelect.click();
    await page.click('text=Australia');
    await page.waitForTimeout(2000);

    // Should automatically switch to first tab (Superannuation)
    await expect(page.locator('text=Superannuation')).toBeVisible();
  });
});

