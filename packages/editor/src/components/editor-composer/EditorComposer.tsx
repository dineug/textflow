import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';
import { Provider as StoreProvider } from 'jotai';
import type { EditorState, LexicalEditor } from 'lexical';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type AppContextState, AppProvider } from '@/components/app-context';
import CommandBar from '@/components/command-bar/CommandBar';
import { type Theme, ThemeProvider } from '@/components/theme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useExtensionManager } from '@/extensions/context';
import type {
  Command,
  CommandListener,
  CommandPayload,
  Dispose,
} from '@/extensions/extensionManager';
import { cn } from '@/lib/utils';

import * as styles from './EditorComposer.css';

type EditorComposerProps = React.PropsWithChildren<{
  minHeight?: string;
  initialValue?: InitialConfigType['editorState'];
  absolutePath?: string;
  fsPath?: string;
  onChange?: React.ComponentProps<typeof OnChangePlugin>['onChange'];
  onThemeChange?: (theme: Theme) => void;
}>;

type EditorComposerRef = {
  theme: () => React.ComponentRef<typeof ThemeProvider> | null;
  registerCommand: <P>(
    command: Command<P>,
    listener: CommandListener<P>
  ) => Dispose;
  executeCommand: <T extends Command<unknown>>(
    command: T,
    payload: CommandPayload<T>
  ) => void;
};

const EditorComposer = forwardRef<EditorComposerRef, EditorComposerProps>(
  (
    {
      minHeight,
      initialValue,
      absolutePath = '',
      fsPath = '',
      children,
      onChange,
      onThemeChange,
    },
    ref
  ) => {
    const { getNodes, getTheme, store, registerCommand, executeCommand } =
      useExtensionManager();
    const initialConfig: InitialConfigType = useMemo(
      () => ({
        namespace: 'wysidoc',
        nodes: [...getNodes()],
        theme: getTheme(),
        editorState: initialValue,
        onError: (error: Error) => {
          throw error;
        },
      }),
      [getNodes, getTheme, initialValue]
    );

    const [$root, setRoot] = useState<HTMLDivElement | null>(null);
    const [$editor, setEditor] = useState<HTMLDivElement | null>(null);
    const appContext: AppContextState = useMemo(
      () => ({ $root, $editor, absolutePath, fsPath }),
      [$editor, $root, absolutePath, fsPath]
    );

    const themeRef = useRef<React.ComponentRef<typeof ThemeProvider>>(null);

    useImperativeHandle(
      ref,
      () => ({
        theme: () => themeRef.current,
        registerCommand,
        executeCommand,
      }),
      [executeCommand, registerCommand]
    );

    const handleChange = useCallback(
      (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
        onChange?.(editorState, editor, tags);
      },
      [onChange]
    );

    return (
      <StoreProvider store={store}>
        <LexicalComposer initialConfig={initialConfig}>
          <AppProvider value={appContext}>
            <ThemeProvider ref={themeRef} onThemeChange={onThemeChange}>
              <TooltipProvider>
                <CommandBar />
                <div
                  ref={setRoot}
                  className={clsx('wysidoc-editor', styles.shell)}
                >
                  <ScrollArea className={styles.container}>
                    <div className={styles.layout}>
                      <RichTextPlugin
                        contentEditable={
                          <div ref={setEditor} className={styles.editor}>
                            <ContentEditable
                              className={styles.contentEditable}
                              style={assignInlineVars({
                                [styles.minHeightVar]: minHeight,
                              })}
                              aria-placeholder={'placeholder...'}
                              placeholder={
                                <div
                                  className={cn(
                                    styles.placeholder,
                                    'text-muted-foreground'
                                  )}
                                >
                                  To use a command, press the '/' key.
                                </div>
                              }
                            />
                          </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                      />
                      {children}
                      <AutoFocusPlugin />
                      <OnChangePlugin
                        ignoreSelectionChange
                        onChange={handleChange}
                      />
                      <HistoryPlugin />
                    </div>
                  </ScrollArea>
                </div>
              </TooltipProvider>
            </ThemeProvider>
          </AppProvider>
        </LexicalComposer>
      </StoreProvider>
    );
  }
);

EditorComposer.displayName = 'EditorComposer';

export default EditorComposer;
