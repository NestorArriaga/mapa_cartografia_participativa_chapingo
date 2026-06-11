const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle', timeout: 15000 });
    const content = await page.content();
    console.log(content.substring(0, 1000));
  } catch (err) {
    console.log("Goto error:", err.message);
  }
  
  await browser.close();
})();
