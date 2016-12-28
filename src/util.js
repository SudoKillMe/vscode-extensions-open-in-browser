var vscode = require('vscode');
var path = require('path');
var exec = require('child_process').exec;

function isFocused () {
    return !!vscode.window.activeTextEditor;
}

function isHtml () {
    return vscode.window.activeTextEditor.document.languageId == 'html';
}

function filePath ( file ) {
    if (!file) {
        let uri = vscode.window.activeTextEditor.document.uri;
        return uri;
    }

    return 'file://' + file;
}

function openFile ( platform, path ) {
    let cmd;
    switch (platform) {
        case 'win32':
            cmd = `start "" "${path}"`;
            break;
        case 'darwin':
            cmd = `open "${path}"`;
            break;
        default:
            cmd = `xdg-open "${path}"`;
            break;
    }

    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            vscode.window.showErrorMessage('error occured!!');
        }
    });
}

exports.isFocused = isFocused;
exports.isHtml = isHtml;
exports.filePath = filePath;
exports.openFile = openFile;