var vscode = require('vscode');
var util = require('./util');
var acceptBrowsers = require('./config').acceptBrowsers;
var isFocused = util.isFocused;
var isHtml = util.isHtml;
var filePath = util.filePath;
var openFile = util.openFile;
var getDefaultBrowser = util.getDefaultBrowser;

function open () {
    
    if (!isFocused()) return;
    
    let path = filePath();
    
    if (!isHtml()) {
        vscode.window.showInformationMessage('[ open-in-browser ]: Sorry, Only HTML File Supported Now ...');
        return;
    }

    let browser = getDefaultBrowser();
    let platform = process.platform;
    openFile( platform, path, browser );

}

function openByMenu ( file ) {

    let platform = process.platform;
    let browser = getDefaultBrowser();

    openFile(platform, filePath(file), browser);
}

function openBySpecify ( file ) {

    if ( !file ) {
        file = filePath();
    } else {
        file = filePath( file );
    }

    let platform = process.platform;
    vscode.window.showQuickPick( acceptBrowsers ).then( function ( item ) {
        if ( !item ) return;
        openFile( platform, file, item.standardName );
    } );
}

module.exports = {
    open: open,
    openByMenu: openByMenu,
    openBySpecify: openBySpecify
}
