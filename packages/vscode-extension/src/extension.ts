import * as vscode from 'vscode';

import { VIEW_TYPE } from '@/constants/viewType';
import { widthEditor } from '@/editor';
import { ReferenceListManager } from '@/referenceListManager';
import { TextflowEditor } from '@/textflow-editor';
import { TextflowEditorProvider } from '@/textflow-editor-provider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    TextflowEditorProvider.register(context, widthEditor(TextflowEditor)),
    vscode.commands.registerCommand('textflow.showSource', showSource),
    vscode.commands.registerCommand('textflow.showEditor', showEditor),
    vscode.commands.registerCommand('textflow.showEditorToSide', uri =>
      showEditor(uri, vscode.ViewColumn.Beside)
    ),
    vscode.commands.registerCommand('textflow.showSourceToSide', uri =>
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
