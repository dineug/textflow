import {
  createVar,
  fallbackVar,
  globalStyle,
  style,
} from '@vanilla-extract/css';

export const shell = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  lineHeight: 1.7,
});
globalStyle(`${shell} *::selection`, {
  backgroundColor: 'var(--selection)',
});

export const container = style({
  position: 'relative',
  display: 'block',
  height: '100%',
});

export const layout = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'center',
});

export const editor = style({
  position: 'relative',
  width: '100%',
  maxWidth: 1100,
});

export const minHeightVar = createVar();
export const paddingTopVar = createVar();

export const contentEditable = style({
  border: 0,
  fontSize: '15px',
  display: 'block',
  position: 'relative',
  outline: 0,
  paddingTop: fallbackVar(paddingTopVar, '40px'),
  paddingRight: '28px',
  paddingBottom: '40px',
  paddingLeft: '28px',
  minHeight: fallbackVar(minHeightVar, '150px'),
});

export const placeholder = style({
  fontSize: '15px',
  overflow: 'hidden',
  position: 'absolute',
  textOverflow: 'ellipsis',
  top: fallbackVar(paddingTopVar, '40px'),
  left: 28,
  right: 28,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  pointerEvents: 'none',
});
