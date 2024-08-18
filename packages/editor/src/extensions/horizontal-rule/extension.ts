import {
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from '@lexical/react/LexicalHorizontalRuleNode';
import { SquareSplitVertical } from 'lucide-react';

import type { RegisterExtension } from '@/extensions/extensionManager';

import * as styles from './horizontalRule.css';
import HorizontalRulePlugin from './HorizontalRulePlugin';

export const registerExtensionHorizontalRule: RegisterExtension = context => {
  context.subscriptions
    .add(context.registerNode(HorizontalRuleNode))
    .add(context.registerPlugin(HorizontalRulePlugin))
    .add(
      context.registerTheme({
        hr: styles.hr,
      })
    )
    .add(
      context.registerSlashCommand(({ editor, registerCommands }) => {
        registerCommands(
          [
            {
              title: 'Divider',
              icon: SquareSplitVertical,
              keywords: ['horizontal rule', 'divider', 'hr'],
              onSelect: () => {
                editor.dispatchCommand(
                  INSERT_HORIZONTAL_RULE_COMMAND,
                  undefined
                );
              },
            },
          ],
          1
        );
      })
    );
};
