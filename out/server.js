"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalServers = void 0;
exports.resolveEntry = resolveEntry;
const http = require("http");
const fs = require("fs");
const path = require("path");
// An allowlist deliberately excludes backend source files and unknown formats.
const contentTypes = {
    '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json',
    '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
    '.avif': 'image/avif', '.ico': 'image/x-icon', '.wasm': 'application/wasm',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.otf': 'font/otf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
    '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.webm': 'video/webm',
    '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json'
};
const realpath = (file) => new Promise((resolve, reject) => {
    fs.realpath(file, (error, result) => error ? reject(error) : resolve(result));
});
const stat = (file) => new Promise((resolve, reject) => {
    fs.stat(file, (error, result) => error ? reject(error) : resolve(result));
});
function safeRelative(root, file) {
    const relative = path.relative(root, file);
    return !path.isAbsolute(relative) && relative.split(path.sep).every(part => part !== '..' && (!part || part.charAt(0) !== '.'));
}
function permittedFile(file) {
    return Object.prototype.hasOwnProperty.call(contentTypes, path.extname(file).toLowerCase());
}
function resolveEntry(root, file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield validateEntry(root, file);
        }
        catch (error) {
            throw new Error(`${error.message}\nSelected file: ${path.resolve(file)}\nServer root: ${path.resolve(root)}`);
        }
    });
}
function validateEntry(root, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const absoluteRoot = path.resolve(root);
        const absoluteFile = path.resolve(file);
        const relative = path.relative(absoluteRoot, absoluteFile);
        if (!safeRelative(absoluteRoot, absoluteFile) || !permittedFile(absoluteFile) ||
            relative.split(path.sep).some(part => /[\\\x00-\x1f\x7f:]/.test(part))) {
            throw new Error('Select an allowed static file inside the server root. Hidden files and backend scripts are not served.');
        }
        const canonicalRoot = yield realpath(absoluteRoot);
        const canonicalFile = yield realpath(absoluteFile);
        if (!(yield stat(canonicalRoot)).isDirectory() || !(yield stat(canonicalFile)).isFile() ||
            !safeRelative(canonicalRoot, canonicalFile) || !permittedFile(canonicalFile)) {
            throw new Error('The entry must be a static file inside the server root, including its symlink target.');
        }
        return { root: canonicalRoot, relative: path.relative(absoluteRoot, absoluteFile) };
    });
}
const encodePath = (relative) => relative.split(path.sep).map(encodeURIComponent).join('/');
function reply(response, status, message) {
    response.statusCode = status;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(message);
}
function serve(root, port, request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        const hosts = ['127.0.0.1:' + port, 'localhost:' + port];
        if (hosts.indexOf(request.headers.host) === -1 ||
            (request.headers.origin && hosts.map(host => 'http://' + host).indexOf(request.headers.origin) === -1)) {
            reply(response, 403, 'Forbidden');
            return;
        }
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            response.setHeader('Allow', 'GET, HEAD');
            reply(response, 405, 'Method not allowed');
            return;
        }
        const rawPath = (request.url || '').split('?')[0];
        let pathname;
        try {
            pathname = decodeURIComponent(rawPath);
        }
        catch (_a) {
            reply(response, 400, 'Invalid URL encoding');
            return;
        }
        if (pathname.charAt(0) !== '/' || pathname.indexOf('//') === 0 || /[\\\x00-\x1f\x7f:]/.test(pathname) ||
            pathname.split('/').some(part => part.charAt(0) === '.')) {
            reply(response, 403, 'Forbidden');
            return;
        }
        let target = path.resolve(root, '.' + pathname);
        try {
            target = yield realpath(target);
            if (!safeRelative(root, target)) {
                reply(response, 403, 'Forbidden');
                return;
            }
            let info = yield stat(target);
            if (info.isDirectory()) {
                if (pathname.charAt(pathname.length - 1) !== '/') {
                    response.statusCode = 302;
                    response.setHeader('Location', pathname.split('/').map(encodeURIComponent).join('/') + '/');
                    response.end();
                    return;
                }
                target = yield realpath(path.join(target, 'index.html'));
                info = yield stat(target);
            }
            if (!safeRelative(root, target) || !permittedFile(target) ||
                (!pathname.endsWith('/') && !permittedFile(pathname))) {
                reply(response, 403, 'Forbidden');
                return;
            }
            if (!info.isFile()) {
                reply(response, 404, 'Not found');
                return;
            }
            response.setHeader('Content-Type', contentTypes[path.extname(target).toLowerCase()]);
            response.setHeader('Content-Length', info.size);
            if (request.method === 'HEAD') {
                response.end();
                return;
            }
            const stream = fs.createReadStream(target);
            response.once('close', () => stream.destroy());
            stream.once('error', () => {
                if (response.headersSent) {
                    response.destroy();
                }
                else {
                    response.removeHeader('Content-Length');
                    reply(response, 500, 'Unable to read file');
                }
            });
            stream.pipe(response);
        }
        catch (error) {
            reply(response, error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 403, 'File unavailable');
        }
    });
}
function listen(root, preferredPort) {
    return new Promise((resolve, reject) => {
        const sockets = new Set();
        let port;
        const server = http.createServer((request, response) => {
            serve(root, port, request, response).catch(error => {
                console.error('[open-in-browser serve]', error);
                if (response.headersSent) {
                    response.destroy();
                }
                else {
                    reply(response, 500, 'Unable to serve file');
                }
            });
        });
        server.timeout = 5000;
        server.on('connection', (socket) => {
            sockets.add(socket);
            socket.once('close', () => sockets.delete(socket));
        });
        const onError = (error) => {
            if (error.code === 'EADDRINUSE' && preferredPort !== 0) {
                preferredPort = 0;
                server.listen(0, '127.0.0.1');
            }
            else {
                reject(error);
            }
        };
        server.on('error', onError);
        server.once('listening', () => {
            port = server.address().port;
            server.removeListener('error', onError);
            server.on('error', error => console.error('[open-in-browser serve]', error));
            resolve({ port, close: () => new Promise(done => {
                    server.close(() => done());
                    sockets.forEach(socket => socket.destroy());
                }) });
        });
        server.listen(preferredPort, '127.0.0.1');
    });
}
class LocalServers {
    constructor() {
        this.servers = new Map();
        this.active = new Map();
        this.generation = 0;
        this.disposed = false;
    }
    open(root, file, port) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Number.isInteger(port) || port < 0 || port > 65535) {
                throw new Error(`Invalid serve.port value ${JSON.stringify(port)}. Serve port must be an integer between 0 and 65535 (0 chooses a free port).`);
            }
            const generation = this.generation;
            const entry = yield resolveEntry(root, file);
            if (this.disposed || generation !== this.generation) {
                throw new Error('Server startup was cancelled.');
            }
            let pending = this.servers.get(entry.root);
            if (!pending) {
                pending = listen(entry.root, port);
                this.servers.set(entry.root, pending);
            }
            let server;
            try {
                server = yield pending;
            }
            catch (error) {
                if (this.servers.get(entry.root) === pending) {
                    this.servers.delete(entry.root);
                }
                throw error;
            }
            if (this.disposed || generation !== this.generation || this.servers.get(entry.root) !== pending) {
                throw new Error('Server startup was cancelled.');
            }
            const url = 'http://127.0.0.1:' + server.port + '/' + encodePath(entry.relative);
            const info = this.active.get(entry.root);
            if (info) {
                info.url = url;
            }
            else {
                this.active.set(entry.root, { root: entry.root, port: server.port, url });
            }
            return url;
        });
    }
    list() {
        return Array.from(this.active.values());
    }
    isRunning(info) {
        return this.active.get(info.root) === info;
    }
    stop(info) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRunning(info)) {
                throw new Error('This server has already stopped. Open the server manager again to refresh the list.');
            }
            const pending = this.servers.get(info.root);
            this.active.delete(info.root);
            this.servers.delete(info.root);
            yield (yield pending).close();
        });
    }
    stopAll() {
        return __awaiter(this, void 0, void 0, function* () {
            this.generation++;
            const pending = Array.from(this.servers.values());
            this.servers.clear();
            this.active.clear();
            yield Promise.all(pending.map(server => server.then(value => value.close(), () => undefined)));
        });
    }
    dispose() {
        this.disposed = true;
        this.stopAll().catch(error => console.error('[open-in-browser serve]', error));
    }
}
exports.LocalServers = LocalServers;
//# sourceMappingURL=server.js.map