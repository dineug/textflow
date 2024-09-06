import { style } from '@vanilla-extract/css';

export const link = style({
  color: 'hsl(var(--primary))',
  textDecoration: 'underline',
  textDecorationColor: 'hsl(var(--primary))',
  textUnderlineOffset: 4,
  ':hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});
