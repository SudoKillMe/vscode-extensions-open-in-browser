'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const serve_1 = require("./serve");
const index_1 = require("./index");
function activate(context) {
    const openDefaultCommand = vscode.commands.registerCommand('extension.openInDefaultBrowser', (path) => {
        (0, index_1.openDefault)(path);
    });
    const openBySpecifyCommand = vscode.commands.registerCommand('extension.openInSpecifyBrowser', (path) => {
        (0, index_1.openBySpecify)(path);
    });
    context.subscriptions.push(openDefaultCommand);
    context.subscriptions.push(openBySpecifyCommand);
    (0, serve_1.registerServeCommands)(context);
}
function deactivate() {
}
//# sourceMappingURL=extension.js.map