var vscode = require('vscode');
var util = require('./util');
var isFocused = util.isFocused;
var isHtml = util.isHtml;
var filePath = util.filePath;
var openFile = util.openFile;

function open () {
    
    if (!isFocused()) return;
    
    let path = filePath();
    
    if (!isHtml()) {
        vscode.window.showInformationMessage('[ open-in-browser ]: Sorry, Only HTML File Supported Now ...');
        return;
    }

    let platform = process.platform;
    openFile(platform, path);

}

function openByMenu ( file ) {

    let platform = process.platform;
    openFile(platform, filePath(file));
}

exports.open = open;
exports.openByMenu = openByMenu;