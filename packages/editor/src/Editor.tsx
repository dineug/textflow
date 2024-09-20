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
import { Provider } from 'jotai';
import type { EditorState, LexicalEditor } from 'lexical';
import { useCallback, useMemo, useState } from 'react';

import { type AppContextState, AppProvider } from '@/components/app-context';
import { ThemeProvider } from '@/components/theme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { extensionCode } from '@/extensions/code/extension';
import { ExtensionManagerProvider } from '@/extensions/context';
import { extensionEmoji } from '@/extensions/emoji/extension';
import { extensionEquation } from '@/extensions/equation/extension';
import { configureExtensions } from '@/extensions/extensionManager';
import { extensionFloatingTextFormatToolbar } from '@/extensions/floating-text-format-toolbar/extension';
import { extensionHorizontalRule } from '@/extensions/horizontal-rule/extension';
import { extensionImage } from '@/extensions/image/extension';
import { extensionLink } from '@/extensions/link/extension';
import { extensionList } from '@/extensions/list/extension';
import { extensionMarkdownShortcut } from '@/extensions/markdown-shortcut/extension';
import { extensionRichText } from '@/extensions/rich-text/extension';
import { extensionSlashCommand } from '@/extensions/slash-command/extension';
import { extensionTable } from '@/extensions/table/extension';
import { cn } from '@/lib/utils';

import * as styles from './Editor.css';

type EditorProps = {
  minHeight?: string;
  initialValue?: string;
  absolutePath?: string;
  onChange?: (value: string) => void;
};

const Editor: React.FC<EditorProps> = ({
  minHeight,
  initialValue,
  absolutePath = '',
  onChange,
}) => {
  const extensionManager = useMemo(
    () =>
      configureExtensions({
        extensions: [
          extensionRichText,
          extensionLink,
          extensionList,
          extensionCode,
          extensionHorizontalRule,
          extensionSlashCommand,
          extensionMarkdownShortcut,
          extensionFloatingTextFormatToolbar,
          extensionEmoji,
          extensionImage,
          extensionEquation,
          extensionTable,
        ],
      }),
    []
  );
  const { getNodes, getTheme, store } = extensionManager;
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
    () => ({ $root, $editor, absolutePath }),
    [$editor, $root, absolutePath]
  );

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
      onChange?.(JSON.stringify(editorState.toJSON(), null, 2));
    },
    [onChange]
  );

  return (
    <ExtensionManagerProvider value={extensionManager}>
      <Provider store={store}>
        <LexicalComposer initialConfig={initialConfig}>
          <AppProvider value={appContext}>
            <ThemeProvider defaultTheme="dark">
              <div ref={setRoot} className={cn('wysidoc-editor', styles.shell)}>
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

                    <extensionRichText.Plugin />
                    <extensionLink.Plugin />
                    <extensionList.Plugin />
                    <extensionCode.Plugin />
                    <extensionHorizontalRule.Plugin />
                    <extensionSlashCommand.Plugin />
                    <extensionMarkdownShortcut.Plugin />
                    <extensionFloatingTextFormatToolbar.Plugin />
                    <extensionEmoji.Plugin />
                    <extensionImage.Plugin />
                    <extensionEquation.Plugin />
                    <extensionTable.Plugin />

                    <AutoFocusPlugin />
                    <HistoryPlugin />
                    <OnChangePlugin
                      ignoreSelectionChange
                      onChange={handleChange}
                    />
                  </div>
                </ScrollArea>
              </div>
            </ThemeProvider>
          </AppProvider>
        </LexicalComposer>
      </Provider>
    </ExtensionManagerProvider>
  );
};

export default Editor;
