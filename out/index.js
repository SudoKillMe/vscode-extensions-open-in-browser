"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openBySpecify = exports.openDefault = void 0;
const util_1 = require("./util");
const vscode = require("vscode");
function currentPageUri() {
    return vscode.window.activeTextEditor
        && vscode.window.activeTextEditor.document
        && vscode.window.activeTextEditor.document.uri;
}
/**
 * open default browser
 * if you have specified browser in configuration file,
 * the browser you specified will work.
 * else the system default browser will work.
 */
const openDefault = (path) => {
    let uri;
    if (path) {
        uri = path.fsPath;
    }
    else {
        const _path = currentPageUri();
        uri = _path && _path.fsPath;
    }
    const browser = util_1.standardizedBrowserName(util_1.defaultBrowser());
    util_1.open(uri, browser);
};
exports.openDefault = openDefault;
/**
 * open specify browser
 */
const openBySpecify = (path) => {
    vscode.window.showQuickPick(util_1.browserItems()).then(item => {
        if (!item) {
            return;
        }
        let uri;
        if (path) {
            uri = path.fsPath;
        }
        else {
            const _path = currentPageUri();
            uri = _path && _path.fsPath;
        }
        util_1.open(uri, item.standardName);
    });
};
exports.openBySpecify = openBySpecify;
//# sourceMappingURL=index.js.map