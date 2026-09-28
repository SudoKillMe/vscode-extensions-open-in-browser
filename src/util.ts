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
export const standardizedBrowserName = (name: string = ''): string => {
  if ((process.platform === 'win32' ? win32 : posix).isAbsolute(name)) {
    return name;
  }
  let _name = name.toLowerCase();
  if (process.platform === 'linux' &&
      ['chromium-browser', 'google-chrome-stable'].indexOf(_name) !== -1) {
    return _name;
  }
  const browser = Config.browsers.find(item => {
    return item.acceptName.indexOf(_name) !== -1;
  });

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
        const args = browser ? ['-a', browser, path] : [path];
        if (appArgs.length) {
          args.push('--args', ...appArgs);
        }
        const child = spawn('/usr/bin/open', args);
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
