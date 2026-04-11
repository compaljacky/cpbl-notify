require('dotenv').config();
const cron = require('node-cron');
const createWebhookApp = require('./webhook');
const { fetchGames } = require('./cpbl');
const { pushLineMessage } = require('./line');
const { readState, writeState } = require('./state');
const logger = require('./logger');

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
  logger.log('開始檢查比分...');

  const oldState = readState();
  const games = await fetchGames();
  logger.log(`取得場次數：${games.length}`);
  const newState = {};
  const messages = [];

  for (const game of games) {
    const snap = gameSnapshot(game);
    newState[game.gameId] = snap;

    const old = oldState[game.gameId];
    logger.log(`場次 ${game.gameId}：狀態=${game.status} 比分=${snap.scoreKey} 上次狀態=${old?.status ?? '無'} 上次比分=${old?.scoreKey ?? '無'} 上次通知=${old?.lastNotifiedScoreKey ?? '無'}`);

    // 比賽中：判斷比分變化（old.status 也必須是比賽中，避免剛開賽 0:0 誤通知）
    if (game.status === '比賽中') {
      if (old && old.status === '比賽中' && old.scoreKey !== snap.scoreKey) {
        messages.push(formatScoreMessage(game));
        logger.log(`比分變化通知：${game.gameId}`);
        snap.lastNotifiedScoreKey = snap.scoreKey;
      } else {
        snap.lastNotifiedScoreKey = old?.lastNotifiedScoreKey ?? null;
      }
    }

    // 比賽暫停：由「比賽中」變成「比賽暫停」才通知
    if (game.status === '比賽暫停' && old?.status === '比賽中') {
      messages.push(formatSuspendedMessage(snap));
      logger.log(`比賽暫停通知：${game.gameId}`);
      snap.lastNotifiedScoreKey = old?.lastNotifiedScoreKey ?? null;
    }

    // 比賽恢復：由「比賽暫停」變成「比賽中」才通知
    if (game.status === '比賽中' && old?.status === '比賽暫停') {
      messages.push(formatResumedMessage(game));
      logger.log(`比賽恢復通知：${game.gameId}`);
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
      logger.log(`場次 ${gameId} 結束判斷：finalScore=${finalSnap.scoreKey} lastNotified=${oldSnap.lastNotifiedScoreKey ?? '無'}`);
      if (finalSnap.scoreKey !== oldSnap.lastNotifiedScoreKey) {
        messages.push(formatEndMessage(finalSnap));
        logger.log(`比賽結束通知：${gameId}`);
      } else {
        logger.log(`場次 ${gameId} 結束但比分與上次通知相同，略過`);
      }
      newState[gameId] = { ...(current ?? oldSnap), finished: true };
    }
  }

  if (messages.length > 0) {
    await pushLineMessage(messages.join('\n\n'));
    logger.log(`推播 ${messages.length} 則訊息（合併發送）`);
  }

  writeState(newState);
  logger.log('檢查完畢，state 已寫入');
}

async function main() {
  const app = createWebhookApp();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    logger.log(`Webhook server running at http://localhost:${port}`);
  });

  try {
    await checkScores();
  } catch (err) {
    logger.error(`首次檢查失敗：${err.response?.data || err.message}`);
  }

  cron.schedule('*/5 * * * *', async () => {
    try {
      await checkScores();
    } catch (err) {
      logger.error(`排程檢查失敗：${err.response?.data || err.message}`);
    }
  });
}

main();
