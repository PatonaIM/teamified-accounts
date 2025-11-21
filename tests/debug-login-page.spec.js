import { test } from '@playwright/test';

test('Debug login page', async ({ page }) => {
  test.setTimeout(60000);

  console.log('\n=== Debugging Login Page ===\n');

  await page.goto('http://localhost/login', { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`URL: ${page.url()}`);

  // Wait for React to render
  await page.waitForTimeout(5000);

  // Get page content
  const content = await page.content();
  console.log('\n=== Page HTML (first 500 chars) ===');
  console.log(content.substring(0, 500));

  // Check for email input with multiple selectors
  console.log('\n=== Checking for email input ===');
  
  const selectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email" i]',
    'input',
  ];

  for (const selector of selectors) {
    const element = await page.$(selector);
    console.log(`${selector}: ${element ? 'FOUND' : 'NOT FOUND'}`);
    if (element) {
      const attrs = await element.evaluate(el => ({
        type: el.type,
        name: el.name,
        placeholder: el.placeholder,
        id: el.id,
        className: el.className,
      }));
      console.log(`  Attributes:`, attrs);
    }
  }

  // Get all input elements
  const allInputs = await page.$$('input');
  console.log(`\nTotal input elements found: ${allInputs.length}`);

  // Get all buttons
  const allButtons = await page.$$('button');
  console.log(`Total button elements found: ${allButtons.length}`);

  // Check if there's any text on the page
  const bodyText = await page.$eval('body', el => el.innerText);
  console.log('\n=== Page Text (first 300 chars) ===');
  console.log(bodyText.substring(0, 300));

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-login.png', fullPage: true });
  console.log('\n✓ Screenshot saved to test-results/debug-login.png');
});

