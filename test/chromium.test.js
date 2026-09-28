const assert = require('assert');
const { load } = require('./helpers');
module.exports = () => {
  for (const platform of ['linux', 'darwin']) {
    const config = load('config', {}, platform);
    const util = load('util', { './config': config, vscode: {}, opn: () => {} }, platform);
    assert.strictEqual(util.standardizedBrowserName('chromium'), platform === 'linux' ? 'chromium' : 'Chromium');
    if (platform === 'linux') assert.strictEqual(util.standardizedBrowserName('chromium-browser'), 'chromium-browser');
  }
};
