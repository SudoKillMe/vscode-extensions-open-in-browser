// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var open = require('./src/cmd').open;
var openByMenu = require('./src/cmd').openByMenu;
// var File = require('./src/file');

function activate(context) {

    var openCommand = vscode.commands.registerCommand('extension.openInBrowser', function () {
        open();
    });
    var openFromMenuCommand = vscode.commands.registerCommand('extension.openInBrowserFromMenu', function (fileUrl) {
        var fileUrl = fileUrl;
        openByMenu(fileUrl.fsPath);
    });
    
    context.subscriptions.push(openCommand);
    context.subscriptions.push(openFromMenuCommand);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;