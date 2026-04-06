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
      const cards = Array.from(
        document.querySelectorAll('.IndexScheduleList.major .game_item.live')
      );

      return cards.map((card, index) => ({
        index,
        text: (card.innerText || '').trim(),
        html: card.outerHTML.slice(0, 5000)
      }));
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('debug 失敗：', err.message);
  } finally {
    await browser.close();
  }
})();
