import { SquareChevronRight } from 'lucide-react';

import { createExtension } from '@/extensions/extensionManager';

import { CollapsibleContainerNode } from './CollapsibleContainerNode';
import { CollapsibleContentNode } from './CollapsibleContentNode';
import CollapsiblePlugin, {
  INSERT_COLLAPSIBLE_COMMAND,
} from './CollapsiblePlugin';
import { CollapsibleTitleNode } from './CollapsibleTitleNode';
import * as styles from './theme.css';

export const extensionCollapsible = createExtension(
  ({ subscriptions, registerNode, registerTheme, registerSlashCommand }) => {
    subscriptions
      .add(
        registerNode(
          CollapsibleContainerNode,
          CollapsibleContentNode,
          CollapsibleTitleNode
        )
      )
      .add(
        registerTheme({
          collapsibleContainer: styles.collapsibleContainer,
          collapsibleTitle: styles.collapsibleTitle,
          collapsibleContent: styles.collapsibleContent,
        })
      )
      .add(
        registerSlashCommand(({ editor, registerCommands }) => {
          registerCommands(
            [
              {
                title: 'Collapsible',
                Icon: SquareChevronRight,
                keywords: ['collapse', 'collapsible', 'toggle'],
                onSelect: () => {
                  editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
                },
              },
            ],
            1
          );
        })
      );
  },
  CollapsiblePlugin
);
