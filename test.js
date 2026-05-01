/**
 * CPBL 比分監控 + LINE 推播
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');
const { chromium } = require('playwright');
require('dotenv').config();

const STATE_FILE = process.env.STATE_FILE || './cpbl-state.json';
const CPBL_BOX_URL = process.env.CPBL_BOX_URL || 'https://cpbl.com.tw/box';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_TO = process.env.LINE_TO;

function readState() {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(STATE_FILE), 'utf8'));
  } catch (err) {
    return {};
  }
}

function writeState(state) {
  fs.writeFileSync(path.resolve(STATE_FILE), JSON.stringify(state, null, 2));
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

async function fetchGames() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(CPBL_BOX_URL, { waitUntil: 'networkidle', timeout: 60000 });

    // 依頁面實際 DOM 結構調整 selector
    // 建議先用 DevTools 確認成績卡片的 class 或 data-* 屬性
    const games = await page.evaluate(() => {
      // 這裡是示意寫法，實際 selector 要依官網當下結構調整
      const cards = Array.from(document.querySelectorAll('a, div, li'));
      const results = [];

      cards.forEach((node) => {
        const text = (node.innerText || '').replace(/\s+/g, ' ').trim();

        // 粗略過濾出可能的比賽卡片
        if (!text) return;
        if (!/比賽中|比賽結束|尚未開始|延賽|取消比賽/.test(text)) return;
        if (!/:|VS\./.test(text)) return;

        results.push({
          rawText: text
        });
      });

      return results;
    });

    return games.map((item, idx) => {
      const raw = item.rawText;

      // 可再依實際格式進一步 parse
      return {
        id: `game-${idx + 1}`,
        status: raw.includes('比賽中')
          ? 'LIVE'
          : raw.includes('比賽結束')
          ? 'FINAL'
          : raw.includes('尚未開始')
          ? 'PRE'
          : raw.includes('延賽')
          ? 'POSTPONED'
          : raw.includes('取消比賽')
          ? 'CANCELLED'
          : 'UNKNOWN',
        rawText: raw
      };
    });
  } finally {
    await page.close();
    await browser.close();
  }
}

function hasChanged(prev, curr) {
  return JSON.stringify(prev) !== JSON.stringify(curr);
}

async function pushLineMessage(message) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_TO) {
    console.log('LINE 參數未設定，略過發送：\n', message);
    return;
  }

  await axios.post(
    'https://api.line.me/v2/bot/message/push',
    {
      to: LINE_TO,
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
}

async function checkScores() {
  try {
    const previousState = readState();
    const games = await fetchGames();
    const nextState = {};

    for (const game of games) {
      nextState[game.id] = game;

      if (hasChanged(previousState[game.id], game)) {
        const message = [
          '【比分更新】',
          `場次：${game.id}`,
          `狀態：${game.status}`,
          game.rawText
        ].join('\n');

        await pushLineMessage(message);
        console.log('已通知：', game.id);
      }
    }

    writeState(nextState);
  } catch (err) {
    console.error('檢查失敗：', err.message);
  }
}

// 每分鐘執行一次
cron.schedule('* * * * *', async () => {
  await checkScores();
});

// 啟動時先跑一次
checkScores();
