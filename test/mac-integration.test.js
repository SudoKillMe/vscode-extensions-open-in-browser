const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { load } = require('./helpers');
module.exports = async () => {
  if (process.platform !== 'darwin') {
    console.log('SKIP macOS LaunchServices integration (requires macOS)');
    return;
  }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'open-in-browser-'));
  const app = path.join(root, 'Test Browser.app');
  const contents = path.join(app, 'Contents');
  fs.mkdirSync(path.join(contents, 'MacOS'), { recursive: true });
  const marker = path.join(root, 'arguments.json');
  const done = path.join(root, 'done');
  // A background-only fixture: exercise LaunchServices without opening browser UI.
  fs.writeFileSync(path.join(contents, 'Info.plist'), `<?xml version="1.0"?><plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>browser</string>
<key>CFBundleIdentifier</key><string>test.open-in-browser.fixture</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSBackgroundOnly</key><true/>
</dict></plist>`);
  const script = path.join(root, 'browser.js');
  fs.writeFileSync(script, `require('fs').writeFileSync(${JSON.stringify(marker)}, JSON.stringify(process.argv.slice(2))); setTimeout(() => require('fs').writeFileSync(${JSON.stringify(done)}, 'done'), 1500);`);
  const quote = value => "'" + value.replace(/'/g, "'\\''") + "'";
  const executable = path.join(contents, 'MacOS', 'browser');
  fs.writeFileSync(executable, `#!/bin/sh\nexec ${quote(process.execPath)} ${quote(script)} "$@"\n`, { mode: 0o755 });
  const file = path.join(root, 'a & b - 文件.html');
  fs.writeFileSync(file, '<!doctype html><title>test</title>');
  const errors = [];
  const args = ['--profile=with spaces', '--literal=a&b'];
  const util = load('util', {
    './config': load('config'),
    vscode: {
      workspace: { getConfiguration: () => ({ get: () => ({ [app]: args, [executable]: args }) }) },
      window: { showErrorMessage: message => errors.push(message) }
    }
  });
  try {
    await util.open(file, app);
    assert.deepStrictEqual(errors, []);
    assert.ok(!fs.existsSync(done), 'open must finish before the application exits');
    const deadline = Date.now() + 10000;
    while (!fs.existsSync(done) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
    assert.ok(fs.existsSync(done), 'fixture must finish');
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(marker, 'utf8')), args);
    fs.unlinkSync(marker);
    await util.open(file, executable);
    assert.deepStrictEqual(errors, []);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(marker, 'utf8')), [...args, file]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};
