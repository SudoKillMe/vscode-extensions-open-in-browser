'use strict';
import * as vscode from 'vscode';
import { registerServeCommands } from './serve';
import {
    openDefault,
    openBySpecify
} from './index';

export function activate(context: vscode.ExtensionContext) {

    const openDefaultCommand = vscode.commands.registerCommand('extension.openInDefaultBrowser', (path) => {
        openDefault(path);
    });
    const openBySpecifyCommand = vscode.commands.registerCommand('extension.openInSpecifyBrowser', (path) => {
        openBySpecify(path);
    });

    context.subscriptions.push(openDefaultCommand);
    context.subscriptions.push(openBySpecifyCommand);
    registerServeCommands(context);
}

export function deactivate() {
}
