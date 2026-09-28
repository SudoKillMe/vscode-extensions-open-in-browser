const assert = require('assert');
const { load } = require('./helpers');
module.exports = async () => {
  const commands = {};
  const errors = [];
  const opened = [];
  const copied = [];
  const stopped = [];
  const messages = [];
  let choices = [];
  let running = [];
  let stale = false;
  let browserResult = true;
  const server = { root: '/project/pages', port: 2345, url: 'http://127.0.0.1:2345/subpages/test.html' };
  class LocalServers {
    list() { return running; }
    isRunning(info) { return !stale && running.includes(info); }
    async stop(info) { stopped.push(info); }
  }
  const vscode = {
    commands: { registerCommand(name, fn) { commands[name] = fn; return { dispose() {} }; } },
    workspace: { onDidChangeWorkspaceFolders() { return { dispose() {} }; } },
    Uri: { parse: url => url },
    env: {
      openExternal: async url => { opened.push(url); return browserResult; },
      clipboard: { writeText: async url => { copied.push(url); } }
    },
    window: {
      showErrorMessage: message => errors.push(message),
      showInformationMessage: message => messages.push(message),
      showQuickPick: async items => {
        if (typeof items[0] !== 'string') {
          assert.strictEqual(items[0].label, server.root);
          assert.strictEqual(items[0].description, 'Port 2345');
          assert.strictEqual(items[0].detail, server.url);
          assert.strictEqual(items[0].server, server);
        }
        const choice = choices.shift();
        return choice === undefined ? undefined : items[choice];
      }
    }
  };
  load('serve', { vscode, './server': { LocalServers }, console: { error() {} } })
    .registerServeCommands({ subscriptions: [] });
  const manage = commands['extension.manageBrowserServers'];
  await manage();
  assert.strictEqual(messages.length, 1);
  running = [server];
  choices = [undefined];
  await manage();
  choices = [0, undefined];
  await manage();
  assert.strictEqual(opened.length + copied.length + stopped.length, 0);
  choices = [0, 0];
  await manage();
  assert.deepStrictEqual(opened, [server.url]);
  choices = [0, 1];
  await manage();
  assert.deepStrictEqual(copied, [server.url]);
  choices = [0, 2];
  await manage();
  assert.deepStrictEqual(stopped, [server]);
  browserResult = false;
  choices = [0, 0];
  await manage();
  assert(errors.pop().includes(server.url));
  stale = true;
  for (const action of [0, 1, 2]) {
    choices = [0, action];
    await manage();
    assert(errors.pop().includes('already stopped'));
  }
  assert.strictEqual(opened.length, 2);
  assert.strictEqual(copied.length, 1);
  assert.strictEqual(stopped.length, 1);
  assert.strictEqual(errors.length, 0);
};
