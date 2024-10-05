import { style } from '@vanilla-extract/css';

export const container = style({
  width: 'fit-content',
  height: 32,
  position: 'absolute',
  display: 'inline-flex',
  alignItems: 'center',
  flexDirection: 'row',
  userSelect: 'none',
});

export const ignoreOutside = style({});
