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
  border: '1px solid hsl(var(--muted-foreground))',
  width: 75,
  minWidth: 75,
  verticalAlign: 'top',
  textAlign: 'start',
  padding: '6px 8px',
  position: 'relative',
  outline: 'none',
  boxSizing: 'content-box',
});

export const tableCellActionButton = style({
  backgroundColor: 'hsl(var(--muted-foreground))',
  display: 'block',
  border: 0,
  borderRadius: 20,
  width: 20,
  height: 20,
  color: '#222',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: 'hsl(var(--ring))',
  },
});

export const tableCellActionButtonContainer = style({
  display: 'block',
  right: 5,
  top: 6,
  position: 'absolute',
  zIndex: 4,
  width: 20,
  height: 20,
});

export const tableCellEditing = style({
  boxShadow: '0 0 5px rgba(0, 0, 0, 0.4)',
  borderRadius: 3,
});

export const tableCellHeader = style({
  backgroundColor: 'hsl(var(--muted))',
  textAlign: 'start',
});

export const tableCellPrimarySelected = style({
  border: '2px solid rgb(60, 132, 244)',
  display: 'block',
  height: 'calc(100% - 2px)',
  position: 'absolute',
  width: 'calc(100% - 2px)',
  left: -1,
  top: -1,
  zIndex: 2,
});

export const tableCellResizer = style({
  position: 'absolute',
  right: -4,
  height: '100%',
  width: 8,
  cursor: 'ew-resize',
  zIndex: 10,
  top: 0,
});

export const tableCellSelected = style({
  backgroundColor: '#c9dbf0',
});

export const tableCellSortedIndicator = style({
  display: 'block',
  opacity: 0.5,
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: 4,
  backgroundColor: '#999',
});

export const tableResizeRuler = style({});

export const tableRowStriping = style({});
globalStyle(`${tableRowStriping} tr:nth-child(even)`, {
  backgroundColor: '#f2f5fb',
});

export const tableSelected = style({
  outline: '2px solid rgb(60, 132, 244)',
});

export const tableSelection = style({});
globalStyle(`${tableSelection} *::selection`, {
  backgroundColor: 'transparent',
});
