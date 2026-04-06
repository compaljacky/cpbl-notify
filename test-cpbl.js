require('dotenv').config();
const { fetchCpblPageText } = require('./cpbl');

(async () => {
  try {
    const text = await fetchCpblPageText();
    console.log(text);
  } catch (err) {
    console.error('抓取失敗：', err.message);
  }
})();
