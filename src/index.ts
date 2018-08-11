import { open, currentUri } from './util';
import Config from './config';
import * as vscode from 'vscode';

function currentPageUri () {
  return vscode.window.activeTextEditor
      && vscode.window.activeTextEditor.document
      && vscode.window.activeTextEditor.document.uri;
}

export const openDefault = (path: any): void => {
  //Todo html限定
  let uri;
  if (path) {
    uri = path.fsPath;
    // open(path.fsPath);
  } else {
    const _path = currentPageUri();
    uri = _path && _path.fsPath;
    // _path && open(_path.fsPath);
  }

  open(uri);
};

export const openBySpecify = (path: any): void => {
  console.log('openBySpecify');
  console.log(path);
  vscode.window.showQuickPick(
    Config.browsers
  ).then(item => {
    if (!item) {
      return;
    }
    let uri;
    if (path) {
      console.log('path: ', path);
      uri = path.fsPath;
      // open(path.fsPath);
    } else {
      const _path = currentPageUri();
      console.log('_path: ', _path);
      uri = _path && _path.fsPath;
      // _path && open(_path.fsPath);
    }
    open(uri, item.standardName);
    console.log(item);
  });
};
