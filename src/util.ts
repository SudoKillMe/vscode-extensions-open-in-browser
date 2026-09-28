import Config from './config';
import * as vscode from 'vscode';
import { spawn } from 'child_process';

const opn = require('opn');

/**
 * get standardized browser name
 * @param name String
 */
export const standardizedBrowserName = (name: string = ''): string => {
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
  const launch = process.platform === 'darwin'
    ? new Promise<void>((resolve, reject) => {
        const args = browser ? ['-a', browser, path] : [path];
        const child = spawn('/usr/bin/open', args);
        child.once('error', reject);
        child.once('close', code => code === 0 ? resolve()
          : reject(new Error(`open exited with code ${code}`)));
      })
    : opn(path, { app: browser });
  return launch.catch(error => {
      console.error('[open-in-browser]', error);
      vscode.window.showErrorMessage(`Open browser failed!! Please check if you have installed the browser ${browser} correctly!`);
    });
};
