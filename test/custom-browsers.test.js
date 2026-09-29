const assert = require('assert');
const { EventEmitter } = require('events');
const { load } = require('./helpers');

module.exports = async () => {
  for (const platform of ['win32', 'darwin', 'linux']) {
    const executable = platform === 'win32' ? 'D:\\便携 浏览器\\browser.exe'
      : '/opt/便携 浏览器/browser';
    let settings = [
      { displayName: 'My Edge', name: 'edge' },
      { displayName: 'Nightly', name: 'my-browser' },
      { displayName: 'Portable', path: executable },
      null, {}, { displayName: ' ' },
      { displayName: 'Both', name: 'edge', path: executable },
      { displayName: 'Relative', path: './browser' },
      { displayName: 'Invalid', name: 123 },
      { displayName: 'Empty', name: ' ' }
    ];
    const calls = [];
    const errors = [];
    const vscode = {
      workspace: { getConfiguration: () => ({ get: (key, fallback) =>
        key === 'customBrowsers' ? settings : key === 'arguments'
          ? { 'my-browser': ['--private'], [executable]: ['--test'] } : fallback }) },
      window: { showErrorMessage: error => errors.push(error) },
      Uri: { file: path => ({ toString: () => 'file://' + path }) }
    };
    const config = load('config', {}, platform);
    const util = load('util', {
      './config': config, vscode,
      opn: (target, options) => { calls.push({ target, app: Array.from(options.app) }); return Promise.resolve(); },
      './windows': { openWindows: (target, browser, args) => {
        calls.push({ target, app: [browser, ...args] }); return Promise.resolve();
      } },
      child_process: { spawn: (command, args) => {
        calls.push({ command, args: Array.from(args) });
        const child = new EventEmitter();
        setImmediate(() => child.emit('close', 0));
        return child;
      } }
    }, platform);
    const edge = platform === 'win32' ? 'msedge' : platform === 'darwin' ? 'Microsoft Edge' : 'microsoft-edge';
    assert.strictEqual(util.standardizedBrowserName('edge'), edge);
    assert.ok(config.default.browsers.some(item => item.standardName === edge));
    const custom = Array.from(util.browserItems()).slice(config.default.browsers.length);
    assert.deepStrictEqual(custom.map(item => item.label), ['My Edge', 'Nightly', 'Portable']);
    assert.deepStrictEqual(custom.map(item => item.standardName), [edge, 'my-browser', executable]);
    assert.strictEqual(util.standardizedBrowserName('my-browser'), 'my-browser');
    assert.strictEqual(util.standardizedBrowserName('Nightly'), '');

    await util.open('/tmp/a & 中文.html', 'my-browser');
    await util.open('/tmp/a & 中文.html', executable);
    await util.open('/tmp/a & 中文.html', edge);
    if (platform === 'darwin') {
      assert.deepStrictEqual(calls[0], { command: '/usr/bin/open', args: ['-a', 'my-browser', '/tmp/a & 中文.html', '--args', '--private'] });
      assert.deepStrictEqual(calls[1], { command: executable, args: ['--test', '/tmp/a & 中文.html'] });
      assert.deepStrictEqual(calls[2], { command: '/usr/bin/open', args: ['-a', edge, '/tmp/a & 中文.html'] });
      await util.open('/tmp/a.html', '/Applications/My Browser.app');
      assert.deepStrictEqual(calls[3], { command: '/usr/bin/open', args: ['-a', '/Applications/My Browser.app', '/tmp/a.html'] });
    } else {
      assert.deepStrictEqual(calls[0].app, ['my-browser', '--private']);
      assert.deepStrictEqual(calls[1].app, [executable, '--test']);
      assert.deepStrictEqual(calls[2].app, [edge]);
    }
    assert.deepStrictEqual(errors, []);

    // Existing picker consumes the current settings and launches the selected target.
    let picked;
    let opened;
    vscode.window.showQuickPick = items => {
      picked = items.find(item => item.label === 'Nightly');
      return Promise.resolve(picked);
    };
    const index = load('index', { vscode, './util': { ...util, open: (...args) => { opened = args; } } }, platform);
    index.openBySpecify({ fsPath: '/tmp/picker.html' });
    await Promise.resolve();
    assert.deepStrictEqual(opened, ['/tmp/picker.html', 'my-browser']);
    settings = [{ displayName: 'Updated', name: 'new-browser' }];
    assert.strictEqual(util.browserItems().slice(-1)[0].label, 'Updated');
    assert.strictEqual(util.standardizedBrowserName('my-browser'), '');
    settings = 'invalid';
    assert.strictEqual(util.browserItems().length, config.default.browsers.length);
  }
  const schema = require('../package.json').contributes.configuration.properties['open-in-browser.customBrowsers'];
  assert.strictEqual(schema.scope, 'machine');
  assert.strictEqual(schema.items.oneOf.length, 2);
};
