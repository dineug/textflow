import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostOpenReferenceCommand,
  hostSaveThemeCommand,
  hostSaveValueCommand,
  hostUpdateReferenceListCommand,
  webviewInitialValueCommand,
  webviewUpdateBaseUrlCommand,
  webviewUpdateReferenceListCommand,
  webviewUpdateThemeCommand,
} from '@dineug/textflow-editor-vscode-bridge';
import { existsSync } from 'fs';
import { dirname, relative } from 'path';
import * as vscode from 'vscode';

import { getTheme, saveTheme } from '@/configuration';
import { Editor } from '@/editor';
import {
  bridge as workerBridge,
  ReferenceListManager,
} from '@/referenceListManager';
import { textDecoder, textEncoder } from '@/utils';

const THEME_KEYS = [
  'dineug.textflow-editor.theme.appearance',
  'dineug.textflow-editor.theme.grayColor',
  'dineug.textflow-editor.theme.accentColor',
  'workbench.colorTheme',
];

export class TextflowEditor extends Editor {
  assetsDir = 'public';

  async bootstrapWebview() {
    this.webview.options = {
      enableScripts: true,
    };

    const webviewSet = this.docToWebviewMap.get(this.document)!;

    const dispatch = (action: AnyAction) => {
      this.webview.postMessage(action);
    };

    const dispatchBroadcast = (action: AnyAction) => {
      Array.from(webviewSet)
        .filter(webview => webview !== this.webview)
        .forEach(webview => webview.postMessage(action));
    };

    const dispose = Bridge.mergeRegister(
      this.bridge.registerCommand(hostInitialCommand, () => {
        const directoryUri = vscode.Uri.file(dirname(this.document.uri.fsPath));
        const baseUrl = this.webview
          .asWebviewUri(vscode.Uri.joinPath(directoryUri, '/'))
          .toString();

        dispatch(Bridge.executeCommand(webviewUpdateThemeCommand, getTheme()));
        dispatch(
          Bridge.executeCommand(webviewUpdateBaseUrlCommand, {
            baseUrl,
            path: this.document.uri.fsPath,
          })
        );
        dispatch(
          Bridge.executeCommand(webviewInitialValueCommand, {
            value: textDecoder.decode(this.document.content),
          })
        );

        ReferenceListManager.getInstance().findReferenceList();
      }),
      this.bridge.registerCommand(hostSaveValueCommand, async ({ value }) => {
        await this.document.update(textEncoder.encode(value));
      }),
      this.bridge.registerCommand(hostSaveThemeCommand, saveTheme),
      this.bridge.registerCommand(
        hostOpenReferenceCommand,
        ({ relativePath }) => {
          const directoryUri = vscode.Uri.file(
            dirname(this.document.uri.fsPath)
          );
          const targetUri = vscode.Uri.joinPath(directoryUri, relativePath);

          if (existsSync(targetUri.fsPath)) {
            vscode.commands.executeCommand('textflow.showEditor', targetUri);
          } else {
            vscode.window.showWarningMessage(`File not found: ${relativePath}`);
          }
        }
      ),
      workerBridge.registerCommand(hostUpdateReferenceListCommand, list => {
        const directoryPath = dirname(this.document.uri.fsPath);

        dispatch(
          Bridge.executeCommand(
            webviewUpdateReferenceListCommand,
            list.map(value => ({
              ...value,
              relativePath: relative(directoryPath, value.path),
            }))
          )
        );
      })
    );

    const listeners: vscode.Disposable[] = [
      this.webview.onDidReceiveMessage(action =>
        this.bridge.executeAction(action)
      ),
      ...THEME_KEYS.map(key =>
        vscode.workspace.onDidChangeConfiguration(event => {
          if (!event.affectsConfiguration(key, this.document.uri)) {
            return;
          }
          dispatch(
            Bridge.executeCommand(webviewUpdateThemeCommand, getTheme())
          );
        })
      ),
    ];

    this.webview.html = await this.buildHtmlForWebview();

    return new vscode.Disposable(() => {
      listeners.forEach(listener => listener.dispose());
      dispose();
    });
  }
}
