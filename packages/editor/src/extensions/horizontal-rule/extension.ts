import {
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from '@lexical/react/LexicalHorizontalRuleNode';
import { SquareSplitVertical } from 'lucide-react';

import type { RegisterExtension } from '@/extensions/extensionManager';

import * as styles from './horizontalRule.css';
import HorizontalRulePlugin from './HorizontalRulePlugin';

export const registerExtensionHorizontalRule: RegisterExtension = ({
  subscriptions,
  registerNode,
  registerPlugin,
  registerTheme,
  registerSlashCommand,
}) => {
  subscriptions
    .add(registerNode(HorizontalRuleNode))
    .add(registerPlugin(HorizontalRulePlugin))
    .add(
      registerTheme({
        hr: styles.hr,
      })
    )
    .add(
      registerSlashCommand(({ editor, registerCommands }) => {
        registerCommands(
          [
            {
              title: 'Divider',
              Icon: SquareSplitVertical,
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
