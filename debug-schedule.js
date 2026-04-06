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
      const selectors = [
        '.IndexScheduleList',
        '.IndexScheduleList .game_detail',
        '.IndexScheduleList li',
        '.IndexScheduleList .item',
        '.IndexScheduleList .game_item',
        '.IndexScheduleList .schedule_item',
        '.game_detail'
      ];

      const output = [];

      selectors.forEach((selector) => {
        const nodes = Array.from(document.querySelectorAll(selector));

        if (!nodes.length) {
          output.push({
            selector,
            count: 0,
            items: []
          });
          return;
        }

        output.push({
          selector,
          count: nodes.length,
          items: nodes.slice(0, 10).map((node, index) => ({
            index,
            tag: node.tagName,
            className: node.className || '',
            text: (node.innerText || '').trim(),
            html: node.outerHTML.slice(0, 2000)
          }))
        });
      });

      return output;
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('debug 失敗：', err.message);
  } finally {
    await browser.close();
  }
})();
