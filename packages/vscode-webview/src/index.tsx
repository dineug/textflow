import './webview.css';
import '@dineug/wysidoc-editor/wysidoc-editor.css';

import { Editor } from '@dineug/wysidoc-editor';
import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostSaveValueCommand,
  webviewInitialValueCommand,
  webviewUpdateBaseUrl,
} from '@dineug/wysidoc-editor-vscode-bridge';
import { createRoot } from 'react-dom/client';

const bridge = new Bridge();
const vscode = acquireVsCodeApi();
const container = document.getElementById('root')!;
const root = createRoot(container);
const loading = document.getElementById('loading');
document.getElementById('_defaultStyles')?.remove();

const dispatch = (action: AnyAction) => {
  vscode.postMessage(action);
};

const handleChange = (value: string) => {
  dispatch(Bridge.executeCommand(hostSaveValueCommand, { value }));
};

let absolutePath = '';
let initialValue: string | null | undefined = null;

const render = () => {
  if (initialValue === null) return;

  root.render(
    <Editor
      minHeight="100vh"
      initialValue={initialValue}
      absolutePath={absolutePath}
      onChange={handleChange}
    />
  );
};

Bridge.mergeRegister(
  bridge.registerCommand(webviewUpdateBaseUrl, ({ baseUrl }) => {
    absolutePath = baseUrl;
    render();
  }),
  bridge.registerCommand(webviewInitialValueCommand, ({ value }) => {
    initialValue = value.trim() ? value : undefined;
    loading?.remove();
    render();
  })
);

globalThis.addEventListener('message', event =>
  bridge.executeAction(event.data)
);

dispatch(Bridge.executeCommand(hostInitialCommand, undefined));
