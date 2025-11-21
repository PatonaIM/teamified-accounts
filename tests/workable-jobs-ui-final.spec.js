const { test, expect } = require('@playwright/test');

test.describe('Jobs Page - Final UI Improvements', () => {
  test.beforeEach(async ({ page }) => {
    // Login as candidate user
    await page.goto('http://localhost');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'candidate@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should show Jobs in side navigation', async ({ page }) => {
    // Check for Jobs navigation item
    const jobsNav = page.getByRole('link', { name: /jobs/i });
    await expect(jobsNav).toBeVisible();
    
    // Verify it's positioned in the navigation
    const navItems = await page.locator('[role="navigation"] a, nav a, aside a').allTextContents();
    const hasJobs = navItems.some(text => /jobs/i.test(text));
    expect(hasJobs).toBe(true);
  });

  test('should navigate to Jobs page from sidebar', async ({ page }) => {
    // Click Jobs navigation item
    await page.click('text=Jobs');
    
    // Wait for jobs page to load
    await page.waitForURL(/.*\/jobs/, { timeout: 10000 });
    
    // Verify page loaded
    const heading = page.locator('h4, h5').filter({ hasText: /available positions|open positions|job opportunities/i });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display job cards with uniform 320px height', async ({ page }) => {
    // Navigate to jobs page
    await page.goto('http://localhost/jobs');
    await page.waitForLoadState('networkidle');
    
    // Wait for job cards to load
    const cards = page.locator('[data-testid="job-card"], .MuiCard-root').filter({
      has: page.locator('text=/view job/i')
    });
    
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    
    // Get all card heights
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} job cards`);
    
    if (cardCount > 0) {
      const heights = [];
      for (let i = 0; i < Math.min(6, cardCount); i++) {
        const box = await cards.nth(i).boundingBox();
        if (box) {
          heights.push(box.height);
          console.log(`Card ${i + 1} height: ${box.height}px`);
        }
      }
      
      // All cards should have the same height (320px with some tolerance for borders/margins)
      const firstHeight = heights[0];
      const allSameHeight = heights.every(h => Math.abs(h - firstHeight) < 5);
      expect(allSameHeight).toBe(true);
      
      // Height should be approximately 320px
      expect(firstHeight).toBeGreaterThanOrEqual(315);
      expect(firstHeight).toBeLessThanOrEqual(325);
    }
  });

  test('should display cards in responsive grid layout', async ({ page }) => {
    // Navigate to jobs page
    await page.goto('http://localhost/jobs');
    await page.waitForLoadState('networkidle');
    
    // Wait for job cards
    const cards = page.locator('[data-testid="job-card"], .MuiCard-root').filter({
      has: page.locator('text=/view job/i')
    });
    
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    
    const cardCount = await cards.count();
    console.log(`Total cards: ${cardCount}`);
    
    if (cardCount >= 3) {
      // Get positions of first 3 cards
      const box1 = await cards.nth(0).boundingBox();
      const box2 = await cards.nth(1).boundingBox();
      const box3 = await cards.nth(2).boundingBox();
      
      // On desktop (lg), cards should be in a row (3 columns)
      // Check if cards are horizontally aligned (same row)
      const sameRow = Math.abs(box1.y - box2.y) < 50;
      
      if (sameRow) {
        // Cards are in a row - verify grid layout
        console.log('Desktop layout detected - 3 columns');
        expect(box1.x).toBeLessThan(box2.x);
        expect(box2.x).toBeLessThan(box3.x);
      } else {
        // Cards are stacked - mobile/tablet layout
        console.log('Mobile/Tablet layout detected - stacked cards');
        expect(box1.y).toBeLessThan(box2.y);
      }
    }
  });

  test('should show dropdown filters with proper width (350px)', async ({ page }) => {
    // Navigate to jobs page
    await page.goto('http://localhost/jobs');
    await page.waitForLoadState('networkidle');
    
    // Click Filters button
    const filterButton = page.getByRole('button').filter({ hasText: /^Filters/ }).first();
    await filterButton.click();
    
    // Wait for filter panel
    await page.waitForSelector('label:has-text("Location"), label:has-text("Department")', { timeout: 5000 });
    
    // Click on Location dropdown
    await page.click('label:has-text("Location")');
    
    // Check if dropdown menu is visible and has proper width
    const dropdownMenu = page.locator('.MuiMenu-paper, .MuiPopover-paper').first();
    await expect(dropdownMenu).toBeVisible({ timeout: 3000 });
    
    const menuBox = await dropdownMenu.boundingBox();
    console.log(`Dropdown menu width: ${menuBox.width}px`);
    
    // Menu should be approximately 350px wide (with some tolerance)
    expect(menuBox.width).toBeGreaterThanOrEqual(340);
    expect(menuBox.width).toBeLessThanOrEqual(360);
  });

  test('should only show Location and Department filters (no Employment Type checkboxes)', async ({ page }) => {
    // Navigate to jobs page
    await page.goto('http://localhost/jobs');
    await page.waitForLoadState('networkidle');
    
    // Click Filters button
    const filterButton = page.getByRole('button').filter({ hasText: /^Filters/ }).first();
    await filterButton.click();
    
    // Wait for filter panel
    await page.waitForSelector('label:has-text("Location")', { timeout: 5000 });
    
    // Verify Location filter exists
    const locationFilter = page.locator('label:has-text("Location")');
    await expect(locationFilter).toBeVisible();
    
    // Verify Department filter exists
    const departmentFilter = page.locator('label:has-text("Department")');
    await expect(departmentFilter).toBeVisible();
    
    // Verify Employment Type section does NOT exist
    const employmentTypeLabel = page.locator('text=/employment type/i').first();
    await expect(employmentTypeLabel).not.toBeVisible();
    
    // Verify no checkboxes for Full Time, Part Time, Contract, Internship
    const fullTimeCheckbox = page.locator('text=/full time/i').and(page.locator('[type="checkbox"]'));
    await expect(fullTimeCheckbox).not.toBeVisible();
  });

  test('should display job cards with proper content structure', async ({ page }) => {
    // Navigate to jobs page
    await page.goto('http://localhost/jobs');
    await page.waitForLoadState('networkidle');
    
    // Wait for first job card
    const firstCard = page.locator('[data-testid="job-card"], .MuiCard-root').filter({
      has: page.locator('text=/view job/i')
    }).first();
    
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    
    // Verify card contains required elements
    // 1. Job title (should be truncated to 2 lines)
    const title = firstCard.locator('h2, h6, [role="heading"]').first();
    await expect(title).toBeVisible();
    
    // 2. Department icon and text
    const department = firstCard.getByText(/engineering|sales|marketing|support/i);
    if (await department.isVisible()) {
      console.log('Department found');
    }
    
    // 3. Location icon and text
    const location = firstCard.locator('text=/london|new york|remote|san francisco/i');
    if (await location.isVisible()) {
      console.log('Location found');
    }
    
    // 4. Posted date
    const postedDate = firstCard.locator('text=/posted/i');
    await expect(postedDate).toBeVisible();
    
    // 5. Employment type chip
    const chip = firstCard.locator('.MuiChip-root, [role="status"]');
    await expect(chip.first()).toBeVisible();
    
    // 6. View Job button at bottom
    const viewButton = firstCard.getByRole('link', { name: /view job/i });
    await expect(viewButton).toBeVisible();
  });
});

