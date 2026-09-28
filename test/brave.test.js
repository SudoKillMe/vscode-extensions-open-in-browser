const assert = require('assert');
const { load } = require('./helpers');
module.exports = () => {
  for (const [platform, expected] of [['darwin', 'Brave Browser'], ['win32', 'brave'], ['linux', 'brave-browser']]) {
    const config = load('config', {}, platform);
    const util = load('util', { './config': config, vscode: {}, opn: () => {} }, platform);
    for (const alias of ['brave', 'Brave Browser', 'brave-browser']) assert.strictEqual(util.standardizedBrowserName(alias), expected);
  }
};
