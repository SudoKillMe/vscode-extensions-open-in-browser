var vscode = require('vscode');
var path = require('path');
var exec = require('child_process').exec;

class File {

    constructor ( activeTextEditor ) {

        this.activeTextEditor = activeTextEditor;

    }

    isFocused () {

        return !!(this.activeTextEditor);

    }

    isHtml () {

        return this.activeTextEditor.document.languageId == 'html';

    }

    filePath () {

        let uri = this.activeTextEditor.document.uri;
        
        return 'file://' + uri.fsPath; 

    }

    open () {

        if ( !this.isFocused ) {

            vscode.window.showInformationMessage('please open a html file!');
            return;

        }

        let filePath = this.filePath();

        if ( !this.isHtml(filePath) ) return;

        let platform = process.platform; 
        this.openFile(platform, filePath);

    }

    openFile ( platform, path ) {

        let cmd;
        switch (platform) {
            case 'win32':
                cmd = `start "" "${path}"`;
                break;
            case 'darwin':
                cmd = `start "" "${path}"`;
                break;
            default:
                cmd = `firefox "${path}"`;
                break;
            }

            exec(cmd, function (err, stdout, stderr) {

                if (err) {
                    console.error('error');
                    return;
                }

            });
       

    }

}

module.exports = File;