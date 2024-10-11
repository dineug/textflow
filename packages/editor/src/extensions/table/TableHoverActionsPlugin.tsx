import { autoUpdate, offset, useFloating } from '@floating-ui/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import {
  $getTableColumnIndexFromTableCellNode,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { $getNearestNodeFromDOMNode, NodeKey } from 'lexical';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { useDebounce } from '@/utils/useDebounce';

import * as resizerStyles from './TableCellResizer.css';
import * as styles from './TableHoverActionsPlugin.css';
import * as themeStyles from './theme.css';

const TableHoverActionsContainer: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isShownRow, setShownRow] = useState<boolean>(false);
  const [isShownColumn, setShownColumn] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] =
    useState<boolean>(false);
  const [position, setPosition] = useState({});
  const [codeSet] = useState<Set<NodeKey>>(() => new Set());
  const tableDOMNodeRef = useRef<HTMLElement | null>(null);

  const { refs: rowRefs, floatingStyles: rowFloatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(5)],
    whileElementsMounted: autoUpdate,
  });

  const { refs: columnRefs, floatingStyles: columnFloatingStyles } =
    useFloating({
      placement: 'right-start',
      middleware: [offset(5)],
      whileElementsMounted: autoUpdate,
    });

  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { isOutside, tableDOMNode } = getMouseInfo(event);

      if (isOutside) {
        setShownRow(false);
        setShownColumn(false);
        return;
      }

      if (!tableDOMNode) {
        return;
      }

      tableDOMNodeRef.current = tableDOMNode;

      let hoveredRowNode: TableCellNode | null = null;
      let hoveredColumnNode: TableCellNode | null = null;
      let tableDOMElement: HTMLElement | null = null;

      editor.update(() => {
        const maybeTableCell = $getNearestNodeFromDOMNode(tableDOMNode);

        if ($isTableCellNode(maybeTableCell)) {
          const table = $findMatchingParent(maybeTableCell, node =>
            $isTableNode(node)
          );
          if (!$isTableNode(table)) {
            return;
          }

          tableDOMElement = editor.getElementByKey(table?.getKey());

          if (tableDOMElement) {
            const rowCount = table.getChildrenSize();
            const colCount = (
              (table as TableNode).getChildAtIndex(0) as TableRowNode
            )?.getChildrenSize();

            const rowIndex = $getTableRowIndexFromTableCellNode(maybeTableCell);
            const colIndex =
              $getTableColumnIndexFromTableCellNode(maybeTableCell);

            if (rowIndex === rowCount - 1) {
              hoveredRowNode = maybeTableCell;
            } else if (colIndex === colCount - 1) {
              hoveredColumnNode = maybeTableCell;
            }
          }
        }
      });

      if (tableDOMElement) {
        const { width: tableElemWidth, height: tableElemHeight } = (
          tableDOMElement as HTMLTableElement
        ).getBoundingClientRect();

        rowRefs.setReference(tableDOMElement);
        columnRefs.setReference(tableDOMElement);

        if (hoveredRowNode) {
          setShownColumn(false);
          setShownRow(true);
          setPosition({
            width: tableElemWidth,
          });
        } else if (hoveredColumnNode) {
          setShownColumn(true);
          setShownRow(false);
          setPosition({
            height: tableElemHeight,
          });
        }
      }
    },
    50,
    250
  );

  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }

    document.addEventListener('mousemove', debouncedOnMouseMove);

    return () => {
      setShownRow(false);
      setShownColumn(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener('mousemove', debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return mergeRegister(
      editor.registerMutationListener(
        TableNode,
        mutations => {
          editor.getEditorState().read(() => {
            for (const [key, type] of mutations) {
              switch (type) {
                case 'created':
                  codeSet.add(key);
                  setShouldListenMouseMove(codeSet.size > 0);
                  break;

                case 'destroyed':
                  codeSet.delete(key);
                  setShouldListenMouseMove(codeSet.size > 0);
                  break;

                default:
                  break;
              }
            }
          });
        },
        { skipInitialization: false }
      )
    );
  }, [codeSet, editor]);

  const insertAction = (insertRow: boolean) => {
    editor.update(() => {
      if (tableDOMNodeRef.current) {
        const maybeTableNode = $getNearestNodeFromDOMNode(
          tableDOMNodeRef.current
        );
        maybeTableNode?.selectEnd();
        if (insertRow) {
          $insertTableRow__EXPERIMENTAL();
          setShownRow(false);
        } else {
          $insertTableColumn__EXPERIMENTAL();
          setShownColumn(false);
        }
      }
    });
  };

  return (
    <>
      {isShownRow && (
        <button
          ref={rowRefs.setFloating}
          className={styles.tableAddRows}
          style={{
            ...rowFloatingStyles,
            ...position,
            display: rowRefs.reference.current ? 'flex' : 'none',
          }}
          onClick={() => insertAction(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
      {isShownColumn && (
        <button
          ref={columnRefs.setFloating}
          className={styles.tableAddColumns}
          style={{
            ...columnFloatingStyles,
            ...position,
            display: columnRefs.reference.current ? 'flex' : 'none',
          }}
          onClick={() => insertAction(false)}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </>
  );
};

TableHoverActionsContainer.displayName = 'TableHoverActionsContainer';

const TableHoverActionsPlugin: React.FC = () => {
  const { $root } = useAppContext();
  const isEditable = useLexicalEditable();

  if (!$root || !isEditable) {
    return null;
  }

  return createPortal(<TableHoverActionsContainer />, $root);
};

TableHoverActionsPlugin.displayName = 'TableHoverActionsPlugin';

function getMouseInfo(event: MouseEvent): {
  tableDOMNode: HTMLElement | null;
  isOutside: boolean;
} {
  const target = event.target;

  if (
    target &&
    (target instanceof HTMLElement || target instanceof SVGElement)
  ) {
    const tableDOMNode = target.closest<HTMLElement>(
      `.${themeStyles.tableCell}`
    );

    const isOutside = !(
      tableDOMNode ||
      target.closest<HTMLElement>(`.${styles.tableAddRows}`) ||
      target.closest<HTMLElement>(`.${styles.tableAddColumns}`) ||
      target.closest<HTMLElement>(`.${resizerStyles.resizer}`)
    );

    return { isOutside, tableDOMNode };
  } else {
    return { isOutside: true, tableDOMNode: null };
  }
}

export default TableHoverActionsPlugin;
