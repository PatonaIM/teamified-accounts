const { chromium } = require('playwright');

async function testPayslipsDetailed() {
  console.log('🧪 Starting Detailed Payslips Page Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages with timestamp
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = new Date().toISOString();
    consoleMessages.push({ timestamp, type, text });
    console.log(`[${timestamp.split('T')[1].split('.')[0]}] [${type.toUpperCase()}] ${text}`);
  });

  // Capture network requests
  const requests = [];
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method()
    });
  });

  // Capture network errors
  const networkErrors = [];
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      const error = {
        status,
        statusText: response.statusText(),
        url
      };
      networkErrors.push(error);
      console.log(`❌ [${status}] ${url}`);
    }
  });

  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`❌ [PAGE ERROR] ${error.message}`);
  });

  try {
    // Step 1: Navigate to login page
    console.log('\n📍 Step 1: Navigating to http://localhost...');
    await page.goto('http://localhost', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const currentUrl1 = page.url();
    console.log(`Current URL: ${currentUrl1}`);

    // Check if we need to login
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    
    if (emailInput) {
      console.log('\n🔐 Step 2: Login detected, authenticating...');
      
      await page.fill('input[type="email"], input[name="email"]', 'user2@teamified.com');
      await page.waitForTimeout(500);
      
      await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
      await page.waitForTimeout(500);
      
      // Find and click login button
      const loginButton = await page.$('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]');
      if (loginButton) {
        console.log('Clicking login button...');
        await loginButton.click();
        
        // Wait for navigation
        await page.waitForTimeout(3000);
        
        const currentUrl2 = page.url();
        console.log(`After login URL: ${currentUrl2}`);
        
        // Check if login was successful
        const isStillOnLogin = await page.$('input[type="email"]');
        if (isStillOnLogin) {
          console.log('⚠️ Still on login page - login may have failed');
        } else {
          console.log('✅ Login appears successful');
        }
      }
    } else {
      console.log('✅ Already logged in or no login required');
    }

    // Step 3: Navigate directly to Payslips
    console.log('\n📍 Step 3: Navigating to /payslips...');
    await page.goto('http://localhost/payslips', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    const currentUrl3 = page.url();
    console.log(`Current URL: ${currentUrl3}`);

    // Check what's actually on the page
    console.log('\n🔍 Step 4: Analyzing page content...');
    
    // Check for route match
    if (currentUrl3.includes('/payslips')) {
      console.log('✅ URL contains /payslips');
    } else {
      console.log('❌ URL does not contain /payslips - possible redirect');
    }

    // Check for main heading
    const h1 = await page.$('h1');
    const h1Text = h1 ? await h1.textContent() : 'No h1 found';
    console.log(`H1: ${h1Text}`);

    const h4 = await page.$('h4');
    const h4Text = h4 ? await h4.textContent() : 'No h4 found';
    console.log(`H4: ${h4Text}`);

    // Check for tabs
    const tabs = await page.$$('button[role="tab"]');
    console.log(`Tabs found: ${tabs.length}`);
    
    if (tabs.length > 0) {
      console.log('Tab labels:');
      for (let i = 0; i < tabs.length; i++) {
        const tabText = await tabs[i].textContent();
        console.log(`  ${i + 1}. ${tabText}`);
      }
    }

    // Check for main content divs
    const mainContent = await page.$$('[role="main"], main, .main-content');
    console.log(`Main content elements: ${mainContent.length}`);

    // Check for any error messages
    const alerts = await page.$$('[role="alert"]');
    console.log(`Alert elements: ${alerts.length}`);
    if (alerts.length > 0) {
      for (const alert of alerts) {
        const text = await alert.textContent();
        console.log(`  Alert: ${text}`);
      }
    }

    // Check for React root
    const reactRoot = await page.$('#root');
    if (reactRoot) {
      const innerHTML = await reactRoot.innerHTML();
      console.log(`React root has content: ${innerHTML.length > 0 ? 'Yes' : 'No'} (${innerHTML.length} chars)`);
    }

    // Wait for any additional API calls
    console.log('\n⏳ Step 5: Waiting for API calls...');
    await page.waitForTimeout(5000);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 DETAILED TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n🌐 Total Requests: ${requests.length}`);
    const apiRequests = requests.filter(r => r.url.includes('/api/'));
    console.log(`API Requests: ${apiRequests.length}`);
    apiRequests.forEach(r => console.log(`  ${r.method} ${r.url}`));

    console.log(`\n❌ Network Errors: ${networkErrors.length}`);
    networkErrors.forEach(err => console.log(`  [${err.status}] ${err.url}`));

    console.log(`\n🐛 Page Errors: ${pageErrors.length}`);
    pageErrors.forEach(err => console.log(`  ${err}`));

    console.log(`\n📝 Console Messages: ${consoleMessages.length}`);
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Warnings: ${warnings.length}`);

    // Take screenshot
    await page.screenshot({ path: 'test-results/payslips-detailed-test.png', fullPage: true });
    console.log('\n📸 Screenshot: test-results/payslips-detailed-test.png');

    console.log('\n⏸️  Keeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/payslips-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Test completed\n');
  }
}

testPayslipsDetailed();

