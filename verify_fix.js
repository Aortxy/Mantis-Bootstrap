const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/index.html');
  await page.screenshot({ path: '/home/jules/verification/landing_v2.png' });

  await page.goto('http://localhost:3000/login.html');
  await page.screenshot({ path: '/home/jules/verification/login_v2.png' });

  await page.goto('http://localhost:3000/dashboard.html');
  await page.screenshot({ path: '/home/jules/verification/dashboard_v2.png' });

  await browser.close();
})();
