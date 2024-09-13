import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostSaveValueCommand,
  webviewInitialValueCommand,
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

    const webviewSet = this.docToWebviewMap.get(this.document);

    const dispatch = (action: AnyAction) => {
      this.webview.postMessage(action);
    };

    const dispatchBroadcast = (action: AnyAction) => {
      if (!webviewSet) return;

      Array.from(webviewSet)
        .filter(webview => webview !== this.webview)
        .forEach(webview => webview.postMessage(action));
    };

    const dispose = Bridge.mergeRegister(
      this.bridge.registerCommand(hostInitialCommand, () => {
        dispatch(
          Bridge.executeCommand(webviewInitialValueCommand, {
            value: textDecoder.decode(this.document.content),
          })
        );
      }),
      this.bridge.registerCommand(hostSaveValueCommand, async ({ value }) => {
        await this.document.update(textEncoder.encode(value));
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