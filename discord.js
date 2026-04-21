const axios = require('axios');

async function pushDiscordMessage(text) {
  if (process.env.DRY_RUN === 'true') {
    console.log('[DRY RUN] 不發送 Discord 推播，訊息內容：\n' + text);
    return;
  }

  const webhookUrls = (process.env.DISCORD_WEBHOOK_URLS || '').split(',').map((s) => s.trim()).filter(Boolean);

  if (webhookUrls.length === 0) {
    throw new Error('DISCORD_WEBHOOK_URLS 未設定');
  }

  await Promise.all(
    webhookUrls.map((url) =>
      axios.post(url, { content: text })
    )
  );
}

module.exports = {
  pushDiscordMessage
};
