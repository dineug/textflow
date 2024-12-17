import { autoUpdate, offset, useFloating } from '@floating-ui/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import {
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getNodeTriplet,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  $unmergeCell,
  getTableElement,
  getTableObserverFromTableElement,
  TableCellHeaderStates,
  TableCellNode,
  TableRowNode,
  TableSelection,
} from '@lexical/table';
import type { ElementNode } from 'lexical';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAppContext } from '@/components/app-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { invariant } from '@/utils/invariant';

import * as styles from './TableActionMenuPlugin.css';

function computeSelectionCount(selection: TableSelection): {
  columns: number;
  rows: number;
} {
  const selectionShape = selection.getShape();
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1,
  };
}

// This is important when merging cells as there is no good way to re-merge weird shapes (a result
// of selecting merged cells and non-merged)
function isTableSelectionRectangular(selection: TableSelection): boolean {
  const nodes = selection.getNodes();
  const currentRows: Array<number> = [];
  let currentRow = null;
  let expectedColumns = null;
  let currentColumns = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if ($isTableCellNode(node)) {
      const row = node.getParentOrThrow();
      invariant(
        $isTableRowNode(row),
        'Expected CellNode to have a RowNode parent'
      );
      if (currentRow !== row) {
        if (expectedColumns !== null && currentColumns !== expectedColumns) {
          return false;
        }
        if (currentRow !== null) {
          expectedColumns = currentColumns;
        }
        currentRow = row;
        currentColumns = 0;
      }
      const colSpan = node.__colSpan;
      for (let j = 0; j < colSpan; j++) {
        if (currentRows[currentColumns + j] === undefined) {
          currentRows[currentColumns + j] = 0;
        }
        currentRows[currentColumns + j] += node.__rowSpan;
      }
      currentColumns += colSpan;
    }
  }
  return (
    (expectedColumns === null || currentColumns === expectedColumns) &&
    currentRows.every(v => v === currentRows[0])
  );
}

function $canUnmerge(): boolean {
  const selection = $getSelection();
  if (
    ($isRangeSelection(selection) && !selection.isCollapsed()) ||
    ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
    (!$isRangeSelection(selection) && !$isTableSelection(selection))
  ) {
    return false;
  }
  const [cell] = $getNodeTriplet(selection.anchor);
  return cell.__colSpan > 1 || cell.__rowSpan > 1;
}

function $cellContainsEmptyParagraph(cell: TableCellNode): boolean {
  if (cell.getChildrenSize() !== 1) {
    return false;
  }
  const firstChild = cell.getFirstChildOrThrow();
  if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
    return false;
  }
  return true;
}

function $selectLastDescendant(node: ElementNode): void {
  const lastDescendant = node.getLastDescendant();
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select();
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd();
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext();
  }
}

type TableCellActionMenuProps = {
  tableCellNode: TableCellNode;
  hasCellMerge?: boolean;
};

