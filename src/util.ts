import Config from './config';
import * as vscode from 'vscode';

const opn = require('opn');

/**
 * get standardized browser name
 * @param name String
 */
function standardizedBrowserName (name: string = ''): string {
  let _name = name.toLowerCase();
  const browser = Config.browsers.find(item => {
    return item.acceptName.indexOf(_name) !== -1;
  });

  return browser ? browser.standardName : '';
}

/**
 * get default browser name
 */
function defaultBrowser (): string {
  const config = vscode.workspace.getConfiguration(Config.app);
  return config ? config.default : '';
}

export const open = (path: string, browser: string = '') => {
  const name = standardizedBrowserName(browser);
  console.log('path: ', path, ' name: ', name);
  opn(path, { app: name ? name : defaultBrowser() })
    .then(res => console.log(res))
    .catch(err => {
      console.log(err);
    });
};