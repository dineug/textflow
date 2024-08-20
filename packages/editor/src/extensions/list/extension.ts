import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import { List, ListChecks, ListOrdered } from 'lucide-react';

import type { RegisterExtension } from '@/extensions/extensionManager';

import ListPlugin from './ListPlugin';
import * as styles from './theme.css';

export const registerExtensionList: RegisterExtension = ({
  subscriptions,
  registerNode,
  registerPlugin,
  registerTheme,
  registerSlashCommand,
}) => {
  subscriptions
    .add(registerNode(ListNode, ListItemNode))
    .add(registerPlugin(ListPlugin))
    .add(
      registerTheme({
        list: {
          checklist: styles.checklist,
          listitem: styles.listitem,
          listitemChecked: styles.listitemChecked,
          listitemUnchecked: styles.listitemUnchecked,
          nested: {
            listitem: styles.nestedListItem,
          },
          olDepth: [
            styles.olDepth1,
            styles.olDepth2,
            styles.olDepth3,
            styles.olDepth4,
            styles.olDepth5,
          ],
          ul: styles.ul,
        },
      })
    )
    .add(
      registerSlashCommand(({ editor, registerCommands }) => {
        registerCommands(
          [
            {
              title: 'Numbered List',
              icon: ListOrdered,
              keywords: ['numbered list', 'ordered list', 'ol'],
              onSelect: () => {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
              },
            },
            {
              title: 'Bulleted List',
              icon: List,
              keywords: ['bulleted list', 'unordered list', 'ul'],
              onSelect: () => {
                editor.dispatchCommand(
                  INSERT_UNORDERED_LIST_COMMAND,
                  undefined
                );
              },
            },
            {
              title: 'Check List',
              icon: ListChecks,
              keywords: ['check list', 'todo list'],
              onSelect: () => {
                editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
              },
            },
          ],
          0
        );
      })
    );
};
