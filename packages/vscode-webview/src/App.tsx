import '@dineug/textflow-editor/textflow-editor.css';

import { hasAppleDevice } from '@dineug/shared';
import {
  Editor,
  openReferenceCommand,
  setReferenceListCommand,
  type Theme,
} from '@dineug/textflow-editor';
import {
  AnyAction,
  Bridge,
  hostInitialCommand,
  hostOpenReferenceCommand,
  hostSaveThemeCommand,
  hostSaveValueCommand,
  webviewInitialValueCommand,
  webviewUpdateBaseUrlCommand,
  webviewUpdateReadonlyCommand,
  webviewUpdateReferenceListCommand,
  webviewUpdateThemeCommand,
} from '@dineug/textflow-editor-vscode-bridge';
import { useCallback, useEffect, useRef, useState } from 'react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [readonly, setReadonly] = useState(false);
  const [absolutePath, setAbsolutePath] = useState('');
  const [fsPath, setFsPath] = useState('');
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
      bridge.registerCommand(
        webviewUpdateBaseUrlCommand,
        ({ baseUrl, path }) => {
          setAbsolutePath(baseUrl);
          setFsPath(path);
        }
      ),
      bridge.registerCommand(webviewInitialValueCommand, ({ value }) => {
        setInitialValue(value.trim() ? value : undefined);
        document.getElementById('loading')?.remove();
        setLoading(false);
      }),
      bridge.registerCommand(webviewUpdateThemeCommand, theme => {
        editorRef.current?.theme()?.setTheme(theme);
      }),
      bridge.registerCommand(webviewUpdateReferenceListCommand, list => {
        editorRef.current?.executeCommand(setReferenceListCommand, list);
      }),
      bridge.registerCommand(webviewUpdateReadonlyCommand, setReadonly)
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

  useEffect(() => {
    const $editor = editorRef.current;
    if (!$editor) return;

    return $editor.registerCommand(openReferenceCommand, payload => {
      dispatch(Bridge.executeCommand(hostOpenReferenceCommand, payload));
    });
  }, [dispatch, loading]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const $mod = hasAppleDevice() ? event.metaKey : event.ctrlKey;

      if ($mod && event.code === 'KeyZ') {
        event.stopPropagation();
      }
    };

    document.body.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  if (loading || initialValue === null) {
    return null;
  }

  return (
    <Editor
      ref={editorRef}
      minHeight="100vh"
      initialValue={initialValue}
      absolutePath={absolutePath}
      fsPath={fsPath}
      readonly={readonly}
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
