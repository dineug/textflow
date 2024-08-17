import { CodeHighlightNode, CodeNode } from '@lexical/code';

import type { RegisterExtension } from '@/extensions/extensionManager';

import * as styles from './code.css';

export const registerExtensionCode: RegisterExtension = context => {
  context.subscriptions
    .add(context.registerNode(CodeNode, CodeHighlightNode))
    .add(
      context.registerTheme({
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
    );
};
