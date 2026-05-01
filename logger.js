const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');

function getLogPath() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(logsDir, `${date}.log`);
}

function formatLine(level, message) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level}] ${message}\n`;
}

function ensureLogsDir() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function log(message) {
  const ts = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
  console.log(`[${ts}] ${message}`);
  ensureLogsDir();
  fs.appendFileSync(getLogPath(), formatLine('INFO', message), 'utf8');
}

function error(message) {
  const ts = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
  console.error(`[${ts}] ${message}`);
  ensureLogsDir();
  fs.appendFileSync(getLogPath(), formatLine('ERROR', message), 'utf8');
}

module.exports = { log, error };
