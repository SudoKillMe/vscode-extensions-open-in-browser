const assert = require('assert');
const { EventEmitter } = require('events');
const { load } = require('./helpers');
module.exports = async () => {
  const values = ['--incognito', '--user-data-dir=C:\\Profile With Spaces\\', '--flag=a"b', ''];
  for (const platform of ['darwin', 'linux', 'win32']) {
    const calls = [];
    const util = load('util', {
      './config': load('config', {}, platform),
      vscode: {
        workspace: { getConfiguration: () => ({ get: () => ({ chrome: values, firefox: 'invalid' }) }) },
        Uri: { file: path => ({ toString: () => 'file://' + path }) }
      },
      opn: (target, options) => { calls.push({ target, options }); return Promise.resolve(); },
      './windows': { openWindows: (target, browser, args) => { calls.push({ target, browser, args: Array.from(args) }); return Promise.resolve(); } },
      child_process: { spawn: (command, args) => {
        calls.push({ command, args: Array.from(args) });
        const child = new EventEmitter(); setImmediate(() => child.emit('close', 0)); return child;
      } }
    }, platform);
    const chrome = util.standardizedBrowserName('chrome');
    await util.open('/tmp/a.html', chrome);
    await util.open('/tmp/a.html', 'firefox');
    await util.open('/tmp/a.html');
    if (platform === 'darwin') {
      assert.deepStrictEqual(calls.map(c => c.args), [ ['-a', chrome, '/tmp/a.html', '--args', ...values], ['-a', 'firefox', '/tmp/a.html'], ['/tmp/a.html'] ]);
    } else if (platform === 'linux') {
      assert.deepStrictEqual(Array.from(calls[0].options.app), [chrome, ...values]);
      assert.deepStrictEqual(Array.from(calls[1].options.app), ['firefox']);
      assert.strictEqual(calls[2].options.app, undefined);
    } else {
      assert.deepStrictEqual(calls.map(c => c.args), [values, [], []]);
    }
  }
};
