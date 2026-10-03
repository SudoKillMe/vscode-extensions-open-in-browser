import Config from './config';
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { openWindows } from './windows';
import { win32, posix } from 'path';

const opn = require('opn');

/**
 * get standardized browser name
 * @param name String
 */
const builtInBrowserName = (name: string = ''): string => {
  if ((process.platform === 'win32' ? win32 : posix).isAbsolute(name)) {
    return name;
  }
  const _name = name.toLowerCase();
  if (process.platform === 'linux' &&
      ['chromium-browser', 'google-chrome-stable'].indexOf(_name) !== -1) {
    return _name;
  }
  const browser = Config.browsers.find(item => {
    return item.acceptName.indexOf(_name) !== -1;
  });

  return browser ? browser.standardName : '';
};

interface CustomBrowser {
  displayName: string;
  name?: string;
  path?: string;
}

/** Read on demand so settings changes are reflected without reloading. */
export const browserItems = () => {
  const configured = vscode.workspace.getConfiguration(Config.app)
    .get<CustomBrowser[]>('customBrowsers', []);
  const custom = (Array.isArray(configured) ? configured : []).filter(item => {
    if (!item || typeof item.displayName !== 'string' || !item.displayName.trim()) {
      return false;
    }
    if (item.name !== undefined && item.path === undefined) {
      return typeof item.name === 'string' && !!item.name.trim();
    }
    return item.name === undefined && typeof item.path === 'string'
      && (process.platform === 'win32' ? win32 : posix).isAbsolute(item.path);
  }).map(item => ({
    label: item.displayName.trim(),
    standardName: item.path || builtInBrowserName(item.name!.trim()) || item.name!.trim(),
    acceptName: item.name ? [item.name.trim()] : []
  }));
  return [...Config.browsers, ...custom];
};

export const standardizedBrowserName = (name: string = ''): string => {
  const builtIn = builtInBrowserName(name);
  if (builtIn) {
    return builtIn;
  }
  const browser = browserItems().find(item => item.standardName === name
    || item.acceptName.indexOf(name) !== -1);
  return browser ? browser.standardName : '';
};

/**
 * get default browser name
 */
export const defaultBrowser = (): string => {
  const config = vscode.workspace.getConfiguration(Config.app);
  return config ? config.default : '';
};

export const open = (path: string, browser: string = '') => {
  const configuredArgs = vscode.workspace.getConfiguration(Config.app)
    .get<{ [name: string]: string[] }>('arguments', {});
  const key = browser && configuredArgs && Object.keys(configuredArgs)
    .find(name => standardizedBrowserName(name) === browser);
  const appArgs = key && Array.isArray(configuredArgs[key])
    && configuredArgs[key].every(value => typeof value === 'string') ? configuredArgs[key] : [];
  const launch = process.platform === 'darwin'
    ? new Promise<void>((resolve, reject) => {
        const executable = posix.isAbsolute(browser) && !/\.app\/?$/i.test(browser);
        const args = executable ? [...appArgs, path]
          : (browser ? ['-a', browser, path] : [path]);
        if (!executable && appArgs.length) {
          args.push('--args', ...appArgs);
        }
        const child = spawn(executable ? browser : '/usr/bin/open', args);
        child.once('error', reject);
        child.once('close', code => code === 0 ? resolve()
          : reject(new Error(`open exited with code ${code}`)));
      })
    : (process.platform === 'win32' ? openWindows(browser ? vscode.Uri.file(path).toString() : path, browser, appArgs)
      : opn(path, { app: browser ? [browser, ...appArgs] : undefined }));
  return launch.catch(error => {
      console.error('[open-in-browser]', error);
      vscode.window.showErrorMessage(`Open browser failed!! Please check if you have installed the browser ${browser} correctly!`);
    });
};
