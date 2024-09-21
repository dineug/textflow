import { style } from '@vanilla-extract/css';

export const link = style({
  color: 'hsl(var(--accent-color-11))',
  textDecoration: 'underline',
  textUnderlineOffset: 4,
  ':hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});
