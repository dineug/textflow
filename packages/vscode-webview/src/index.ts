import './webview.css';
import '@dineug/wysidoc-editor/wysidoc-editor.css';

import { Editor } from '@dineug/wysidoc-editor';
import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostSaveValueCommand,
  webviewInitialValueCommand,
} from '@dineug/wysidoc-editor-vscode-bridge';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

const bridge = new Bridge();
const vscode = acquireVsCodeApi();
const container = document.getElementById('root')!;
const root = createRoot(container);
const loading = document.getElementById('loading');

const dispatch = (action: AnyAction) => {
  vscode.postMessage(action);
};

const handleChange = (value: string) => {
  dispatch(Bridge.executeCommand(hostSaveValueCommand, { value }));
};

Bridge.mergeRegister(
  bridge.registerCommand(webviewInitialValueCommand, ({ value }) => {
    loading?.remove();
    root.render(
      createElement(Editor, {
        minHeight: '100vh',
        initialValue: value,
        onChange: handleChange,
      })
    );
  })
);

globalThis.addEventListener('message', event =>
  bridge.executeAction(event.data)
);

dispatch(Bridge.executeCommand(hostInitialCommand, undefined));
