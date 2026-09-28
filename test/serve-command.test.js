const assert = require('assert');
const path = require('path');
const { load } = require('./helpers');
const manifest = require('../package.json');

module.exports = async () => {
  const commands = {};
  const calls = [];
  const opened = [];
  const errors = [];
  const subscriptions = [];
  let stops = 0;
  let disposed = false;
  let foldersChanged;
  let root;
  let port = 2222;
  let browserResult = true;
  let serverError;
  let saveChoice;
  let saveCalls = 0;
  const uri = file => ({ scheme: 'file', fsPath: path.resolve(file), toString() { return 'file://' + this.fsPath; } });
  const active = uri('project/active.html');
  const selected = uri('project/pages/selected.html');
  const folder = uri('project');
  let containingFolder = { uri: folder };
  const vscode = {
    Uri: { parse: value => ({ value }) },
    env: { remoteName: undefined, openExternal: async target => { opened.push(target.value); return browserResult; } },
    workspace: {
      isTrusted: true,
      textDocuments: [],
      getConfiguration: (section, resource) => {
        assert.strictEqual(section, 'open-in-browser');
        assert(resource === selected || resource === active);
        return { get: (key, fallback) => key === 'serve.root' ? (root === undefined ? fallback : root) : port };
      },
      getWorkspaceFolder: resource => { assert(resource === selected || resource === active); return containingFolder; },
      onDidChangeWorkspaceFolders: fn => { foldersChanged = fn; return { dispose() {} }; }
    },
    window: {
      activeTextEditor: { document: { uri: active } },
      showErrorMessage: text => errors.push(text),
      showWarningMessage: async (message, action) => {
        assert(message.includes(selected.fsPath));
        assert.strictEqual(action, 'Save and Open');
        return saveChoice;
      }
    },
    commands: { registerCommand: (name, handler) => { commands[name] = handler; return { dispose() {} }; } }
  };
  class LocalServers {
    async open(...args) {
      calls.push(args);
      if (serverError) throw serverError;
      return 'http://127.0.0.1:2222/pages/selected.html';
    }
    async stopAll() { stops++; }
    dispose() { disposed = true; }
  }
  const serve = load('serve', { vscode, './server': { LocalServers }, console: { error() {} } });
  serve.registerServeCommands({ subscriptions });
  const run = commands['extension.openInBrowserServe'];
  await run(selected);
  assert.deepStrictEqual(calls.pop(), [folder.fsPath, selected.fsPath, 2222]);
  await run();
  assert.deepStrictEqual(calls.pop(), [folder.fsPath, active.fsPath, 2222]);
  root = '${workspaceFolder}';
  port = 3333;
  await run(selected);
  assert.deepStrictEqual(calls.pop(), [folder.fsPath, selected.fsPath, 3333]);
  root = path.resolve('custom-root');
  await run(selected);
  assert.deepStrictEqual(calls.pop(), [root, selected.fsPath, 3333]);
  assert.strictEqual(opened.length, 4);
  assert.strictEqual(errors.length, 0);

  async function blocked(pattern, resource = selected) {
    const beforeCalls = calls.length;
    const beforeOpens = opened.length;
    await run(resource);
    assert(pattern.test(errors.pop()), String(pattern));
    assert.strictEqual(calls.length, beforeCalls);
    assert.strictEqual(opened.length, beforeOpens);
  }
  root = '${workspaceFolder}';
  containingFolder = undefined;
  await blocked(/Use \$\{fileDirname\}/);
  root = undefined;
  await blocked(/Use \$\{fileDirname\}/);
  root = '${fileDirname}';
  await run(selected);
  assert.deepStrictEqual(calls.pop(), [path.dirname(selected.fsPath), selected.fsPath, 3333]);
  root = '${fileDirname}/assets';
  await run(selected);
  assert.deepStrictEqual(calls.pop(), [path.join(path.dirname(selected.fsPath), 'assets'), selected.fsPath, 3333]);
  root = '${workspaceFolder}';
  containingFolder = { uri: { scheme: 'vscode-remote' } };
  await blocked(/local workspace folder/);
  // Resolve from the selected file's owning folder, not the first workspace folder.
  containingFolder = { uri: uri('second-project') };
  root = '${workspaceFolder}/public';
  await run(selected);
  assert.deepStrictEqual(calls.pop(), [path.join(containingFolder.uri.fsPath, 'public'), selected.fsPath, 3333]);
  containingFolder = { uri: folder };
  root = 23;
  await blocked(/directory path/);
  for (const invalid of ['', '.', 'pages', '../public', '${unknown}', '${workspaceFolder}public', '${fileDirname}/${unknown}', '${workspaceFolder}/${fileDirname}', path.resolve('${unknown}')]) {
    root = invalid;
    await blocked(/absolute path or start with/);
  }
  root = '${workspaceFolder}';
  vscode.workspace.isTrusted = false;
  await blocked(/trusted workspace/);
  vscode.workspace.isTrusted = true;
  for (const remote of ['wsl', 'ssh-remote', 'dev-container']) {
    vscode.env.remoteName = remote;
    await blocked(/local workspaces only/);
  }
  vscode.env.remoteName = undefined;
  await blocked(/saved local file/, { scheme: 'vscode-remote' });
  await blocked(/saved local file/, { scheme: 'untitled' });
  vscode.window.activeTextEditor = undefined;
  await blocked(/saved local file/, null);
  vscode.window.activeTextEditor = { document: { uri: active } };
  const dirtyDocument = { uri: selected, isDirty: true, async save() {
    saveCalls++;
    this.isDirty = false;
    return true;
  } };
  vscode.workspace.textDocuments = [dirtyDocument];
  const beforeCancel = calls.length;
  await run(selected);
  assert.strictEqual(calls.length, beforeCancel);
  assert.strictEqual(saveCalls, 0);
  saveChoice = 'Save and Open';
  await run(selected);
  assert.strictEqual(saveCalls, 1);
  assert.strictEqual(calls.length, beforeCancel + 1);
  dirtyDocument.isDirty = true;
  dirtyDocument.save = async () => false;
  await blocked(/Could not save the selected file/);
  dirtyDocument.save = async () => true;
  await blocked(/Could not save the selected file/);
  dirtyDocument.save = async () => { throw new Error('disk full'); };
  await blocked(/disk full/);
  // An unrelated dirty active editor must not prevent opening an Explorer selection.
  vscode.workspace.textDocuments = [{ uri: active, isDirty: true }];
  await run(selected);
  assert.strictEqual(errors.length, 0);
  browserResult = false;
  await run(selected);
  assert(/server is still running at http/.test(errors.pop()));
  serverError = new Error('EACCES');
  const before = opened.length;
  await run(selected);
  assert(/EACCES/.test(errors.pop()));
  assert.strictEqual(opened.length, before);
  await commands['extension.stopBrowserServers']();
  assert.strictEqual(stops, 1);
  foldersChanged();
  assert.strictEqual(stops, 2);
  subscriptions.forEach(subscription => subscription.dispose());
  assert(disposed);

  assert.strictEqual(manifest.engines.vscode, '^1.57.0');
  const contributed = manifest.contributes.commands.find(item => item.command === 'extension.openInBrowserServe');
  assert.strictEqual(contributed.enablement, 'isWorkspaceTrusted && !remoteName');
  assert(manifest.activationEvents.includes('onCommand:extension.openInBrowserServe'));
  assert(manifest.activationEvents.includes('onCommand:extension.stopBrowserServers'));
  assert(manifest.activationEvents.includes('onCommand:extension.manageBrowserServers'));
  assert(manifest.contributes.commands.some(item => item.command === 'extension.manageBrowserServers'));
  for (const menu of ['explorer/context', 'editor/context', 'editor/title/context']) {
    const item = manifest.contributes.menus[menu].find(item => item.command === contributed.command);
    assert(item.when.includes('resourceScheme == file'));
    assert(item.when.includes('isWorkspaceTrusted'));
    assert(item.when.includes('!remoteName'));
  }
  const properties = manifest.contributes.configuration.properties;
  assert.strictEqual(properties['open-in-browser.serve.port'].default, 2222);
  assert.strictEqual(properties['open-in-browser.serve.root'].default, '${workspaceFolder}');
};
