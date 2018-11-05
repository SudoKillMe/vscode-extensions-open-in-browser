import { open, defaultBrowser, standardizedBrowserName } from './util';
import Config from './config';
import * as vscode from 'vscode';

function currentPageUri () {
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
export const openDefault = (path: any): void => {
  let uri;
  if (path) {
    uri = path.fsPath;
  } else {
    const _path = currentPageUri();
    uri = _path && _path.fsPath;
  }
  const browser = standardizedBrowserName(defaultBrowser());
  open(uri, browser);
};

/** 
 * open specify browser
 */
export const openBySpecify = (path: any): void => {
  vscode.window.showQuickPick(
    Config.browsers
  ).then(item => {
    if (!item) {
      return;
    }
    let uri;
    if (path) {
      uri = path.fsPath;
    } else {
      const _path = currentPageUri();
      uri = _path && _path.fsPath;
    }
    open(uri, item.standardName);
  });
};
