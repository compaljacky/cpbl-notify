const fs = require('fs');
const path = require('path');

const stateFile = process.env.STATE_FILE || './cpbl-state.json';

function readState() {
  try {
    const fullPath = path.resolve(stateFile);
    const content = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return {};
  }
}

function writeState(state) {
  const fullPath = path.resolve(stateFile);
  fs.writeFileSync(fullPath, JSON.stringify(state, null, 2), 'utf8');
}

module.exports = {
  readState,
  writeState
};
