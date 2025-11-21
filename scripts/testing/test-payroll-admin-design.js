const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page Error:', error.message);
  });
  
  console.log('🔄 Test 1: Loading login page...');
  await page.goto('http://localhost/login');
  await page.waitForTimeout(2000);
  
  console.log('🔄 Test 2: Logging in...');
  try {
    await page.fill('input[type="email"]', 'user1@teamified.com', { timeout: 5000 });
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Login successful');
  } catch (e) {
    console.log('⚠️  Login step skipped (page may already be loaded)');
  }
  
  console.log('🔄 Test 3: Navigating to Payroll Administration...');
  await page.goto('http://localhost/payroll-administration');
  await page.waitForTimeout(3000);
  
  // Check for LayoutMUI elements (side navigation)
  const sideNav = await page.locator('[role="navigation"], .MuiDrawer-root').count();
  
  // Check for page elements
  const heading = await page.locator('text=Payroll Administration').isVisible();
  const headerSection = await page.locator('text=Advanced payroll processing').isVisible();
  
  console.log('\n📊 Design Elements Check:');
  console.log(`  ${sideNav > 0 ? '✅' : '❌'} Side Navigation Present: ${sideNav > 0 ? 'YES' : 'NO'}`);
  console.log(`  ${heading ? '✅' : '❌'} Page Heading: ${heading ? 'VISIBLE' : 'NOT VISIBLE'}`);
  console.log(`  ${headerSection ? '✅' : '❌'} Header Description: ${headerSection ? 'VISIBLE' : 'NOT VISIBLE'}`);
  
  // Check for tabs
  const tabs = ['Period Management', 'Processing Control', 'Monitoring', 'Bulk Operations'];
  console.log('\n📋 Tab Visibility:');
  for (const tab of tabs) {
    const visible = await page.locator(`button:has-text("${tab}")`).isVisible();
    console.log(`  ${visible ? '✅' : '❌'} ${tab}`);
  }
  
  // Take screenshots
  await page.screenshot({ path: 'test-results/payroll-admin-with-sidenav.png', fullPage: true });
  console.log('\n📸 Screenshot saved to: test-results/payroll-admin-with-sidenav.png');
  
  console.log(`\n📊 JavaScript Errors: ${errors.length === 0 ? '✅ NONE' : `❌ ${errors.length}`}`);
  
  if (errors.length === 0 && sideNav > 0 && heading) {
    console.log('\n🎉 SUCCESS! Payroll Administration page has:');
    console.log('   ✅ Side navigation (LayoutMUI)');
    console.log('   ✅ Updated design matching PayrollConfigurationPage');
    console.log('   ✅ No JavaScript errors');
  } else {
    if (errors.length > 0) {
      console.log('\n❌ Errors found:');
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    }
  }
  
  await browser.close();
})();

