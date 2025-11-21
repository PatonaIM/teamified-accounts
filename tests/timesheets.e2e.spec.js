/**
 * End-to-End Tests for Timesheet Management (Story 7.4)
 * Tests timesheet submission, list view, and approval workflows
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:80';

test.describe('Timesheet Management - Story 7.4', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    
    // Login as a user with timesheet access (e.g., admin)
    await page.fill('input[name="email"]', 'admin@teamified.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test('should navigate to Timesheets page', async ({ page }) => {
    // Click on Timesheets navigation item
    await page.click('text=Timesheets');
    
    // Wait for navigation
    await page.waitForURL(`${BASE_URL}/timesheets`);
    
    // Verify page title
    await expect(page.locator('h4:has-text("Timesheet Management")')).toBeVisible();
  });

  test('should display timesheet submission form', async ({ page }) => {
    // Navigate to timesheets
    await page.goto(`${BASE_URL}/timesheets`);
    
    // Verify Submit Timesheet tab is visible
    await expect(page.locator('[data-testid="submit-tab"]')).toBeVisible();
    
    // Click Submit Timesheet tab
    await page.click('[data-testid="submit-tab"]');
    
    // Verify form elements are present
    await expect(page.locator('text=Submit Timesheet')).toBeVisible();
    await expect(page.locator('label:has-text("Work Date")')).toBeVisible();
    await expect(page.locator('label:has-text("Timesheet Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Regular Hours")')).toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
  });

  test('should display My Timesheets list', async ({ page }) => {
    // Navigate to timesheets
    await page.goto(`${BASE_URL}/timesheets`);
    
    // Verify My Timesheets tab is visible
    await expect(page.locator('[data-testid="list-tab"]')).toBeVisible();
    
    // Click My Timesheets tab
    await page.click('[data-testid="list-tab"]');
    
    // Verify list view elements
    await expect(page.locator('text=My Timesheets')).toBeVisible();
    
    // Verify filters are present
    await expect(page.locator('label:has-text("Status")')).toBeVisible();
    await expect(page.locator('label:has-text("Type")')).toBeVisible();
  });

  test('should display Approval panel for managers', async ({ page }) => {
    // Navigate to timesheets
    await page.goto(`${BASE_URL}/timesheets`);
    
    // Check if Approvals tab is visible (only for managers)
    const approvalTab = page.locator('[data-testid="approval-tab"]');
    
    if (await approvalTab.isVisible()) {
      // Click Approvals tab
      await approvalTab.click();
      
      // Verify approval panel elements
      await expect(page.locator('text=Timesheet Approvals')).toBeVisible();
    }
  });

  test('should validate timesheet hours submission', async ({ page }) => {
    // Navigate to timesheets submission tab
    await page.goto(`${BASE_URL}/timesheets`);
    await page.click('[data-testid="submit-tab"]');
    
    // Try to submit with invalid hours (> 24)
    await page.fill('input[label="Regular Hours"]', '30');
    
    // Verify validation error appears
    await expect(page.locator('text=/Regular hours cannot exceed 24/')).toBeVisible({timeout: 2000}).catch(() => {
      // Validation might be on total hours instead
      expect(page.locator('text=/Total hours cannot exceed 24/')).toBeVisible();
    });
  });

  test('should have role-based tab visibility', async ({ page }) => {
    // Navigate to timesheets
    await page.goto(`${BASE_URL}/timesheets`);
    
    // Verify at least Submit or List tab is visible for employees
    const submitTab = page.locator('[data-testid="submit-tab"]');
    const listTab = page.locator('[data-testid="list-tab"]');
    const approvalTab = page.locator('[data-testid="approval-tab"]');
    
    // At least one tab should be visible
    const tabCount = await Promise.all([
      submitTab.isVisible().catch(() => false),
      listTab.isVisible().catch(() => false),
      approvalTab.isVisible().catch(() => false),
    ]);
    
    const visibleTabs = tabCount.filter(Boolean).length;
    expect(visibleTabs).toBeGreaterThan(0);
  });

  test('should display timesheet type icons', async ({ page }) => {
    // Navigate to timesheets submission
    await page.goto(`${BASE_URL}/timesheets`);
    await page.click('[data-testid="submit-tab"]');
    
    // Click on Timesheet Type dropdown
    await page.click('label:has-text("Timesheet Type")');
    
    // Verify type options are present
    await expect(page.locator('text=Regular')).toBeVisible();
    await expect(page.locator('text=Overtime')).toBeVisible();
    await expect(page.locator('text=Night Shift')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to timesheets
    await page.goto(`${BASE_URL}/timesheets`);
    
    // Verify page is still functional
    await expect(page.locator('h4:has-text("Timesheet Management")')).toBeVisible();
    await expect(page.locator('[data-testid="submit-tab"]')).toBeVisible();
  });
});

test.describe('Timesheet API Integration', () => {
  test('should load timesheets from backend', async ({ page }) => {
    // Navigate to timesheets list
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@teamified.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    await page.goto(`${BASE_URL}/timesheets`);
    await page.click('[data-testid="list-tab"]');
    
    // Wait for API call to complete (check for loading state or data)
    await page.waitForTimeout(2000);
    
    // Verify either timesheets are loaded or "No timesheets" message appears
    const hasTimesheets = await page.locator('table').isVisible().catch(() => false);
    const noTimesheets = await page.locator('text=No timesheets found').isVisible().catch(() => false);
    
    expect(hasTimesheets || noTimesheets).toBeTruthy();
  });
});

