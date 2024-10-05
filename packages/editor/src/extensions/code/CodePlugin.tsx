import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

import CodeActionMenuPlugin from './CodeActionMenuPlugin';

const CodePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => registerCodeHighlighting(editor), [editor]);

  return <CodeActionMenuPlugin />;
};

CodePlugin.displayName = 'extensionCode.Plugin';

export default CodePlugin;
