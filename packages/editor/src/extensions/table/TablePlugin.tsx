import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin';

import TableActionMenuPlugin from './TableActionMenuPlugin';
import TableCellResizerPlugin from './TableCellResizer';
import TableHoverActionsPlugin from './TableHoverActionsPlugin';

const TablePlugin: React.FC = () => (
  <>
    <LexicalTablePlugin
      hasCellMerge
      hasCellBackgroundColor={false}
      hasTabHandler
      hasHorizontalScroll
    />
    <TableCellResizerPlugin />
    <TableHoverActionsPlugin />
    <TableActionMenuPlugin hasCellMerge />
  </>
);

TablePlugin.displayName = 'extensionTable.Plugin';

export default TablePlugin;
