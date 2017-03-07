var vscode = require('vscode');
var util = require('./util');
var acceptBrowsers = require('./config').acceptBrowsers;
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

    // user defined browser that open in default
    let browser = '';
    let config = vscode.workspace.getConfiguration( 'open-in-browser' );

    if ( config.default ) {
        browser = config.default;
    }

    let platform = process.platform;
    openFile( platform, path, browser );

}

function openByMenu ( file ) {

    let platform = process.platform;
    openFile(platform, filePath(file));
}

function openBySpecify ( file ) {

    let platform = process.platform;
    vscode.window.showQuickPick( acceptBrowsers ).then( function ( item ) {
        if ( !item ) return;
        console.log( item );
        openFile( platform, filePath( file ), item.standardName );
    } );
}

exports.open = open;
exports.openByMenu = openByMenu;
exports.openBySpecify = openBySpecify;