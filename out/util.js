"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.open = exports.defaultBrowser = exports.standardizedBrowserName = exports.browserItems = void 0;
const config_1 = require("./config");
const vscode = require("vscode");
const child_process_1 = require("child_process");
const windows_1 = require("./windows");
const path_1 = require("path");
const opn = require('opn');
/**
 * get standardized browser name
 * @param name String
 */
const builtInBrowserName = (name = '') => {
    if ((process.platform === 'win32' ? path_1.win32 : path_1.posix).isAbsolute(name)) {
        return name;
    }
    let _name = name.toLowerCase();
    if (process.platform === 'linux' &&
        ['chromium-browser', 'google-chrome-stable'].indexOf(_name) !== -1) {
        return _name;
    }
    const browser = config_1.default.browsers.find(item => {
        return item.acceptName.indexOf(_name) !== -1;
    });
    return browser ? browser.standardName : '';
};
/** Read on demand so settings changes are reflected without reloading. */
const browserItems = () => {
    const configured = vscode.workspace.getConfiguration(config_1.default.app)
        .get('customBrowsers', []);
    const custom = (Array.isArray(configured) ? configured : []).filter(item => {
        if (!item || typeof item.displayName !== 'string' || !item.displayName.trim()) {
            return false;
        }
        if (item.name !== undefined && item.path === undefined) {
            return typeof item.name === 'string' && !!item.name.trim();
        }
        return item.name === undefined && typeof item.path === 'string'
            && (process.platform === 'win32' ? path_1.win32 : path_1.posix).isAbsolute(item.path);
    }).map(item => ({
        label: item.displayName.trim(),
        standardName: item.path || builtInBrowserName(item.name.trim()) || item.name.trim(),
        acceptName: item.name ? [item.name.trim()] : []
    }));
    return [...config_1.default.browsers, ...custom];
};
exports.browserItems = browserItems;
const standardizedBrowserName = (name = '') => {
    const builtIn = builtInBrowserName(name);
    if (builtIn) {
        return builtIn;
    }
    const browser = exports.browserItems().find(item => item.standardName === name
        || item.acceptName.indexOf(name) !== -1);
    return browser ? browser.standardName : '';
};
exports.standardizedBrowserName = standardizedBrowserName;
/**
 * get default browser name
 */
const defaultBrowser = () => {
    const config = vscode.workspace.getConfiguration(config_1.default.app);
    return config ? config.default : '';
};
exports.defaultBrowser = defaultBrowser;
const open = (path, browser = '') => {
    const configuredArgs = vscode.workspace.getConfiguration(config_1.default.app)
        .get('arguments', {});
    const key = browser && configuredArgs && Object.keys(configuredArgs)
        .find(name => exports.standardizedBrowserName(name) === browser);
    const appArgs = key && Array.isArray(configuredArgs[key])
        && configuredArgs[key].every(value => typeof value === 'string') ? configuredArgs[key] : [];
    const launch = process.platform === 'darwin'
        ? new Promise((resolve, reject) => {
            const executable = path_1.posix.isAbsolute(browser) && !/\.app\/?$/i.test(browser);
            const args = executable ? [...appArgs, path]
                : (browser ? ['-a', browser, path] : [path]);
            if (!executable && appArgs.length) {
                args.push('--args', ...appArgs);
            }
            const child = child_process_1.spawn(executable ? browser : '/usr/bin/open', args);
            child.once('error', reject);
            child.once('close', code => code === 0 ? resolve()
                : reject(new Error(`open exited with code ${code}`)));
        })
        : (process.platform === 'win32' ? windows_1.openWindows(browser ? vscode.Uri.file(path).toString() : path, browser, appArgs)
            : opn(path, { app: browser ? [browser, ...appArgs] : undefined }));
    return launch.catch(error => {
        console.error('[open-in-browser]', error);
        vscode.window.showErrorMessage(`Open browser failed!! Please check if you have installed the browser ${browser} correctly!`);
    });
};
exports.open = open;
//# sourceMappingURL=util.js.map