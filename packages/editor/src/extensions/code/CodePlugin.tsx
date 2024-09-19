import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

const CodePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => registerCodeHighlighting(editor), [editor]);

  return null;
};

CodePlugin.displayName = 'extensionCode.Plugin';

export default CodePlugin;
