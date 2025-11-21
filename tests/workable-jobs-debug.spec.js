const { test, expect } = require('@playwright/test');

test('Debug jobs page loading', async ({ page }) => {
  // Listen for console messages
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  // Listen for page errors
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Listen for failed requests
  page.on('requestfailed', request => {
    console.log('FAILED REQUEST:', request.url(), request.failure().errorText);
  });
  
  console.log('🧪 Navigating to /jobs...');
  await page.goto('/jobs', { waitUntil: 'networkidle' });
  
  // Wait longer for React to render
  await page.waitForTimeout(5000);
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'jobs-debug.png', fullPage: true });
  
  // Check what's in the root div
  const rootContent = await page.locator('#root').innerHTML();
  console.log('ROOT DIV CONTENT LENGTH:', rootContent.length);
  console.log('ROOT DIV SAMPLE:', rootContent.substring(0, 500));
  
  // Check for React errors
  const reactErrors = await page.locator('text=/error|failed|not found/i').count();
  console.log(`React error count: ${reactErrors}`);
  
  // Check if JavaScript loaded
  const scripts = await page.locator('script').count();
  console.log(`Script tags: ${scripts}`);
  
  // Check network requests
  const responses = [];
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status()
    });
  });
  
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('Network responses:', responses.filter(r => r.url.includes('workable') || r.url.includes('jobs')));
});

