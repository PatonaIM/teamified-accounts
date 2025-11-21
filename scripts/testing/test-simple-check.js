const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Loading http://localhost/payroll-administration...');
  await page.goto('http://localhost/payroll-administration');
  await page.waitForTimeout(3000);
  
  const url = page.url();
  const title = await page.title();
  const bodyText = await page.locator('body').textContent();
  
  console.log('\nPage Info:');
  console.log('URL:', url);
  console.log('Title:', title);
  console.log('Body text (first 500 chars):', bodyText.substring(0, 500));
  
  await page.screenshot({ path: 'test-results/payroll-admin-simple-check.png' });
  console.log('\nScreenshot saved to: test-results/payroll-admin-simple-check.png');
  
  await browser.close();
})();

