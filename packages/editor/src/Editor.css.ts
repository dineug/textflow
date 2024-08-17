import { createVar, fallbackVar, style } from '@vanilla-extract/css';

export const shell = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
});

export const container = style({
  position: 'relative',
  display: 'block',
  height: '100%',
});

export const editor = style({
  position: 'relative',
});

export const minHeightVar = createVar();

export const contentEditable = style({
  border: 0,
  fontSize: '15px',
  display: 'block',
  position: 'relative',
  outline: 0,
  padding: '8px 28px 40px',
  minHeight: fallbackVar(minHeightVar, '150px'),
});

export const placeholder = style({
  fontSize: '15px',
  overflow: 'hidden',
  position: 'absolute',
  textOverflow: 'ellipsis',
  top: 8,
  left: 28,
  right: 28,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  pointerEvents: 'none',
});
