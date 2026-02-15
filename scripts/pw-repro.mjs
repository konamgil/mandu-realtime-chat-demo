import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3333/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    console.log('[console.error]', msg.text());
  }
});
page.on('pageerror', (err) => {
  console.log('[pageerror]', String(err));
});

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2000);

// Dump hydration status
const info = await page.evaluate(() => {
  const root = document.querySelector('[data-mandu-island]');
  const hydrated = root?.getAttribute('data-mandu-hydrated');
  const error = root?.getAttribute('data-mandu-error');
  const html = document.documentElement.outerHTML.slice(0, 700);
  return { hydrated, error, html };
});
console.log('[eval]', JSON.stringify(info, null, 2));

await browser.close();
