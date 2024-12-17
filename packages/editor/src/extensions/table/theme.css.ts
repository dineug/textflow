import { globalStyle, style } from '@vanilla-extract/css';

export const table = style({
  borderCollapse: 'collapse',
  borderSpacing: 0,
  overflowY: 'scroll',
  overflowX: 'scroll',
  tableLayout: 'fixed',
  width: 'max-content',
  margin: '0px 25px 30px 0px',
});

export const tableCell = style({
  border: '1px solid hsl(var(--gray-color-8))',
  width: 75,
  minWidth: 75,
  verticalAlign: 'top',
  textAlign: 'start',
  padding: '6px 8px',
  position: 'relative',
  outline: 'none',
  boxSizing: 'content-box',
});

export const tableCellActionButton = style({});

export const tableCellActionButtonContainer = style({});

export const tableCellEditing = style({});

export const tableCellHeader = style({
  backgroundColor: 'hsl(var(--gray-color-3))',
  textAlign: 'start',
});

export const tableCellPrimarySelected = style({});

export const tableCellResizer = style({});

export const tableCellSelected = style({
  backgroundColor: 'var(--selection)',
});

export const tableCellSortedIndicator = style({});

export const tableResizeRuler = style({});

export const tableRowStriping = style({});
globalStyle(`${tableRowStriping} tr:nth-child(even)`, {});

export const tableSelected = style({});

export const tableSelection = style({});
globalStyle(`${tableSelection} *::selection`, {
  backgroundColor: 'transparent',
});

export const tableScrollableWrapper = style({
  overflowX: 'auto',
  scrollbarColor: 'hsl(var(--border)) transparent',
  scrollbarWidth: 'auto',

  '::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-corner': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: 'hsl(var(--border))',
  },
});
