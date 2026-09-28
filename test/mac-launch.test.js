const assert = require('assert');
const { EventEmitter } = require('events');
const { load } = require('./helpers');
module.exports = async () => {
  for (const outcome of [0, 1, 'error']) {
    const errors = [];
    let call;
    const util = load('util', {
      './config': load('config', {}, 'darwin'),
      vscode: { window: { showErrorMessage: message => errors.push(message) } },
      child_process: { spawn: (command, args) => {
        call = { command, args: Array.from(args) };
        const child = new EventEmitter();
        setImmediate(() => outcome === 'error' ? child.emit('error', new Error('test spawn failure')) : child.emit('close', outcome));
        return child;
      } }
    }, 'darwin');
    await util.open('/tmp/a & b.html', 'Firefox Developer Edition');
    assert.deepStrictEqual(call, { command: '/usr/bin/open', args: ['-a', 'Firefox Developer Edition', '/tmp/a & b.html'] });
    assert.strictEqual(errors.length, outcome === 0 ? 0 : 1);
  }
};
