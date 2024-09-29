import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostReplicationChannelCommand,
  hostSaveThemeCommand,
  hostSaveValueCommand,
  webviewInitialValueCommand,
  webviewReplicationChannelCommand,
  webviewUpdateBaseUrlCommand,
  webviewUpdateThemeCommand,
} from '@dineug/wysidoc-editor-vscode-bridge';
import * as vscode from 'vscode';

import { getTheme, saveTheme } from '@/configuration';
import { Editor } from '@/editor';
import { textDecoder, textEncoder } from '@/utils';

const THEME_KEYS = [
  'dineug.wysidoc-editor.theme.appearance',
  'dineug.wysidoc-editor.theme.grayColor',
  'dineug.wysidoc-editor.theme.accentColor',
  'workbench.colorTheme',
];

export class WysidocEditor extends Editor {
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
        const fileUrl = this.webview.asWebviewUri(this.document.uri).toString();

        dispatch(Bridge.executeCommand(webviewUpdateThemeCommand, getTheme()));
        dispatch(
          Bridge.executeCommand(webviewUpdateBaseUrlCommand, {
            baseUrl: fileUrl.substring(0, fileUrl.lastIndexOf('/') + 1),
          })
        );
        dispatch(
          Bridge.executeCommand(webviewInitialValueCommand, {
            value: textDecoder.decode(this.document.content),
          })
        );
      }),
      this.bridge.registerCommand(hostSaveValueCommand, async ({ value }) => {
        await this.document.update(textEncoder.encode(value));
      }),
      this.bridge.registerCommand(hostSaveThemeCommand, saveTheme),
      this.bridge.registerCommand(hostReplicationChannelCommand, payload => {
        dispatchBroadcast(
          Bridge.executeCommand(webviewReplicationChannelCommand, payload)
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
