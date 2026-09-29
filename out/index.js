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
    const browser = (0, util_1.standardizedBrowserName)((0, util_1.defaultBrowser)());
    (0, util_1.open)(uri, browser);
};
exports.openDefault = openDefault;
/**
 * open specify browser
 */
const openBySpecify = (path) => {
    vscode.window.showQuickPick((0, util_1.browserItems)()).then(item => {
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
        (0, util_1.open)(uri, item.standardName);
    });
};
exports.openBySpecify = openBySpecify;
//# sourceMappingURL=index.js.map