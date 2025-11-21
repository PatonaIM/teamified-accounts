const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track console messages and errors
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[CONSOLE ${msg.type()}]:`, text);
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('[PAGE ERROR]:', error.message);
  });

  // Track network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      console.log(`[RESPONSE] ${status} ${response.url()}`);
      
      if (status >= 400) {
        try {
          const body = await response.text();
          console.error(`[ERROR RESPONSE] ${status} ${response.url()}\nBody:`, body);
        } catch (e) {
          console.error(`[ERROR RESPONSE] ${status} ${response.url()} - Could not read body`);
        }
      }
    }
  });

  try {
    console.log('\n=== NAVIGATING TO LOGIN PAGE ===');
    await page.goto('http://localhost', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✓ Page loaded');
    
    // Wait for login form
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    console.log('✓ Login form visible');

    console.log('\n=== LOGGING IN ===');
    await page.fill('input[type="email"], input[name="email"]', 'user1@teamified.com');
    await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForURL(/dashboard|profile|payslips/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✓ Login successful');

    // Navigate to payslips page (where contribution info is displayed)
    console.log('\n=== NAVIGATING TO PAYSLIPS PAGE ===');
    await page.click('a[href="/payslips"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ On payslips page');

    // Take screenshot of initial state
    await page.screenshot({ path: 'contribution-tab-initial.png', fullPage: true });
    console.log('✓ Screenshot taken: contribution-tab-initial.png');

    // Look for tabs
    console.log('\n=== CHECKING FOR TABS ===');
    const tabs = await page.locator('[role="tab"]').all();
    console.log(`Found ${tabs.length} tabs`);
    
    for (let i = 0; i < tabs.length; i++) {
      const tabText = await tabs[i].textContent();
      console.log(`  Tab ${i}: "${tabText}"`);
    }

    // Look for contribution tab (could be various names)
    const possibleTabNames = ['contribution', 'contributions', 'tax', 'statutory'];
    let contributionTab = null;
    
    for (const name of possibleTabNames) {
      try {
        contributionTab = page.locator(`[role="tab"]:has-text("${name}")`).first();
        const count = await contributionTab.count();
        if (count > 0) {
          console.log(`\n✓ Found contribution tab with text containing: "${name}"`);
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }

    if (!contributionTab || await contributionTab.count() === 0) {
      console.log('\n⚠ Could not find contribution tab by name, trying case-insensitive search...');
      
      // Try to find any tab with contribution-related text
      for (let i = 0; i < tabs.length; i++) {
        const tabText = await tabs[i].textContent();
        const lowerText = tabText.toLowerCase();
        if (lowerText.includes('contribution') || lowerText.includes('tax') || lowerText.includes('statutory')) {
          contributionTab = tabs[i];
          console.log(`✓ Found tab at index ${i}: "${tabText}"`);
          break;
        }
      }
    }

    if (!contributionTab || await contributionTab.count() === 0) {
      console.log('\n❌ Could not find contribution tab');
      console.log('Available tabs:', await Promise.all(tabs.map(t => t.textContent())));
      
      // Take screenshot
      await page.screenshot({ path: 'contribution-tab-not-found.png', fullPage: true });
      console.log('✓ Screenshot taken: contribution-tab-not-found.png');
    } else {
      console.log('\n=== CLICKING CONTRIBUTION TAB ===');
      await contributionTab.click();
      await page.waitForTimeout(3000);
      console.log('✓ Contribution tab clicked');

      // Take screenshot after clicking
      await page.screenshot({ path: 'contribution-tab-clicked.png', fullPage: true });
      console.log('✓ Screenshot taken: contribution-tab-clicked.png');

      // Check for content in the tab panel
      console.log('\n=== CHECKING TAB PANEL CONTENT ===');
      const tabPanel = page.locator('[role="tabpanel"]:visible');
      const panelText = await tabPanel.textContent();
      console.log('Tab panel text:', panelText);

      // Check for common "no data" indicators
      const hasNoData = panelText.includes('No data') || 
                        panelText.includes('No contributions') || 
                        panelText.includes('No records') ||
                        panelText.trim().length < 10;

      if (hasNoData) {
        console.log('\n⚠ Tab panel appears to be empty or showing "no data" message');
      }

      // Check for loading indicators
      const loadingIndicators = await page.locator('[role="progressbar"], .MuiCircularProgress-root').count();
      console.log(`Loading indicators found: ${loadingIndicators}`);

      // Check for tables/grids
      const tables = await page.locator('table, [role="grid"]').count();
      console.log(`Tables/grids found: ${tables}`);

      // Check for any error messages
      const errorElements = await page.locator('.MuiAlert-standardError, [role="alert"]').count();
      console.log(`Error alerts found: ${errorElements}`);
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total page errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ PAGE ERRORS:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    const consoleErrors = consoleMessages.filter(m => m.type === 'error');
    if (consoleErrors.length > 0) {
      console.log('\n❌ CONSOLE ERRORS:');
      consoleErrors.forEach(msg => console.log(`  - ${msg.text}`));
    }

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: 'contribution-tab-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
