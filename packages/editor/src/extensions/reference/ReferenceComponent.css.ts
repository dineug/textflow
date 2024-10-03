import { style } from '@vanilla-extract/css';

export const focused = style({
  outline: '2px solid hsl(var(--ring))',
});

export const reference = style({
  cursor: 'pointer',
});
