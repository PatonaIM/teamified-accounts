import { test, expect } from '@playwright/test';

test.describe('Payroll Components Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@teamified.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display salary components tab in payroll configuration', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="salary-components-tab"]');
    
    // Check that the salary components tab is visible
    await expect(page.locator('[data-testid="salary-components-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="salary-components-tab"]')).toContainText('Salary Components');
  });

  test('should display statutory components tab in payroll configuration', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="statutory-components-tab"]');
    
    // Check that the statutory components tab is visible
    await expect(page.locator('[data-testid="statutory-components-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="statutory-components-tab"]')).toContainText('Statutory Components');
  });

  test('should switch to salary components tab and show configuration interface', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the salary components config to load
    await page.waitForSelector('[data-testid="create-salary-component-button"]');
    
    // Check that the salary components interface is visible
    await expect(page.locator('[data-testid="create-salary-component-button"]')).toBeVisible();
    await expect(page.locator('text=Salary Components Configuration')).toBeVisible();
  });

  test('should switch to statutory components tab and show configuration interface', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the statutory components config to load
    await page.waitForSelector('[data-testid="create-statutory-component-button"]');
    
    // Check that the statutory components interface is visible
    await expect(page.locator('[data-testid="create-statutory-component-button"]')).toBeVisible();
    await expect(page.locator('text=Statutory Components Configuration')).toBeVisible();
  });

  test('should open salary component creation form', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="create-salary-component-button"]');
    
    // Click create button
    await page.click('[data-testid="create-salary-component-button"]');
    
    // Check that the form dialog opens
    await expect(page.locator('text=Create Salary Component')).toBeVisible();
    await expect(page.locator('[data-testid="component-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="component-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="calculation-type"]')).toBeVisible();
  });

  test('should open statutory component creation form', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="create-statutory-component-button"]');
    
    // Click create button
    await page.click('[data-testid="create-statutory-component-button"]');
    
    // Check that the form dialog opens
    await expect(page.locator('text=Create Statutory Component')).toBeVisible();
    await expect(page.locator('[data-testid="component-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="component-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="contribution-type"]')).toBeVisible();
  });

  test('should validate salary component form fields', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="create-salary-component-button"]');
    
    // Click create button
    await page.click('[data-testid="create-salary-component-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="submit-button"]');
    
    // Check that validation errors appear (form should not submit)
    await expect(page.locator('text=Create Salary Component')).toBeVisible();
  });

  test('should validate statutory component form fields', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="create-statutory-component-button"]');
    
    // Click create button
    await page.click('[data-testid="create-statutory-component-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="submit-button"]');
    
    // Check that validation errors appear (form should not submit)
    await expect(page.locator('text=Create Statutory Component')).toBeVisible();
  });

  test('should show earnings tab in salary components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="earnings-tab"]');
    
    // Check that earnings tab is visible
    await expect(page.locator('[data-testid="earnings-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="earnings-tab"]')).toContainText('Earnings');
  });

  test('should show deductions tab in salary components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="deductions-tab"]');
    
    // Check that deductions tab is visible
    await expect(page.locator('[data-testid="deductions-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="deductions-tab"]')).toContainText('Deductions');
  });

  test('should show benefits tab in salary components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="benefits-tab"]');
    
    // Check that benefits tab is visible
    await expect(page.locator('[data-testid="benefits-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="benefits-tab"]')).toContainText('Benefits');
  });

  test('should show reimbursements tab in salary components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="reimbursements-tab"]');
    
    // Check that reimbursements tab is visible
    await expect(page.locator('[data-testid="reimbursements-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="reimbursements-tab"]')).toContainText('Reimbursements');
  });

  test('should show EPF tab in statutory components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="epf-tab"]');
    
    // Check that EPF tab is visible
    await expect(page.locator('[data-testid="epf-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="epf-tab"]')).toContainText('EPF');
  });

  test('should show ESI tab in statutory components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="esi-tab"]');
    
    // Check that ESI tab is visible
    await expect(page.locator('[data-testid="esi-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="esi-tab"]')).toContainText('ESI');
  });

  test('should show SSS tab in statutory components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="sss-tab"]');
    
    // Check that SSS tab is visible
    await expect(page.locator('[data-testid="sss-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="sss-tab"]')).toContainText('SSS');
  });

  test('should show PhilHealth tab in statutory components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="philhealth-tab"]');
    
    // Check that PhilHealth tab is visible
    await expect(page.locator('[data-testid="philhealth-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="philhealth-tab"]')).toContainText('PhilHealth');
  });

  test('should show Pag-IBIG tab in statutory components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="pagibig-tab"]');
    
    // Check that Pag-IBIG tab is visible
    await expect(page.locator('[data-testid="pagibig-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagibig-tab"]')).toContainText('Pag-IBIG');
  });

  test('should show Superannuation tab in statutory components', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="superannuation-tab"]');
    
    // Check that Superannuation tab is visible
    await expect(page.locator('[data-testid="superannuation-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="superannuation-tab"]')).toContainText('Superannuation');
  });

  test('should close form dialog when cancel is clicked', async ({ page }) => {
    // Navigate to payroll configuration
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Wait for the interface to load
    await page.waitForSelector('[data-testid="create-salary-component-button"]');
    
    // Click create button
    await page.click('[data-testid="create-salary-component-button"]');
    
    // Click cancel button
    await page.click('text=Cancel');
    
    // Check that the dialog is closed
    await expect(page.locator('text=Create Salary Component')).not.toBeVisible();
  });

  test('should show country selection message when no country is selected', async ({ page }) => {
    // Navigate to payroll configuration without selecting a country
    await page.goto('/payroll-configuration');
    
    // Click on salary components tab
    await page.click('[data-testid="salary-components-tab"]');
    
    // Check that the country selection message is shown
    await expect(page.locator('text=Please select a country to configure salary components')).toBeVisible();
  });

  test('should show country selection message for statutory components when no country is selected', async ({ page }) => {
    // Navigate to payroll configuration without selecting a country
    await page.goto('/payroll-configuration');
    
    // Click on statutory components tab
    await page.click('[data-testid="statutory-components-tab"]');
    
    // Check that the country selection message is shown
    await expect(page.locator('text=Please select a country to configure statutory components')).toBeVisible();
  });
});
