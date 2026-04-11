require('dotenv').config();
const cron = require('node-cron');
const createWebhookApp = require('./webhook');
const { fetchGames } = require('./cpbl');
const { pushLineMessage } = require('./line');
const { readState, writeState } = require('./state');

function buildScoreKey(game) {
  return [game.awayScore, game.homeScore].join(':');
}

function gameSnapshot(game) {
  return {
    scoreKey: buildScoreKey(game),
    status: game.status,
    awayTeam: game.awayTeam,
    homeTeam: game.homeTeam,
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    place: game.place,
    inning: game.inning
  };
}

function formatScoreMessage(game) {
  return [
    '【中職比分更新】',
    `${game.awayTeam} ${game.awayScore} : ${game.homeScore} ${game.homeTeam}`,
    `局數：${game.inning}`,
    `球場：${game.place}`
  ].join('\n');
}

function formatSuspendedMessage(snap) {
  return [
    '【中職比賽暫停】',
    `${snap.awayTeam} ${snap.awayScore} : ${snap.homeScore} ${snap.homeTeam}`,
    `球場：${snap.place}`
  ].join('\n');
}

function formatResumedMessage(snap) {
  return [
    '【中職比賽恢復】',
    `${snap.awayTeam} ${snap.awayScore} : ${snap.homeScore} ${snap.homeTeam}`,
    `局數：${snap.inning}`,
    `球場：${snap.place}`
  ].join('\n');
}

function formatEndMessage(snap) {
  return [
    '【中職比賽結束】',
    `${snap.awayTeam} ${snap.awayScore} : ${snap.homeScore} ${snap.homeTeam}`,
    `最終比分`,
    `球場：${snap.place}`
  ].join('\n');
}

async function checkScores() {
  console.log('開始檢查比分...');

  const oldState = readState();
  const games = await fetchGames();
  const newState = {};

  for (const game of games) {
    const snap = gameSnapshot(game);
    newState[game.gameId] = snap;

    const old = oldState[game.gameId];

    // 比賽中：判斷比分變化（old.status 也必須是比賽中，避免剛開賽 0:0 誤通知）
    if (game.status === '比賽中') {
      if (old && old.status === '比賽中' && old.scoreKey !== snap.scoreKey) {
        await pushLineMessage(formatScoreMessage(game));
        console.log(`比分變化通知：${game.gameId}`);
        snap.lastNotifiedScoreKey = snap.scoreKey;
      } else {
        snap.lastNotifiedScoreKey = old?.lastNotifiedScoreKey ?? null;
      }
    }

    // 比賽暫停：由「比賽中」變成「比賽暫停」才通知
    if (game.status === '比賽暫停' && old?.status === '比賽中') {
      await pushLineMessage(formatSuspendedMessage(snap));
      console.log(`比賽暫停通知：${game.gameId}`);
      snap.lastNotifiedScoreKey = old?.lastNotifiedScoreKey ?? null;
    }

    // 比賽恢復：由「比賽暫停」變成「比賽中」才通知
    if (game.status === '比賽中' && old?.status === '比賽暫停') {
      await pushLineMessage(formatResumedMessage(game));
      console.log(`比賽恢復通知：${game.gameId}`);
      snap.lastNotifiedScoreKey = old?.lastNotifiedScoreKey ?? null;
    }
  }

  // 先把舊 state 中已結束的場次帶入 newState，避免下次輪詢再次觸發結束通知
  for (const [gameId, oldSnap] of Object.entries(oldState)) {
    if (oldSnap.finished) {
      newState[gameId] = oldSnap;
    }
  }

  // 原本直播中、現在不見或狀態不是「比賽中」→ 比賽結束，且比分與上次推播不同才通知
  for (const [gameId, oldSnap] of Object.entries(oldState)) {
    if (oldSnap.finished) continue;
    if (oldSnap.status !== '比賽中' && oldSnap.status !== '比賽暫停') continue;
    const current = newState[gameId];
    const isStillLive = current && (current.status === '比賽中' || current.status === '比賽暫停');
    if (!isStillLive) {
      const finalSnap = current ?? oldSnap;
      if (finalSnap.scoreKey !== oldSnap.lastNotifiedScoreKey) {
        await pushLineMessage(formatEndMessage(finalSnap));
        console.log(`比賽結束通知：${gameId}`);
      }
      newState[gameId] = { ...(current ?? oldSnap), finished: true };
    }
  }

  writeState(newState);
}

async function main() {
  const app = createWebhookApp();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Webhook server running at http://localhost:${port}`);
  });

  try {
    await checkScores();
  } catch (err) {
    console.error('首次檢查失敗：', err.response?.data || err.message);
  }

  cron.schedule('*/5 * * * *', async () => {
    try {
      await checkScores();
    } catch (err) {
      console.error('排程檢查失敗：', err.response?.data || err.message);
    }
  });
}

main();
