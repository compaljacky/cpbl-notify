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

    const data = await page.evaluate(() => {
      const results = [];
      const nodes = Array.from(document.querySelectorAll('*'));

      const seen = new Set();

      nodes.forEach((node) => {
        const text = (node.innerText || '').trim();

        if (!text.includes('更多資訊')) return;
        if (!text.includes('比賽中')) return;
        if (!/\d+\s*:\s*\d+/.test(text)) return;

        let card = node;
        for (let i = 0; i < 6; i += 1) {
          if (!card.parentElement) break;
          card = card.parentElement;
        }

        const cardText = (card.innerText || '').trim();
        if (!cardText) return;
        if (seen.has(cardText)) return;
        seen.add(cardText);

        results.push({
          tag: card.tagName,
          className: card.className || '',
          text: cardText,
          html: card.outerHTML.slice(0, 5000)
        });
      });

      return results;
    });

    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('debug 失敗：', err.message);
  } finally {
    await browser.close();
  }
})();
