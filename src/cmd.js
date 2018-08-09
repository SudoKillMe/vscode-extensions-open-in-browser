var vscode = require('vscode');
var util = require('./util');
var acceptBrowsers = require('./config').acceptBrowsers;
var isFocused = util.isFocused;
var isAllowed = util.isAllowed;
var filePath = util.filePath;
var openFile = util.openFile;
var getDefaultBrowser = util.getDefaultBrowser;

function open () {
    
    if (!isFocused()) return;
    
    let path = filePath();
    
    if (!isAllowed()) {
        vscode.window.showInformationMessage('[ open-in-browser ]: Sorry, this file type is not allowed. See your personal settings.');
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
