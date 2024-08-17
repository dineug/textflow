import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

import type { RegisterExtension } from '@/extensions/extensionManager';

import * as styles from './horizontalRule.css';

export const registerExtensionHorizontalRule: RegisterExtension = context => {
  context.subscriptions.add(context.registerNode(HorizontalRuleNode)).add(
    context.registerTheme({
      hr: styles.hr,
    })
  );
};
