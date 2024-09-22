import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostReplicationChannelCommand,
  hostSaveValueCommand,
  webviewInitialValueCommand,
  webviewReplicationChannelCommand,
  webviewUpdateBaseUrl,
} from '@dineug/wysidoc-editor-vscode-bridge';
import * as vscode from 'vscode';

import { Editor } from '@/editor';
import { textDecoder, textEncoder } from '@/utils';

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

        dispatch(
          Bridge.executeCommand(webviewUpdateBaseUrl, {
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
    ];

    this.webview.html = await this.buildHtmlForWebview();

    return new vscode.Disposable(() => {
      dispose();
      listeners.forEach(listener => listener.dispose());
    });
  }
}
