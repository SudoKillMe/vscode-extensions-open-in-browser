// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var File = require('./src/file');

function activate(context) {

    var disposable = vscode.commands.registerCommand('extension.openInBrowser', function () {
     

        var current = vscode.window.activeTextEditor;
        var file = new File(current);

        file.open();

    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;