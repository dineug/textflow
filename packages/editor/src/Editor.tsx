import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { Provider } from 'jotai';
import { useMemo, useState } from 'react';

import { AppProvider } from '@/components/app-context';
import { ThemeProvider } from '@/components/theme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { extensionCode } from '@/extensions/code/extension';
import { ExtensionManagerProvider } from '@/extensions/context';
import { configureExtensions } from '@/extensions/extensionManager';
import { extensionFloatingTextFormatToolbar } from '@/extensions/floating-text-format-toolbar/extension';
import { extensionHorizontalRule } from '@/extensions/horizontal-rule/extension';
import { extensionLink } from '@/extensions/link/extension';
import { extensionList } from '@/extensions/list/extension';
import { extensionMarkdownShortcut } from '@/extensions/markdown-shortcut/extension';
import { extensionRichText } from '@/extensions/rich-text/extension';
import { extensionSlashCommand } from '@/extensions/slash-command/extension';
import { cn } from '@/lib/utils';

import * as styles from './Editor.css';

type EditorProps = {
  minHeight?: string;
};

const Editor: React.FC<EditorProps> = ({ minHeight }) => {
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
      onError: (error: Error) => {
        throw error;
      },
    }),
    [getNodes, getTheme]
  );

  const [$root, setRoot] = useState<HTMLDivElement | null>(null);
  const [$editor, setEditor] = useState<HTMLDivElement | null>(null);
  const appContext = useMemo(() => ({ $root, $editor }), [$editor, $root]);

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
                                placeholder...
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

                    <AutoFocusPlugin />
                    <HistoryPlugin />
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
