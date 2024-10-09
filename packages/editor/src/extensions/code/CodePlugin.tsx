import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

import CodeActionMenuPlugin from './CodeActionMenuPlugin';
import { Prism } from './prism';

type TokenContent = string | Token | (string | Token)[];

interface Token {
  type: string;
  content: TokenContent;
}

const PrismTokenizer: Parameters<typeof registerCodeHighlighting>[1] = {
  defaultLanguage: 'plain',
  tokenize(code: string, language?: string): (string | Token)[] {
    return Prism.tokenize(
      code,
      Prism.languages[language || ''] || Prism.languages[this.defaultLanguage]
    );
  },
};

const CodePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => registerCodeHighlighting(editor, PrismTokenizer), [editor]);

  return <CodeActionMenuPlugin />;
};

CodePlugin.displayName = 'extensionCode.Plugin';

export default CodePlugin;
