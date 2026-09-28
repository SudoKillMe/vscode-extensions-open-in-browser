const assert = require('assert');
const { EventEmitter } = require('events');
const { load } = require('./helpers');
module.exports = async () => {
  for (const target of ['C:\\html & css\\index.html', "C:\\O'Brien\\%TEMP% ! ^ & 文件.html"]) {
    for (const browser of ['', 'C:\\Program Files\\Chrome\\chrome.exe']) {
      let script;
      const launcher = load('windows', { child_process: { spawn: (command, args) => {
        assert.ok(command.endsWith('\\powershell.exe'));
        assert.strictEqual(args[3], '-EncodedCommand');
        script = Buffer.from(args[4], 'base64').toString('utf16le');
        const child = new EventEmitter();
        child.stderr = new EventEmitter();
        setImmediate(() => child.emit('close', 0));
        return child;
      } } }, 'win32');
      await launcher.openWindows(target, browser);
      const literal = value => "'" + value.replace(/'/g, "''") + "'";
      assert.strictEqual(script, "$ErrorActionPreference = 'Stop'; Start-Process -FilePath " + literal(browser || target) +
        (browser ? ' -ArgumentList ' + literal('"' + target + '"') : ''));
    }
  }
  for (const event of ['error', 'close']) {
    const launcher = load('windows', { child_process: { spawn: () => {
      const child = new EventEmitter(); child.stderr = new EventEmitter();
      setImmediate(() => { child.stderr.emit('data', 'access denied'); child.emit(event, event === 'error' ? new Error('ENOENT') : 1); });
      return child;
    } } }, 'win32');
    await assert.rejects(launcher.openWindows('C:\\x.html', ''), /ENOENT|access denied/);
  }
};
