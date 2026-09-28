import * as vscode from 'vscode';
import * as path from 'path';
import { LocalServers } from './server';

export function registerServeCommands(context: vscode.ExtensionContext): void {
    const servers = new LocalServers();
    const report = (error: Error) => {
        console.error('[open-in-browser serve]', error);
        vscode.window.showErrorMessage('Serve mode: ' + error.message);
    };
    context.subscriptions.push(servers);
    context.subscriptions.push(vscode.commands.registerCommand('extension.openInBrowserServe', async (resource?: vscode.Uri) => {
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
                const action = await vscode.window.showWarningMessage(
                    `The selected file has unsaved changes: ${uri.fsPath}`, 'Save and Open');
                if (action !== 'Save and Open') {
                    return;
                }
                if (!await document.save() || document.isDirty) {
                    throw new Error(`Could not save the selected file: ${uri.fsPath}. Serve mode was not started.`);
                }
                if (!vscode.workspace.isTrusted) {
                    throw new Error('Serve mode requires a trusted workspace.');
                }
            }
            const config = vscode.workspace.getConfiguration('open-in-browser', uri);
            const configuredRoot = config.get<string>('serve.root', '${workspaceFolder}');
            const port = config.get<number>('serve.port', 2222);
            if (typeof configuredRoot !== 'string') {
                throw new Error(`Invalid serve.root value ${JSON.stringify(configuredRoot)}. Serve root must be a directory path.`);
            }
            const variable = /^(\$\{workspaceFolder\}|\$\{fileDirname\})(?:[\\/](.*))?$/.exec(configuredRoot);
            let root: string;
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
            } else if (path.isAbsolute(configuredRoot) && !configuredRoot.includes('${')) {
                root = configuredRoot;
            } else {
                throw new Error('Invalid serve.root value ' + JSON.stringify(configuredRoot) + '. Serve root must be an absolute path or start with ${workspaceFolder} or ${fileDirname}, optionally followed by /subdirectory. Empty and bare relative paths are not supported.');
            }
            const url = await servers.open(root, uri.fsPath, port);
            // No browser override: an HTTP URL is opened in the system default browser.
            if (!await vscode.env.openExternal(vscode.Uri.parse(url))) {
                throw new Error('Could not open the system default browser. The server is still running at ' + url);
            }
        } catch (error) {
            report(error);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.manageBrowserServers', async () => {
        try {
            const running = servers.list();
            if (!running.length) {
                vscode.window.showInformationMessage('No local servers are running.');
                return;
            }
            const selected = await vscode.window.showQuickPick(running.map(server => ({
                label: server.root,
                description: `Port ${server.port}`,
                detail: server.url,
                server
            })), { placeHolder: 'Select a local server' });
            if (!selected) {
                return;
            }
            const action = await vscode.window.showQuickPick(['Open in Browser', 'Copy URL', 'Stop Server'], {
                placeHolder: selected.server.root
            });
            if (!action) {
                return;
            }
            if (!servers.isRunning(selected.server)) {
                throw new Error('This server has already stopped. Open the server manager again to refresh the list.');
            }
            if (action === 'Stop Server') {
                await servers.stop(selected.server);
            } else if (action === 'Copy URL') {
                await vscode.env.clipboard.writeText(selected.server.url);
            } else if (action === 'Open in Browser') {
                if (!await vscode.env.openExternal(vscode.Uri.parse(selected.server.url))) {
                    throw new Error('Could not open the system default browser. The server is still running at ' + selected.server.url);
                }
            }
        } catch (error) {
            report(error);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.stopBrowserServers', async () => {
        try {
            await servers.stopAll();
        } catch (error) {
            report(error);
        }
    }));
    // Do not leave a removed project's files accessible through an old server.
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        servers.stopAll().catch(report);
    }));
}
