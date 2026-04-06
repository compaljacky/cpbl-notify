const axios = require('axios');

async function pushLineMessage(text) {
  if (process.env.DRY_RUN === 'true') {
    console.log('[DRY RUN] 不發送 LINE 推播，訊息內容：\n' + text);
    return;
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const targets = (process.env.LINE_TO || '').split(',').map((s) => s.trim()).filter(Boolean);

  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN 未設定');
  }

  if (targets.length === 0) {
    throw new Error('LINE_TO 未設定');
  }

  await Promise.all(
    targets.map((to) =>
      axios.post(
        'https://api.line.me/v2/bot/message/push',
        {
          to,
          messages: [{ type: 'text', text }]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
    )
  );
}

module.exports = {
  pushLineMessage
};
