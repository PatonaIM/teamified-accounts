const { test, expect } = require('@playwright/test');

test('Debug Page Redirects', async ({ page }) => {
  // Listen for navigation events
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log(`🔄 Navigation: ${frame.url()}`);
    }
  });
  
  // Listen for console logs
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`🚨 Console ${msg.type()}:`, msg.text());
    }
  });
  
  console.log('🚀 Starting redirect debug test...');
  
  // Login first
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'user1@teamified.com');
  await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"], button:has-text("Sign In")');
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('✅ Logged in successfully');
  
  // Test each problematic page
  const problematicPages = [
    { name: 'Invitations', url: '/invitations' },
    { name: 'User Management', url: '/users' },
    { name: 'Employment Records', url: '/employment-records' },
    { name: 'Salary History', url: '/salary-history' }
  ];
  
  for (const testPage of problematicPages) {
    console.log(`\n📄 Testing ${testPage.name} (${testPage.url})...`);
    
    // Navigate to the page
    console.log(`   Navigating to ${testPage.url}`);
    await page.goto(testPage.url);
    
    // Wait for any redirects to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check final URL
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);
    
    // Check if we were redirected
    if (finalUrl.includes('/dashboard')) {
      console.log(`   ❌ REDIRECTED to dashboard`);
    } else if (finalUrl.includes(testPage.url)) {
      console.log(`   ✅ Stayed on correct page`);
    } else {
      console.log(`   ⚠️  Unexpected redirect to: ${finalUrl}`);
    }
    
    // Check page title
    const title = await page.title();
    console.log(`   Page title: ${title}`);
    
    // Look for specific page indicators
    const pageIndicators = [
      `text=${testPage.name}`,
      `h1:has-text("${testPage.name}")`,
      `h2:has-text("${testPage.name}")`,
      `h3:has-text("${testPage.name}")`
    ];
    
    let foundIndicator = false;
    for (const indicator of pageIndicators) {
      const elements = await page.locator(indicator).count();
      if (elements > 0) {
        console.log(`   ✅ Found page indicator: "${indicator}"`);
        foundIndicator = true;
        break;
      }
    }
    
    if (!foundIndicator) {
      console.log(`   ❌ No page indicators found for ${testPage.name}`);
    }
    
    // Take a screenshot for manual inspection
    await page.screenshot({ path: `debug-${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png` });
  }
  
  console.log('\n✅ Redirect debug test completed');
});