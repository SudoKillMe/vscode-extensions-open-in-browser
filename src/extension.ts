'use strict';
import * as vscode from 'vscode';
import {
    openDefault,
    openBySpecify
} from './index';

export function activate(context: vscode.ExtensionContext) {

    let openDefaultCommand = vscode.commands.registerCommand('extension.openInDefaultBrowser', (path) => {
        openDefault(path);
    });
    let openBySpecifyCommand = vscode.commands.registerCommand('extension.openInSpecifyBrowser', (path) => {
        openBySpecify(path);
    });

    context.subscriptions.push(openDefaultCommand);
    context.subscriptions.push(openBySpecifyCommand);
}

export function deactivate() {
}