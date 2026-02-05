const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/index.html');
  await page.screenshot({ path: '/home/jules/verification/landing_v3.png' });

  await page.goto('http://localhost:3000/dashboard');
  await page.screenshot({ path: '/home/jules/verification/overview_v3.png' });

  await page.goto('http://localhost:3000/manage-servers');
  await page.screenshot({ path: '/home/jules/verification/manage_servers_v3.png' });

  await browser.close();
})();
