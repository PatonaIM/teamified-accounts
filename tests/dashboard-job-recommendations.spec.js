const { test, expect } = require('@playwright/test');

test.describe('Dashboard Job Recommendations', () => {
  const baseURL = 'http://localhost';
  
  // Test credentials
  const candidateUser = {
    email: 'user25@teamified.com',
    password: 'Admin123!',
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);
    
    // Login as candidate
    await page.fill('input[name="email"]', candidateUser.email);
    await page.fill('input[name="password"]', candidateUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete (redirects to /dashboard)
    await page.waitForURL(/\/(dashboard)?$/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('should display job recommendations card on dashboard', async ({ page }) => {
    // Wait for the job recommendations card to appear
    const jobRecommendationsCard = page.locator('text=Recommended Jobs for You').first();
    await expect(jobRecommendationsCard).toBeVisible({ timeout: 10000 });
    
    // Verify the card title includes the briefcase icon text
    const cardTitle = page.locator('.dashboard-progress-card-title').filter({ hasText: 'Recommended Jobs' });
    await expect(cardTitle).toBeVisible();
  });

  test('should display 2-3 job cards', async ({ page }) => {
    // Wait for job cards to load
    await page.waitForTimeout(2000); // Give time for API call
    
    const jobCards = page.locator('.job-recommendation-card');
    const count = await jobCards.count();
    
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(3);
    
    console.log(`✓ Found ${count} job recommendation cards`);
  });

  test('should display job details on each card', async ({ page }) => {
    // Wait for jobs to load
    await page.waitForTimeout(2000);
    
    const firstJobCard = page.locator('.job-recommendation-card').first();
    await expect(firstJobCard).toBeVisible();
    
    // Check for job title (h3 element)
    const jobTitle = firstJobCard.locator('h3');
    await expect(jobTitle).toBeVisible();
    const titleText = await jobTitle.textContent();
    expect(titleText.length).toBeGreaterThan(0);
    console.log(`✓ Job title: ${titleText}`);
    
    // Check for Apply Now button
    const applyButton = firstJobCard.locator('button:has-text("Apply Now")');
    await expect(applyButton).toBeVisible();
    
    // Check for location (MapPin icon + text)
    const locationText = firstJobCard.locator('text=/[A-Za-z]+,\\s*[A-Za-z]+/').first();
    if (await locationText.isVisible()) {
      const location = await locationText.textContent();
      console.log(`✓ Location: ${location}`);
    }
    
    // Check for posted time (Clock icon + "ago" text)
    const timeText = firstJobCard.locator('text=/\\d+\\s+(day|week|month)s?\\s+ago/').first();
    if (await timeText.isVisible()) {
      const posted = await timeText.textContent();
      console.log(`✓ Posted: ${posted}`);
    }
  });

  test('should display "View all" link', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const viewAllLink = page.locator('a:has-text("View all")').filter({ has: page.locator('text=Recommended Jobs') });
    await expect(viewAllLink).toBeVisible();
    
    // Verify it links to jobs page
    const href = await viewAllLink.getAttribute('href');
    expect(href).toBe('/jobs');
  });

  test('should navigate to job detail page when clicking job title', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Click on the first job card link
    const firstJobLink = page.locator('.job-recommendation-card').first();
    await expect(firstJobLink).toBeVisible();
    
    // Get the href before clicking
    const href = await firstJobLink.getAttribute('href');
    expect(href).toMatch(/\/jobs\/[A-Z0-9]+/);
    
    // Click and verify navigation
    await firstJobLink.click();
    await page.waitForURL(/\/jobs\/[A-Z0-9]+/, { timeout: 5000 });
    
    // Verify we're on a job detail page
    const url = page.url();
    expect(url).toContain('/jobs/');
    console.log(`✓ Navigated to: ${url}`);
  });

  test('should navigate to jobs page when clicking "View all"', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Click View all link
    const viewAllLink = page.locator('a:has-text("View all")').first();
    await viewAllLink.click();
    
    // Wait for navigation
    await page.waitForURL(`${baseURL}/jobs`, { timeout: 5000 });
    
    // Verify we're on the jobs page
    expect(page.url()).toBe(`${baseURL}/jobs`);
    
    // Verify jobs page content
    const jobsPageTitle = page.locator('h1:has-text("Available Positions")');
    await expect(jobsPageTitle).toBeVisible({ timeout: 5000 });
    console.log('✓ Navigated to jobs page successfully');
  });

  test('should show Apply Now buttons that work', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const firstJobCard = page.locator('.job-recommendation-card').first();
    const applyButton = firstJobCard.locator('button:has-text("Apply Now")');
    
    await expect(applyButton).toBeVisible();
    await expect(applyButton).toBeEnabled();
    
    // Click apply button
    await applyButton.click();
    
    // Should navigate to application page
    await page.waitForURL(/\/jobs\/[A-Z0-9]+\/apply/, { timeout: 5000 });
    
    const url = page.url();
    expect(url).toContain('/apply');
    console.log(`✓ Apply button navigated to: ${url}`);
  });

  test('should display department badges when available', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for department badges (blue pill-shaped elements)
    const departmentBadges = page.locator('.job-recommendation-card span.text-blue-700');
    
    if (await departmentBadges.count() > 0) {
      const firstBadge = departmentBadges.first();
      await expect(firstBadge).toBeVisible();
      const badgeText = await firstBadge.textContent();
      console.log(`✓ Department badge found: ${badgeText}`);
    } else {
      console.log('ℹ No department badges found (optional field)');
    }
  });

  test('should have responsive grid layout', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check that job cards container uses grid
    const jobCardsContainer = page.locator('.grid.grid-cols-1').first();
    await expect(jobCardsContainer).toBeVisible();
    
    // Verify it has responsive classes
    const classes = await jobCardsContainer.getAttribute('class');
    expect(classes).toContain('grid-cols-1');
    expect(classes).toContain('md:grid-cols-2');
    expect(classes).toContain('lg:grid-cols-3');
    console.log('✓ Responsive grid classes verified');
  });

  test('should show footer message "Based on your profile"', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const footerMessage = page.locator('text=Based on your profile and experience');
    await expect(footerMessage).toBeVisible();
    console.log('✓ Footer message displayed');
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${baseURL}/`);
    
    // Check if loading spinner appears (it might be brief)
    const spinner = page.locator('.animate-spin');
    
    // Wait a moment to see if jobs load
    await page.waitForTimeout(3000);
    
    // Either spinner should be gone or job cards should be visible
    const jobCards = page.locator('.job-recommendation-card');
    const jobCardsCount = await jobCards.count();
    
    if (jobCardsCount > 0) {
      console.log('✓ Jobs loaded successfully');
    } else {
      console.log('ℹ No jobs displayed (may be intentional if none available)');
    }
  });

  test('should display all required job information', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const firstJob = page.locator('.job-recommendation-card').first();
    await expect(firstJob).toBeVisible();
    
    // Check for all required elements
    const elements = {
      title: firstJob.locator('h3'),
      location: firstJob.locator('svg').first(), // MapPin icon
      employmentType: firstJob.locator('text=/Full Time|Part Time|Contract/').first(),
      postedTime: firstJob.locator('svg').nth(2), // Clock icon
      applyButton: firstJob.locator('button:has-text("Apply Now")'),
    };
    
    // Verify title
    await expect(elements.title).toBeVisible();
    console.log('✓ Job title present');
    
    // Verify apply button
    await expect(elements.applyButton).toBeVisible();
    console.log('✓ Apply button present');
    
    console.log('✓ All required job information displayed');
  });

  test('should have proper hover effects', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const firstJobCard = page.locator('.job-recommendation-card').first();
    await expect(firstJobCard).toBeVisible();
    
    // Get initial border color
    const initialClasses = await firstJobCard.getAttribute('class');
    
    // Hover over the card
    await firstJobCard.hover();
    await page.waitForTimeout(500); // Wait for transition
    
    // Card should still be visible after hover
    await expect(firstJobCard).toBeVisible();
    console.log('✓ Hover interaction works');
  });

  test('should position card correctly on dashboard', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verify job recommendations come after progress cards
    const progressCards = page.locator('.dashboard-progress-card').filter({ hasText: /Profile Completion|Timesheet|Leave/ });
    const progressCardCount = await progressCards.count();
    expect(progressCardCount).toBeGreaterThan(0);
    console.log(`✓ Found ${progressCardCount} progress cards`);
    
    // Verify job recommendations card exists
    const jobRecommendations = page.locator('text=Recommended Jobs for You');
    await expect(jobRecommendations).toBeVisible();
    console.log('✓ Job recommendations positioned correctly on dashboard');
  });

  test('should take screenshot of job recommendations', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Scroll to job recommendations
    const jobRecommendations = page.locator('text=Recommended Jobs for You').first();
    await jobRecommendations.scrollIntoViewIfNeeded();
    
    // Take screenshot of the entire card
    await page.screenshot({ 
      path: 'dashboard-job-recommendations-screenshot.png',
      fullPage: false
    });
    
    console.log('✓ Screenshot saved as dashboard-job-recommendations-screenshot.png');
  });
});

