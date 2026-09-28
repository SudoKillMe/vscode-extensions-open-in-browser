const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const net = require('net');
const { LocalServers, resolveEntry } = require('../out/server');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const req = http.request({ hostname: target.hostname, port: target.port,
      path: target.pathname + target.search, agent: false, ...options }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}
const listen = server => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const close = server => new Promise(resolve => server.close(resolve));

module.exports = async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'open-in-browser-serve-'));
  const root = path.join(temp, 'project');
  const second = path.join(temp, 'second');
  fs.mkdirSync(root);
  fs.mkdirSync(second);
  fs.mkdirSync(path.join(root, 'pages'));
  fs.mkdirSync(path.join(root, 'empty'));
  fs.mkdirSync(path.join(root, '.git'));
  const entry = path.join(root, 'pages', '中文 #?% &.html');
  fs.writeFileSync(entry, '<h1>Hello</h1>');
  fs.writeFileSync(path.join(root, 'index.html'), 'root index');
  fs.writeFileSync(path.join(root, 'pages', 'index.html'), 'pages index');
  fs.writeFileSync(path.join(root, 'app.mjs'), 'export default 42;');
  fs.writeFileSync(path.join(root, 'style.css'), 'body {}');
  fs.writeFileSync(path.join(root, 'data.json'), '{"ok":true}');
  fs.writeFileSync(path.join(root, 'app.wasm'), Buffer.from([0, 97, 115, 109]));
  fs.writeFileSync(path.join(root, 'private.php'), '<?php secret');
  fs.writeFileSync(path.join(root, '.env'), 'SECRET=1');
  fs.writeFileSync(path.join(root, '.git', 'config.json'), 'secret');
  fs.writeFileSync(path.join(root, '.private.html'), 'secret');
  fs.writeFileSync(path.join(temp, 'outside.html'), 'outside');
  fs.writeFileSync(path.join(second, 'index.html'), 'second');
  const manager = new LocalServers();
  const occupied = http.createServer((req, res) => res.end('unrelated'));
  let occupiedListening = false;
  try {
    await listen(occupied);
    occupiedListening = true;
    const preferred = occupied.address().port;
    const urls = await Promise.all(Array.from({ length: 8 }, () => manager.open(root, entry, preferred)));
    assert(urls.every(url => url === urls[0]), 'concurrent clicks reuse one server');
    const url = urls[0];
    const base = new URL(url).origin;
    const initialInfo = manager.list()[0];
    const rootUrl = await manager.open(root, path.join(root, 'index.html'), 0);
    assert.strictEqual(manager.list().length, 1);
    assert.strictEqual(manager.list()[0], initialInfo);
    assert.strictEqual(initialInfo.url, rootUrl, 'manager remembers the most recently opened page');
    await manager.open(root, entry, 0);
    assert.strictEqual(initialInfo.url, url);
    assert.notStrictEqual(new URL(url).port, String(preferred));
    assert(url.includes('%23%3F%25'));
    assert.strictEqual((await request(url)).body, '<h1>Hello</h1>');
    const page = await request(url + '?cache=1');
    assert.strictEqual(page.status, 200);
    assert.strictEqual(page.headers['content-type'], 'text/html; charset=utf-8');
    assert.strictEqual(page.headers['cache-control'], 'no-store');
    assert.strictEqual(page.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(page.headers['access-control-allow-origin'], undefined);
    const head = await request(url, { method: 'HEAD' });
    assert.strictEqual(head.body, '');
    assert.strictEqual(head.headers['content-length'], String(Buffer.byteLength('<h1>Hello</h1>')));
    for (const [file, mime] of [['app.mjs', 'text/javascript; charset=utf-8'], ['style.css', 'text/css; charset=utf-8'], ['app.wasm', 'application/wasm'], ['data.json', 'application/json']]) {
      assert.strictEqual((await request(base + '/' + file)).headers['content-type'], mime);
    }
    assert.strictEqual((await request(base + '/')).body, 'root index');
    const redirect = await request(base + '/pages');
    assert.strictEqual(redirect.status, 302);
    assert.strictEqual(redirect.headers.location, '/pages/');
    assert.strictEqual((await request(base + '/pages/')).body, 'pages index');
    assert.strictEqual((await request(base + '/empty/')).status, 404);
    assert.strictEqual((await request(base + '/missing.html')).status, 404);
    assert.strictEqual((await request(url, { method: 'POST' })).status, 405);
    assert.strictEqual((await request(url, { headers: { Host: 'evil.example:' + new URL(url).port } })).status, 403);
    assert.strictEqual((await request(url, { headers: { Origin: 'https://evil.example' } })).status, 403);
    assert.strictEqual((await request(url, { headers: { Origin: base } })).status, 200);
    for (const malicious of ['/../outside.html', '/%2e%2e/outside.html', '/%2e%2e%2foutside.html', '/..%5coutside.html', '/%00.html', '/.env', '/.git/config.json', '/%2eprivate.html', '/private.php', '/index.html:stream', '//evil.example/index.html']) {
      assert.strictEqual((await request(url, { path: malicious })).status, 403, malicious);
    }
    assert.strictEqual((await request(url, { path: '/bad%ZZ.html' })).status, 400);
    fs.writeFileSync(entry, 'updated');
    assert.strictEqual((await request(url)).body, 'updated');
    fs.unlinkSync(entry);
    assert.strictEqual((await request(url)).status, 404);
    fs.writeFileSync(entry, 'restored');
    // Symlinks may require elevated privileges on Windows; exercise them on Unix.
    if (process.platform !== 'win32') {
      fs.symlinkSync(path.join(temp, 'outside.html'), path.join(root, 'escape.html'));
      fs.symlinkSync(path.join(root, '.private.html'), path.join(root, 'hidden.html'));
      fs.symlinkSync(path.join(root, 'private.php'), path.join(root, 'source.html'));
      fs.symlinkSync(path.join(root, 'index.html'), path.join(root, 'alias.html'));
      fs.symlinkSync(root, path.join(temp, 'root-alias'));
      for (const file of ['escape.html', 'hidden.html', 'source.html']) {
        assert.strictEqual((await request(base + '/' + file)).status, 403);
        await assert.rejects(resolveEntry(root, path.join(root, file)));
      }
      assert.strictEqual((await request(base + '/alias.html')).body, 'root index');
      const alias = await manager.open(path.join(temp, 'root-alias'), path.join(temp, 'root-alias', 'index.html'), 0);
      assert.strictEqual(new URL(alias).origin, base);
    }
    for (const port of [-1, 65536, 1.5, '2222', NaN]) {
      await assert.rejects(manager.open(root, entry, port), /port/);
    }
    await assert.rejects(manager.open(root, path.join(temp, 'outside.html'), 0), error =>
      error.message.includes('Selected file: ' + path.join(temp, 'outside.html')) &&
      error.message.includes('Server root: ' + root));
    await assert.rejects(manager.open(root, path.join(root, 'private.php'), 0));
    await assert.rejects(manager.open(root, path.join(root, '.private.html'), 0));
    await assert.rejects(manager.open(root, path.join(root, 'pages'), 0));
    const other = await manager.open(second, path.join(second, 'index.html'), Number(new URL(url).port));
    assert.notStrictEqual(new URL(other).origin, base);
    assert.strictEqual((await request(other)).body, 'second');
    assert.strictEqual((await request(base + '/')).body, 'root index', 'opening another root must not repoint existing server');
    assert.strictEqual(manager.list().length, 2);
    const info = manager.list().find(item => item.url === other);
    assert.strictEqual(info.port, Number(new URL(other).port));
    await manager.stop(info);
    assert.strictEqual(manager.list().length, 1);
    assert.strictEqual(manager.isRunning(info), false);
    await assert.rejects(request(other));
    assert.strictEqual((await request(base + '/')).body, 'root index');
    await manager.open(second, path.join(second, 'index.html'), 0);
    await assert.rejects(manager.stop(info), /already stopped/);
    assert.strictEqual(manager.list().length, 2, 'a stale selection cannot stop a replacement server');
    // Stop also closes sockets which have not completed their HTTP request.
    const socket = net.connect(Number(new URL(url).port), '127.0.0.1');
    await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('error', reject); });
    const socketClosed = new Promise(resolve => socket.once('close', resolve));
    socket.write('GET / HTTP/1.1\r\n');
    await manager.stopAll();
    assert.deepStrictEqual(manager.list(), []);
    await socketClosed;
    await assert.rejects(request(url));
    await assert.rejects(request(other));
    const restarted = await manager.open(root, entry, Number(new URL(url).port));
    assert.strictEqual(new URL(restarted).origin, base, 'stop releases the listening port');
    await manager.stopAll();
    const cancelled = manager.open(root, entry, 0);
    const rejected = assert.rejects(cancelled, /cancelled/);
    await manager.stopAll();
    await rejected;
    manager.dispose();
    await assert.rejects(manager.open(root, entry, 0), /cancelled/);
  } finally {
    await manager.stopAll();
    if (occupiedListening) await close(occupied);
    fs.rmSync(temp, { recursive: true, force: true });
  }
};
