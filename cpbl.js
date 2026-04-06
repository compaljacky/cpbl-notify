const { chromium } = require('playwright');

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

async function fetchGames() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(process.env.CPBL_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 等目標容器出現，最多 15 秒；若今天沒有直播場次則容器不存在，直接繼續
    await page.waitForSelector('.IndexScheduleList.major', { timeout: 15000 }).catch(() => {});

    const games = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll('.IndexScheduleList.major .game_item')
      );

      return cards.map((card) => {
        const gameId =
          card.querySelector('.tag.game_no a')?.textContent?.trim() || '';

        const status =
          card.querySelector('.tag.game_status span')?.textContent?.trim() || '';

        const awayTeam =
          card.querySelector('.team.away .team_name a')?.getAttribute('title') ||
          card.querySelector('.team.away .team_name a')?.textContent?.trim() ||
          '';

        const homeTeam =
          card.querySelector('.team.home .team_name a')?.getAttribute('title') ||
          card.querySelector('.team.home .team_name a')?.textContent?.trim() ||
          '';

        const awayScore =
          card.querySelector('.score .num.away')?.textContent?.trim() || '';

        const homeScore =
          card.querySelector('.score .num.home')?.textContent?.trim() || '';

        const place =
          card.querySelector('.score .place')?.textContent?.trim() ||
          card.querySelector('.PlaceInfo .place')?.textContent?.trim() ||
          '';

        const inningEl = card.querySelector('.GameMatchupBasic .inning');
        const inningNum = inningEl?.textContent?.trim() || '';
        const inningHalf = inningEl?.classList.contains('bot') ? '下' : inningEl?.classList.contains('top') ? '上' : '';
        const inning = inningNum ? `${inningNum}局${inningHalf}` : '';

        return {
          gameId,
          status,
          awayTeam,
          homeTeam,
          awayScore,
          homeScore,
          place,
          inning
        };
      });
    });

    return games.map((game) => ({
      ...game,
      status: normalizeText(game.status),
      awayTeam: normalizeText(game.awayTeam),
      homeTeam: normalizeText(game.homeTeam),
      awayScore: normalizeText(game.awayScore),
      homeScore: normalizeText(game.homeScore),
      place: normalizeText(game.place)
    }));
  } finally {
    await browser.close();
  }
}

module.exports = {
  fetchGames
};
