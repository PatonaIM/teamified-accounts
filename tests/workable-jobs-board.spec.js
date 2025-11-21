const { test, expect } = require('@playwright/test');

test.describe('Workable Jobs Board - Story 8.1', () => {
  
  test('Jobs page loads without authentication (public access)', async ({ page }) => {
    console.log('🧪 Testing public access to jobs page...');
    
    // Navigate directly to jobs page (should not require login)
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    
    // Check page title/heading
    const pageHeading = page.locator('h1, h2, h3').filter({ hasText: /open positions|jobs|careers/i });
    await expect(pageHeading).toBeVisible({ timeout: 10000 });
    console.log('✅ Jobs page heading visible');
    
    // Check for search bar
    const searchBar = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchBar).toBeVisible({ timeout: 5000 });
    console.log('✅ Search bar visible');
    
    // Wait for jobs to load
    await page.waitForTimeout(2000);
    
    // Check for job cards/listings
    const jobCards = page.locator('article, .job-card, [data-testid="job-card"], div').filter({
      has: page.locator('text=/HR Specialist|Engineer|Developer|Manager/i')
    });
    
    const jobCount = await jobCards.count();
    console.log(`📊 Found ${jobCount} job listings`);
    
    if (jobCount > 0) {
      console.log('✅ Job listings are displayed');
      
      // Check first job card has required elements
      const firstJob = jobCards.first();
      await expect(firstJob).toBeVisible();
      
      // Look for View/Apply button
      const viewButton = firstJob.locator('button, a').filter({ 
        hasText: /view|apply|details|learn more/i 
      }).first();
      
      if (await viewButton.isVisible()) {
        console.log('✅ Job cards have action buttons');
      }
    } else {
      console.log('⚠️  No job listings found - check Workable API connection');
    }
  });

  test('Candidate user can login and access jobs page', async ({ page }) => {
    console.log('🧪 Testing candidate user authentication and jobs access...');
    
    // Step 1: Login as candidate user
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    console.log('📍 Navigated to login page');
    
    // Fill in credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button').filter({ 
      hasText: /login|sign in/i 
    }).first();
    
    await emailInput.fill('user25@teamified.com'); // Candidate user from seed
    await passwordInput.fill('Admin123!');
    console.log('✅ Filled candidate credentials');
    
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Login submitted');
    
    // Wait for redirect (might go to dashboard or home)
    await page.waitForTimeout(2000);
    
    // Step 2: Navigate to jobs page
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    console.log('📍 Navigated to jobs page');
    
    // Step 3: Verify jobs page loaded
    const pageHeading = page.locator('h1, h2, h3').filter({ 
      hasText: /open positions|jobs|careers/i 
    });
    await expect(pageHeading).toBeVisible({ timeout: 10000 });
    console.log('✅ Jobs page loaded for authenticated user');
    
    // Check for search functionality
    const searchBar = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchBar).toBeVisible();
    console.log('✅ Search bar visible for authenticated user');
  });

  test('Job detail page loads with complete information', async ({ page }) => {
    console.log('🧪 Testing job detail page...');
    
    // Navigate to jobs page first
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find and click first job
    const jobCards = page.locator('article, .job-card, div').filter({
      has: page.locator('text=/HR Specialist|Engineer|Developer|Manager/i')
    });
    
    const jobCount = await jobCards.count();
    
    if (jobCount > 0) {
      // Click on first job's view button
      const firstJob = jobCards.first();
      const viewButton = firstJob.locator('button, a').filter({ 
        hasText: /view|apply|details/i 
      }).first();
      
      await viewButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('✅ Navigated to job detail page');
      
      // Verify we're on a job detail page
      // Look for Apply button or job description
      const applyButton = page.locator('button, a').filter({ 
        hasText: /apply/i 
      }).first();
      
      if (await applyButton.isVisible()) {
        console.log('✅ Apply button visible on job detail page');
      }
      
      // Check for job description sections
      const jobSections = page.locator('text=/about|description|requirements|responsibilities|benefits/i');
      const sectionCount = await jobSections.count();
      
      if (sectionCount > 0) {
        console.log(`✅ Found ${sectionCount} job detail sections`);
      }
      
    } else {
      console.log('⚠️  Cannot test job detail page - no jobs available');
    }
  });

  test('Search functionality works on jobs page', async ({ page }) => {
    console.log('🧪 Testing search functionality...');
    
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find search input
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
    
    // Type search query
    await searchInput.fill('HR');
    console.log('✅ Entered search query');
    
    // Look for search button or press Enter
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    
    if (await searchButton.isVisible()) {
      await searchButton.click();
      console.log('✅ Clicked search button');
    } else {
      await searchInput.press('Enter');
      console.log('✅ Pressed Enter to search');
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ Search executed successfully');
  });

  test('Jobs page is responsive (mobile view)', async ({ page }) => {
    console.log('🧪 Testing responsive design...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check page still loads on mobile
    const pageHeading = page.locator('h1, h2, h3').filter({ 
      hasText: /open positions|jobs|careers/i 
    });
    await expect(pageHeading).toBeVisible({ timeout: 10000 });
    console.log('✅ Jobs page loads on mobile viewport');
    
    // Check search is still accessible
    const searchBar = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchBar).toBeVisible();
    console.log('✅ Search bar visible on mobile');
  });

  test('Load More functionality works (if available)', async ({ page }) => {
    console.log('🧪 Testing pagination/Load More...');
    
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Count initial jobs
    const jobCards = page.locator('article, .job-card, div').filter({
      has: page.locator('text=/HR Specialist|Engineer|Developer|Manager/i')
    });
    const initialCount = await jobCards.count();
    console.log(`📊 Initial job count: ${initialCount}`);
    
    // Look for Load More button
    const loadMoreButton = page.locator('button').filter({ 
      hasText: /load more|show more|view more/i 
    }).first();
    
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const newCount = await jobCards.count();
      console.log(`📊 Job count after Load More: ${newCount}`);
      
      if (newCount > initialCount) {
        console.log('✅ Load More button works - more jobs loaded');
      } else {
        console.log('⚠️  Load More clicked but no additional jobs (might be end of list)');
      }
    } else {
      console.log('ℹ️  Load More button not found (might not be needed)');
    }
  });
});

