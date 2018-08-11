'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const index_1 = require("./index");
function activate(context) {
    let openDefaultCommand = vscode.commands.registerCommand('extension.openInDefaultBrowser', (path) => {
        index_1.openDefault(path);
    });
    let openBySpecifyCommand = vscode.commands.registerCommand('extension.openInSpecifyBrowser', (path) => {
        index_1.openBySpecify(path);
    });
    context.subscriptions.push(openDefaultCommand);
    context.subscriptions.push(openBySpecifyCommand);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map