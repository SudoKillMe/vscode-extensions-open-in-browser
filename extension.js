var vscode = require('vscode');
var open = require('./src/cmd').open;
var openByMenu = require('./src/cmd').openByMenu;


function activate(context) {

    var openCommand = vscode.commands.registerCommand('extension.openInBrowser', function () {
        open();
    });
    var openFromMenuCommand = vscode.commands.registerCommand('extension.openInBrowserFromMenu', function (fileUrl) {
        openByMenu(fileUrl.fsPath);
    });
    
    context.subscriptions.push(openCommand);
    context.subscriptions.push(openFromMenuCommand);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;