const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Scrollbar Check', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('check for double scrollbar issue', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('CHECKING FOR DOUBLE SCROLLBAR ISSUE');
    console.log('='.repeat(80));

    // Login
    console.log('\n1. Logging in...');
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✓ Login completed');

    // Navigate to payroll configuration
    console.log('\n2. Navigating to payroll page...');
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Page loaded');

    // Check for overflow elements
    console.log('\n3. Checking overflow settings...');
    
    const overflowElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const scrollableElements = [];
      
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          const rect = el.getBoundingClientRect();
          scrollableElements.push({
            tag: el.tagName,
            class: el.className,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            hasVerticalScroll: el.scrollHeight > el.clientHeight,
            bounds: {
              top: rect.top,
              height: rect.height
            }
          });
        }
      });
      
      return scrollableElements;
    });

    console.log(`\n   Found ${overflowElements.length} scrollable elements:`);
    overflowElements.forEach((el, index) => {
      console.log(`\n   ${index + 1}. ${el.tag}`);
      console.log(`      Class: ${el.class.substring(0, 50)}${el.class.length > 50 ? '...' : ''}`);
      console.log(`      Scroll Height: ${el.scrollHeight}px`);
      console.log(`      Client Height: ${el.clientHeight}px`);
      console.log(`      Position: top=${el.bounds.top}, height=${el.bounds.height}`);
    });

    // Take full page screenshot
    console.log('\n4. Taking screenshot...');
    await page.screenshot({ 
      path: 'test-results/payroll-scrollbar-check.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved: test-results/payroll-scrollbar-check.png');

    // Check viewport scrollbar
    const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const bodyClientHeight = await page.evaluate(() => document.body.clientHeight);
    const htmlScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const htmlClientHeight = await page.evaluate(() => document.documentElement.clientHeight);
    
    console.log('\n5. Body/HTML scroll info:');
    console.log(`   body.scrollHeight: ${bodyScrollHeight}px`);
    console.log(`   body.clientHeight: ${bodyClientHeight}px`);
    console.log(`   html.scrollHeight: ${htmlScrollHeight}px`);
    console.log(`   html.clientHeight: ${htmlClientHeight}px`);

    console.log('\n' + '='.repeat(80));
    console.log('ANALYSIS:');
    console.log('='.repeat(80));
    
    if (overflowElements.length > 1) {
      console.log(`\n⚠️  Found ${overflowElements.length} scrollable areas - potential double scrollbar`);
      console.log('   This typically happens when:');
      console.log('   - Container has overflow:auto inside LayoutMUI');
      console.log('   - Nested boxes with fixed heights');
      console.log('   - Multiple elements with scroll behavior');
    } else if (overflowElements.length === 1) {
      console.log('\n✅ Only 1 scrollable area found - this is expected (main content area)');
    } else {
      console.log('\n✅ No scrollable areas detected');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  });
});

