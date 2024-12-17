import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import { Table } from 'lucide-react';

import { createExtension } from '@/extensions/extensionManager';

import TablePlugin from './TablePlugin';
import * as styles from './theme.css';

export const extensionTable = createExtension(
  ({ subscriptions, registerNode, registerTheme, registerSlashCommand }) => {
    subscriptions
      .add(registerNode(TableNode, TableCellNode, TableRowNode))
      .add(
        registerTheme({
          table: styles.table,
          tableCell: styles.tableCell,
          tableCellActionButton: styles.tableCellActionButton,
          tableCellActionButtonContainer: styles.tableCellActionButtonContainer,
          tableCellEditing: styles.tableCellEditing,
          tableCellHeader: styles.tableCellHeader,
          tableCellPrimarySelected: styles.tableCellPrimarySelected,
          tableCellResizer: styles.tableCellResizer,
          tableCellSelected: styles.tableCellSelected,
          tableCellSortedIndicator: styles.tableCellSortedIndicator,
          tableResizeRuler: styles.tableResizeRuler,
          tableRowStriping: styles.tableRowStriping,
          tableSelected: styles.tableSelected,
          tableSelection: styles.tableSelection,
          tableScrollableWrapper: styles.tableScrollableWrapper,
        })
      )
      .add(
        registerSlashCommand(({ editor, queryString, registerCommands }) => {
          registerCommands(
            [
              {
                title: 'Table',
                Icon: Table,
                keywords: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
                onSelect: () => {
                  editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                    columns: '5',
                    rows: '5',
                  });
                },
              },
            ],
            1
          );

          const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);
          if (tableMatch) {
            const rows = tableMatch[1];
            const colOptions = tableMatch[2]
              ? [tableMatch[2]]
              : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

            registerCommands(
              [
                ...colOptions.map(columns => ({
                  title: `${rows}x${columns} Table`,
                  Icon: Table,
                  keywords: ['table'],
                  onSelect: () => {
                    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                      columns,
                      rows,
                    });
                  },
                })),
              ],
              -1
            );
          }
        })
      );
  },
  TablePlugin
);
