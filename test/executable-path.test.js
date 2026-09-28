const assert = require('assert');
const { load } = require('./helpers');
module.exports = () => {
  for (const [platform, executable] of [
    ['win32', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
    ['win32', '\\\\server\\Programs\\Chrome.exe'],
    ['linux', '/opt/Google Chrome/chrome'], ['darwin', '/Applications/Google Chrome.app']
  ]) {
    const util = load('util', { './config': load('config', {}, platform), vscode: {} }, platform);
    assert.strictEqual(util.standardizedBrowserName(executable), executable);
    assert.strictEqual(util.standardizedBrowserName('unknown-browser'), '');
    assert.strictEqual(util.standardizedBrowserName(), '');
  }
};
