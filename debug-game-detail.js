require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(process.env.CPBL_URL, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    const result = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.game_detail')).map((node, index) => ({
        index,
        tag: node.tagName,
        className: node.className || '',
        text: (node.innerText || '').trim(),
        html: node.outerHTML.slice(0, 2500)
      }));
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('debug 失敗：', err.message);
  } finally {
    await browser.close();
  }
})();
