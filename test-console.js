import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('UNCAUGHT EXCEPTION:', err.message);
  });

  try {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(5000);
    console.log('Page loaded without crash');
  } catch (e) {
    console.error('Navigation error:', e.message);
  }
  
  await browser.close();
})();
