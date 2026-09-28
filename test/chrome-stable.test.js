const assert = require('assert');
const { load } = require('./helpers');
module.exports = () => {
  const config = load('config', {}, 'linux');
  const util = load('util', { './config': config, vscode: {}, opn: () => {} }, 'linux');
  assert.strictEqual(util.standardizedBrowserName('chrome'), 'google-chrome');
  assert.strictEqual(util.standardizedBrowserName('google-chrome-stable'), 'google-chrome-stable');
};
