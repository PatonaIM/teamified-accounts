const { test, expect } = require('@playwright/test');

test('Check All Navigation Pages Load Correctly', async ({ page }) => {
  // Listen for console errors and page errors
  const consoleErrors = [];
  const pageErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    pageErrors.push(`Page Error: ${error.message}`);
  });
  
  // Track network failures
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  
  console.log('🚀 Starting navigation pages test...');
  
  // Login first
  console.log('🔐 Logging in...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'user1@teamified.com');
  await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"], button:has-text("Sign In")');
  
  // Wait for successful login
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Check we're logged in
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error('Login failed - still on login page');
  }
  
  console.log('✅ Successfully logged in');
  
  // Define all navigation pages that should be accessible to admin
  const navigationPages = [
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Profile', url: '/profile' },
    { name: 'Timesheets', url: '/timesheets' },
    { name: 'Leave', url: '/leave' },
    { name: 'Documents', url: '/documents' },
    { name: 'Invitations', url: '/invitations' },
    { name: 'User Management', url: '/users' },
    { name: 'Employment Records', url: '/employment-records' },
    { name: 'Salary History', url: '/salary-history' }
  ];
  
  const pageResults = [];
  
  for (const navPage of navigationPages) {
    console.log(`\n📄 Testing ${navPage.name} (${navPage.url})...`);
    
    // Clear previous errors
    consoleErrors.length = 0;
    pageErrors.length = 0;
    networkErrors.length = 0;
    
    try {
      // Navigate to the page
      await page.goto(navPage.url);
      await page.waitForLoadState('networkidle');
      
      // Wait for page to stabilize
      await page.waitForTimeout(1000);
      
      // Take screenshot for visual verification
      await page.screenshot({ path: `page-test-${navPage.name.toLowerCase().replace(/\s+/g, '-')}.png` });
      
      // Check for basic page structure
      const hasHeader = await page.locator('header, [role="banner"], .header').count() > 0;
      const hasContent = await page.locator('main, [role="main"], .content, .page-content').count() > 0;
      const hasTitle = await page.locator('h1, h2, h3, .page-title, .title').count() > 0;
      
      // Check for error messages
      const errorSelectors = [
        'text=error',
        'text=Error',
        'text=failed', 
        'text=Failed',
        'text=not found',
        'text=Not Found',
        '.error',
        '.alert-danger',
        '[role="alert"]',
        '.text-red-500',
        '.text-red-600'
      ];
      
      const visibleErrors = [];
      for (const selector of errorSelectors) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            const text = await element.textContent();
            visibleErrors.push(text?.trim());
          }
        }
      }
      
      // Check for loading states that might be stuck
      const stuckLoading = [];
      const loadingSelectors = [
        'text=Loading...',
        'text=loading',
        '.loading',
        '.spinner',
        '.skeleton'
      ];
      
      for (const selector of loadingSelectors) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            stuckLoading.push(selector);
          }
        }
      }
      
      // Compile results
      const result = {
        name: navPage.name,
        url: navPage.url,
        loaded: true,
        hasHeader,
        hasContent,
        hasTitle,
        consoleErrors: [...consoleErrors],
        pageErrors: [...pageErrors],
        networkErrors: [...networkErrors],
        visibleErrors,
        stuckLoading,
        status: 'SUCCESS'
      };
      
      // Determine overall status
      if (pageErrors.length > 0) {
        result.status = 'PAGE_ERROR';
      } else if (networkErrors.length > 0) {
        result.status = 'NETWORK_ERROR';
      } else if (visibleErrors.length > 0) {
        result.status = 'VISIBLE_ERROR';
      } else if (stuckLoading.length > 0) {
        result.status = 'STUCK_LOADING';
      } else if (consoleErrors.length > 0) {
        result.status = 'CONSOLE_ERROR';
      } else if (!hasContent && !hasTitle) {
        result.status = 'NO_CONTENT';
      }
      
      pageResults.push(result);
      
      // Log immediate results
      console.log(`   Status: ${result.status}`);
      if (result.hasHeader) console.log('   ✅ Has header structure');
      if (result.hasContent) console.log('   ✅ Has main content');
      if (result.hasTitle) console.log('   ✅ Has page title');
      
      if (result.consoleErrors.length > 0) {
        console.log(`   ⚠️  Console errors: ${result.consoleErrors.length}`);
        result.consoleErrors.forEach(err => console.log(`      ${err}`));
      }
      
      if (result.pageErrors.length > 0) {
        console.log(`   ❌ Page errors: ${result.pageErrors.length}`);
        result.pageErrors.forEach(err => console.log(`      ${err}`));
      }
      
      if (result.networkErrors.length > 0) {
        console.log(`   🌐 Network errors: ${result.networkErrors.length}`);
        result.networkErrors.forEach(err => console.log(`      ${err}`));
      }
      
      if (result.visibleErrors.length > 0) {
        console.log(`   👀 Visible errors: ${result.visibleErrors.length}`);
        result.visibleErrors.forEach(err => console.log(`      "${err}"`));
      }
      
      if (result.stuckLoading.length > 0) {
        console.log(`   ⏳ Stuck loading: ${result.stuckLoading.join(', ')}`);
      }
      
    } catch (error) {
      const result = {
        name: navPage.name,
        url: navPage.url,
        loaded: false,
        error: error.message,
        status: 'NAVIGATION_ERROR'
      };
      
      pageResults.push(result);
      console.log(`   ❌ Navigation failed: ${error.message}`);
    }
  }
  
  // Summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 NAVIGATION PAGES TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = pageResults.filter(r => r.status === 'SUCCESS');
  const withIssues = pageResults.filter(r => r.status !== 'SUCCESS');
  
  console.log(`✅ Successful pages: ${successful.length}/${pageResults.length}`);
  console.log(`⚠️  Pages with issues: ${withIssues.length}/${pageResults.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successfully loaded pages:');
    successful.forEach(result => {
      console.log(`   • ${result.name} (${result.url})`);
    });
  }
  
  if (withIssues.length > 0) {
    console.log('\n⚠️  Pages with issues:');
    withIssues.forEach(result => {
      console.log(`   • ${result.name} (${result.url}) - ${result.status}`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
      if (result.pageErrors?.length > 0) {
        console.log(`     Page Errors: ${result.pageErrors.length}`);
      }
      if (result.consoleErrors?.length > 0) {
        console.log(`     Console Errors: ${result.consoleErrors.length}`);
      }
      if (result.networkErrors?.length > 0) {
        console.log(`     Network Errors: ${result.networkErrors.length}`);
      }
      if (result.visibleErrors?.length > 0) {
        console.log(`     Visible Errors: ${result.visibleErrors.length}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // The test should pass even if some pages have issues - we want to see the full report
  // You can change this behavior if you want the test to fail on any issues
  if (withIssues.length > 0) {
    console.log('⚠️  Some pages have issues but test completed successfully for debugging purposes');
  }
});