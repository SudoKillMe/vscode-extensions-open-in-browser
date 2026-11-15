const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');
const { load } = require('./helpers');

module.exports = async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-lifecycle-'));
  const file = path.join(root, 'index.html');
  fs.writeFileSync(file, 'test');
  const created = [];
  let onListen;
  const waitingForListen = () => new Promise(resolve => { onListen = resolve; });
  class FakeServer extends EventEmitter {
    constructor() { super(); this.closed = false; this.listenCalls = []; }
    listen(port, host) {
      this.listenCalls.push([port, host]);
      if (onListen) { const notify = onListen; onListen = undefined; notify(this); }
    }
    address() { return { port: 54321 }; }
    close(callback) { this.closed = true; callback(); }
  }
  const { LocalServers } = load('server', { http: { createServer() {
    const server = new FakeServer();
    created.push(server);
    return server;
  } } });
  const manager = new LocalServers();
  try {
    let ready = waitingForListen();
    const opening = manager.open(root, file, 2222);
    const rejection = assert.rejects(opening, /cancelled/);
    const first = await ready;
    const stopping = manager.stopAll();
    first.emit('listening');
    await rejection;
    await stopping;
    assert(first.closed, 'stop waits for and closes an in-flight listener');
    assert.deepStrictEqual(first.listenCalls, [[2222, '127.0.0.1']]);

    ready = waitingForListen();
    const failed = manager.open(root, file, 2222);
    const failedAssertion = assert.rejects(failed, /permission denied/);
    const second = await ready;
    second.emit('error', Object.assign(new Error('permission denied'), { code: 'EACCES' }));
    await failedAssertion;
    ready = waitingForListen();
    const retried = manager.open(root, file, 2222);
    const third = await ready;
    third.emit('error', Object.assign(new Error('occupied'), { code: 'EADDRINUSE' }));
    assert.deepStrictEqual(third.listenCalls, [[2222, '127.0.0.1'], [0, '127.0.0.1']]);
    third.emit('listening');
    assert.strictEqual(await retried, 'http://127.0.0.1:54321/index.html');
    assert.strictEqual(created.length, 3, 'failed starts are evicted so they can be retried');
    await manager.stopAll();
    assert(third.closed);

    ready = waitingForListen();
    const disposing = manager.open(root, file, 0);
    const disposedAssertion = assert.rejects(disposing, /cancelled/);
    const fourth = await ready;
    manager.dispose();
    fourth.emit('listening');
    await disposedAssertion;
    assert(fourth.closed, 'deactivation closes even a pending server');

    // Model Windows realpath preserving input casing on every test platform.
    const caseServers = [];
    const { LocalServers: WindowsLocalServers } = load('server', {
      path: path.win32,
      fs: {
        realpath(file, callback) { callback(null, file); },
        stat(file, callback) {
          callback(null, { isDirectory: () => !file.endsWith('.html'), isFile: () => file.endsWith('.html') });
        }
      },
      http: { createServer() {
        const server = new FakeServer();
        caseServers.push(server);
        // Complete even an unexpected second listener so the assertions can fail.
        process.nextTick(() => server.emit('listening'));
        return server;
      } }
    }, 'win32');
    const casing = new WindowsLocalServers();
    try {
      await casing.open('c:\\Serve', 'c:\\Serve\\index.html', 3333);
      const variantUrl = await casing.open('C:\\sERVE', 'C:\\sERVE\\index.html', 3333);
      assert.strictEqual(caseServers.length, 1, 'casing variant reuses the running server');
      assert.strictEqual(variantUrl, 'http://127.0.0.1:54321/index.html');
      assert.strictEqual(casing.list().length, 1, 'server manager lists the directory once');
      await casing.stop(casing.list()[0]);
      assert.strictEqual(casing.list().length, 0, 'stop works for a server opened with another casing');
      assert(caseServers[0].closed, 'stop closes the reused listener');
    } finally {
      await casing.stopAll();
    }
  } finally {
    await manager.stopAll();
    fs.rmSync(root, { recursive: true, force: true });
  }
};
