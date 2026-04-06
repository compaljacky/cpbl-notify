require('dotenv').config();
const { fetchGames } = require('./cpbl');

(async () => {
  try {
    const games = await fetchGames();
    console.log(JSON.stringify(games, null, 2));
  } catch (err) {
    console.error('解析失敗：', err.message);
  }
})();
