var vscode = require('vscode');
var open = require('./src/cmd').open;
var openByMenu = require('./src/cmd').openByMenu;
var openBySpecify = require('./src/cmd').openBySpecify;

function activate(context) {

    var openCommand = vscode.commands.registerCommand('extension.openInBrowser', function () {
        open();
    });
    var openFromMenuCommand = vscode.commands.registerCommand('extension.openInBrowserFromMenu', function (fileUrl) {
        openByMenu( fileUrl.fsPath );
    });
    var openFromSpecifyCommand = vscode.commands.registerCommand('extension.openInSpecifyBrowser', function (fileUrl) {
        openBySpecify( fileUrl.fsPath );
    });

    context.subscriptions.push(openCommand);
    context.subscriptions.push(openFromMenuCommand);
    context.subscriptions.push(openFromSpecifyCommand);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;