const TableActionMenu: React.FC<TableCellActionMenuProps> = ({
  tableCellNode: _tableCellNode,
  hasCellMerge,
}) => {
  const [editor] = useLexicalComposerContext();
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  });
  const [canMergeCells, setCanMergeCells] = useState(false);
  const [canUnmergeCell, setCanUnmergeCell] = useState(false);

  useEffect(() => {
    return editor.registerMutationListener(
      TableCellNode,
      nodeMutations => {
        const nodeUpdated =
          nodeMutations.get(tableCellNode.getKey()) === 'updated';

        if (nodeUpdated) {
          editor.getEditorState().read(() => {
            updateTableCellNode(tableCellNode.getLatest());
          });
        }
      },
      { skipInitialization: true }
    );
  }, [editor, tableCellNode]);

  useEffect(() => {
    const $updateCanMergeCells = () => {
      const selection = $getSelection();
      // Merge cells
      if ($isTableSelection(selection)) {
        const currentSelectionCounts = computeSelectionCount(selection);
        updateSelectionCounts(computeSelectionCount(selection));
        setCanMergeCells(
          isTableSelectionRectangular(selection) &&
            (currentSelectionCounts.columns > 1 ||
              currentSelectionCounts.rows > 1)
        );
      }
      // Unmerge cell
      setCanUnmergeCell($canUnmerge());
    };

    editor.getEditorState().read(
      () => {
        $updateCanMergeCells();
      },
      { editor }
    );
  }, [editor]);

  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        const tableElement = getTableElement(
          tableNode,
          editor.getElementByKey(tableNode.getKey())
        );

        if (!tableElement) {
          throw new Error('Expected to find tableElement in DOM');
        }

        const tableSelection = getTableObserverFromTableElement(tableElement);
        if (tableSelection !== null) {
          tableSelection.$clearHighlight();
        }

        tableNode.markDirty();
        updateTableCellNode(tableCellNode.getLatest());
      }

      const rootNode = $getRoot();
      rootNode.selectStart();
    });
  }, [editor, tableCellNode]);

  const mergeTableCellsAtSelection = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isTableSelection(selection)) {
        const { columns, rows } = computeSelectionCount(selection);
        const nodes = selection.getNodes();
        let firstCell: null | TableCellNode = null;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if ($isTableCellNode(node)) {
            if (firstCell === null) {
              node.setColSpan(columns).setRowSpan(rows);
              firstCell = node;
              const isEmpty = $cellContainsEmptyParagraph(node);
              let firstChild;
              if (
                isEmpty &&
                $isParagraphNode((firstChild = node.getFirstChild()))
              ) {
                firstChild.remove();
              }
            } else if ($isTableCellNode(firstCell)) {
              const isEmpty = $cellContainsEmptyParagraph(node);
              if (!isEmpty) {
                firstCell.append(...node.getChildren());
              }
              node.remove();
            }
          }
        }
        if (firstCell !== null) {
          if (firstCell.getChildrenSize() === 0) {
            firstCell.append($createParagraphNode());
          }
          $selectLastDescendant(firstCell);
        }
      }
    });
  };

  const unmergeTableCellsAtSelection = () => {
    editor.update(() => {
      $unmergeCell();
    });
  };

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        $insertTableRow__EXPERIMENTAL(shouldInsertAfter);
      });
    },
    [editor]
  );

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.columns; i++) {
          $insertTableColumn__EXPERIMENTAL(shouldInsertAfter);
        }
      });
    },
    [editor, selectionCounts.columns]
  );

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableRow__EXPERIMENTAL();
    });
  }, [editor]);

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      tableNode.remove();

      clearTableSelection();
    });
  }, [editor, tableCellNode, clearTableSelection]);

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableColumn__EXPERIMENTAL();
    });
  }, [editor]);

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren();

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.');
      }

      const tableRow = tableRows[tableRowIndex];

      if (!$isTableRowNode(tableRow)) {
        throw new Error('Expected table row');
      }

      tableRow.getChildren().forEach(tableCell => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell');
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.ROW);
      });

      clearTableSelection();
    });
  }, [editor, tableCellNode, clearTableSelection]);

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableColumnIndex =
        $getTableColumnIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren<TableRowNode>();
      const maxRowsLength = Math.max(
        ...tableRows.map(row => row.getChildren().length)
      );

      if (tableColumnIndex >= maxRowsLength || tableColumnIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.');
      }

      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r];

        if (!$isTableRowNode(tableRow)) {
          throw new Error('Expected table row');
        }

        const tableCells = tableRow.getChildren();
        if (tableColumnIndex >= tableCells.length) {
          // if cell is outside of bounds for the current row (for example various merge cell cases) we shouldn't highlight it
          continue;
        }

        const tableCell = tableCells[tableColumnIndex];

        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell');
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
      }

      clearTableSelection();
    });
  }, [editor, tableCellNode, clearTableSelection]);

  return (
    <DropdownMenuContent className="w-56" side="right" align="center">
      {!hasCellMerge ? null : canMergeCells ? (
        <>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={mergeTableCellsAtSelection}>
              Merge cells
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      ) : canUnmergeCell ? (
        <>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={unmergeTableCellsAtSelection}>
              Unmerge cells
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      ) : null}
      <DropdownMenuGroup>
        <DropdownMenuItem
          onSelect={() => {
            insertTableRowAtSelection(false);
          }}
        >
          Insert{' '}
          {selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`}{' '}
          above
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            insertTableRowAtSelection(true);
          }}
        >
          Insert{' '}
          {selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`}{' '}
          below
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          onSelect={() => {
            insertTableColumnAtSelection(false);
          }}
        >
          Insert{' '}
          {selectionCounts.columns === 1
            ? 'column'
            : `${selectionCounts.columns} columns`}{' '}
          left
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            insertTableColumnAtSelection(true);
          }}
        >
          Insert{' '}
          {selectionCounts.columns === 1
            ? 'column'
            : `${selectionCounts.columns} columns`}{' '}
          right
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={deleteTableColumnAtSelection}>
          Delete column
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={deleteTableRowAtSelection}>
          Delete row
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={deleteTableAtSelection}>
          Delete table
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={toggleTableRowIsHeader}>
          {(tableCellNode.__headerState & TableCellHeaderStates.ROW) ===
          TableCellHeaderStates.ROW
            ? 'Remove'
            : 'Add'}{' '}
          row header
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={toggleTableColumnIsHeader}>
          {(tableCellNode.__headerState & TableCellHeaderStates.COLUMN) ===
          TableCellHeaderStates.COLUMN
            ? 'Remove'
            : 'Add'}{' '}
          column header
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
};

