import * as vscode from 'vscode';

import { VIEW_TYPE } from '@/constants/viewType';
import { widthEditor } from '@/editor';
import { ReferenceListManager } from '@/referenceListManager';
import { WysidocEditor } from '@/wysidoc-editor';
import { WysidocEditorProvider } from '@/wysidoc-editor-provider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    WysidocEditorProvider.register(context, widthEditor(WysidocEditor)),
    vscode.commands.registerCommand('wysidoc.showSource', showSource),
    vscode.commands.registerCommand('wysidoc.showEditor', showEditor),
    vscode.commands.registerCommand('wysidoc.showEditorToSide', uri =>
      showEditor(uri, vscode.ViewColumn.Beside)
    ),
    vscode.commands.registerCommand('wysidoc.showSourceToSide', uri =>
      showSource(uri, vscode.ViewColumn.Beside)
    )
  );
}

export function deactivate() {
  ReferenceListManager.dispose();
}

function showSource(uri: vscode.Uri, viewColumn?: vscode.ViewColumn) {
  vscode.window.showTextDocument(uri, { viewColumn });
}

function showEditor(uri: vscode.Uri, viewColumn?: vscode.ViewColumn) {
  vscode.commands.executeCommand('vscode.openWith', uri, VIEW_TYPE, viewColumn);
}
