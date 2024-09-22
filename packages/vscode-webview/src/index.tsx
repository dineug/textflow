import './webview.css';
import '@dineug/wysidoc-editor/wysidoc-editor.css';

import { Editor, replicationPort } from '@dineug/wysidoc-editor';
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
import * as base64 from 'base64-arraybuffer';
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
      // isCollab
      onChange={handleChange}
    />
  );
};

replicationPort.onmessage = (event: MessageEvent<Uint8Array>) => {
  dispatch(
    Bridge.executeCommand(
      hostReplicationChannelCommand,
      base64.encode(event.data.buffer)
    )
  );
};
replicationPort.start();

Bridge.mergeRegister(
  bridge.registerCommand(webviewUpdateBaseUrl, ({ baseUrl }) => {
    absolutePath = baseUrl;
    render();
  }),
  bridge.registerCommand(webviewInitialValueCommand, ({ value }) => {
    initialValue = value.trim() ? value : undefined;
    loading?.remove();
    render();
  }),
  bridge.registerCommand(webviewReplicationChannelCommand, payload => {
    replicationPort.postMessage(new Uint8Array(base64.decode(payload)));
  })
);

globalThis.addEventListener('message', event =>
  bridge.executeAction(event.data)
);

dispatch(Bridge.executeCommand(hostInitialCommand, undefined));
