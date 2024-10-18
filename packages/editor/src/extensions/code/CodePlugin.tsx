import { $isCodeNode, registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_LOW,
  SELECT_ALL_COMMAND,
} from 'lexical';
import { first, last } from 'lodash-es';
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

  useEffect(() => {
    return mergeRegister(
      registerCodeHighlighting(editor, PrismTokenizer),
      editor.registerCommand(
        SELECT_ALL_COMMAND,
        event => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element =
              anchorNode.getKey() === 'root'
                ? anchorNode
                : $findMatchingParent(anchorNode, e => {
                    const parent = e.getParent();
                    return parent !== null && $isRootOrShadowRoot(parent);
                  });

            if (element === null) {
              element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null && $isCodeNode(element)) {
              const childrenKeys = element.getChildrenKeys();
              const firstKey = first(childrenKeys);
              const lastKey = last(childrenKeys);

              if (
                firstKey === selection.anchor.key &&
                selection.focus.key === lastKey
              ) {
                return false;
              }

              event.stopPropagation();
              element.select(0, element.getChildrenSize());
              return true;
            }
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return <CodeActionMenuPlugin />;
};

CodePlugin.displayName = 'extensionCode.Plugin';

export default CodePlugin;