TableActionMenu.displayName = 'TableActionMenu';

type TableCellActionMenuContainerProps = {
  hasCellMerge?: boolean;
};

const TableCellActionMenuContainer: React.FC<
  TableCellActionMenuContainerProps
> = ({ hasCellMerge }) => {
  const [editor] = useLexicalComposerContext();
  const { refs, floatingStyles } = useFloating({
    placement: 'right-start',
    middleware: [offset({ mainAxis: -24, crossAxis: 9.25 })],
    whileElementsMounted: autoUpdate,
  });
  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(
    null
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const $moveMenu = () => {
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const activeElement = document.activeElement;

      if (selection == null) {
        setTableMenuCellNode(null);
        return;
      }

      const rootElement = editor.getRootElement();

      if (
        $isRangeSelection(selection) &&
        rootElement !== null &&
        nativeSelection !== null &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
          selection.anchor.getNode()
        );

        if (tableCellNodeFromSelection == null) {
          setTableMenuCellNode(null);
          return;
        }

        const tableCellParentNodeDOM = editor.getElementByKey(
          tableCellNodeFromSelection.getKey()
        );

        if (tableCellParentNodeDOM == null) {
          setTableMenuCellNode(null);
          return;
        }

        setTableMenuCellNode(tableCellNodeFromSelection);
      } else if (!activeElement) {
        setTableMenuCellNode(null);
      }
    };

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $moveMenu();
      });
    });
  }, [editor]);

  useEffect(() => {
    const reset = () => {
      refs.setReference(null);
    };

    if (!tableCellNode) {
      return reset();
    }

    const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey());
    if (!tableCellNodeDOM) {
      return reset();
    }

    refs.setReference(tableCellNodeDOM);
  }, [editor, refs, tableCellNode]);

  useEffect(() => {
    const handleMousedown = (event: MouseEvent) => {
      const target = event.target;

      if (
        target &&
        target instanceof HTMLElement &&
        !target.closest(`.${styles.actionButtonContainer}`) &&
        refs.floating.current
      ) {
        refs.floating.current.style.visibility = 'hidden';
      }
    };

    const handleMouseup = () => {
      if (refs.floating.current) {
        refs.floating.current.style.visibility = 'visible';
      }
    };

    document.addEventListener('mousedown', handleMousedown);
    window.addEventListener('mouseup', handleMouseup);

    return () => {
      document.removeEventListener('mousedown', handleMousedown);
      window.removeEventListener('mouseup', handleMouseup);
    };
  }, [refs.floating]);

  return (
    <div
      ref={refs.setFloating}
      className={styles.actionButtonContainer}
      style={{
        ...floatingStyles,
        display: refs.reference.current && tableCellNode ? 'flex' : 'none',
      }}
    >
      {tableCellNode && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(styles.actionButton, 'h-5 w-5')}
              variant="ghost"
              size="icon"
            >
              <ChevronDown className="h-2 w-2" />
            </Button>
          </DropdownMenuTrigger>
          {open && (
            <TableActionMenu
              hasCellMerge={hasCellMerge}
              tableCellNode={tableCellNode}
            />
          )}
        </DropdownMenu>
      )}
    </div>
  );
};

TableCellActionMenuContainer.displayName = 'TableCellActionMenuContainer';

type TableActionMenuPluginProps = {
  hasCellMerge?: boolean;
};

const TableActionMenuPlugin: React.FC<TableActionMenuPluginProps> = ({
  hasCellMerge,
}) => {
  const { $root } = useAppContext();
  const isEditable = useLexicalEditable();

  if (!$root || !isEditable) {
    return null;
  }

  return createPortal(
    <TableCellActionMenuContainer hasCellMerge={hasCellMerge} />,
    $root
  );
};

TableActionMenuPlugin.displayName = 'TableActionMenuPlugin';

export default TableActionMenuPlugin;
