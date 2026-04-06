const express = require('express');

function createWebhookApp() {
  const app = express();
  app.use(express.json());

  app.post('/webhook', (req, res) => {
    const events = req.body.events || [];

    events.forEach((event) => {
      console.log('Webhook event:', JSON.stringify(event, null, 2));

      const source = event.source || {};
      if (source.userId) {
        console.log('你的 LINE userId =', source.userId);
      }
      if (source.groupId) {
        console.log('你的 LINE groupId =', source.groupId);
      }
    });

    res.sendStatus(200);
  });

  app.get('/', (req, res) => {
    res.send('LINE webhook server is running');
  });

  return app;
}

module.exports = createWebhookApp;
