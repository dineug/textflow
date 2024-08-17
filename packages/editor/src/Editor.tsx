import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Theme, ThemePanel } from '@radix-ui/themes';

import { extensions } from '@/extensions';
import { configureExtensions } from '@/extensions/extensionManager';

const Editor: React.FC = () => {
  const manager = configureExtensions({ extensions });
  const initialConfig: InitialConfigType = {
    namespace: 'wysidoc',
    theme: manager.getTheme(),
    nodes: [...manager.getNodes()],
    onError: (error: Error) => {
      throw error;
    },
  };

  return (
    <Theme>
      <LexicalComposer initialConfig={initialConfig}>
        <div
          style={{
            position: 'relative',
            height: '100vh',
          }}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-placeholder={'placeholder...'}
                placeholder={<div>placeholder...</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <manager.Plugins />
        </div>
      </LexicalComposer>
      <ThemePanel />
    </Theme>
  );
};

export default Editor;
