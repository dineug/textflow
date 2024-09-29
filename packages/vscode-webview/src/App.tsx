import '@dineug/wysidoc-editor/wysidoc-editor.css';

import { Editor, type Theme } from '@dineug/wysidoc-editor';
import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostSaveThemeCommand,
  hostSaveValueCommand,
  webviewInitialValueCommand,
  webviewUpdateBaseUrlCommand,
  webviewUpdateThemeCommand,
} from '@dineug/wysidoc-editor-vscode-bridge';
import { useCallback, useEffect, useRef, useState } from 'react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [absolutePath, setAbsolutePath] = useState('');
  const [initialValue, setInitialValue] = useState<string | null | undefined>(
    null
  );
  const [__vscode, dispatch] = useVscode();

  const editorRef = useRef<React.ComponentRef<typeof Editor>>(null);

  const handleChange = useCallback(
    (value: string) => {
      dispatch(Bridge.executeCommand(hostSaveValueCommand, { value }));
    },
    [dispatch]
  );

  const handleThemeChange = useCallback(
    (theme: Theme) => {
      dispatch(Bridge.executeCommand(hostSaveThemeCommand, theme));
    },
    [dispatch]
  );

  useEffect(() => {
    const bridge = new Bridge();

    const dispose = Bridge.mergeRegister(
      bridge.registerCommand(webviewUpdateBaseUrlCommand, ({ baseUrl }) => {
        setAbsolutePath(baseUrl);
      }),
      bridge.registerCommand(webviewInitialValueCommand, ({ value }) => {
        setInitialValue(value.trim() ? value : undefined);
        document.getElementById('loading')?.remove();
        setLoading(false);
      }),
      bridge.registerCommand(webviewUpdateThemeCommand, theme => {
        editorRef.current?.theme()?.setTheme(theme);
      })
    );

    const handleMessage = (event: MessageEvent<any>) => {
      bridge.executeAction(event.data);
    };

    globalThis.addEventListener('message', handleMessage);

    dispatch(Bridge.executeCommand(hostInitialCommand, undefined));

    return () => {
      globalThis.removeEventListener('message', handleMessage);
      dispose();
    };
  }, [dispatch]);

  if (loading || initialValue === null) {
    return null;
  }

  return (
    <Editor
      ref={editorRef}
      minHeight="100vh"
      initialValue={initialValue}
      absolutePath={absolutePath}
      onChange={handleChange}
      onThemeChange={handleThemeChange}
    />
  );
};

App.displayName = 'App';

function useVscode(): [
  ReturnType<typeof acquireVsCodeApi>,
  (action: AnyAction) => void,
] {
  const [vscode] = useState(acquireVsCodeApi);

  const dispatch = useCallback(
    (action: AnyAction) => {
      vscode.postMessage(action);
    },
    [vscode]
  );

  return [vscode, dispatch];
}

export default App;
