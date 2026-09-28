'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const serve_1 = require("./serve");
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
    serve_1.registerServeCommands(context);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map