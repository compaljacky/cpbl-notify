require('dotenv').config();
const { pushLineMessage } = require('./line');

(async () => {
  try {
    await pushLineMessage('LINE 推播測試成功');
    console.log('推播成功');
  } catch (err) {
    console.error('推播失敗：', err.response?.data || err.message);
  }
})();
