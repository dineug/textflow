import * as vscode from 'vscode';

import { VIEW_TYPE } from '@/constants/viewType';
import { widthEditor } from '@/editor';
import { WysidocEditor } from '@/wysidoc-editor';
import { WysidocEditorProvider } from '@/wysidoc-editor-provider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    WysidocEditorProvider.register(context, widthEditor(WysidocEditor))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('wysidoc.showSource', showSource)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('wysidoc.showEditor', showEditor)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('wysidoc.showEditorToSide', uri =>
      showEditor(uri, vscode.ViewColumn.Beside)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('wysidoc.showSourceToSide', uri =>
      showSource(uri, vscode.ViewColumn.Beside)
    )
  );
}

function showSource(uri: vscode.Uri, viewColumn?: vscode.ViewColumn) {
  vscode.window.showTextDocument(uri, { viewColumn });
}

function showEditor(uri: vscode.Uri, viewColumn?: vscode.ViewColumn) {
  vscode.commands.executeCommand('vscode.openWith', uri, VIEW_TYPE, viewColumn);
}
