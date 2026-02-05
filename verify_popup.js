const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/index.html');

  // Select a plan
  await page.click('.pricing-card');

  // Fill form
  await page.fill('#username', 'testuser');
  await page.fill('#email', 'test@example.com');

  // Click payment
  await page.click('button:has-text("Bayar Sekarang")');

  // Wait for Swal
  await page.waitForSelector('.swal2-popup');
  await page.screenshot({ path: '/home/jules/verification/popup_v3.png' });

  await browser.close();
})();
