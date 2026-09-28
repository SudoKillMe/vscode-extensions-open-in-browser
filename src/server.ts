import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { Socket, AddressInfo } from 'net';

// An allowlist deliberately excludes backend source files and unknown formats.
const contentTypes: { [extension: string]: string } = {
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

const realpath = (file: string): Promise<string> => new Promise((resolve, reject) => {
    fs.realpath(file, (error, result) => error ? reject(error) : resolve(result));
});
const stat = (file: string): Promise<fs.Stats> => new Promise((resolve, reject) => {
    fs.stat(file, (error, result) => error ? reject(error) : resolve(result));
});

function safeRelative(root: string, file: string): boolean {
    const relative = path.relative(root, file);
    return !path.isAbsolute(relative) && relative.split(path.sep).every(part =>
        part !== '..' && (!part || part.charAt(0) !== '.'));
}

function permittedFile(file: string): boolean {
    return Object.prototype.hasOwnProperty.call(contentTypes, path.extname(file).toLowerCase());
}

export async function resolveEntry(root: string, file: string): Promise<{ root: string, relative: string }> {
    try {
        return await validateEntry(root, file);
    } catch (error) {
        throw new Error(`${error.message}\nSelected file: ${path.resolve(file)}\nServer root: ${path.resolve(root)}`);
    }
}

async function validateEntry(root: string, file: string): Promise<{ root: string, relative: string }> {
    const absoluteRoot = path.resolve(root);
    const absoluteFile = path.resolve(file);
    const relative = path.relative(absoluteRoot, absoluteFile);
    if (!safeRelative(absoluteRoot, absoluteFile) || !permittedFile(absoluteFile) ||
        relative.split(path.sep).some(part => /[\\\x00-\x1f\x7f:]/.test(part))) {
        throw new Error('Select an allowed static file inside the server root. Hidden files and backend scripts are not served.');
    }
    const canonicalRoot = await realpath(absoluteRoot);
    const canonicalFile = await realpath(absoluteFile);
    if (!(await stat(canonicalRoot)).isDirectory() || !(await stat(canonicalFile)).isFile() ||
        !safeRelative(canonicalRoot, canonicalFile) || !permittedFile(canonicalFile)) {
        throw new Error('The entry must be a static file inside the server root, including its symlink target.');
    }
    return { root: canonicalRoot, relative: path.relative(absoluteRoot, absoluteFile) };
}

const encodePath = (relative: string): string => relative.split(path.sep).map(encodeURIComponent).join('/');

function reply(response: http.ServerResponse, status: number, message: string): void {
    response.statusCode = status;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(message);
}

async function serve(root: string, port: number, request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const hosts = ['127.0.0.1:' + port, 'localhost:' + port];
    if (hosts.indexOf(request.headers.host as string) === -1 ||
        (request.headers.origin && hosts.map(host => 'http://' + host).indexOf(request.headers.origin as string) === -1)) {
        reply(response, 403, 'Forbidden');
        return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD');
        reply(response, 405, 'Method not allowed');
        return;
    }
    const rawPath = (request.url || '').split('?')[0];
    let pathname: string;
    try {
        pathname = decodeURIComponent(rawPath);
    } catch (_) {
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
        target = await realpath(target);
        if (!safeRelative(root, target)) {
            reply(response, 403, 'Forbidden');
            return;
        }
        let info = await stat(target);
        if (info.isDirectory()) {
            if (pathname.charAt(pathname.length - 1) !== '/') {
                response.statusCode = 302;
                response.setHeader('Location', pathname.split('/').map(encodeURIComponent).join('/') + '/');
                response.end();
                return;
            }
            target = await realpath(path.join(target, 'index.html'));
            info = await stat(target);
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
            } else {
                response.removeHeader('Content-Length');
                reply(response, 500, 'Unable to read file');
            }
        });
        stream.pipe(response);
    } catch (error) {
        reply(response, error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 403, 'File unavailable');
    }
}

interface RunningServer {
    port: number;
    close(): Promise<void>;
}

function listen(root: string, preferredPort: number): Promise<RunningServer> {
    return new Promise((resolve, reject) => {
        const sockets = new Set<Socket>();
        let port: number;
        const server = http.createServer((request, response) => {
            serve(root, port, request, response).catch(error => {
                console.error('[open-in-browser serve]', error);
                if (response.headersSent) {
                    response.destroy();
                } else {
                    reply(response, 500, 'Unable to serve file');
                }
            });
        });
        server.timeout = 5000;
        server.on('connection', (socket: Socket) => {
            sockets.add(socket);
            socket.once('close', () => sockets.delete(socket));
        });
        const onError = (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE' && preferredPort !== 0) {
                preferredPort = 0;
                server.listen(0, '127.0.0.1');
            } else {
                reject(error);
            }
        };
        server.on('error', onError);
        server.once('listening', () => {
            port = (server.address() as AddressInfo).port;
            server.removeListener('error', onError);
            server.on('error', error => console.error('[open-in-browser serve]', error));
            resolve({ port, close: () => new Promise<void>(done => {
                server.close(() => done());
                sockets.forEach(socket => socket.destroy());
            }) });
        });
        server.listen(preferredPort, '127.0.0.1');
    });
}

export interface LocalServerInfo {
    readonly root: string;
    readonly port: number;
    url: string;
}

export class LocalServers {
    private servers = new Map<string, Promise<RunningServer>>();
    private active = new Map<string, LocalServerInfo>();
    private generation = 0;
    private disposed = false;

    async open(root: string, file: string, port: number): Promise<string> {
        if (!Number.isInteger(port) || port < 0 || port > 65535) {
            throw new Error(`Invalid serve.port value ${JSON.stringify(port)}. Serve port must be an integer between 0 and 65535 (0 chooses a free port).`);
        }
        const generation = this.generation;
        const entry = await resolveEntry(root, file);
        if (this.disposed || generation !== this.generation) {
            throw new Error('Server startup was cancelled.');
        }
        let pending = this.servers.get(entry.root);
        if (!pending) {
            pending = listen(entry.root, port);
            this.servers.set(entry.root, pending);
        }
        let server: RunningServer;
        try {
            server = await pending;
        } catch (error) {
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
        } else {
            this.active.set(entry.root, { root: entry.root, port: server.port, url });
        }
        return url;
    }

    list(): LocalServerInfo[] {
        return Array.from(this.active.values());
    }

    isRunning(info: LocalServerInfo): boolean {
        return this.active.get(info.root) === info;
    }

    async stop(info: LocalServerInfo): Promise<void> {
        if (!this.isRunning(info)) {
            throw new Error('This server has already stopped. Open the server manager again to refresh the list.');
        }
        const pending = this.servers.get(info.root);
        this.active.delete(info.root);
        this.servers.delete(info.root);
        await (await pending).close();
    }

    async stopAll(): Promise<void> {
        this.generation++;
        const pending = Array.from(this.servers.values());
        this.servers.clear();
        this.active.clear();
        await Promise.all(pending.map(server => server.then(value => value.close(), () => undefined)));
    }

    dispose(): void {
        this.disposed = true;
        this.stopAll().catch(error => console.error('[open-in-browser serve]', error));
    }
}
