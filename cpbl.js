const axios = require('axios');

// 比分來源：atplayertw 的 WordPress JSON API。
// 原本走 cpbl.com.tw，但 CPBL 會擋機房 IP（GCP / Cloudflare 都被擋），
// 改抓會鏡像 CPBL 比分、且不擋機房 IP 的第三方來源，VM 可直接抓、不需 relay。
//
// 端點回傳「昨天+今天+明天」的賽事窗口，這裡只取「今日（Asia/Taipei）」場次，
// 對齊原本 CPBL 預設只回當日比賽的行為。

const SOURCE_URL =
  process.env.CPBL_SOURCE_URL ||
  'https://atplayertw.com.tw/wp-json/atplayertw/v1/sport/cpbl';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// atplayer status → bot 既有狀態字串（app.js 會用字串精準比對）
function mapStatus(g) {
  const s = String(g.status || '');
  if (s === 'FT') return '比賽結束';
  if (s === 'NS') return '比賽未開始';
  if (s === 'POST') return '延賽';
  if (s === 'CANC') return '取消';
  if (/^IN/.test(s)) return '比賽中'; // IN1..IN9（含延長）= 進行中
  return g.status_long || s;
}

function scoreStr(v) {
  return v === null || v === undefined ? '' : String(v);
}

function mapHalf(h) {
  const x = String(h || '').toLowerCase();
  if (x.includes('top') || x === 't' || x.includes('上')) return '上';
  if (x.includes('bot') || x === 'b' || x.includes('下')) return '下';
  return '';
}

function inningStr(g) {
  if (!/^IN/.test(String(g.status || ''))) return '';
  const label = g.inning_label || (g.inning ? `${g.inning}局` : '');
  return label + mapHalf(g.inning_half);
}

// 今日日期（Asia/Taipei），格式 YYYY-MM-DD
function todayTaipei() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

async function fetchGames() {
  const resp = await axios.get(SOURCE_URL, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'zh-TW,zh;q=0.9' },
    timeout: 30000
  });

  const data = resp.data;
  if (!data || data.ok !== true || !Array.isArray(data.games)) {
    throw new Error('來源回傳異常：' + JSON.stringify(data).slice(0, 200));
  }

  const today = todayTaipei();

  return data.games
    .filter((g) => String(g.date || '').slice(0, 10) === today)
    .map((g) => ({
      gameId: String(g.id),
      status: mapStatus(g),
      awayTeam: (g.away && g.away.name_local) || '',
      homeTeam: (g.home && g.home.name_local) || '',
      awayScore: scoreStr(g.away && g.away.score),
      homeScore: scoreStr(g.home && g.home.score),
      place: g.venue_local || '',
      inning: inningStr(g)
    }));
}

module.exports = {
  fetchGames
};
