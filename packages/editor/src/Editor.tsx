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
import { useMemo, useState } from 'react';

import { AppContext } from '@/components/app-context';
import { ThemeProvider } from '@/components/theme-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { extensions } from '@/extensions';
import { ExtensionManagerContext } from '@/extensions/context';
import { configureExtensions } from '@/extensions/extensionManager';
import { cn } from '@/lib/utils';

import * as styles from './Editor.css';

type EditorProps = {
  minHeight?: string;
};

const Editor: React.FC<EditorProps> = ({ minHeight }) => {
  const extensionManager = useMemo(
    () => configureExtensions({ extensions }),
    []
  );
  const { getNodes, getTheme, Plugins } = extensionManager;
  const initialConfig: InitialConfigType = {
    namespace: 'wysidoc',
    nodes: [...getNodes()],
    theme: getTheme(),
    onError: (error: Error) => {
      throw error;
    },
  };

  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<HTMLDivElement | null>(null);
  const appContext = useMemo(() => ({ root, editor }), [editor, root]);

  return (
    <ExtensionManagerContext value={extensionManager}>
      <LexicalComposer initialConfig={initialConfig}>
        <AppContext value={appContext}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div ref={setRoot} className={cn('wysidoc-editor', styles.shell)}>
              <ScrollArea className={styles.container}>
                <div className={styles.layout}>
                  <div ref={setEditor} className={styles.editor}>
                    <RichTextPlugin
                      contentEditable={
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
                      }
                      ErrorBoundary={LexicalErrorBoundary}
                    />
                    <Plugins />
                    <AutoFocusPlugin />
                    <HistoryPlugin />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ThemeProvider>
        </AppContext>
      </LexicalComposer>
    </ExtensionManagerContext>
  );
};

export default Editor;
