"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const vscode = require("vscode");
const opn = require('opn');
/**
 * get standardized browser name
 * @param name String
 */
function standardizedBrowserName(name = '') {
    let _name = name.toLowerCase();
    const browser = config_1.default.browsers.find(item => {
        return item.acceptName.indexOf(_name) !== -1;
    });
    return browser ? browser.standardName : '';
}
/**
 * get default browser name
 */
function defaultBrowser() {
    const config = vscode.workspace.getConfiguration(config_1.default.app);
    return config ? config.default : '';
}
exports.currentUri = () => {
    let res = vscode.window.activeTextEditor;
    return res;
};
exports.open = (path, browser = '') => {
    const name = standardizedBrowserName(browser);
    const defaultBrowser;
    ();
    console.log('path: ', path, ' name: ', name);
    opn(path, { app: name ? name : , default:  })
        .then()
        .catch(err => {
        console.log(err);
    });
};
//# sourceMappingURL=util.js.map