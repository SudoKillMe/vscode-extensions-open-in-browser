"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const config_1 = require("./config");
const vscode = require("vscode");
function currentPageUri() {
    return vscode.window.activeTextEditor
        && vscode.window.activeTextEditor.document
        && vscode.window.activeTextEditor.document.uri;
}
exports.openDefault = (path) => {
    //Todo html限定
    let uri;
    if (path) {
        uri = path.fsPath;
        // open(path.fsPath);
    }
    else {
        const _path = currentPageUri();
        uri = _path && _path.fsPath;
        // _path && open(_path.fsPath);
    }
    util_1.open(uri);
};
exports.openBySpecify = (path) => {
    console.log('openBySpecify');
    console.log(path);
    vscode.window.showQuickPick(config_1.default.browsers).then(item => {
        if (!item) {
            return;
        }
        let uri;
        if (path) {
            console.log('path: ', path);
            uri = path.fsPath;
            // open(path.fsPath);
        }
        else {
            const _path = currentPageUri();
            console.log('_path: ', _path);
            uri = _path && _path.fsPath;
            // _path && open(_path.fsPath);
        }
        util_1.open(uri, item.standardName);
        console.log(item);
    });
};
//# sourceMappingURL=index.js.map