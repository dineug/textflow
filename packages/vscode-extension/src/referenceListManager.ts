import {
  type AnyAction,
  Bridge,
  workerFindReferenceListCommand,
} from '@dineug/wysidoc-editor-vscode-bridge';
import { URL as NodeURL } from 'url';
import * as vscode from 'vscode';
import { Worker } from 'worker_threads';

export const bridge = new Bridge();

export class ReferenceListManager {
  private static instance: ReferenceListManager | null = null;

  static getInstance(): ReferenceListManager {
    if (!ReferenceListManager.instance) {
      ReferenceListManager.instance = new ReferenceListManager();
    }

    return ReferenceListManager.instance;
  }

  static dispose() {
    ReferenceListManager.instance?.dispose();
  }

  worker: Worker;

  private constructor() {
    this.worker = new Worker(
      // @ts-expect-error
      new URL('./findReferenceList.worker.ts', import.meta.url) as NodeURL
    );
    this.worker.on('message', data => {
      bridge.executeAction(data);
    });
  }

  dispatch(action: AnyAction) {
    this.worker.postMessage(action);
  }

  dispose() {
    this.worker.terminate();
  }

  findReferenceList() {
    const rootFolders = getRootFolders();
    if (!rootFolders.length) {
      return;
    }

    this.dispatch(
      Bridge.executeCommand(workerFindReferenceListCommand, rootFolders)
    );
  }
}

function getRootFolders(): string[] {
  return vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders.map(folder => folder.uri.fsPath)
    : [];
}
