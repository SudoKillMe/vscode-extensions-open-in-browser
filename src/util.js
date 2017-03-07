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

//  if you enter 'ff', this will return 'firefox'
//  because open command needs a correct browser name
function getStandardBrowserName ( name ) {
    // for ( var i in browsers ) {
    //     if ( browsers[i].indexOf( name ) !== -1 ) {
    //         return i;
    //     }
    // }
    // return '';
    var name = name && name.toLowerCase();
    for ( var i=0, l=browsers.length; i<l; i++ ) {

        if ( browsers[i].acceptName.indexOf( name ) !== -1 ) {
            return browsers[i].standardName;
        }
    }
    return '';
}

function openFile ( platform, path, browser ) {
    let cmd;
    let browserName = getStandardBrowserName( browser );
    
    switch (platform) {
        case 'win32':
            cmd = `start "" "${path}"`;
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

exports.isFocused = isFocused;
exports.isHtml = isHtml;
exports.filePath = filePath;
exports.openFile = openFile;