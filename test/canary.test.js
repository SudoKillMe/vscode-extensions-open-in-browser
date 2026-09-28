const assert = require('assert');
const { load } = require('./helpers');
module.exports = () => {
  const old = process.env.LOCALAPPDATA;
  process.env.LOCALAPPDATA = 'C:\\Users\\Test User\\AppData\\Local';
  try {
    for (const platform of ['win32', 'darwin', 'linux']) {
      const item = load('config', {}, platform).default.browsers.find(b => b.acceptName.includes('canary'));
      if (platform === 'linux') assert.strictEqual(item, undefined);
      else assert.strictEqual(item.standardName, platform === 'darwin' ? 'Google Chrome Canary' : process.env.LOCALAPPDATA + '\\Google\\Chrome SxS\\Application\\chrome.exe');
    }
  } finally {
    if (old === undefined) delete process.env.LOCALAPPDATA; else process.env.LOCALAPPDATA = old;
  }
};
