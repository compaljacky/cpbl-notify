const axios = require('axios');

const SOURCE_URL =
  process.env.CPBL_SOURCE_URL ||
  'https://atplayertw.com.tw/wp-json/atplayertw/v1/sport/cpbl';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function yesterdayTaipei() {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

(async () => {
  const resp = await axios.get(SOURCE_URL, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'zh-TW,zh;q=0.9' },
    timeout: 30000
  });
  const data = resp.data;
  console.log('API ok=' + data.ok + '，總場次=' + (data.games || []).length);
  console.log('窗口內各場日期：', (data.games || []).map((g) => String(g.date).slice(0, 10)));

  const target = process.env.TARGET_DATE || yesterdayTaipei();
  console.log('\n== 篩選日期：' + target + ' ==\n');

  const games = (data.games || []).filter(
    (g) => String(g.date || '').slice(0, 10) === target
  );

  if (games.length === 0) {
    console.log('（該日無場次，或已不在 API 回傳窗口內）');
    return;
  }

  for (const g of games) {
    const away = (g.away && g.away.name_local) || '';
    const home = (g.home && g.home.name_local) || '';
    const as = g.away && g.away.score;
    const hs = g.home && g.home.score;
    console.log('【' + (g.status_long || g.status) + '】');
    console.log(`${away} ${as} : ${hs} ${home}`);
    console.log('球場：' + (g.venue_local || ''));
    console.log('原始 status=' + g.status);
    console.log('---');
  }
})().catch((e) => {
  console.error('抓取失敗：', e.response ? JSON.stringify(e.response.data).slice(0, 200) : e.message);
  process.exit(1);
});
