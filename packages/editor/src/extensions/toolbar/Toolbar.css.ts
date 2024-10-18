import { style } from '@vanilla-extract/css';

export const toolbarLayout = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 57,
  minHeight: 57,
  maxHeight: 57,
});

export const toolbar = style({
  width: '100%',
  maxWidth: 'calc(1100px - 16px)',
  height: 40,
  minHeight: 40,
  padding: 8,
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  boxSizing: 'content-box',
  overflowX: 'auto',
});
