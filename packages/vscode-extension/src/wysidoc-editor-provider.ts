import * as vscode from 'vscode';

import { VIEW_TYPE } from '@/constants/viewType';
import { CreateEditor } from '@/editor';
import { WysidocDocument } from '@/wysidoc-document';

export class WysidocEditorProvider
  implements vscode.CustomEditorProvider<WysidocDocument>
{
  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentContentChangeEvent<WysidocDocument>
  >();
  public readonly onDidChangeCustomDocument =
    this._onDidChangeCustomDocument.event;

  private docToWebviewMap = new Map<WysidocDocument, Set<vscode.Webview>>();

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly viewType: string,
    private readonly createEditor: CreateEditor
  ) {}

  static register(
    context: vscode.ExtensionContext,
    createEditor: CreateEditor
  ): vscode.Disposable {
    const provider = new WysidocEditorProvider(
      context,
      VIEW_TYPE,
      createEditor
    );

    return vscode.window.registerCustomEditorProvider(VIEW_TYPE, provider, {
      webviewOptions: { retainContextWhenHidden: true },
      supportsMultipleEditorsPerDocument: false,
    });
  }

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext
  ): Promise<WysidocDocument> {
    const content = await vscode.workspace.fs.readFile(
      openContext.backupId ? vscode.Uri.parse(openContext.backupId) : uri
    );
    const document = WysidocDocument.create(uri, content);
    const listener = document.onDidChangeContent(() => {
      this._onDidChangeCustomDocument.fire({ document });
    });
    const unsubscribe = () => {};

    if (!this.docToWebviewMap.has(document)) {
      this.docToWebviewMap.set(document, new Set());
    }

    document.onDidDispose(() => {
      listener.dispose();
      unsubscribe();
      this.docToWebviewMap.delete(document);
    });

    return document;
  }

  async resolveCustomEditor(
    document: WysidocDocument,
    webviewPanel: vscode.WebviewPanel
  ) {
    const webviewSet = this.docToWebviewMap.get(document)!;
    const webview = webviewPanel.webview;
    webviewSet.add(webview);

    const editor = this.createEditor(
      document,
      webview,
      this.context,
      this.docToWebviewMap
    );
    const editorDisposable = await editor.bootstrapWebview();

    webviewPanel.onDidDispose(() => {
      editorDisposable.dispose();
      webviewSet.delete(webview);
    });
  }

  async saveCustomDocument(document: WysidocDocument) {
    return await document.save();
  }

  async saveCustomDocumentAs(
    document: WysidocDocument,
    destination: vscode.Uri
  ) {
    return await document.saveAs(destination);
  }

  async revertCustomDocument(document: WysidocDocument) {
    return await document.revert();
  }

  async backupCustomDocument(
    document: WysidocDocument,
    context: vscode.CustomDocumentBackupContext
  ) {
    return await document.backup(context.destination);
  }
}
