import { $createCodeNode, CodeHighlightNode, CodeNode } from '@lexical/code';
import { $setBlocksType } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Code } from 'lucide-react';

import type { RegisterExtension } from '@/extensions/extensionManager';

import CodePlugin from './CodePlugin';
import * as styles from './theme.css';

export const registerExtensionCode: RegisterExtension = ({
  subscriptions,
  registerNode,
  registerPlugin,
  registerTheme,
  registerSlashCommand,
}) => {
  subscriptions
    .add(registerNode(CodeNode, CodeHighlightNode))
    .add(registerPlugin(CodePlugin))
    .add(
      registerTheme({
        code: styles.code,
        codeHighlight: {
          atrule: styles.tokenAttr,
          attr: styles.tokenAttr,
          boolean: styles.tokenProperty,
          builtin: styles.tokenSelector,
          cdata: styles.tokenComment,
          char: styles.tokenSelector,
          class: styles.tokenFunction,
          'class-name': styles.tokenFunction,
          comment: styles.tokenComment,
          constant: styles.tokenProperty,
          deleted: styles.tokenProperty,
          doctype: styles.tokenComment,
          entity: styles.tokenOperator,
          function: styles.tokenFunction,
          important: styles.tokenVariable,
          inserted: styles.tokenSelector,
          keyword: styles.tokenAttr,
          namespace: styles.tokenVariable,
          number: styles.tokenProperty,
          operator: styles.tokenOperator,
          prolog: styles.tokenComment,
          property: styles.tokenProperty,
          punctuation: styles.tokenPunctuation,
          regex: styles.tokenVariable,
          selector: styles.tokenSelector,
          string: styles.tokenSelector,
          symbol: styles.tokenProperty,
          tag: styles.tokenProperty,
          url: styles.tokenOperator,
          variable: styles.tokenVariable,
        },
      })
    )
    .add(
      registerSlashCommand(({ editor, registerCommands }) => {
        registerCommands(
          [
            {
              title: 'Code',
              Icon: Code,
              keywords: ['javascript', 'python', 'js', 'codeblock'],
              onSelect: () => {
                editor.update(() => {
                  const selection = $getSelection();

                  if ($isRangeSelection(selection)) {
                    if (selection.isCollapsed()) {
                      $setBlocksType(selection, () => $createCodeNode());
                    } else {
                      const textContent = selection.getTextContent();
                      const codeNode = $createCodeNode();
                      selection.insertNodes([codeNode]);
                      selection.insertRawText(textContent);
                    }
                  }
                });
              },
            },
          ],
          1
        );
      })
    );
};
