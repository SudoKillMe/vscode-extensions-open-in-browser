const assert = require('assert');
const { load } = require('./helpers');
module.exports = async () => {
  for (const setting of ['', undefined, 'chrome', 'google-chrome-stable', '/opt/custom/browser']) {
    const calls = [];
    const logs = [];
    const messages = [];
    const failure = new Error('xdg-open exited with code 3');
    const vscode = {
      workspace: { getConfiguration: () => ({ default: setting, get: (key, fallback) => fallback }) },
      window: {
        activeTextEditor: { document: { uri: { fsPath: '/tmp/active.html' } } },
        showErrorMessage: message => messages.push(message)
      }
    };
    const config = load('config', {}, 'linux');
    const util = load('util', {
      './config': config, vscode,
      console: { error: (...args) => logs.push(args) },
      opn: (target, options) => { calls.push([target, options.app && Array.from(options.app)]); return Promise.reject(failure); }
    }, 'linux');
    const index = load('index', { './config': config, './util': util, vscode }, 'linux');
    index.openDefault({ fsPath: '/tmp/explorer.html' });
    index.openDefault(undefined);
    await Promise.resolve();
    const expected = setting === 'chrome' ? 'google-chrome' : setting;
    assert.deepStrictEqual(calls, [['/tmp/explorer.html', expected ? [expected] : undefined], ['/tmp/active.html', expected ? [expected] : undefined]]);
    assert.strictEqual(messages.length, 2);
    assert.strictEqual(logs.length, 2);
    assert.strictEqual(logs[0][1], failure);
  }
};
