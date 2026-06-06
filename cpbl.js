const axios = require('axios');

// 透過 Cloudflare Worker relay 拿 CPBL 比分（繞過 GCP 機房 IP 被擋的問題）。
// relay 回傳 CPBL 原始 JSON：{ Success, GameADetailJson: "<字串化的場次陣列>" }

const STATUS_MAP = {
  1: '比賽未開始',
  2: '比賽中',
  3: '比賽結束',
  6: '延賽'
};

function mapStatus(g) {
  // 暫停：比賽中(2) 但 IsGameStop 為 1
  if (g.GameStatus === 2 && String(g.IsGameStop) === '1') return '比賽暫停';
  return STATUS_MAP[g.GameStatus] || String(g.GameStatus);
}

function scoreStr(v) {
  return v === null || v === undefined ? '' : String(v);
}

function inningStr(g) {
  const c = g.CurtBatting;
  if (!c || !c.InningSeq) return '';
  // VisitingHomeType: 1=客隊打擊(上半局)、2=主隊打擊(下半局)
  const half =
    String(c.VisitingHomeType) === '1'
      ? '上'
      : String(c.VisitingHomeType) === '2'
      ? '下'
      : '';
  return `${c.InningSeq}局${half}`;
}

async function fetchGames() {
  const url = process.env.CPBL_RELAY_URL;
  const key = process.env.CPBL_RELAY_KEY;
  if (!url) throw new Error('CPBL_RELAY_URL 未設定');

  const resp = await axios.get(url, {
    params: { key },
    timeout: 30000
  });

  if (!resp.data || resp.data.Success !== true) {
    throw new Error(
      'relay 回傳異常：' + JSON.stringify(resp.data).slice(0, 200)
    );
  }

  const games = JSON.parse(resp.data.GameADetailJson || '[]');

  return games.map((g) => ({
    gameId: String(g.GameSno),
    status: mapStatus(g),
    awayTeam: g.VisitingTeamName || '',
    homeTeam: g.HomeTeamName || '',
    awayScore: scoreStr(g.VisitingTotalScore),
    homeScore: scoreStr(g.HomeTotalScore),
    place: g.FieldAbbe || '',
    inning: inningStr(g)
  }));
}

module.exports = {
  fetchGames
};
