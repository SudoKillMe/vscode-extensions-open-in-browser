var vscode = require( 'vscode' );
var path = require( 'path' );
var browsers = require( './config' ).acceptBrowsers;
var exec = require( 'child_process' ).exec;

function isFocused () {
    return !!vscode.window.activeTextEditor;
}

function isHtml () {
    return vscode.window.activeTextEditor.document.languageId == 'html';
}

function filePath ( file ) {
    if (!file) {
        let uri = vscode.window.activeTextEditor.document.uri;
        return 'file://' + uri.fsPath;
    }

    return 'file://' + file;
}

/**
 * convert name to standard name
 * example: ff => firefox
 * @param {String} name 
 */
function getStandardBrowserName ( name ) {
    var name = name && name.toLowerCase();
    for ( var i=0, l=browsers.length; i<l; i++ ) {

        if ( browsers[i].acceptName.indexOf( name ) !== -1 ) {
            return browsers[i].standardName;
        }
    }
    return '';
}
/**
 * get browser that specified in configuration file
 */
function getDefaultBrowser () {
    let browser = '';
    let config = vscode.workspace.getConfiguration( 'open-in-browser' );

    if ( config.default ) {
        browser = config.default;
    }

    return browser;
}

function openFile ( platform, path, browser ) {
    let cmd;
    let browserName = getStandardBrowserName( browser );
    console.log(browserName);
    switch (platform) {
        case 'win32':
            cmd = browserName
                ? `start ${browserName} "${path}"`
                : `start "" "${path}"`;
            break;
        case 'darwin':
            cmd = browserName 
                ? `open "${path}" -a "${browserName}"`
                : `open "${path}"`;
            break;
        default:
            cmd = browserName 
                ? `${browserName} "${path}"`
                : `xdg-open "${path}"`;
            break;
    }

    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            vscode.window.showErrorMessage('error occured!!');
        }
    });
}

module.exports = {
    isFocused: isFocused,
    isHtml: isHtml,
    filePath: filePath,
    openFile: openFile,
    getDefaultBrowser: getDefaultBrowser
}
