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
exports.registerServeCommands = void 0;
const vscode = require("vscode");
const path = require("path");
const server_1 = require("./server");
function registerServeCommands(context) {
    const servers = new server_1.LocalServers();
    const report = (error) => {
        console.error('[open-in-browser serve]', error);
        vscode.window.showErrorMessage('Serve mode: ' + error.message);
    };
    context.subscriptions.push(servers);
    context.subscriptions.push(vscode.commands.registerCommand('extension.openInBrowserServe', (resource) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!vscode.workspace.isTrusted) {
                throw new Error('Serve mode requires a trusted workspace.');
            }
            if (vscode.env.remoteName) {
                throw new Error('Serve mode currently supports local workspaces only.');
            }
            const editor = vscode.window.activeTextEditor;
            const uri = resource || (editor && editor.document.uri);
            if (!uri || uri.scheme !== 'file') {
                throw new Error('Select a saved local file. Remote and untitled resources are not supported.');
            }
            const document = vscode.workspace.textDocuments.find(item => item.uri.toString() === uri.toString());
            if (document && document.isUntitled) {
                throw new Error('Save the selected file to disk before starting serve mode.');
            }
            if (document && document.isDirty) {
                const action = yield vscode.window.showWarningMessage(`The selected file has unsaved changes: ${uri.fsPath}`, 'Save and Open');
                if (action !== 'Save and Open') {
                    return;
                }
                if (!(yield document.save()) || document.isDirty) {
                    throw new Error(`Could not save the selected file: ${uri.fsPath}. Serve mode was not started.`);
                }
                if (!vscode.workspace.isTrusted) {
                    throw new Error('Serve mode requires a trusted workspace.');
                }
            }
            const config = vscode.workspace.getConfiguration('open-in-browser', uri);
            const configuredRoot = config.get('serve.root', '${workspaceFolder}');
            const port = config.get('serve.port', 2222);
            if (typeof configuredRoot !== 'string') {
                throw new Error(`Invalid serve.root value ${JSON.stringify(configuredRoot)}. Serve root must be a directory path.`);
            }
            const variable = /^(\$\{workspaceFolder\}|\$\{fileDirname\})(?:[\\/](.*))?$/.exec(configuredRoot);
            let root;
            if (variable && !(variable[2] || '').includes('${')) {
                let base = path.dirname(uri.fsPath);
                if (variable[1] === '${workspaceFolder}') {
                    const folder = vscode.workspace.getWorkspaceFolder(uri);
                    if (!folder || folder.uri.scheme !== 'file') {
                        throw new Error('${workspaceFolder} requires a local workspace folder containing the selected file. Use ${fileDirname} for a standalone file. Selected file: ' + uri.fsPath);
                    }
                    base = folder.uri.fsPath;
                }
                root = path.join(base, variable[2] || '');
            }
            else if (path.isAbsolute(configuredRoot) && !configuredRoot.includes('${')) {
                root = configuredRoot;
            }
            else {
                throw new Error('Invalid serve.root value ' + JSON.stringify(configuredRoot) + '. Serve root must be an absolute path or start with ${workspaceFolder} or ${fileDirname}, optionally followed by /subdirectory. Empty and bare relative paths are not supported.');
            }
            const url = yield servers.open(root, uri.fsPath, port);
            // No browser override: an HTTP URL is opened in the system default browser.
            if (!(yield vscode.env.openExternal(vscode.Uri.parse(url)))) {
                throw new Error('Could not open the system default browser. The server is still running at ' + url);
            }
        }
        catch (error) {
            report(error);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.manageBrowserServers', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const running = servers.list();
            if (!running.length) {
                vscode.window.showInformationMessage('No local servers are running.');
                return;
            }
            const selected = yield vscode.window.showQuickPick(running.map(server => ({
                label: server.root,
                description: `Port ${server.port}`,
                detail: server.url,
                server
            })), { placeHolder: 'Select a local server' });
            if (!selected) {
                return;
            }
            const action = yield vscode.window.showQuickPick(['Open in Browser', 'Copy URL', 'Stop Server'], {
                placeHolder: selected.server.root
            });
            if (!action) {
                return;
            }
            if (!servers.isRunning(selected.server)) {
                throw new Error('This server has already stopped. Open the server manager again to refresh the list.');
            }
            if (action === 'Stop Server') {
                yield servers.stop(selected.server);
            }
            else if (action === 'Copy URL') {
                yield vscode.env.clipboard.writeText(selected.server.url);
            }
            else if (action === 'Open in Browser') {
                if (!(yield vscode.env.openExternal(vscode.Uri.parse(selected.server.url)))) {
                    throw new Error('Could not open the system default browser. The server is still running at ' + selected.server.url);
                }
            }
        }
        catch (error) {
            report(error);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.stopBrowserServers', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield servers.stopAll();
        }
        catch (error) {
            report(error);
        }
    })));
    // Do not leave a removed project's files accessible through an old server.
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        servers.stopAll().catch(report);
    }));
}
exports.registerServeCommands = registerServeCommands;
//# sourceMappingURL=serve.js.map