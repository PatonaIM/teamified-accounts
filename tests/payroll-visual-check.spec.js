const { test, expect } = require('@playwright/test');

test.describe('Payroll Configuration - Visual Double Scrollbar Check', () => {
  const frontendUrl = 'http://localhost:80';
  const credentials = {
    email: 'user1@teamified.com',
    password: 'Admin123!'
  };

  test('detailed visual scrollbar analysis', async ({ page, browser }) => {
    console.log('\n' + '='.repeat(80));
    console.log('DETAILED SCROLLBAR VISUAL ANALYSIS');
    console.log('='.repeat(80));

    // Login
    await page.goto(`${frontendUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', credentials.email);
    await page.fill('input[type="password"], input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Navigate to payroll configuration
    await page.goto(`${frontendUrl}/payroll-configuration`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get detailed CSS information about main containers
    const containerInfo = await page.evaluate(() => {
      const results = [];
      
      // Find the main layout container
      const layoutBox = document.querySelector('[class*="MuiBox-root"]');
      if (layoutBox) {
        const style = window.getComputedStyle(layoutBox);
        results.push({
          selector: 'Layout Box (main container)',
          overflow: style.overflow,
          overflowY: style.overflowY,
          overflowX: style.overflowX,
          height: style.height,
          maxHeight: style.maxHeight,
          position: style.position,
          display: style.display,
          flexGrow: style.flexGrow
        });
      }
      
      // Find the Container component
      const containers = document.querySelectorAll('[class*="MuiContainer"]');
      containers.forEach((container, index) => {
        const style = window.getComputedStyle(container);
        results.push({
          selector: `Container ${index + 1}`,
          overflow: style.overflow,
          overflowY: style.overflowY,
          overflowX: style.overflowX,
          height: style.height,
          maxHeight: style.maxHeight,
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom
        });
      });
      
      // Check body and html
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);
      
      results.push({
        selector: 'body',
        overflow: bodyStyle.overflow,
        overflowY: bodyStyle.overflowY,
        height: bodyStyle.height,
        margin: bodyStyle.margin
      });
      
      results.push({
        selector: 'html',
        overflow: htmlStyle.overflow,
        overflowY: htmlStyle.overflowY,
        height: htmlStyle.height
      });
      
      return results;
    });

    console.log('\n📋 Container CSS Analysis:');
    console.log('='.repeat(80));
    containerInfo.forEach((info, index) => {
      console.log(`\n${index + 1}. ${info.selector}:`);
      Object.entries(info).forEach(([key, value]) => {
        if (key !== 'selector') {
          console.log(`   ${key}: ${value}`);
        }
      });
    });

    // Take a screenshot with visible viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ 
      path: 'test-results/payroll-full-viewport.png',
      fullPage: false  // Only visible viewport
    });
    
    // Take a full page screenshot
    await page.screenshot({ 
      path: 'test-results/payroll-full-page.png',
      fullPage: true
    });

    console.log('\n📸 Screenshots saved:');
    console.log('   - test-results/payroll-full-viewport.png (viewport only)');
    console.log('   - test-results/payroll-full-page.png (full page)');

    // Check if scrolling works correctly
    console.log('\n🔄 Testing scroll behavior...');
    
    const initialScrollY = await page.evaluate(() => {
      const scrollContainer = document.querySelector('[class*="MuiBox-root"][style*="overflow"]') || 
                             document.querySelector('[class*="css-"][style*="overflow: auto"]') ||
                             document.querySelector('main');
      return scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    });
    
    console.log(`   Initial scroll position: ${initialScrollY}`);
    
    // Scroll down
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('[class*="MuiBox-root"][style*="overflow"]') || 
                             document.querySelector('[class*="css-"][style*="overflow: auto"]') ||
                             document.querySelector('main');
      if (scrollContainer) {
        scrollContainer.scrollTop = 200;
      } else {
        window.scrollTo(0, 200);
      }
    });
    
    await page.waitForTimeout(500);
    
    const afterScrollY = await page.evaluate(() => {
      const scrollContainer = document.querySelector('[class*="MuiBox-root"][style*="overflow"]') || 
                             document.querySelector('[class*="css-"][style*="overflow: auto"]') ||
                             document.querySelector('main');
      return scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    });
    
    console.log(`   After scroll: ${afterScrollY}`);
    console.log(`   Scroll worked: ${afterScrollY > initialScrollY ? '✅' : '❌'}`);

    console.log('\n' + '='.repeat(80));
    console.log('🔍 DIAGNOSIS:');
    console.log('='.repeat(80));
    
    const overflowCount = containerInfo.filter(info => 
      info.overflowY === 'auto' || info.overflowY === 'scroll'
    ).length;
    
    if (overflowCount > 1) {
      console.log('\n⚠️  Multiple elements with overflow:auto detected!');
      console.log('   This can cause double scrollbars.');
      console.log('\n   Recommendation: Only the main LayoutMUI container should have overflow:auto');
    } else {
      console.log('\n✅ Only one overflow:auto element (expected)');
      console.log('   If you see double scrollbars, it might be:');
      console.log('   - Browser zoom level');
      console.log('   - OS scrollbar settings');
      console.log('   - Browser scrollbar overlay behavior');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  });
});

